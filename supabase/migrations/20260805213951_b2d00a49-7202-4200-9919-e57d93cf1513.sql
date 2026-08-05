-- Allow public access to read objects in devotional-assets
CREATE POLICY "Allow public select for devotional-assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'devotional-assets');

-- Allow admins to upload/update/delete objects in devotional-assets
CREATE POLICY "Allow admin upload for devotional-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'devotional-assets' AND 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Allow admin update for devotional-assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'devotional-assets' AND 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Allow admin delete for devotional-assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'devotional-assets' AND 
  public.has_role(auth.uid(), 'admin')
);
