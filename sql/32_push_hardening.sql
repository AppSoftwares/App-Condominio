-- MIGRACIÓN 32: SECURITY HARDENING PARA NOTIFICACIONES PUSH Y TOKENS

-- 1. Hardening de rpc_send_push para restringir ejecución a admin, superadmin o guard (y llamadas internas seguras)
CREATE OR REPLACE FUNCTION public.rpc_send_push(
  p_token text,
  p_title text,
  p_body text,
  p_data jsonb DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Si es llamado por un usuario autenticado directo, verificar rol autorizado
  IF auth.uid() IS NOT NULL THEN
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
    IF v_role NOT IN ('admin', 'superadmin', 'guard') THEN
      RAISE EXCEPTION 'Acceso denegado: Privilegios insuficientes para enviar notificaciones push';
    END IF;
  END IF;

  -- Validaciones de seguridad de los campos
  IF p_token IS NULL OR length(trim(p_token)) < 10 THEN
    RAISE EXCEPTION 'Token FCM inválido o ausente';
  END IF;
  IF length(p_title) > 100 THEN
    RAISE EXCEPTION 'El título de la notificación excede el límite permitido';
  END IF;
  IF length(p_body) > 300 THEN
    RAISE EXCEPTION 'El cuerpo de la notificación excede el límite permitido';
  END IF;

  INSERT INTO public.push_notifications (token, title, body, data, status)
  VALUES (trim(p_token), p_title, p_body, p_data, 'pending');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rpc_send_push FROM public, anon;
GRANT EXECUTE ON FUNCTION public.rpc_send_push TO authenticated;

-- 2. Políticas RLS para la protección de tokens FCM en profiles
DROP POLICY IF EXISTS "Users can update own fcm_token" ON public.profiles;
CREATE POLICY "Users can update own fcm_token" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Asegurar que push_notifications permanezca cerrado a acceso directo de residentes
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "internal_deny_all" ON public.push_notifications;
CREATE POLICY "internal_deny_all" ON public.push_notifications FOR ALL USING (false);
