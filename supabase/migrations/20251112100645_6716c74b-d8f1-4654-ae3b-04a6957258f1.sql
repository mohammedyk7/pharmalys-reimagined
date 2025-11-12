-- Make optional fields nullable in assessments table
ALTER TABLE public.assessments 
  ALTER COLUMN patient_name DROP NOT NULL,
  ALTER COLUMN guardian_name DROP NOT NULL,
  ALTER COLUMN guardian_phone DROP NOT NULL,
  ALTER COLUMN clinician_name DROP NOT NULL,
  ALTER COLUMN hospital_clinic DROP NOT NULL;