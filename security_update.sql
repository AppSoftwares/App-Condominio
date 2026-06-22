-- ACTUALIZACIÓN DE SEGURIDAD Y RENDIMIENTO

-- 1. ASEGURAR RLS EN TODAS LAS TABLAS
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS residents_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS requests ENABLE ROW LEVEL SECURITY;

-- 2. TABLAS FALTANTES (Migración de Zustand a Supabase)
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id),
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'Pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    options JSONB NOT NULL,
    end_date DATE,
    priority TEXT DEFAULT 'Baja',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id),
    house_number TEXT NOT NULL,
    option_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, house_number) -- Un voto por casa
);
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE SEGURIDAD (RLS)

-- Requests (Faltaban en opt.sql)
DROP POLICY IF EXISTS "Users can view their own requests" ON requests;
CREATE POLICY "Users can view their own requests" ON requests
    FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can insert their own requests" ON requests;
CREATE POLICY "Users can insert their own requests" ON requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Incidents
DROP POLICY IF EXISTS "Users can view all incidents" ON incidents;
CREATE POLICY "Users can view all incidents" ON incidents
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can report incidents" ON incidents;
CREATE POLICY "Users can report incidents" ON incidents
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Polls
DROP POLICY IF EXISTS "Everyone authenticated can view polls" ON polls;
CREATE POLICY "Everyone authenticated can view polls" ON polls
    FOR SELECT USING (auth.role() = 'authenticated');

-- Poll Votes
DROP POLICY IF EXISTS "Users can view all votes" ON poll_votes;
CREATE POLICY "Users can view all votes" ON poll_votes
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can vote" ON poll_votes;
CREATE POLICY "Users can vote" ON poll_votes
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- 4. OPTIMIZACIÓN (ÍNDICES ADICIONALES)
CREATE INDEX IF NOT EXISTS idx_incidents_profile_id ON incidents(profile_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_house ON poll_votes(house_number);
CREATE INDEX IF NOT EXISTS idx_profiles_house ON profiles(house_number);

-- 5. RATE LIMITING (Sugerencia para Supabase Edge Functions o Configuración)
-- Se recomienda configurar en el Dashboard de Supabase:
-- Auth > Settings > Rate Limits
-- Email: 3 solicitudes por hora por IP/Usuario.
