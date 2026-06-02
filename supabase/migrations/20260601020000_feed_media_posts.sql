-- Media-only composer: post media columns + feed-media Storage bucket.
alter table public.user_feed_posts
  add column if not exists media_type text
    check (media_type is null or media_type in ('image', 'video', 'gif'));
alter table public.user_feed_posts
  add column if not exists media_duration_ms integer;

-- Public bucket for feed photos/clips (FWD GIFs keep their own hosted URLs).
insert into storage.buckets (id, name, public)
values ('feed-media', 'feed-media', true)
on conflict (id) do nothing;

-- Public read; authenticated users may write only under their own <user_id>/ prefix.
drop policy if exists "feed_media_public_read" on storage.objects;
create policy "feed_media_public_read"
  on storage.objects for select
  using (bucket_id = 'feed-media');

drop policy if exists "feed_media_owner_insert" on storage.objects;
create policy "feed_media_owner_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'feed-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "feed_media_owner_update" on storage.objects;
create policy "feed_media_owner_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'feed-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "feed_media_owner_delete" on storage.objects;
create policy "feed_media_owner_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'feed-media' and (storage.foldername(name))[1] = auth.uid()::text);
