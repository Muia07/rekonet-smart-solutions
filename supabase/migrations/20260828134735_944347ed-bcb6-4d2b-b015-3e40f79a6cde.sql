-- Public read access for app-downloads bucket
CREATE POLICY "Public can read app-downloads"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'app-downloads');

-- Authenticated users can upload files to app-downloads bucket
CREATE POLICY "Authenticated can insert app-downloads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'app-downloads');

-- Authenticated users can update files in app-downloads bucket
CREATE POLICY "Authenticated can update app-downloads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'app-downloads')
WITH CHECK (bucket_id = 'app-downloads');

-- Authenticated users can delete files from app-downloads bucket
CREATE POLICY "Authenticated can delete app-downloads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'app-downloads');