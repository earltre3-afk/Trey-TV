-- ============================================================
-- ONBOARDING UID ACCOUNT BOOTSTRAP ===========================
-- ============================================================
-- Guarantees a completed onboarding account has one durable
-- public UID plus the private UID-backed rows used for memory,
-- preferences, rewards, and app state.

create extension if not exists pgcrypto;

-- Keep the legacy site_uid alias available for older app code while
-- public_profile_uid remains the canonical public identity.
alter table public.profiles add column if not exists site_uid text;
alter table public.profiles add column if not exists onboarding_completed boolean not null default false;
alter table public.profiles add column if not exists onboarding_status text not null default 'not_started';
alter table public.profiles add column if not exists onboarding_method text;
alter table public.profiles add column if not exists onboarding_last_saved_at timestamptz;
alter table public.profiles add column if not exists onboarding_completed_at timestamptz;
alter table public.profiles add column if not exists account_setup_completed_at timestamptz;
alter table public.profiles add column if not exists date_of_birth text;
alter table public.profiles add column if not exists favorite_categories text[] not null default array[]::text[];
alter table public.profiles add column if not exists favorite_moods text[] not null default array[]::text[];
alter table public.profiles add column if not exists content_frequency text;
alter table public.profiles add column if not exists fan_type text;
alter table public.profiles add column if not exists show_top_three boolean not null default true;
alter table public.profiles add column if not exists allow_top_three_adds boolean not null default true;
alter table public.profiles add column if not exists social_links jsonb not null default '{}'::jsonb;

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

  if old.public_profile_uid is not null
    and old.public_profile_uid is distinct from new.public_profile_uid then
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

create or replace function public.generate_trey_public_profile_uid()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
begin
  loop
    candidate := '423' || lpad((floor(random() * 10000000000000))::bigint::text, 13, '0');
    exit when not exists (
      select 1
      from public.profiles
      where public_profile_uid = candidate
         or site_uid = candidate
    );
  end loop;
  return candidate;
end;
$$;

create or replace function public.generate_public_profile_uid()
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.generate_trey_public_profile_uid();
end;
$$;

update public.profiles
set public_profile_uid = public.generate_trey_public_profile_uid()
where public_profile_uid is null;

update public.profiles
set site_uid = public_profile_uid
where site_uid is null
  and public_profile_uid is not null;

create unique index if not exists profiles_site_uid_key on public.profiles(site_uid) where site_uid is not null;

create table if not exists public.user_onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_step integer not null default 0,
  selected_path text,
  answers jsonb not null default '{}'::jsonb,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_onboarding enable row level security;

drop policy if exists "user_onboarding_owner_read" on public.user_onboarding;
create policy "user_onboarding_owner_read" on public.user_onboarding
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "user_onboarding_owner_write" on public.user_onboarding;
create policy "user_onboarding_owner_write" on public.user_onboarding
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create or replace function public.ensure_completed_onboarding_account(_user_id uuid)
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

  select public_profile_uid into public_uid
  from public.profiles
  where id = _user_id;

  if public_uid is null then
    public_uid := public.generate_trey_public_profile_uid();

    update public.profiles
    set public_profile_uid = public_uid,
        site_uid = coalesce(site_uid, public_uid),
        updated_at = now()
    where id = _user_id;
  else
    update public.profiles
    set site_uid = coalesce(site_uid, public_uid),
        updated_at = now()
    where id = _user_id;
  end if;

  insert into public.user_preferences (user_id, public_profile_uid)
  values (_user_id, public_uid)
  on conflict (user_id) do update set
    public_profile_uid = excluded.public_profile_uid,
    updated_at = now();

  insert into public.community_credit_balances (user_id, public_profile_uid)
  values (_user_id, public_uid)
  on conflict (user_id) do update set
    public_profile_uid = excluded.public_profile_uid,
    updated_at = now();

  insert into public.user_onboarding (
    user_id,
    current_step,
    completed,
    updated_at
  )
  values (_user_id, 99, true, now())
  on conflict (user_id) do update set
    current_step = greatest(public.user_onboarding.current_step, 99),
    completed = true,
    updated_at = now();
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  public_uid text := public.generate_trey_public_profile_uid();
begin
  insert into public.profiles (
    id,
    public_profile_uid,
    site_uid,
    email,
    display_name,
    username,
    avatar_url,
    role
  )
  values (
    new.id,
    public_uid,
    public_uid,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url',
    'user'
  )
  on conflict (id) do nothing;

  if lower(new.email) = lower('californiatrey@gmail.com') then
    insert into public.admin_users (user_id, email, role)
    values (new.id, new.email, 'owner')
    on conflict (user_id) do update set role = 'owner';
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

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

drop trigger if exists on_profile_uid_sync_user_data on public.profiles;
create trigger on_profile_uid_sync_user_data
after insert or update of public_profile_uid on public.profiles
for each row execute function public.sync_profile_uid_to_user_data();

insert into public.user_preferences (user_id, public_profile_uid)
select id, public_profile_uid from public.profiles
where public_profile_uid is not null
on conflict (user_id) do update set public_profile_uid = excluded.public_profile_uid;

insert into public.community_credit_balances (user_id, public_profile_uid)
select id, public_profile_uid from public.profiles
where public_profile_uid is not null
on conflict (user_id) do update set public_profile_uid = excluded.public_profile_uid;
