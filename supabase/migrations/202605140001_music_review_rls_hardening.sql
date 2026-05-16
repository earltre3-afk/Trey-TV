-- Trey TV Music Review production hardening migration
-- Review this in your real Trey TV Supabase project before applying.
-- This assumes Supabase Auth is enabled. Trey TV admin access is resolved by
-- the existing public.is_admin/public.is_owner helpers and, as a fallback,
-- JWT app_metadata.role. Do not use user_metadata for authorization.

create or replace function public.is_trey_tv_admin()
returns boolean
language sql
stable
as $$
  select coalesce(public.is_admin(auth.uid()), false)
      or coalesce(public.is_owner(auth.uid()), false)
      or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'owner');
$$;

grant execute on function public.is_trey_tv_admin() to authenticated;
grant execute on function public.is_trey_tv_admin() to anon;

-- Enable RLS.
alter table if exists public.music_review_submissions enable row level security;
alter table if exists public.music_review_queue enable row level security;
alter table if exists public.music_review_scores enable row level security;
alter table if exists public.music_review_comments enable row level security;
alter table if exists public.music_review_reactions enable row level security;
alter table if exists public.music_review_payments enable row level security;
alter table if exists public.open_mic_queue enable row level security;
alter table if exists public.open_mic_play_history enable row level security;
alter table if exists public.open_mic_daily_limits enable row level security;
alter table if exists public.music_review_email_logs enable row level security;
alter table if exists public.music_review_settings enable row level security;

-- Remove old permissive/unsafe policies if they exist.
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'music_review_submissions','music_review_queue','music_review_scores','music_review_comments',
        'music_review_reactions','music_review_payments','open_mic_queue','open_mic_play_history',
        'open_mic_daily_limits','music_review_email_logs','music_review_settings'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- music_review_submissions
create policy "mrs_select_own_admin_or_public_queue"
on public.music_review_submissions
for select
using (
  public.is_trey_tv_admin()
  or user_id = auth.uid()
  or status in ('in_queue', 'now_playing', 'under_review', 'review_complete')
);

create policy "mrs_insert_own"
on public.music_review_submissions
for insert
to authenticated
with check (user_id = auth.uid());

create policy "mrs_update_admin_only"
on public.music_review_submissions
for update
to authenticated
using (public.is_trey_tv_admin())
with check (public.is_trey_tv_admin());

create policy "mrs_delete_admin_only"
on public.music_review_submissions
for delete
to authenticated
using (public.is_trey_tv_admin());

-- music_review_queue
create policy "mrq_select_visible"
on public.music_review_queue
for select
using (public.is_trey_tv_admin() or user_id = auth.uid() or status in ('in_queue', 'now_playing', 'under_review'));

create policy "mrq_admin_all"
on public.music_review_queue
for all
to authenticated
using (public.is_trey_tv_admin())
with check (public.is_trey_tv_admin());

-- music_review_scores
create policy "mrscores_select_public_own_admin"
on public.music_review_scores
for select
using (public_visible = true or user_id = auth.uid() or public.is_trey_tv_admin());

create policy "mrscores_admin_insert"
on public.music_review_scores
for insert
to authenticated
with check (public.is_trey_tv_admin());

create policy "mrscores_admin_update"
on public.music_review_scores
for update
to authenticated
using (public.is_trey_tv_admin())
with check (public.is_trey_tv_admin());

create policy "mrscores_admin_delete"
on public.music_review_scores
for delete
to authenticated
using (public.is_trey_tv_admin());

-- comments and reactions
create policy "mrcomments_select_visible"
on public.music_review_comments
for select
using (coalesce(is_hidden, false) = false or user_id = auth.uid() or public.is_trey_tv_admin());

create policy "mrcomments_insert_own_or_admin_ai_labeled"
on public.music_review_comments
for insert
to authenticated
with check (
  (user_id = auth.uid() and coalesce(is_ai_labeled, false) = false and coalesce(is_admin, false) = false)
  or public.is_trey_tv_admin()
);

