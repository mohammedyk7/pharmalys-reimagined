-- Update the insert policy on assessments to allow anonymous users
DROP POLICY IF EXISTS "Authenticated users can insert own assessments" ON public.assessments;

CREATE POLICY "Users can insert assessments"
ON public.assessments
FOR INSERT
WITH CHECK (
  user_id IS NULL OR auth.uid() = user_id
);