-- ============================================================
-- TREY TV OAUTH TOKEN RUNTIME FIELDS =========================
-- ============================================================
-- Adds runtime fields needed by the real OAuth token exchange,
-- refresh, userinfo, revocation, and connected-apps flows.

alter table public.developer_app_tokens
  add column if not exists refresh_token_expires_at timestamptz;

alter table public.developer_app_tokens
  add column if not exists last_used_at timestamptz;

create index if not exists idx_developer_app_tokens_refresh_hash
  on public.developer_app_tokens(refresh_token_hash)
  where refresh_token_hash is not null;

create index if not exists idx_developer_app_tokens_active_access
  on public.developer_app_tokens(access_token_hash, expires_at)
  where revoked_at is null;

create index if not exists idx_developer_app_tokens_active_refresh
  on public.developer_app_tokens(refresh_token_hash, refresh_token_expires_at)
  where revoked_at is null and refresh_token_hash is not null;
