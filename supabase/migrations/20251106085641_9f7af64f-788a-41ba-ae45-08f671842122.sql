-- Enable Row Level Security on the assessments table
-- This activates all the existing RLS policies that were previously defined but inactive
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;