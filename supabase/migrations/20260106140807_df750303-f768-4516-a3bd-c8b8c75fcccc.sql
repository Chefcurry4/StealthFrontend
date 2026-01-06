-- Drop existing constraints first
ALTER TABLE course_reviews DROP CONSTRAINT IF EXISTS course_reviews_workload_check;
ALTER TABLE course_reviews DROP CONSTRAINT IF EXISTS course_reviews_difficulty_check;

-- Update workload values from 'Moderate' to 'Okay'
UPDATE course_reviews SET workload = 'Okay' WHERE workload = 'Moderate';

-- Add new workload constraint
ALTER TABLE course_reviews ADD CONSTRAINT course_reviews_workload_check 
  CHECK (workload IS NULL OR workload IN ('Light', 'Okay', 'Heavy'));