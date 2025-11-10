-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can submit assessments" ON public.assessments;

-- Create a permissive policy that allows anyone to insert assessments
CREATE POLICY "Anyone can submit assessments"
ON public.assessments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);