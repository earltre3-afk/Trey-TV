-- Interactive Stories: playthrough persistence and share endings
-- Additive only — does not touch existing game tables.
-- Apply with: npx supabase db push   (or supabase migration up)

-- ─────────────────────────────────────────────────────────────────────────────
-- user_story_playthroughs
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.user_story_playthroughs (
  id                  text primary key,
  user_uid            uuid not null references auth.users(id) on delete cascade,
  story_id            text not null,
  story_title         text not null default '',
  playthrough_name    text not null default 'New Playthrough',
  current_scene_id    text,
  current_chapter     integer not null default 1,
  current_choice_node text,
  progress_percent    integer not null default 0,
  branch_title        text not null default '',
  selected_branch_path text[] not null default '{}',
  status              text not null default 'active' check (status in ('active','completed','archived')),
  relationship_stats  jsonb not null default '{}',
  story_status_stats  jsonb not null default '{}',
  unlocked_scenes     text[] not null default '{}',
  unlocked_endings    text[] not null default '{}',
  ending_id           text,
  ending_title        text,
  ending_summary      text,
  share_enabled       boolean not null default false,
  public_share_slug   text unique,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  completed_at        timestamptz
);

create index if not exists user_story_playthroughs_user_uid_idx
  on public.user_story_playthroughs (user_uid);

create index if not exists user_story_playthroughs_story_idx
  on public.user_story_playthroughs (story_id);

create index if not exists user_story_playthroughs_share_slug_idx
  on public.user_story_playthroughs (public_share_slug)
  where public_share_slug is not null;

-- RLS
alter table public.user_story_playthroughs enable row level security;

create policy "Users can read their own playthroughs"
  on public.user_story_playthroughs for select
  using (auth.uid() = user_uid);

create policy "Users can insert their own playthroughs"
  on public.user_story_playthroughs for insert
  with check (auth.uid() = user_uid);

create policy "Users can update their own playthroughs"
  on public.user_story_playthroughs for update
  using (auth.uid() = user_uid);

create policy "Users can delete their own playthroughs"
  on public.user_story_playthroughs for delete
  using (auth.uid() = user_uid);

-- Public shared playthroughs are readable by anyone
create policy "Public playthroughs are readable by anyone"
  on public.user_story_playthroughs for select
  using (share_enabled = true);

-- ─────────────────────────────────────────────────────────────────────────────
-- user_story_choice_events
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.user_story_choice_events (
  id              text primary key,
  playthrough_id  text not null references public.user_story_playthroughs(id) on delete cascade,
  user_uid        uuid not null references auth.users(id) on delete cascade,
  scene_id        text,
  choice_id       text,
  choice_text     text not null default '',
  chapter_number  integer not null default 1,
  stat_changes    jsonb not null default '{}',
  tone_label      text,
  created_at      timestamptz not null default now()
);

create index if not exists user_story_choice_events_playthrough_idx
  on public.user_story_choice_events (playthrough_id);

create index if not exists user_story_choice_events_user_uid_idx
  on public.user_story_choice_events (user_uid);

alter table public.user_story_choice_events enable row level security;

create policy "Users can read their own choice events"
  on public.user_story_choice_events for select
  using (auth.uid() = user_uid);

create policy "Users can insert their own choice events"
  on public.user_story_choice_events for insert
  with check (auth.uid() = user_uid);

-- ─────────────────────────────────────────────────────────────────────────────
-- shared_story_endings  (public share cards)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.shared_story_endings (
  id                  text primary key,
  playthrough_id      text references public.user_story_playthroughs(id) on delete set null,
  user_uid            uuid references auth.users(id) on delete set null,
  story_id            text not null,
  ending_id           text,
  ending_title        text,
  ending_summary      text,
  ending_card_image   text,
  share_slug          text unique not null,
  is_public           boolean not null default true,
  view_count          integer not null default 0,
  created_at          timestamptz not null default now()
);

create index if not exists shared_story_endings_slug_idx
  on public.shared_story_endings (share_slug);

create index if not exists shared_story_endings_user_uid_idx
  on public.shared_story_endings (user_uid);

alter table public.shared_story_endings enable row level security;

-- Anyone can read public shared endings
create policy "Public shared endings are readable by anyone"
  on public.shared_story_endings for select
  using (is_public = true);

create policy "Users can insert their own shared endings"
  on public.shared_story_endings for insert
  with check (auth.uid() = user_uid);

create policy "Users can update their own shared endings"
  on public.shared_story_endings for update
  using (auth.uid() = user_uid);

create policy "Users can delete their own shared endings"
  on public.shared_story_endings for delete
  using (auth.uid() = user_uid);
