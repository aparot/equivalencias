-- Allow admin inserts into audit_log (trigger writes)

drop policy if exists audit_admin_insert on public.audit_log;
create policy audit_admin_insert on public.audit_log
for insert
with check (public.is_admin());
