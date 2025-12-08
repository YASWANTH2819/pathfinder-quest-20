import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation schema - lowered minimum for better testing
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
    // Parse and validate input
    const rawData = await req.json()
    
    console.log('[analyze-resume] Received request')
    console.log('[analyze-resume] Resume text length:', rawData.resumeText?.length || 0)
    console.log('[analyze-resume] First 100 chars:', rawData.resumeText?.substring(0, 100) || 'N/A')
    
    const validationResult = resumeAnalysisSchema.safeParse(rawData)
    
    if (!validationResult.success) {
      console.error('[analyze-resume] Validation error:', validationResult.error.errors)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input',
          details: validationResult.error.errors[0].message
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { resumeText, targetRole, language, userId, systemPrompt }: ResumeAnalysisRequest = validationResult.data

    console.log('[analyze-resume] Validation passed')
    console.log('[analyze-resume] Language:', language)
    console.log('[analyze-resume] Target role:', targetRole)

    // Get Lovable API key from environment
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Prepare the prompt - truncate resume if too long but keep essential content
    const truncatedResume = resumeText.slice(0, 20000)
    
    // Language-specific instructions
    const languageInstructions: Record<string, string> = {
      en: 'Provide all analysis and feedback in English.',
      hi: 'सभी विश्लेषण और प्रतिक्रिया हिंदी में प्रदान करें। Use Devanagari script.',
      te: 'అన్ని విశ్లేషణ మరియు అభిప్రాయాన్ని తెలుగులో అందించండి। Use Telugu script.'
    }
    
    const langInstruction = languageInstructions[language] || languageInstructions.en

    // Extract key identifiers from resume for personalization
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
  "atsScore": number (0-100, based on THIS resume's ATS compatibility),
  "overallRating": number (0-10, your overall assessment of the resume quality - 10 being excellent, 0 being very poor),
  "jobMatchScore": number (0-100, how well THIS resume matches the target role),
  "keywordCoverage": number (0-100, industry keywords found in THIS resume),
  "skillsMatchScore": number (0-100),
  "missingSkills": ["specific skills not found in THIS resume but needed for ${targetRole || 'the target role'}"],
  "quickFixes": ["specific improvements for THIS resume - reference actual content"],
  "careerHealth": "Excellent" | "Good" | "Moderate" | "Needs Upskill",
  "recommendations": ["specific recommendations referencing content from THIS resume"],
  "explanation": "A personalized summary that mentions specific items from the resume like skills: [list skills found], experience: [summarize experience found], education: [mention education if found]"
}`

    console.log('[analyze-resume] Calling Lovable AI Gateway...')
    console.log('[analyze-resume] Prompt length:', userMessage.length)

    // Call Lovable AI Gateway
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
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please wait a moment and try again.',
            analysis: null
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'AI credits exhausted. Please add funds to continue.',
            analysis: null
          }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.statusText}`)
    }

    const aiData = await aiResponse.json()
    const responseText = aiData.choices?.[0]?.message?.content || ''

    console.log('[analyze-resume] AI Response received')
    console.log('[analyze-resume] Response length:', responseText.length)
    console.log('[analyze-resume] Response preview:', responseText.substring(0, 200))

    // Parse the JSON response
    let analysis
    try {
      // Extract JSON from the response (handle markdown code blocks)
      let jsonText = responseText
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim()
      }
      
      // Also try to find JSON object directly
      const jsonObjectMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch && jsonObjectMatch) {
        jsonText = jsonObjectMatch[0]
      }
      
      analysis = JSON.parse(jsonText)
      
      console.log('[analyze-resume] Parsed analysis successfully')
      console.log('[analyze-resume] ATS Score:', analysis.atsScore)
      console.log('[analyze-resume] Career Health:', analysis.careerHealth)
      
      // Validate required fields and calculate overallRating if missing
      if (typeof analysis.atsScore !== 'number') {
        throw new Error('Missing required analysis fields')
      }
      
      // Ensure overallRating exists - derive from atsScore if not provided
      if (typeof analysis.overallRating !== 'number') {
        // Calculate overall rating as a 0-10 scale based on atsScore
        analysis.overallRating = Math.round(analysis.atsScore / 10)
      }
      
      // Ensure jobMatchScore exists
      if (typeof analysis.jobMatchScore !== 'number') {
        analysis.jobMatchScore = analysis.atsScore
      }
    } catch (parseError) {
      console.error('[analyze-resume] JSON parse error:', parseError)
      console.error('[analyze-resume] Raw response:', responseText.slice(0, 500))
      
      // Create a fallback response that still references the resume
      analysis = {
        atsScore: 60,
        overallRating: 6,
        jobMatchScore: 55,
        keywordCoverage: 50,
        skillsMatchScore: 55,
        missingSkills: ['Analysis parsing failed - please try again'],
        quickFixes: [
          'Ensure resume uses standard formatting',
          'Add quantifiable achievements',
          'Include industry-specific keywords'
        ],
        careerHealth: 'Moderate',
        recommendations: [
          'Re-submit resume for detailed analysis',
          'Ensure resume is in a parseable format'
        ],
        explanation: `Analysis encountered an issue. Resume preview: "${resumePreview.slice(0, 100)}...". Please try again.`
      }
    }

    // Store analysis in database if userId provided
    if (userId && analysis) {
      try {
        const { error: insertError } = await supabase
          .from('resumes')
          .insert({
            user_id: userId,
            filename: 'uploaded_resume',
            resume_text: resumeText.slice(0, 10000),
            ats_score: analysis.atsScore,
            overall_rating: analysis.overallRating,
            career_score: analysis.jobMatchScore || analysis.atsScore,
            career_health: analysis.careerHealth,
            skills_analysis: {
              ...analysis,
              jobMatchScore: analysis.jobMatchScore,
              keywordCoverage: analysis.keywordCoverage,
              overallRating: analysis.overallRating
            },
            parsed_data: { targetRole, language },
            suggestions: analysis.recommendations?.slice(0, 5) || []
          })

        if (insertError) {
          console.error('[analyze-resume] Error storing analysis:', insertError)
        } else {
          console.log('[analyze-resume] Analysis stored successfully')
        }
      } catch (dbError) {
        console.error('[analyze-resume] Database error:', dbError)
      }
    }

    console.log('[analyze-resume] Returning analysis with scores:', {
      atsScore: analysis.atsScore,
      jobMatchScore: analysis.jobMatchScore,
      careerHealth: analysis.careerHealth
    })

    return new Response(
      JSON.stringify({
        analysis,
        explanation: analysis.explanation,
        rawResponse: responseText
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('[analyze-resume] Error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        analysis: null,
        explanation: 'Failed to analyze resume. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})