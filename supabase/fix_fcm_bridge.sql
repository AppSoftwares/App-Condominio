-- 1. Asegurar tabla de historial de notificaciones con campos para depuración
CREATE TABLE IF NOT EXISTS public.push_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS (Denegar acceso directo a usuarios, solo sistema)
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "system_only" ON public.push_notifications;
CREATE POLICY "system_only" ON public.push_notifications FOR ALL USING (false);

-- 3. RPC para envío (ya existía pero lo reforzamos)
CREATE OR REPLACE FUNCTION public.rpc_send_push(
  p_token text,
  p_title text,
  p_body text,
  p_data jsonb DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.push_notifications (token, title, body, data)
  VALUES (p_token, p_title, p_body, p_data);
END;
$$;
