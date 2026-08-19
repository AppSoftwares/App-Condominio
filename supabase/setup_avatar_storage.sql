-- CONFIGURACIÓN DE STORAGE PARA AVATARES

-- 1. Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Borrar políticas antiguas para evitar duplicados
DROP POLICY IF EXISTS "Avatares públicos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden subir su propio avatar" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden borrar su propio avatar" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio avatar" ON storage.objects;

-- 2. Permitir lectura pública (Cualquiera puede ver las fotos de perfil)
CREATE POLICY "Avatares públicos" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- 3. Permitir subida (Solo el dueño del archivo, identificado por la carpeta con su ID)
CREATE POLICY "Usuarios pueden subir su propio avatar" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Permitir actualización/borrado (Solo el dueño)
CREATE POLICY "Usuarios pueden actualizar su propio avatar" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Usuarios pueden borrar su propio avatar" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
