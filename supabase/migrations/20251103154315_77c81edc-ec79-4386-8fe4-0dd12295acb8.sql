-- Drop the problematic policy
DROP POLICY IF EXISTS "enable_insert_for_all" ON public.assessments;

-- Create separate explicit policies for anon and authenticated
CREATE POLICY "anon_insert_policy"
ON public.assessments
AS PERMISSIVE
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "authenticated_insert_policy"
ON public.assessments
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);