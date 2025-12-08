import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation schema
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

    const systemPrompt = `You are an expert career counselor specializing in the Indian job market. Your task is to recommend 5-6 HIGHLY RELEVANT career paths based on the user's profile.

CRITICAL RULES:
1. Skills are the MOST IMPORTANT factor. If user mentions "Python", prioritize Python-related careers (Python Developer, Data Analyst, ML Engineer, Automation Engineer).
2. If user mentions "Java" or "DSA", prioritize Software Developer, Backend Developer roles.
3. If user mentions "Communication" or "Management", prioritize Product Manager, Business Analyst, HR roles.
4. Each career MUST have a match_percentage from 60-95 based on how well it matches the user's skills.
5. Return EXACTLY in the JSON format requested.

${languageInstructions[language] || languageInstructions.en}`

    const userPrompt = `Generate personalized career recommendations based on this profile:

**Education:** ${education || 'Not specified'}
**Interests/Subjects:** ${interests || 'Not specified'}
**Goals:** ${goals || 'Not specified'}
**Skills:** ${skills || 'Not specified'}

IMPORTANT: Analyze the SKILLS field carefully. If specific technologies are mentioned, the TOP recommendations must directly use those technologies.

Return ONLY a valid JSON object:
{
  "careers": [
    {
      "name": "Career Title",
      "description": "Brief description of this career path",
      "match_percentage": 85,
      "required_skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "rationale": "Why this career matches their skills (mention their specific skills)",
      "timeline": "X-Y months",
      "youtube_links": ["https://youtube.com/relevant-tutorial"],
      "roadmap_steps": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]
    }
  ]
}`

    console.log('[generate-career-recommendations] Calling Lovable AI Gateway...')

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 3000,
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

    // Parse JSON from response
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