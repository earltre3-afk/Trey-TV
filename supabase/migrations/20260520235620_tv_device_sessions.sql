create table if not exists public.tv_device_sessions (
  id uuid primary key default gen_random_uuid(),
  device_code text not null unique,
  user_code text not null unique,
  status text not null default 'pending' check (status in ('pending', 'approved', 'expired', 'denied')),
  user_id uuid references auth.users(id) on delete set null,
  access_token_hash text,
  session_reference text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  approved_at timestamptz,
  denied_at timestamptz,
  device_label text,
  user_agent text,
  last_polled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_tv_device_sessions_user_code_active
  on public.tv_device_sessions(user_code, expires_at)
  where status = 'pending';

create index if not exists idx_tv_device_sessions_device_code
  on public.tv_device_sessions(device_code);

create index if not exists idx_tv_device_sessions_user_recent
  on public.tv_device_sessions(user_id, created_at desc);

alter table public.tv_device_sessions enable row level security;

drop policy if exists "tv_device_sessions_admin_read" on public.tv_device_sessions;
create policy "tv_device_sessions_admin_read"
on public.tv_device_sessions
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "tv_device_sessions_admin_update" on public.tv_device_sessions;
create policy "tv_device_sessions_admin_update"
on public.tv_device_sessions
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

revoke all on public.tv_device_sessions from anon, authenticated;
