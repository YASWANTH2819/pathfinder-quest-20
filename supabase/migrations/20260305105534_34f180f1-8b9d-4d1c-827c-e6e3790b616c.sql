-- Tighten policy condition to avoid broad TRUE predicate
DROP POLICY IF EXISTS "Service role can read daily mcqs" ON public.daily_mcqs;
CREATE POLICY "Only service role can read daily mcqs"
ON public.daily_mcqs
FOR SELECT
USING (auth.role() = 'service_role');