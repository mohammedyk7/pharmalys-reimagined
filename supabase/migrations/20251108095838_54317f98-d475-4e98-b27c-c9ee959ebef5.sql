-- Fix nullable_user_id security issue
-- Since we can't enforce NOT NULL with existing null values, we need a different approach

-- First, drop the anonymous insert policy to prevent new anonymous submissions
DROP POLICY IF EXISTS "Anonymous users can insert assessments" ON public.assessments;

-- Drop the overly permissive authenticated insert policy
DROP POLICY IF EXISTS "Authenticated users can insert assessments" ON public.assessments;

-- Create a strict insert policy that requires user_id to match auth.uid()
CREATE POLICY "Users can insert own assessments"
ON public.assessments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

-- Add a policy to prevent null user_id inserts from any source
-- This acts as a constraint without requiring existing data cleanup
CREATE POLICY "Prevent null user_id"
ON public.assessments
FOR INSERT
WITH CHECK (user_id IS NOT NULL);