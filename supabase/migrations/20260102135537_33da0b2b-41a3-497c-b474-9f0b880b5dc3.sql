-- Drop existing INSERT policy for university_media
DROP POLICY IF EXISTS "Authenticated users can upload media" ON university_media;

-- Create a proper INSERT policy that checks uploaded_by matches auth.uid()
CREATE POLICY "Authenticated users can upload media" 
ON university_media 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);