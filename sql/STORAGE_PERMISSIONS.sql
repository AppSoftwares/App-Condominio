-- EJECUTA ESTO EN EL SQL EDITOR DE SUPABASE PARA ARREGLAR LA SUBIDA DE COMPROBANTES

-- 1. Crear el bucket si no existe (normalmente ya existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-captures', 'payment-captures', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar subida para usuarios autenticados
CREATE POLICY "Permitir subida a residentes" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-captures');

-- 3. Permitir lectura pública de los comprobantes (para que el admin los vea)
CREATE POLICY "Permitir lectura pública" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'payment-captures');

-- 4. Permitir que el usuario actualice sus propios archivos si es necesario
CREATE POLICY "Permitir actualización a dueños" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'payment-captures' AND owner = auth.uid());
