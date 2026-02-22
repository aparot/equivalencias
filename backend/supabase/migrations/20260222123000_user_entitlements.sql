-- User entitlements for feature gating

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  key text not null,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, key)
);

create trigger trg_user_entitlements_updated before update on public.user_entitlements
for each row execute function public.set_updated_at();

alter table public.user_entitlements enable row level security;

create policy entitlements_select_self on public.user_entitlements
for select using (auth.uid() = user_id or public.is_admin());

create policy entitlements_admin_all on public.user_entitlements
for all using (public.is_admin()) with check (public.is_admin());
