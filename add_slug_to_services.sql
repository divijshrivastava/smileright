-- Instructions: Run this SQL in your Supabase Dashboard SQL Editor
-- Go to: https://supabase.com/dashboard/project/yqkkppvrneackgaxjfzz/sql/new

-- Add slug column to services table
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS services_slug_idx ON public.services(slug);

-- Generate slugs for existing services based on their titles
UPDATE public.services SET slug = 
  CASE title
    WHEN 'Root Canal' THEN 'root-canal-treatment'
    WHEN 'Dental Implants' THEN 'dental-implants'
    WHEN 'Braces' THEN 'braces-and-orthodontics'
    WHEN 'Tooth Whitening' THEN 'teeth-whitening'
    WHEN 'Cosmetic Dentistry' THEN 'cosmetic-dentistry'
    WHEN 'Crown & Bridge' THEN 'crown-and-bridge'
    WHEN 'Kids Dentistry' THEN 'kids-dentistry'
    WHEN 'Fillings' THEN 'dental-fillings'
    WHEN 'Gum Treatment' THEN 'gum-treatment'
    WHEN 'Dentures' THEN 'dentures'
    WHEN 'Extraction' THEN 'tooth-extraction'
    ELSE lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'))
  END
WHERE slug IS NULL;

-- Make slug NOT NULL after populating existing rows
ALTER TABLE public.services ALTER COLUMN slug SET NOT NULL;
