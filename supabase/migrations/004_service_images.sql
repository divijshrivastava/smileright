-- ========================================
-- Service Images - Multiple Images per Service
-- ========================================

-- 1. Service Images table
CREATE TABLE public.service_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.service_images ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies for service_images

-- Public: anyone can read images for published services
CREATE POLICY "Public can read images for published services"
  ON public.service_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.services 
      WHERE services.id = service_images.service_id 
      AND services.is_published = true
    )
  );

-- Authenticated admin/editor: can read ALL service images
CREATE POLICY "Authenticated staff can read all service images"
  ON public.service_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Insert: admin/editor
CREATE POLICY "Staff can insert service images"
  ON public.service_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Update: admin/editor
CREATE POLICY "Staff can update service images"
  ON public.service_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Delete: admin only
CREATE POLICY "Only admin can delete service images"
  ON public.service_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 3. Updated_at trigger for service_images
CREATE TRIGGER service_images_updated_at
  BEFORE UPDATE ON public.service_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 4. Create index for better query performance
CREATE INDEX idx_service_images_service_id ON public.service_images(service_id);
CREATE INDEX idx_service_images_display_order ON public.service_images(service_id, display_order);

-- 5. Migrate existing service images to service_images table
-- Keep the main image_url in services table as the primary/thumbnail image
INSERT INTO public.service_images (service_id, image_url, alt_text, display_order, created_by, updated_by)
SELECT id, image_url, alt_text, 1, created_by, updated_by
FROM public.services;
