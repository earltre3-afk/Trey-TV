-- ============================================================
-- TRADIO IDENTITY SCHEMA ====================================
-- ============================================================
-- Creates the Tradio profile / role / role-profile / badge tables the Tradio
-- bootstrap (src/tradio/components/tradio/auth/tradioProfileBootstrap.ts) needs
-- to run for live production. Until these exist the bootstrap reports
-- `database_not_ready` and the UI shows "Profile setup paused: database not
-- ready".
--
-- Identity stays rooted in Trey TV:
--   auth.users -> public.profiles (read-only bridge) -> public.tradio_profiles
-- This migration NEVER lets the frontend self-grant a role other than `fan`,
-- and NEVER lets a non-admin self-set verification / broadcast clearance.
-- Idempotent: safe to re-run (IF NOT EXISTS / DROP POLICY IF EXISTS throughout).

-- ── Shared updated_at trigger ────────────────────────────────
create or replace function public.tradio_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1) tradio_profiles ========================================
-- ============================================================
create table if not exists public.tradio_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_id uuid,
  public_profile_uid text,
  trey_tv_uid text,
  display_name text not null default 'Tradio Listener',
  username text unique,
  avatar_url text,
  banner_url text,
  active_mode text not null default 'listener'
    check (active_mode in ('listener', 'artist', 'producer', 'dj', 'admin')),
  default_mode text not null default 'listener'
    check (default_mode in ('listener', 'artist', 'producer', 'dj', 'admin')),
  tradio_verification_status text not null default 'unverified'
    check (tradio_verification_status in ('unverified', 'pending', 'verified', 'rejected', 'revoked')),
  tradio_broadcast_access_status text not null default 'invite_only'
    check (tradio_broadcast_access_status in ('invite_only', 'submitted', 'pending', 'under_review', 'cleared', 'denied', 'revoked')),
  city text,
  region text,
  tradio_genres text[] not null default array[]::text[],
  fan_interests text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_tradio_profiles_updated_at on public.tradio_profiles;
create trigger trg_tradio_profiles_updated_at
  before update on public.tradio_profiles
  for each row execute function public.tradio_set_updated_at();

-- Prevent a non-admin from escalating their own privileges. RLS lets a user
-- update their own row (for active_mode etc.), but these columns may only be
-- changed by an admin / protected backend path.
create or replace function public.tradio_profiles_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    new.user_id := old.user_id;
    new.profile_id := old.profile_id;
    new.public_profile_uid := old.public_profile_uid;
    new.trey_tv_uid := old.trey_tv_uid;
    new.tradio_verification_status := old.tradio_verification_status;
    new.tradio_broadcast_access_status := old.tradio_broadcast_access_status;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_tradio_profiles_guard on public.tradio_profiles;
create trigger trg_tradio_profiles_guard
  before update on public.tradio_profiles
  for each row execute function public.tradio_profiles_guard();

alter table public.tradio_profiles enable row level security;

drop policy if exists "tradio_profiles_select_own" on public.tradio_profiles;
create policy "tradio_profiles_select_own"
  on public.tradio_profiles for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "tradio_profiles_insert_own" on public.tradio_profiles;
create policy "tradio_profiles_insert_own"
  on public.tradio_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "tradio_profiles_update_own" on public.tradio_profiles;
create policy "tradio_profiles_update_own"
  on public.tradio_profiles for update
  using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- ============================================================
-- 2) tradio_user_roles ======================================
-- ============================================================
create table if not exists public.tradio_user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null
    check (role in ('fan', 'artist', 'producer', 'dj', 'moderator', 'admin', 'owner')),
  role_status text not null default 'active'
    check (role_status in ('active', 'requested', 'approved', 'restricted', 'revoked', 'archived')),
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null,
  role_metadata jsonb not null default '{}'::jsonb,
  unique (user_id, role)
);

create index if not exists idx_tradio_user_roles_user on public.tradio_user_roles(user_id);

