-- ============================================================================
-- 41_partial_payments.sql: Partial Payments, Allocations, Atomic Review, and Cut-off Rule
-- ============================================================================

-- 1. Ensure payment_allocations table and new columns in payments
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

drop policy if exists "Payment allocations select policy" on public.payment_allocations;
create policy "Payment allocations select policy" on public.payment_allocations
  for select using (
    exists (
      select 1 from public.payments p
      where p.id = payment_allocations.payment_id
        and (
          p.profile_id = auth.uid()
          or public.get_my_role() = 'superadmin'
          or (
            public.get_my_role() = 'admin'
            and exists (
              select 1 from public.profiles pr
              where pr.id = p.profile_id
                and pr.residential_cluster is not distinct from public.get_my_cluster()
            )
          )
        )
    )
  );

-- New review columns on payments table
alter table public.payments add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.payments add column if not exists reviewed_at timestamptz;
alter table public.payments add column if not exists review_note text;


-- 2. RPC function public.rpc_submit_payment
create or replace function public.rpc_submit_payment(
  p_monto_bs numeric,
  p_monto_usd numeric,
  p_referencia text,
  p_banco_origen text,
  p_evidencia_url text,
  p_description text,
  p_details jsonb,
  p_idempotency_key text,
  p_allocations jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_payment_id uuid;
  v_alloc jsonb;
  v_debt_id uuid;
  v_amount numeric;
  v_sum_alloc numeric := 0;
  v_debt record;
  v_seen_debts text[] := array[]::text[];
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'No autenticado' using errcode = '42501';
  end if;

  -- Idempotency check
  if p_idempotency_key is not null then
    select id into v_payment_id
    from public.payments
    where profile_id = v_user_id and idempotency_key = p_idempotency_key;

    if found then
      return v_payment_id;
    end if;
  end if;

  if p_monto_usd <= 0 then
    raise exception 'El monto en USD debe ser positivo';
  end if;

  if p_allocations is null or jsonb_array_length(p_allocations) = 0 then
    raise exception 'Debe seleccionar al menos una deuda o abono a pagar';
  end if;

  if jsonb_array_length(p_allocations) > 50 then
    raise exception 'Demasiadas asignaciones de pago (máximo 50)';
  end if;

  -- Insert payment header (status pendiente)
  insert into public.payments (
    profile_id, monto_bs, monto_usd, referencia, banco_origen,
    evidencia_url, description, details, idempotency_key, status
  )
  values (
    v_user_id, p_monto_bs, p_monto_usd, p_referencia, p_banco_origen,
    p_evidencia_url, p_description, p_details, p_idempotency_key, 'pendiente'
  )
  returning id into v_payment_id;

  -- Validate and insert allocations
  for v_alloc in select * from jsonb_array_elements(p_allocations)
  loop
    v_debt_id := (v_alloc->>'debt_id')::uuid;
    v_amount := coalesce((v_alloc->>'amount_usd')::numeric, 0);

    if v_amount <= 0 then
      raise exception 'El monto de asignación debe ser positivo';
    end if;

    -- Check duplicate debt_id in payload
    if v_debt_id::text = any(v_seen_debts) then
      raise exception 'No se puede repetir la misma deuda en un solo pago';
    end if;
    v_seen_debts := array_append(v_seen_debts, v_debt_id::text);

    -- Fetch and lock debt
    select id, residente_id, monto_pendiente, pagada, permite_abono
    into v_debt
    from public.debts
    where id = v_debt_id
    for update;

    if not found or v_debt.residente_id <> v_user_id then
      raise exception 'Deuda no encontrada o no pertenece al usuario';
    end if;

    if v_debt.pagada then
      raise exception 'Una de las deudas seleccionadas ya está pagada';
    end if;

    if v_amount > (v_debt.monto_pendiente + 0.005) then
      raise exception 'El monto excede el saldo pendiente de la deuda';
    end if;

    -- Validation rules for partial vs full
    if not coalesce(v_debt.permite_abono, false) then
      if abs(v_amount - v_debt.monto_pendiente) > 0.005 then
        raise exception 'Esta cuota no permite abonos parciales; debe pagarse completa';
      end if;
    else
      -- Minimum abono rule (US$ 1.00) unless paying remaining balance exact
      if v_amount < 1.00 and abs(v_amount - v_debt.monto_pendiente) > 0.005 then
        raise exception 'El abono mínimo permitido es de US$ 1.00';
      end if;
    end if;

    v_sum_alloc := v_sum_alloc + v_amount;

    insert into public.payment_allocations (payment_id, debt_id, amount_usd)
    values (v_payment_id, v_debt_id, v_amount);
  end loop;

  -- Verify total allocation matches payment usd total
  if abs(v_sum_alloc - p_monto_usd) > 0.01 then
    raise exception 'La suma de las asignaciones (%) no coincide con el monto total del pago (%)', v_sum_alloc, p_monto_usd;
  end if;

  return v_payment_id;
end;
$$;

revoke all on function public.rpc_submit_payment from public, anon;
grant execute on function public.rpc_submit_payment to authenticated;


-- 3. RPC function public.rpc_review_payment
create or replace function public.rpc_review_payment(
  p_payment_id uuid,
  p_status text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_admin_cluster text;
  v_payment record;
  v_payer_cluster text;
  v_alloc record;
  v_debt record;
  v_applied_count int := 0;
  v_legacy boolean := false;
  v_new_pendiente numeric;
  v_new_pagada boolean;
begin
  v_role := public.get_my_role();
  v_admin_cluster := public.get_my_cluster();

  if v_role not in ('admin', 'superadmin') then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if p_status not in ('approved', 'rejected') then
    raise exception 'Estado de revisión inválido (debe ser approved o rejected)';
  end if;

  -- Fetch payment with lock
  select p.*, pr.residential_cluster as payer_cluster
  into v_payment
  from public.payments p
  join public.profiles pr on pr.id = p.profile_id
  where p.id = p_payment_id
  for update;

  if not found then
    raise exception 'Pago no encontrado';
  end if;

  if v_role = 'admin' and v_payment.payer_cluster is distinct from v_admin_cluster then
    raise exception 'No autorizado para revisar pagos de otro conjunto' using errcode = '42501';
  end if;

  if v_payment.status <> 'pendiente' then
    raise exception 'Este pago ya fue revisado anteriormente (estado actual: %)', v_payment.status;
  end if;

  if p_status = 'approved' then
    -- Check if payment has allocations
    select count(*) into v_applied_count
    from public.payment_allocations
    where payment_id = p_payment_id and applied_at is null;

    if v_applied_count = 0 then
      v_legacy := true;
    else
      -- Loop and apply allocations atomically
      for v_alloc in
        select id, debt_id, amount_usd
        from public.payment_allocations
        where payment_id = p_payment_id and applied_at is null
      loop
        -- Lock debt row
        select id, monto_pendiente, pagada, permite_abono
        into v_debt
        from public.debts
        where id = v_alloc.debt_id
        for update;

        if not found then
          raise exception 'Deuda asociada no encontrada';
        end if;

        if v_debt.pagada then
          raise exception 'La deuda ya se encontraba pagada';
        end if;

        if v_alloc.amount_usd > (v_debt.monto_pendiente + 0.005) then
          raise exception 'El monto a descontar (%) excede el saldo actual de la deuda (%)', v_alloc.amount_usd, v_debt.monto_pendiente;
        end if;

        v_new_pendiente := round(v_debt.monto_pendiente - v_alloc.amount_usd, 2);
        v_new_pagada := (v_new_pendiente <= 0);

        update public.debts
        set monto_pendiente = greatest(0, v_new_pendiente),
            pagada = v_new_pagada
        where id = v_alloc.debt_id;

        update public.payment_allocations
        set applied_at = now()
        where id = v_alloc.id;

        v_applied_count := v_applied_count + 1;
      end loop;
    end if;
  end if;

  -- Update payment status
  update public.payments
  set status = p_status,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      review_note = p_note
  where id = p_payment_id;

  return jsonb_build_object(
    'status', p_status,
    'allocations_applied', v_applied_count,
    'legacy_without_allocations', v_legacy
  );
end;
$$;

revoke all on function public.rpc_review_payment from public, anon;
grant execute on function public.rpc_review_payment to authenticated;


-- 4. Updated check_debt_limit taking into account historical debt setting
create or replace function public.check_debt_limit(res_id UUID)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    meses_deuda INTEGER := 0;
    v_include_historical boolean := false;
    v_cuota_mensual numeric := 0;
    v_hist_debt record;
begin
    -- Check condo setting for historical debt cutoff inclusion
    select coalesce(corte_incluye_saldo_historico, false), coalesce(cuota_mensual_usd, 0)
    into v_include_historical, v_cuota_mensual
    from public.condo_settings
    where id = 1;

    -- Count normal unpaid debts (es_saldo_historico = false or null)
    select count(*) into meses_deuda
    from public.debts
    where residente_id = res_id
      and pagada = false
      and coalesce(es_saldo_historico, false) = false;

    -- Include historical debt if configured
    if v_include_historical then
      for v_hist_debt in
        select monto_pendiente
        from public.debts
        where residente_id = res_id
          and pagada = false
          and coalesce(es_saldo_historico, false) = true
      loop
        if v_cuota_mensual > 0 then
          meses_deuda := meses_deuda + ceil(v_hist_debt.monto_pendiente / v_cuota_mensual)::integer;
        else
          meses_deuda := meses_deuda + 1;
        end if;
      end loop;
    end if;

    -- Fallback to pagos_condominio if table exists and debt count is 0
    if meses_deuda < 3 and to_regclass('public.pagos_condominio') is not null then
        DECLARE
            meses_antiguos INTEGER;
        BEGIN
            select count(*) into meses_antiguos
            from public.pagos_condominio
            where residente_id = res_id and pagado = false;
            meses_deuda := meses_deuda + meses_antiguos;
        END;
    END IF;

    return meses_deuda >= 3;
end;
$$;

revoke execute on function public.check_debt_limit(uuid) from public, anon;
grant execute on function public.check_debt_limit(uuid) to authenticated, service_role;


-- ============================================================================
-- TESTS DE PRUEBA (Comentarios)
-- ============================================================================
/*
  PRUEBAS SQL / FUNCIONALES:
  1. Abono parcial sobre saldo histórico (permite_abono = true, monto >= 1.00) -> Se registra correctamente en payment_allocations y reduce monto_pendiente.
  2. Intento de pagar más del saldo pendiente -> rpc_submit_payment lanza excepción.
  3. Intento de abonar menos de US$ 1.00 en cuota con abono permitido sin saldar el resto -> rpc_submit_payment lanza excepción.
  4. Aprobación atómica de pago (rpc_review_payment con status='approved') -> Descuenta el monto de la deuda y marca pagada=true si el saldo llega a 0.
  5. Aprobación duplicada de un pago ya revisado -> rpc_review_payment rechaza con mensaje de que ya fue revisado.
  6. Regla de corte (check_debt_limit) -> Por defecto ignora es_saldo_historico=true, y si se activa en condo_settings, calcula los meses equivalentes según la cuota mensual.
*/
