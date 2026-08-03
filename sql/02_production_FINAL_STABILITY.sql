BEGIN;

-- 1. LIMPIEZA DE FUNCIONES ANTIGUAS Y DUPLICADAS
DROP FUNCTION IF EXISTS public.rpc_insert_payment(numeric, numeric, text, text, text, text, jsonb, uuid);
DROP FUNCTION IF EXISTS public.rpc_insert_payment(numeric, numeric, text, text, text, text, jsonb, text);

-- 2. ASEGURAR FUNCIONES SECURITY DEFINER (Saltan RLS para evitar recursión)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_cluster()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT residential_cluster FROM public.profiles WHERE id = auth.uid();
$$;

-- 3. ELIMINACIÓN DE TODAS LAS POLÍTICAS VIEJAS DE "PROFILES"
DROP POLICY IF EXISTS "admin_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_master_policy" ON public.profiles;
DROP POLICY IF EXISTS "self_access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles owner access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin access" ON public.profiles;
DROP POLICY IF EXISTS "public_directory_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_neighbor_view" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 4. NUEVAS POLÍTICAS SEPARADAS (OBLIGATORIO: SIN "FOR ALL")
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Propio + Admins + Guardias de conjunto + Vecinos del conjunto
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id
  OR public.get_my_role() IN ('admin', 'superadmin')
  OR (public.get_my_role() = 'guard' AND residential_cluster = public.get_my_cluster())
  OR residential_cluster = public.get_my_cluster()
);

-- UPDATE: Solo el dueño o Admins
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated
USING ( auth.uid() = id OR public.get_my_role() IN ('admin', 'superadmin') )
WITH CHECK ( auth.uid() = id OR public.get_my_role() IN ('admin', 'superadmin') );

-- DELETE: Solo Admins
CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE TO authenticated
USING ( public.get_my_role() IN ('admin', 'superadmin') );

-- INSERT: El usuario se crea su propio perfil al registrarse
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK ( auth.uid() = id );

-- 5. VISTA UNIFICADA CON SEGURIDAD DOBLE (Security Invoker + Filtro Server-Side)
CREATE OR REPLACE VIEW public.unified_guest_access
WITH (security_invoker = true) AS
SELECT
    id, resident_id, guest_name, status, created_at, 'qr' as entry_type
FROM public.guest_invitations
WHERE resident_id = auth.uid()
UNION ALL
SELECT
    id, resident_id, visitor_name as guest_name, 'used' as status, created_at, 'manual' as entry_type
FROM public.manual_access_logs
WHERE resident_id = auth.uid();

GRANT SELECT ON public.unified_guest_access TO authenticated;

-- 6. REPARACIÓN DE VINCULACIÓN AUTOMÁTICA
CREATE OR REPLACE FUNCTION public.fn_sync_manual_access()
RETURNS TRIGGER AS $$
BEGIN
    NEW.resident_id := (
        SELECT id FROM public.profiles
        WHERE house_number = NEW.destination_house
        AND residential_cluster = NEW.cluster_name
        LIMIT 1
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_manual_access ON public.manual_access_logs;
CREATE TRIGGER tr_sync_manual_access BEFORE INSERT ON public.manual_access_logs
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_manual_access();

-- 7. PERMISOS DE EJECUCIÓN
GRANT EXECUTE ON FUNCTION public.get_my_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_cluster TO authenticated;

COMMIT;
