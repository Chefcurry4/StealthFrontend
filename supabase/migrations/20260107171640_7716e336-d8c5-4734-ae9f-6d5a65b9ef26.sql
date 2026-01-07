-- Add columns to ai_messages for storing attachments and referenced items
ALTER TABLE public.ai_messages 
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS referenced_items JSONB DEFAULT NULL;