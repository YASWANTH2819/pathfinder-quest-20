-- Add explicit read policy only for backend service role
DROP POLICY IF EXISTS "Service role can read daily mcqs" ON public.daily_mcqs;
CREATE POLICY "Service role can read daily mcqs"
ON public.daily_mcqs
FOR SELECT
TO service_role
USING (true);