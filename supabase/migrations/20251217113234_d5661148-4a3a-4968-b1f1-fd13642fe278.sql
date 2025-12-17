-- Add flashcard_color_style column to Users table for storing flashcard color preference
ALTER TABLE "Users(US)" 
ADD COLUMN IF NOT EXISTS flashcard_color_style text DEFAULT 'gradient' 
CHECK (flashcard_color_style IN ('gradient', 'ocean', 'sunset', 'forest'));