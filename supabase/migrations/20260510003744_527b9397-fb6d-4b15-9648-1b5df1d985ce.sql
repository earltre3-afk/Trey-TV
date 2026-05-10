
-- ============================================================
-- PROFILES (extend if missing) ================================
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  email text,
  avatar_url text,
  bio text,
  status text not null default 'active' check (status in ('active','suspended','banned')),
  ban_reason text,
  banned_at timestamptz,
  banned_until timestamptz,
  banned_by uuid,
  gold_verified boolean not null default false,
  gold_verified_at timestamptz,
  gold_verified_by uuid,
  verification_category text,
  creator_status text not null default 'not_applied' check (creator_status in ('not_applied','pending','approved','rejected','revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read" on public.profiles for select using (true);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert" on public.profiles for insert with check (auth.uid() = id);

-- ============================================================
-- ADMIN ROLES =================================================
-- ============================================================
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('owner','admin','moderator')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = _user_id);
$$;

create or replace function public.is_owner(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = _user_id and role = 'owner');
$$;

drop policy if exists "admin_users_self_read" on public.admin_users;
create policy "admin_users_self_read" on public.admin_users for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "admin_users_owner_write" on public.admin_users;
create policy "admin_users_owner_write" on public.admin_users for all using (public.is_owner(auth.uid())) with check (public.is_owner(auth.uid()));

-- ============================================================
-- AUTO-PROVISION PROFILE + OWNER ==============================
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, username, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  -- Auto-promote owner email
  if lower(new.email) = lower('californiatrey@gmail.com') then
    insert into public.admin_users (user_id, email, role)
    values (new.id, new.email, 'owner')
    on conflict (user_id) do update set role = 'owner';
  end if;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================
-- AUDIT LOG ===================================================
-- ============================================================
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb default '{}'::jsonb,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_created on public.admin_audit_log(created_at desc);
alter table public.admin_audit_log enable row level security;

drop policy if exists "audit_admin_read" on public.admin_audit_log;
create policy "audit_admin_read" on public.admin_audit_log for select using (public.is_admin(auth.uid()));
drop policy if exists "audit_admin_insert" on public.admin_audit_log;
create policy "audit_admin_insert" on public.admin_audit_log for insert with check (public.is_admin(auth.uid()) and admin_user_id = auth.uid());

-- ============================================================
-- SITE CONTENT BLOCKS =========================================
-- ============================================================
create table if not exists public.site_content_blocks (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  page text,
  section text,
  title text,
  body text,
  metadata jsonb default '{}'::jsonb,
  status text not null default 'published' check (status in ('draft','published')),
  updated_by uuid,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.site_content_blocks enable row level security;

drop policy if exists "content_public_read_published" on public.site_content_blocks;
create policy "content_public_read_published" on public.site_content_blocks for select using (status = 'published' or public.is_admin(auth.uid()));
drop policy if exists "content_admin_write" on public.site_content_blocks;
create policy "content_admin_write" on public.site_content_blocks for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ============================================================
-- CREATOR APPLICATIONS ========================================
-- ============================================================
create table if not exists public.creator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bio text,
  niche text,
  social_links jsonb default '[]'::jsonb,
  sample_links jsonb default '[]'::jsonb,
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','needs_more_info','revoked')),
  review_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.creator_applications enable row level security;

drop policy if exists "creator_app_self_read" on public.creator_applications;
create policy "creator_app_self_read" on public.creator_applications for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
drop policy if exists "creator_app_self_insert" on public.creator_applications;
create policy "creator_app_self_insert" on public.creator_applications for insert with check (auth.uid() = user_id);
drop policy if exists "creator_app_admin_update" on public.creator_applications;
create policy "creator_app_admin_update" on public.creator_applications for update using (public.is_admin(auth.uid()));

-- ============================================================
-- VERIFICATION APPLICATIONS ===================================
-- ============================================================
create table if not exists public.verification_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  notable_for text,
  official_links jsonb default '[]'::jsonb,
  reference_links jsonb default '[]'::jsonb,
  explanation text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','needs_more_info')),
  review_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.verification_applications enable row level security;

drop policy if exists "verif_self_read" on public.verification_applications;
create policy "verif_self_read" on public.verification_applications for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
drop policy if exists "verif_self_insert" on public.verification_applications;
create policy "verif_self_insert" on public.verification_applications for insert with check (auth.uid() = user_id);
drop policy if exists "verif_admin_update" on public.verification_applications;
create policy "verif_admin_update" on public.verification_applications for update using (public.is_admin(auth.uid()));

-- ============================================================
-- REWARDS =====================================================
-- ============================================================
create table if not exists public.reward_rules (
  id uuid primary key default gen_random_uuid(),
  action_key text unique not null,
  description text,
  points integer not null default 0,
  daily_cap integer,
  lifetime_cap integer,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.reward_rules enable row level security;
drop policy if exists "rules_public_read" on public.reward_rules;
create policy "rules_public_read" on public.reward_rules for select using (true);
drop policy if exists "rules_admin_write" on public.reward_rules;
create policy "rules_admin_write" on public.reward_rules for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table if not exists public.reward_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  action_key text not null,
  points integer not null,
  source_type text,
  source_id text,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists idx_ledger_user on public.reward_ledger(user_id, created_at desc);
alter table public.reward_ledger enable row level security;
drop policy if exists "ledger_self_read" on public.reward_ledger;
create policy "ledger_self_read" on public.reward_ledger for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
drop policy if exists "ledger_admin_write" on public.reward_ledger;
create policy "ledger_admin_write" on public.reward_ledger for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  redemption_type text not null,
  points_spent integer not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','fulfilled')),
  metadata jsonb default '{}'::jsonb,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.reward_redemptions enable row level security;
drop policy if exists "redeem_self_read" on public.reward_redemptions;
create policy "redeem_self_read" on public.reward_redemptions for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
drop policy if exists "redeem_self_insert" on public.reward_redemptions;
create policy "redeem_self_insert" on public.reward_redemptions for insert with check (auth.uid() = user_id);
drop policy if exists "redeem_admin_update" on public.reward_redemptions;
create policy "redeem_admin_update" on public.reward_redemptions for update using (public.is_admin(auth.uid()));

-- ============================================================
-- PROFILE DECORATIONS =========================================
-- ============================================================
create table if not exists public.profile_decoration_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type text not null check (type in ('border','frame','glow','background','badge_aura','banner_frame')),
  rarity text not null default 'common' check (rarity in ('common','rare','premium','limited')),
  point_cost integer not null default 0,
  asset_url text,
  style_metadata jsonb default '{}'::jsonb,
  creator_only boolean not null default false,
  gold_only boolean not null default false,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profile_decoration_items enable row level security;
drop policy if exists "deco_public_read" on public.profile_decoration_items;
create policy "deco_public_read" on public.profile_decoration_items for select using (enabled = true or public.is_admin(auth.uid()));
drop policy if exists "deco_admin_write" on public.profile_decoration_items;
create policy "deco_admin_write" on public.profile_decoration_items for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table if not exists public.user_profile_decorations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  decoration_id uuid not null references public.profile_decoration_items(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  equipped boolean not null default false,
  unique (user_id, decoration_id)
);
alter table public.user_profile_decorations enable row level security;
drop policy if exists "user_deco_public_read" on public.user_profile_decorations;
create policy "user_deco_public_read" on public.user_profile_decorations for select using (true);
drop policy if exists "user_deco_self_write" on public.user_profile_decorations;
create policy "user_deco_self_write" on public.user_profile_decorations for all using (auth.uid() = user_id or public.is_admin(auth.uid())) with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- ============================================================
-- PLATFORM SETTINGS ===========================================
-- ============================================================
create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid,
  updated_at timestamptz not null default now()
);
alter table public.platform_settings enable row level security;
drop policy if exists "settings_public_read" on public.platform_settings;
create policy "settings_public_read" on public.platform_settings for select using (true);
drop policy if exists "settings_admin_write" on public.platform_settings;
create policy "settings_admin_write" on public.platform_settings for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ============================================================
-- USER REPORTS ================================================
-- ============================================================
create table if not exists public.user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null,
  target_type text not null check (target_type in ('post','comment','user','episode','creator_upload','profile','message')),
  target_id text not null,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending','dismissed','actioned','escalated')),
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.user_reports enable row level security;
drop policy if exists "reports_self_read" on public.user_reports;
create policy "reports_self_read" on public.user_reports for select using (auth.uid() = reporter_id or public.is_admin(auth.uid()));
drop policy if exists "reports_self_insert" on public.user_reports;
create policy "reports_self_insert" on public.user_reports for insert with check (auth.uid() = reporter_id);
drop policy if exists "reports_admin_update" on public.user_reports;
create policy "reports_admin_update" on public.user_reports for update using (public.is_admin(auth.uid()));
