-- CONFIGURACIÓN FINAL PARA LANZAMIENTO (PRUEBAS CERRADAS)

-- 1. TABLA DE PERFILES (Asegurar estructura)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'resident',
    residential_cluster TEXT,
    house_number TEXT,
    status TEXT DEFAULT 'pending',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. TABLA DE PAGOS (Asegurar columnas para capturas)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    amount_usd DECIMAL,
    method TEXT,
    screenshot_url TEXT,
    details JSONB,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Residents view own payments" ON payments;
CREATE POLICY "Residents view own payments" ON payments
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Residents insert own payments" ON payments;
CREATE POLICY "Residents insert own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage payments" ON payments;
CREATE POLICY "Admins manage payments" ON payments
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. TABLA DE EMPLEADOS (Información Real)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    cedula TEXT UNIQUE NOT NULL,
    cargo TEXT,
    fecha_ingreso DATE,
    sueldo_usd DECIMAL DEFAULT 0,
    bono_alimentacion_usd DECIMAL DEFAULT 0,
    bono_transporte_usd DECIMAL DEFAULT 0,
    prestamos_bs DECIMAL DEFAULT 0,
    dias_descontados INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage employees" ON employees;
CREATE POLICY "Admins can manage employees" ON employees
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can view employee basic info" ON employees;
CREATE POLICY "Users can view employee basic info" ON employees
    FOR SELECT USING (true);

-- 4. BUCKET DE ALMACENAMIENTO (Comprobantes)
-- Nota: Esto se debe crear manualmente en el panel de Supabase como 'payment-captures'
-- O usar estas políticas si ya existe el bucket:
-- insert into storage.buckets (id, name, public) values ('payment-captures', 'payment-captures', true);
