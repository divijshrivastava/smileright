-- ========================================
-- Security Enhancements Migration
-- Adds audit logging and storage policies
-- ========================================

-- 1. Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for faster queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Only admins can read audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'admin');

-- System can insert audit logs (via service role)
-- Note: Inserts will be done via server-side code with proper authentication

-- 2. Storage bucket policies for testimonial-images
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload testimonial images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'testimonial-images' 
    AND public.get_user_role() IN ('admin', 'editor')
  );

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update testimonial images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'testimonial-images'
    AND public.get_user_role() IN ('admin', 'editor')
  );

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete testimonial images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'testimonial-images'
    AND public.get_user_role() IN ('admin', 'editor')
  );

-- Allow public read access
CREATE POLICY "Public can view testimonial images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'testimonial-images');

-- 3. Storage bucket policies for trust-images
CREATE POLICY "Authenticated users can upload trust images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'trust-images'
    AND public.get_user_role() IN ('admin', 'editor')
  );

CREATE POLICY "Authenticated users can update trust images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'trust-images'
    AND public.get_user_role() IN ('admin', 'editor')
  );

CREATE POLICY "Authenticated users can delete trust images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'trust-images'
    AND public.get_user_role() IN ('admin', 'editor')
  );

CREATE POLICY "Public can view trust images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'trust-images');

-- 4. Storage bucket policies for testimonial-videos
CREATE POLICY "Authenticated users can upload testimonial videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'testimonial-videos'
    AND public.get_user_role() IN ('admin', 'editor')
  );

CREATE POLICY "Authenticated users can update testimonial videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'testimonial-videos'
    AND public.get_user_role() IN ('admin', 'editor')
  );

CREATE POLICY "Authenticated users can delete testimonial videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'testimonial-videos'
    AND public.get_user_role() IN ('admin', 'editor')
  );

CREATE POLICY "Public can view testimonial videos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'testimonial-videos');

-- 5. Add function to clean old audit logs (optional, run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 6. Add indexes for better performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_testimonials_is_published ON public.testimonials(is_published);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON public.testimonials(display_order);
CREATE INDEX IF NOT EXISTS idx_services_is_published ON public.services(is_published);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON public.services(display_order);
CREATE INDEX IF NOT EXISTS idx_trust_images_is_published ON public.trust_images(is_published);
CREATE INDEX IF NOT EXISTS idx_trust_images_display_order ON public.trust_images(display_order);

-- 7. Add constraint to prevent extremely long text inputs (DoS protection)
ALTER TABLE public.testimonials 
  ADD CONSTRAINT testimonials_name_length CHECK (length(name) <= 200),
  ADD CONSTRAINT testimonials_description_length CHECK (length(description) <= 5000);

ALTER TABLE public.services
  ADD CONSTRAINT services_title_length CHECK (length(title) <= 300),
  ADD CONSTRAINT services_description_length CHECK (length(description) <= 10000);

ALTER TABLE public.trust_images
  ADD CONSTRAINT trust_images_caption_length CHECK (caption IS NULL OR length(caption) <= 500);
