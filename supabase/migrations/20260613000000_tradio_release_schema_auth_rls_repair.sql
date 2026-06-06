-- Tradio Broadcast Studio Pass 13C release blocker repair.
-- Forward-only compatibility for fresh databases and databases that may have
-- applied one of the formerly duplicated 20260601040000 migrations.

-- Normalize the canonical creator ownership column without discarding legacy
-- user_id columns that may exist in an already-shared database.
alter table public.tradio_shows
  add column if not exists owner_user_id uuid;
alter table public.tradio_show_episodes
  add column if not exists owner_user_id uuid;
alter table public.tradio_show_blocks
  add column if not exists owner_user_id uuid;
alter table public.tradio_show_scripts
  add column if not exists owner_user_id uuid;
alter table public.tradio_voice_renders
  add column if not exists owner_user_id uuid;
alter table public.tradio_station_drops
  add column if not exists owner_user_id uuid;
alter table public.tradio_broadcast_slots
  add column if not exists owner_user_id uuid;
alter table public.tradio_ad_slots
  add column if not exists owner_user_id uuid;
alter table public.tradio_music_submissions
  add column if not exists owner_user_id uuid;
alter table public.tradio_episode_assemblies
  add column if not exists owner_user_id uuid;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'tradio_shows',
    'tradio_show_episodes',
    'tradio_show_blocks',
    'tradio_show_scripts',
    'tradio_voice_renders',
    'tradio_station_drops',
    'tradio_broadcast_slots',
    'tradio_ad_slots',
    'tradio_music_submissions',
    'tradio_episode_assemblies'
  ]
  loop
    if exists (
      select 1
      from information_schema.columns column_row
      where column_row.table_schema = 'public'
        and column_row.table_name = target_table
        and column_row.column_name = 'user_id'
    ) then
      execute format(
        'update public.%I set owner_user_id = user_id where owner_user_id is null',
        target_table
      );
    end if;
  end loop;
end
$$;

-- Derive ownership for schema variants that did not carry owner_user_id.
update public.tradio_broadcast_slots slot
set owner_user_id = show_row.owner_user_id
from public.tradio_shows show_row
where slot.owner_user_id is null
  and slot.show_id = show_row.id;

update public.tradio_ad_slots ad
set owner_user_id = episode.owner_user_id
from public.tradio_show_episodes episode
where ad.owner_user_id is null
  and ad.episode_id = episode.id;

-- Add the union of columns used by the two historic foundation definitions.
alter table public.tradio_shows
  add column if not exists slug text,
  add column if not exists mood_tags text[] default '{}',
  add column if not exists genre_tags text[] default '{}',
  add column if not exists audience_tags text[] default '{}',
  add column if not exists cover_art_url text,
  add column if not exists mood text,
  add column if not exists target_audience text,
  add column if not exists host_mode text,
  add column if not exists music_source_pref text,
  add column if not exists ad_preference text,
  add column if not exists schedule_intent text;

alter table public.tradio_show_episodes
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists cover_art text,
  add column if not exists episode_type text default 'normal',
  add column if not exists duration_target_seconds integer default 1800,
  add column if not exists duration_seconds integer default 0,
  add column if not exists visibility text default 'private',
  add column if not exists scheduled_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.tradio_show_blocks
  add column if not exists show_id uuid references public.tradio_shows(id) on delete cascade,
  add column if not exists rights_status text default 'unclear',
  add column if not exists clearance_status text default 'unclear';

alter table public.tradio_show_scripts
  add column if not exists block_id uuid references public.tradio_show_blocks(id) on delete set null,
  add column if not exists script_type text default 'voiceover',
  add column if not exists prompt_input text,
  add column if not exists revision_number integer default 1,
  add column if not exists status text default 'draft',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists generated_by_ai boolean not null default false,
  add column if not exists voice_id text;

alter table public.tradio_broadcast_slots
  add column if not exists recurrence_rule text,
  add column if not exists recurrence text,
  add column if not exists visibility text default 'private',
  add column if not exists updated_at timestamptz not null default now();

