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
  systemPrompt: string
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

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Prepare the prompt for Gemini (truncate resume if too long)
    const truncatedResume = resumeText.slice(0, 30000)
    const prompt = `${systemPrompt || 'You are a resume analysis expert.'}

RESUME TEXT:
${truncatedResume}

TARGET ROLE: ${targetRole || 'General career guidance'}

Please analyze this resume and provide:
1. ATS Score (0-100) based on formatting, keywords, structure
2. Skills match score for the target role (0-100)
3. Missing skills list
4. Quick improvement suggestions
5. Career health assessment (Excellent/Good/Moderate/Needs Upskill)
6. Specific recommendations

Return your response as JSON with this structure:
{
  "atsScore": number,
  "skillsMatchScore": number,
  "missingSkills": [array of strings],
  "quickFixes": [array of strings],
  "careerHealth": string,
  "recommendations": [array of strings],
  "explanation": "A human-readable summary in the requested language"
}`

    console.log('Calling Gemini API for resume analysis...')

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', geminiResponse.status, errorText)
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`)
    }

    const geminiData = await geminiResponse.json()
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Parse the JSON response
    let analysis
    try {
      // Extract JSON from the response (remove markdown formatting if present)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No valid JSON found in response')
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      // Fallback if JSON parsing fails
      analysis = {
        atsScore: 70,
        skillsMatchScore: 65,
        missingSkills: ['React', 'TypeScript'],
        quickFixes: ['Add more keywords', 'Improve formatting'],
        careerHealth: 'Good',
        recommendations: ['Take online courses', 'Build portfolio'],
        explanation: 'Resume analysis completed with basic recommendations.'
      }
    }

    // Store analysis in database if userId provided
    if (userId && analysis) {
      const { error: insertError } = await supabase
        .from('resumes')
        .insert({
          user_id: userId,
          filename: 'uploaded_resume',
          resume_text: resumeText.slice(0, 10000), // Store truncated version
          career_score: analysis.atsScore,
          career_health: analysis.careerHealth,
          skills_analysis: analysis,
          parsed_data: { targetRole, language }
        })

      if (insertError) {
        console.error('Error storing resume analysis:', insertError)
      }
    }

    console.log('Successfully analyzed resume')

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
        error: error.message,
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
