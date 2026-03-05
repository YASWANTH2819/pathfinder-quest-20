import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const profileDataSchema = z.object({
  skills: z.string().max(500).optional(),
  education_level: z.string().max(100).optional(),
  educationLevel: z.string().max(100).optional(),
  education: z.string().max(200).optional(),
  field_of_study: z.string().max(100).optional(),
  fieldOfStudy: z.string().max(100).optional(),
  current_year: z.string().max(50).optional(),
  interests: z.string().max(500).optional(),
}).optional();

const roadmapRequestSchema = z.object({
  careerName: z.string().min(2).max(100),
  profileData: profileDataSchema,
  language: z.enum(['en', 'hi', 'te']).default('en'),
  mode: z.enum(['quick', 'full']).default('full'),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validationResult = roadmapRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request data',
        details: validationResult.error.errors.map(e => e.message).join(', '),
        success: false
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { careerName, profileData, language, mode } = validationResult.data;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) throw new Error('LOVABLE_API_KEY not configured');

    const languageInstructions: Record<string, string> = {
      en: 'Respond in English',
      hi: 'Respond in Hindi (हिंदी)',
      te: 'Respond in Telugu (తెలుగు)'
    };

    // Two-tier prompt: quick mode returns only years overview, full mode returns milestones + years
    const isQuick = mode === 'quick';

    const systemPrompt = isQuick
      ? `You are a career advisor. Create a 4-year plan for a ${careerName} career. ${languageInstructions[language]}.
Return ONLY valid JSON: {"years":[{"year":"Year 1","focus":"...","activities":["..."],"milestones":["..."]}]}`
      : `You are a career advisor. Create a gamified roadmap for ${careerName}. ${languageInstructions[language]}.
Return ONLY valid JSON with "milestones" (4-6 items, each with id/title/description/xpReward/tasks array) and "years" (4-year plan with year/focus/activities/milestones).
Tasks have: id, title, description, type (learning|practice|self-assessment), xpReward, isCompleted (false).`;

    const skills = profileData?.skills || 'Not specified';
    const education = profileData?.education_level || profileData?.educationLevel || profileData?.education || 'Not specified';
    const interests = profileData?.interests || 'Not specified';

    const userPrompt = `Career: ${careerName}\nSkills: ${skills}\nEducation: ${education}\nInterests: ${interests}`;

    console.log(`Generating ${mode} roadmap for:`, careerName);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: isQuick ? 'google/gemini-2.5-flash-lite' : 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: isQuick ? 1000 : 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.', success: false }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.', success: false }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    let roadmap;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      let jsonText = jsonMatch ? jsonMatch[1].trim() : content;
      const objMatch = jsonText.match(/\{[\s\S]*\}/);
      if (objMatch) jsonText = objMatch[0];
      roadmap = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse roadmap JSON, using fallback. Raw content length:', content.length);
      roadmap = {
        milestones: [
          { id: "m1", title: `${careerName} Foundations`, description: "Build core skills", xpReward: 100, tasks: [
            { id: "t1", title: "Research the field", description: "Study what this career involves", type: "learning", xpReward: 10, isCompleted: false },
            { id: "t2", title: "Identify key skills", description: "List the top skills needed", type: "learning", xpReward: 10, isCompleted: false },
            { id: "t3", title: "Start learning basics", description: "Begin with foundational courses", type: "practice", xpReward: 15, isCompleted: false },
          ]},
          { id: "m2", title: "Skill Development", description: "Develop practical abilities", xpReward: 150, tasks: [
            { id: "t4", title: "Complete an online course", description: "Finish a structured learning program", type: "learning", xpReward: 20, isCompleted: false },
            { id: "t5", title: "Build a small project", description: "Apply your skills practically", type: "practice", xpReward: 25, isCompleted: false },
            { id: "t6", title: "Self-assess progress", description: "Reflect on what you've learned", type: "self-assessment", xpReward: 10, isCompleted: false },
          ]},
          { id: "m3", title: "Portfolio & Experience", description: "Gain real-world experience", xpReward: 200, tasks: [
            { id: "t7", title: "Build a portfolio project", description: "Create something to showcase", type: "practice", xpReward: 30, isCompleted: false },
            { id: "t8", title: "Seek internship opportunities", description: "Apply for hands-on experience", type: "practice", xpReward: 25, isCompleted: false },
          ]},
        ],
        years: [
          { year: "Year 1", focus: "Foundations", activities: ["Learn basics", "Take courses"], milestones: ["Complete fundamentals"] },
          { year: "Year 2", focus: "Skill Building", activities: ["Build projects", "Get certified"], milestones: ["Portfolio ready"] },
          { year: "Year 3", focus: "Experience", activities: ["Internships", "Networking"], milestones: ["First job/internship"] },
          { year: "Year 4", focus: "Career Launch", activities: ["Full-time role", "Specialize"], milestones: ["Career established"] },
        ]
      };
    }

    console.log(`${mode} roadmap generated successfully for:`, careerName);

    return new Response(JSON.stringify({ success: true, roadmap }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-career-roadmap:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