alter table public.tradio_station_drops
  add column if not exists show_id uuid references public.tradio_shows(id) on delete set null,
  add column if not exists script_text text,
  add column if not exists audio_url text,
  add column if not exists voice_provider text,
  add column if not exists duration_seconds integer default 0,
  add column if not exists status text default 'draft',
  add column if not exists clearance_status text default 'unclear',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

alter table public.tradio_ad_slots
  add column if not exists show_id uuid references public.tradio_shows(id) on delete set null,
  add column if not exists block_id uuid references public.tradio_show_blocks(id) on delete set null,
  add column if not exists title text,
  add column if not exists sponsor_name text,
  add column if not exists script_text text,
  add column if not exists media_url text,
  add column if not exists ad_provider text,
  add column if not exists slot_position text default 'mid-roll',
  add column if not exists updated_at timestamptz not null default now();

alter table public.tradio_show_analytics
  add column if not exists avg_listen_seconds numeric,
  add column if not exists segment_retention jsonb not null default '{}'::jsonb,
  add column if not exists segment_level_retention jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

-- Backfill child ownership from canonical parents.
update public.tradio_show_episodes episode
set owner_user_id = show_row.owner_user_id
from public.tradio_shows show_row
where episode.owner_user_id is null
  and episode.show_id = show_row.id;

update public.tradio_show_blocks block_row
set owner_user_id = episode.owner_user_id,
    show_id = coalesce(block_row.show_id, episode.show_id)
from public.tradio_show_episodes episode
where block_row.episode_id = episode.id
  and (block_row.owner_user_id is null or block_row.show_id is null);

update public.tradio_show_scripts script
set owner_user_id = episode.owner_user_id
from public.tradio_show_episodes episode
where script.owner_user_id is null
  and script.episode_id = episode.id;

update public.tradio_voice_renders render
set owner_user_id = episode.owner_user_id
from public.tradio_show_episodes episode
where render.owner_user_id is null
  and render.episode_id = episode.id;

update public.tradio_episode_assemblies assembly
set owner_user_id = episode.owner_user_id
from public.tradio_show_episodes episode
where assembly.owner_user_id is null
  and assembly.episode_id = episode.id;

-- Add canonical ownership foreign keys when a divergent schema created the
-- owner column without one. Existing canonical constraints keep their names.
do $$
declare
  target_table text;
  constraint_name text;
begin
  foreach target_table in array array[
    'tradio_shows',
    'tradio_show_episodes',
    'tradio_show_blocks',
    'tradio_show_scripts',
    'tradio_voice_renders',
    'tradio_station_drops',
    'tradio_broadcast_slots',
    'tradio_ad_slots',
    'tradio_music_submissions',
    'tradio_episode_assemblies'
  ]
  loop
    constraint_name := target_table || '_owner_user_id_fkey';
    if not exists (
      select 1
      from pg_constraint
      where conname = constraint_name
        and conrelid = format('public.%I', target_table)::regclass
    ) then
      execute format(
        'alter table public.%I add constraint %I foreign key (owner_user_id) references auth.users(id) on delete cascade not valid',
        target_table,
        constraint_name
      );
    end if;
  end loop;
end
$$;

-- Remove every permissive foundation policy before creating one canonical set.
drop policy if exists "Public read published shows" on public.tradio_shows;
drop policy if exists "Owner shows manage" on public.tradio_shows;
drop policy if exists "tradio_shows_select" on public.tradio_shows;
drop policy if exists "tradio_shows_insert" on public.tradio_shows;
drop policy if exists "tradio_shows_update" on public.tradio_shows;
drop policy if exists "tradio_shows_delete" on public.tradio_shows;

drop policy if exists "Public read published episodes" on public.tradio_show_episodes;
drop policy if exists "Owner episodes manage" on public.tradio_show_episodes;
drop policy if exists "tradio_show_episodes_select" on public.tradio_show_episodes;
drop policy if exists "tradio_show_episodes_insert" on public.tradio_show_episodes;
drop policy if exists "tradio_show_episodes_update" on public.tradio_show_episodes;
drop policy if exists "tradio_show_episodes_delete" on public.tradio_show_episodes;

