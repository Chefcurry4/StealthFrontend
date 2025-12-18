-- Create diary_notebooks table
CREATE TABLE public.diary_notebooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Semester Planner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on diary_notebooks
ALTER TABLE public.diary_notebooks ENABLE ROW LEVEL SECURITY;

-- RLS policies for diary_notebooks
CREATE POLICY "Users can view own notebooks" ON public.diary_notebooks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own notebooks" ON public.diary_notebooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notebooks" ON public.diary_notebooks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notebooks" ON public.diary_notebooks
  FOR DELETE USING (auth.uid() = user_id);

-- Create diary_pages table
CREATE TABLE public.diary_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notebook_id UUID NOT NULL REFERENCES public.diary_notebooks(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL DEFAULT 1,
  page_type TEXT NOT NULL DEFAULT 'semester_planner',
  title TEXT,
  semester TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on diary_pages
ALTER TABLE public.diary_pages ENABLE ROW LEVEL SECURITY;

-- RLS policies for diary_pages
CREATE POLICY "Users can view own pages" ON public.diary_pages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.diary_notebooks 
    WHERE diary_notebooks.id = diary_pages.notebook_id 
    AND diary_notebooks.user_id = auth.uid()
  ));
CREATE POLICY "Users can create own pages" ON public.diary_pages
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.diary_notebooks 
    WHERE diary_notebooks.id = diary_pages.notebook_id 
    AND diary_notebooks.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own pages" ON public.diary_pages
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.diary_notebooks 
    WHERE diary_notebooks.id = diary_pages.notebook_id 
    AND diary_notebooks.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own pages" ON public.diary_pages
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.diary_notebooks 
    WHERE diary_notebooks.id = diary_pages.notebook_id 
    AND diary_notebooks.user_id = auth.uid()
  ));

-- Create diary_page_items table
CREATE TABLE public.diary_page_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.diary_pages(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  reference_id UUID,
  content TEXT,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER DEFAULT 200,
  height INTEGER DEFAULT 100,
  color TEXT DEFAULT 'yellow',
  zone TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on diary_page_items
ALTER TABLE public.diary_page_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for diary_page_items
CREATE POLICY "Users can view own items" ON public.diary_page_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.diary_pages 
    JOIN public.diary_notebooks ON diary_notebooks.id = diary_pages.notebook_id
    WHERE diary_pages.id = diary_page_items.page_id 
    AND diary_notebooks.user_id = auth.uid()
  ));
CREATE POLICY "Users can create own items" ON public.diary_page_items
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.diary_pages 
    JOIN public.diary_notebooks ON diary_notebooks.id = diary_pages.notebook_id
    WHERE diary_pages.id = diary_page_items.page_id 
    AND diary_notebooks.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own items" ON public.diary_page_items
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.diary_pages 
    JOIN public.diary_notebooks ON diary_notebooks.id = diary_pages.notebook_id
    WHERE diary_pages.id = diary_page_items.page_id 
    AND diary_notebooks.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own items" ON public.diary_page_items
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.diary_pages 
    JOIN public.diary_notebooks ON diary_notebooks.id = diary_pages.notebook_id
    WHERE diary_pages.id = diary_page_items.page_id 
    AND diary_notebooks.user_id = auth.uid()
  ));

-- Create diary_lab_communications table
CREATE TABLE public.diary_lab_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lab_id UUID REFERENCES public."Labs(L)"(id_lab),
  email_draft_id UUID REFERENCES public.email_drafts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_date TIMESTAMP WITH TIME ZONE,
  reply_received BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on diary_lab_communications
ALTER TABLE public.diary_lab_communications ENABLE ROW LEVEL SECURITY;

-- RLS policies for diary_lab_communications
CREATE POLICY "Users can view own lab communications" ON public.diary_lab_communications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own lab communications" ON public.diary_lab_communications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lab communications" ON public.diary_lab_communications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lab communications" ON public.diary_lab_communications
  FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_diary_notebooks_updated_at
  BEFORE UPDATE ON public.diary_notebooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diary_pages_updated_at
  BEFORE UPDATE ON public.diary_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diary_page_items_updated_at
  BEFORE UPDATE ON public.diary_page_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diary_lab_communications_updated_at
  BEFORE UPDATE ON public.diary_lab_communications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();