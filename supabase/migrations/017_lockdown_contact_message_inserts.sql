-- Lock down direct public writes to contact_messages.
-- Contact submissions should be accepted only via the server API route,
-- which uses the service role key and enforces validation + rate limiting.

DROP POLICY IF EXISTS "Public can insert contact messages" ON public.contact_messages;

CREATE POLICY "Staff can insert contact messages"
  ON public.contact_messages FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'editor'));
