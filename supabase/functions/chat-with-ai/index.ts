import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation schema with stricter rules
const chatRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(2000, 'Message too long (max 2000 characters)'),
  language: z.string().max(10).optional(),
  context: z.any().optional(),
  systemPrompt: z.string().max(2000).optional()
})

interface ChatRequest {
  message: string
  language: string
  context?: {
    fieldOfStudy?: string
    interests?: string
    goals?: string
    skills?: string
    educationLevel?: string
    [key: string]: any
  }
  systemPrompt: string
}

// Helper to format profile context into a structured prompt section
const formatProfileContext = (context: ChatRequest['context']): string => {
  if (!context) return ''
  
  const parts: string[] = []
  
  if (context.fieldOfStudy) {
    parts.push(`**Education Background:** ${context.fieldOfStudy}`)
  }
  if (context.interests) {
    parts.push(`**Subjects/Areas They Enjoy:** ${context.interests}`)
  }
  if (context.goals) {
    parts.push(`**Career Goals:** ${context.goals}`)
  }
  if (context.skills) {
    parts.push(`**Skills:** ${context.skills}`)
  }
  if (context.educationLevel) {
    parts.push(`**Education Level:** ${context.educationLevel}`)
  }
  
  return parts.length > 0 ? parts.join('\n') : ''
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse and validate input
    const rawData = await req.json()
    const validationResult = chatRequestSchema.safeParse(rawData)
    
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

    const { message, language, context, systemPrompt }: ChatRequest = validationResult.data

    // Get Lovable AI API key from environment (auto-provisioned)
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    // Format the user's profile context
    const profileContextStr = formatProfileContext(context)
    
    // Log input lengths for debugging
    console.log('Chat request received:', {
      messageLength: message.length,
      language: language || 'en',
      hasContext: !!context,
      profileContextLength: profileContextStr.length
    })

    // Build an enhanced system prompt that uses the user's actual input
    const languageInstruction = language === 'hi' 
      ? 'You MUST respond ENTIRELY in Hindi (हिंदी). Do not mix languages.'
      : language === 'te'
      ? 'You MUST respond ENTIRELY in Telugu (తెలుగు). Do not mix languages.'
      : 'Respond in clear, professional English.'

    const enhancedSystemPrompt = `You are an expert AI career counselor specializing in guidance for Indian students and professionals. Your role is to provide highly personalized, actionable career advice.

${languageInstruction}

## USER'S PROFILE INFORMATION
${profileContextStr || 'No profile information provided.'}

## YOUR GUIDELINES

1. **Personalization is Critical**: 
   - ALWAYS reference specific details from the user's profile above (their education, interests, goals).
   - Mention their specific field of study, subjects they enjoy, and career goals by name.
   - Tailor every recommendation to their unique background.

2. **Be Specific and Actionable**:
   - Instead of saying "learn programming", say "Since you're interested in [their interest], start with Python basics on freeCodeCamp, then move to Django for web development."
   - Provide step-by-step guidance with concrete resources, timelines, and milestones.
   - Suggest specific courses, certifications, or platforms (Coursera, NPTEL, LinkedIn Learning, etc.).

3. **Structure Your Responses**:
   - Use clear headings and bullet points.
   - Break down advice into phases: immediate actions, short-term steps, long-term vision.
   - Include estimated timelines where relevant.

4. **Context-Aware Advice**:
   - Consider the Indian job market, education system, and opportunities.
   - Mention relevant Indian companies, startups, or organizations in their field.
   - Account for factors like campus placements, entrance exams (GATE, CAT, etc.) if relevant.

5. **Handle Vague Questions**:
   - If the user's question is too vague, ask 1-2 specific clarifying questions before giving advice.
   - Example: "To give you the best guidance, could you tell me: Are you looking for internship opportunities or full-time roles?"

6. **Career Suggestions**:
   - When suggesting career paths, explain WHY each matches their profile.
   - Include match percentages or compatibility ratings when suggesting careers.
   - List key skills needed and gap analysis based on their current skills.

Remember: Generic advice helps no one. Every response must feel like it was written specifically for THIS user based on THEIR profile.`

    console.log('Calling Lovable AI Gateway for personalized career chat...')

    // Build messages array for OpenAI-compatible API
    const messages = [
      {
        role: 'system',
        content: enhancedSystemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ]

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        max_tokens: 2000,
      })
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('Lovable AI Gateway error:', aiResponse.status, errorText)
      
      // Handle rate limiting
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            response: '⏱️ Rate limit reached. Please wait a moment and try again.'
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Handle payment required
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'AI credits exhausted',
            response: '💳 AI credits exhausted. Please add credits to your Lovable workspace in Settings → Usage.'
          }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
      
      throw new Error(`Lovable AI Gateway error: ${aiResponse.statusText}`)
    }

    const aiData = await aiResponse.json()
    const response = aiData.choices?.[0]?.message?.content || 'No response generated'

    console.log('Successfully generated personalized chat response, length:', response.length)

    return new Response(
      JSON.stringify({
        response
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in chat-with-ai function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: '❌ Something went wrong while generating guidance. Please try again in a moment.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
