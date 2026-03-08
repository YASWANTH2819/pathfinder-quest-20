import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resumeAnalysisSchema = z.object({
  resumeText: z.string().min(30, 'Resume text too short (minimum 30 characters)').max(50000, 'Resume text too large (max 50KB)'),
  targetRole: z.string().max(200).optional(),
  language: z.string().max(10),
  userId: z.string().uuid().optional(),
  systemPrompt: z.string().max(1000).optional()
})

interface ResumeAnalysisRequest {
  resumeText: string
  targetRole?: string
  language: string
  userId?: string
  systemPrompt?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: { user: authUser }, error: authError } = await authClient.auth.getUser()
    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const rawData = await req.json()
    
    console.log('[analyze-resume] Received request from user:', authUser.id)
    console.log('[analyze-resume] Resume text length:', rawData.resumeText?.length || 0)
    
    const validationResult = resumeAnalysisSchema.safeParse(rawData)
    
    if (!validationResult.success) {
      console.error('[analyze-resume] Validation error:', validationResult.error.errors)
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validationResult.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { resumeText, targetRole, language }: ResumeAnalysisRequest = validationResult.data
    // Use authenticated user ID, ignore any client-supplied userId
    const verifiedUserId = authUser.id

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!lovableApiKey) throw new Error('LOVABLE_API_KEY not configured')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const truncatedResume = resumeText.slice(0, 20000)
    
    const languageInstructions: Record<string, string> = {
      en: 'Provide all analysis and feedback in English.',
      hi: 'सभी विश्लेषण और प्रतिक्रिया हिंदी में प्रदान करें। Use Devanagari script.',
      te: 'అన్ని విశ్లేషణ మరియు అభిప్రాయాన్ని తెలుగులో అందించండి। Use Telugu script.'
    }
    const langInstruction = languageInstructions[language] || languageInstructions.en
    const resumePreview = truncatedResume.substring(0, 500)

    const systemMessage = `You are an ATS resume analyzer. Analyze the SPECIFIC resume content provided. Reference actual skills, experiences, projects found. Give scores reflecting THIS resume. ${langInstruction}`

    const userMessage = `Analyze for role: "${targetRole || 'General'}". Resume:
${truncatedResume}

Return ONLY valid JSON:
{"resumeScore":0-100,"atsScore":0-100,"overallRating":0-10,"jobMatchScore":0-100,"keywordCoverage":0-100,"skillsMatchScore":0-100,"missingSkills":["..."],"quickFixes":["..."],"careerHealth":"Excellent|Good|Moderate|Needs Upskill","recommendations":["..."],"careerAlignmentFeedback":"...","explanation":"..."}`

    console.log('[analyze-resume] Calling Lovable AI Gateway...')

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      })
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('[analyze-resume] AI Gateway error:', aiResponse.status, errorText)
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment and try again.', analysis: null }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds to continue.', analysis: null }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      throw new Error(`AI Gateway error: ${aiResponse.statusText}`)
    }

    const aiData = await aiResponse.json()
    const responseText = aiData.choices?.[0]?.message?.content || ''

    console.log('[analyze-resume] AI Response received, length:', responseText.length)

    let analysis
    try {
      let jsonText = responseText
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) jsonText = jsonMatch[1].trim()
      const jsonObjectMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch && jsonObjectMatch) jsonText = jsonObjectMatch[0]
      
      analysis = JSON.parse(jsonText)
      
      if (typeof analysis.atsScore !== 'number') throw new Error('Missing required analysis fields')
      if (typeof analysis.overallRating !== 'number') analysis.overallRating = Math.round(analysis.atsScore / 10)
      if (typeof analysis.jobMatchScore !== 'number') analysis.jobMatchScore = analysis.atsScore
      if (typeof analysis.resumeScore !== 'number') {
        analysis.resumeScore = Math.round(analysis.atsScore * 0.4 + (analysis.jobMatchScore || 0) * 0.3 + (analysis.keywordCoverage || analysis.skillsMatchScore || 0) * 0.3)
      }
    } catch (parseError) {
      console.error('[analyze-resume] JSON parse error:', parseError)
      analysis = {
        resumeScore: 60, atsScore: 60, overallRating: 6, jobMatchScore: 55, keywordCoverage: 50, skillsMatchScore: 55,
        missingSkills: ['Analysis parsing failed - please try again'],
        quickFixes: ['Ensure resume uses standard formatting', 'Add quantifiable achievements', 'Include industry-specific keywords'],
        careerHealth: 'Moderate',
        recommendations: ['Re-submit resume for detailed analysis', 'Ensure resume is in a parseable format'],
        careerAlignmentFeedback: 'Unable to assess career alignment. Please try again.',
        explanation: `Analysis encountered an issue. Resume preview: "${resumePreview.slice(0, 100)}...". Please try again.`
      }
    }

    if (verifiedUserId && analysis) {
      try {
        await supabase.from('resumes').insert({
          user_id: verifiedUserId,
          filename: 'uploaded_resume',
          resume_text: resumeText.slice(0, 10000),
          ats_score: analysis.atsScore,
          overall_rating: analysis.overallRating,
          career_score: analysis.jobMatchScore || analysis.atsScore,
          career_health: analysis.careerHealth,
          skills_analysis: { ...analysis },
          parsed_data: { targetRole, language },
          suggestions: analysis.recommendations?.slice(0, 5) || []
        })
      } catch (dbError) {
        console.error('[analyze-resume] Database error:', dbError)
      }
    }

    return new Response(
      JSON.stringify({ analysis, explanation: analysis.explanation, rawResponse: responseText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[analyze-resume] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred', analysis: null, explanation: 'Failed to analyze resume. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
