-- Fix the insert policy to properly allow anonymous submissions
DROP POLICY IF EXISTS "Users can insert assessments" ON public.assessments;

CREATE POLICY "Allow assessment submissions"
ON public.assessments
FOR INSERT
WITH CHECK (
  -- Allow if user_id is NULL (anonymous) OR if authenticated user matches the user_id
  (user_id IS NULL) OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);