-- 1. LIMPIEZA TOTAL DE POLÍTICAS EN PROFILES PARA EVITAR RECURSIÓN
-- Borramos todas las posibles políticas conflictivas
DROP POLICY IF EXISTS "Profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "public_directory_read" ON public.profiles;

-- 2. FUNCIÓN DE SEGURIDAD DEFINER (Bypasses RLS)
-- Esta es la ÚNICA forma segura de consultar roles sin causar recursión infinita.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- 3. NUEVA POLÍTICA MAESTRA (SIN RECURSIÓN)
-- Usamos auth.uid() directamente y la función SECURITY DEFINER.
CREATE POLICY "profiles_master_policy" ON public.profiles
FOR ALL TO authenticated
USING (
  -- Caso A: Es mi propio perfil
  auth.uid() = id
  OR
  -- Caso B: Soy Admin o Superadmin (usando la función que salta el RLS)
  public.get_my_role() IN ('admin', 'superadmin', 'guard')
);

-- 4. PERMITIR QUE VECINOS VEAN INFO BÁSICA (Mismo conjunto)
-- Para que las reservas y nombres funcionen entre vecinos sin recursion.
CREATE POLICY "profiles_neighbor_view" ON public.profiles
FOR SELECT TO authenticated
USING (
  residential_cluster = (SELECT p.residential_cluster FROM public.profiles p WHERE p.id = auth.uid())
);

-- 5. RE-ASEGURAR TABLAS DE VIGILANCIA
ALTER TABLE public.manual_access_logs DISABLE ROW LEVEL SECURITY; -- Temporalmente si hay mucho problema
ALTER TABLE public.manual_access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guards can manage manual logs" ON public.manual_access_logs;
CREATE POLICY "Guards can manage manual logs" ON public.manual_access_logs
FOR ALL TO authenticated
USING ( public.get_my_role() IN ('guard', 'admin', 'superadmin') );
