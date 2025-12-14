-- Drop the existing constraint first
ALTER TABLE public.course_reviews DROP CONSTRAINT course_reviews_difficulty_check;

-- Add updated constraint
ALTER TABLE public.course_reviews ADD CONSTRAINT course_reviews_difficulty_check 
CHECK (difficulty IS NULL OR difficulty IN ('Easy', 'Medium', 'Difficult', 'Very Difficult', 'Hard'));