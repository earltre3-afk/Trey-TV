-- Add profile_song_id to public.profiles table
alter table public.profiles add column if not exists profile_song_id text;
