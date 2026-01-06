-- Tighten RLS for course_reviews so users can only update/delete their own reviews

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.course_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.course_reviews;

CREATE POLICY "Users can update their own reviews"
ON public.course_reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.course_reviews
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- Prevent public access to private user documents in Storage

DROP POLICY IF EXISTS "Public can view user documents" ON storage.objects;

UPDATE storage.buckets
SET public = false
WHERE id = 'user-documents';
