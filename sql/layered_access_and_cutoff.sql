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
-- Nota: En producción usamos la tabla 'payments', pero mantenemos esta lógica para compatibilidad si se usa 'pagos_condominio'
CREATE TABLE IF NOT EXISTS public.pagos_condominio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    residente_id UUID REFERENCES public.profiles(id),
    mes_correspondiente DATE NOT NULL,
    monto DECIMAL NOT NULL,
    pagado BOOLEAN DEFAULT FALSE,
    fecha_pago TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FUNCIÓN PARA VERIFICAR DEUDA (3 o más meses) - ENDURECIDA
CREATE OR REPLACE FUNCTION public.check_debt_limit(res_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    meses_deuda INTEGER;
BEGIN
    -- Verificar en la tabla de deudas oficial
    SELECT COUNT(*) INTO meses_deuda
    FROM public.debts
    WHERE residente_id = res_id AND pagada = FALSE;

    -- También verificar en pagos_condominio si existe
    IF meses_deuda < 3 THEN
        DECLARE
            meses_antiguos INTEGER;
        BEGIN
            SELECT COUNT(*) INTO meses_antiguos
            FROM public.pagos_condominio
            WHERE residente_id = res_id AND pagado = FALSE;
            meses_deuda := meses_deuda + meses_antiguos;
        END;
    END IF;

    RETURN meses_deuda >= 3;
END;
$$;

-- Restringir acceso
REVOKE EXECUTE ON FUNCTION public.check_debt_limit FROM public, anon;
GRANT EXECUTE ON FUNCTION public.check_debt_limit TO authenticated;

-- 4. TRIGGER PARA BLOQUEAR GENERACIÓN DE QR Y RESERVAS - ENDURECIDO
CREATE OR REPLACE FUNCTION public.enforce_debt_cutoff()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF public.check_debt_limit(NEW.resident_id) THEN
        RAISE EXCEPTION 'Acceso bloqueado por deuda pendiente (3 o más meses). Por favor regularice su situación.';
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger para Invitaciones
DROP TRIGGER IF EXISTS tr_block_guest_invitation ON public.guest_invitations;
CREATE TRIGGER tr_block_guest_invitation
BEFORE INSERT ON public.guest_invitations
FOR EACH ROW EXECUTE FUNCTION public.enforce_debt_cutoff();

-- Trigger para Reservas
CREATE OR REPLACE FUNCTION public.enforce_debt_cutoff_reservations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF public.check_debt_limit(NEW.user_id) THEN
        RAISE EXCEPTION 'Reserva bloqueada por deuda pendiente (3 o más meses). Por favor regularice su situación.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_block_reservation ON public.reservations;
CREATE TRIGGER tr_block_reservation
BEFORE INSERT ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.enforce_debt_cutoff_reservations();
