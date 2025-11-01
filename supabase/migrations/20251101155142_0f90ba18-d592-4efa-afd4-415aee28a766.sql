-- Make user_id nullable to allow public assessments
ALTER TABLE public.assessments 
ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policy to allow public insertions
DROP POLICY IF EXISTS "Users can insert own assessments" ON public.assessments;

CREATE POLICY "Allow public and authenticated insertions"
ON public.assessments
FOR INSERT
WITH CHECK (
  -- Allow if no user (public) or if user matches
  (auth.uid() IS NULL AND user_id IS NULL) OR
  (auth.uid() = user_id)
);