-- Tradio radio shows: persistence for the AI show builder.
create table if not exists public.tradio_radio_shows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Show',
  mood text,
  duration_min integer,
  target_audience text,
  host_tone text,
  music_source text,
  status text not null default 'draft'
    check (status in ('draft','template','scheduled','live','archived')),
  is_template boolean not null default false,
  ai_generated boolean not null default false,
  segments jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tradio_radio_shows_user on public.tradio_radio_shows(user_id);
create index if not exists idx_tradio_radio_shows_template on public.tradio_radio_shows(is_template) where is_template;

drop trigger if exists trg_tradio_radio_shows_updated_at on public.tradio_radio_shows;
create trigger trg_tradio_radio_shows_updated_at
  before update on public.tradio_radio_shows
  for each row execute function public.tradio_set_updated_at();

alter table public.tradio_radio_shows enable row level security;

drop policy if exists "tradio_radio_shows_select" on public.tradio_radio_shows;
create policy "tradio_radio_shows_select"
  on public.tradio_radio_shows for select
  using (auth.uid() = user_id or is_template = true);

drop policy if exists "tradio_radio_shows_insert" on public.tradio_radio_shows;
create policy "tradio_radio_shows_insert"
  on public.tradio_radio_shows for insert
  with check (auth.uid() = user_id);

drop policy if exists "tradio_radio_shows_update" on public.tradio_radio_shows;
create policy "tradio_radio_shows_update"
  on public.tradio_radio_shows for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tradio_radio_shows_delete" on public.tradio_radio_shows;
create policy "tradio_radio_shows_delete"
  on public.tradio_radio_shows for delete
  using (auth.uid() = user_id);
