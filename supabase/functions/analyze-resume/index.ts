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
    const rawData = await req.json()
    
    console.log('[analyze-resume] Received request')
    console.log('[analyze-resume] Resume text length:', rawData.resumeText?.length || 0)
    
    const validationResult = resumeAnalysisSchema.safeParse(rawData)
    
    if (!validationResult.success) {
      console.error('[analyze-resume] Validation error:', validationResult.error.errors)
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validationResult.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { resumeText, targetRole, language, userId }: ResumeAnalysisRequest = validationResult.data

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!lovableApiKey) throw new Error('LOVABLE_API_KEY not configured')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const truncatedResume = resumeText.slice(0, 20000)
    
    const languageInstructions: Record<string, string> = {
      en: 'Provide all analysis and feedback in English.',
      hi: 'सभी विश्लेषण और प्रतिक्रिया हिंदी में प्रदान करें। Use Devanagari script.',
      te: 'అన్ని విశ్లేషణ మరియు అభిప్రాయాన్ని తెలుగులో అందించండి। Use Telugu script.'
    }
    const langInstruction = languageInstructions[language] || languageInstructions.en
    const resumePreview = truncatedResume.substring(0, 500)

    const systemMessage = `You are an expert ATS (Applicant Tracking System) resume analyzer with deep knowledge of hiring practices across industries. 

CRITICAL INSTRUCTIONS:
1. You MUST analyze the SPECIFIC content provided in the resume below
2. You MUST reference specific skills, experiences, projects, and details that you find IN THE RESUME
3. DO NOT give generic advice - every piece of feedback must relate to something actually in this resume
4. If the resume mentions specific technologies (like React, Python, SQL, etc.), mention them in your analysis
5. If the resume has specific job titles or companies, reference them
6. Your scores must reflect THIS specific resume, not a generic assessment

${langInstruction}`

    const userMessage = `Analyze this SPECIFIC resume for the target role: "${targetRole || 'General career guidance'}"

=== CANDIDATE'S RESUME TEXT (MUST BE ANALYZED) ===
${truncatedResume}
=== END OF RESUME ===

Based on the EXACT content above, provide a PERSONALIZED analysis. You MUST:
1. Mention specific skills you found (e.g., "I see you have React and Python listed...")
2. Reference specific experiences or projects from the resume
3. Identify what's missing based on what IS in the resume
4. Give scores that reflect THIS resume's actual content

Return ONLY a valid JSON object:
{
  "resumeScore": number (0-100, overall resume quality score combining all factors),
  "atsScore": number (0-100, based on THIS resume's ATS compatibility),
  "overallRating": number (0-10, your overall assessment of the resume quality),
  "jobMatchScore": number (0-100, how well THIS resume matches the target role),
  "keywordCoverage": number (0-100, industry keywords found in THIS resume),
  "skillsMatchScore": number (0-100),
  "missingSkills": ["specific skills not found in THIS resume but needed for ${targetRole || 'the target role'}"],
  "quickFixes": ["specific improvements for THIS resume - reference actual content"],
  "careerHealth": "Excellent" | "Good" | "Moderate" | "Needs Upskill",
  "recommendations": ["specific recommendations referencing content from THIS resume"],
  "careerAlignmentFeedback": "A paragraph explaining how well this resume aligns with the target career path, what's strong, and what needs improvement to be competitive in that field",
  "explanation": "A personalized summary that mentions specific items from the resume like skills: [list skills found], experience: [summarize experience found], education: [mention education if found]"
}`

    console.log('[analyze-resume] Calling Lovable AI Gateway...')

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 3000,
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

    if (userId && analysis) {
      try {
        await supabase.from('resumes').insert({
          user_id: userId,
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
