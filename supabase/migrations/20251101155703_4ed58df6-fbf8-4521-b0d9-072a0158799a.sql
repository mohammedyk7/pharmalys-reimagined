-- Drop the existing policy
DROP POLICY IF EXISTS "public_and_auth_insert" ON public.assessments;

-- Create policy that works for both anon and authenticated roles
CREATE POLICY "public_and_auth_insert"
ON public.assessments
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Allow if no auth (public user with null user_id) 
  -- OR if authenticated user and user_id matches
  (user_id IS NULL) OR (auth.uid() = user_id)
);