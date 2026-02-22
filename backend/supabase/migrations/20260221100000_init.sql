-- EcoEquivalencias MVP schema
create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'app_role' and typnamespace = 'public'::regnamespace
  ) then
    create type public.app_role as enum ('admin', 'user');
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'version_status' and typnamespace = 'public'::regnamespace
  ) then
    create type public.version_status as enum ('draft', 'published', 'archived');
  end if;
end$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dataset_versions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status public.version_status not null default 'draft',
  valid_from date not null,
  valid_to date,
  notes text,
  created_by uuid references public.profiles(id),
  published_by uuid references public.profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint single_published_version unique (status) deferrable initially deferred
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.dataset_versions(id) on delete cascade,
  slug text not null,
  name text not null,
  category text not null,
  base_unit text not null,
  factor_kgco2e_per_base_unit numeric(14,6) not null,
  explanation text not null,
  confidence text,
  source_note text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(version_id, slug)
);

create table if not exists public.resource_units (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  unit_name text not null,
  unit_symbol text not null,
  to_base_factor numeric(14,8) not null check (to_base_factor > 0),
  is_base boolean not null default false,
  created_at timestamptz not null default now(),
  unique(resource_id, unit_symbol)
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  author text not null,
  organization text not null,
  title text not null,
  year int not null,
  url text,
  doi text,
  accessed_at date not null,
  notes text,
  is_demo boolean not null default true,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resource_sources (
  resource_id uuid not null references public.resources(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete restrict,
  primary key(resource_id, source_id)
);

create table if not exists public.equivalences (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.dataset_versions(id) on delete cascade,
  slug text not null,
  title text not null,
  output_unit text not null,
  description text not null,
  confidence text,
  co2e_ton_per_unit numeric(18,12) not null check (co2e_ton_per_unit > 0),
  formula text not null,
  is_demo boolean not null default true,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(version_id, slug)
);

create table if not exists public.equivalence_sources (
  equivalence_id uuid not null references public.equivalences(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete restrict,
  primary key(equivalence_id, source_id)
);

create table if not exists public.audit_log (
  id bigserial primary key,
  actor_id uuid,
  table_name text not null,
  row_id uuid,
  action text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists trg_versions_updated on public.dataset_versions;
create trigger trg_versions_updated before update on public.dataset_versions
for each row execute function public.set_updated_at();
drop trigger if exists trg_resources_updated on public.resources;
create trigger trg_resources_updated before update on public.resources
for each row execute function public.set_updated_at();
drop trigger if exists trg_sources_updated on public.sources;
create trigger trg_sources_updated before update on public.sources
for each row execute function public.set_updated_at();
drop trigger if exists trg_equivalences_updated on public.equivalences;
create trigger trg_equivalences_updated before update on public.equivalences
for each row execute function public.set_updated_at();

create or replace function public.current_role()
returns public.app_role
language sql
stable
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'user'::public.app_role);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.current_role() = 'admin'::public.app_role;
$$;

create or replace function public.log_audit()
returns trigger
language plpgsql
as $$
declare
  entity_id uuid;
begin
  entity_id := coalesce((to_jsonb(new)->>'id')::uuid, (to_jsonb(old)->>'id')::uuid, null);
  insert into public.audit_log(actor_id, table_name, row_id, action, payload)
  values (auth.uid(), TG_TABLE_NAME, entity_id, TG_OP, coalesce(to_jsonb(new), to_jsonb(old)));
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_audit_resources on public.resources;
create trigger trg_audit_resources after insert or update or delete on public.resources
for each row execute function public.log_audit();
drop trigger if exists trg_audit_resource_units on public.resource_units;
create trigger trg_audit_resource_units after insert or update or delete on public.resource_units
for each row execute function public.log_audit();
drop trigger if exists trg_audit_equivalences on public.equivalences;
create trigger trg_audit_equivalences after insert or update or delete on public.equivalences
for each row execute function public.log_audit();
drop trigger if exists trg_audit_sources on public.sources;
create trigger trg_audit_sources after insert or update or delete on public.sources
for each row execute function public.log_audit();

alter table public.profiles enable row level security;
alter table public.dataset_versions enable row level security;
alter table public.resources enable row level security;
alter table public.resource_units enable row level security;
alter table public.sources enable row level security;
alter table public.resource_sources enable row level security;
alter table public.equivalences enable row level security;
alter table public.equivalence_sources enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
for select using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
for update using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());

drop policy if exists admin_all_versions on public.dataset_versions;
create policy admin_all_versions on public.dataset_versions
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists versions_select_public on public.dataset_versions;
create policy versions_select_public on public.dataset_versions
for select using (status = 'published'::public.version_status or public.is_admin());

drop policy if exists resources_select_public on public.resources;
create policy resources_select_public on public.resources
for select using (
  public.is_admin() or exists (
    select 1 from public.dataset_versions v where v.id = resources.version_id and v.status = 'published'::public.version_status
  )
);

drop policy if exists resource_units_select_public on public.resource_units;
create policy resource_units_select_public on public.resource_units
for select using (
  public.is_admin() or exists (
    select 1 from public.resources r
    join public.dataset_versions v on v.id = r.version_id
    where r.id = resource_units.resource_id and v.status = 'published'::public.version_status
  )
);

drop policy if exists equivalences_select_public on public.equivalences;
create policy equivalences_select_public on public.equivalences
for select using (
  public.is_admin() or exists (
    select 1 from public.dataset_versions v where v.id = equivalences.version_id and v.status = 'published'::public.version_status
  )
);

drop policy if exists sources_select_public on public.sources;
create policy sources_select_public on public.sources
for select using (true);

drop policy if exists resource_sources_select_public on public.resource_sources;
create policy resource_sources_select_public on public.resource_sources
for select using (true);

drop policy if exists equivalence_sources_select_public on public.equivalence_sources;
create policy equivalence_sources_select_public on public.equivalence_sources
for select using (true);

drop policy if exists audit_admin_only on public.audit_log;
create policy audit_admin_only on public.audit_log
for select using (public.is_admin());

drop policy if exists admin_all_resources on public.resources;
create policy admin_all_resources on public.resources
for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all_resource_units on public.resource_units;
create policy admin_all_resource_units on public.resource_units
for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all_equivalences on public.equivalences;
create policy admin_all_equivalences on public.equivalences
for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all_sources on public.sources;
create policy admin_all_sources on public.sources
for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all_resource_sources on public.resource_sources;
create policy admin_all_resource_sources on public.resource_sources
for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all_equivalence_sources on public.equivalence_sources;
create policy admin_all_equivalence_sources on public.equivalence_sources
for all using (public.is_admin()) with check (public.is_admin());