drop policy if exists "Public read blocks of public published episodes" on public.tradio_show_blocks;
drop policy if exists "Owner blocks manage" on public.tradio_show_blocks;
drop policy if exists "tradio_show_blocks_select" on public.tradio_show_blocks;
drop policy if exists "tradio_show_blocks_insert" on public.tradio_show_blocks;
drop policy if exists "tradio_show_blocks_update" on public.tradio_show_blocks;
drop policy if exists "tradio_show_blocks_delete" on public.tradio_show_blocks;

drop policy if exists "Owner scripts manage" on public.tradio_show_scripts;
drop policy if exists "tradio_show_scripts_select" on public.tradio_show_scripts;
drop policy if exists "tradio_show_scripts_insert" on public.tradio_show_scripts;
drop policy if exists "tradio_show_scripts_update" on public.tradio_show_scripts;
drop policy if exists "tradio_show_scripts_delete" on public.tradio_show_scripts;

drop policy if exists "tradio_voice_renders_select" on public.tradio_voice_renders;
drop policy if exists "tradio_voice_renders_insert" on public.tradio_voice_renders;
drop policy if exists "tradio_voice_renders_update" on public.tradio_voice_renders;
drop policy if exists "tradio_voice_renders_delete" on public.tradio_voice_renders;

drop policy if exists "Public read active drops" on public.tradio_station_drops;
drop policy if exists "Owner drops manage" on public.tradio_station_drops;
drop policy if exists "tradio_station_drops_select" on public.tradio_station_drops;
drop policy if exists "tradio_station_drops_insert" on public.tradio_station_drops;
drop policy if exists "tradio_station_drops_delete" on public.tradio_station_drops;

drop policy if exists "Public read slots" on public.tradio_broadcast_slots;
drop policy if exists "Owner slots manage" on public.tradio_broadcast_slots;
drop policy if exists "tradio_broadcast_slots_select" on public.tradio_broadcast_slots;
drop policy if exists "tradio_broadcast_slots_insert" on public.tradio_broadcast_slots;
drop policy if exists "tradio_broadcast_slots_update" on public.tradio_broadcast_slots;
drop policy if exists "tradio_broadcast_slots_delete" on public.tradio_broadcast_slots;

drop policy if exists "Owner ads manage" on public.tradio_ad_slots;
drop policy if exists "tradio_ad_slots_select" on public.tradio_ad_slots;
drop policy if exists "tradio_ad_slots_insert" on public.tradio_ad_slots;
drop policy if exists "tradio_ad_slots_update" on public.tradio_ad_slots;

drop policy if exists "tradio_music_submissions_select" on public.tradio_music_submissions;
drop policy if exists "tradio_music_submissions_insert" on public.tradio_music_submissions;
drop policy if exists "tradio_music_submissions_update" on public.tradio_music_submissions;

drop policy if exists "Owner analytics read" on public.tradio_show_analytics;
drop policy if exists "tradio_show_analytics_select" on public.tradio_show_analytics;
drop policy if exists "tradio_show_analytics_insert" on public.tradio_show_analytics;
drop policy if exists "tradio_show_analytics_update" on public.tradio_show_analytics;

drop policy if exists "tradio_episode_assemblies_select" on public.tradio_episode_assemblies;
drop policy if exists "tradio_episode_assemblies_insert" on public.tradio_episode_assemblies;
drop policy if exists "tradio_episode_assemblies_update" on public.tradio_episode_assemblies;
drop policy if exists "tradio_episode_assemblies_delete" on public.tradio_episode_assemblies;

alter table public.tradio_shows enable row level security;
alter table public.tradio_show_episodes enable row level security;
alter table public.tradio_show_blocks enable row level security;
alter table public.tradio_show_scripts enable row level security;
alter table public.tradio_voice_renders enable row level security;
alter table public.tradio_station_drops enable row level security;
alter table public.tradio_broadcast_slots enable row level security;
alter table public.tradio_ad_slots enable row level security;
alter table public.tradio_music_submissions enable row level security;
alter table public.tradio_show_analytics enable row level security;
alter table public.tradio_episode_assemblies enable row level security;

create policy "tradio_shows_public_select"
  on public.tradio_shows for select
  to anon, authenticated
  using (status = 'published' and visibility = 'public');
