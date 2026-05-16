-- FWD OAuth bridge: Trey TV acts as the account authority for fwd.treytv.com.
-- Secrets are stored only as hashes, and bridge tables are service-managed.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.fwd_oauth_clients (
  id uuid primary key default gen_random_uuid(),
  client_id text unique not null,
  client_secret_hash text not null,
  app_name text not null default 'FWD',
  allowed_redirect_uris text[] not null,
  allowed_scopes text[] not null default array['profile']::text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fwd_oauth_clients add column if not exists client_secret_hash text;
alter table public.fwd_oauth_clients add column if not exists app_name text not null default 'FWD';
alter table public.fwd_oauth_clients add column if not exists allowed_redirect_uris text[] not null default array[]::text[];
alter table public.fwd_oauth_clients add column if not exists allowed_scopes text[] not null default array['profile']::text[];
alter table public.fwd_oauth_clients add column if not exists is_active boolean not null default true;
alter table public.fwd_oauth_clients add column if not exists created_at timestamptz not null default now();
alter table public.fwd_oauth_clients add column if not exists updated_at timestamptz not null default now();

create table if not exists public.fwd_oauth_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  client_id text not null,
  redirect_uri text not null,
  trey_tv_user_id uuid not null references auth.users(id) on delete cascade,
  trey_tv_uid text,
  display_name text,
  avatar_url text,
  profile_url text,
  scope text not null default 'profile',
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.fwd_oauth_codes add column if not exists code text;
alter table public.fwd_oauth_codes add column if not exists client_id text;
alter table public.fwd_oauth_codes add column if not exists redirect_uri text;
alter table public.fwd_oauth_codes add column if not exists trey_tv_user_id uuid references auth.users(id) on delete cascade;
alter table public.fwd_oauth_codes add column if not exists trey_tv_uid text;
alter table public.fwd_oauth_codes add column if not exists display_name text;
alter table public.fwd_oauth_codes add column if not exists avatar_url text;
alter table public.fwd_oauth_codes add column if not exists profile_url text;
alter table public.fwd_oauth_codes add column if not exists scope text not null default 'profile';
alter table public.fwd_oauth_codes add column if not exists expires_at timestamptz;
alter table public.fwd_oauth_codes add column if not exists used_at timestamptz;
alter table public.fwd_oauth_codes add column if not exists created_at timestamptz not null default now();

create table if not exists public.fwd_oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text unique not null,
  client_id text not null,
  trey_tv_user_id uuid not null references auth.users(id) on delete cascade,
  trey_tv_uid text,
  scope text not null default 'profile',
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.fwd_oauth_tokens add column if not exists token_hash text;
alter table public.fwd_oauth_tokens add column if not exists client_id text;
alter table public.fwd_oauth_tokens add column if not exists trey_tv_user_id uuid references auth.users(id) on delete cascade;
alter table public.fwd_oauth_tokens add column if not exists trey_tv_uid text;
alter table public.fwd_oauth_tokens add column if not exists scope text not null default 'profile';
alter table public.fwd_oauth_tokens add column if not exists expires_at timestamptz;
alter table public.fwd_oauth_tokens add column if not exists revoked_at timestamptz;
alter table public.fwd_oauth_tokens add column if not exists created_at timestamptz not null default now();

create index if not exists fwd_oauth_clients_client_id_active_idx
  on public.fwd_oauth_clients (client_id)
  where is_active = true;

create index if not exists fwd_oauth_codes_code_idx
  on public.fwd_oauth_codes (code);

create index if not exists fwd_oauth_codes_unexpired_unused_idx
  on public.fwd_oauth_codes (client_id, expires_at)
  where used_at is null;

create index if not exists fwd_oauth_codes_trey_tv_uid_idx
  on public.fwd_oauth_codes (trey_tv_uid, created_at desc);

create index if not exists fwd_oauth_tokens_hash_idx
  on public.fwd_oauth_tokens (token_hash);

create index if not exists fwd_oauth_tokens_client_uid_idx
  on public.fwd_oauth_tokens (client_id, trey_tv_uid, created_at desc);

create or replace function public.set_fwd_oauth_clients_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_fwd_oauth_clients_updated_at on public.fwd_oauth_clients;
create trigger set_fwd_oauth_clients_updated_at
before update on public.fwd_oauth_clients
for each row execute function public.set_fwd_oauth_clients_updated_at();

alter table public.fwd_oauth_clients enable row level security;
alter table public.fwd_oauth_codes enable row level security;
alter table public.fwd_oauth_tokens enable row level security;

revoke all on table public.fwd_oauth_clients from anon, authenticated;
revoke all on table public.fwd_oauth_codes from anon, authenticated;
revoke all on table public.fwd_oauth_tokens from anon, authenticated;

comment on table public.fwd_oauth_clients is
  'Server-managed OAuth clients allowed to use Trey TV as an account authority for FWD.';
comment on table public.fwd_oauth_codes is
  'Short-lived one-time authorization codes issued by Trey TV for FWD OAuth login.';
comment on table public.fwd_oauth_tokens is
  'Optional hashed FWD access-token ledger. Current runtime uses signed short-lived bearer tokens.';
