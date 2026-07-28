-- 1. TABLA DE INFORMACIÓN DE CONJUNTOS (Datos Bancarios)
CREATE TABLE IF NOT EXISTS public.residential_clusters_info (
    cluster_name TEXT PRIMARY KEY,
    bank_name TEXT,
    bank_account TEXT,
    rif TEXT,
    phone TEXT,
    zelle_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE VOTACIONES INTERNAS (Independencia de Vercel)
CREATE TABLE IF NOT EXISTS public.internal_votings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    amount_estimated DECIMAL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    cluster_name TEXT, -- Si es por conjunto
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.internal_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voting_id UUID REFERENCES public.internal_votings(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id),
    option TEXT CHECK (option IN ('favor', 'contra')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(voting_id, profile_id)
);

-- 3. ACTUALIZACIÓN DE PAGOS (IDEMPOTENCIA)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='idempotency_key') THEN
        ALTER TABLE public.payments ADD COLUMN idempotency_key TEXT UNIQUE;
    END IF;
END $$;

-- 4. RPC DE PAGOS CORREGIDO
CREATE OR REPLACE FUNCTION public.rpc_insert_payment(
  monto_bs numeric,
  monto_usd numeric,
  referencia text,
  banco_origen text,
  evidencia_url text,
  description text,
  details jsonb,
  idempotency_key text DEFAULT NULL,
  p_profile_id uuid DEFAULT auth.uid()
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  -- Evitar duplicados por idempotencia
  IF idempotency_key IS NOT NULL AND EXISTS (SELECT 1 FROM public.payments WHERE public.payments.idempotency_key = rpc_insert_payment.idempotency_key) THEN
    RETURN;
  END IF;

  INSERT INTO public.payments(
    profile_id, monto_bs, monto_usd, referencia, banco_origen, status, evidencia_url, description, details, idempotency_key, created_at
  ) VALUES (
    COALESCE(p_profile_id, auth.uid()), monto_bs, monto_usd, referencia, banco_origen, 'pendiente', evidencia_url, description, details, idempotency_key, now()
  );
END;
$$;

-- 5. INSERTAR DATOS DE PRUEBA PARA HUERTAS
INSERT INTO public.residential_clusters_info (cluster_name, bank_name, bank_account, rif, phone, zelle_email)
VALUES (
    'Huertas',
    'Banco Nacional de Crédito (0191)',
    '0191-0000-00-0000000000',
    'J-29900732-3',
    '0414-0000000',
    'CONDOMINIOLASHUERTAS@GMAIL.COM'
) ON CONFLICT (cluster_name) DO UPDATE SET
    bank_name = EXCLUDED.bank_name,
    bank_account = EXCLUDED.bank_account,
    rif = EXCLUDED.rif,
    zelle_email = EXCLUDED.zelle_email;
