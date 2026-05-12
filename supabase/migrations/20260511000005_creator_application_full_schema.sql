-- ============================================================
-- CREATOR APPLICATION FULL SCHEMA ============================
-- ============================================================
-- Expands the creator_applications table with all columns
-- needed for the 6-step creator application flow.
-- Uses ADD COLUMN IF NOT EXISTS throughout for safety.

-- Owner UID used by the application and admin review flows.
alter table public.creator_applications
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Application type (creator vs verification)
alter table public.creator_applications
  add column if not exists application_type text not null default 'creator';

-- Step 1 – Identity
alter table public.creator_applications
  add column if not exists creator_name text;
alter table public.creator_applications
  add column if not exists channel_handle text;
alter table public.creator_applications
  add column if not exists location text;

-- Step 2 – Channel (niche + bio already exist)
alter table public.creator_applications
  add column if not exists channel_name text;

-- Step 3 – Content Style
alter table public.creator_applications
  add column if not exists content_formats text[] not null default array[]::text[];
alter table public.creator_applications
  add column if not exists posting_frequency text;
alter table public.creator_applications
  add column if not exists target_audience text;

-- Step 4 – Launch Plan (reason already exists for goals)
alter table public.creator_applications
  add column if not exists first_content_idea text;
alter table public.creator_applications
  add column if not exists release_timeline text;

-- Step 5 – Community Standards
alter table public.creator_applications
  add column if not exists agreed_to_standards boolean not null default false;

-- Timestamps
alter table public.creator_applications
  add column if not exists updated_at timestamptz;

-- ── RLS ──────────────────────────────────────────────────────
alter table public.creator_applications enable row level security;

-- Users can read their own applications
drop policy if exists "creator_applications_select_own" on public.creator_applications;
create policy "creator_applications_select_own"
  on public.creator_applications for select
  using (auth.uid() = user_id);

-- Users can insert their own applications
drop policy if exists "creator_applications_insert_own" on public.creator_applications;
create policy "creator_applications_insert_own"
  on public.creator_applications for insert
  with check (auth.uid() = user_id);

-- Users can update their own draft applications only
drop policy if exists "creator_applications_update_own_draft" on public.creator_applications;
create policy "creator_applications_update_own_draft"
  on public.creator_applications for update
  using (auth.uid() = user_id and status in ('draft', 'needs_more_info'));

-- Admins can read and update all applications
drop policy if exists "creator_applications_admin_select" on public.creator_applications;
create policy "creator_applications_admin_select"
  on public.creator_applications for select
  using (public.is_admin(auth.uid()));

drop policy if exists "creator_applications_admin_update" on public.creator_applications;
create policy "creator_applications_admin_update"
  on public.creator_applications for update
  using (public.is_admin(auth.uid()));
