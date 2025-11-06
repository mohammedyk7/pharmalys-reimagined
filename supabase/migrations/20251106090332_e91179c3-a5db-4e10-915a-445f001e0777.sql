-- Drop the existing insert policies that aren't working correctly
DROP POLICY IF EXISTS "anon_insert_policy" ON public.assessments;
DROP POLICY IF EXISTS "authenticated_insert_policy" ON public.assessments;

-- Create a single permissive policy that allows anyone to insert assessments
-- This is appropriate because assessments are submitted by medical professionals
-- and patients/guardians who may not have accounts
CREATE POLICY "Anyone can submit assessments"
ON public.assessments
FOR INSERT
TO public
WITH CHECK (true);

-- Optional: Add a policy to allow users to update their own assessments if they're authenticated
CREATE POLICY "Users can update own assessments"
ON public.assessments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);