-- ========================================
-- Smile Right: Initial Schema
-- ========================================

-- 1. Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'editor',
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS: users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Profiles RLS: only the user can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- 5. Testimonials table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  alt_text TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 6. Testimonials RLS Policies

-- Public: anyone can read published testimonials
CREATE POLICY "Public can read published testimonials"
  ON public.testimonials FOR SELECT
  USING (is_published = true);

-- Authenticated admin/editor: can read ALL testimonials
CREATE POLICY "Authenticated staff can read all testimonials"
  ON public.testimonials FOR SELECT
  TO authenticated
  USING (public.get_user_role() IN ('admin', 'editor'));

-- Insert: admin/editor
CREATE POLICY "Staff can insert testimonials"
  ON public.testimonials FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

-- Update: admin/editor
CREATE POLICY "Staff can update testimonials"
  ON public.testimonials FOR UPDATE
  TO authenticated
  USING (public.get_user_role() IN ('admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

-- Delete: admin only
CREATE POLICY "Only admin can delete testimonials"
  ON public.testimonials FOR DELETE
  TO authenticated
  USING (public.get_user_role() = 'admin');

-- 7. Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 8. Storage bucket for testimonial images
-- Note: Run this in the Supabase Dashboard SQL editor, or create the bucket via Dashboard UI:
--   Bucket name: testimonial-images
--   Public: true
--   Allowed MIME types: image/jpeg, image/png, image/webp
--   File size limit: 5MB

-- Storage RLS policies (applied after bucket creation):
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'testimonial-images',
--   'testimonial-images',
--   true,
--   5242880,
--   ARRAY['image/jpeg', 'image/png', 'image/webp']
-- );
