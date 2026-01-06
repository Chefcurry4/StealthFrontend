-- Ensure Program_logos bucket is public and readable
-- NOTE: Bucket IDs are case-sensitive.

DO $$
BEGIN
  -- Make bucket public (if it exists)
  UPDATE storage.buckets
  SET public = true
  WHERE id = 'Program_logos';
EXCEPTION WHEN undefined_table THEN
  -- In case storage schema isn't available in this environment
  NULL;
END $$;

-- Allow public read of objects in Program_logos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Program logos are publicly accessible (Program_logos)'
  ) THEN
    CREATE POLICY "Program logos are publicly accessible (Program_logos)"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'Program_logos');
  END IF;
END $$;