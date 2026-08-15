BEGIN;

-- 1. ASEGURAR ESTRUCTURA DE TABLAS
-- Agregar cluster_name a incidents para permitir filtrado sin joins (Privacidad)
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS cluster_name TEXT;

-- Migrar datos: si el incidente no tiene cluster, tomarlo del perfil del creador
UPDATE public.incidents i
SET cluster_name = p.residential_cluster
FROM public.profiles p
WHERE i.profile_id = p.id AND i.cluster_name IS NULL;

-- 2. LIMPIEZA DE FUNCIONES OBSOLETAS
DROP FUNCTION IF EXISTS public.rpc_queue_notification(text, text, text, jsonb);

-- 3. ACTUALIZAR RPC_INSERT_INCIDENT PARA SOPORTAR PRIVACIDAD
-- Redefinimos la función para que guarde el cluster_name directamente.
CREATE OR REPLACE FUNCTION public.rpc_insert_incident(
    p_category text,
    p_location text,
    p_description text,
    p_cluster_name text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.incidents (category, location, description, profile_id, cluster_name)
    VALUES (
        p_category,
        p_location,
        p_description,
        auth.uid(),
        COALESCE(p_cluster_name, (SELECT residential_cluster FROM public.profiles WHERE id = auth.uid()))
    );
END;
$$;

-- 4. HARDENING MASIVO (Fix Linter: Search Path + Permissions)
-- Este bloque recorre TODAS las funciones de la base de datos y las blinda.
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT n.nspname as schema_name, p.proname as function_name, pg_get_function_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
    LOOP
        -- A) Fijar search_path para evitar "Search Path Mutable"
        EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public',
                       func_record.schema_name, func_record.function_name, func_record.args);

        -- B) Revocar ejecución pública para evitar "Public Can Execute SECURITY DEFINER"
        EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC, anon',
                       func_record.schema_name, func_record.function_name, func_record.args);

        -- C) Dar permiso solo a usuarios logueados (App) y al sistema
        EXECUTE format('GRANT EXECUTE ON FUNCTION %I.%I(%s) TO authenticated, service_role',
                       func_record.schema_name, func_record.function_name, func_record.args);
    END LOOP;
END $$;

-- 5. VISTA DE INCIDENTES PARA EL GUARDIA (REHECHA)
DROP VIEW IF EXISTS public.incidents_guard_view;
CREATE OR REPLACE VIEW public.incidents_guard_view
WITH (security_invoker = true) AS
SELECT id, category, location, description, status, created_at, cluster_name
FROM public.incidents;

GRANT SELECT ON public.incidents_guard_view TO authenticated;

-- 6. SILENCIAR ALERTAS DE RLS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'internal_deny_all' AND tablename = 'push_notifications') THEN
        CREATE POLICY "internal_deny_all" ON public.push_notifications FOR ALL USING (false);
    END IF;
END $$;

COMMIT;
