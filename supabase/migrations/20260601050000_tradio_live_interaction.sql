-- In-show interaction for live Tradio sessions: chat, requests, polls.
create table if not exists public.tradio_live_chat (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tradio_live_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_tradio_live_chat_session on public.tradio_live_chat(session_id);

create table if not exists public.tradio_live_requests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tradio_live_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  requester_name text,
  song_title text not null,
  artist text,
  message text,
  status text not null default 'pending' check (status in ('pending','queued','played','declined')),
  created_at timestamptz not null default now()
);
create index if not exists idx_tradio_live_requests_session on public.tradio_live_requests(session_id);

create table if not exists public.tradio_live_polls (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tradio_live_sessions(id) on delete cascade,
  host_user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);
create index if not exists idx_tradio_live_polls_session on public.tradio_live_polls(session_id);

create table if not exists public.tradio_live_poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.tradio_live_polls(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  option_id text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, user_id)
);
create index if not exists idx_tradio_live_poll_votes_poll on public.tradio_live_poll_votes(poll_id);

alter table public.tradio_live_chat enable row level security;
alter table public.tradio_live_requests enable row level security;
alter table public.tradio_live_polls enable row level security;
alter table public.tradio_live_poll_votes enable row level security;

-- Helper: is the current user the host of this session?
create or replace function public.tradio_is_session_host(p_session_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.tradio_live_sessions s where s.id = p_session_id and s.host_user_id = auth.uid());
$$;

-- Public read on all (live interactions are public).
drop policy if exists "tradio_live_chat_select" on public.tradio_live_chat;
create policy "tradio_live_chat_select" on public.tradio_live_chat for select using (true);
drop policy if exists "tradio_live_chat_insert" on public.tradio_live_chat;
create policy "tradio_live_chat_insert" on public.tradio_live_chat for insert with check (auth.uid() = user_id);

drop policy if exists "tradio_live_requests_select" on public.tradio_live_requests;
create policy "tradio_live_requests_select" on public.tradio_live_requests for select using (true);
drop policy if exists "tradio_live_requests_insert" on public.tradio_live_requests;
create policy "tradio_live_requests_insert" on public.tradio_live_requests for insert with check (auth.uid() = user_id);
drop policy if exists "tradio_live_requests_host_update" on public.tradio_live_requests;
create policy "tradio_live_requests_host_update" on public.tradio_live_requests for update
  using (public.tradio_is_session_host(session_id)) with check (public.tradio_is_session_host(session_id));

drop policy if exists "tradio_live_polls_select" on public.tradio_live_polls;
create policy "tradio_live_polls_select" on public.tradio_live_polls for select using (true);
drop policy if exists "tradio_live_polls_host_insert" on public.tradio_live_polls;
create policy "tradio_live_polls_host_insert" on public.tradio_live_polls for insert
  with check (auth.uid() = host_user_id and public.tradio_is_session_host(session_id));
drop policy if exists "tradio_live_polls_host_update" on public.tradio_live_polls;
create policy "tradio_live_polls_host_update" on public.tradio_live_polls for update
  using (public.tradio_is_session_host(session_id)) with check (public.tradio_is_session_host(session_id));

drop policy if exists "tradio_live_poll_votes_select" on public.tradio_live_poll_votes;
create policy "tradio_live_poll_votes_select" on public.tradio_live_poll_votes for select using (true);
drop policy if exists "tradio_live_poll_votes_insert" on public.tradio_live_poll_votes;
create policy "tradio_live_poll_votes_insert" on public.tradio_live_poll_votes for insert with check (auth.uid() = user_id);
drop policy if exists "tradio_live_poll_votes_update" on public.tradio_live_poll_votes;
create policy "tradio_live_poll_votes_update" on public.tradio_live_poll_votes for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
