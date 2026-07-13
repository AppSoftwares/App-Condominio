-- FIX PARA TABLA DE PAGOS Y COLUMNA PROFILE_ID

-- 1. Asegurar que la columna 'profile_id' existe en la tabla 'payments'
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'profile_id') THEN
            ALTER TABLE public.payments ADD COLUMN profile_id UUID REFERENCES public.profiles(id);

            -- Si existe user_id, migrar los datos
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'user_id') THEN
                UPDATE public.payments SET profile_id = user_id WHERE profile_id IS NULL;
            END IF;
        END IF;
    END IF;
END $$;

-- 2. Asegurar que la columna 'profile_id' existe en la tabla 'incidents'
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'profile_id') THEN
            ALTER TABLE public.incidents ADD COLUMN profile_id UUID REFERENCES public.profiles(id);
        END IF;
    END IF;
END $$;

-- 3. Actualizar la función RPC para que sea consistente
CREATE OR REPLACE FUNCTION public.rpc_insert_payment(
  monto_bs numeric,
  monto_usd numeric,
  referencia text,
  banco_origen text,
  evidencia_url text,
  description text,
  details jsonb,
  p_profile_id uuid DEFAULT auth.uid()
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.payments(
    profile_id, monto_bs, monto_usd, referencia, banco_origen, status, evidencia_url, description, details, created_at
  ) VALUES (
    COALESCE(p_profile_id, auth.uid()), monto_bs, monto_usd, referencia, banco_origen, 'pendiente', evidencia_url, description, details, now()
  );
END;
$$;
