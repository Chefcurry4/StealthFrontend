-- Create lab_reviews table
CREATE TABLE public.lab_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_id UUID NOT NULL REFERENCES public."Labs(L)"(id_lab) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."Users(US)"(id) ON DELETE CASCADE,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  research_quality TEXT,
  mentorship TEXT,
  work_environment TEXT,
  comment TEXT,
  upvote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_review_upvotes table
CREATE TABLE public.lab_review_upvotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.lab_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public."Users(US)"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS on lab_reviews
ALTER TABLE public.lab_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for lab_reviews
CREATE POLICY "Anyone can read lab reviews"
  ON public.lab_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create lab reviews"
  ON public.lab_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lab reviews"
  ON public.lab_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lab reviews"
  ON public.lab_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on lab_review_upvotes
ALTER TABLE public.lab_review_upvotes ENABLE ROW LEVEL SECURITY;

-- RLS policies for lab_review_upvotes
CREATE POLICY "Anyone can view lab review upvotes"
  ON public.lab_review_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upvote lab reviews"
  ON public.lab_review_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their lab review upvotes"
  ON public.lab_review_upvotes FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_lab_reviews_lab_id ON public.lab_reviews(lab_id);
CREATE INDEX idx_lab_reviews_user_id ON public.lab_reviews(user_id);
CREATE INDEX idx_lab_review_upvotes_review_id ON public.lab_review_upvotes(review_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lab_reviews_updated_at
  BEFORE UPDATE ON public.lab_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();