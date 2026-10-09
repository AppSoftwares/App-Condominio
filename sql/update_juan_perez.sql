-- SCRIPT PARA ACTUALIZAR LOS DATOS DE JUAN PERÉZ
-- Este script busca al usuario por correo y actualiza su perfil con la nueva información.

DO $$
DECLARE
    v_email TEXT := 'PRUEBA@HUERTAS.COM';
    v_target_id UUID;
BEGIN
    -- 1. Intentamos obtener el ID del usuario desde la tabla de autenticación de Supabase
    SELECT id INTO v_target_id FROM auth.users WHERE LOWER(email) = LOWER(v_email);

    IF v_target_id IS NOT NULL THEN
        -- 2. Actualizamos o insertamos en la tabla public.profiles
        INSERT INTO public.profiles (
            id,
            email,
            first_name,
            last_name,
            role,
            residential_cluster,
            house_number,
            status
        )
        VALUES (
            v_target_id,
            LOWER(v_email),
            'JUAN',
            'PERÉZ',
            'resident',
            'III ETAPA',
            'LAS HUERTAS 14-100',
            'active'
        )
        ON CONFLICT (id) DO UPDATE
        SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            residential_cluster = EXCLUDED.residential_cluster,
            house_number = EXCLUDED.house_number,
            status = 'active';

        RAISE NOTICE 'Datos de Juan Peréz actualizados correctamente.';
    ELSE
        RAISE WARNING 'El usuario con correo % no existe en Supabase Auth. Primero créalo en Authentication -> Users.', v_email;
    END IF;
END $$;
