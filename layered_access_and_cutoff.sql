-- 0. ASEGURAR EXTENSIONES Y TABLAS BASE
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE INVITACIONES CON ACCESO POR CAPAS
CREATE TABLE IF NOT EXISTS public.guest_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    guest_id_number TEXT,
    allowed_areas TEXT[] DEFAULT ARRAY['residencia'], -- 'residencia', 'parrilleras', 'cancha', 'bohio'
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Habilitar RLS para Invitaciones
ALTER TABLE public.guest_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Residents can manage their own invitations" ON public.guest_invitations
    FOR ALL USING (auth.uid() = resident_id);

CREATE POLICY "Guards can view all invitations" ON public.guest_invitations
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'guard'));

-- 2. ASEGURAR TABLA DE PAGOS (Basado en requerimiento 'pagos_condominio')
CREATE TABLE IF NOT EXISTS public.pagos_condominio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    residente_id UUID REFERENCES public.profiles(id),
    mes_correspondiente DATE NOT NULL,
    monto DECIMAL NOT NULL,
    pagado BOOLEAN DEFAULT FALSE,
    fecha_pago TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FUNCIÓN PARA VERIFICAR DEUDA (3 o más meses)
CREATE OR REPLACE FUNCTION public.check_debt_limit(res_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    meses_deuda INTEGER;
BEGIN
    SELECT COUNT(*) INTO meses_deuda
    FROM public.pagos_condominio
    WHERE residente_id = res_id AND pagado = FALSE;

    RETURN meses_deuda >= 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. TRIGGER PARA BLOQUEAR GENERACIÓN DE QR Y RESERVAS
CREATE OR REPLACE FUNCTION public.enforce_debt_cutoff()
RETURNS TRIGGER AS $$
BEGIN
    IF public.check_debt_limit(NEW.resident_id) THEN
        RAISE EXCEPTION 'Acceso bloqueado por deuda pendiente (3 o más meses). Por favor regularice su situación.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para Invitaciones
DROP TRIGGER IF EXISTS tr_block_guest_invitation ON public.guest_invitations;
CREATE TRIGGER tr_block_guest_invitation
BEFORE INSERT ON public.guest_invitations
FOR EACH ROW EXECUTE FUNCTION public.enforce_debt_cutoff();

-- Trigger para Reservas
-- Asegurar que la tabla de reservaciones existe antes de crear el trigger
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    area_name TEXT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.enforce_debt_cutoff_reservations()
RETURNS TRIGGER AS $$
BEGIN
    IF public.check_debt_limit(NEW.user_id) THEN
        RAISE EXCEPTION 'Reserva bloqueada por deuda pendiente (3 o más meses). Por favor regularice su situación.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_block_reservation ON public.reservations;
CREATE TRIGGER tr_block_reservation
BEFORE INSERT ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.enforce_debt_cutoff_reservations();
