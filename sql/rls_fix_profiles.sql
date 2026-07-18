-- Fix for infinite recursion in RLS policy on public.profiles
-- 1) Create helper function that checks if current auth.uid() is admin
--    The function is SECURITY DEFINER so it can query profiles without being affected by RLS.

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
BEGIN
  SELECT role INTO _role FROM public.profiles WHERE id = auth.uid();
  RETURN _role IN ('admin', 'superadmin');
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin_user FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_user TO authenticated;

-- 2) Replace the existing recursive policy with two safe policies
-- Drop any old policies first so the script is idempotent
DROP POLICY IF EXISTS "Profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles owner access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin access" ON public.profiles;

DROP POLICY IF EXISTS "Profiles owner access" ON public.profiles;
DROP POLICY IF EXISTS "allow_owner_all" ON public.profiles;
DROP POLICY IF EXISTS "owner_access" ON public.profiles;

CREATE POLICY "owner_update_no_privesc" ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Allow admin users (evaluated via SECURITY DEFINER function) to access profiles
CREATE POLICY "Profiles admin access" ON public.profiles
  FOR ALL
  USING (public.is_admin_user());

-- Note: after applying, verify any other policies that used subselects on profiles and adjust similarly.
