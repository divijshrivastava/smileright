-- ========================================
-- Blog: Add Main Image Support
-- ========================================

-- Add main_image_url and alt_text columns to blogs table
ALTER TABLE public.blogs
  ADD COLUMN main_image_url TEXT,
  ADD COLUMN main_image_alt_text TEXT;

-- Add constraint for image URL length
ALTER TABLE public.blogs
  ADD CONSTRAINT blogs_main_image_url_length CHECK (main_image_url IS NULL OR length(main_image_url) <= 2000),
  ADD CONSTRAINT blogs_main_image_alt_text_length CHECK (main_image_alt_text IS NULL OR length(main_image_alt_text) <= 200);

-- Add index for efficient queries
CREATE INDEX idx_blogs_main_image ON public.blogs(main_image_url) WHERE main_image_url IS NOT NULL;
