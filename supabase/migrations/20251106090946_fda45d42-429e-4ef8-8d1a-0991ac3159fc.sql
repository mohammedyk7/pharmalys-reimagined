-- Grant INSERT permission to anon and authenticated roles
-- This is required in addition to RLS policies
GRANT INSERT ON public.assessments TO anon;
GRANT INSERT ON public.assessments TO authenticated;

-- Also grant SELECT so users can see the inserted data returned
GRANT SELECT ON public.assessments TO anon;
GRANT SELECT ON public.assessments TO authenticated;

-- Grant UPDATE for authenticated users (already have RLS policy for this)
GRANT UPDATE ON public.assessments TO authenticated;