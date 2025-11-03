-- Drop the problematic policy and create a simpler one that allows public submissions
DROP POLICY IF EXISTS "Allow assessment submissions" ON public.assessments;

-- Allow anyone (authenticated or not) to insert assessments
CREATE POLICY "Public can insert assessments"
ON public.assessments
FOR INSERT
TO public
WITH CHECK (true);