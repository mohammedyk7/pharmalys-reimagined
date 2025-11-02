-- Fix Warning #1: Add DELETE policy for assessments table
-- Only admins should be able to delete medical assessment records
CREATE POLICY "Only admins can delete assessments"
ON assessments FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix Warning #2: Restrict contact submissions viewing to admins only
-- Drop the overly permissive policy that allows any authenticated user to view all submissions
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON contact_submissions;

CREATE POLICY "Only admins can view contact submissions"
ON contact_submissions FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));