-- Add background_theme_mode column to Users table
ALTER TABLE "Users(US)" 
ADD COLUMN IF NOT EXISTS background_theme_mode text DEFAULT 'day';