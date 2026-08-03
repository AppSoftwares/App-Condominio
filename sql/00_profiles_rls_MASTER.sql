-- ================================================================================
-- SQL MASTER: LIMPIEZA Y REPARACIÓN DE RLS EN "PROFILES"
-- Lote 2 - Corrección de recursión y restricción por conjunto
-- ================================================================================

-- 1. FUNCIONES AUXILIARES CON SECURITY DEFINER (Saltan el RLS para evitar recursión)
-- Estas funciones permiten consultar datos del propio usuario sin disparar la política de nuevo.

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_cluster()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT residential_cluster FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. LIMPIEZA TOTAL DE POLÍTICAS EXISTENTES EN PROFILES
-- Se listan todos los nombres encontrados en el análisis previo.

DROP POLICY IF EXISTS "Profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles owner access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin access" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything" ON public.profiles;
DROP POLICY IF EXISTS "owner_access" ON public.profiles;
DROP POLICY IF EXISTS "admin_read_access" ON public.profiles;
DROP POLICY IF EXISTS "allow_owner_all" ON public.profiles;
DROP POLICY IF EXISTS "allow_admin_read" ON public.profiles;
DROP POLICY IF EXISTS "owner_update_no_privesc" ON public.profiles;
DROP POLICY IF EXISTS "admin_read" ON public.profiles;
DROP POLICY IF EXISTS "admin_update" ON public.profiles;
DROP POLICY IF EXISTS "Profiles basic access" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "public_directory_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_master_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_neighbor_view" ON public.profiles;

-- Asegurar que RLS esté activo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICA MAESTRA ÚNICA (ALL para simplificar y asegurar consistencia)
-- Cubre SELECT, UPDATE y DELETE basándose en el rol y el conjunto.

CREATE POLICY "profiles_master_policy" ON public.profiles
FOR ALL TO authenticated
USING (
  -- Regla 1: Acceso a mi propio perfil
  auth.uid() = id
  OR
  -- Regla 2: Los Admin/Superadmin globales pueden ver/editar todo
  public.get_my_role() IN ('admin', 'superadmin')
  OR
  -- Regla 3: El Guardia solo ve residentes de su propio conjunto
  (public.get_my_role() = 'guard' AND residential_cluster = public.get_my_cluster())
  OR
  -- Regla 4: Residentes ven nombres/casas de sus vecinos (mismo conjunto) para murales/reservas
  residential_cluster = public.get_my_cluster()
);

-- 4. PERMISOS ADICIONALES PARA TABLAS RELACIONADAS (Basado en get_my_role)
-- Reparamos también la tabla de logs para que el guardia pueda escribir sin problemas.

DROP POLICY IF EXISTS "Guards can manage manual logs" ON public.manual_access_logs;
CREATE POLICY "Guards can manage manual logs" ON public.manual_access_logs
FOR ALL TO authenticated
USING ( public.get_my_role() IN ('guard', 'admin', 'superadmin') );

-- Otorgar permisos de ejecución a los usuarios autenticados
GRANT EXECUTE ON FUNCTION public.get_my_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_cluster TO authenticated;
