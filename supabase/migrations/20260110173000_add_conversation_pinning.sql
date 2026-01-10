-- Add pinned column to ai_conversations table
ALTER TABLE ai_conversations 
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;

-- Add index for faster querying of pinned conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_pinned ON ai_conversations(user_id, pinned, updated_at DESC);
