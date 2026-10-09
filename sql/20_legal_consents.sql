-- sql/20_legal_consents.sql
alter table public.profiles
  add column if not exists terms_version text,
  add column if not exists privacy_version text,
  add column if not exists legal_accepted_at timestamptz,
  add column if not exists adult_confirmed_at timestamptz,
  add column if not exists deletion_requested_at timestamptz;

create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  consent_type text not null check (consent_type in
    ('terms','privacy','cookies_diagnostics','marketing','adult_confirmation','payment_confirmation')),
  document_version text,
  granted boolean not null,
  app_version text,
  platform text,
  created_at timestamptz not null default now()
);

alter table public.user_consents enable row level security;

create policy consents_select_own on public.user_consents for select using (user_id = auth.uid());
create policy consents_insert_own on public.user_consents for insert with check (user_id = auth.uid());

create table if not exists public.data_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  request_type text not null check (request_type in
    ('account_deletion','data_export','rectification','service_cancellation')),
  status text not null default 'received' check (status in ('received','in_review','completed','rejected','withdrawn')),
  reason text,
  contact_email text not null,
  effective_date date,
  resolution_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.data_requests enable row level security;

create policy dr_select_own on public.data_requests for select using (user_id = auth.uid());
create policy dr_insert_own on public.data_requests for insert with check (user_id = auth.uid());

create or replace function public.rpc_accept_legal(p_terms text, p_privacy text, p_app_version text default null, p_platform text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set terms_version=p_terms, privacy_version=p_privacy,
         legal_accepted_at=now() where id = auth.uid();
  insert into public.user_consents(user_id, consent_type, document_version, granted, app_version, platform)
  values (auth.uid(),'terms',p_terms,true,p_app_version,p_platform),
         (auth.uid(),'privacy',p_privacy,true,p_app_version,p_platform);
end $$;

revoke all on function public.rpc_accept_legal(text,text,text,text) from public;
grant execute on function public.rpc_accept_legal(text,text,text,text) to authenticated;
