DROP POLICY IF EXISTS "Authenticated users can insert assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anonymous users can insert assessments" ON public.assessments;

CREATE POLICY "Guests and users can insert assessments"
ON public.assessments
FOR INSERT
TO public
WITH CHECK (true);