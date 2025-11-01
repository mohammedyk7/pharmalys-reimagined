-- Add notes column to assessments table
ALTER TABLE public.assessments 
ADD COLUMN notes TEXT;