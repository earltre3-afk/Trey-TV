-- ============================================================
-- SOCIAL RELATIONSHIPS SYSTEM =================================
-- ============================================================
-- Block/unblock system and Top 3 profile feature
-- This migration adds user_blocks and profile_top_three tables
-- with proper RLS policies and helper functions.

-- ------------------------------------------------------------
-- USER BLOCKS TABLE ===========================================
-- ------------------------------------------------------------
create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index if not exists idx_user_blocks_blocker on public.user_blocks(blocker_id, created_at desc);
create index if not exists idx_user_blocks_blocked on public.user_blocks(blocked_id, created_at desc);

alter table public.user_blocks enable row level security;

-- Users can read their own blocks (where they are blocker or blocked)
drop policy if exists "user_blocks_self_read" on public.user_blocks;
create policy "user_blocks_self_read" on public.user_blocks
  for select using (blocker_id = auth.uid() or blocked_id = auth.uid());

-- Users can only insert blocks where they are the blocker
drop policy if exists "user_blocks_self_insert" on public.user_blocks;
create policy "user_blocks_self_insert" on public.user_blocks
  for insert with check (blocker_id = auth.uid());

-- Users can only delete blocks where they are the blocker
drop policy if exists "user_blocks_self_delete" on public.user_blocks;
create policy "user_blocks_self_delete" on public.user_blocks
  for delete using (blocker_id = auth.uid());

-- ------------------------------------------------------------
-- PROFILE TOP THREE TABLE =====================================
-- ------------------------------------------------------------
create table if not exists public.profile_top_three (
  id uuid primary key default gen_random_uuid(),
  profile_user_id uuid not null references auth.users(id) on delete cascade,
  featured_user_id uuid not null references auth.users(id) on delete cascade,
  position int not null check (position between 1 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_user_id, featured_user_id),
  unique (profile_user_id, position),
  check (profile_user_id <> featured_user_id)
);

create index if not exists idx_profile_top_three_profile on public.profile_top_three(profile_user_id, position);
create index if not exists idx_profile_top_three_featured on public.profile_top_three(featured_user_id);

alter table public.profile_top_three enable row level security;

-- Public can read Top 3 for profile display
drop policy if exists "profile_top_three_public_read" on public.profile_top_three;
create policy "profile_top_three_public_read" on public.profile_top_three
  for select using (true);

-- Users can insert/update/delete only their own Top 3
drop policy if exists "profile_top_three_owner_write" on public.profile_top_three;
create policy "profile_top_three_owner_write" on public.profile_top_three
  for all using (profile_user_id = auth.uid())
  with check (profile_user_id = auth.uid());

-- ------------------------------------------------------------
-- HELPER FUNCTIONS ============================================
-- ------------------------------------------------------------

-- Function to check if two users have a block relationship
create or replace function public.is_blocked_between(_user_a uuid, _user_b uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_blocks
    where (blocker_id = _user_a and blocked_id = _user_b)
       or (blocker_id = _user_b and blocked_id = _user_a)
  );
$$;

