import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RoadmapRequest {
  profileData: any
  goal: string
  language: string
  userId?: string
  systemPrompt: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { profileData, goal, language, userId, systemPrompt }: RoadmapRequest = await req.json()

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Prepare the prompt for Gemini
    const prompt = `${systemPrompt}

PROFILE DATA:
${JSON.stringify(profileData, null, 2)}

CAREER GOAL: ${goal}

Please create a comprehensive career roadmap with specific, actionable steps. Consider the Indian job market and education system.

Return your response as JSON with this structure:
{
  "shortTerm": [
    {
      "task": "string",
      "duration": "string", 
      "type": "skill|project|certification|internship",
      "resources": ["array of resources/links"],
      "description": "detailed description"
    }
  ],
  "midTerm": [same structure as shortTerm],
  "longTerm": [same structure as shortTerm],
  "explanation": "A comprehensive summary in the requested language explaining the roadmap and rationale"
}`

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
          maxOutputTokens: 3000,
        }
      })
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`)
    }

    const geminiData = await geminiResponse.json()
    const responseText = geminiData.candidates[0].content.parts[0].text

    // Parse the JSON response
    let roadmap
    try {
      // Extract JSON from the response (remove markdown formatting if present)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        roadmap = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No valid JSON found in response')
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      // Fallback roadmap
      roadmap = {
        shortTerm: [
          {
            task: "Complete relevant online course",
            duration: "2-3 months",
            type: "skill",
            resources: ["Coursera", "edX", "Udemy"],
            description: "Build foundational skills for your career goal"
          }
        ],
        midTerm: [
          {
            task: "Build portfolio projects",
            duration: "3-6 months", 
            type: "project",
            resources: ["GitHub", "LinkedIn"],
            description: "Create projects that demonstrate your skills"
          }
        ],
        longTerm: [
          {
            task: "Apply for target positions",
            duration: "6+ months",
            type: "career",
            resources: ["LinkedIn", "Naukri", "Company websites"],
            description: "Begin applying for positions aligned with your goal"
          }
        ],
        explanation: "This is a basic roadmap to help you achieve your career goals. Focus on building skills first, then creating projects to showcase them."
      }
    }

    // Store roadmap in database if userId provided
    if (userId && roadmap) {
      const { error: insertError } = await supabase
        .from('roadmaps')
        .insert({
          user_id: userId,
          goal: goal,
          language: language,
          structured_data: roadmap,
          localized_text: roadmap.explanation
        })

      if (insertError) {
        console.error('Error storing roadmap:', insertError)
      }
    }

    return new Response(
      JSON.stringify({
        roadmap,
        explanation: roadmap.explanation,
        rawResponse: responseText
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in generate-roadmap function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        roadmap: null,
        explanation: 'Failed to generate roadmap. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})