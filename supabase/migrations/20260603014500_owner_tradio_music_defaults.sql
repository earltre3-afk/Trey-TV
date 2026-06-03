-- Attach the owner Tradio songs to the current Trey TV public profile UID.
alter table public.profiles add column if not exists profile_song_id text;
alter table public.profiles add column if not exists profile_preferences jsonb default '{}'::jsonb;

update public.profiles
set
  profile_song_id = coalesce(profile_song_id, 'i-look-like'),
  profile_preferences = jsonb_set(
    coalesce(profile_preferences, '{}'::jsonb),
    '{music_order}',
    '["i-look-like","call-on","midnight-velvet","6am-thoughts","neon-heartbreak"]'::jsonb,
    true
  )
where public_profile_uid = '4236868965602895';
