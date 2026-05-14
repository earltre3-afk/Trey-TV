-- Zodiac identity, privacy-safe profile display, cached daily readings, and matched group chat metadata.

alter table public.profiles add column if not exists zodiac_sun_sign text;
alter table public.profiles add column if not exists zodiac_moon_sign text;
alter table public.profiles add column if not exists zodiac_rising_sign text;
alter table public.profiles add column if not exists zodiac_is_cusp boolean not null default false;
alter table public.profiles add column if not exists zodiac_cusp_label text;
alter table public.profiles add column if not exists zodiac_badge_key text;
alter table public.profiles add column if not exists zodiac_locked_at timestamptz;
alter table public.profiles add column if not exists zodiac_calculation_confidence text;
alter table public.profiles add column if not exists zodiac_public_opt_in boolean not null default true;
alter table public.profiles add column if not exists birth_time_local time;
alter table public.profiles add column if not exists birth_time_precision text;
alter table public.profiles add column if not exists birth_location_label text;
alter table public.profiles add column if not exists birth_location_city text;
alter table public.profiles add column if not exists birth_location_region text;
alter table public.profiles add column if not exists birth_location_country text;
alter table public.profiles add column if not exists birth_timezone text;
alter table public.profiles add column if not exists birth_latitude numeric;
alter table public.profiles add column if not exists birth_longitude numeric;
alter table public.profiles add column if not exists birth_chart_json jsonb;
alter table public.profiles add column if not exists birth_chart_generated_at timestamptz;
alter table public.profiles add column if not exists zodiac_corrected_at timestamptz;
alter table public.profiles add column if not exists zodiac_corrected_by uuid;

alter table public.profiles
  drop constraint if exists profiles_zodiac_sun_sign_check;
alter table public.profiles
  add constraint profiles_zodiac_sun_sign_check check (
    zodiac_sun_sign is null or zodiac_sun_sign in (
      'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
      'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
    )
  );

