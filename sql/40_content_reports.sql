-- sql/40_content_reports.sql
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  content_ref text not null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending','in_review','resolved','dismissed')),
  created_at timestamptz not null default now()
);

alter table public.content_reports enable row level security;

create policy reports_insert_auth on public.content_reports for insert with check (auth.role() = 'authenticated');
create policy reports_select_admin on public.content_reports for select using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role in ('admin', 'superadmin')
  )
);
