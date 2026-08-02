-- 1. PERMITIR QUE RESIDENTES VEAN INFO BÁSICA DE OTROS (Para Reservas e Incidencias)
-- Esto soluciona que las reservas "desaparezcan" o no muestren el nombre del vecino
DROP POLICY IF EXISTS "Profiles basic access" ON public.profiles;
CREATE POLICY "Profiles basic access" ON public.profiles
FOR SELECT TO authenticated
USING (
  -- Pueden ver su propio perfil completo
  auth.uid() = id
  OR
  -- Pueden ver info de otros si son del mismo conjunto (Básico)
  (
    SELECT p.residential_cluster FROM public.profiles p WHERE p.id = auth.uid()
  ) = residential_cluster
  OR
  -- Admins ven todo
  public.has_role(ARRAY['admin', 'superadmin', 'guard'])
);

-- 2. REFORZAR RLS DE SEGURIDAD (Vigilantes)
DROP POLICY IF EXISTS "Guards/Admins can create alerts" ON public.security_alerts;
CREATE POLICY "Guards/Admins can create alerts" ON public.security_alerts
FOR INSERT TO authenticated
WITH CHECK ( public.has_role(ARRAY['guard', 'admin', 'superadmin']) );

-- 3. PERMITIR QUE ADMINS VEAN PAGOS DE SU CONJUNTO
DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
CREATE POLICY "Admins manage payments" ON public.payments
FOR ALL TO authenticated
USING (
  public.has_role(ARRAY['admin', 'superadmin'])
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin' AND p.residential_cluster = (
      SELECT pr.residential_cluster FROM public.profiles pr WHERE pr.id = public.payments.profile_id
    )
  )
);

-- 4. FIX PARA PERSISTENCIA DE AVATAR (Asegurar que el usuario pueda actualizar su url)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. TABLA PARA LOGS DE ACCESO (Asegurar permisos)
GRANT ALL ON public.manual_access_logs TO authenticated;
GRANT ALL ON public.security_alerts TO authenticated;
GRANT ALL ON public.internal_votings TO authenticated;
GRANT ALL ON public.internal_votes TO authenticated;
