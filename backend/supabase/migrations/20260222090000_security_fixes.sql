-- Security and data integrity fixes

-- 1) Enforce a single published version (allow multiple drafts/archived)
alter table public.dataset_versions
  drop constraint if exists single_published_version;

do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'dataset_versions_single_published'
  ) then
    create unique index dataset_versions_single_published
      on public.dataset_versions (status)
      where status = 'published'::public.version_status;
  end if;
end$$;

-- 2) Prevent users from self-escalating roles
-- Drop the permissive policy and replace with a safer one.
drop policy if exists profiles_update_self on public.profiles;

create policy profiles_update_self on public.profiles
for update using (auth.uid() = id or public.is_admin())
with check (
  auth.uid() = id
  and role = (select role from public.profiles where id = auth.uid())
  or public.is_admin()
);

-- 3) Auto-create profile rows on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 4) Block role changes for non-admins (defense-in-depth)
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
as $$
begin
  if not public.is_admin() and new.role is distinct from old.role then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_prevent_role_change on public.profiles;
create trigger trg_profiles_prevent_role_change
before update on public.profiles
for each row execute function public.prevent_role_change();
