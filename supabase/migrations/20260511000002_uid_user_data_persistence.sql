-- ============================================================
-- UID-CENTERED USER DATA PERSISTENCE ==========================
-- ============================================================
-- Private app data is keyed by auth.users.id for RLS and joined to the
-- user-facing identity mark through profiles.public_profile_uid.

create extension if not exists pgcrypto;

create or replace function public.generate_public_profile_uid()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
begin
  loop
    candidate := (floor(1000000000000000 + random() * 9000000000000000))::bigint::text;
    exit when not exists (select 1 from public.profiles where public_profile_uid = candidate);
  end loop;
  return candidate;
end;
$$;

alter table public.profiles add column if not exists public_profile_uid text;
alter table public.profiles add column if not exists banner_url text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists link_url text;
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists verification_type text;
alter table public.profiles add column if not exists is_verified boolean not null default false;
alter table public.profiles add column if not exists verified_creator boolean not null default false;
alter table public.profiles add column if not exists profile_accent_color text default 'gold';
alter table public.profiles add column if not exists profile_preferences jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists feed_preferences jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists inbox_preferences jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists rewards_preferences jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists profile_visibility text not null default 'public';
alter table public.profiles add column if not exists show_location boolean not null default true;
alter table public.profiles add column if not exists show_birthday boolean not null default false;

update public.profiles
set public_profile_uid = public.generate_public_profile_uid()
where public_profile_uid is null;

alter table public.profiles alter column public_profile_uid set not null;
create unique index if not exists profiles_public_profile_uid_key on public.profiles(public_profile_uid);
create index if not exists idx_profiles_username on public.profiles(username);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    public_profile_uid,
    email,
    display_name,
    username,
    avatar_url,
    role,
    profile_preferences,
    feed_preferences,
    inbox_preferences,
    rewards_preferences
  )
  values (
    new.id,
    public.generate_public_profile_uid(),
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url',
    'user',
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  )
  on conflict (id) do nothing;

  if lower(new.email) = lower('californiatrey@gmail.com') then
    insert into public.admin_users (user_id, email, role)
    values (new.id, new.email, 'owner')
    on conflict (user_id) do update set role = 'owner';
  end if;

  return new;
end $$;

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));

-- ============================================================
-- INBOX / DIRECT MESSAGES ====================================
-- ============================================================
create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null default '',
  message_type text not null default 'text' check (message_type in ('text','ghost','image','video','voice')),
  media_url text,
  media_type text,
  voice_duration numeric,
  ghost_expires_at timestamptz,
  ghost_label text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_direct_messages_sender_created on public.direct_messages(sender_id, created_at desc);
create index if not exists idx_direct_messages_recipient_created on public.direct_messages(recipient_id, created_at desc);
create index if not exists idx_direct_messages_pair_created on public.direct_messages(sender_id, recipient_id, created_at desc);

alter table public.direct_messages enable row level security;

drop policy if exists "dm_participants_read" on public.direct_messages;
create policy "dm_participants_read" on public.direct_messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id or public.is_admin(auth.uid()));

drop policy if exists "dm_sender_insert" on public.direct_messages;
create policy "dm_sender_insert" on public.direct_messages
  for insert with check (auth.uid() = sender_id);

drop policy if exists "dm_participants_update" on public.direct_messages;
create policy "dm_participants_update" on public.direct_messages
  for update using (auth.uid() = sender_id or auth.uid() = recipient_id or public.is_admin(auth.uid()))
  with check (auth.uid() = sender_id or auth.uid() = recipient_id or public.is_admin(auth.uid()));

-- ============================================================
-- FRIENDS / FOLLOWS ==========================================
-- ============================================================
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists idx_follows_follower on public.follows(follower_id, created_at desc);
create index if not exists idx_follows_following on public.follows(following_id, created_at desc);

alter table public.follows enable row level security;

drop policy if exists "follows_public_read" on public.follows;
create policy "follows_public_read" on public.follows for select using (true);

drop policy if exists "follows_owner_write" on public.follows;
create policy "follows_owner_write" on public.follows
  for all using (auth.uid() = follower_id or public.is_admin(auth.uid()))
  with check (auth.uid() = follower_id or public.is_admin(auth.uid()));

