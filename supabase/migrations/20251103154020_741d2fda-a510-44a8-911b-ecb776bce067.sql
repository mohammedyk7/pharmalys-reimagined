-- Temporarily disable RLS to reset
ALTER TABLE public.assessments DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Drop all INSERT policies
DROP POLICY IF EXISTS "Guests and users can insert assessments" ON public.assessments;
DROP POLICY IF EXISTS "Authenticated users can insert assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anonymous users can insert assessments" ON public.assessments;

-- Create a simple INSERT policy for everyone
CREATE POLICY "Allow all inserts"
ON public.assessments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);