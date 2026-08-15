BEGIN;

-- ================================================================================
-- SQL: HARDENING DE SEGURIDAD (FIX LINTER) Y MEJORAS LOTE 5
-- ================================================================================

-- 1. FIX LINTER: FIJAR SEARCH_PATH Y REVOCAR EJECUCIÓN PÚBLICA
-- Esto blinda las funciones contra ataques de secuestro de esquema y acceso anónimo.
DO $$
DECLARE
    func_name TEXT;
    func_schema TEXT := 'public';
BEGIN
    FOR func_name IN
        SELECT proname
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = func_schema
    LOOP
        -- Fijar el esquema para evitar mutabilidad
        EXECUTE format('ALTER FUNCTION %I.%I SET search_path = public', func_schema, func_name);
        -- Quitar permiso a 'anon' y 'PUBLIC' (solo authenticated podrá ejecutar vía App)
        EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I FROM PUBLIC, anon', func_schema, func_name);
        EXECUTE format('GRANT EXECUTE ON FUNCTION %I.%I TO authenticated', func_schema, func_name);
        -- Las funciones de servicio (push) también se aseguran
        EXECUTE format('GRANT EXECUTE ON FUNCTION %I.%I TO service_role', func_schema, func_name);
    END LOOP;
END $$;

-- 2. TABLA DE LOGS DE ACCESO REAL (PUNTO 1)
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID REFERENCES public.guest_invitations(id),
    resident_id UUID REFERENCES public.profiles(id),
    guest_name TEXT,
    entry_at TIMESTAMPTZ DEFAULT NOW(),
    cluster_name TEXT
);
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Residents view own logs" ON public.access_logs;
CREATE POLICY "Residents view own logs" ON public.access_logs FOR SELECT TO authenticated USING (resident_id = auth.uid());

-- 3. CASILLERO VIRTUAL: FECHA Y SEGURIDAD (PUNTO 2)
ALTER TABLE public.casillero_virtual ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.casillero_virtual ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Residents view own packages" ON public.casillero_virtual;
CREATE POLICY "Residents view own packages" ON public.casillero_virtual
FOR SELECT TO authenticated USING (resident_id = auth.uid());

DROP POLICY IF EXISTS "Guards manage packages" ON public.casillero_virtual;
CREATE POLICY "Guards manage packages" ON public.casillero_virtual
FOR ALL TO authenticated USING (public.get_my_role() IN ('guard', 'admin', 'superadmin'));

-- 4. PRIVACIDAD DE INCIDENTES: VISTA PARA EL GUARDIA (PUNTO 4)
-- Oculta la columna 'profile_id'/'reporter_id' para que el vigilante no sepa quién se quejó.
CREATE OR REPLACE VIEW public.incidents_guard_view
WITH (security_invoker = true) AS
SELECT id, category, location, description, status, created_at, cluster_name
FROM public.incidents;

GRANT SELECT ON public.incidents_guard_view TO authenticated;

COMMIT;
