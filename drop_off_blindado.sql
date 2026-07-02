-- 1. ASEGURAR EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA CASILLERO VIRTUAL
CREATE TABLE IF NOT EXISTS public.casillero_virtual (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    guard_id UUID REFERENCES public.profiles(id),
    courier_name TEXT NOT NULL,
    package_details TEXT,
    status TEXT DEFAULT 'en_custodia' CHECK (status IN ('en_custodia', 'entregado', 'devuelto')),
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    liberation_token TEXT DEFAULT encode(gen_random_bytes(6), 'hex'),
    evidence_url TEXT,
    legal_disclaimer_accepted BOOLEAN DEFAULT TRUE
);

-- 3. COLUMNA PARA NOTIFICACIONES EN PERFILES
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- 4. HABILITAR SEGURIDAD RLS
ALTER TABLE public.casillero_virtual ENABLE ROW LEVEL SECURITY;

-- Borrar políticas si existen para evitar errores al re-ejecutar
DROP POLICY IF EXISTS "Residents view own packages" ON public.casillero_virtual;
DROP POLICY IF EXISTS "Guards manage packages" ON public.casillero_virtual;

-- Residentes ven lo suyo
CREATE POLICY "Residents view own packages" ON public.casillero_virtual
    FOR SELECT USING (auth.uid() = resident_id);

-- Vigilantes manejan todo
CREATE POLICY "Guards manage packages" ON public.casillero_virtual
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'guard'
    ));

-- 5. NOTA SOBRE NOTIFICACIONES
-- Para activar las notificaciones push, se recomienda configurar un "Database Webhook"
-- en el Dashboard de Supabase (Database -> Webhooks) que apunte a la Edge Function
-- cuando ocurra un INSERT en la tabla 'casillero_virtual'.
