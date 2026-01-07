-- Add specializations for Statistics program
INSERT INTO program_specializations (program_id, code, name, color, sort_order)
VALUES 
  ('4825c7c2-61ec-438b-8d30-cecd466e6699', 'BIOS', 'Biostatistics', 'bg-green-500', 1),
  ('4825c7c2-61ec-438b-8d30-cecd466e6699', 'ENV', 'Environmental Statistics', 'bg-emerald-500', 2),
  ('4825c7c2-61ec-438b-8d30-cecd466e6699', 'MATH', 'Mathematical Statistics', 'bg-blue-500', 3),
  ('4825c7c2-61ec-438b-8d30-cecd466e6699', 'DS', 'Statistical Data Science', 'bg-purple-500', 4)
ON CONFLICT DO NOTHING;

-- Add specializations for Robotics program (orientations A, B, C)
INSERT INTO program_specializations (program_id, code, name, color, sort_order)
VALUES 
  ('d2b049ad-d744-47b1-924f-578491b87f64', 'A', 'Industrial Robotics', 'bg-orange-500', 1),
  ('d2b049ad-d744-47b1-924f-578491b87f64', 'B', 'Medical Robotics', 'bg-red-500', 2),
  ('d2b049ad-d744-47b1-924f-578491b87f64', 'C', 'Mobile Robotics', 'bg-cyan-500', 3)
ON CONFLICT DO NOTHING;

-- Add specializations for Sustainable Management and Technology
INSERT INTO program_specializations (program_id, code, name, color, sort_order)
VALUES 
  ('8a55df8c-007b-47b4-b248-0a724bfcc610', 'TECH', 'Technology', 'bg-blue-500', 1),
  ('8a55df8c-007b-47b4-b248-0a724bfcc610', 'ECON', 'Economics & Management', 'bg-green-500', 2),
  ('8a55df8c-007b-47b4-b248-0a724bfcc610', 'SKILLS', 'Transferable Skills', 'bg-purple-500', 3)
ON CONFLICT DO NOTHING;