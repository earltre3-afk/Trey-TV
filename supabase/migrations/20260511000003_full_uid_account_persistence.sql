-- ============================================================
-- FULL UID ACCOUNT PERSISTENCE ===============================
-- ============================================================
-- Durable, UID-linked account state for profile media, comments,
-- reactions, saves, watch progress, guide state, preferences, and
-- rewards transactions. Private writes stay anchored to auth.uid();
-- public_profile_uid remains the public route/admin lookup mark.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Profile repair + protected identity fields
-- ------------------------------------------------------------
alter table public.profiles add column if not exists public_profile_uid text;
alter table public.profiles add column if not exists banner_url text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists link_url text;
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists verification_type text;
alter table public.profiles add column if not exists is_verified boolean not null default false;
alter table public.profiles add column if not exists verified_creator boolean not null default false;
alter table public.profiles add column if not exists profile_accent_color text default 'gold';
alter table public.profiles add column if not exists profile_visibility text not null default 'public';
alter table public.profiles add column if not exists show_location boolean not null default true;
alter table public.profiles add column if not exists show_birthday boolean not null default false;
alter table public.profiles add column if not exists tagline text;
alter table public.profiles add column if not exists pronouns text;
alter table public.profiles add column if not exists birthday text;
alter table public.profiles add column if not exists favorite_genres text;
alter table public.profiles add column if not exists favorite_creators text;
alter table public.profiles add column if not exists social_instagram text;
alter table public.profiles add column if not exists social_tiktok text;
alter table public.profiles add column if not exists social_youtube text;

update public.profiles
set public_profile_uid = public.generate_public_profile_uid()
where public_profile_uid is null;

alter table public.profiles alter column public_profile_uid set not null;
create unique index if not exists profiles_public_profile_uid_key on public.profiles(public_profile_uid);
create unique index if not exists profiles_username_lower_key on public.profiles(lower(username)) where username is not null;

create or replace function public.protect_profile_identity_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin(auth.uid()) then
    return new;
  end if;

  if old.public_profile_uid is distinct from new.public_profile_uid then
    raise exception 'public_profile_uid cannot be changed by the profile owner';
  end if;

  if old.role is distinct from new.role
    or old.creator_status is distinct from new.creator_status
    or old.status is distinct from new.status
    or old.ban_reason is distinct from new.ban_reason
    or old.banned_at is distinct from new.banned_at
    or old.banned_until is distinct from new.banned_until
    or old.banned_by is distinct from new.banned_by
    or old.gold_verified is distinct from new.gold_verified
    or old.gold_verified_at is distinct from new.gold_verified_at
    or old.gold_verified_by is distinct from new.gold_verified_by
    or old.verification_category is distinct from new.verification_category
    or old.verification_type is distinct from new.verification_type
    or old.is_verified is distinct from new.is_verified
    or old.verified_creator is distinct from new.verified_creator then
    raise exception 'protected profile fields require admin access';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_identity_fields on public.profiles;
create trigger protect_profile_identity_fields
before update on public.profiles
for each row execute function public.protect_profile_identity_fields();

-- ------------------------------------------------------------
-- Storage buckets
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  true,
  52428800,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'message-media',
  'message-media',
  false,
  104857600,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','audio/mpeg','audio/mp4','audio/webm','audio/wav','audio/ogg']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile_media_public_read" on storage.objects;
create policy "profile_media_public_read" on storage.objects
  for select using (bucket_id = 'profile-media');

drop policy if exists "profile_media_owner_insert" on storage.objects;
create policy "profile_media_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'profile-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "profile_media_owner_update" on storage.objects;
create policy "profile_media_owner_update" on storage.objects
  for update using (
    bucket_id = 'profile-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'profile-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "profile_media_owner_delete" on storage.objects;
create policy "profile_media_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'profile-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "message_media_owner_select" on storage.objects;
create policy "message_media_owner_select" on storage.objects
  for select using (
    bucket_id = 'message-media'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (
        select 1
        from public.direct_messages dm
        where dm.media_url = storage.objects.name
          and (dm.sender_id = auth.uid() or dm.recipient_id = auth.uid() or public.is_admin(auth.uid()))
      )
    )
  );