create policy "tradio_shows_owner_admin_select"
  on public.tradio_shows for select
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_shows_owner_insert"
  on public.tradio_shows for insert
  to authenticated
  with check ((select auth.uid()) = owner_user_id);
create policy "tradio_shows_owner_admin_update"
  on public.tradio_shows for update
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())))
  with check ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_shows_owner_admin_delete"
  on public.tradio_shows for delete
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));

create policy "tradio_episodes_public_select"
  on public.tradio_show_episodes for select
  to anon, authenticated
  using (status = 'published' and visibility = 'public');
create policy "tradio_episodes_owner_admin_select"
  on public.tradio_show_episodes for select
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_episodes_owner_insert"
  on public.tradio_show_episodes for insert
  to authenticated
  with check ((select auth.uid()) = owner_user_id);
create policy "tradio_episodes_owner_admin_update"
  on public.tradio_show_episodes for update
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())))
  with check ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_episodes_owner_admin_delete"
  on public.tradio_show_episodes for delete
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));

create policy "tradio_blocks_owner_admin_select"
  on public.tradio_show_blocks for select
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_blocks_owner_insert"
  on public.tradio_show_blocks for insert
  to authenticated
  with check ((select auth.uid()) = owner_user_id);
create policy "tradio_blocks_owner_admin_update"
  on public.tradio_show_blocks for update
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())))
  with check ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_blocks_owner_admin_delete"
  on public.tradio_show_blocks for delete
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));

create policy "tradio_show_scripts_owner_admin_select"
  on public.tradio_show_scripts for select
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_show_scripts_owner_insert"
  on public.tradio_show_scripts for insert
  to authenticated
  with check ((select auth.uid()) = owner_user_id);
create policy "tradio_show_scripts_owner_admin_update"
  on public.tradio_show_scripts for update
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())))
  with check ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_show_scripts_owner_admin_delete"
  on public.tradio_show_scripts for delete
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));

create policy "tradio_voice_renders_owner_admin_select"
  on public.tradio_voice_renders for select
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_voice_renders_owner_insert"
  on public.tradio_voice_renders for insert
  to authenticated
  with check ((select auth.uid()) = owner_user_id);
create policy "tradio_voice_renders_owner_admin_update"
  on public.tradio_voice_renders for update
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())))
  with check ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_voice_renders_owner_admin_delete"
  on public.tradio_voice_renders for delete
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));

create policy "tradio_station_drops_owner_admin_select"
  on public.tradio_station_drops for select
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_station_drops_owner_insert"
  on public.tradio_station_drops for insert
  to authenticated
  with check ((select auth.uid()) = owner_user_id);
create policy "tradio_station_drops_owner_admin_update"
  on public.tradio_station_drops for update
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())))
  with check ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_station_drops_owner_admin_delete"
  on public.tradio_station_drops for delete
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));

create policy "tradio_slots_public_select"
  on public.tradio_broadcast_slots for select
  to anon, authenticated
  using (visibility = 'public' and status in ('scheduled', 'live', 'completed'));
create policy "tradio_slots_owner_admin_select"
  on public.tradio_broadcast_slots for select
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_slots_owner_insert"
  on public.tradio_broadcast_slots for insert
  to authenticated
  with check ((select auth.uid()) = owner_user_id);
create policy "tradio_slots_owner_admin_update"
  on public.tradio_broadcast_slots for update
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())))
  with check ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_slots_owner_admin_delete"
  on public.tradio_broadcast_slots for delete
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));

create policy "tradio_ad_slots_owner_admin_select"
  on public.tradio_ad_slots for select
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_ad_slots_owner_insert"
  on public.tradio_ad_slots for insert
  to authenticated
  with check ((select auth.uid()) = owner_user_id);
create policy "tradio_ad_slots_owner_admin_update"
  on public.tradio_ad_slots for update
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())))
  with check ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_ad_slots_owner_admin_delete"
  on public.tradio_ad_slots for delete
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));

create policy "tradio_music_submissions_owner_admin_select"
  on public.tradio_music_submissions for select
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_music_submissions_owner_insert"
  on public.tradio_music_submissions for insert
  to authenticated
  with check ((select auth.uid()) = owner_user_id);
