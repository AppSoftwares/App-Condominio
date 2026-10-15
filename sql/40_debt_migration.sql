-- ============================================================================
-- 40_debt_migration.sql: Debt Migration Schema, Tables, RLS, and RPC function
-- ============================================================================

-- 1. New columns on public.debts
alter table public.debts add column if not exists monto_original numeric;
alter table public.debts add column if not exists es_saldo_historico boolean not null default false;
alter table public.debts add column if not exists permite_abono boolean not null default false;
alter table public.debts add column if not exists origen text not null default 'cuota';
alter table public.debts add column if not exists periodo date;
alter table public.debts add column if not exists as_of_date date;
alter table public.debts add column if not exists migration_id uuid;

-- Initialize monto_original where null
update public.debts set monto_original = monto_pendiente where monto_original is null;

-- Add check constraint NOT VALID to avoid immediate validation failure on legacy negative/bad data
alter table public.debts drop constraint if exists check_monto_pendiente_positive;
alter table public.debts add constraint check_monto_pendiente_positive check (monto_pendiente >= 0) not valid;
-- Command to validate later: alter table public.debts validate constraint check_monto_pendiente_positive;


-- 2. Table public.debt_migrations
create table if not exists public.debt_migrations (
  id uuid primary key default gen_random_uuid(),
  residente_id uuid not null references public.profiles(id) on delete cascade,
  residential_cluster text,
  as_of_date date not null,
  balance_usd numeric(14,2) not null,
  source_type text check (source_type in ('xlsx','pdf','manual')),
  source_file_name text,
  source_file_sha256 text,
  statement_lines jsonb,
  status text not null default 'applied' check (status in ('applied','replaced')),
  imported_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Unique partial index: one active migration per resident
create unique index if not exists uq_debt_migration_active
  on public.debt_migrations(residente_id) where status = 'applied';

-- Enable RLS on debt_migrations
alter table public.debt_migrations enable row level security;

drop policy if exists "Debt migrations select policy" on public.debt_migrations;
create policy "Debt migrations select policy" on public.debt_migrations
  for select using (
    residente_id = auth.uid()
    or public.get_my_role() = 'superadmin'
    or (
      public.get_my_role() = 'admin'
      and residential_cluster is not distinct from public.get_my_cluster()
    )
  );


-- 3. condo_settings column for cut-off rule
alter table public.condo_settings add column if not exists corte_incluye_saldo_historico boolean not null default false;


-- 4. Placeholder / Foundation table public.payment_allocations (policies added in prompt 3)
create table if not exists public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  debt_id uuid not null references public.debts(id) on delete restrict,
  amount_usd numeric(14,2) not null check (amount_usd > 0),
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  unique (payment_id, debt_id)
);
alter table public.payment_allocations enable row level security;


