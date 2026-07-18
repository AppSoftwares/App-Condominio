-- SCRIPT PARA AGREGAR IDEMPOTENCIA A PAGOS (CORREGIDO)

-- 1. Eliminar versiones anteriores de la función para evitar conflictos de firmas
-- Ejecutar estas una por una si hay errores de unicidad
DROP FUNCTION IF EXISTS public.rpc_insert_payment(numeric, numeric, text, text, text, text, jsonb);
DROP FUNCTION IF EXISTS public.rpc_insert_payment(numeric, numeric, text, text, text, text, jsonb, uuid);
DROP FUNCTION IF EXISTS public.rpc_insert_payment(numeric, numeric, text, text, text, text, jsonb, text);

-- 2. Agregar columna idempotency_key a la tabla payments si no existe
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- 3. Asegurar que sea única para evitar duplicados
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_payments_idempotency'
    ) THEN
        ALTER TABLE public.payments ADD CONSTRAINT uq_payments_idempotency UNIQUE (idempotency_key);
    END IF;
END $$;

-- 4. Re-crear la función RPC con la nueva firma
CREATE OR REPLACE FUNCTION public.rpc_insert_payment(
  monto_bs numeric,
  monto_usd numeric,
  referencia text,
  banco_origen text,
  evidencia_url text,
  description text,
  details jsonb,
  idempotency_key text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  INSERT INTO public.payments(
    profile_id, monto_bs, monto_usd, referencia, banco_origen,
    status, evidencia_url, description, details, created_at,
    idempotency_key
  ) VALUES (
    auth.uid(), monto_bs, monto_usd, referencia, banco_origen,
    'pendiente', evidencia_url, description, details, now(),
    idempotency_key
  )
  ON CONFLICT (idempotency_key) DO NOTHING;
END;
$$;

-- 5. Otorgar permisos especificando la firma exacta
GRANT EXECUTE ON FUNCTION public.rpc_insert_payment(numeric, numeric, text, text, text, text, jsonb, text) TO authenticated;
