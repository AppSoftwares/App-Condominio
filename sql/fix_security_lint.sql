-- FIX: Supabase Security Lint Warnings & RLS
-- Addresses: Function Search Path Mutable, Unauthorized Execution, and Missing RLS Policies

-- 1. FIX: pagos_condominio RLS
ALTER TABLE IF EXISTS public.pagos_condominio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own condo payments" ON public.pagos_condominio;
CREATE POLICY "Users can view their own condo payments" ON public.pagos_condominio
    FOR SELECT USING (auth.uid() = residente_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin'));

-- 2. FIX: Function Search Path and Execution Permissions

-- is_admin / check_is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'));
END;
$$;

-- Alias for check_is_admin if it exists
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN public.is_admin();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role, postgres, authenticated;

REVOKE EXECUTE ON FUNCTION public.check_is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin() TO service_role, postgres, authenticated;

-- get_my_cluster
CREATE OR REPLACE FUNCTION public.get_my_cluster()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT residential_cluster FROM public.profiles WHERE id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.get_my_cluster() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_cluster() TO authenticated, service_role;

-- auto_assign_cluster
CREATE OR REPLACE FUNCTION public.auto_assign_cluster()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF NEW.residential_cluster IS NULL THEN
        IF TG_TABLE_NAME = 'payments' THEN
            NEW.residential_cluster := (SELECT residential_cluster FROM public.profiles WHERE id = COALESCE(NEW.profile_id, auth.uid()));
        ELSIF TG_TABLE_NAME = 'debts' THEN
            NEW.residential_cluster := (SELECT residential_cluster FROM public.profiles WHERE id = NEW.residente_id);
        ELSIF TG_TABLE_NAME = 'incidents' THEN
            NEW.residential_cluster := (SELECT residential_cluster FROM public.profiles WHERE id = NEW.profile_id);
        ELSIF TG_TABLE_NAME = 'reservations' THEN
            NEW.residential_cluster := (SELECT residential_cluster FROM public.profiles WHERE id = NEW.user_id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.auto_assign_cluster() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_assign_cluster() TO service_role, postgres;

-- check_debt_limit
CREATE OR REPLACE FUNCTION public.check_debt_limit(res_id UUID)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    meses_deuda INTEGER;
BEGIN
    SELECT COUNT(*) INTO meses_deuda
    FROM public.pagos_condominio
    WHERE residente_id = res_id AND pagado = FALSE;

    RETURN meses_deuda >= 3;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.check_debt_limit(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_debt_limit(uuid) TO authenticated, service_role;

-- enforce_debt_cutoff
CREATE OR REPLACE FUNCTION public.enforce_debt_cutoff()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF public.check_debt_limit(NEW.resident_id) THEN
        RAISE EXCEPTION 'Acceso bloqueado por deuda pendiente (3 o más meses). Por favor regularice su situación.';
    END IF;
    RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.enforce_debt_cutoff() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_debt_cutoff() TO service_role, postgres;

-- enforce_debt_cutoff_reservations
CREATE OR REPLACE FUNCTION public.enforce_debt_cutoff_reservations()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF public.check_debt_limit(NEW.user_id) THEN
        RAISE EXCEPTION 'Reserva bloqueada por deuda pendiente (3 o más meses). Por favor regularice su situación.';
    END IF;
    RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.enforce_debt_cutoff_reservations() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_debt_cutoff_reservations() TO service_role, postgres;

-- 3. Sync permissions for RPC functions already having search_path
REVOKE EXECUTE ON FUNCTION public.rpc_insert_payment FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_insert_payment TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.rpc_insert_incident FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_insert_incident TO authenticated, service_role;
