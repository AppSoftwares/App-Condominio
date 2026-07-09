-- Insert profiles by matching existing auth.users by email.
-- PRECONDITION: create the users first in Supabase Console -> Authentication -> Users (use the emails and passwords from your list).
-- Then run this script in Supabase SQL editor. It inserts or upserts a profile row per auth.user email.

-- 1) SUPER ADMIN (GLOBAL)
WITH u AS (
  SELECT id, email FROM auth.users WHERE email = 'ADMIN@CAMINOS.COM'
)
INSERT INTO public.profiles (id, email, first_name, last_name, role, residential_cluster, house_number, status)
SELECT id, email, 'JESÚS', 'ADMIN', 'superadmin', NULL, NULL, 'active' FROM u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  residential_cluster = EXCLUDED.residential_cluster,
  house_number = EXCLUDED.house_number,
  status = EXCLUDED.status;

-- 2) ADMINISTRADOR (LAS HUERTAS)
WITH u AS (
  SELECT id, email FROM auth.users WHERE email = 'ADMIN@HUERTAS.COM'
)
INSERT INTO public.profiles (id, email, first_name, last_name, role, residential_cluster, house_number, status)
SELECT id, email, 'JESÚS', 'ADMIN', 'admin', 'LAS HUERTAS', NULL, 'active' FROM u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  residential_cluster = EXCLUDED.residential_cluster,
  house_number = EXCLUDED.house_number,
  status = EXCLUDED.status;

-- 3) CARLOS PIRELA (RESIDENTE 14-28)
WITH u AS (
  SELECT id, email FROM auth.users WHERE email = 'OFI.PIRELA@GMAIL.COM'
)
INSERT INTO public.profiles (id, email, first_name, last_name, role, residential_cluster, house_number, status)
SELECT id, email, 'CARLOS', 'PIRELA', 'resident', 'LAS HUERTAS', '14-28', 'active' FROM u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  residential_cluster = EXCLUDED.residential_cluster,
  house_number = EXCLUDED.house_number,
  status = EXCLUDED.status;

-- 4) JESÚS PIRELA (RESIDENTE 14-28)
WITH u AS (
  SELECT id, email FROM auth.users WHERE email = 'JESS.PIRELA@GMAIL.COM'
)
INSERT INTO public.profiles (id, email, first_name, last_name, role, residential_cluster, house_number, status)
SELECT id, email, 'JESÚS', 'PIRELA', 'resident', 'LAS HUERTAS', '14-28', 'active' FROM u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  residential_cluster = EXCLUDED.residential_cluster,
  house_number = EXCLUDED.house_number,
  status = EXCLUDED.status;

-- 5) JUAN PÉREZ (RESIDENTE 14-100)
WITH u AS (
  SELECT id, email FROM auth.users WHERE email = 'PRUEBA@HUERTAS.COM'
)
INSERT INTO public.profiles (id, email, first_name, last_name, role, residential_cluster, house_number, status)
SELECT id, email, 'JUAN', 'PÉREZ', 'resident', 'LAS HUERTAS', '14-100', 'active' FROM u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  residential_cluster = EXCLUDED.residential_cluster,
  house_number = EXCLUDED.house_number,
  status = EXCLUDED.status;

-- 6) JESÚS VIGILANTE (VIGILANTE)
WITH u AS (
  SELECT id, email FROM auth.users WHERE email = 'VIGILANTE@HUERTAS.COM'
)
INSERT INTO public.profiles (id, email, first_name, last_name, role, residential_cluster, house_number, status)
SELECT id, email, 'JESÚS', 'VIGILANTE', 'guard', 'LAS HUERTAS', NULL, 'active' FROM u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  residential_cluster = EXCLUDED.residential_cluster,
  house_number = EXCLUDED.house_number,
  status = EXCLUDED.status;

-- End of script
