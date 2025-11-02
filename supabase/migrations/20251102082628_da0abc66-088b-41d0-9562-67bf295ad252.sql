-- Fix Security Issue #1: Anyone Can Create Fake Medical Records
-- Drop the overly permissive insert policy and replace with authenticated-only access

DROP POLICY IF EXISTS "Anyone can insert assessments" ON assessments;

CREATE POLICY "Authenticated users can insert own assessments"
ON assessments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix Security Issue #2: Patient Records Lack User-Level Access Control
-- Add SELECT policy so clinicians can view their own assessments

CREATE POLICY "Users can view own assessments"
ON assessments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);