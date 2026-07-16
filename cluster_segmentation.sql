-- MIGRACIÓN PARA SEGMENTACIÓN POR CONJUNTO RESIDENCIAL (ACTUALIZADA)

-- 0. ASEGURAR QUE LAS TABLAS EXISTAN
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    mensaje TEXT,
    tipo TEXT DEFAULT 'general',
    imagen_url TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id),
    monto_bs DECIMAL,
    monto_usd DECIMAL,
    referencia TEXT,
    banco_origen TEXT,
    status TEXT DEFAULT 'pendiente',
    evidencia_url TEXT,
    description TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    residente_id UUID REFERENCES public.profiles(id),
    concepto TEXT NOT NULL,
    monto_pendiente DECIMAL NOT NULL DEFAULT 0,
    fecha_vencimiento DATE,
    pagada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id),
    category TEXT,
    location TEXT,
    description TEXT,
    status TEXT DEFAULT 'Pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. EXTENDER TABLAS PARA INCLUIR EL CLUSTER
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS residential_cluster TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS residential_cluster TEXT;
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS residential_cluster TEXT;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS residential_cluster TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS residential_cluster TEXT;

-- 2. FUNCIÓN PARA OBTENER EL CLUSTER DEL USUARIO AUTENTICADO
CREATE OR REPLACE FUNCTION public.get_my_cluster()
RETURNS TEXT AS $$
  SELECT residential_cluster FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. ACTUALIZAR POLÍTICAS DE RLS PARA FILTRADO AUTOMÁTICO

-- Announcements: Solo su cluster o generales
DROP POLICY IF EXISTS "Announcements view" ON public.announcements;
DROP POLICY IF EXISTS "Announcements cluster-based view" ON public.announcements;
CREATE POLICY "Announcements cluster-based view" ON public.announcements
    FOR SELECT USING (
        residential_cluster = public.get_my_cluster()
        OR residential_cluster IS NULL
        OR tipo = 'general'
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
    );

-- Payments: El admin ve los de su cluster
DROP POLICY IF EXISTS "Payments access" ON public.payments;
DROP POLICY IF EXISTS "Payments cluster-based access" ON public.payments;
CREATE POLICY "Payments cluster-based access" ON public.payments
    FOR ALL USING (
        profile_id = auth.uid()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
        OR (
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
            AND (SELECT residential_cluster FROM public.profiles WHERE id = COALESCE(payments.profile_id, auth.uid())) = public.get_my_cluster()
        )
    );

-- Debts: El admin ve las de su cluster
DROP POLICY IF EXISTS "Debts access" ON public.debts;
DROP POLICY IF EXISTS "Debts cluster-based access" ON public.debts;
CREATE POLICY "Debts cluster-based access" ON public.debts
    FOR SELECT USING (
        residente_id = auth.uid()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
        OR (
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
            AND (SELECT residential_cluster FROM public.profiles WHERE id = debts.residente_id) = public.get_my_cluster()
        )
    );

-- Incidents: El admin ve las de su cluster
DROP POLICY IF EXISTS "Incidents access" ON public.incidents;
DROP POLICY IF EXISTS "Incidents cluster-based access" ON public.incidents;
CREATE POLICY "Incidents cluster-based access" ON public.incidents
    FOR ALL USING (
        profile_id = auth.uid()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
        OR (
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
            AND (SELECT residential_cluster FROM public.profiles WHERE id = incidents.profile_id) = public.get_my_cluster()
        )
    );

-- 4. POLÍTICA PARA PERFILES
DROP POLICY IF EXISTS "Profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles segmentation" ON public.profiles;
CREATE POLICY "Profiles segmentation" ON public.profiles
    FOR ALL USING (
        auth.uid() = id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
        OR (
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
            AND residential_cluster = (SELECT p.residential_cluster FROM public.profiles p WHERE p.id = auth.uid())
        )
    );

-- 5. TRIGGER PARA AUTO-ASIGNAR CLUSTER A NUEVOS REGISTROS
CREATE OR REPLACE FUNCTION public.auto_assign_cluster()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.residential_cluster IS NULL THEN
        IF TG_TABLE_NAME = 'payments' THEN
            -- Manejar tanto profile_id como user_id (compatibilidad)
            NEW.residential_cluster := (SELECT residential_cluster FROM public.profiles WHERE id = COALESCE(NEW.profile_id, auth.uid()));
        ELSIF TG_TABLE_NAME = 'debts' THEN
            NEW.residential_cluster := (SELECT residential_cluster FROM public.profiles WHERE id = NEW.residente_id);
        ELSIF TG_TABLE_NAME = 'incidents' THEN
            NEW.residential_cluster := (SELECT residential_cluster FROM public.profiles WHERE id = NEW.profile_id);
        ELSIF TG_TABLE_NAME = 'reservations' THEN
            NEW.residential_cluster := (SELECT residential_cluster FROM public.profiles WHERE id = NEW.user_id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar disparadores
DROP TRIGGER IF EXISTS tr_auto_cluster_payments ON public.payments;
CREATE TRIGGER tr_auto_cluster_payments BEFORE INSERT ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_cluster();

DROP TRIGGER IF EXISTS tr_auto_cluster_debts ON public.debts;
CREATE TRIGGER tr_auto_cluster_debts BEFORE INSERT ON public.debts
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_cluster();

DROP TRIGGER IF EXISTS tr_auto_cluster_incidents ON public.incidents;
CREATE TRIGGER tr_auto_cluster_incidents BEFORE INSERT ON public.incidents
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_cluster();

DROP TRIGGER IF EXISTS tr_auto_cluster_reservations ON public.reservations;
CREATE TRIGGER tr_auto_cluster_reservations BEFORE INSERT ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_cluster();
