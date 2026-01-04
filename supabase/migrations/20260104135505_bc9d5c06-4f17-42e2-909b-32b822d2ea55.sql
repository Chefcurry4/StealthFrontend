-- Create program_structures table
CREATE TABLE program_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES "Programs(P)"(id) ON DELETE CASCADE,
  total_credits INTEGER DEFAULT 120,
  duration TEXT DEFAULT '2 years',
  contact_email TEXT,
  website TEXT,
  internship_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(program_id)
);

-- Create program_specializations table
CREATE TABLE program_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES "Programs(P)"(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'bg-blue-500',
  sort_order INTEGER DEFAULT 0
);

-- Create program_credit_components table
CREATE TABLE program_credit_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES "Programs(P)"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  color TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Create program_courses table
CREATE TABLE program_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES "Programs(P)"(id) ON DELETE CASCADE,
  course_id UUID REFERENCES "Courses(C)"(id_course),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  category TEXT NOT NULL,
  specialization_codes TEXT[],
  sort_order INTEGER DEFAULT 0
);

-- Create program_minors table
CREATE TABLE program_minors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES "Programs(P)"(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE program_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_credit_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_minors ENABLE ROW LEVEL SECURITY;

-- Create read policies for all users
CREATE POLICY "Enable read access for all users" ON program_structures FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON program_specializations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON program_credit_components FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON program_courses FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON program_minors FOR SELECT USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_program_structures_program_id ON program_structures(program_id);
CREATE INDEX idx_program_specializations_program_id ON program_specializations(program_id);
CREATE INDEX idx_program_credit_components_program_id ON program_credit_components(program_id);
CREATE INDEX idx_program_courses_program_id ON program_courses(program_id);
CREATE INDEX idx_program_courses_category ON program_courses(category);
CREATE INDEX idx_program_minors_program_id ON program_minors(program_id);