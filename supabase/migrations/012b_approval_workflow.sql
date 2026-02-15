-- ========================================
-- Step 2: Approval Workflow & Viewer Policies
-- ========================================
-- Requires: 012a_add_viewer_role.sql must be committed first
--
-- Admin:  can make changes that are instantly published
-- Editor: can make changes, but they need admin approval to go live
-- Viewer: can view admin dashboard, but cannot make any changes

-- 1. Create pending_changes table for approval workflow
-- When an editor creates/updates content, a pending_changes record is created
-- An admin can then approve or reject the change
CREATE TABLE IF NOT EXISTS public.pending_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What resource is being changed
  resource_type TEXT NOT NULL,            -- 'testimonial', 'service', 'trust_image', 'blog'
  resource_id UUID,                       -- NULL for new records (create), filled for update
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'publish', 'unpublish', 'set_primary')),

  -- The full payload to apply when approved
  payload JSONB NOT NULL,

  -- Workflow state
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Who submitted and who reviewed
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_note TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK to profiles so PostgREST can join pending_changes -> profiles
ALTER TABLE public.pending_changes
  ADD CONSTRAINT pending_changes_submitted_by_profile_fkey
  FOREIGN KEY (submitted_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.pending_changes
  ADD CONSTRAINT pending_changes_reviewed_by_profile_fkey
  FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.pending_changes ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pending_changes_status ON public.pending_changes(status);
CREATE INDEX IF NOT EXISTS idx_pending_changes_resource ON public.pending_changes(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_pending_changes_submitted_by ON public.pending_changes(submitted_by);
CREATE INDEX IF NOT EXISTS idx_pending_changes_created_at ON public.pending_changes(created_at DESC);

-- Updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'pending_changes_updated_at'
  ) THEN
    CREATE TRIGGER pending_changes_updated_at
      BEFORE UPDATE ON public.pending_changes
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- 2. RLS Policies for pending_changes

-- Admins can see all pending changes
CREATE POLICY "Admins can read all pending changes"
  ON public.pending_changes FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'admin');

-- Editors can see their own pending changes
CREATE POLICY "Editors can read own pending changes"
  ON public.pending_changes FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() = 'editor' 
    AND submitted_by = auth.uid()
  );

-- Editors can insert pending changes
CREATE POLICY "Editors can insert pending changes"
  ON public.pending_changes FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role() = 'editor'
    AND submitted_by = auth.uid()
  );

-- Admins can update pending changes (to approve/reject)
CREATE POLICY "Admins can update pending changes"
  ON public.pending_changes FOR UPDATE
  TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- Admins can also insert pending changes (if they want to use the same workflow)
CREATE POLICY "Admins can insert pending changes"
  ON public.pending_changes FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() = 'admin');

-- Admins can delete pending changes
CREATE POLICY "Admins can delete pending changes"
  ON public.pending_changes FOR DELETE
  TO authenticated
  USING (public.get_user_role() = 'admin');

-- 3. Update profiles RLS to allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'admin');

-- 4. Update content table RLS: allow viewers to read all content

-- Testimonials: add viewer read access
CREATE POLICY "Viewers can read all testimonials"
  ON public.testimonials FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'viewer');

-- Services: add viewer read access
CREATE POLICY "Viewers can read all services"
  ON public.services FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'viewer');

-- Trust Images: add viewer read access  
CREATE POLICY "Viewers can read all trust images"
  ON public.trust_images FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'viewer');

-- Blogs: add viewer read access
CREATE POLICY "Viewers can read all blogs"
  ON public.blogs FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'viewer');

-- 5. Ensure get_user_role function is up to date
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;
