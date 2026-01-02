-- Add extended metadata columns to Universities table
ALTER TABLE public."Universities(U)" 
ADD COLUMN IF NOT EXISTS student_count integer,
ADD COLUMN IF NOT EXISTS endowment text,
ADD COLUMN IF NOT EXISTS campus_area text,
ADD COLUMN IF NOT EXISTS courses_count integer DEFAULT 0;

-- Update EPFL with real data
UPDATE public."Universities(U)" 
SET 
  student_count = 12000,
  endowment = 'CHF 1.8B',
  campus_area = '136 acres',
  courses_count = 1420
WHERE slug = 'EPFL';