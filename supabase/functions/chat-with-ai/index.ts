import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation schema
const chatRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(2000, 'Message too long (max 2000 characters)'),
  language: z.string().max(10).optional(),
  context: z.any().optional(),
  systemPrompt: z.string().max(1000).optional()
})

interface ChatRequest {
  message: string
  language: string
  context?: any
  systemPrompt: string
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

    // Prepare the context (limit size)
    const contextString = context ? JSON.stringify(context).slice(0, 5000) : ''
    
    console.log('Calling Lovable AI Gateway for chat...')

    // Build messages array for OpenAI-compatible API
    const messages = [
      {
        role: 'system',
        content: `${systemPrompt || 'You are a helpful career guidance assistant for Indian students. Provide practical, actionable advice tailored to the Indian job market and education system.'}${contextString ? `\n\nCONTEXT: ${contextString}` : ''}`
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
        temperature: 0.8,
        max_tokens: 1500,
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

    console.log('Successfully generated chat response')

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
        response: 'I apologize, but I\'m having trouble processing your request right now. Please try again later.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
