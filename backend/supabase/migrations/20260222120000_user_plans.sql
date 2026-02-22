-- User plans & entitlements

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'app_plan' and typnamespace = 'public'::regnamespace
  ) then
    create type public.app_plan as enum ('free', 'pro', 'enterprise');
  end if;
end$$;

alter table public.profiles
  add column if not exists plan public.app_plan not null default 'free';

-- Prevent non-admins from changing role or plan
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
for update using (auth.uid() = id or public.is_admin())
with check (
  auth.uid() = id
  and role = (select role from public.profiles where id = auth.uid())
  and plan = (select plan from public.profiles where id = auth.uid())
  or public.is_admin()
);

create or replace function public.prevent_role_change()
returns trigger
language plpgsql
as $$
begin
  if not public.is_admin() and (new.role is distinct from old.role or new.plan is distinct from old.plan) then
    raise exception 'Only admins can change roles or plans';
  end if;
  return new;
end;
$$;
