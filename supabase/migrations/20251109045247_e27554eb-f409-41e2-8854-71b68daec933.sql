-- Allow anonymous assessment submissions by updating RLS policies
-- Drop existing restrictive insert policies
DROP POLICY IF EXISTS "Users can insert own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Prevent null user_id" ON public.assessments;

-- Allow anyone to insert assessments (anonymous or authenticated)
CREATE POLICY "Anyone can submit assessments"
ON public.assessments
FOR INSERT
WITH CHECK (true);

-- Update select policy to allow users to see their own assessments, admins see all
DROP POLICY IF EXISTS "Users can view own assessments" ON public.assessments;
CREATE POLICY "Users can view own assessments"
ON public.assessments
FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- Update update policy
DROP POLICY IF EXISTS "Users can update own assessments" ON public.assessments;
CREATE POLICY "Users can update own assessments"
ON public.assessments
FOR UPDATE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  has_role(auth.uid(), 'admin'::app_role)
);