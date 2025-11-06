-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can submit assessments" ON public.assessments;

-- Create a more permissive policy that explicitly allows both anon and authenticated users
CREATE POLICY "Allow all inserts"
ON public.assessments
FOR INSERT
WITH CHECK (true);