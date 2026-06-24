-- SOLUCIÓN A VULNERABILIDADES DE SEGURIDAD EN SUPABASE
-- Este script corrige los avisos de "Function Search Path Mutable" y "SECURITY DEFINER"
-- para la función public.is_admin().

-- 1. Redefinir la función con un search_path fijo y mayor seguridad
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  -- Verificamos si el usuario actual tiene el rol de administrador en la tabla profiles
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO is_admin_user;

  RETURN COALESCE(is_admin_user, false);
END;
$$;

-- 2. Revocar permisos de ejecución pública para evitar que se llame vía API REST (RPC)
-- Esto soluciona los avisos de "Public/Signed-In Users Can Execute SECURITY DEFINER Function"
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM authenticated;

-- 3. Otorgar permisos solo a roles de servicio y administradores del sistema
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO postgres;

-- NOTA: Si utilizas esta función en tus políticas de RLS, asegúrate de que el rol
-- que ejecuta la política tenga permiso. Sin embargo, para máxima seguridad en Supabase,
-- se recomienda usar la subconsulta directamente en las políticas o mover la función
-- a un esquema privado (no 'public') que no esté expuesto vía PostgREST.

COMMENT ON FUNCTION public.is_admin IS 'Valida si el usuario actual es administrador. Protegida contra inyecciones de search_path y acceso RPC no autorizado.';
