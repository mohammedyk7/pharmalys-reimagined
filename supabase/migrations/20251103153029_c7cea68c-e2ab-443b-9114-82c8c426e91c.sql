-- Drop existing policy
DROP POLICY IF EXISTS "Public can insert assessments" ON public.assessments;

-- Create policy that explicitly allows both authenticated and anonymous users
CREATE POLICY "Anyone can insert assessments"
ON public.assessments
FOR INSERT
WITH CHECK (
  -- Allow if no user is logged in (anonymous/guest users with NULL user_id)
  (auth.uid() IS NULL AND user_id IS NULL)
  OR
  -- Allow if user is logged in and user_id matches
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  -- Allow if logged in user wants to submit anonymously
  (auth.uid() IS NOT NULL AND user_id IS NULL)
);