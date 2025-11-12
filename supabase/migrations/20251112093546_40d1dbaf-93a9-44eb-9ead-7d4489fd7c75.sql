-- Add urticaria_score column to assessments table
ALTER TABLE public.assessments 
ADD COLUMN urticaria_score integer NOT NULL DEFAULT 0;

-- Update existing records to set urticaria_score based on urticaria_present
UPDATE public.assessments 
SET urticaria_score = CASE 
  WHEN urticaria_present = true THEN 6 
  ELSE 0 
END;