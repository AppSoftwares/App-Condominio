-- EJECUTA ESTO EN EL SQL EDITOR DE SUPABASE PARA ARREGLAR LA SUBIDA DE COMPROBANTES - SECURE VERSION

-- 1. Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-captures', 'payment-captures', true)
ON CONFLICT (id) DO NOTHING;

-- Borrar políticas antiguas para evitar duplicados
DROP POLICY IF EXISTS "Permitir subida a residentes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura pública" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización a dueños" ON storage.objects;
DROP POLICY IF EXISTS "Admin full access to captures" ON storage.objects;
DROP POLICY IF EXISTS "Residents can view own captures" ON storage.objects;

-- 2. Habilitar subida para usuarios autenticados
CREATE POLICY "Permitir subida a residentes" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-captures');

-- 3. Seguridad de Lectura (SELECT):
-- Evitamos la lectura pública global de la TABLA de objetos (que permite listar).
-- Los archivos seguirán siendo accesibles vía URL directa porque el bucket es 'public'.

-- Los residentes solo pueden ver sus propios registros en la tabla
CREATE POLICY "Residents can view own captures" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'payment-captures' AND owner = auth.uid());

-- Los administradores pueden ver todos los registros
CREATE POLICY "Admin full access to captures" ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'payment-captures' AND
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')))
);

-- 4. Permitir que el usuario actualice sus propios archivos
CREATE POLICY "Permitir actualización a dueños" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'payment-captures' AND owner = auth.uid());
