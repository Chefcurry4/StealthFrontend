-- Add email_public column to Users(US) table for privacy control
ALTER TABLE "Users(US)" 
ADD COLUMN IF NOT EXISTS email_public boolean DEFAULT false;