create table if not exists public.daily_zodiac_readings (
  id uuid primary key default gen_random_uuid(),
  zodiac_sign text not null,
  cusp_label text,
  reading_date date not null,
  title text not null,
  short_message text not null,
  full_message text not null,
  energy_word text not null,
  lucky_color text not null,
  lucky_number integer not null,
  recommended_action text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zodiac_group_threads (
  id uuid primary key default gen_random_uuid(),
  group_type text not null check (group_type in ('zodiac','cusp','interest','local_interest','age_interest','creator_interest')),
  group_key text not null unique,
  group_name text not null,
  group_description text,
  zodiac_sign text,
  city text,
  interest_key text,
  min_age integer,
  max_age integer,
  disabled_at timestamptz,
  moderation_status text not null default 'active' check (moderation_status in ('active','disabled','review')),
  created_at timestamptz not null default now()
);

create table if not exists public.zodiac_group_members (
  user_id uuid not null references auth.users(id) on delete cascade,
  group_thread_id uuid not null references public.zodiac_group_threads(id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  source text not null default 'auto' check (source in ('auto','manual','admin')),
  primary key (user_id, group_thread_id)
);

create table if not exists public.zodiac_group_messages (
  id uuid primary key default gen_random_uuid(),
  group_thread_id uuid not null references public.zodiac_group_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  moderation_status text not null default 'active' check (moderation_status in ('active','hidden','removed','review')),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create table if not exists public.zodiac_group_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  group_thread_id uuid references public.zodiac_group_threads(id) on delete cascade,
  message_id uuid references public.zodiac_group_messages(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending','resolved','dismissed')),
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.zodiac_group_blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_user_id uuid not null references auth.users(id) on delete cascade,
  group_thread_id uuid references public.zodiac_group_threads(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_user_id, group_thread_id)
);

create table if not exists public.zodiac_identity_corrections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  admin_user_id uuid not null references auth.users(id) on delete restrict,
  reason text not null,
  previous_identity jsonb not null,
  corrected_identity jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.daily_zodiac_readings enable row level security;
alter table public.zodiac_group_threads enable row level security;
alter table public.zodiac_group_members enable row level security;
alter table public.zodiac_group_messages enable row level security;
alter table public.zodiac_group_reports enable row level security;
alter table public.zodiac_group_blocks enable row level security;
alter table public.zodiac_identity_corrections enable row level security;

drop policy if exists "daily_zodiac_readings_public_read" on public.daily_zodiac_readings;
create policy "daily_zodiac_readings_public_read"
  on public.daily_zodiac_readings for select using (true);

drop policy if exists "daily_zodiac_readings_admin_write" on public.daily_zodiac_readings;
create policy "daily_zodiac_readings_admin_write"
  on public.daily_zodiac_readings for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "zodiac_group_threads_member_read" on public.zodiac_group_threads;
create policy "zodiac_group_threads_member_read"
  on public.zodiac_group_threads for select using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.zodiac_group_members m
      where m.group_thread_id = id and m.user_id = auth.uid() and m.left_at is null
        and moderation_status = 'active'
        and disabled_at is null
    )
  );

drop policy if exists "zodiac_group_threads_admin_write" on public.zodiac_group_threads;
create policy "zodiac_group_threads_admin_write"
  on public.zodiac_group_threads for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "zodiac_group_members_self_read" on public.zodiac_group_members;
create policy "zodiac_group_members_self_read"
  on public.zodiac_group_members for select using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "zodiac_group_members_self_leave" on public.zodiac_group_members;
create policy "zodiac_group_members_self_leave"
  on public.zodiac_group_members for update using (user_id = auth.uid() or public.is_admin(auth.uid()))
  with check (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "zodiac_group_members_admin_write" on public.zodiac_group_members;
create policy "zodiac_group_members_admin_write"
  on public.zodiac_group_members for insert with check (public.is_admin(auth.uid()));

drop policy if exists "zodiac_group_messages_member_read" on public.zodiac_group_messages;
create policy "zodiac_group_messages_member_read"
  on public.zodiac_group_messages for select using (
    public.is_admin(auth.uid())
    or (
      moderation_status = 'active'
      and exists (
        select 1 from public.zodiac_group_members m
        where m.group_thread_id = zodiac_group_messages.group_thread_id
          and m.user_id = auth.uid()
          and m.left_at is null
      )
      and not exists (
        select 1 from public.zodiac_group_blocks b
        where b.blocker_id = auth.uid()
          and b.blocked_user_id = zodiac_group_messages.sender_id
          and (b.group_thread_id = zodiac_group_messages.group_thread_id or b.group_thread_id is null)
      )
    )
  );

drop policy if exists "zodiac_group_messages_member_insert" on public.zodiac_group_messages;
create policy "zodiac_group_messages_member_insert"
  on public.zodiac_group_messages for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.zodiac_group_members m
      join public.zodiac_group_threads t on t.id = m.group_thread_id
      where m.group_thread_id = zodiac_group_messages.group_thread_id
        and m.user_id = auth.uid()
        and m.left_at is null
        and t.moderation_status = 'active'
        and t.disabled_at is null
    )
  );

drop policy if exists "zodiac_group_messages_admin_update" on public.zodiac_group_messages;
create policy "zodiac_group_messages_admin_update"
  on public.zodiac_group_messages for update using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "zodiac_group_reports_self_read" on public.zodiac_group_reports;
