-- Add feedback column to ai_messages table
ALTER TABLE ai_messages 
ADD COLUMN IF NOT EXISTS feedback TEXT CHECK (feedback IN ('positive', 'negative', NULL));

-- Add timestamp for when feedback was given
ALTER TABLE ai_messages 
ADD COLUMN IF NOT EXISTS feedback_at TIMESTAMPTZ;
