-- ============================================================================
-- 30_financial_reports.sql: Financial Reports, Lines, RLS, Storage Bucket & RPCs
-- ============================================================================

create table if not exists public.financial_reports (
  id uuid primary key default gen_random_uuid(),
  residential_cluster text not null,
  period_month date not null,                       -- Always 1st day of the month
  condo_name text,
  rif text,
  title text,
  prepared_by_name text,
  prepared_by_role text,
  prepared_date date,
  -- Opening balances
  opening_bs numeric(16,2) default 0,
  opening_zelle numeric(14,2) default 0,
  opening_cash numeric(14,2) default 0,
  -- Total income (includes opening balance as shown in official doc)
  income_total_bs numeric(16,2) default 0,
  income_total_zelle numeric(14,2) default 0,
  income_total_cash numeric(14,2) default 0,
  expense_total_bs numeric(16,2) default 0,
  expense_total_zelle numeric(14,2) default 0,
  expense_total_cash numeric(14,2) default 0,
  closing_bs numeric(16,2) default 0,
  closing_zelle numeric(14,2) default 0,
  closing_cash numeric(14,2) default 0,
  bcv_rate numeric(14,4),                           -- Optional reference rate
  notes text,
  original_pdf_path text,                           -- Attached original PDF path in private bucket
  status text not null default 'published' check (status in ('draft','published')),
  published_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  unique (residential_cluster, period_month)
);

create table if not exists public.financial_report_lines (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.financial_reports(id) on delete cascade,
  kind text not null check (kind in ('income','expense')),
  line_date date,
  concept text not null,
  category text,
  amount_bs numeric(16,2) not null default 0,
  amount_zelle numeric(14,2) not null default 0,
  amount_cash numeric(14,2) not null default 0,
  sort_order int not null default 0
);

create index if not exists idx_frl_report on public.financial_report_lines(report_id, kind, sort_order);

-- Enable RLS
alter table public.financial_reports enable row level security;
alter table public.financial_report_lines enable row level security;

-- Policies for financial_reports
drop policy if exists "Financial reports view policy" on public.financial_reports;
create policy "Financial reports view policy" on public.financial_reports
  for select using (
    public.get_my_role() = 'superadmin'
    or (
      residential_cluster = public.get_my_cluster()
      and (
        status = 'published'
        or public.get_my_role() in ('admin', 'superadmin')
      )
    )
  );

drop policy if exists "Financial reports modify policy" on public.financial_reports;
create policy "Financial reports modify policy" on public.financial_reports
  for all using (public.get_my_role() = 'superadmin');

-- Policies for financial_report_lines
drop policy if exists "Financial report lines view policy" on public.financial_report_lines;
create policy "Financial report lines view policy" on public.financial_report_lines
  for select using (
    exists (
      select 1 from public.financial_reports r
      where r.id = financial_report_lines.report_id
        and (
          public.get_my_role() = 'superadmin'
          or (
            r.residential_cluster = public.get_my_cluster()
            and (r.status = 'published' or public.get_my_role() in ('admin', 'superadmin'))
          )
        )
    )
  );

drop policy if exists "Financial report lines modify policy" on public.financial_report_lines;
create policy "Financial report lines modify policy" on public.financial_report_lines
  for all using (public.get_my_role() = 'superadmin');


