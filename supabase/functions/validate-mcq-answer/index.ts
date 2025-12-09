import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { answers } = await req.json();
    
    // Validate input
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid answers format. Expected array of {mcq_id, selected_answer}' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get MCQ IDs from the answers
    const mcqIds = answers.map((a: { mcq_id: string }) => a.mcq_id);

    // Fetch correct answers from database (server-side only)
    const { data: mcqs, error: mcqError } = await supabase
      .from('daily_mcqs')
      .select('id, correct_answer, xp_reward')
      .in('id', mcqIds);

    if (mcqError) {
      console.error('Error fetching MCQs:', mcqError);
      return new Response(
        JSON.stringify({ error: 'Failed to validate answers' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a map of correct answers
    const correctAnswersMap = new Map(
      mcqs?.map((mcq: { id: string; correct_answer: string; xp_reward: number }) => [
        mcq.id, 
        { correct_answer: mcq.correct_answer, xp_reward: mcq.xp_reward }
      ]) || []
    );

    // Validate each answer and calculate results
    const results = answers.map((answer: { mcq_id: string; selected_answer: string }) => {
      const mcqData = correctAnswersMap.get(answer.mcq_id);
      if (!mcqData) {
        return {
          mcq_id: answer.mcq_id,
          is_correct: false,
          correct_answer: null,
          xp_earned: 0
        };
      }
      
      const isCorrect = answer.selected_answer === mcqData.correct_answer;
      return {
        mcq_id: answer.mcq_id,
        is_correct: isCorrect,
        correct_answer: mcqData.correct_answer, // Only revealed after submission
        xp_earned: isCorrect ? mcqData.xp_reward : 0
      };
    });

    const totalXP = results.reduce((sum: number, r: { xp_earned: number }) => sum + r.xp_earned, 0);
    const correctCount = results.filter((r: { is_correct: boolean }) => r.is_correct).length;

    console.log(`User ${user.id} quiz results: ${correctCount}/${answers.length} correct, ${totalXP} XP earned`);

    return new Response(
      JSON.stringify({
        results,
        summary: {
          total_questions: answers.length,
          correct_count: correctCount,
          total_xp: totalXP
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-mcq-answer:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
