-- Add is_anonymous column to course_reviews
ALTER TABLE public.course_reviews ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- Add is_anonymous column to lab_reviews
ALTER TABLE public.lab_reviews ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT false;