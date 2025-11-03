-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can insert assessments" ON public.assessments;

-- Create separate policies for authenticated and anonymous users
CREATE POLICY "Authenticated users can insert assessments"
ON public.assessments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR user_id IS NULL
);

CREATE POLICY "Anonymous users can insert assessments"
ON public.assessments
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
);