-- Drop existing overly permissive policies on email_drafts
DROP POLICY IF EXISTS "Users can read their own drafts" ON public.email_drafts;
DROP POLICY IF EXISTS "Users can create their own drafts" ON public.email_drafts;
DROP POLICY IF EXISTS "Users can update their own drafts" ON public.email_drafts;
DROP POLICY IF EXISTS "Users can delete their own drafts" ON public.email_drafts;

-- Create properly restrictive policies that check ownership
CREATE POLICY "Users can read their own drafts" ON public.email_drafts 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own drafts" ON public.email_drafts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts" ON public.email_drafts 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts" ON public.email_drafts 
  FOR DELETE USING (auth.uid() = user_id);