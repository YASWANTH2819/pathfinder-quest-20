-- Create daily MCQs table
CREATE TABLE IF NOT EXISTS public.daily_mcqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  career_name TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of options
  correct_answer TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium', -- easy, medium, hard
  xp_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user MCQ responses table
CREATE TABLE IF NOT EXISTS public.user_mcq_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mcq_id UUID NOT NULL REFERENCES public.daily_mcqs(id) ON DELETE CASCADE,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_code TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  icon_name TEXT NOT NULL DEFAULT 'Trophy',
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.daily_mcqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mcq_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_mcqs (public read)
CREATE POLICY "Anyone can view daily MCQs"
ON public.daily_mcqs
FOR SELECT
USING (true);

-- RLS Policies for user_mcq_responses
CREATE POLICY "Users can view their own MCQ responses"
ON public.user_mcq_responses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MCQ responses"
ON public.user_mcq_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges"
ON public.user_badges
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
ON public.user_badges
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_mcq_responses_user_id ON public.user_mcq_responses(user_id);
CREATE INDEX idx_user_mcq_responses_attempted_at ON public.user_mcq_responses(attempted_at);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_daily_mcqs_career ON public.daily_mcqs(career_name);