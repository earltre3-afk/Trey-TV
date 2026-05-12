
-- ============================================================
-- PROFILE IMPORT: SCREENSHOT ONBOARDING TABLES ===============
-- ============================================================

-- Import jobs table
create table if not exists public.profile_import_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null default 'screenshot',
  status text not null default 'pending' check (status in ('pending','extracting','extracted','reviewing','published','failed')),
  consent_version text,
  uploaded_files jsonb default '[]'::jsonb,
  extracted_json jsonb default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile_import_jobs enable row level security;

drop policy if exists "import_jobs_owner_all" on public.profile_import_jobs;
create policy "import_jobs_owner_all" on public.profile_import_jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Import assets table
create table if not exists public.profile_import_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  import_job_id uuid references public.profile_import_jobs(id) on delete cascade,
  asset_type text not null check (asset_type in ('screenshot','avatar_crop','banner_crop')),
  source_storage_path text,
  cropped_storage_path text,
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','removed')),
  created_at timestamptz not null default now()
);

alter table public.profile_import_assets enable row level security;

drop policy if exists "import_assets_owner_all" on public.profile_import_assets;
create policy "import_assets_owner_all" on public.profile_import_assets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Import consents table
create table if not exists public.profile_import_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_text text not null,
  consent_version text not null,
  accepted_at timestamptz not null default now()
);

alter table public.profile_import_consents enable row level security;

drop policy if exists "import_consents_owner_all" on public.profile_import_consents;
create policy "import_consents_owner_all" on public.profile_import_consents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- STORAGE: PRIVATE BUCKET FOR IMPORT SCREENSHOTS =============
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-import-screenshots',
  'profile-import-screenshots',
  false,
  10485760,
  array['image/png','image/jpeg','image/jpg','image/webp']
)
on conflict (id) do nothing;

drop policy if exists "import_screenshots_owner_upload" on storage.objects;
create policy "import_screenshots_owner_upload" on storage.objects
  for insert with check (
    bucket_id = 'profile-import-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "import_screenshots_owner_read" on storage.objects;
create policy "import_screenshots_owner_read" on storage.objects
  for select using (
    bucket_id = 'profile-import-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "import_screenshots_owner_delete" on storage.objects;
create policy "import_screenshots_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'profile-import-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
