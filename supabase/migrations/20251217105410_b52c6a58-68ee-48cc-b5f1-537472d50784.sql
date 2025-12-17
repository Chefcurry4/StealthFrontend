-- Add student_level column to Users table
ALTER TABLE "Users(US)" 
ADD COLUMN IF NOT EXISTS student_level text DEFAULT NULL 
CHECK (student_level IN ('Bachelor', 'Master', NULL));