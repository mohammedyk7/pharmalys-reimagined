-- Completely recreate the insert policy with explicit anon access
DROP POLICY IF EXISTS "public_and_auth_insert" ON public.assessments;

-- Create a simpler policy that explicitly allows anonymous insertions
CREATE POLICY "allow_anon_insert"
ON public.assessments
FOR INSERT
TO anon
WITH CHECK (true);

-- Create a policy for authenticated users
CREATE POLICY "allow_auth_insert"
ON public.assessments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);