create policy "tradio_music_submissions_owner_admin_update"
  on public.tradio_music_submissions for update
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())))
  with check ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_music_submissions_owner_admin_delete"
  on public.tradio_music_submissions for delete
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));

create policy "tradio_analytics_owner_admin_select"
  on public.tradio_show_analytics for select
  to authenticated
  using (
    public.is_admin((select auth.uid()))
    or exists (
      select 1
      from public.tradio_shows show_row
      where show_row.id = show_id
        and show_row.owner_user_id = (select auth.uid())
    )
  );
create policy "tradio_analytics_admin_insert"
  on public.tradio_show_analytics for insert
  to authenticated
  with check (public.is_admin((select auth.uid())));
create policy "tradio_analytics_admin_update"
  on public.tradio_show_analytics for update
  to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

create policy "tradio_assemblies_owner_admin_select"
  on public.tradio_episode_assemblies for select
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_assemblies_owner_insert"
  on public.tradio_episode_assemblies for insert
  to authenticated
  with check ((select auth.uid()) = owner_user_id);
create policy "tradio_assemblies_owner_admin_update"
  on public.tradio_episode_assemblies for update
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())))
  with check ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));
create policy "tradio_assemblies_owner_admin_delete"
  on public.tradio_episode_assemblies for delete
  to authenticated
  using ((select auth.uid()) = owner_user_id or public.is_admin((select auth.uid())));

-- Raw post-show asset rows contain prompts and source snapshots. Keep direct
-- reads owner/admin only; public applied copy is served by allowlisted server APIs.
drop policy if exists "Users can read own post-show assets" on public.tradio_post_show_assets;
create policy "Users can read own post-show assets"
  on public.tradio_post_show_assets for select
  to authenticated
  using ((select auth.uid()) = owner_user_id);

-- Replace user-editable metadata admin checks on archive tables.
drop policy if exists "Admins can view all recordings" on public.tradio_live_recordings;
create policy "Admins can view all recordings"
  on public.tradio_live_recordings for select
  to authenticated
  using (public.is_admin((select auth.uid())));

drop policy if exists "Segment visibility matches recording visibility" on public.tradio_live_recording_segments;
create policy "Segment visibility matches recording visibility"
  on public.tradio_live_recording_segments for select
  to authenticated
  using (
    public.is_admin((select auth.uid()))
    or exists (
      select 1
      from public.tradio_live_recordings recording
      where recording.id = recording_id
        and recording.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "Admins can view all clips" on public.tradio_live_highlight_clips;
create policy "Admins can view all clips"
  on public.tradio_live_highlight_clips for select
  to authenticated
  using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can view all jobs" on public.tradio_live_archive_jobs;
create policy "Admins can view all jobs"
  on public.tradio_live_archive_jobs for select
  to authenticated
  using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can view all consent records" on public.tradio_live_recording_consents;
create policy "Admins can view all consent records"
  on public.tradio_live_recording_consents for select
  to authenticated
  using (public.is_admin((select auth.uid())));

-- Public replay can only read the same explicit projection returned by the app.
drop policy if exists "Public clips visible to all" on public.tradio_live_highlight_clips;
create policy "Public clips visible to all"
  on public.tradio_live_highlight_clips for select
  to anon
  using (visibility = 'public' and clip_status = 'published');

revoke select on public.tradio_live_highlight_clips from anon;
grant select (
  id,
  channel_id,
  title,
  description,
  clip_status,
  visibility,
  start_time_seconds,
  end_time_seconds,
  duration_seconds,
  audio_url,
  cover_art_url,
  caption,
  mood_tags,
  genre_tags,
  audience_tags,
  published_at,
  created_at,
  updated_at
) on public.tradio_live_highlight_clips to anon;

create index if not exists idx_tradio_shows_public_list
  on public.tradio_shows(status, visibility, updated_at desc);
create index if not exists idx_tradio_episodes_public_list
  on public.tradio_show_episodes(status, visibility, published_at desc);
create index if not exists idx_tradio_slots_public_list
  on public.tradio_broadcast_slots(visibility, status, start_time);
