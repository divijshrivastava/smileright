-- ========================================
-- Add is_primary field to service_images
-- ========================================

-- 1. Add is_primary column to service_images
ALTER TABLE public.service_images 
ADD COLUMN is_primary BOOLEAN NOT NULL DEFAULT false;

-- 2. Create a unique partial index to ensure only one primary image per service
CREATE UNIQUE INDEX idx_service_images_primary 
ON public.service_images(service_id) 
WHERE is_primary = true;

-- 3. For each service, mark the first image (by display_order) as primary
-- This ensures backward compatibility with existing data
UPDATE public.service_images si
SET is_primary = true
WHERE si.id IN (
  SELECT DISTINCT ON (service_id) id
  FROM public.service_images
  ORDER BY service_id, display_order ASC, created_at ASC
);

-- 4. Comment for documentation
COMMENT ON COLUMN public.service_images.is_primary IS 
'Indicates if this image is the primary/thumbnail image for the service. Only one image per service can be primary.';
