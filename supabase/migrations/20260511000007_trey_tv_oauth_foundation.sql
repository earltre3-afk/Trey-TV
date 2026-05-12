-- ============================================================
-- TREY TV OAUTH / DEVELOPER PLATFORM FOUNDATION ==============
-- ============================================================
-- Staged OAuth 2.0 / OpenID Connect-style foundation for
-- "Sign in with Trey TV". Secrets, codes, tokens, and API keys
-- are stored as hashes only.

create extension if not exists pgcrypto;

create table if not exists public.developer_apps (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  app_name text not null,
  app_description text,
  website_url text,
  privacy_policy_url text,
  terms_url text,
  client_id text unique not null,
  client_secret_hash text not null,
  redirect_uris jsonb not null default '[]'::jsonb,
  allowed_scopes jsonb not null default '[]'::jsonb,
  app_type text not null default 'web_app' check (app_type in ('web_app','mobile_app','creator_tool','internal_tool','other')),
  status text not null default 'draft' check (status in ('draft','active','suspended','revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists idx_developer_apps_owner on public.developer_apps(owner_user_id, created_at desc);
create index if not exists idx_developer_apps_client_id on public.developer_apps(client_id);
alter table public.developer_apps enable row level security;

drop policy if exists "developer_apps_owner_read" on public.developer_apps;
create policy "developer_apps_owner_read" on public.developer_apps
  for select using (auth.uid() = owner_user_id or public.is_admin(auth.uid()));

drop policy if exists "developer_apps_owner_insert" on public.developer_apps;
create policy "developer_apps_owner_insert" on public.developer_apps
  for insert with check (auth.uid() = owner_user_id or public.is_admin(auth.uid()));

drop policy if exists "developer_apps_owner_update" on public.developer_apps;
create policy "developer_apps_owner_update" on public.developer_apps
  for update using (auth.uid() = owner_user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = owner_user_id or public.is_admin(auth.uid()));

create table if not exists public.developer_app_tokens (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.developer_apps(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  access_token_hash text not null,
  refresh_token_hash text,
  scopes jsonb not null default '[]'::jsonb,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_developer_app_tokens_user on public.developer_app_tokens(user_id, created_at desc);
create index if not exists idx_developer_app_tokens_app on public.developer_app_tokens(app_id, created_at desc);
create index if not exists idx_developer_app_tokens_access_hash on public.developer_app_tokens(access_token_hash);
alter table public.developer_app_tokens enable row level security;

drop policy if exists "developer_tokens_user_or_owner_read" on public.developer_app_tokens;
create policy "developer_tokens_user_or_owner_read" on public.developer_app_tokens
  for select using (
    auth.uid() = user_id
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.developer_apps a
      where a.id = app_id and a.owner_user_id = auth.uid()
    )
  );

drop policy if exists "developer_tokens_user_revoke" on public.developer_app_tokens;
create policy "developer_tokens_user_revoke" on public.developer_app_tokens
  for update using (
    auth.uid() = user_id
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.developer_apps a
      where a.id = app_id and a.owner_user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.developer_apps a
      where a.id = app_id and a.owner_user_id = auth.uid()
    )
  );

create table if not exists public.oauth_authorization_codes (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.developer_apps(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text unique not null,
  redirect_uri text not null,
  scopes jsonb not null default '[]'::jsonb,
  code_challenge text,
  code_challenge_method text,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_oauth_codes_app_user on public.oauth_authorization_codes(app_id, user_id, created_at desc);
create index if not exists idx_oauth_codes_hash on public.oauth_authorization_codes(code_hash);
alter table public.oauth_authorization_codes enable row level security;

drop policy if exists "oauth_codes_admin_or_owner_read" on public.oauth_authorization_codes;
create policy "oauth_codes_admin_or_owner_read" on public.oauth_authorization_codes
  for select using (
    public.is_admin(auth.uid())
    or auth.uid() = user_id
    or exists (
      select 1 from public.developer_apps a
      where a.id = app_id and a.owner_user_id = auth.uid()
    )
  );

create table if not exists public.oauth_consents (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.developer_apps(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  scopes jsonb not null default '[]'::jsonb,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (app_id, user_id)
);

create index if not exists idx_oauth_consents_user on public.oauth_consents(user_id, granted_at desc);
alter table public.oauth_consents enable row level security;

drop policy if exists "oauth_consents_user_or_owner_read" on public.oauth_consents;
create policy "oauth_consents_user_or_owner_read" on public.oauth_consents
  for select using (
    auth.uid() = user_id
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.developer_apps a
      where a.id = app_id and a.owner_user_id = auth.uid()
    )
  );

drop policy if exists "oauth_consents_user_revoke" on public.oauth_consents;
create policy "oauth_consents_user_revoke" on public.oauth_consents
  for update using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  app_id uuid references public.developer_apps(id) on delete set null,
  key_hash text unique not null,
  key_prefix text not null,
  label text not null,
  scopes jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active','revoked','suspended')),
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists idx_api_keys_owner on public.api_keys(owner_user_id, created_at desc);
alter table public.api_keys enable row level security;

drop policy if exists "api_keys_owner_read" on public.api_keys;
create policy "api_keys_owner_read" on public.api_keys
  for select using (auth.uid() = owner_user_id or public.is_admin(auth.uid()));

drop policy if exists "api_keys_owner_insert" on public.api_keys;
create policy "api_keys_owner_insert" on public.api_keys
  for insert with check (auth.uid() = owner_user_id or public.is_admin(auth.uid()));

drop policy if exists "api_keys_owner_update" on public.api_keys;
create policy "api_keys_owner_update" on public.api_keys
  for update using (auth.uid() = owner_user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = owner_user_id or public.is_admin(auth.uid()));

create table if not exists public.developer_app_audit_events (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.developer_apps(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.developer_app_audit_events enable row level security;

drop policy if exists "developer_audit_admin_read" on public.developer_app_audit_events;
create policy "developer_audit_admin_read" on public.developer_app_audit_events
  for select using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.developer_apps a
      where a.id = app_id and a.owner_user_id = auth.uid()
    )
  );
