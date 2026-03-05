-- Secure assignment-submissions bucket with per-user access policies
DROP POLICY IF EXISTS "Users can upload their own assignments" ON storage.objects;
CREATE POLICY "Users can upload their own assignments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assignment-submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can view their own assignments" ON storage.objects;
CREATE POLICY "Users can view their own assignments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'assignment-submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete their own assignments" ON storage.objects;
CREATE POLICY "Users can delete their own assignments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'assignment-submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
);