drop policy if exists "message_media_owner_insert" on storage.objects;
create policy "message_media_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'message-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ------------------------------------------------------------
-- Direct message repair
-- ------------------------------------------------------------
alter table public.direct_messages add column if not exists sender_id uuid references auth.users(id) on delete cascade;
alter table public.direct_messages add column if not exists recipient_id uuid references auth.users(id) on delete cascade;
alter table public.direct_messages add column if not exists body text not null default '';
alter table public.direct_messages add column if not exists message_type text not null default 'text';
alter table public.direct_messages add column if not exists media_url text;
alter table public.direct_messages add column if not exists media_type text;
alter table public.direct_messages add column if not exists voice_duration numeric;
alter table public.direct_messages add column if not exists ghost_expires_at timestamptz;
alter table public.direct_messages add column if not exists ghost_label text;
alter table public.direct_messages add column if not exists read_at timestamptz;
alter table public.direct_messages add column if not exists updated_at timestamptz not null default now();

-- ------------------------------------------------------------
-- Comments, reactions, saves, shares
-- ------------------------------------------------------------
create table if not exists public.user_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  creator_id uuid not null references auth.users(id) on delete cascade,
  parent_comment_id uuid references public.user_post_comments(id) on delete cascade,
  body text not null,
  moderation_status text not null default 'visible' check (moderation_status in ('visible','hidden','flagged')),
  deleted_at timestamptz,
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_post_comments_post_created on public.user_post_comments(post_id, created_at);
create index if not exists idx_user_post_comments_creator on public.user_post_comments(creator_id, created_at desc);
alter table public.user_post_comments enable row level security;

drop policy if exists "comments_public_read_visible" on public.user_post_comments;
create policy "comments_public_read_visible" on public.user_post_comments
  for select using (
    deleted_at is null
    and moderation_status = 'visible'
  );

drop policy if exists "comments_creator_insert" on public.user_post_comments;
create policy "comments_creator_insert" on public.user_post_comments
  for insert with check (auth.uid() = creator_id);

drop policy if exists "comments_creator_update" on public.user_post_comments;
create policy "comments_creator_update" on public.user_post_comments
  for update using (auth.uid() = creator_id or public.is_admin(auth.uid()))
  with check (auth.uid() = creator_id or public.is_admin(auth.uid()));

drop policy if exists "comments_creator_delete" on public.user_post_comments;
create policy "comments_creator_delete" on public.user_post_comments
  for delete using (auth.uid() = creator_id or public.is_admin(auth.uid()));

create table if not exists public.user_post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists idx_user_post_reactions_post on public.user_post_reactions(post_id);
alter table public.user_post_reactions enable row level security;

drop policy if exists "post_reactions_public_read" on public.user_post_reactions;
create policy "post_reactions_public_read" on public.user_post_reactions for select using (true);

drop policy if exists "post_reactions_owner_write" on public.user_post_reactions;
create policy "post_reactions_owner_write" on public.user_post_reactions
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create table if not exists public.user_comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.user_post_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null default 'like',
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

create index if not exists idx_user_comment_reactions_comment on public.user_comment_reactions(comment_id);
alter table public.user_comment_reactions enable row level security;

drop policy if exists "comment_reactions_public_read" on public.user_comment_reactions;
create policy "comment_reactions_public_read" on public.user_comment_reactions for select using (true);

drop policy if exists "comment_reactions_owner_write" on public.user_comment_reactions;
create policy "comment_reactions_owner_write" on public.user_comment_reactions
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create table if not exists public.user_saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null default 'post',
  target_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create index if not exists idx_user_saved_items_user_created on public.user_saved_items(user_id, created_at desc);
alter table public.user_saved_items enable row level security;

drop policy if exists "saved_items_owner_read" on public.user_saved_items;
create policy "saved_items_owner_read" on public.user_saved_items
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "saved_items_owner_write" on public.user_saved_items;
create policy "saved_items_owner_write" on public.user_saved_items
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create table if not exists public.user_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null default 'post',
  target_id text not null,
  destination text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_shares_user_created on public.user_shares(user_id, created_at desc);
alter table public.user_shares enable row level security;

drop policy if exists "shares_owner_read" on public.user_shares;
create policy "shares_owner_read" on public.user_shares
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "shares_owner_insert" on public.user_shares;
create policy "shares_owner_insert" on public.user_shares
  for insert with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Watch history, progress, Watch Later, Guide state
-- ------------------------------------------------------------
create table if not exists public.user_video_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  episode_id text not null,
  show_id text,
  channel_id text,
  progress_seconds integer not null default 0,
  duration_seconds integer not null default 0,
  progress_ratio numeric not null default 0,
  completed boolean not null default false,
  last_watched_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  primary key (user_id, episode_id)
);

