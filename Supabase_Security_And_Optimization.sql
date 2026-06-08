-- CONFIGURACIÓN DE SEGURIDAD (ROW LEVEL SECURITY)
-- Habilita RLS en las tablas principales
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACCESO
-- Los usuarios solo pueden ver y editar su propio perfil
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Los residentes solo ven sus propios pagos, los administradores ven todos
CREATE POLICY "Residents view own payments" ON payments
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- OPTIMIZACIÓN DE BASE DE DATOS (ÍNDICES)
-- Índices para búsquedas frecuentes y filtros
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_requests_house ON requests(house_number);

-- CACHE RECOMENDADO
-- Se recomienda implementar React Query para el manejo de cache en el frontend.
-- Esto ya está en el package.json (@tanstack/react-query).
