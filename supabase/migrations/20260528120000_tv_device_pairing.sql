-- TV device-code pairing (YouTube/Netflix-style activation) for the Android TV app.
-- Distinct from public.tv_device_sessions (which stores long-lived registered
-- device tokens). This table backs the /api/tv/device/{start,status,approve}
-- flow: the TV shows a user_code, the signed-in member approves it on
-- /tv/activate, and the TV polls until it receives the handed-off session.
create table if not exists public.tv_device_pairing (
  id uuid primary key default gen_random_uuid(),
  device_code text not null unique,
  user_code text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'denied', 'expired')),
  user_id uuid references auth.users (id) on delete set null,
  session_reference text,
  access_token_hash text,
  device_label text,
  user_agent text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  approved_at timestamptz,
  denied_at timestamptz,
  last_polled_at timestamptz
);

create index if not exists idx_tv_device_pairing_user_code
  on public.tv_device_pairing (user_code);
create index if not exists idx_tv_device_pairing_device_code
  on public.tv_device_pairing (device_code);
create index if not exists idx_tv_device_pairing_expires_at
  on public.tv_device_pairing (expires_at);

-- Only the service role (used by the server-side /api/tv functions) reads or
-- writes this table. RLS enabled with NO policies blocks all anon/authenticated
-- client access; the service role bypasses RLS.
alter table public.tv_device_pairing enable row level security;
