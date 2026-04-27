/*
  # Create site settings table and video storage bucket

  1. New Tables
    - `site_settings`
      - `id` (integer, primary key, default 1) - singleton pattern
      - `hero_video_url` (text) - URL of the hero video
      - `updated_at` (timestamptz) - last update timestamp

  2. Security
    - Enable RLS on `site_settings` table
    - Public read access for site_settings (anyone can view)
    - Only authenticated users can update site_settings

  3. Storage
    - Create `videos` storage bucket for video uploads
    - Public read access for videos bucket
    - Only authenticated users can upload to videos bucket

  4. Important Notes
    1. The site_settings table uses a singleton pattern (only one row)
    2. An initial row is inserted with empty video_url
    3. The videos bucket is created for storing hero video files
*/

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_video_url text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- Insert default row
INSERT INTO site_settings (id, hero_video_url) VALUES (1, '')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT
  TO authenticated, anon
  USING (true);

-- Authenticated update policy
CREATE POLICY "Authenticated users can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated insert policy
CREATE POLICY "Authenticated users can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create videos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: anyone can view videos
CREATE POLICY "Public read access for videos"
  ON storage.objects FOR SELECT
  TO authenticated, anon
  USING (bucket_id = 'videos');

-- Storage policy: authenticated users can upload videos
CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'videos');

-- Storage policy: authenticated users can delete videos
CREATE POLICY "Authenticated users can delete videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'videos');
