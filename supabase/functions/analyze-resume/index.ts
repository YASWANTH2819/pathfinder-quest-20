import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation schema
const resumeAnalysisSchema = z.object({
  resumeText: z.string().min(50, 'Resume text too short').max(50000, 'Resume text too large (max 50KB)'),
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
    const validationResult = resumeAnalysisSchema.safeParse(rawData)
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors)
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
    const truncatedResume = resumeText.slice(0, 25000)
    
    // Language-specific instructions
    const languageInstructions: Record<string, string> = {
      en: 'Provide all analysis and feedback in English.',
      hi: 'सभी विश्लेषण और प्रतिक्रिया हिंदी में प्रदान करें। Use Devanagari script.',
      te: 'అన్ని విశ్లేషణ మరియు అభిప్రాయాన్ని తెలుగులో అందించండి। Use Telugu script.'
    }
    
    const langInstruction = languageInstructions[language] || languageInstructions.en

    const systemMessage = `You are an expert ATS (Applicant Tracking System) resume analyzer with deep knowledge of hiring practices across industries. Your task is to provide PERSONALIZED and SPECIFIC feedback based on the actual resume content provided.

CRITICAL: You MUST analyze the SPECIFIC content of the resume provided. Do NOT give generic advice. Reference specific sections, skills, experiences, and details FROM THE RESUME.

${langInstruction}`

    const userMessage = `Analyze this resume for the target role: "${targetRole || 'General career guidance'}"

=== RESUME CONTENT START ===
${truncatedResume}
=== RESUME CONTENT END ===

Based on the SPECIFIC content of this resume, provide a comprehensive ATS analysis. Your feedback MUST be personalized to THIS resume.

Analyze and provide:
1. **ATS Score (0-100)**: Based on THIS resume's formatting, keyword optimization, and ATS compatibility
2. **Job Match Score (0-100)**: How well THIS resume aligns with the target role
3. **Keyword Coverage (0-100)**: Industry-relevant keywords present in THIS resume
4. **Skills Match Score (0-100)**: Skills relevance assessment

5. **Missing Skills**: Specific skills that are MISSING from THIS resume but important for the target role

6. **Quick Fixes**: Immediate improvements specific to THIS resume's content and structure

7. **Career Health**: Overall assessment based on THIS candidate's profile (Excellent/Good/Moderate/Needs Upskill)

8. **Recommendations**: Specific, actionable advice for THIS resume - mention specific sections, experiences, or content that should be improved

9. **Explanation**: A comprehensive summary of the analysis, referencing specific elements FROM THIS RESUME

Return ONLY a valid JSON object with this exact structure:
{
  "atsScore": number,
  "jobMatchScore": number,
  "keywordCoverage": number,
  "skillsMatchScore": number,
  "missingSkills": ["specific skill 1", "specific skill 2", ...],
  "quickFixes": ["specific fix referencing resume content 1", "specific fix 2", ...],
  "careerHealth": "Excellent" | "Good" | "Moderate" | "Needs Upskill",
  "recommendations": ["specific recommendation 1", "specific recommendation 2", ...],
  "explanation": "Personalized summary referencing specific content from the resume"
}`

    console.log('Calling Lovable AI Gateway for resume analysis...')
    console.log('Resume length:', truncatedResume.length, 'characters')

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
        max_tokens: 2500,
      })
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('AI Gateway error:', aiResponse.status, errorText)
      
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

    console.log('AI Response received, length:', responseText.length)

    // Parse the JSON response
    let analysis
    try {
      // Extract JSON from the response (handle markdown code blocks)
      let jsonText = responseText
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim()
      }
      
      analysis = JSON.parse(jsonText)
      
      // Validate required fields
      if (typeof analysis.atsScore !== 'number' || typeof analysis.jobMatchScore !== 'number') {
        throw new Error('Missing required analysis fields')
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response:', responseText.slice(0, 500))
      
      // Create a fallback response that still references the resume
      const resumePreview = truncatedResume.slice(0, 200)
      analysis = {
        atsScore: 55,
        jobMatchScore: 50,
        keywordCoverage: 45,
        skillsMatchScore: 50,
        missingSkills: ['Unable to parse specific missing skills - please try again'],
        quickFixes: [
          'Ensure resume uses standard formatting',
          'Add quantifiable achievements',
          'Include industry-specific keywords',
          'Add a clear professional summary'
        ],
        careerHealth: 'Moderate',
        recommendations: [
          'Re-submit resume for detailed analysis',
          'Ensure resume is in a parseable format',
          'Consider reformatting complex layouts'
        ],
        explanation: `Analysis encountered a parsing issue. Based on the resume beginning with "${resumePreview.slice(0, 100)}...", we recommend re-submitting for a complete analysis.`
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
            career_score: analysis.jobMatchScore || analysis.atsScore,
            career_health: analysis.careerHealth,
            skills_analysis: {
              ...analysis,
              jobMatchScore: analysis.jobMatchScore,
              keywordCoverage: analysis.keywordCoverage
            },
            parsed_data: { targetRole, language },
            suggestions: analysis.recommendations?.slice(0, 5) || []
          })

        if (insertError) {
          console.error('Error storing resume analysis:', insertError)
        } else {
          console.log('Resume analysis stored successfully')
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
      }
    }

    console.log('Successfully analyzed resume with scores:', {
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
    console.error('Error in analyze-resume function:', error)
    
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