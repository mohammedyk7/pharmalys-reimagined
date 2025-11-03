-- Completely remove RLS and re-add with proper configuration
ALTER TABLE public.assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing INSERT policies
DROP POLICY IF EXISTS "Allow all inserts" ON public.assessments;
DROP POLICY IF EXISTS "Guests and users can insert assessments" ON public.assessments;
DROP POLICY IF EXISTS "Public can insert assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anyone can insert assessments" ON public.assessments;
DROP POLICY IF EXISTS "Authenticated users can insert assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anonymous users can insert assessments" ON public.assessments;

-- Create single permissive policy for INSERT
CREATE POLICY "enable_insert_for_all"
ON public.assessments
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);