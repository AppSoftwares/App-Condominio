-- SCRIPT DE REPARACIÓN DE PERFILES DE USUARIO
-- Úselo cuando un usuario puede autenticarse pero recibe el error "No se encontró un perfil asociado"

-- 1. Reparar un usuario específico (ejemplo: prueba@huertas.com)
-- Primero, identifique el UUID del usuario en la tabla auth.users si es posible,
-- o simplemente inserte el perfil si conoce los datos.

DO $$
DECLARE
    target_email TEXT := 'prueba@huertas.com';
    target_id UUID;
BEGIN
    -- Intentar obtener el ID del usuario de la tabla de autenticación de Supabase
    SELECT id INTO target_id FROM auth.users WHERE email = target_email;

    IF target_id IS NOT NULL THEN
        -- Insertar el perfil si no existe
        INSERT INTO public.profiles (id, email, first_name, last_name, role, residential_cluster, house_number, status)
        VALUES (
            target_id,
            target_email,
            'Usuario', -- Nombre temporal
            'Prueba',  -- Apellido temporal
            'resident',
            'Las Huertas', -- Cluster detectado por el correo
            'POR_ASIGNAR',
            'active'
        )
        ON CONFLICT (id) DO UPDATE
        SET status = 'active', email = target_email;

        RAISE NOTICE 'Perfil reparado para el usuario: %', target_email;
    ELSE
        RAISE WARNING 'No se encontró el usuario en auth.users para el correo: %', target_email;
    END IF;
END $$;

-- 2. Script de sincronización masiva (Opcional - Úselo con precaución)
-- Inserta perfiles básicos para todos los usuarios de Auth que no tengan uno.

/*
INSERT INTO public.profiles (id, email, first_name, last_name, role, status)
SELECT id, email, 'Nuevo', 'Residente', 'resident', 'pending'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT DO NOTHING;
*/
