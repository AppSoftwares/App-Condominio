-- SCHEMA DE PRODUCCIÓN PARA CAMINOS DE LA LAGUNITA

-- 1. TABLA DE PERFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'resident' CHECK (role IN ('resident', 'admin', 'guard', 'superadmin')),
    residential_cluster TEXT,
    house_number TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE DEUDAS (Para que aparezcan en el Dashboard)
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    residente_id UUID REFERENCES public.profiles(id),
    concepto TEXT NOT NULL,
    monto_pendiente DECIMAL NOT NULL DEFAULT 0,
    fecha_vencimiento DATE,
    pagada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE PAGOS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id),
    monto_bs DECIMAL,
    monto_usd DECIMAL,
    referencia TEXT,
    banco_origen TEXT,
    status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'approved', 'rejected')),
    evidencia_url TEXT,
    description TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE ANUNCIOS
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    mensaje TEXT,
    tipo TEXT DEFAULT 'general',
    imagen_url TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE INCIDENCIAS
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id),
    category TEXT,
    location TEXT,
    description TEXT,
    status TEXT DEFAULT 'Pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. HABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS BÁSICAS
-- Profiles: Propios o Admin
CREATE POLICY "Profiles access" ON public.profiles FOR ALL USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin'));

-- Debts: Propias o Admin
CREATE POLICY "Debts access" ON public.debts FOR SELECT USING (residente_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin'));

-- Payments: Propios o Admin
CREATE POLICY "Payments access" ON public.payments FOR ALL USING (profile_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin'));

-- Announcements: Todos ven
CREATE POLICY "Announcements view" ON public.announcements FOR SELECT USING (true);

-- Incidents: Propios o Admin
CREATE POLICY "Incidents access" ON public.incidents FOR ALL USING (profile_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin'));

-- 8. FUNCIÓN DE SEGURIDAD PARA ADMIN (Corregida y Endurecida)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- 9. INSERTAR USUARIOS INICIALES (Instrucciones)
-- Nota: Los usuarios deben crearse primero en Supabase Auth y luego insertarse aquí.
-- Sin embargo, el sistema de Whitelist en el código ya permite el login inicial.
