-- Create table for storing user career profiles and analysis
CREATE TABLE public.career_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  age TEXT NOT NULL,
  country TEXT NOT NULL,
  education_level TEXT,
  field_of_study TEXT,
  specialization TEXT,
  current_year TEXT,
  certifications TEXT,
  skills TEXT,
  interests TEXT,
  work_environment TEXT,
  short_term_goals TEXT,
  long_term_goals TEXT,
  career_transition TEXT,
  study_or_job TEXT,
  location_preference TEXT,
  company_type TEXT,
  financial_support TEXT,
  career_health_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing resume analysis results
CREATE TABLE public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  resume_text TEXT,
  ats_score INTEGER DEFAULT 0,
  overall_rating INTEGER DEFAULT 0,
  career_score INTEGER DEFAULT 0,
  career_health TEXT DEFAULT 'Needs Assessment',
  skills_analysis JSONB,
  parsed_data JSONB,
  suggestions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing career roadmaps
CREATE TABLE public.roadmaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_data JSONB,
  goal TEXT,
  roadmap_data JSONB,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- Create policies for career_profiles
CREATE POLICY "Users can view their own career profile" 
ON public.career_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own career profile" 
ON public.career_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career profile" 
ON public.career_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for resumes
CREATE POLICY "Users can view their own resumes" 
ON public.resumes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own resumes" 
ON public.resumes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" 
ON public.resumes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for roadmaps
CREATE POLICY "Users can view their own roadmaps" 
ON public.roadmaps 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roadmaps" 
ON public.roadmaps 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps" 
ON public.roadmaps 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_career_profiles_updated_at
BEFORE UPDATE ON public.career_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at
BEFORE UPDATE ON public.resumes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roadmaps_updated_at
BEFORE UPDATE ON public.roadmaps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();