create table if not exists public.music_review_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  user_email text,
  song_title text not null,
  artist_name text not null,
  genre text,
  mood text,
  explicit boolean default false,
  note_to_reviewer text,
  audio_storage_path text,
  cover_art_storage_path text,
  audio_duration numeric,
  file_size bigint,
  status text not null default 'pending',
  queue_position integer,
  priority_tier text,
  priority_paid boolean default false,
  payment_reference text,
  ai_precheck_score numeric,
  ai_precheck_json jsonb,
  admin_notes text,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  reviewed_at timestamptz
);

create table if not exists public.music_review_queue (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.music_review_submissions(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.music_review_scores (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.music_review_submissions(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  song_title text,
  artist_name text,
  overall_score numeric not null,
  vocals_score numeric not null,
  lyrics_score numeric not null,
  mix_score numeric not null,
  originality_score numeric not null,
  hit_potential_score numeric not null,
  replay_value_score numeric not null,
  marketability_score numeric not null,
  written_summary text,
  strengths_json jsonb,
  improvements_json jsonb,
  public_visible boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.open_mic_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  user_name text,
  song_title text not null,
  artist_name text,
  audio_storage_path text,
  cover_art_storage_path text,
  audio_duration numeric,
  queue_position integer,
  status text not null default 'queued',
  submitted_at timestamptz not null default now(),
  started_at timestamptz,
  ended_at timestamptz,
  storage_deleted boolean default false,
  file_deleted_at timestamptz,
  cleanup_failed boolean default false,
  moderation_status text,
  updated_at timestamptz not null default now()
);

create table if not exists public.music_review_comments (
  id uuid primary key default gen_random_uuid(),
  room_type text not null,
  submission_id uuid references public.music_review_submissions(id) on delete cascade,
  open_mic_item_id uuid references public.open_mic_queue(id) on delete cascade,
  user_id uuid references auth.users(id),
  user_name text,
  body text not null,
  is_ai_labeled boolean default false,
  is_admin boolean default false,
  is_hidden boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.music_review_reactions (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.music_review_submissions(id) on delete cascade,
  open_mic_item_id uuid references public.open_mic_queue(id) on delete cascade,
  user_id uuid references auth.users(id),
  reaction_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.music_review_payments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.music_review_submissions(id) on delete cascade,
  user_id uuid references auth.users(id),
  tier_id text,
  amount numeric,
  status text not null default 'pending',
  confirmed_by_admin boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.open_mic_play_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  open_mic_queue_id uuid references public.open_mic_queue(id) on delete set null,
  song_title text,
  artist_name text,
  submitted_at timestamptz,
  played_at timestamptz,
  ended_at timestamptz,
  audio_duration numeric,
  storage_deleted boolean,
  file_deleted_at timestamptz,
  moderation_status text,
  created_at timestamptz not null default now(),
  unique (open_mic_queue_id)
);

create table if not exists public.open_mic_daily_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  date date not null,
  submission_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, date)
);

create table if not exists public.music_review_email_logs (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.music_review_submissions(id) on delete cascade,
  user_id uuid references auth.users(id),
  sent_at timestamptz not null default now(),
  status text not null,
  error_message text
);

create table if not exists public.music_review_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
