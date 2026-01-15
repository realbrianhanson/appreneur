-- Add missing columns to testimonials table
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS app_name text,
ADD COLUMN IF NOT EXISTS app_screenshot_url text,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Create storage bucket for app screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-screenshots', 'app-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload screenshots
CREATE POLICY "Users can upload screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'app-screenshots' 
  AND auth.uid() IS NOT NULL
);

-- Allow public read access to screenshots
CREATE POLICY "Screenshots are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'app-screenshots');

-- Allow users to update their own screenshots
CREATE POLICY "Users can update own screenshots"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'app-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own screenshots
CREATE POLICY "Users can delete own screenshots"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'app-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);