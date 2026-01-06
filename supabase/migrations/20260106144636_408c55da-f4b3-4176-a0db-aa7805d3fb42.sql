-- Create policy to allow public read access to program_logos bucket
CREATE POLICY "Program logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'program_logos');

-- Also ensure the bucket is set to public
UPDATE storage.buckets
SET public = true
WHERE id = 'program_logos';