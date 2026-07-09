-- COPIA Y PEGA ESTE SCRIPT EN EL SQL EDITOR DE SUPABASE PARA ARREGLAR EL ERROR "Infinite Recursion"

-- 1. Desactivar RLS temporalmente para limpiar
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas existentes en profiles para evitar conflictos
DROP POLICY IF EXISTS "Profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles owner access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin access" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything" ON public.profiles;
DROP POLICY IF EXISTS "owner_access" ON public.profiles;
DROP POLICY IF EXISTS "admin_read_access" ON public.profiles;

-- 3. Crear función de administrador optimizada (SECURITY DEFINER corre como superusuario y evita recursión)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Re-activar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Crear las dos únicas políticas necesarias
-- Política 1: El usuario puede ver y editar su propio perfil
CREATE POLICY "allow_owner_all" ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política 2: Los administradores pueden ver todos los perfiles
-- Usamos la función is_admin() que al ser SECURITY DEFINER no dispara de nuevo el RLS
CREATE POLICY "allow_admin_read" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- 6. Dar permisos de ejecución a la función para usuarios autenticados
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
