-- Create music-review-audio bucket for audio submissions
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'music-review-audio',
  'music-review-audio',
  false,
  26843545600, -- 25GB in bytes
  array['audio/mpeg', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mp4', 'audio/m4a', 'audio/aac', 'audio/x-m4a']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Create music-review-cover-art bucket for cover art submissions
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'music-review-cover-art',
  'music-review-cover-art',
  false,
  104857600, -- 100MB in bytes
  array['image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Create open-mic-temp-audio bucket for open mic temporary storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'open-mic-temp-audio',
  'open-mic-temp-audio',
  false,
  26843545600, -- 25GB in bytes
  array['audio/mpeg', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mp4', 'audio/m4a', 'audio/aac', 'audio/x-m4a']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Drop existing policies to recreate them with proper configuration
drop policy if exists "music-review-audio-upload" on storage.objects;
drop policy if exists "music-review-audio-read-own" on storage.objects;
drop policy if exists "music-review-audio-read-service" on storage.objects;
drop policy if exists "music-review-audio-delete-own" on storage.objects;
drop policy if exists "music-review-cover-upload" on storage.objects;
drop policy if exists "music-review-cover-read-own" on storage.objects;
drop policy if exists "music-review-cover-read-service" on storage.objects;
drop policy if exists "music-review-cover-delete-own" on storage.objects;
drop policy if exists "open-mic-temp-audio-upload" on storage.objects;
drop policy if exists "open-mic-temp-audio-read-own" on storage.objects;
drop policy if exists "open-mic-temp-audio-read-service" on storage.objects;
drop policy if exists "open-mic-temp-audio-delete-own" on storage.objects;
drop policy if exists "open-mic-temp-audio-delete-service" on storage.objects;

-- Storage policies for music-review-audio bucket
-- Allow authenticated users to upload their own audio submissions
create policy "music-review-audio-upload" on storage.objects
  for insert with check (
    bucket_id = 'music-review-audio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own audio submissions
create policy "music-review-audio-read-own" on storage.objects
  for select using (
    bucket_id = 'music-review-audio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow service role to read all audio submissions (for admin/processing)
create policy "music-review-audio-read-service" on storage.objects
  for select using (
    bucket_id = 'music-review-audio'
    and auth.role() = 'service_role'
  );

-- Allow authenticated users to delete their own audio submissions
create policy "music-review-audio-delete-own" on storage.objects
  for delete using (
    bucket_id = 'music-review-audio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for music-review-cover-art bucket
-- Allow authenticated users to upload their own cover art
create policy "music-review-cover-upload" on storage.objects
  for insert with check (
    bucket_id = 'music-review-cover-art'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own cover art
create policy "music-review-cover-read-own" on storage.objects
  for select using (
    bucket_id = 'music-review-cover-art'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow service role to read all cover art (for admin/processing)
create policy "music-review-cover-read-service" on storage.objects
  for select using (
    bucket_id = 'music-review-cover-art'
    and auth.role() = 'service_role'
  );

-- Allow authenticated users to delete their own cover art
create policy "music-review-cover-delete-own" on storage.objects
  for delete using (
    bucket_id = 'music-review-cover-art'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for open-mic-temp-audio bucket
-- Allow authenticated users to upload temporary audio
create policy "open-mic-temp-audio-upload" on storage.objects
  for insert with check (
    bucket_id = 'open-mic-temp-audio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own temporary audio
create policy "open-mic-temp-audio-read-own" on storage.objects
  for select using (
    bucket_id = 'open-mic-temp-audio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow service role to read all temporary audio (for admin/processing)
create policy "open-mic-temp-audio-read-service" on storage.objects
  for select using (
    bucket_id = 'open-mic-temp-audio'
    and auth.role() = 'service_role'
  );

-- Allow authenticated users to delete their own temporary audio
create policy "open-mic-temp-audio-delete-own" on storage.objects
  for delete using (
    bucket_id = 'open-mic-temp-audio'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow service role to delete any temporary audio (for cleanup/maintenance)
create policy "open-mic-temp-audio-delete-service" on storage.objects
  for delete using (
    bucket_id = 'open-mic-temp-audio'
    and auth.role() = 'service_role'
  );

