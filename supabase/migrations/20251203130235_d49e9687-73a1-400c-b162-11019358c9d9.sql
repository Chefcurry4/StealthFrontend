-- Add preference columns to Users table
ALTER TABLE public."Users(US)" 
ADD COLUMN IF NOT EXISTS notification_email boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_reviews boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_agreements boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS display_compact boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS display_items_per_page integer DEFAULT 20;