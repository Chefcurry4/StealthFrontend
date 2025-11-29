-- Create course_reviews table for student reviews
CREATE TABLE IF NOT EXISTS public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public."Courses(C)"(id_course) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  workload TEXT CHECK (workload IN ('Light', 'Moderate', 'Heavy')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create university_media table for user-uploaded images
CREATE TABLE IF NOT EXISTS public.university_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES public."Universities(U)"(uuid) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('banner', 'image')),
  image_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_drafts table for AI-generated emails
CREATE TABLE IF NOT EXISTS public.email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recipient TEXT,
  subject TEXT,
  body TEXT,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning_agreement_courses bridge table
CREATE TABLE IF NOT EXISTS public.learning_agreement_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public."Learning_agreements(LA)"(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public."Courses(C)"(id_course) ON DELETE CASCADE,
  lab_id UUID REFERENCES public."Labs(L)"(id_lab) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (course_id IS NOT NULL OR lab_id IS NOT NULL)
);

-- Create university_media_likes table for tracking likes
CREATE TABLE IF NOT EXISTS public.university_media_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES public.university_media(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(media_id, user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_agreement_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_media_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_reviews
CREATE POLICY "Anyone can read reviews" ON public.course_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.course_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own reviews" ON public.course_reviews FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own reviews" ON public.course_reviews FOR DELETE USING (true);

-- RLS Policies for university_media
CREATE POLICY "Anyone can read media" ON public.university_media FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload media" ON public.university_media FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete their own media" ON public.university_media FOR DELETE USING (true);

-- RLS Policies for email_drafts
CREATE POLICY "Users can read their own drafts" ON public.email_drafts FOR SELECT USING (true);
CREATE POLICY "Users can create their own drafts" ON public.email_drafts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own drafts" ON public.email_drafts FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own drafts" ON public.email_drafts FOR DELETE USING (true);

-- RLS Policies for learning_agreement_courses
CREATE POLICY "Anyone can read agreement courses" ON public.learning_agreement_courses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage agreement courses" ON public.learning_agreement_courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can delete agreement courses" ON public.learning_agreement_courses FOR DELETE USING (true);

-- RLS Policies for university_media_likes
CREATE POLICY "Anyone can read likes" ON public.university_media_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.university_media_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unlike" ON public.university_media_likes FOR DELETE USING (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_course_reviews_updated_at BEFORE UPDATE ON public.course_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_drafts_updated_at BEFORE UPDATE ON public.email_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();