-- SCRIPT PARA SINCRONIZAR USUARIOS EN LA BASE DE DATOS PÚBLICA (profiles)
-- Sincronizado con los UUIDs reales de Supabase Auth.

-- 1. JESÚS ADMIN (admin@caminos.com)
INSERT INTO public.profiles (id, email, first_name, last_name, role, status, residential_cluster, house_number)
VALUES ('11f36bf3-d939-4844-bd48-84cb151b8f55', 'admin@caminos.com', 'JESÚS', 'ADMIN', 'superadmin', 'active', 'LAS HUERTAS', 'ADMIN-01')
ON CONFLICT (id) DO UPDATE SET role = 'superadmin', status = 'active';

-- 2. JESÚS ADMIN (admin@huertas.com)
INSERT INTO public.profiles (id, email, first_name, last_name, role, status, residential_cluster, house_number)
VALUES ('7386a821-2d6d-4add-b923-db6aa3974bc0', 'admin@huertas.com', 'JESÚS', 'ADMIN', 'admin', 'active', 'LAS HUERTAS', 'ADMIN-02')
ON CONFLICT (id) DO UPDATE SET role = 'admin', status = 'active';

-- 3. CARLOS PIRELA (ofi.pirela@gmail.com)
INSERT INTO public.profiles (id, email, first_name, last_name, role, status, residential_cluster, house_number)
VALUES ('c0abf806-8d6d-4836-b738-5fa9c0351c0a', 'ofi.pirela@gmail.com', 'CARLOS', 'PIRELA', 'resident', 'active', 'LAS HUERTAS', '14-28')
ON CONFLICT (id) DO UPDATE SET status = 'active';

-- 4. JESÚS PIRELA (jess.pirela@gmail.com)
INSERT INTO public.profiles (id, email, first_name, last_name, role, status, residential_cluster, house_number)
VALUES ('f9075e77-2e22-4c9f-9109-4f2f7d82f0df', 'jess.pirela@gmail.com', 'JESÚS', 'PIRELA', 'resident', 'active', 'LAS HUERTAS', '14-28')
ON CONFLICT (id) DO UPDATE SET status = 'active';

-- 5. JESÚS VIGILANTE (vigilante@huertas.com)
INSERT INTO public.profiles (id, email, first_name, last_name, role, status, residential_cluster, house_number)
VALUES ('a4b19db7-6a38-4803-b33e-b6e0908ab909', 'vigilante@huertas.com', 'JESÚS', 'VIGILANTE', 'guard', 'active', 'LAS HUERTAS', 'CASETA')
ON CONFLICT (id) DO UPDATE SET role = 'guard', status = 'active';
