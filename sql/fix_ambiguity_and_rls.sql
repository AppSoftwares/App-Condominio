-- 1. RESOLVER AMBIGÜEDAD EN RPC DE PAGOS
-- Borramos las versiones anteriores para evitar conflictos con la nueva que incluye idempotency_key
DROP FUNCTION IF EXISTS public.rpc_insert_payment(numeric, numeric, text, text, text, text, jsonb, uuid);
DROP FUNCTION IF EXISTS public.rpc_insert_payment(numeric, numeric, text, text, text, text, jsonb, text);

-- Aseguramos que la versión correcta exista (la que creamos en el paso anterior)
-- Si por alguna razón no se ejecutó bien, esta es la firma definitiva:
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

-- 2. POLÍTICAS RLS PARA VOTACIONES INTERNAS
ALTER TABLE public.internal_votings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_votes ENABLE ROW LEVEL SECURITY;

-- Ver Votaciones: Todos los autenticados
DROP POLICY IF EXISTS "Votings viewable by all" ON public.internal_votings;
CREATE POLICY "Votings viewable by all" ON public.internal_votings
FOR SELECT USING (true);

-- Crear Votaciones: Solo Admins y Superadmins
DROP POLICY IF EXISTS "Admins can manage votings" ON public.internal_votings;
CREATE POLICY "Admins can manage votings" ON public.internal_votings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Ver Votos: Todos pueden ver resultados (o conteos)
DROP POLICY IF EXISTS "Votes viewable by all" ON public.internal_votes;
CREATE POLICY "Votes viewable by all" ON public.internal_votes
FOR SELECT USING (true);

-- Emitir Voto: Usuarios autenticados (solo uno por votación)
DROP POLICY IF EXISTS "Users can vote" ON public.internal_votes;
CREATE POLICY "Users can vote" ON public.internal_votes
FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update own vote" ON public.internal_votes;
CREATE POLICY "Users can update own vote" ON public.internal_votes
FOR UPDATE USING (auth.uid() = profile_id);
