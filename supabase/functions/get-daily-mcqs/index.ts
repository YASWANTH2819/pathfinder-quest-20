import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { careerName } = await req.json();
    if (!careerName || typeof careerName !== 'string') {
      return new Response(JSON.stringify({ error: 'careerName is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // First try exact match
    let { data: mcqs, error: mcqError } = await adminClient
      .from('daily_mcqs')
      .select('id, question, options, xp_reward, difficulty, career_name')
      .eq('career_name', careerName)
      .limit(20);

    if (mcqError) {
      console.error('Error fetching MCQs:', mcqError);
      return new Response(JSON.stringify({ error: 'Failed to fetch quiz questions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If no exact match, try case-insensitive partial match
    if (!mcqs || mcqs.length === 0) {
      const { data: fuzzyMcqs } = await adminClient
        .from('daily_mcqs')
        .select('id, question, options, xp_reward, difficulty, career_name')
        .ilike('career_name', `%${careerName.split(' ')[0]}%`)
        .limit(20);
      
      mcqs = fuzzyMcqs || [];
    }

    // If still no MCQs found, generate them dynamically via AI
    if (mcqs.length === 0) {
      console.log(`No MCQs found for "${careerName}", generating via AI...`);
      
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      if (lovableApiKey) {
        try {
          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-lite',
              messages: [
                { role: 'system', content: `Generate exactly 10 multiple-choice questions for a ${careerName} career quiz. Each question should test practical knowledge. Return ONLY valid JSON array: [{"question":"...","options":["A","B","C","D"],"correct_answer":"A","difficulty":"medium","xp_reward":10}]` },
                { role: 'user', content: `Create 10 MCQ questions for ${careerName} career path.` }
              ],
              temperature: 0.7,
              max_tokens: 3000,
            }),
          });

          if (response.ok) {
            const aiData = await response.json();
            const content = aiData.choices?.[0]?.message?.content || '';
            
            let questions;
            try {
              const jsonMatch = content.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                questions = JSON.parse(jsonMatch[0]);
              }
            } catch (e) {
              console.error('Failed to parse AI MCQ response');
            }

            if (questions && Array.isArray(questions) && questions.length > 0) {
              // Store generated MCQs in database for future use
              const mcqsToInsert = questions.slice(0, 10).map((q: any) => ({
                career_name: careerName,
                question: q.question,
                options: q.options,
                correct_answer: q.correct_answer || q.options[0],
                difficulty: q.difficulty || 'medium',
                xp_reward: q.xp_reward || 10,
              }));

              const { data: insertedMcqs, error: insertError } = await adminClient
                .from('daily_mcqs')
                .insert(mcqsToInsert)
                .select('id, question, options, xp_reward, difficulty, career_name');

              if (!insertError && insertedMcqs) {
                mcqs = insertedMcqs;
                console.log(`Generated and stored ${mcqs.length} MCQs for "${careerName}"`);
              } else {
                console.error('Error inserting generated MCQs:', insertError);
                // Return generated questions without IDs as fallback
                mcqs = mcqsToInsert.map((q: any, i: number) => ({ ...q, id: `gen-${i}` }));
              }
            }
          }
        } catch (aiError) {
          console.error('AI MCQ generation failed:', aiError);
        }
      }
    }

    return new Response(JSON.stringify({ mcqs: mcqs ?? [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-daily-mcqs:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
