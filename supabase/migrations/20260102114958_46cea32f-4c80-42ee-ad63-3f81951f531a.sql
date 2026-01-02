-- Add login_count column to track user logins
ALTER TABLE public."Users(US)" 
ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0;

-- Add guide_completed column to track if user has finished the guide
ALTER TABLE public."Users(US)" 
ADD COLUMN IF NOT EXISTS guide_completed boolean DEFAULT false;