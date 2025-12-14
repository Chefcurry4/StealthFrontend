-- Drop the existing workload constraint
ALTER TABLE public.course_reviews DROP CONSTRAINT IF EXISTS course_reviews_workload_check;

-- Add updated constraint with new values
ALTER TABLE public.course_reviews ADD CONSTRAINT course_reviews_workload_check 
CHECK (workload IS NULL OR workload IN ('Light', 'Moderate', 'Balanced', 'Heavy'));