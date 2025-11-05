-- Add new columns for split skin scores and urticaria
ALTER TABLE public.assessments 
ADD COLUMN skin_head_neck_trunk_score integer,
ADD COLUMN skin_arms_hands_legs_feet_score integer,
ADD COLUMN urticaria_present boolean DEFAULT false;

-- Migrate existing skin_score data (split evenly if exists)
UPDATE public.assessments
SET 
  skin_head_neck_trunk_score = FLOOR(skin_score / 2.0),
  skin_arms_hands_legs_feet_score = CEIL(skin_score / 2.0)
WHERE skin_score IS NOT NULL;

-- Set defaults for new records
ALTER TABLE public.assessments
ALTER COLUMN skin_head_neck_trunk_score SET DEFAULT 0,
ALTER COLUMN skin_arms_hands_legs_feet_score SET DEFAULT 0;