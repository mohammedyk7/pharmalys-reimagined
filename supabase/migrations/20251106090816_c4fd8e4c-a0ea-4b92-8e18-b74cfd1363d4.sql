-- Drop the existing policy
DROP POLICY IF EXISTS "Allow all inserts" ON public.assessments;

-- Create separate policies for anon and authenticated roles
CREATE POLICY "Anonymous users can insert assessments"
ON public.assessments
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert assessments"
ON public.assessments
FOR INSERT
TO authenticated
WITH CHECK (true);