create policy "mrcomments_update_own_or_admin"
on public.music_review_comments
for update
to authenticated
using (user_id = auth.uid() or public.is_trey_tv_admin())
with check (user_id = auth.uid() or public.is_trey_tv_admin());

create policy "mrcomments_delete_own_or_admin"
on public.music_review_comments
for delete
to authenticated
using (user_id = auth.uid() or public.is_trey_tv_admin());

create policy "mrreactions_select_all"
on public.music_review_reactions
for select
using (true);

create policy "mrreactions_insert_own"
on public.music_review_reactions
for insert
to authenticated
with check (user_id = auth.uid());

create policy "mrreactions_delete_own_or_admin"
on public.music_review_reactions
for delete
to authenticated
using (user_id = auth.uid() or public.is_trey_tv_admin());

-- payments: users can create/view their own payment intents; only admin confirms.
create policy "mrpayments_select_own_admin"
on public.music_review_payments
for select
to authenticated
using (user_id = auth.uid() or public.is_trey_tv_admin());

create policy "mrpayments_insert_own_pending"
on public.music_review_payments
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'pending'
  and coalesce(confirmed_by_admin, false) = false
);

create policy "mrpayments_update_admin_only"
on public.music_review_payments
for update
to authenticated
using (public.is_trey_tv_admin())
with check (public.is_trey_tv_admin());

-- open mic
create policy "omq_select_visible"
on public.open_mic_queue
for select
using (public.is_trey_tv_admin() or user_id = auth.uid() or status in ('queued', 'playing', 'played'));

create policy "omq_insert_own_limited"
on public.open_mic_queue
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'queued'
  and (select count(*) from public.open_mic_queue where status in ('queued','playing')) < 10
);

create policy "omq_update_admin_only"
on public.open_mic_queue
for update
to authenticated
using (public.is_trey_tv_admin())
with check (public.is_trey_tv_admin());

create policy "omq_delete_admin_only"
on public.open_mic_queue
for delete
to authenticated
using (public.is_trey_tv_admin());

create policy "omph_select_own_admin"
on public.open_mic_play_history
for select
to authenticated
using (user_id = auth.uid() or public.is_trey_tv_admin());

create policy "omph_admin_insert"
on public.open_mic_play_history
for insert
to authenticated
with check (public.is_trey_tv_admin());

create policy "omdl_select_own_admin"
on public.open_mic_daily_limits
for select
to authenticated
using (user_id = auth.uid() or public.is_trey_tv_admin());

create policy "omdl_admin_all"
on public.open_mic_daily_limits
for all
to authenticated
using (public.is_trey_tv_admin())
with check (public.is_trey_tv_admin());

-- email logs and settings
create policy "mrel_select_own_admin"
on public.music_review_email_logs
for select
to authenticated
using (user_id = auth.uid() or public.is_trey_tv_admin());

create policy "mrel_admin_all"
on public.music_review_email_logs
for all
to authenticated
using (public.is_trey_tv_admin())
with check (public.is_trey_tv_admin());

create policy "mrsettings_select_admin"
on public.music_review_settings
for select
to authenticated
using (public.is_trey_tv_admin());

create policy "mrsettings_admin_all"
on public.music_review_settings
for all
to authenticated
using (public.is_trey_tv_admin())
with check (public.is_trey_tv_admin());

-- Server-side queue helpers. These should be called by admin actions or trusted server functions.
create or replace function public.rebuild_music_review_queue()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_trey_tv_admin() then
    raise exception 'admin_required';
  end if;

  with ranked as (
    select
      id,
      row_number() over (
        order by
          case
            when coalesce(priority_paid, false) = true and priority_tier = 'front' then 100
            when coalesce(priority_paid, false) = true and priority_tier = 'hot' then 50
            when coalesce(priority_paid, false) = true and priority_tier = 'quick' then 10
            else 0
          end desc,
          created_at asc
      ) as rn
    from public.music_review_submissions
    where status in ('in_queue', 'ai_prechecked', 'pending')
  )
  update public.music_review_submissions s
  set queue_position = ranked.rn,
      updated_at = now()
  from ranked
  where s.id = ranked.id;
