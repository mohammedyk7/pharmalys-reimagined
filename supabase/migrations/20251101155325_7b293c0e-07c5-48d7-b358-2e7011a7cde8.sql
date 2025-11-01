-- Make user_id nullable to allow public assessments
ALTER TABLE public.assessments 
ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Allow public and authenticated insertions" ON public.assessments;

-- Create new policy to allow public and authenticated insertions
CREATE POLICY "public_and_auth_insert"
ON public.assessments
FOR INSERT
WITH CHECK (
  -- Allow if no user (public) or if user matches
  (auth.uid() IS NULL AND user_id IS NULL) OR
  (auth.uid() = user_id)
);