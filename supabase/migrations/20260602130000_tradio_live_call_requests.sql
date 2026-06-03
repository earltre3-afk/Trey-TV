-- Call-in (raise hand) requests for live Tradio sessions. A caller is a listener
-- the host promotes to publish audio at runtime via LiveKit.
create table if not exists public.tradio_live_call_requests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tradio_live_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  caller_identity text not null,
  caller_name text,
  line_note text,
  status text not null default 'pending' check (status in ('pending','on_air','ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_tradio_live_call_requests_session on public.tradio_live_call_requests(session_id);

alter table public.tradio_live_call_requests enable row level security;

-- Public read so listeners can see who's on air.
drop policy if exists "tradio_live_call_requests_select" on public.tradio_live_call_requests;
create policy "tradio_live_call_requests_select" on public.tradio_live_call_requests for select using (true);

-- Any signed-in listener may raise their hand for themselves.
drop policy if exists "tradio_live_call_requests_insert" on public.tradio_live_call_requests;
create policy "tradio_live_call_requests_insert" on public.tradio_live_call_requests for insert with check (auth.uid() = user_id);

-- Only the session host may take/disconnect/decline a caller.
drop policy if exists "tradio_live_call_requests_host_update" on public.tradio_live_call_requests;
create policy "tradio_live_call_requests_host_update" on public.tradio_live_call_requests for update
  using (public.tradio_is_session_host(session_id)) with check (public.tradio_is_session_host(session_id));

-- Enable realtime (idempotent).
do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tradio_live_call_requests'
  ) then
    alter publication supabase_realtime add table public.tradio_live_call_requests;
  end if;
end $$;