alter table public.tradio_user_roles enable row level security;

drop policy if exists "tradio_user_roles_select_own" on public.tradio_user_roles;
create policy "tradio_user_roles_select_own"
  on public.tradio_user_roles for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Frontend may ONLY self-grant the default `fan` role. Elevated roles must come
-- from a protected backend / admin path.
drop policy if exists "tradio_user_roles_insert_fan_self" on public.tradio_user_roles;
create policy "tradio_user_roles_insert_fan_self"
  on public.tradio_user_roles for insert
  with check (
    public.is_admin(auth.uid())
    or (auth.uid() = user_id and role = 'fan' and role_status = 'active')
  );

-- Only admins may modify or remove role grants.
drop policy if exists "tradio_user_roles_admin_update" on public.tradio_user_roles;
create policy "tradio_user_roles_admin_update"
  on public.tradio_user_roles for update
  using (public.is_admin(auth.uid()));

drop policy if exists "tradio_user_roles_admin_delete" on public.tradio_user_roles;
create policy "tradio_user_roles_admin_delete"
  on public.tradio_user_roles for delete
  using (public.is_admin(auth.uid()));

-- ============================================================
-- 3) Role profile tables (fan / artist / producer / dj) ======
-- ============================================================
-- Read during bootstrap finalize. Minimal own-row tables; richer per-role
-- fields can be added later without breaking the select('*') reads.
do $$
declare
  t text;
begin
  foreach t in array array['tradio_fan_profiles','tradio_artist_profiles','tradio_producer_profiles','tradio_dj_profiles']
  loop
    execute format($f$
      create table if not exists public.%I (
        user_id uuid primary key references auth.users(id) on delete cascade,
        data jsonb not null default '{}'::jsonb,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
      alter table public.%I enable row level security;
    $f$, t, t);

    execute format($f$
      drop trigger if exists trg_%I_updated_at on public.%I;
      create trigger trg_%I_updated_at
        before update on public.%I
        for each row execute function public.tradio_set_updated_at();
    $f$, t, t, t, t);

    execute format($f$
      drop policy if exists "%I_select_own" on public.%I;
      create policy "%I_select_own" on public.%I for select
        using (auth.uid() = user_id or public.is_admin(auth.uid()));
      drop policy if exists "%I_insert_own" on public.%I;
      create policy "%I_insert_own" on public.%I for insert
        with check (auth.uid() = user_id);
      drop policy if exists "%I_update_own" on public.%I;
      create policy "%I_update_own" on public.%I for update
        using (auth.uid() = user_id or public.is_admin(auth.uid()))
        with check (auth.uid() = user_id or public.is_admin(auth.uid()));
    $f$, t, t, t, t, t, t, t, t, t, t, t, t);
  end loop;
end $$;

-- ============================================================
-- 4) Badges =================================================
-- ============================================================
create table if not exists public.tradio_badges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.tradio_user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.tradio_badges(id) on delete cascade,
  granted_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create index if not exists idx_tradio_user_badges_user on public.tradio_user_badges(user_id);

alter table public.tradio_badges enable row level security;
alter table public.tradio_user_badges enable row level security;

-- Badge catalog is readable by any authenticated user; only admins manage it.
drop policy if exists "tradio_badges_select_all" on public.tradio_badges;
create policy "tradio_badges_select_all"
  on public.tradio_badges for select
  using (auth.role() = 'authenticated');

drop policy if exists "tradio_badges_admin_write" on public.tradio_badges;
create policy "tradio_badges_admin_write"
  on public.tradio_badges for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "tradio_user_badges_select_own" on public.tradio_user_badges;
create policy "tradio_user_badges_select_own"
  on public.tradio_user_badges for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Badge grants are issued by admins / backend only (never self-granted).
drop policy if exists "tradio_user_badges_admin_write" on public.tradio_user_badges;
create policy "tradio_user_badges_admin_write"
  on public.tradio_user_badges for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
