-- Update flashcard_color_style CHECK constraint to include epic color styles
-- Drop the existing constraint on the column (PostgreSQL will drop the in-line check constraint)
ALTER TABLE "Users(US)" 
DROP CONSTRAINT IF EXISTS "Users(US)_flashcard_color_style_check";

-- Add the updated constraint with epic color styles included
ALTER TABLE "Users(US)" 
ADD CONSTRAINT "Users(US)_flashcard_color_style_check" 
CHECK (flashcard_color_style IN ('gradient', 'ocean', 'sunset', 'forest', 'epic-orange', 'epic-dark'));
