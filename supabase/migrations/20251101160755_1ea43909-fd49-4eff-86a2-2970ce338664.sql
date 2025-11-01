-- Drop all policies on assessments
DROP POLICY IF EXISTS "allow_anon_insert" ON public.assessments;
DROP POLICY IF EXISTS "allow_auth_insert" ON public.assessments;
DROP POLICY IF EXISTS "Admins can read all assessments" ON public.assessments;
DROP POLICY IF EXISTS "Admins can update all assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can read own assessments" ON public.assessments;

-- Drop and recreate the table
DROP TABLE IF EXISTS public.assessments CASCADE;

CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  patient_name TEXT NOT NULL,
  patient_gender TEXT NOT NULL,
  patient_age_months INTEGER NOT NULL,
  assessment_date DATE NOT NULL,
  guardian_name TEXT NOT NULL,
  guardian_phone TEXT NOT NULL,
  clinician_name TEXT NOT NULL,
  hospital_clinic TEXT NOT NULL,
  location TEXT,
  crying_score INTEGER NOT NULL,
  regurgitation_score INTEGER NOT NULL,
  stool_score INTEGER NOT NULL,
  skin_score INTEGER NOT NULL,
  respiratory_score INTEGER NOT NULL,
  total_score INTEGER GENERATED ALWAYS AS (
    crying_score + regurgitation_score + stool_score + skin_score + respiratory_score
  ) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon) to insert assessments
CREATE POLICY "Anyone can insert assessments"
ON public.assessments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow admins to read all assessments
CREATE POLICY "Admins can read all"
ON public.assessments
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update assessments
CREATE POLICY "Admins can update all"
ON public.assessments
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_assessments_updated_at
BEFORE UPDATE ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();