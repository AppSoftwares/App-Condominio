-- FIX NOTIFICACIONES PUSH PARA MODO DOZE Y ESTABILIDAD

-- 1. Asegurar tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.push_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Denegar acceso directo a residentes por seguridad
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "internal_deny_all" ON public.push_notifications;
CREATE POLICY "internal_deny_all" ON public.push_notifications FOR ALL USING (false);

-- 2. Crear RPC para insertar en la cola
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

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.rpc_send_push TO authenticated;

-- 3. Habilitar el Trigger Webhook (Esto debe hacerse en el Dashboard de Supabase)
-- Nombre: send-push-webhook
-- Evento: INSERT en public.push_notifications
-- URL: Tu URL de Edge Function (https://<project>.supabase.co/functions/v1/send-push)
-- Header: x-webhook-secret: <tu_secreto>
