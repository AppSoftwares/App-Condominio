-- CONFIGURACIÓN DE ALMACENAMIENTO PARA AVATARES

-- 1. Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Políticas de acceso para el bucket 'avatars'
-- Permitir que cualquiera vea los avatares
CREATE POLICY "Avatares públicos" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Permitir que usuarios autenticados suban sus propios avatares
CREATE POLICY "Usuarios pueden subir avatares" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuarios actualicen sus propios avatares
CREATE POLICY "Usuarios pueden actualizar avatares" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuarios eliminen sus propios avatares
CREATE POLICY "Usuarios pueden eliminar avatares" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
