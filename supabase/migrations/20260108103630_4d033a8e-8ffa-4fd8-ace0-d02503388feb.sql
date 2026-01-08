-- Create table for storing user semester plans (max 10 per user)
CREATE TABLE public.user_semester_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Semester Plan',
  semester_type TEXT NOT NULL CHECK (semester_type IN ('winter', 'summer')),
  courses JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_ects INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_semester_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own semester plans" 
ON public.user_semester_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own semester plans" 
ON public.user_semester_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own semester plans" 
ON public.user_semester_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own semester plans" 
ON public.user_semester_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_semester_plans_updated_at
BEFORE UPDATE ON public.user_semester_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster user lookups
CREATE INDEX idx_user_semester_plans_user_id ON public.user_semester_plans(user_id);
CREATE INDEX idx_user_semester_plans_semester_type ON public.user_semester_plans(semester_type);