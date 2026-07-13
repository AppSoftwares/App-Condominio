-- RPC helper functions with security hardening (fined search_path and execution limits)

-- Insert payment as authenticated user
CREATE OR REPLACE FUNCTION public.rpc_insert_payment(
  monto_bs numeric,
  monto_usd numeric,
  referencia text,
  banco_origen text,
  evidencia_url text,
  description text,
  details jsonb,
  p_profile_id uuid DEFAULT auth.uid()
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  INSERT INTO public.payments(
    profile_id, monto_bs, monto_usd, referencia, banco_origen, status, evidencia_url, description, details, created_at
  ) VALUES (
    COALESCE(p_profile_id, auth.uid()), monto_bs, monto_usd, referencia, banco_origen, 'pendiente', evidencia_url, description, details, now()
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rpc_insert_payment FROM public, anon;
GRANT EXECUTE ON FUNCTION public.rpc_insert_payment TO authenticated;

-- Insert incident as authenticated user
CREATE OR REPLACE FUNCTION public.rpc_insert_incident(
  category text,
  location text,
  description text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  INSERT INTO public.incidents(
    profile_id, category, location, description, status, created_at
  ) VALUES (
    auth.uid(), category, location, description, 'Pendiente', now()
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rpc_insert_incident FROM public, anon;
GRANT EXECUTE ON FUNCTION public.rpc_insert_incident TO authenticated;