-- 5. RPC function public.rpc_migrate_debt
create or replace function public.rpc_migrate_debt(
  p_residente_id uuid,
  p_as_of date,
  p_balance numeric,
  p_lines jsonb default null,
  p_source_type text default 'manual',
  p_file_name text default null,
  p_file_sha256 text default null,
  p_replace boolean default false,
  p_allow_partial boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_admin_cluster text;
  v_res_cluster text;
  v_res_role text;
  v_active_migration_id uuid;
  v_active_debt_id uuid;
  v_has_allocations boolean := false;
  v_monto_orig numeric;
  v_monto_pend numeric;
  v_new_debt_id uuid;
  v_new_migration_id uuid;
  v_concept text;
begin
  v_role := public.get_my_role();
  v_admin_cluster := public.get_my_cluster();

  if v_role not in ('admin', 'superadmin') then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  -- Verify target resident exists and get their cluster & role
  select residential_cluster, role into v_res_cluster, v_res_role
  from public.profiles
  where id = p_residente_id;

  if not found or v_res_role <> 'resident' then
    raise exception 'Propietario no encontrado o no es residente';
  end if;

  if v_role = 'admin' and v_res_cluster is distinct from v_admin_cluster then
    raise exception 'No autorizado para este conjunto' using errcode = '42501';
  end if;

  if p_balance <= 0 or p_balance > 1000000 then
    raise exception 'Monto de saldo pendiente inválido (debe ser > 0 y <= 1,000,000)';
  end if;

  if p_as_of is null or p_as_of > current_date then
    raise exception 'Fecha de corte inválida (no puede ser futura)';
  end if;

  if p_lines is not null and jsonb_array_length(p_lines) > 300 then
    raise exception 'Demasiadas líneas en el estado de cuenta (máximo 300)';
  end if;

  -- Check existing active migration
  select id into v_active_migration_id
  from public.debt_migrations
  where residente_id = p_residente_id and status = 'applied';

  if found then
    if not p_replace then
      raise exception 'Ya existe una migracion activa para este propietario' using errcode = '23505';
    else
      -- Find associated debt
      select id, monto_original, monto_pendiente into v_active_debt_id, v_monto_orig, v_monto_pend
      from public.debts
      where migration_id = v_active_migration_id;

      -- Check if debt has partial payments / allocations
      if v_active_debt_id is not null then
        if v_monto_pend < v_monto_orig then
          raise exception 'La deuda migrada ya tiene abonos; ajusta manualmente';
        end if;

        if to_regclass('public.payment_allocations') is not null then
          select exists (
            select 1 from public.payment_allocations where debt_id = v_active_debt_id
          ) into v_has_allocations;
        end if;

        if v_has_allocations then
          raise exception 'La deuda migrada ya tiene abonos registrados; ajusta manualmente';
        end if;

        -- Delete old debt and mark migration as replaced
        delete from public.debts where id = v_active_debt_id;
      end if;

      update public.debt_migrations
      set status = 'replaced'
      where id = v_active_migration_id;
    end if;
  end if;

  -- Insert new debt migration record
  insert into public.debt_migrations (
    residente_id, residential_cluster, as_of_date, balance_usd,
    source_type, source_file_name, source_file_sha256, statement_lines,
    status, imported_by
  )
  values (
    p_residente_id, v_res_cluster, p_as_of, p_balance,
    p_source_type, p_file_name, p_file_sha256, p_lines,
    'applied', auth.uid()
  )
  returning id into v_new_migration_id;

  v_concept := 'Saldo pendiente al ' || to_char(p_as_of, 'DD/MM/YYYY');

  -- Insert new historical debt row
  insert into public.debts (
    residente_id, residential_cluster, concepto, monto_original, monto_pendiente,
    fecha_vencimiento, pagada, es_saldo_historico, permite_abono, origen,
    as_of_date, migration_id
  )
  values (
    p_residente_id, v_res_cluster, v_concept, p_balance, p_balance,
    p_as_of, false, true, p_allow_partial, 'saldo_historico',
    p_as_of, v_new_migration_id
  )
  returning id into v_new_debt_id;

  return jsonb_build_object(
    'migration_id', v_new_migration_id,
    'debt_id', v_new_debt_id
  );
end;
$$;

revoke all on function public.rpc_migrate_debt from public, anon;
grant execute on function public.rpc_migrate_debt to authenticated;


-- ============================================================================
-- TESTS DE PRUEBA (Comentarios)
-- ============================================================================
/*
  PRUEBAS MANUALES / SQL:
  -- (a) Residente intentando llamar rpc_migrate_debt -> debe dar error 42501 'No autorizado'.
  -- (b) Admin de otro conjunto intentando migrar a un residente de otro cluster -> error 42501.
  -- (c) Migrar dos veces al mismo residente sin p_replace := true -> error 23505 'Ya existe una migracion activa...'.
  -- (d) Reemplazar sin abonos (p_replace := true) -> actualiza la migración previa y reemplaza la deuda histórica.
  -- (e) Residente consultando debt_migrations -> ve sus propias migraciones pero no las de otros.
*/