end;
$$;

create or replace function public.set_music_review_now_playing(p_submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_trey_tv_admin() then
    raise exception 'admin_required';
  end if;

  update public.music_review_submissions
  set status = 'in_queue', queue_position = null, updated_at = now()
  where status = 'now_playing';

  update public.music_review_submissions
  set status = 'now_playing', updated_at = now()
  where id = p_submission_id;

  perform public.rebuild_music_review_queue();
end;
$$;

create or replace function public.increment_open_mic_daily_count(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := current_date;
  v_existing_id uuid;
begin
  if p_user_id <> auth.uid() and not public.is_trey_tv_admin() then
    raise exception 'not_allowed';
  end if;

  select id into v_existing_id
  from public.open_mic_daily_limits
  where user_id = p_user_id and date = v_today
  limit 1;

  if v_existing_id is null then
    insert into public.open_mic_daily_limits (user_id, date, submission_count, created_at, updated_at)
    values (p_user_id, v_today, 1, now(), now());
  else
    update public.open_mic_daily_limits
    set submission_count = submission_count + 1, updated_at = now()
    where id = v_existing_id;
  end if;
end;
$$;

create or replace function public.finalize_open_mic_item(p_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  item record;
  v_ended_at timestamptz := now();
  cleanup_failed boolean := false;
begin
  if not public.is_trey_tv_admin() then
    raise exception 'admin_required';
  end if;

  select * into item from public.open_mic_queue where id = p_item_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  insert into public.open_mic_play_history (
    user_id, open_mic_queue_id, song_title, artist_name, submitted_at, played_at, ended_at,
    audio_duration, storage_deleted, file_deleted_at, moderation_status, created_at
  ) values (
    item.user_id, item.id, item.song_title, item.artist_name, item.submitted_at, item.started_at,
    v_ended_at, item.audio_duration, true, v_ended_at, item.moderation_status, now()
  ) on conflict do nothing;

  if item.audio_storage_path is not null then
    begin
      delete from storage.objects
      where bucket_id = 'open-mic-temp-audio'
        and name = item.audio_storage_path;
    exception when others then
      cleanup_failed := true;
    end;
  end if;

  update public.open_mic_queue
  set status = 'played',
      ended_at = v_ended_at,
      file_deleted_at = case when cleanup_failed then null else v_ended_at end,
      storage_deleted = not cleanup_failed,
      cleanup_failed = cleanup_failed,
      audio_storage_path = case when cleanup_failed then item.audio_storage_path else null end,
      updated_at = now()
  where id = p_item_id;

  return jsonb_build_object('ok', true, 'cleanup_failed', cleanup_failed);
end;
$$;

-- Storage RLS. Keep official review and open mic audio private.
-- alter table if exists storage.objects enable row level security;

drop policy if exists "music_review_audio_owner_or_admin_read" on storage.objects;
drop policy if exists "music_review_audio_owner_upload" on storage.objects;
drop policy if exists "music_review_audio_admin_delete" on storage.objects;

create policy "music_review_audio_owner_or_admin_read"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('music-review-audio','open-mic-temp-audio')
  and (
    public.is_trey_tv_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

create policy "music_review_audio_owner_upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('music-review-audio','open-mic-temp-audio')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "music_review_audio_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('music-review-audio','open-mic-temp-audio')
  and public.is_trey_tv_admin()
);

-- Cover art can be public-readable if your app displays covers publicly.
drop policy if exists "music_review_cover_public_read" on storage.objects;
drop policy if exists "music_review_cover_owner_upload" on storage.objects;

create policy "music_review_cover_public_read"
on storage.objects
for select
using (bucket_id in ('music-review-cover-art','open-mic-cover-art'));

create policy "music_review_cover_owner_upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('music-review-cover-art','open-mic-cover-art')
  and (storage.foldername(name))[1] = auth.uid()::text
);