create index if not exists idx_user_video_progress_user_last on public.user_video_progress(user_id, last_watched_at desc);
alter table public.user_video_progress enable row level security;

drop policy if exists "video_progress_owner_read" on public.user_video_progress;
create policy "video_progress_owner_read" on public.user_video_progress
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "video_progress_owner_write" on public.user_video_progress;
create policy "video_progress_owner_write" on public.user_video_progress
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create table if not exists public.user_watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  episode_id text not null,
  show_id text,
  channel_id text,
  watched_at timestamptz not null default now(),
  completed_at timestamptz,
  progress_seconds integer not null default 0,
  duration_seconds integer not null default 0,
  progress_ratio numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_user_watch_history_user_watched on public.user_watch_history(user_id, watched_at desc);
create index if not exists idx_user_watch_history_episode on public.user_watch_history(episode_id);
alter table public.user_watch_history enable row level security;

drop policy if exists "watch_history_owner_read" on public.user_watch_history;
create policy "watch_history_owner_read" on public.user_watch_history
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "watch_history_owner_insert" on public.user_watch_history;
create policy "watch_history_owner_insert" on public.user_watch_history
  for insert with check (auth.uid() = user_id);

create table if not exists public.user_watch_later (
  user_id uuid not null references auth.users(id) on delete cascade,
  episode_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, episode_id)
);

alter table public.user_watch_later enable row level security;

drop policy if exists "watch_later_owner_read" on public.user_watch_later;
create policy "watch_later_owner_read" on public.user_watch_later
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "watch_later_owner_write" on public.user_watch_later;
create policy "watch_later_owner_write" on public.user_watch_later
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create table if not exists public.user_guide_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  episode_id text not null,
  state_type text not null check (state_type in ('saved','reminder','my_schedule','watched','premium_unlocked')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, episode_id, state_type)
);

create index if not exists idx_user_guide_items_user_type on public.user_guide_items(user_id, state_type, created_at desc);
alter table public.user_guide_items enable row level security;

drop policy if exists "guide_items_owner_read" on public.user_guide_items;
create policy "guide_items_owner_read" on public.user_guide_items
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "guide_items_owner_write" on public.user_guide_items;
create policy "guide_items_owner_write" on public.user_guide_items
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- ------------------------------------------------------------
-- Private account preferences/settings
-- ------------------------------------------------------------
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  public_profile_uid text,
  profile_preferences jsonb not null default '{}'::jsonb,
  feed_preferences jsonb not null default '{}'::jsonb,
  inbox_preferences jsonb not null default '{}'::jsonb,
  rewards_preferences jsonb not null default '{}'::jsonb,
  prescribe_preferences jsonb not null default '{}'::jsonb,
  app_settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

