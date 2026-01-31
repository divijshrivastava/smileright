-- ========================================
-- Blog: Posts (Rich Content)
-- ========================================

-- 1. Blogs table
CREATE TABLE public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content_html TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies

-- Public: anyone can read published blogs
CREATE POLICY "Public can read published blogs"
  ON public.blogs FOR SELECT
  USING (is_published = true);

-- Authenticated admin/editor: can read ALL blogs
CREATE POLICY "Authenticated staff can read all blogs"
  ON public.blogs FOR SELECT
  TO authenticated
  USING (public.get_user_role() IN ('admin', 'editor'));

-- Insert: admin/editor
CREATE POLICY "Staff can insert blogs"
  ON public.blogs FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

-- Update: admin/editor
CREATE POLICY "Staff can update blogs"
  ON public.blogs FOR UPDATE
  TO authenticated
  USING (public.get_user_role() IN ('admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

-- Delete: admin only
CREATE POLICY "Only admin can delete blogs"
  ON public.blogs FOR DELETE
  TO authenticated
  USING (public.get_user_role() = 'admin');

-- 3. Updated_at trigger
CREATE TRIGGER blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 4. Indexes
CREATE INDEX idx_blogs_is_published ON public.blogs(is_published);
CREATE INDEX idx_blogs_published_at ON public.blogs(published_at DESC);
CREATE INDEX idx_blogs_display_order ON public.blogs(display_order);

-- 5. Constraints (DoS / sanity)
ALTER TABLE public.blogs
  ADD CONSTRAINT blogs_title_length CHECK (length(title) <= 300),
  ADD CONSTRAINT blogs_slug_length CHECK (length(slug) <= 200),
  ADD CONSTRAINT blogs_excerpt_length CHECK (excerpt IS NULL OR length(excerpt) <= 2000),
  ADD CONSTRAINT blogs_content_length CHECK (length(content_html) <= 200000);

-- 6. Storage bucket: blog-media
-- Note: Create this bucket in Supabase Dashboard:
--   Bucket: blog-media (public)
--   Recommended limits:
--     - images up to 5MB, videos up to 50MB
--
-- Optional via SQL (requires privileges):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('blog-media', 'blog-media', true);

-- Storage bucket policies (requires RLS enabled in storage schema)
-- Allow authenticated admin/editor to upload/update/delete; public read
CREATE POLICY "Authenticated users can upload blog media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog-media'
    AND public.get_user_role() IN ('admin', 'editor')
  );

CREATE POLICY "Authenticated users can update blog media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'blog-media'
    AND public.get_user_role() IN ('admin', 'editor')
  );

CREATE POLICY "Authenticated users can delete blog media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'blog-media'
    AND public.get_user_role() IN ('admin', 'editor')
  );

CREATE POLICY "Public can view blog media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'blog-media');
