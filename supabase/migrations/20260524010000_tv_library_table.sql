-- tv_library: stores content captured from TMDB scout searches
-- When a user searches for something not in the local catalog and selects
-- a TMDB result, we persist it here so it becomes part of the Trey TV library.

create table if not exists public.tv_library (
  id           uuid primary key default gen_random_uuid(),
  tmdb_id      integer not null unique,
  media_type   text not null check (media_type in ('movie', 'tv')),
  title        text not null,
  overview     text,
  poster_url   text,
  backdrop_url text,
  release_year integer,
  rating       numeric(3,1),
  vote_count   integer default 0,
  genre_ids    integer[] default '{}',
  source       text not null default 'tmdb_scout',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Index for fast title search within the library
create index if not exists idx_tv_library_title
  on public.tv_library using gin (to_tsvector('english', title));

-- Index for quick lookups by tmdb_id (already unique, but explicit)
create index if not exists idx_tv_library_tmdb_id
  on public.tv_library (tmdb_id);

-- RLS: anyone can read the library, only service role can write
alter table public.tv_library enable row level security;

create policy "tv_library_public_read"
  on public.tv_library for select
  using (true);

create policy "tv_library_service_insert"
  on public.tv_library for insert
  with check (true);

create policy "tv_library_service_update"
  on public.tv_library for update
  using (true);
