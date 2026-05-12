-- ============================================================
-- VERIFICATION APPLICATION DATA ==============================
-- ============================================================
-- Adds a jsonb column to hold all Gold Verification-specific
-- form data so we don't need 20+ narrow columns for one flow.

alter table public.creator_applications
  add column if not exists verification_data jsonb not null default '{}'::jsonb;
