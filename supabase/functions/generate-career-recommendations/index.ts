import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const careerRequestSchema = z.object({
  education: z.string().max(500),
  interests: z.string().max(1000),
  goals: z.string().max(1000),
  skills: z.string().max(1000),
  language: z.enum(['en', 'hi', 'te']).default('en')
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const rawData = await req.json()
    const validationResult = careerRequestSchema.safeParse(rawData)
    
    if (!validationResult.success) {
      console.error('[generate-career-recommendations] Validation error:', validationResult.error.errors)
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validationResult.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { education, interests, goals, skills, language } = validationResult.data

    console.log('[generate-career-recommendations] Request:', { 
      education: education.substring(0, 50),
      interests: interests.substring(0, 50),
      goals: goals.substring(0, 50),
      skills: skills.substring(0, 50)
    })

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    const languageInstructions: Record<string, string> = {
      en: 'Respond in English.',
      hi: 'Respond in Hindi (हिंदी).',
      te: 'Respond in Telugu (తెలుగు).'
    }

    const systemPrompt = `You are a career counselor for the Indian job market. Recommend 5 career paths matching the user's skills. Skills are the MOST important factor. Return EXACTLY the JSON format requested. ${languageInstructions[language] || languageInstructions.en}`

    const userPrompt = `Profile: Education: ${education || 'N/A'}, Interests: ${interests || 'N/A'}, Goals: ${goals || 'N/A'}, Skills: ${skills || 'N/A'}

Return ONLY valid JSON:
{"careers":[{"name":"...","description":"...","match_percentage":85,"required_skills":["..."],"rationale":"...","timeline":"X-Y months","roadmap_steps":["..."],"projects":["..."],"internships":["..."],"certifications":["..."],"competitions":["..."]}]}`

    console.log('[generate-career-recommendations] Calling Lovable AI Gateway...')

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 2500,
      })
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('[generate-career-recommendations] AI Gateway error:', aiResponse.status, errorText)
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.', careers: null }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds.', careers: null }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw new Error(`AI Gateway error: ${aiResponse.statusText}`)
    }

    const aiData = await aiResponse.json()
    const responseText = aiData.choices?.[0]?.message?.content || ''

    console.log('[generate-career-recommendations] AI Response length:', responseText.length)

    let careers
    try {
      let jsonText = responseText
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim()
      }
      const jsonObjectMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch && jsonObjectMatch) {
        jsonText = jsonObjectMatch[0]
      }
      const parsed = JSON.parse(jsonText)
      careers = parsed.careers || []
      console.log('[generate-career-recommendations] Parsed', careers.length, 'careers')
    } catch (parseError) {
      console.error('[generate-career-recommendations] JSON parse error:', parseError)
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', careers: null }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ careers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[generate-career-recommendations] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred', careers: null }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