drop policy if exists "preferences_owner_read" on public.user_preferences;
create policy "preferences_owner_read" on public.user_preferences
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "preferences_owner_write" on public.user_preferences;
create policy "preferences_owner_write" on public.user_preferences
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create or replace function public.ensure_user_preferences(_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  public_uid text;
begin
  if auth.uid() is distinct from _user_id and not public.is_admin(auth.uid()) then
    raise exception 'not allowed';
  end if;

  select public_profile_uid into public_uid from public.profiles where id = _user_id;

  insert into public.user_preferences (user_id, public_profile_uid)
  values (_user_id, public_uid)
  on conflict (user_id) do update set
    public_profile_uid = excluded.public_profile_uid,
    updated_at = now();
end;
$$;

-- ------------------------------------------------------------
-- Rewards transactions
-- ------------------------------------------------------------
alter table public.community_credit_balances add column if not exists current_balance integer not null default 0;
alter table public.community_credit_balances add column if not exists lifetime_earned integer not null default 0;
alter table public.community_credit_balances add column if not exists lifetime_spent integer not null default 0;
alter table public.community_credit_balances add column if not exists engagement_level text;
alter table public.community_credit_balances add column if not exists current_streak_days integer not null default 0;
alter table public.community_credit_balances add column if not exists updated_at timestamptz not null default now();

alter table public.community_credit_events add column if not exists event_type text not null default 'adjustment';
alter table public.community_credit_events add column if not exists points integer not null default 0;
alter table public.community_credit_events add column if not exists status text not null default 'approved';
alter table public.community_credit_events add column if not exists source_type text;
alter table public.community_credit_events add column if not exists source_id text;
alter table public.community_credit_events add column if not exists metadata jsonb not null default '{}'::jsonb;

create or replace function public.spend_community_credit(
  _points integer,
  _event_type text,
  _source_type text default null,
  _source_id text default null,
  _metadata jsonb default '{}'::jsonb
)
returns public.community_credit_balances
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  public_uid text;
  balance_row public.community_credit_balances;
begin
  if actor is null then
    raise exception 'authentication required';
  end if;

  if _points <= 0 then
    raise exception 'points must be positive';
  end if;

  perform public.ensure_user_credit_balance(actor);

  select * into balance_row
  from public.community_credit_balances
  where user_id = actor
  for update;

  if balance_row.current_balance < _points then
    raise exception 'insufficient credits';
  end if;

  select public_profile_uid into public_uid from public.profiles where id = actor;

  update public.community_credit_balances
  set current_balance = current_balance - _points,
      lifetime_spent = lifetime_spent + _points,
      public_profile_uid = public_uid,
      updated_at = now()
  where user_id = actor
  returning * into balance_row;

  insert into public.community_credit_events (
    user_id, public_profile_uid, event_type, points, status, source_type, source_id, metadata
  )
  values (
    actor, public_uid, coalesce(_event_type, 'spend'), -_points, 'approved', _source_type, _source_id, coalesce(_metadata, '{}'::jsonb)
  );

  return balance_row;
end;
$$;

create or replace function public.award_community_credit(
  _points integer,
  _event_type text,
  _source_type text default null,
  _source_id text default null,
  _metadata jsonb default '{}'::jsonb
)
returns public.community_credit_balances
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  public_uid text;
  balance_row public.community_credit_balances;
begin
  if actor is null then
    raise exception 'authentication required';
  end if;

  if _points <= 0 then
    raise exception 'points must be positive';
  end if;

  if not public.is_admin(actor) then
    raise exception 'admin access required';
  end if;

  if _event_type not in ('episode_watch_completed','episode_saved','meaningful_comment','daily_streak','weekly_streak','creator_followed','friend_invited','manual_adjustment') then
    raise exception 'unsupported reward event';
  end if;

  perform public.ensure_user_credit_balance(actor);
  select public_profile_uid into public_uid from public.profiles where id = actor;

  update public.community_credit_balances
  set current_balance = current_balance + _points,
      lifetime_earned = lifetime_earned + _points,
      public_profile_uid = public_uid,
      updated_at = now()
  where user_id = actor
  returning * into balance_row;

  insert into public.community_credit_events (
    user_id, public_profile_uid, event_type, points, status, source_type, source_id, metadata
  )
  values (
    actor, public_uid, _event_type, _points, 'approved', _source_type, _source_id, coalesce(_metadata, '{}'::jsonb)
  );

  return balance_row;
end;
$$;

create or replace function public.redeem_community_credit(
  _points integer,
  _redemption_type text,
  _source_id text default null,
  _metadata jsonb default '{}'::jsonb
)
returns public.community_credit_balances
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  balance_row public.community_credit_balances;
begin
  if actor is null then
    raise exception 'authentication required';
  end if;

  balance_row := public.spend_community_credit(_points, 'redeem_' || coalesce(_redemption_type, 'perk'), 'reward_redemption', _source_id, _metadata);

  insert into public.reward_redemptions (user_id, redemption_type, points_spent, metadata, status)
  values (actor, coalesce(_redemption_type, 'perk'), _points, coalesce(_metadata, '{}'::jsonb), 'approved');

  return balance_row;
end;
$$;

-- ------------------------------------------------------------
-- UID sync repair
-- ------------------------------------------------------------
create or replace function public.sync_profile_uid_to_user_data()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_user_credit_balance(new.id);
  update public.user_preferences set public_profile_uid = new.public_profile_uid where user_id = new.id;
  update public.user_feed_posts set public_profile_uid = new.public_profile_uid where user_id = new.id;
  update public.user_feed_activity set public_profile_uid = new.public_profile_uid where user_id = new.id;
  update public.community_credit_events set public_profile_uid = new.public_profile_uid where user_id = new.id;
  update public.community_credit_balances set public_profile_uid = new.public_profile_uid where user_id = new.id;
  return new;
end;
$$;

insert into public.community_credit_balances (user_id, public_profile_uid)
select id, public_profile_uid from public.profiles
on conflict (user_id) do update set public_profile_uid = excluded.public_profile_uid;

insert into public.user_preferences (user_id, public_profile_uid)
select id, public_profile_uid from public.profiles
on conflict (user_id) do update set public_profile_uid = excluded.public_profile_uid;
