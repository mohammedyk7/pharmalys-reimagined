-- Grant INSERT permission to anon and authenticated roles
GRANT INSERT ON public.assessments TO anon;
GRANT INSERT ON public.assessments TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the policy to ensure it's fresh
DROP POLICY IF EXISTS "Guests and users can insert assessments" ON public.assessments;

CREATE POLICY "Guests and users can insert assessments"
ON public.assessments
FOR INSERT
WITH CHECK (true);