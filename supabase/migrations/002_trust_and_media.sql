-- ========================================
-- Trust Section Images & Testimonial Media Support
-- ========================================

-- 1. Trust Images table for admin-managed carousel
CREATE TABLE public.trust_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.trust_images ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read published trust images
CREATE POLICY "Public can read published trust images"
  ON public.trust_images FOR SELECT
  USING (is_published = true);

-- Authenticated admin/editor: can read ALL trust images
CREATE POLICY "Authenticated staff can read all trust images"
  ON public.trust_images FOR SELECT
  TO authenticated
  USING (public.get_user_role() IN ('admin', 'editor'));

-- Insert: admin/editor
CREATE POLICY "Staff can insert trust images"
  ON public.trust_images FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

-- Update: admin/editor
CREATE POLICY "Staff can update trust images"
  ON public.trust_images FOR UPDATE
  TO authenticated
  USING (public.get_user_role() IN ('admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

-- Delete: admin only
CREATE POLICY "Only admin can delete trust images"
  ON public.trust_images FOR DELETE
  TO authenticated
  USING (public.get_user_role() = 'admin');

-- Updated_at trigger for trust_images
CREATE TRIGGER trust_images_updated_at
  BEFORE UPDATE ON public.trust_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 2. Add video support to testimonials
ALTER TABLE public.testimonials 
  ADD COLUMN video_url TEXT,
  ADD COLUMN media_type TEXT DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'video', 'image_text', 'video_text'));

-- 3. Storage buckets
-- Note: Create these buckets in Supabase Dashboard:
--   Bucket: trust-images (public, 5MB limit, image types)
--   Bucket: testimonial-videos (public, 50MB limit, video types)
--
-- Or run via SQL:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES 
--   ('trust-images', 'trust-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
--   ('testimonial-videos', 'testimonial-videos', true, 52428800, ARRAY['video/mp4', 'video/quicktime', 'video/webm']);
