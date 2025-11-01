-- Drop the restrictive INSERT policy and create a simpler one
DROP POLICY IF EXISTS "Users can insert own assessments" ON public.assessments;

-- Allow authenticated users to insert their own assessments
CREATE POLICY "Users can insert own assessments" 
ON public.assessments 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);