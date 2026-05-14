-- Harden Trey TV social relationships without dropping existing data.
-- Reuses public.follows, public.user_blocks, and public.profile_top_three.

alter table public.follows enable row level security;
alter table public.user_blocks enable row level security;
alter table public.profile_top_three enable row level security;

drop policy if exists "follows_owner_write" on public.follows;
drop policy if exists "follows_owner_insert" on public.follows;
create policy "follows_owner_insert" on public.follows
  for insert
  with check (auth.uid() = follower_id);

drop policy if exists "follows_owner_delete" on public.follows;
create policy "follows_owner_delete" on public.follows
  for delete
  using (auth.uid() = follower_id);

grant select on public.follows to anon, authenticated;
grant insert, delete on public.follows to authenticated;
grant select on public.user_blocks to authenticated;
grant insert, delete on public.user_blocks to authenticated;
grant select on public.profile_top_three to anon, authenticated;
grant insert, update, delete on public.profile_top_three to authenticated;

create or replace function public.is_blocked_between(_user_a uuid, _user_b uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select case
    when _user_a is null or _user_b is null then false
    else exists (
      select 1
      from public.user_blocks
      where (blocker_id = _user_a and blocked_id = _user_b)
         or (blocker_id = _user_b and blocked_id = _user_a)
    )
  end;
$$;

create or replace function public.remove_relationship_on_block(_blocker_id uuid, _blocked_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.follows
  where (follower_id = _blocker_id and following_id = _blocked_id)
     or (follower_id = _blocked_id and following_id = _blocker_id);

  delete from public.profile_top_three
  where (profile_user_id = _blocker_id and featured_user_id = _blocked_id)
     or (profile_user_id = _blocked_id and featured_user_id = _blocker_id);
end;
$$;

create or replace function public.prevent_blocked_follow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.follower_id = new.following_id then
    raise exception 'cannot follow yourself';
  end if;

  if public.is_blocked_between(new.follower_id, new.following_id) then
    raise exception 'blocked users cannot follow each other';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_blocked_follow on public.follows;
create trigger prevent_blocked_follow
before insert on public.follows
for each row execute function public.prevent_blocked_follow();

create or replace function public.prevent_blocked_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_blocked_between(new.sender_id, new.recipient_id) then
    raise exception 'blocked users cannot message each other';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_blocked_message on public.direct_messages;
create trigger prevent_blocked_message
before insert on public.direct_messages
for each row execute function public.prevent_blocked_message();

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
  on conflict (blocker_id, blocked_id) do update set created_at = public.user_blocks.created_at
  returning * into _result;

  perform public.remove_relationship_on_block(_blocker_id, _target_user_id);

  return _result;
end;
$$;

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

create or replace function public.get_relationship_status(_viewer_id uuid, _target_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _is_following boolean := false;
  _is_followed_by boolean := false;
  _is_blocked boolean := false;
  _is_blocked_by boolean := false;
begin
  if _viewer_id is null or _target_id is null then
    return jsonb_build_object(
      'is_following', false,
      'is_followed_by', false,
      'is_mutual_follow', false,
      'is_blocked', false,
      'is_blocked_by', false,
      'can_follow', false,
      'can_message', false,
      'can_add_to_top_three', false
    );
  end if;

  select exists (
    select 1 from public.follows
    where follower_id = _viewer_id and following_id = _target_id
  ) into _is_following;

  select exists (
    select 1 from public.follows
    where follower_id = _target_id and following_id = _viewer_id
  ) into _is_followed_by;

  select exists (
    select 1 from public.user_blocks
    where blocker_id = _viewer_id and blocked_id = _target_id
  ) into _is_blocked;

  select exists (
    select 1 from public.user_blocks
    where blocker_id = _target_id and blocked_id = _viewer_id
  ) into _is_blocked_by;

  return jsonb_build_object(
    'is_following', _is_following,
    'is_followed_by', _is_followed_by,
    'is_mutual_follow', _is_following and _is_followed_by,
    'is_blocked', _is_blocked,
    'is_blocked_by', _is_blocked_by,
    'can_follow', not _is_blocked and not _is_blocked_by and _viewer_id <> _target_id,
    'can_message', not _is_blocked and not _is_blocked_by and _viewer_id <> _target_id,
    'can_add_to_top_three', not _is_blocked and not _is_blocked_by and _viewer_id <> _target_id
  );
end;
$$;

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

  if public.is_blocked_between(_profile_user_id, _featured_user_id) then
    raise exception 'cannot add blocked user to Top 3';
  end if;

  if not exists (
    select 1 from public.follows
    where (follower_id = _profile_user_id and following_id = _featured_user_id)
       or (follower_id = _featured_user_id and following_id = _profile_user_id)
  ) then
    raise exception 'Top 3 is limited to people you follow, followers, or mutual connections';
  end if;

  select count(*) into _existing_count
  from public.profile_top_three
  where profile_user_id = _profile_user_id;

  if _existing_count >= 3 then
    raise exception 'maximum 3 Top 3 entries allowed';
  end if;

  if exists (
    select 1 from public.profile_top_three
    where profile_user_id = _profile_user_id and featured_user_id = _featured_user_id
  ) then
    raise exception 'user already in Top 3';
  end if;

  insert into public.profile_top_three (profile_user_id, featured_user_id, position, updated_at)
  values (_profile_user_id, _featured_user_id, _position, now())
  returning * into _result;

  return _result;
end;
$$;

create or replace function public.remove_from_top_three(_featured_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  _profile_user_id uuid := auth.uid();
  _remaining uuid[];
  _featured uuid;
  _position int := 1;
begin
  if _profile_user_id is null then
    raise exception 'authentication required';
  end if;

  select coalesce(array_agg(featured_user_id order by position), array[]::uuid[])
  into _remaining
  from public.profile_top_three
  where profile_user_id = _profile_user_id
    and featured_user_id <> _featured_user_id;

  delete from public.profile_top_three
  where profile_user_id = _profile_user_id;

  foreach _featured in array _remaining loop
    insert into public.profile_top_three (profile_user_id, featured_user_id, position, updated_at)
    values (_profile_user_id, _featured, _position, now());
    _position := _position + 1;
  end loop;

  return true;
end;
$$;

create or replace function public.reorder_top_three(_featured_user_id uuid, _new_position int)
returns public.profile_top_three
language plpgsql
security definer
set search_path = public
as $$
declare
  _profile_user_id uuid := auth.uid();
  _ordered uuid[];
  _without_target uuid[];
  _rebuilt uuid[] := array[]::uuid[];
  _featured uuid;
  _position int := 1;
  _result public.profile_top_three;
begin
  if _profile_user_id is null then
    raise exception 'authentication required';
  end if;

  if _new_position < 1 or _new_position > 3 then
    raise exception 'position must be between 1 and 3';
  end if;

  select array_agg(featured_user_id order by position)
  into _ordered
  from public.profile_top_three
  where profile_user_id = _profile_user_id;

  if _ordered is null or not (_featured_user_id = any(_ordered)) then
    raise exception 'user not in Top 3';
  end if;

  _without_target := array_remove(_ordered, _featured_user_id);

  for _position in 1..3 loop
    if _position = _new_position then
      _rebuilt := array_append(_rebuilt, _featured_user_id);
    end if;

    if array_length(_without_target, 1) >= 1 then
      _rebuilt := array_append(_rebuilt, _without_target[1]);
      _without_target := _without_target[2:array_length(_without_target, 1)];
    end if;
  end loop;

  delete from public.profile_top_three
  where profile_user_id = _profile_user_id;

  _position := 1;
  foreach _featured in array _rebuilt loop
    insert into public.profile_top_three (profile_user_id, featured_user_id, position, updated_at)
    values (_profile_user_id, _featured, _position, now())
    returning * into _result;

    if _featured = _featured_user_id then
      select * into _result
      from public.profile_top_three
      where profile_user_id = _profile_user_id and featured_user_id = _featured_user_id;
    end if;

    _position := _position + 1;
    exit when _position > 3;
  end loop;

  return _result;
end;
$$;

create or replace function public.get_profile_top_three(_profile_user_id uuid)
returns table (
  id uuid,
  profile_user_id uuid,
  featured_user_id uuid,
  position int,
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
      select 1
      from public.profile_top_three t2
      where t2.profile_user_id = t.featured_user_id
        and t2.featured_user_id = t.profile_user_id
        and not public.is_blocked_between(t2.profile_user_id, t2.featured_user_id)
    ) as is_mutual_top_three
  from public.profile_top_three t
  join public.profiles p on p.id = t.featured_user_id
  where t.profile_user_id = _profile_user_id
    and not public.is_blocked_between(t.profile_user_id, t.featured_user_id)
  order by t.position;
$$;
