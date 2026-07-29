-- 1. TABLA DE REGISTRO MANUAL (Vigilancia)
CREATE TABLE IF NOT EXISTS public.manual_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_name TEXT NOT NULL,
    destination_house TEXT NOT NULL,
    guard_id UUID REFERENCES public.profiles(id),
    cluster_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE ALERTAS DE SEGURIDAD
CREATE TABLE IF NOT EXISTS public.security_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'normal' CHECK (severity IN ('info', 'normal', 'critical')),
    created_by UUID REFERENCES public.profiles(id),
    cluster_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ASEGURAR TOKEN DE PUSH EN PERFILES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='expo_push_token') THEN
        ALTER TABLE public.profiles ADD COLUMN expo_push_token TEXT;
    END IF;
END $$;

-- 4. REPARAR RLS PARA VOTACIONES (Habilitar para administradores de conjunto)
DROP POLICY IF EXISTS "Admins can manage votings" ON public.internal_votings;
CREATE POLICY "Admins can manage votings" ON public.internal_votings
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
) WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
);

-- 5. HABILITAR RLS EN NUEVAS TABLAS
ALTER TABLE public.manual_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guards can manage manual logs" ON public.manual_access_logs
FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('guard', 'admin', 'superadmin') );

CREATE POLICY "All can view security alerts" ON public.security_alerts
FOR SELECT USING (true);

-- 6. RPC PARA COLA DE NOTIFICACIONES (Simulación para Edge Function)
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.rpc_queue_notification(
  p_token text,
  p_title text,
  p_body text,
  p_data jsonb DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notification_queue (token, title, body, data)
  VALUES (p_token, p_title, p_body, p_data);
END;
$$;

-- 7. REPARAR RLS PARA VOTACIONES (MÁS ROBUSTO)
-- Aseguramos que los administradores puedan insertar sin importar políticas previas
DROP POLICY IF EXISTS "Admins can manage votings" ON public.internal_votings;
CREATE POLICY "Admins can manage votings" ON public.internal_votings
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
);

DROP POLICY IF EXISTS "Votings viewable by all" ON public.internal_votings;
CREATE POLICY "Votings viewable by all" ON public.internal_votings
FOR SELECT TO authenticated
USING ( true );
