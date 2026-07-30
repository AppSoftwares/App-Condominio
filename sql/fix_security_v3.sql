-- 1. FUNCIÓN DE SEGURIDAD (SECURITY DEFINER) para evitar recursión en RLS
CREATE OR REPLACE FUNCTION public.has_role(role_name text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = ANY(role_name)
  );
END;
$$;

-- 2. REPARAR POLÍTICAS DE SEGURIDAD PARA ALERTAS
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "All can view security alerts" ON public.security_alerts;
CREATE POLICY "All can view security alerts" ON public.security_alerts
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Guards/Admins can create alerts" ON public.security_alerts;
CREATE POLICY "Guards/Admins can create alerts" ON public.security_alerts
FOR INSERT TO authenticated WITH CHECK ( public.has_role(ARRAY['guard', 'admin', 'superadmin']) );

-- 3. REPARAR POLÍTICAS PARA VOTACIONES
DROP POLICY IF EXISTS "Admins can manage votings" ON public.internal_votings;
CREATE POLICY "Admins can manage votings" ON public.internal_votings
FOR ALL TO authenticated
USING ( public.has_role(ARRAY['admin', 'superadmin']) )
WITH CHECK ( public.has_role(ARRAY['admin', 'superadmin']) );

DROP POLICY IF EXISTS "Votings viewable by all" ON public.internal_votings;
CREATE POLICY "Votings viewable by all" ON public.internal_votings
FOR SELECT TO authenticated USING (true);

-- 4. REPARAR REGISTROS MANUALES
ALTER TABLE public.manual_access_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Guards can manage manual logs" ON public.manual_access_logs;
CREATE POLICY "Guards can manage manual logs" ON public.manual_access_logs
FOR ALL TO authenticated USING ( public.has_role(ARRAY['guard', 'admin', 'superadmin']) );

-- 5. REPARAR INCIDENCIAS (Quejas)
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Incidents access" ON public.incidents;
CREATE POLICY "Incidents access" ON public.incidents
FOR ALL TO authenticated
USING (
  profile_id = auth.uid() OR public.has_role(ARRAY['guard', 'admin', 'superadmin'])
);

-- 6. RPC PARA NOTIFICACIÓN PUSH (Si no existe)
CREATE OR REPLACE FUNCTION public.rpc_queue_notification(
  p_token text,
  p_title text,
  p_body text,
  p_data jsonb DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notification_queue (token, title, body, data)
  VALUES (p_token, p_title, p_body, p_data);
END;
$$;
