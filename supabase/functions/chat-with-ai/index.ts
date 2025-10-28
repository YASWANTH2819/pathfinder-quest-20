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

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    // Prepare the prompt for OpenAI (limit context size)
    const contextString = context ? JSON.stringify(context).slice(0, 5000) : ''
    
    console.log('Calling OpenAI API for chat...')

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt || 'You are a helpful career guidance assistant.'
          },
          ...(contextString ? [{ role: 'system', content: `CONTEXT: ${contextString}` }] : []),
          { role: 'user', content: message }
        ],
        max_tokens: 1500,
        temperature: 0.8,
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', openaiResponse.status, errorText)
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`)
    }

    const openaiData = await openaiResponse.json()
    const response = openaiData.choices?.[0]?.message?.content || 'No response generated'

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
