-- Create career_options table to store AI-recommended career paths
CREATE TABLE IF NOT EXISTS public.career_options (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  career_name text NOT NULL,
  description text,
  required_skills text[],
  match_percentage integer DEFAULT 0,
  rationale text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.career_options ENABLE ROW LEVEL SECURITY;

-- Create policies for career_options
CREATE POLICY "Users can view their own career options"
ON public.career_options FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own career options"
ON public.career_options FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career options"
ON public.career_options FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own career options"
ON public.career_options FOR DELETE
USING (auth.uid() = user_id);

-- Create career_progress table for gamified progress tracking
CREATE TABLE IF NOT EXISTS public.career_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  selected_career_id uuid REFERENCES public.career_options(id) ON DELETE SET NULL,
  selected_career_name text,
  xp integer DEFAULT 0,
  streak_count integer DEFAULT 0,
  last_activity_date date,
  roadmap_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.career_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for career_progress
CREATE POLICY "Users can view their own career progress"
ON public.career_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own career progress"
ON public.career_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career progress"
ON public.career_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own career progress"
ON public.career_progress FOR DELETE
USING (auth.uid() = user_id);

-- Add update trigger for updated_at
CREATE TRIGGER update_career_options_updated_at
BEFORE UPDATE ON public.career_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_progress_updated_at
BEFORE UPDATE ON public.career_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();