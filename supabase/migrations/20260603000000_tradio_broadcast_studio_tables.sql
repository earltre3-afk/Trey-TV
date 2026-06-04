-- ============================================================
-- TRADIO BROADCAST STUDIO SCHEMA =============================
-- ============================================================
-- Migration to support production-grade Broadcast Studio features.
-- Creates tables for shows, episodes, timeline blocks, scripts, 
-- voice renders, ad slots, drops, submissions, schedule slots, and analytics.

-- 1) tradio_shows
create table if not exists public.tradio_shows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid,
  public_profile_uid text,
  trey_tv_uid text,
  title text not null,
  description text,
  show_type text not null,
  mood text,
  target_audience text,
  host_mode text,
  music_source_pref text,
  ad_preference text,
  visibility text not null default 'public' check (visibility in ('public', 'private', 'unlisted')),
  schedule_intent text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tradio_shows_user on public.tradio_shows(user_id);
create index if not exists idx_tradio_shows_status on public.tradio_shows(status);

drop trigger if exists trg_tradio_shows_updated_at on public.tradio_shows;
create trigger trg_tradio_shows_updated_at
  before update on public.tradio_shows
  for each row execute function public.tradio_set_updated_at();

alter table public.tradio_shows enable row level security;

create policy "tradio_shows_select"
  on public.tradio_shows for select
  using (status = 'published' or auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "tradio_shows_insert"
  on public.tradio_shows for insert
  with check (auth.uid() = user_id);

create policy "tradio_shows_update"
  on public.tradio_shows for update
  using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "tradio_shows_delete"
  on public.tradio_shows for delete
  using (auth.uid() = user_id or public.is_admin(auth.uid()));


-- 2) tradio_show_episodes
create table if not exists public.tradio_show_episodes (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.tradio_shows(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  cover_art text,
  duration_seconds integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'needs_review', 'scheduled', 'published', 'hidden', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tradio_show_episodes_show on public.tradio_show_episodes(show_id);
create index if not exists idx_tradio_show_episodes_user on public.tradio_show_episodes(user_id);

drop trigger if exists trg_tradio_show_episodes_updated_at on public.tradio_show_episodes;
create trigger trg_tradio_show_episodes_updated_at
  before update on public.tradio_show_episodes
  for each row execute function public.tradio_set_updated_at();

alter table public.tradio_show_episodes enable row level security;

create policy "tradio_show_episodes_select"
  on public.tradio_show_episodes for select
  using (status = 'published' or auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "tradio_show_episodes_insert"
  on public.tradio_show_episodes for insert
  with check (auth.uid() = user_id);

create policy "tradio_show_episodes_update"
  on public.tradio_show_episodes for update
  using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "tradio_show_episodes_delete"
  on public.tradio_show_episodes for delete
  using (auth.uid() = user_id or public.is_admin(auth.uid()));


-- 3) tradio_show_blocks
create table if not exists public.tradio_show_blocks (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.tradio_show_episodes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  block_type text not null check (block_type in ('intro', 'station_drop', 'voiceover', 'song', 'ad', 'interview', 'producer_spotlight', 'artist_spotlight', 'submission_block', 'silence', 'transition', 'outro')),
  title text not null,
  description text,
  script_text text,
  asset_id uuid,
  media_url text,
  start_time_seconds integer not null default 0,
  duration_seconds integer not null default 0,
  sort_order integer not null default 0,
  volume_level numeric(3,2) not null default 1.00,
  fade_in_seconds numeric(3,2) not null default 0.00,
  fade_out_seconds numeric(3,2) not null default 0.00,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  clearance_status text not null default 'unclear' check (clearance_status in ('unclear', 'cleared', 'review_needed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tradio_show_blocks_episode on public.tradio_show_blocks(episode_id);
create index if not exists idx_tradio_show_blocks_sort on public.tradio_show_blocks(episode_id, sort_order);

drop trigger if exists trg_tradio_show_blocks_updated_at on public.tradio_show_blocks;
create trigger trg_tradio_show_blocks_updated_at
  before update on public.tradio_show_blocks
  for each row execute function public.tradio_set_updated_at();

alter table public.tradio_show_blocks enable row level security;

create policy "tradio_show_blocks_select"
  on public.tradio_show_blocks for select
  using (
    auth.uid() = user_id 
    or public.is_admin(auth.uid()) 
    or exists (select 1 from public.tradio_show_episodes e where e.id = episode_id and e.status = 'published')
  );

create policy "tradio_show_blocks_insert"
  on public.tradio_show_blocks for insert
  with check (auth.uid() = user_id);

create policy "tradio_show_blocks_update"
  on public.tradio_show_blocks for update
  using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "tradio_show_blocks_delete"
  on public.tradio_show_blocks for delete
  using (auth.uid() = user_id or public.is_admin(auth.uid()));


-- 4) tradio_show_scripts
create table if not exists public.tradio_show_scripts (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.tradio_show_episodes(id) on delete cascade,
  block_id uuid references public.tradio_show_blocks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  script_text text not null,
  generated_by_ai boolean not null default false,
  voice_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tradio_show_scripts enable row level security;

create policy "tradio_show_scripts_select"
  on public.tradio_show_scripts for select
  using (
    auth.uid() = user_id 
    or public.is_admin(auth.uid()) 
    or exists (select 1 from public.tradio_show_episodes e where e.id = episode_id and e.status = 'published')
  );

create policy "tradio_show_scripts_insert"
  on public.tradio_show_scripts for insert
  with check (auth.uid() = user_id);

create policy "tradio_show_scripts_update"
  on public.tradio_show_scripts for update
  using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "tradio_show_scripts_delete"
  on public.tradio_show_scripts for delete
  using (auth.uid() = user_id or public.is_admin(auth.uid()));


-- 5) tradio_voice_renders
create table if not exists public.tradio_voice_renders (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.tradio_show_episodes(id) on delete cascade,
  block_id uuid references public.tradio_show_blocks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  voice_id text not null,
  audio_url text not null,
  duration_seconds integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.tradio_voice_renders enable row level security;

create policy "tradio_voice_renders_select"
  on public.tradio_voice_renders for select
  using (
    auth.uid() = user_id 
    or public.is_admin(auth.uid()) 
    or exists (select 1 from public.tradio_show_episodes e where e.id = episode_id and e.status = 'published')
  );

create policy "tradio_voice_renders_insert"
  on public.tradio_voice_renders for insert
  with check (auth.uid() = user_id);

create policy "tradio_voice_renders_delete"
  on public.tradio_voice_renders for delete
  using (auth.uid() = user_id or public.is_admin(auth.uid()));


-- 6) tradio_station_drops
create table if not exists public.tradio_station_drops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  audio_url text not null,
  duration_seconds integer not null default 0,
  clearance_status text not null default 'cleared' check (clearance_status in ('unclear', 'cleared', 'review_needed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.tradio_station_drops enable row level security;

create policy "tradio_station_drops_select"
  on public.tradio_station_drops for select
  using (true); -- Station drops can be listable publicly

create policy "tradio_station_drops_insert"
  on public.tradio_station_drops for insert
  with check (auth.uid() = user_id);

create policy "tradio_station_drops_delete"
  on public.tradio_station_drops for delete
  using (auth.uid() = user_id or public.is_admin(auth.uid()));


-- 7) tradio_broadcast_slots
create table if not exists public.tradio_broadcast_slots (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.tradio_shows(id) on delete cascade,
  episode_id uuid references public.tradio_show_episodes(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  timezone text not null default 'UTC',
  recurrence text,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.tradio_broadcast_slots enable row level security;

create policy "tradio_broadcast_slots_select"
  on public.tradio_broadcast_slots for select
  using (true); -- Everyone can view the schedule slots

create policy "tradio_broadcast_slots_insert"
  on public.tradio_broadcast_slots for insert
  with check (exists (select 1 from public.tradio_shows s where s.id = show_id and s.user_id = auth.uid()) or public.is_admin(auth.uid()));

create policy "tradio_broadcast_slots_update"
  on public.tradio_broadcast_slots for update
  using (exists (select 1 from public.tradio_shows s where s.id = show_id and s.user_id = auth.uid()) or public.is_admin(auth.uid()));

create policy "tradio_broadcast_slots_delete"
  on public.tradio_broadcast_slots for delete
  using (exists (select 1 from public.tradio_shows s where s.id = show_id and s.user_id = auth.uid()) or public.is_admin(auth.uid()));


-- 8) tradio_ad_slots
create table if not exists public.tradio_ad_slots (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.tradio_show_episodes(id) on delete cascade,
  block_id uuid references public.tradio_show_blocks(id) on delete cascade,
  ad_provider text,
  duration_seconds integer not null default 30,
  status text not null default 'pending' check (status in ('pending', 'filled', 'empty')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.tradio_ad_slots enable row level security;

create policy "tradio_ad_slots_select"
  on public.tradio_ad_slots for select
  using (true);

create policy "tradio_ad_slots_insert"
  on public.tradio_ad_slots for insert
  with check (exists (select 1 from public.tradio_show_episodes e where e.id = episode_id and e.user_id = auth.uid()) or public.is_admin(auth.uid()));

create policy "tradio_ad_slots_update"
  on public.tradio_ad_slots for update
  using (exists (select 1 from public.tradio_show_episodes e where e.id = episode_id and e.user_id = auth.uid()) or public.is_admin(auth.uid()));


-- 9) tradio_music_submissions
create table if not exists public.tradio_music_submissions (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.tradio_show_episodes(id) on delete cascade,
  block_id uuid references public.tradio_show_blocks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  artist text not null,
  audio_url text not null,
  rights_status text not null default 'unclear' check (rights_status in ('tradio_native', 'creator_owned', 'approved_submission', 'licensed_catalog', 'unclear')),
  clearance_status text not null default 'unclear' check (clearance_status in ('unclear', 'cleared', 'review_needed')),
  created_at timestamptz not null default now()
);

alter table public.tradio_music_submissions enable row level security;

create policy "tradio_music_submissions_select"
  on public.tradio_music_submissions for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()) or exists (select 1 from public.tradio_show_episodes e where e.id = episode_id and e.status = 'published'));

create policy "tradio_music_submissions_insert"
  on public.tradio_music_submissions for insert
  with check (auth.uid() = user_id);

create policy "tradio_music_submissions_update"
  on public.tradio_music_submissions for update
  using (auth.uid() = user_id or public.is_admin(auth.uid()));


-- 10) tradio_show_analytics
create table if not exists public.tradio_show_analytics (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.tradio_shows(id) on delete cascade,
  episode_id uuid references public.tradio_show_episodes(id) on delete cascade,
  listens integer not null default 0,
  unique_listeners integer not null default 0,
  completion_rate numeric(5,2) not null default 0.00,
  skips integer not null default 0,
  saves integer not null default 0,
  replays integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  segment_level_retention jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.tradio_show_analytics enable row level security;

create policy "tradio_show_analytics_select"
  on public.tradio_show_analytics for select
  using (exists (select 1 from public.tradio_shows s where s.id = show_id and s.user_id = auth.uid()) or public.is_admin(auth.uid()));

create policy "tradio_show_analytics_insert"
  on public.tradio_show_analytics for insert
  with check (public.is_admin(auth.uid()));

create policy "tradio_show_analytics_update"
  on public.tradio_show_analytics for update
  using (public.is_admin(auth.uid()));
