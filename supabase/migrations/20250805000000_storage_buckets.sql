-- Migration to create storage bucket for parking lot images
INSERT INTO storage.buckets (id, name, public)
VALUES ('parking-lot-images', 'parking-lot-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'parking-lot-images' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'parking-lot-images' );

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'parking-lot-images' AND auth.uid() = owner );
