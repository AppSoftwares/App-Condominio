-- ================================================================================
-- SCRIPT PARA VINCULACIÓN AUTOMÁTICA DE INGRESOS MANUALES (Vigilante -> Residente)
-- ================================================================================
-- Este script permite que cuando un vigilante registra un ingreso manual por número
-- de casa, el registro aparezca automáticamente en la app del residente respectivo.

-- 1. Asegurar la columna de vinculación en la tabla de logs
ALTER TABLE public.manual_access_logs
ADD COLUMN IF NOT EXISTS resident_id UUID REFERENCES public.profiles(id);

-- 2. Función de resolución y sincronización
CREATE OR REPLACE FUNCTION public.fn_sync_manual_access()
RETURNS TRIGGER AS $$
DECLARE
    found_resident_id UUID;
    clean_cluster TEXT;
BEGIN
    -- Normalizamos el nombre del conjunto (ej: "Conjunto 14 Las Huertas" -> "Las Huertas")
    -- Esto asegura que el "match" funcione aunque el Admin y el Residente tengan nombres ligeramente distintos.
    clean_cluster := REGEXP_REPLACE(NEW.cluster_name, 'Conjunto\s+\d+\s+', '', 'i');

    -- Buscamos el ID del residente por número de casa y conjunto
    SELECT id INTO found_resident_id
    FROM public.profiles
    WHERE house_number = NEW.destination_house
      AND (residential_cluster ILIKE '%' || clean_cluster || '%')
    LIMIT 1;

    -- Si encontramos al residente:
    IF found_resident_id IS NOT NULL THEN
        -- A) Vinculamos el log manual directamente
        NEW.resident_id := found_resident_id;

        -- B) Insertamos un registro en guest_invitations para que aparezca en el historial del residente
        -- Usamos BEGIN...EXCEPTION para que si el residente está bloqueado por DEUDA,
        -- el VIGILANTE igual pueda terminar de guardar su reporte de seguridad.
        BEGIN
            INSERT INTO public.guest_invitations (
                resident_id,
                guest_name,
                status,
                allowed_areas,
                created_at
            ) VALUES (
                found_resident_id,
                NEW.visitor_name,
                'used', -- Marcado como usado ya que es un ingreso en puerta
                ARRAY['residencia'],
                NOW()
            );
        EXCEPTION WHEN OTHERS THEN
            -- Si falla el insert en invitaciones (por RLS o triggers de deuda),
            -- permitimos que el log de seguridad del guardia se guarde igual.
            NULL;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear el Trigger para automatizar el proceso
DROP TRIGGER IF EXISTS tr_sync_manual_access ON public.manual_access_logs;
CREATE TRIGGER tr_sync_manual_access
BEFORE INSERT ON public.manual_access_logs
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_manual_access();

-- 4. OTORGAR PERMISOS ADICIONALES
GRANT ALL ON public.manual_access_logs TO authenticated;
