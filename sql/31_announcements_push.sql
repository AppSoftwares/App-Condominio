-- MIGRACIÓN 31: ANUNCIOS Y NOTIFICACIONES PUSH AVANZADAS

-- 1. Ampliar tabla announcements
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS metadata JSONB,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS push_recipients INT DEFAULT 0;

-- 2. Función RPC para publicar anuncios y encolar push de forma idempotente y segura
CREATE OR REPLACE FUNCTION public.rpc_publish_announcement(
  p_titulo TEXT,
  p_mensaje TEXT,
  p_tipo TEXT DEFAULT 'general',
  p_cluster TEXT DEFAULT NULL,
  p_push_title TEXT DEFAULT NULL,
  p_push_body TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_send_push BOOLEAN DEFAULT TRUE,
  p_test_only BOOLEAN DEFAULT FALSE
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_user_cluster TEXT;
  v_announcement_id UUID;
  v_recipient_count INT := 0;
  v_admin_token TEXT;
  r RECORD;
BEGIN
  -- Verificar autenticación
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  -- Obtener rol y cluster del usuario actual
  SELECT role, residential_cluster INTO v_role, v_user_cluster
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_role NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'Acceso denegado: Se requiere rol de administrador o superadmin';
  END IF;

  -- Validación de cluster para administradores regulares
  IF v_role = 'admin' AND p_cluster IS NOT NULL AND p_cluster != 'general' AND p_cluster != v_user_cluster THEN
    RAISE EXCEPTION 'Acceso denegado: No puede publicar en un conjunto residencial diferente al suyo';
  END IF;

  -- Validaciones de longitud
  IF length(p_titulo) > 150 THEN
    RAISE EXCEPTION 'El título no puede exceder los 150 caracteres';
  END IF;
  IF length(p_mensaje) > 2000 THEN
    RAISE EXCEPTION 'El mensaje no puede exceder los 2000 caracteres';
  END IF;
  IF p_push_title IS NOT NULL AND length(p_push_title) > 60 THEN
    RAISE EXCEPTION 'El título de push no puede exceder los 60 caracteres';
  END IF;
  IF p_push_body IS NOT NULL AND length(p_push_body) > 160 THEN
    RAISE EXCEPTION 'El cuerpo de push no puede exceder los 160 caracteres';
  END IF;

  -- Anti-rebounce (60 segundos)
  IF EXISTS (
    SELECT 1 FROM public.announcements
    WHERE created_by = auth.uid()
      AND titulo = p_titulo
      AND fecha_creacion > NOW() - INTERVAL '60 seconds'
  ) THEN
    RAISE EXCEPTION 'Anti-rebounce: Por favor espere 60 segundos antes de publicar un comunicado similar';
  END IF;

  -- Insertar anuncio
  INSERT INTO public.announcements (
    titulo, mensaje, tipo, residential_cluster, metadata, created_by, push_recipients, fecha_creacion
  ) VALUES (
    p_titulo, p_mensaje, COALESCE(p_tipo, 'general'), p_cluster, p_metadata, auth.uid(), 0, NOW()
  ) RETURNING id INTO v_announcement_id;

  -- Encolar notificaciones Push
  IF p_send_push THEN
    IF p_test_only THEN
      -- Enviar solo al token del admin que prueba
      SELECT fcm_token INTO v_admin_token
      FROM public.profiles
      WHERE id = auth.uid();

      IF v_admin_token IS NOT NULL AND v_admin_token != '' THEN
        PERFORM public.rpc_send_push(
          v_admin_token,
          COALESCE(p_push_title, '[PRUEBA] ' || p_titulo),
          COALESCE(p_push_body, left(p_mensaje, 100)),
          json_build_object(
            'route', '/requests',
            'announcement_id', v_announcement_id::text,
            'test_mode', true
          )::jsonb
        );
        v_recipient_count := 1;
      END IF;
    ELSE
      -- Envío masivo a residentes del cluster con token FCM válido
      FOR r IN
        SELECT fcm_token FROM public.profiles
        WHERE fcm_token IS NOT NULL
          AND fcm_token != ''
          AND (
            p_cluster IS NULL
            OR p_cluster = 'general'
            or residential_cluster = p_cluster
          )
      LOOP
        PERFORM public.rpc_send_push(
          r.fcm_token,
          COALESCE(p_push_title, p_titulo),
          COALESCE(p_push_body, left(p_mensaje, 100)),
          json_build_object(
            'route', '/requests',
            'announcement_id', v_announcement_id::text,
            'cluster', p_cluster
          )::jsonb
        );
        v_recipient_count := v_recipient_count + 1;
      END LOOP;
    END IF;

    -- Actualizar contador de destinatarios push
    UPDATE public.announcements
    SET push_recipients = v_recipient_count
    WHERE id = v_announcement_id;
  END IF;

  RETURN json_build_object(
    'success', true,
    'announcement_id', v_announcement_id,
    'push_recipients', v_recipient_count
  )::jsonb;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rpc_publish_announcement FROM public, anon;
GRANT EXECUTE ON FUNCTION public.rpc_publish_announcement TO authenticated;
