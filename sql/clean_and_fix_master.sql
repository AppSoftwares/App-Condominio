-- SCRIPT MAESTRO DE LIMPIEZA Y REPARACIÓN (CAMINOS APP)
-- Ejecuta este script para solucionar los errores de "function not unique" y "policy already exists"

-- 1. LIMPIEZA DE FUNCIONES ANTERIORES (Evita el error "not unique")
-- Borramos todas las posibles versiones de las funciones RPC para crearlas desde cero
DROP FUNCTION IF EXISTS public.rpc_insert_payment(numeric, numeric, text, text, text, text, jsonb);
DROP FUNCTION IF EXISTS public.rpc_insert_payment(numeric, numeric, text, text, text, text, jsonb, uuid);
DROP FUNCTION IF EXISTS public.rpc_insert_incident(text, text, text);
DROP FUNCTION IF EXISTS public.check_debt_limit(uuid);
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_admin_user();

-- 2. REPARACIÓN DE TABLA DE PAGOS
DO $$
BEGIN
    -- Asegurar tabla base
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        CREATE TABLE public.payments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Asegurar columna profile_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'profile_id') THEN
        ALTER TABLE public.payments ADD COLUMN profile_id UUID REFERENCES public.profiles(id);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'user_id') THEN
            UPDATE public.payments SET profile_id = user_id;
        END IF;
    END IF;

    -- Asegurar columna monto_usd
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'monto_usd') THEN
        ALTER TABLE public.payments ADD COLUMN monto_usd NUMERIC;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'amount_usd') THEN
            UPDATE public.payments SET monto_usd = amount_usd;
        END IF;
    END IF;

    -- Asegurar columna monto_bs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'monto_bs') THEN
        ALTER TABLE public.payments ADD COLUMN monto_bs NUMERIC;
    END IF;

    -- Otras columnas necesarias
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
END $$;

-- 3. CREACIÓN DE FUNCIONES RPC (Hardened)
CREATE OR REPLACE FUNCTION public.rpc_insert_payment(
  monto_bs numeric,
  monto_usd numeric,
  referencia text,
  banco_origen text,
  evidencia_url text,
  description text,
  details jsonb,
  p_profile_id uuid DEFAULT auth.uid()
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'No autorizado'; END IF;
  INSERT INTO public.payments(profile_id, monto_bs, monto_usd, referencia, banco_origen, status, evidencia_url, description, details, created_at)
  VALUES (COALESCE(p_profile_id, auth.uid()), monto_bs, monto_usd, referencia, banco_origen, 'pendiente', evidencia_url, description, details, now());
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_insert_incident(
  category text,
  location text,
  description text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'No autorizado'; END IF;
  INSERT INTO public.incidents(profile_id, category, location, description, status, created_at)
  VALUES (auth.uid(), category, location, description, 'Pendiente', now());
END;
$$;

-- 4. POLÍTICAS DE SEGURIDAD (Con limpieza previa)
DO $$
BEGIN
    -- Guest Invitations
    DROP POLICY IF EXISTS "Residents can manage their own invitations" ON public.guest_invitations;
    CREATE POLICY "Residents can manage their own invitations" ON public.guest_invitations FOR ALL USING (auth.uid() = resident_id);

    DROP POLICY IF EXISTS "Guards can view all invitations" ON public.guest_invitations;
    CREATE POLICY "Guards can view all invitations" ON public.guest_invitations FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'guard'));

    -- Payments
    DROP POLICY IF EXISTS "Payments access" ON public.payments;
    CREATE POLICY "Payments access" ON public.payments FOR ALL USING (profile_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin'));
END $$;

-- 5. PERMISOS DE EJECUCIÓN
REVOKE EXECUTE ON FUNCTION public.rpc_insert_payment FROM public, anon;
GRANT EXECUTE ON FUNCTION public.rpc_insert_payment TO authenticated;
REVOKE EXECUTE ON FUNCTION public.rpc_insert_incident FROM public, anon;
GRANT EXECUTE ON FUNCTION public.rpc_insert_incident TO authenticated;