-- RPC: Publish Financial Report
create or replace function public.rpc_publish_financial_report(
  p_cluster text,
  p_period date,
  p_header jsonb,
  p_lines jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_my_cluster text;
  v_report_id uuid;
  v_norm_period date;
  v_line jsonb;
  v_kind text;
  v_concept text;
  v_amt_bs numeric;
  v_amt_zelle numeric;
  v_amt_cash numeric;
  v_line_date date;
  v_category text;
  v_sort int;

  -- Recalculated totals
  v_calc_income_bs numeric := 0;
  v_calc_income_zelle numeric := 0;
  v_calc_income_cash numeric := 0;
  v_calc_expense_bs numeric := 0;
  v_calc_expense_zelle numeric := 0;
  v_calc_expense_cash numeric := 0;
  v_calc_closing_bs numeric := 0;
  v_calc_closing_zelle numeric := 0;
  v_calc_closing_cash numeric := 0;

  v_opening_bs numeric;
  v_opening_zelle numeric;
  v_opening_cash numeric;
  v_line_count int := 0;
begin
  v_role := public.get_my_role();
  v_my_cluster := public.get_my_cluster();

  if v_role not in ('admin', 'superadmin') then
    raise exception 'Access denied: insufficient permissions' using errcode = '42501';
  end if;

  if v_role = 'admin' and p_cluster <> v_my_cluster then
    raise exception 'Access denied: cannot publish for another cluster' using errcode = '42501';
  end if;

  v_norm_period := date_trunc('month', p_period)::date;
  v_opening_bs := coalesce((p_header->>'opening_bs')::numeric, 0);
  v_opening_zelle := coalesce((p_header->>'opening_zelle')::numeric, 0);
  v_opening_cash := coalesce((p_header->>'opening_cash')::numeric, 0);

  -- Validate lines count
  if jsonb_array_length(p_lines) > 500 then
    raise exception 'Too many lines (max 500)';
  end if;

  -- 1. Upsert Header
  insert into public.financial_reports (
    residential_cluster, period_month, condo_name, rif, title,
    prepared_by_name, prepared_by_role, prepared_date,
    opening_bs, opening_zelle, opening_cash,
    bcv_rate, notes, original_pdf_path, status, published_by, published_at
  )
  values (
    p_cluster,
    v_norm_period,
    p_header->>'condo_name',
    p_header->>'rif',
    p_header->>'title',
    p_header->>'prepared_by_name',
    p_header->>'prepared_by_role',
    (p_header->>'prepared_date')::date,
    v_opening_bs,
    v_opening_zelle,
    v_opening_cash,
    (p_header->>'bcv_rate')::numeric,
    p_header->>'notes',
    p_header->>'original_pdf_path',
    'published',
    auth.uid(),
    now()
  )
  on conflict (residential_cluster, period_month)
  do update set
    condo_name = excluded.condo_name,
    rif = excluded.rif,
    title = excluded.title,
    prepared_by_name = excluded.prepared_by_name,
    prepared_by_role = excluded.prepared_by_role,
    prepared_date = excluded.prepared_date,
    opening_bs = excluded.opening_bs,
    opening_zelle = excluded.opening_zelle,
    opening_cash = excluded.opening_cash,
    bcv_rate = excluded.bcv_rate,
    notes = excluded.notes,
    original_pdf_path = coalesce(excluded.original_pdf_path, financial_reports.original_pdf_path),
    status = 'published',
    published_by = auth.uid(),
    published_at = now()
  returning id into v_report_id;

  -- 2. Replace lines
  delete from public.financial_report_lines where report_id = v_report_id;

  for v_line in select * from jsonb_array_elements(p_lines)
  loop
    v_line_count := v_line_count + 1;
    v_kind := v_line->>'kind';
    v_concept := trim(v_line->>'concept');
    v_amt_bs := coalesce((v_line->>'amount_bs')::numeric, 0);
    v_amt_zelle := coalesce((v_line->>'amount_zelle')::numeric, 0);
    v_amt_cash := coalesce((v_line->>'amount_cash')::numeric, 0);
    v_line_date := (v_line->>'line_date')::date;
    v_category := v_line->>'category';
    v_sort := coalesce((v_line->>'sort_order')::int, v_line_count);

    if v_kind not in ('income', 'expense') then
      raise exception 'Invalid line kind: %', v_kind;
    end if;

    if length(v_concept) = 0 or length(v_concept) > 300 then
      raise exception 'Invalid concept length';
    end if;

    if v_amt_bs < -1e12 or v_amt_bs > 1e12 or v_amt_zelle < -1e12 or v_amt_zelle > 1e12 then
      raise exception 'Amount out of range';
    end if;

    insert into public.financial_report_lines (
      report_id, kind, line_date, concept, category, amount_bs, amount_zelle, amount_cash, sort_order
    )
    values (
      v_report_id, v_kind, v_line_date, v_concept, v_category, v_amt_bs, v_amt_zelle, v_amt_cash, v_sort
    );

    if v_kind = 'income' then
      v_calc_income_bs := v_calc_income_bs + v_amt_bs;
      v_calc_income_zelle := v_calc_income_zelle + v_amt_zelle;
      v_calc_income_cash := v_calc_income_cash + v_amt_cash;
    else
      v_calc_expense_bs := v_calc_expense_bs + v_amt_bs;
      v_calc_expense_zelle := v_calc_expense_zelle + v_amt_zelle;
      v_calc_expense_cash := v_calc_expense_cash + v_amt_cash;
    end if;
  end loop;

  -- Include opening balance in total income calculations (matching standard condo statement format)
  v_calc_income_bs := v_calc_income_bs + v_opening_bs;
  v_calc_income_zelle := v_calc_income_zelle + v_opening_zelle;
  v_calc_income_cash := v_calc_income_cash + v_opening_cash;

  v_calc_closing_bs := v_calc_income_bs - v_calc_expense_bs;
  v_calc_closing_zelle := v_calc_income_zelle - v_calc_expense_zelle;
  v_calc_closing_cash := v_calc_income_cash - v_calc_expense_cash;

  -- Update calculated totals on header
  update public.financial_reports
  set
    income_total_bs = v_calc_income_bs,
    income_total_zelle = v_calc_income_zelle,
    income_total_cash = v_calc_income_cash,
    expense_total_bs = v_calc_expense_bs,
    expense_total_zelle = v_calc_expense_zelle,
    expense_total_cash = v_calc_expense_cash,
    closing_bs = v_calc_closing_bs,
    closing_zelle = v_calc_closing_zelle,
    closing_cash = v_calc_closing_cash
  where id = v_report_id;

  return v_report_id;
end;
$$;

-- RPC: Unpublish Financial Report
create or replace function public.rpc_unpublish_financial_report(p_report_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_cluster text;
  v_report_cluster text;
begin
  v_role := public.get_my_role();
  v_cluster := public.get_my_cluster();

  if v_role not in ('admin', 'superadmin') then
    raise exception 'Access denied' using errcode = '42501';
  end if;

  select residential_cluster into v_report_cluster
  from public.financial_reports where id = p_report_id;

  if not found then
    raise exception 'Report not found';
  end if;

  if v_role = 'admin' and v_report_cluster <> v_cluster then
    raise exception 'Access denied for this cluster' using errcode = '42501';
  end if;

  update public.financial_reports
  set status = 'draft'
  where id = p_report_id;
end;
$$;

revoke all on function public.rpc_publish_financial_report from public;
grant execute on function public.rpc_publish_financial_report to authenticated;

revoke all on function public.rpc_unpublish_financial_report from public;
grant execute on function public.rpc_unpublish_financial_report to authenticated;


-- Storage Bucket setup for private financial reports PDF
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'financial-reports',
  'financial-reports',
  false,
  5242880, -- 5 MB limit
  ARRAY['application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf'];

-- Storage policies for financial-reports bucket
drop policy if exists "financial_reports_select" on storage.objects;
create policy "financial_reports_select" on storage.objects
  for select using (
    bucket_id = 'financial-reports'
    and (
      public.get_my_role() = 'superadmin'
      or (storage.foldername(name))[1] = lower(regexp_replace(public.get_my_cluster(), '[^a-zA-Z0-9]+', '-', 'g'))
    )
  );

drop policy if exists "financial_reports_insert" on storage.objects;
create policy "financial_reports_insert" on storage.objects
  for insert with check (
    bucket_id = 'financial-reports'
    and public.get_my_role() in ('admin', 'superadmin')
    and (
      public.get_my_role() = 'superadmin'
      or (storage.foldername(name))[1] = lower(regexp_replace(public.get_my_cluster(), '[^a-zA-Z0-9]+', '-', 'g'))
    )
  );

drop policy if exists "financial_reports_update" on storage.objects;
create policy "financial_reports_update" on storage.objects
  for update using (
    bucket_id = 'financial-reports'
    and public.get_my_role() in ('admin', 'superadmin')
  );

drop policy if exists "financial_reports_delete" on storage.objects;
create policy "financial_reports_delete" on storage.objects
  for delete using (
    bucket_id = 'financial-reports'
    and public.get_my_role() in ('admin', 'superadmin')
  );
