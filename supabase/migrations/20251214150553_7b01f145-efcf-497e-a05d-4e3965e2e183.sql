-- Change rating from integer to numeric to support decimal values (1.5, 2.5, etc.)
ALTER TABLE public.course_reviews 
ALTER COLUMN rating TYPE numeric USING rating::numeric;

-- Add organization column for "Course Structure & Organization" field
ALTER TABLE public.course_reviews 
ADD COLUMN organization text;