-- sql/30_private_buckets.sql
-- Marcar el bucket de comprobantes como privado (H-01)
update storage.buckets
set public = false
where id = 'payment-captures';

-- Políticas RLS para storage.objects en payment-captures
drop policy if exists "Residentes suben sus comprobantes" on storage.objects;
create policy "Residentes suben sus comprobantes"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'payment-captures' and
  (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Residentes y admins leen sus comprobantes" on storage.objects;
create policy "Residentes y admins leen sus comprobantes"
on storage.objects for select
to authenticated
using (
  bucket_id = 'payment-captures' and (
    (storage.foldername(name))[1] = auth.uid()::text or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('admin', 'superadmin', 'guard')
    )
  )
);
