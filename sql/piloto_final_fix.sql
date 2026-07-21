-- FIX FINAL ANTES DEL PILOTO: SEGURIDAD Y AUDITORÍA

-- 1. ACTIVAR RLS EN INCIDENTS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "incidents_select_own_or_admin" ON public.incidents;
CREATE POLICY "incidents_select_own_or_admin" ON public.incidents
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "incidents_admin_update_status" ON public.incidents;
CREATE POLICY "incidents_admin_update_status" ON public.incidents
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. TABLA DE AUDITORÍA
CREATE TABLE IF NOT EXISTS public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  tabla TEXT NOT NULL,
  accion TEXT NOT NULL,
  actor_id UUID,
  registro_id TEXT NOT NULL,
  antes JSONB,
  despues JSONB,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_admin_read" ON public.audit_log
  FOR SELECT TO authenticated
  USING (public.is_admin());

REVOKE INSERT, UPDATE, DELETE ON public.audit_log FROM authenticated, anon;

-- 3. FUNCIÓN Y TRIGGERS DE AUDITORÍA
CREATE OR REPLACE FUNCTION public.fn_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_registro_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_registro_id := OLD.id::TEXT;
  ELSE
    v_registro_id := NEW.id::TEXT;
  END IF;

  INSERT INTO public.audit_log (tabla, accion, actor_id, registro_id, antes, despues)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    v_registro_id,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('UPDATE','INSERT') THEN to_jsonb(NEW) ELSE NULL END
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_payments ON public.payments;
CREATE TRIGGER trg_audit_payments
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_profiles ON public.profiles;
CREATE TRIGGER trg_audit_profiles
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
