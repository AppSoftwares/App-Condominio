-- FUNCIONALIDADES DE SEGURIDAD AVANZADA PARA CAMINOS APP (V3)

-- 1. Limpieza de funciones anteriores para evitar conflictos de tipo de retorno o firma
DROP FUNCTION IF EXISTS public.get_my_sessions();
DROP FUNCTION IF EXISTS public.revoke_session(uuid);
DROP FUNCTION IF EXISTS public.rpc_register_session(text, text, text, text);
DROP FUNCTION IF EXISTS public.rpc_register_session(text, text, text); -- Por si existe versión anterior

-- 2. Tabla de Sesiones de Usuario
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_name text NOT NULL,
    device_id text NOT NULL,
    platform text,
    location text,
    last_seen timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    revoked boolean DEFAULT false,
    UNIQUE (profile_id, device_id)
);

-- RLS para user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own sessions') THEN
        CREATE POLICY "Users can view their own sessions" ON public.user_sessions FOR SELECT TO authenticated USING (profile_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own sessions') THEN
        CREATE POLICY "Users can update their own sessions" ON public.user_sessions FOR UPDATE TO authenticated USING (profile_id = auth.uid());
    END IF;
END $$;

-- 3. Función RPC para registrar/actualizar sesión
CREATE OR REPLACE FUNCTION public.rpc_register_session(
    p_device_name text,
    p_device_id text,
    p_platform text,
    p_location text DEFAULT 'N/D'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

    INSERT INTO public.user_sessions (profile_id, device_name, device_id, platform, location, last_seen, revoked)
    VALUES (auth.uid(), p_device_name, p_device_id, p_platform, p_location, now(), false)
    ON CONFLICT (profile_id, device_id)
    DO UPDATE SET
        last_seen = now(),
        device_name = p_device_name,
        platform = p_platform,
        revoked = false;
END;
$$;

-- 4. Función para revocar una sesión (marcar como revoked)
CREATE OR REPLACE FUNCTION public.revoke_session(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.user_sessions
    SET revoked = true
    WHERE id = p_session_id
    AND profile_id = auth.uid();
END;
$$;

-- 5. Función para listar mis sesiones activas
CREATE OR REPLACE FUNCTION public.get_my_sessions()
RETURNS SETOF public.user_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.user_sessions
    WHERE profile_id = auth.uid() AND revoked = false
    ORDER BY last_seen DESC;
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION public.rpc_register_session(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_session(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_sessions() TO authenticated;
