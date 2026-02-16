-- ========================================
-- Contact Messages
-- ========================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_contact TEXT NOT NULL DEFAULT 'email',
  service_interest TEXT,
  appointment_preference TEXT,
  message TEXT NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new',
  source_page TEXT,
  form_location TEXT,
  landing_page TEXT,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  gclid TEXT,
  fbclid TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  viewed_at TIMESTAMPTZ
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Public/anonymous users can submit contact forms.
CREATE POLICY "Public can insert contact messages"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated staff can view messages in admin.
CREATE POLICY "Staff can read contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (public.get_user_role() IN ('admin', 'editor', 'viewer'));

-- Admins and editors can update message status if needed.
CREATE POLICY "Staff can update contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (public.get_user_role() IN ('admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

-- Constraints for input quality and abuse resistance.
ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_name_length CHECK (length(name) BETWEEN 2 AND 150),
  ADD CONSTRAINT contact_messages_email_length CHECK (length(email) BETWEEN 5 AND 320),
  ADD CONSTRAINT contact_messages_phone_length CHECK (phone IS NULL OR length(phone) <= 30),
  ADD CONSTRAINT contact_messages_message_length CHECK (length(message) BETWEEN 10 AND 5000),
  ADD CONSTRAINT contact_messages_status_valid CHECK (status IN ('new', 'read', 'resolved', 'spam')),
  ADD CONSTRAINT contact_messages_preferred_contact_valid CHECK (preferred_contact IN ('email', 'phone', 'whatsapp'));

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status
  ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email
  ON public.contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_service_interest
  ON public.contact_messages(service_interest);

CREATE TRIGGER contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
