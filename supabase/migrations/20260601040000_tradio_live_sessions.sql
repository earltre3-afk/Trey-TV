-- Tradio live broadcast sessions (host mic -> listeners).
create table if not exists public.tradio_live_sessions (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references public.tradio_radio_shows(id) on delete set null,
  host_user_id uuid not null references auth.users(id) on delete cascade,
  room_name text not null,
  status text not null default 'live' check (status in ('live','ended')),
  title text,
  host_name text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  peak_listeners integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_tradio_live_sessions_status on public.tradio_live_sessions(status);
create index if not exists idx_tradio_live_sessions_host on public.tradio_live_sessions(host_user_id);

alter table public.tradio_live_sessions enable row level security;

-- Anyone (incl. listeners) can see what's live; hosts manage their own rows.
drop policy if exists "tradio_live_sessions_select_live" on public.tradio_live_sessions;
create policy "tradio_live_sessions_select_live"
  on public.tradio_live_sessions for select
  using (status = 'live' or auth.uid() = host_user_id);

drop policy if exists "tradio_live_sessions_insert_own" on public.tradio_live_sessions;
create policy "tradio_live_sessions_insert_own"
  on public.tradio_live_sessions for insert
  with check (auth.uid() = host_user_id);

drop policy if exists "tradio_live_sessions_update_own" on public.tradio_live_sessions;
create policy "tradio_live_sessions_update_own"
  on public.tradio_live_sessions for update
  using (auth.uid() = host_user_id) with check (auth.uid() = host_user_id);
