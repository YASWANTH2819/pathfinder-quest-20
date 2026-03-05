-- Remove public read access to quiz answer table
DROP POLICY IF EXISTS "Anyone can view daily MCQs" ON public.daily_mcqs;