-- ========================================
-- Featured Services Management
-- ========================================

-- 1. Services table for admin-managed featured services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies for services

-- Public: anyone can read published services
CREATE POLICY "Public can read published services"
  ON public.services FOR SELECT
  USING (is_published = true);

-- Authenticated admin/editor: can read ALL services
CREATE POLICY "Authenticated staff can read all services"
  ON public.services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Insert: admin/editor
CREATE POLICY "Staff can insert services"
  ON public.services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Update: admin/editor
CREATE POLICY "Staff can update services"
  ON public.services FOR UPDATE
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
CREATE POLICY "Only admin can delete services"
  ON public.services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 3. Updated_at trigger for services
CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 4. Seed with existing services data
INSERT INTO public.services (title, description, image_url, alt_text, display_order, is_published) VALUES
  ('Root Canal', 'Advanced endodontic therapy to save natural teeth and eliminate pain.', '/images/6572DD12-6B71-45CD-BB10-2A62D2F6FA98.JPG', 'Root Canal Treatment', 1, true),
  ('Dental Implants', 'Permanent solutions for missing teeth with cutting-edge implant technology.', '/images/a01cc978-36e0-491b-87ee-9ebcd8d4617d.JPG', 'Dental Implants', 2, true),
  ('Braces', 'Traditional and invisible braces for perfectly aligned smiles.', '/images/80d2dae8-ec12-41ea-b93f-1e73fcb4ba38.jpg', 'Braces & Orthodontics', 3, true),
  ('Tooth Whitening', 'Professional whitening treatments for a radiant, confident smile.', '/images/PHOTO-2025-12-27-16-54-33.jpg', 'Teeth Whitening', 4, true),
  ('Cosmetic Dentistry', 'Transformative aesthetic procedures to enhance your smile''s beauty.', '/images/6572DD12-6B71-45CD-BB10-2A62D2F6FA98.JPG', 'Cosmetic Dentistry', 5, true),
  ('Crown & Bridge', 'Durable restorations to rebuild and replace damaged or missing teeth.', '/images/a01cc978-36e0-491b-87ee-9ebcd8d4617d.JPG', 'Crown & Bridge', 6, true),
  ('Kids Dentistry', 'Gentle, specialized care for children in a fun, friendly setting.', '/images/80d2dae8-ec12-41ea-b93f-1e73fcb4ba38.jpg', 'Pediatric Dentistry', 7, true),
  ('Fillings', 'Tooth-colored composite fillings for natural-looking cavity repair.', '/images/PHOTO-2025-12-27-16-54-33.jpg', 'Dental Fillings', 8, true),
  ('Gum Treatment', 'Periodontal therapy to maintain healthy gums and prevent disease.', '/images/6572DD12-6B71-45CD-BB10-2A62D2F6FA98.JPG', 'Gum Treatment', 9, true),
  ('Dentures', 'Custom complete and partial dentures for functional, beautiful smiles.', '/images/a01cc978-36e0-491b-87ee-9ebcd8d4617d.JPG', 'Dentures', 10, true),
  ('Extraction', 'Safe, painless tooth removal with comprehensive aftercare support.', '/images/80d2dae8-ec12-41ea-b93f-1e73fcb4ba38.jpg', 'Tooth Extraction', 11, true);