-- Function to remove follow relationships when blocking
create or replace function public.remove_relationship_on_block(_blocker_id uuid, _blocked_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Remove blocker following blocked
  delete from public.follows
  where follower_id = _blocker_id and following_id = _blocked_id;

  -- Remove blocked following blocker
  delete from public.follows
  where follower_id = _blocked_id and following_id = _blocker_id;

  -- Remove blocked from blocker's Top 3
  delete from public.profile_top_three
  where profile_user_id = _blocker_id and featured_user_id = _blocked_id;

  -- Remove blocker from blocked's Top 3
  delete from public.profile_top_three
  where profile_user_id = _blocked_id and featured_user_id = _blocker_id;
end;
$$;

-- Trigger to automatically remove relationships on block
create or replace function public.handle_block_relationships()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.remove_relationship_on_block(new.blocker_id, new.blocked_id);
  return new;
end;
$$;

drop trigger if exists handle_block_relationships on public.user_blocks;
create trigger handle_block_relationships
after insert on public.user_blocks
for each row execute function public.handle_block_relationships();

-- Function to block a user (with automatic relationship cleanup)
create or replace function public.block_user(_target_user_id uuid)
returns public.user_blocks
language plpgsql
security definer
set search_path = public
as $$
declare
  _blocker_id uuid := auth.uid();
  _result public.user_blocks;
begin
  if _blocker_id is null then
    raise exception 'authentication required';
  end if;

  if _blocker_id = _target_user_id then
    raise exception 'cannot block yourself';
  end if;

  insert into public.user_blocks (blocker_id, blocked_id)
  values (_blocker_id, _target_user_id)
  on conflict (blocker_id, blocked_id) do nothing
  returning * into _result;

  return _result;
end;
$$;

-- Function to unblock a user
create or replace function public.unblock_user(_target_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  _blocker_id uuid := auth.uid();
begin
  if _blocker_id is null then
    raise exception 'authentication required';
  end if;

  delete from public.user_blocks
  where blocker_id = _blocker_id and blocked_id = _target_user_id;

  return true;
end;
$$;

-- Function to get relationship status between two users
create or replace function public.get_relationship_status(_viewer_id uuid, _target_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _is_following boolean;
  _is_followed_by boolean;
  _is_blocked boolean;
  _is_blocked_by boolean;
  _result jsonb;
begin
  -- Check if viewer follows target
  select exists (
    select 1 from public.follows
    where follower_id = _viewer_id and following_id = _target_id
  ) into _is_following;

  -- Check if target follows viewer
  select exists (
    select 1 from public.follows
    where follower_id = _target_id and following_id = _viewer_id
  ) into _is_followed_by;

  -- Check if viewer blocked target
  select exists (
    select 1 from public.user_blocks
    where blocker_id = _viewer_id and blocked_id = _target_id
  ) into _is_blocked;

  -- Check if target blocked viewer
  select exists (
    select 1 from public.user_blocks
    where blocker_id = _target_id and blocked_id = _viewer_id
  ) into _is_blocked_by;

  _result := jsonb_build_object(
    'is_following', _is_following,
    'is_followed_by', _is_followed_by,
    'is_mutual_follow', _is_following and _is_followed_by,
    'is_blocked', _is_blocked,
    'is_blocked_by', _is_blocked_by,
    'can_follow', not _is_blocked and not _is_blocked_by and _viewer_id <> _target_id,
    'can_message', not _is_blocked and not _is_blocked_by and _viewer_id <> _target_id,
    'can_add_to_top_three', not _is_blocked and not _is_blocked_by and _viewer_id <> _target_id
  );

  return _result;
end;
$$;

-- Function to add user to Top 3
create or replace function public.add_to_top_three(_featured_user_id uuid, _position int)
returns public.profile_top_three
language plpgsql
security definer
set search_path = public
as $$
declare
  _profile_user_id uuid := auth.uid();
  _result public.profile_top_three;
  _existing_count int;
begin
  if _profile_user_id is null then
    raise exception 'authentication required';
  end if;

  if _profile_user_id = _featured_user_id then
    raise exception 'cannot add yourself to Top 3';
  end if;

  if _position < 1 or _position > 3 then
    raise exception 'position must be between 1 and 3';
  end if;

  -- Check if blocked relationship exists
  if public.is_blocked_between(_profile_user_id, _featured_user_id) then
    raise exception 'cannot add blocked user to Top 3';
  end if;

  -- Check if user already has 3 Top 3 entries
  select count(*) into _existing_count
  from public.profile_top_three
  where profile_user_id = _profile_user_id;

  if _existing_count >= 3 then
    raise exception 'maximum 3 Top 3 entries allowed';
  end if;

  -- If position is taken, shift existing entries
  update public.profile_top_three
  set position = position + 1,
      updated_at = now()
  where profile_user_id = _profile_user_id
    and position >= _position;

  -- Insert or update the entry
  insert into public.profile_top_three (profile_user_id, featured_user_id, position, updated_at)
  values (_profile_user_id, _featured_user_id, _position, now())
  on conflict (profile_user_id, featured_user_id) do update
  set position = _position,
      updated_at = now()
  returning * into _result;

  return _result;
end;
$$;

-- Function to remove user from Top 3
create or replace function public.remove_from_top_three(_featured_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  _profile_user_id uuid := auth.uid();
  _removed_position int;
begin
  if _profile_user_id is null then
    raise exception 'authentication required';
  end if;

  -- Get the position of the removed entry
  select position into _removed_position
  from public.profile_top_three
  where profile_user_id = _profile_user_id and featured_user_id = _featured_user_id;

  -- Delete the entry
  delete from public.profile_top_three
  where profile_user_id = _profile_user_id and featured_user_id = _featured_user_id;

  -- Shift positions to fill the gap
  if _removed_position is not null then
    update public.profile_top_three
    set position = position - 1,
        updated_at = now()
    where profile_user_id = _profile_user_id
      and position > _removed_position;
  end if;

  return true;
end;
$$;

-- Function to reorder Top 3 entries
create or replace function public.reorder_top_three(_featured_user_id uuid, _new_position int)
returns public.profile_top_three
language plpgsql
security definer
set search_path = public
as $$
declare
  _profile_user_id uuid := auth.uid();
  _old_position int;
  _result public.profile_top_three;
begin
  if _profile_user_id is null then
    raise exception 'authentication required';
  end if;

  if _new_position < 1 or _new_position > 3 then
    raise exception 'position must be between 1 and 3';
  end if;

  -- Get current position
  select position into _old_position
  from public.profile_top_three
  where profile_user_id = _profile_user_id and featured_user_id = _featured_user_id;

  if _old_position is null then
    raise exception 'user not in Top 3';
  end if;

  if _old_position = _new_position then
    -- No change, return existing
    select * into _result
    from public.profile_top_three
    where profile_user_id = _profile_user_id and featured_user_id = _featured_user_id;
    return _result;
  end if;

  if _new_position < _old_position then
    -- Moving up: shift entries between new and old position down
    update public.profile_top_three
    set position = position + 1,
        updated_at = now()
    where profile_user_id = _profile_user_id
      and position >= _new_position
      and position < _old_position
      and featured_user_id <> _featured_user_id;
  else
    -- Moving down: shift entries between old and new position up
    update public.profile_top_three
    set position = position - 1,
        updated_at = now()
    where profile_user_id = _profile_user_id
      and position > _old_position
      and position <= _new_position
      and featured_user_id <> _featured_user_id;
  end if;

  -- Update the entry's position
  update public.profile_top_three
  set position = _new_position,
      updated_at = now()
  where profile_user_id = _profile_user_id and featured_user_id = _featured_user_id
  returning * into _result;

  return _result;
end;
$$;

-- Function to get Top 3 for a profile
create or replace function public.get_profile_top_three(_profile_user_id uuid)
returns table (
  id uuid,
  profile_user_id uuid,
  featured_user_id uuid,
  "position" int,
  created_at timestamptz,
  updated_at timestamptz,
  featured_username text,
  featured_display_name text,
  featured_avatar_url text,
  featured_public_profile_uid text,
  is_mutual_top_three boolean
)
language sql
security definer
set search_path = public
as $$
  select
    t.id,
    t.profile_user_id,
    t.featured_user_id,
    t.position,
    t.created_at,
    t.updated_at,
    p.username as featured_username,
    p.display_name as featured_display_name,
    p.avatar_url as featured_avatar_url,
    p.public_profile_uid as featured_public_profile_uid,
    exists (
      select 1 from public.profile_top_three t2
      where t2.profile_user_id = t.featured_user_id
        and t2.featured_user_id = t.profile_user_id
    ) as is_mutual_top_three
  from public.profile_top_three t
  join public.profiles p on p.id = t.featured_user_id
  where t.profile_user_id = _profile_user_id
  order by t.position;
$$;
