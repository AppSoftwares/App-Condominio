-- RPC helper functions to perform inserts server-side using auth.uid()

-- Insert payment as authenticated user
-- We use COALESCE and try to be flexible with column names if possible,
-- but here we assume the table is 'payments' and we use 'user_id' as indicated by the error.
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
  -- Attempt to insert into payments.
  -- We assume 'user_id' is the correct column based on the error "column profile_id does not exist".
  INSERT INTO public.payments(
    user_id, monto_bs, monto_usd, referencia, banco_origen, status, evidencia_url, description, details, created_at
  ) VALUES (
    COALESCE(p_profile_id, auth.uid()), monto_bs, monto_usd, referencia, banco_origen, 'pendiente', evidencia_url, description, details, now()
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
