import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { careerName, profileData, language = 'en' } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    if (!careerName) {
      throw new Error('Career name is required');
    }

    const languageInstructions = {
      en: 'Respond in English',
      hi: 'Respond in Hindi (हिंदी)',
      te: 'Respond in Telugu (తెలుగు)'
    };

    const systemPrompt = `You are an expert career advisor. Create a personalized, gamified learning roadmap for someone pursuing a career as a ${careerName}.

${languageInstructions[language as keyof typeof languageInstructions]}.

Create a roadmap with 4-6 major milestones. Each milestone should have 5-8 microtasks that are:
- Specific and actionable
- Mix of learning (📘), practice (⚙️), and self-assessment (🧠) tasks
- Self-assessment tasks should be reflective questions or conceptual exercises (NO file uploads)
- Progressive in difficulty

Return ONLY valid JSON in this exact format:
{
  "milestones": [
    {
      "id": "m1",
      "title": "Milestone Title",
      "description": "Brief description",
      "xpReward": 100,
      "tasks": [
        {
          "id": "t1",
          "title": "Task title",
          "description": "What to do",
          "type": "learning|practice|self-assessment",
          "xpReward": 10,
          "isCompleted": false
        }
      ]
    }
  ]
}`;

    const userPrompt = profileData 
      ? `Career: ${careerName}
User Profile:
- Skills: ${profileData.skills || 'Not specified'}
- Education: ${profileData.education_level || profileData.educationLevel || 'Not specified'}
- Field: ${profileData.field_of_study || profileData.fieldOfStudy || 'Not specified'}
- Experience: ${profileData.current_year || 'Not specified'}
- Interests: ${profileData.interests || 'Not specified'}

Create a personalized roadmap considering their background.`
      : `Career: ${careerName}. Create a comprehensive roadmap for someone starting in this field.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    let roadmap;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      roadmap = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse roadmap JSON:', content);
      throw new Error('Failed to parse roadmap data');
    }

    return new Response(JSON.stringify({ 
      success: true,
      roadmap: roadmap
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-career-roadmap:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});