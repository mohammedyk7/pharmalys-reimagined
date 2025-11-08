-- Enable Row Level Security on assessments table
-- This fixes the critical vulnerability where all patient data is publicly accessible
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;