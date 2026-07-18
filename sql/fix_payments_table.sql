-- SCRIPT DE REPARACIÓN INTEGRAL PARA TABLA DE PAGOS (CAMINOS APP) - HARDENED VERSION

DO $$
BEGIN
    -- 1. Asegurar que la tabla existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        CREATE TABLE public.payments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- 2. Asegurar columna profile_id (y migrar desde user_id si existe)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'profile_id') THEN
        ALTER TABLE public.payments ADD COLUMN profile_id UUID REFERENCES public.profiles(id);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'user_id') THEN
            UPDATE public.payments SET profile_id = user_id;
        END IF;
    END IF;

    -- 3. Asegurar columna monto_usd (y migrar desde amount_usd si existe)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'monto_usd') THEN
        ALTER TABLE public.payments ADD COLUMN monto_usd NUMERIC;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'amount_usd') THEN
            UPDATE public.payments SET monto_usd = amount_usd;
        END IF;
    END IF;

    -- 4. Asegurar columna monto_bs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'monto_bs') THEN
        ALTER TABLE public.payments ADD COLUMN monto_bs NUMERIC;
    END IF;

    -- 5. Asegurar columna referencia
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'referencia') THEN
        ALTER TABLE public.payments ADD COLUMN referencia TEXT;
    END IF;

    -- 6. Asegurar columna banco_origen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'banco_origen') THEN
        ALTER TABLE public.payments ADD COLUMN banco_origen TEXT;
    END IF;

    -- 7. Asegurar columna evidencia_url (y migrar desde screenshot_url si existe)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'evidencia_url') THEN
        ALTER TABLE public.payments ADD COLUMN evidencia_url TEXT;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'screenshot_url') THEN
            UPDATE public.payments SET evidencia_url = screenshot_url;
        END IF;
    END IF;

    -- 8. Asegurar columna description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'description') THEN
        ALTER TABLE public.payments ADD COLUMN description TEXT;
    END IF;

    -- 9. Asegurar columna details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'details') THEN
        ALTER TABLE public.payments ADD COLUMN details JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- 10. Asegurar columna status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'status') THEN
        ALTER TABLE public.payments ADD COLUMN status TEXT DEFAULT 'pendiente';
    END IF;

END $$;

-- 11. Re-crear la función RPC con endurecimiento de seguridad (Sin p_profile_id)
CREATE OR REPLACE FUNCTION public.rpc_insert_payment(
  monto_bs numeric,
  monto_usd numeric,
  referencia text,
  banco_origen text,
  evidencia_url text,
  description text,
  details jsonb
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que el usuario esté autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  INSERT INTO public.payments(
    profile_id, monto_bs, monto_usd, referencia, banco_origen, status, evidencia_url, description, details, created_at
  ) VALUES (
    auth.uid(), monto_bs, monto_usd, referencia, banco_origen, 'pendiente', evidencia_url, description, details, now()
  );
END;
$$;

-- Restringir ejecución solo a usuarios autenticados
REVOKE EXECUTE ON FUNCTION public.rpc_insert_payment FROM public, anon;
GRANT EXECUTE ON FUNCTION public.rpc_insert_payment TO authenticated;