-- ============================================================
-- USER FEED + PERSONAL FEED STATE =============================
-- ============================================================
create table if not exists public.user_feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  public_profile_uid text,
  body text not null,
  media_url text,
  audience text not null default 'Everyone',
  tags text[] not null default array[]::text[],
  metrics jsonb not null default '{"likes":0,"comments":0,"reshares":0,"saves":0}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_feed_posts_user_created on public.user_feed_posts(user_id, created_at desc);
alter table public.user_feed_posts enable row level security;

drop policy if exists "feed_posts_public_read" on public.user_feed_posts;
create policy "feed_posts_public_read" on public.user_feed_posts
  for select using (
    audience = 'Everyone'
    or auth.uid() = user_id
    or public.is_admin(auth.uid())
  );

drop policy if exists "feed_posts_owner_write" on public.user_feed_posts;
create policy "feed_posts_owner_write" on public.user_feed_posts
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create table if not exists public.user_feed_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  public_profile_uid text,
  activity_type text not null check (activity_type in ('react','save','share','follow','view')),
  target_type text not null default 'post',
  target_id text not null,
  reaction text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_feed_activity_user_created on public.user_feed_activity(user_id, created_at desc);
create index if not exists idx_user_feed_activity_target on public.user_feed_activity(target_type, target_id);
alter table public.user_feed_activity enable row level security;

drop policy if exists "feed_activity_self_read" on public.user_feed_activity;
create policy "feed_activity_self_read" on public.user_feed_activity
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "feed_activity_self_insert" on public.user_feed_activity;
create policy "feed_activity_self_insert" on public.user_feed_activity
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- REWARD BALANCES + LEDGER ====================================
-- ============================================================
create table if not exists public.community_credit_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  public_profile_uid text,
  current_balance integer not null default 0,
  lifetime_earned integer not null default 0,
  lifetime_spent integer not null default 0,
  engagement_level text,
  current_streak_days integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.community_credit_balances enable row level security;

drop policy if exists "credit_balance_self_read" on public.community_credit_balances;
create policy "credit_balance_self_read" on public.community_credit_balances
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "credit_balance_admin_write" on public.community_credit_balances;
create policy "credit_balance_admin_write" on public.community_credit_balances
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create table if not exists public.community_credit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  public_profile_uid text,
  event_type text not null,
  points integer not null,
  status text not null default 'approved' check (status in ('pending','approved','rejected','reversed')),
  source_type text,
  source_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_events_user_created on public.community_credit_events(user_id, created_at desc);
alter table public.community_credit_events enable row level security;

drop policy if exists "credit_events_self_read" on public.community_credit_events;
create policy "credit_events_self_read" on public.community_credit_events
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "credit_events_admin_write" on public.community_credit_events;
create policy "credit_events_admin_write" on public.community_credit_events
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create or replace function public.ensure_user_credit_balance(_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  public_uid text;
begin
  select public_profile_uid into public_uid from public.profiles where id = _user_id;

  insert into public.community_credit_balances (user_id, public_profile_uid)
  values (_user_id, public_uid)
  on conflict (user_id) do update set public_profile_uid = excluded.public_profile_uid;
end;
$$;

create or replace function public.sync_profile_uid_to_user_data()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_user_credit_balance(new.id);
  update public.user_feed_posts set public_profile_uid = new.public_profile_uid where user_id = new.id;
  update public.user_feed_activity set public_profile_uid = new.public_profile_uid where user_id = new.id;
  update public.community_credit_events set public_profile_uid = new.public_profile_uid where user_id = new.id;
  update public.community_credit_balances set public_profile_uid = new.public_profile_uid where user_id = new.id;
  return new;
end;
$$;

drop trigger if exists on_profile_uid_sync_user_data on public.profiles;
create trigger on_profile_uid_sync_user_data
after insert or update of public_profile_uid on public.profiles
for each row execute function public.sync_profile_uid_to_user_data();

insert into public.community_credit_balances (user_id, public_profile_uid)
select id, public_profile_uid from public.profiles
on conflict (user_id) do update set public_profile_uid = excluded.public_profile_uid;
