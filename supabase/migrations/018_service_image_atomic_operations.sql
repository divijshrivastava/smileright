-- Atomic operations for service image primary/delete flows.
-- Prevents inconsistent state when multi-step updates partially fail.

CREATE OR REPLACE FUNCTION public.set_service_image_primary_atomic(
  p_service_id UUID,
  p_image_id UUID,
  p_actor UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_image RECORD;
BEGIN
  v_role := public.get_user_role();
  IF v_role NOT IN ('admin', 'editor') THEN
    RAISE EXCEPTION 'Insufficient permissions to set primary image';
  END IF;

  SELECT id, service_id, image_url, COALESCE(alt_text, '') AS alt_text
  INTO v_image
  FROM public.service_images
  WHERE id = p_image_id
    AND service_id = p_service_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Image not found for this service';
  END IF;

  UPDATE public.service_images
  SET is_primary = false,
      updated_by = p_actor
  WHERE service_id = p_service_id
    AND is_primary = true;

  UPDATE public.service_images
  SET is_primary = true,
      updated_by = p_actor
  WHERE id = p_image_id;

  UPDATE public.services
  SET image_url = v_image.image_url,
      alt_text = v_image.alt_text,
      updated_by = p_actor
  WHERE id = p_service_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_service_image_atomic(
  p_image_id UUID,
  p_actor UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_deleted RECORD;
  v_next RECORD;
BEGIN
  v_role := public.get_user_role();
  IF v_role <> 'admin' THEN
    RAISE EXCEPTION 'Only admins can delete service images';
  END IF;

  DELETE FROM public.service_images
  WHERE id = p_image_id
  RETURNING service_id, is_primary
  INTO v_deleted;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Image not found';
  END IF;

  IF v_deleted.is_primary THEN
    SELECT id, image_url, COALESCE(alt_text, '') AS alt_text
    INTO v_next
    FROM public.service_images
    WHERE service_id = v_deleted.service_id
    ORDER BY display_order ASC, created_at ASC
    LIMIT 1;

    IF FOUND THEN
      UPDATE public.service_images
      SET is_primary = true,
          updated_by = p_actor
      WHERE id = v_next.id;

      UPDATE public.services
      SET image_url = v_next.image_url,
          alt_text = v_next.alt_text,
          updated_by = p_actor
      WHERE id = v_deleted.service_id;
    ELSE
      UPDATE public.services
      SET image_url = '',
          alt_text = '',
          updated_by = p_actor
      WHERE id = v_deleted.service_id;
    END IF;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_service_image_primary_atomic(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_service_image_atomic(UUID, UUID) TO authenticated;