create policy "zodiac_group_reports_self_read"
  on public.zodiac_group_reports for select using (reporter_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "zodiac_group_reports_self_insert" on public.zodiac_group_reports;
create policy "zodiac_group_reports_self_insert"
  on public.zodiac_group_reports for insert with check (
    reporter_id = auth.uid()
    and group_thread_id is not null
    and exists (
      select 1 from public.zodiac_group_members m
      where m.group_thread_id = zodiac_group_reports.group_thread_id
        and m.user_id = auth.uid()
        and m.left_at is null
    )
    and (
      message_id is null
      or exists (
        select 1 from public.zodiac_group_messages msg
        where msg.id = zodiac_group_reports.message_id
          and msg.group_thread_id = zodiac_group_reports.group_thread_id
      )
    )
  );

drop policy if exists "zodiac_group_reports_admin_update" on public.zodiac_group_reports;
create policy "zodiac_group_reports_admin_update"
  on public.zodiac_group_reports for update using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "zodiac_group_blocks_self_manage" on public.zodiac_group_blocks;
create policy "zodiac_group_blocks_self_manage"
  on public.zodiac_group_blocks for all using (blocker_id = auth.uid() or public.is_admin(auth.uid()))
  with check (blocker_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "zodiac_identity_corrections_admin_read" on public.zodiac_identity_corrections;
create policy "zodiac_identity_corrections_admin_read"
  on public.zodiac_identity_corrections for select using (public.is_admin(auth.uid()) or user_id = auth.uid());

drop policy if exists "zodiac_identity_corrections_admin_insert" on public.zodiac_identity_corrections;
create policy "zodiac_identity_corrections_admin_insert"
  on public.zodiac_identity_corrections for insert with check (public.is_admin(auth.uid()) and admin_user_id = auth.uid());

create or replace function public.prevent_locked_zodiac_user_edits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin(auth.uid()) then
    return new;
  end if;

  if old.zodiac_locked_at is not null and (
    old.zodiac_sun_sign is distinct from new.zodiac_sun_sign
    or old.zodiac_moon_sign is distinct from new.zodiac_moon_sign
    or old.zodiac_rising_sign is distinct from new.zodiac_rising_sign
    or old.zodiac_is_cusp is distinct from new.zodiac_is_cusp
    or old.zodiac_cusp_label is distinct from new.zodiac_cusp_label
    or old.zodiac_badge_key is distinct from new.zodiac_badge_key
    or old.zodiac_locked_at is distinct from new.zodiac_locked_at
    or old.birth_time_local is distinct from new.birth_time_local
    or old.birth_time_precision is distinct from new.birth_time_precision
    or old.birth_location_label is distinct from new.birth_location_label
    or old.birth_location_city is distinct from new.birth_location_city
    or old.birth_location_region is distinct from new.birth_location_region
    or old.birth_location_country is distinct from new.birth_location_country
    or old.birth_timezone is distinct from new.birth_timezone
    or old.birth_latitude is distinct from new.birth_latitude
    or old.birth_longitude is distinct from new.birth_longitude
    or old.birth_chart_json is distinct from new.birth_chart_json
  ) then
    raise exception 'Zodiac identity is locked. Contact support for corrections.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_locked_zodiac_user_edits on public.profiles;
create trigger prevent_locked_zodiac_user_edits
before update on public.profiles
for each row execute function public.prevent_locked_zodiac_user_edits();

create index if not exists idx_profiles_zodiac_sun_sign on public.profiles(zodiac_sun_sign);
create index if not exists idx_profiles_zodiac_cusp on public.profiles(zodiac_is_cusp) where zodiac_is_cusp = true;
create index if not exists idx_daily_zodiac_readings_lookup on public.daily_zodiac_readings(reading_date, zodiac_sign);
create unique index if not exists idx_daily_zodiac_readings_unique
  on public.daily_zodiac_readings(zodiac_sign, coalesce(cusp_label, ''), reading_date);
create index if not exists idx_zodiac_group_members_user on public.zodiac_group_members(user_id, left_at);
create index if not exists idx_zodiac_group_messages_thread on public.zodiac_group_messages(group_thread_id, created_at desc);
create index if not exists idx_zodiac_group_reports_status on public.zodiac_group_reports(status, created_at desc);
create index if not exists idx_zodiac_identity_corrections_user on public.zodiac_identity_corrections(user_id, created_at desc);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'zodiac_group_messages'
  ) then
    alter publication supabase_realtime add table public.zodiac_group_messages;
  end if;
end $$;
