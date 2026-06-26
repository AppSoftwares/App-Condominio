-- TABLA PARA RESERVACIONES DE ÁREAS COMUNES
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    area_name TEXT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Anyone can view reservations" ON public.reservations;
CREATE POLICY "Anyone can view reservations" ON public.reservations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own reservations" ON public.reservations;
CREATE POLICY "Users can create their own reservations" ON public.reservations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reservations" ON public.reservations;
CREATE POLICY "Users can delete their own reservations" ON public.reservations
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage all reservations" ON public.reservations;
CREATE POLICY "Admins manage all reservations" ON public.reservations
    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
