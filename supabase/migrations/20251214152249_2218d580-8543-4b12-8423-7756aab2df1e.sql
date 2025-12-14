-- Add foreign key relationship between course_reviews and Users(US)
ALTER TABLE public.course_reviews
ADD CONSTRAINT course_reviews_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public."Users(US)"(id) ON DELETE CASCADE;

-- Create upvotes table for course reviews
CREATE TABLE public.course_review_upvotes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid NOT NULL REFERENCES public.course_reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public."Users(US)"(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS
ALTER TABLE public.course_review_upvotes ENABLE ROW LEVEL SECURITY;

-- Policies for upvotes
CREATE POLICY "Anyone can view upvotes" 
ON public.course_review_upvotes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upvote" 
ON public.course_review_upvotes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their upvotes" 
ON public.course_review_upvotes FOR DELETE 
USING (auth.uid() = user_id);

-- Add upvote_count to course_reviews for quick access
ALTER TABLE public.course_reviews ADD COLUMN IF NOT EXISTS upvote_count integer DEFAULT 0;