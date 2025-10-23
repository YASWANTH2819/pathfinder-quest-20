-- Add DELETE policies for all user tables to comply with GDPR data deletion rights

-- DELETE policy for user_profiles
CREATE POLICY "Users can delete their own profile"
ON public.user_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- DELETE policy for career_profiles
CREATE POLICY "Users can delete their own career profile"
ON public.career_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- DELETE policy for resumes
CREATE POLICY "Users can delete their own resumes"
ON public.resumes
FOR DELETE
USING (auth.uid() = user_id);

-- DELETE policy for roadmaps
CREATE POLICY "Users can delete their own roadmaps"
ON public.roadmaps
FOR DELETE
USING (auth.uid() = user_id);