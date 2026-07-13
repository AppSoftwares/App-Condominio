-- SCRIPT MAESTRO DE LIMPIEZA Y REPARACIÓN (v2.1.4)
-- Ejecuta este script para solucionar los errores de "function not unique" y "dependency"

-- 1. LIMPIEZA DE FUNCIONES ANTERIORES
-- Usamos CASCADE para borrar políticas dependientes automáticamente
DROP FUNCTION IF EXISTS public.rpc_insert_payment(numeric, numeric, text, text, text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.rpc_insert_payment(numeric, numeric, text, text, text, text, jsonb, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.rpc_insert_incident(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.check_debt_limit(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_user() CASCADE;

-- 2. REPARACIÓN DE TABLA DE PAGOS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        CREATE TABLE public.payments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Columnas de usuario
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'profile_id') THEN
        ALTER TABLE public.payments ADD COLUMN profile_id UUID REFERENCES public.profiles(id);
    END IF;

    -- Columnas de montos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'monto_usd') THEN
        ALTER TABLE public.payments ADD COLUMN monto_usd NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'monto_bs') THEN
        ALTER TABLE public.payments ADD COLUMN monto_bs NUMERIC;
    END IF;

    -- Otros campos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'referencia') THEN
        ALTER TABLE public.payments ADD COLUMN referencia TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'banco_origen') THEN
        ALTER TABLE public.payments ADD COLUMN banco_origen TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'evidencia_url') THEN
        ALTER TABLE public.payments ADD COLUMN evidencia_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'status') THEN
        ALTER TABLE public.payments ADD COLUMN status TEXT DEFAULT 'pendiente';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'description') THEN
        ALTER TABLE public.payments ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'details') THEN
        ALTER TABLE public.payments ADD COLUMN details JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 3. RE-CREACIÓN DE FUNCIONES (Endurecidas)

-- Función: is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'));
END;
$$;

-- Función: rpc_insert_payment
CREATE OR REPLACE FUNCTION public.rpc_insert_payment(
  monto_bs numeric, monto_usd numeric, referencia text, banco_origen text,
  evidencia_url text, description text, details jsonb, p_profile_id uuid DEFAULT auth.uid()
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'No autorizado'; END IF;
  INSERT INTO public.payments(profile_id, monto_bs, monto_usd, referencia, banco_origen, status, evidencia_url, description, details, created_at)
  VALUES (COALESCE(p_profile_id, auth.uid()), monto_bs, monto_usd, referencia, banco_origen, 'pendiente', evidencia_url, description, details, now());
END;
$$;

-- Función: rpc_insert_incident
CREATE OR REPLACE FUNCTION public.rpc_insert_incident(
  category text, location text, description text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'No autorizado'; END IF;
  INSERT INTO public.incidents(profile_id, category, location, description, status, created_at)
  VALUES (auth.uid(), category, location, description, 'Pendiente', now());
END;
$$;

-- 4. RE-CREACIÓN DE POLÍTICAS (Tras el CASCADE)
DO $$
BEGIN
    -- Profiles Admin access
    DROP POLICY IF EXISTS "admin_read" ON public.profiles;
    CREATE POLICY "admin_read" ON public.profiles FOR SELECT USING (public.is_admin());

    DROP POLICY IF EXISTS "admin_update" ON public.profiles;
    CREATE POLICY "admin_update" ON public.profiles FOR UPDATE USING (public.is_admin());

    -- Payments access
    DROP POLICY IF EXISTS "Payments access" ON public.payments;
    CREATE POLICY "Payments access" ON public.payments FOR ALL USING (profile_id = auth.uid() OR public.is_admin());
END $$;

-- 5. PERMISOS
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM public, anon;
GRANT EXECUTE ON FUNCTION public.rpc_insert_payment TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_insert_incident TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
