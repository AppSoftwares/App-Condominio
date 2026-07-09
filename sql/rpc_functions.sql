-- RPC helper functions to perform inserts server-side using auth.uid()

-- Insert payment as authenticated user
CREATE OR REPLACE FUNCTION public.rpc_insert_payment(
  monto_bs numeric,
  monto_usd numeric,
  referencia text,
  banco_origen text,
  evidencia_url text,
  description text,
  details jsonb
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.payments(
    profile_id, monto_bs, monto_usd, referencia, banco_origen, status, evidencia_url, description, details, created_at
  ) VALUES (
    auth.uid(), monto_bs, monto_usd, referencia, banco_origen, 'pendiente', evidencia_url, description, details, now()
  );
END;
$$;

-- Insert incident as authenticated user
CREATE OR REPLACE FUNCTION public.rpc_insert_incident(
  category text,
  location text,
  description text
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.incidents(
    profile_id, category, location, description, status, created_at
  ) VALUES (
    auth.uid(), category, location, description, 'Pendiente', now()
  );
END;
$$;
