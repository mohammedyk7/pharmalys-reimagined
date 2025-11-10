-- First, drop all existing policies for assessments
DROP POLICY IF EXISTS "Anyone can submit assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can view own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can update own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Admins can read all" ON public.assessments;
DROP POLICY IF EXISTS "Admins can update all" ON public.assessments;
DROP POLICY IF EXISTS "Only admins can delete assessments" ON public.assessments;

-- Create fresh policies with correct permissions
-- Allow anonymous and authenticated users to insert assessments
CREATE POLICY "Enable insert for all users"
ON public.assessments
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own assessments, and admins to view all
CREATE POLICY "Enable read for users and admins"
ON public.assessments
FOR SELECT
TO public
USING (
  user_id IS NULL 
  OR auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Allow users to update their own assessments, and admins to update all
CREATE POLICY "Enable update for users and admins"
ON public.assessments
FOR UPDATE
TO public
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can delete
CREATE POLICY "Enable delete for admins only"
ON public.assessments
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));