-- ============================================================
-- TRADIO ACCESS REQUESTS + ROLE GRANTS =======================
-- ============================================================
-- Backend for the Tradio role/access system (artist / producer / dj /
-- verification / broadcast applications + admin review + role granting).
-- Until this exists, accessRequestService.ts falls back to the local mock and
-- elevated roles can never actually be granted.
--
-- Contracts mirror src/tradio/components/tradio/auth/accessRequestService.ts:
--   tables  : tradio_role_access_requests, tradio_access_request_events
--   self RPC: tradio_submit_access_request / _update_access_request / _cancel_access_request
--   admin   : tradio_review_access_request / tradio_grant_role_from_request
--   helper  : tradio_is_platform_admin()
--
-- All writes go through SECURITY DEFINER RPCs; there are no direct INSERT/UPDATE
-- policies, so a client can never self-grant an elevated role or forge a review.
-- Idempotent (IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS).

-- ── Platform-admin helper ────────────────────────────────────
-- True for Trey TV admins (public.is_admin) or anyone holding an active Tradio
-- admin/owner role grant.
create or replace function public.tradio_is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(public.is_admin(auth.uid()), false)
    or exists (
      select 1 from public.tradio_user_roles r
      where r.user_id = auth.uid()
        and r.role in ('admin', 'owner')
        and r.role_status = 'active'
    );
$$;

-- ============================================================
-- 1) Tables =================================================
-- ============================================================
create table if not exists public.tradio_role_access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null
    check (request_type in ('artist', 'producer', 'dj', 'verification', 'broadcast')),
  requested_role text
    check (requested_role is null or requested_role in ('artist', 'producer', 'dj')),
  status text not null default 'pending'
    check (status in ('not_started', 'draft', 'submitted', 'pending', 'approved',
                      'rejected', 'restricted', 'needs_more_info', 'cancelled')),
  answers jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tradio_access_requests_user on public.tradio_role_access_requests(user_id);
create index if not exists idx_tradio_access_requests_status on public.tradio_role_access_requests(status);

drop trigger if exists trg_tradio_access_requests_updated_at on public.tradio_role_access_requests;
create trigger trg_tradio_access_requests_updated_at
  before update on public.tradio_role_access_requests
  for each row execute function public.tradio_set_updated_at();

create table if not exists public.tradio_access_request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.tradio_role_access_requests(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null
    check (event_type in ('submitted', 'updated', 'needs_more_info', 'approved',
                          'rejected', 'restricted', 'cancelled', 'note_added')),
  from_status text,
  to_status text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_tradio_access_request_events_req on public.tradio_access_request_events(request_id);

-- ── RLS: read-only for owners/admins; all writes via the RPCs below ──────────
alter table public.tradio_role_access_requests enable row level security;
alter table public.tradio_access_request_events enable row level security;

drop policy if exists "tradio_access_requests_select" on public.tradio_role_access_requests;
create policy "tradio_access_requests_select"
  on public.tradio_role_access_requests for select
  using (auth.uid() = user_id or public.tradio_is_platform_admin());

drop policy if exists "tradio_access_request_events_select" on public.tradio_access_request_events;
create policy "tradio_access_request_events_select"
  on public.tradio_access_request_events for select
  using (
    exists (
      select 1 from public.tradio_role_access_requests r
      where r.id = request_id
        and (r.user_id = auth.uid() or public.tradio_is_platform_admin())
    )
  );

-- ============================================================
-- 2) Self-service RPCs ======================================
-- ============================================================
create or replace function public.tradio_submit_access_request(
  p_request_type text,
  p_requested_role text,
  p_answers jsonb,
  p_evidence jsonb
)
returns public.tradio_role_access_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.tradio_role_access_requests;
begin
  if v_uid is null then
    raise exception 'auth required';
  end if;
  if p_request_type not in ('artist', 'producer', 'dj', 'verification', 'broadcast') then
    raise exception 'invalid request_type %', p_request_type;
  end if;

  insert into public.tradio_role_access_requests (user_id, request_type, requested_role, status, answers, evidence, submitted_at)
  values (
    v_uid,
    p_request_type,
    case when p_requested_role in ('artist', 'producer', 'dj') then p_requested_role else null end,
    'pending',
    coalesce(p_answers, '{}'::jsonb),
    coalesce(p_evidence, '{}'::jsonb),
    now()
  )
  returning * into v_row;

  insert into public.tradio_access_request_events (request_id, actor_user_id, event_type, from_status, to_status)
  values (v_row.id, v_uid, 'submitted', null, 'pending');

  return v_row;
end;
$$;

create or replace function public.tradio_update_access_request(
  p_request_id uuid,
  p_answers jsonb,
  p_evidence jsonb,
  p_resubmit boolean
)
returns public.tradio_role_access_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.tradio_role_access_requests;
  v_from text;
begin
  if v_uid is null then
    raise exception 'auth required';
  end if;

  select * into v_row from public.tradio_role_access_requests where id = p_request_id;
  if not found then
    raise exception 'request not found';
  end if;
  if v_row.user_id <> v_uid then
    raise exception 'not your request';
  end if;
  if v_row.status not in ('draft', 'rejected', 'needs_more_info', 'pending', 'submitted') then
    raise exception 'request is not editable in status %', v_row.status;
  end if;

  v_from := v_row.status;
  update public.tradio_role_access_requests
  set answers = coalesce(p_answers, answers),
      evidence = coalesce(p_evidence, evidence),
      status = case when p_resubmit then 'pending' else status end,
      submitted_at = case when p_resubmit then now() else submitted_at end
  where id = p_request_id
  returning * into v_row;

  insert into public.tradio_access_request_events (request_id, actor_user_id, event_type, from_status, to_status)
  values (p_request_id, v_uid, 'updated', v_from, v_row.status);

  return v_row;
end;
$$;

create or replace function public.tradio_cancel_access_request(p_request_id uuid)
returns public.tradio_role_access_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.tradio_role_access_requests;
  v_from text;
begin
  if v_uid is null then
    raise exception 'auth required';
  end if;
  select * into v_row from public.tradio_role_access_requests where id = p_request_id;
  if not found then
    raise exception 'request not found';
  end if;
  if v_row.user_id <> v_uid then
    raise exception 'not your request';
  end if;

  v_from := v_row.status;
  update public.tradio_role_access_requests
  set status = 'cancelled'
  where id = p_request_id
  returning * into v_row;

  insert into public.tradio_access_request_events (request_id, actor_user_id, event_type, from_status, to_status)
  values (p_request_id, v_uid, 'cancelled', v_from, 'cancelled');

  return v_row;
end;
$$;

-- ============================================================
-- 3) Admin / reviewer RPCs (platform-admin only) ============
-- ============================================================
create or replace function public.tradio_review_access_request(
  p_request_id uuid,
  p_status text,
  p_note text
)
returns public.tradio_role_access_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.tradio_role_access_requests;
  v_from text;
  v_event text;
begin
  if not public.tradio_is_platform_admin() then
    raise exception 'platform admin required';
  end if;
  if p_status not in ('pending', 'rejected', 'restricted', 'needs_more_info') then
    raise exception 'invalid review status %', p_status;
  end if;

  select * into v_row from public.tradio_role_access_requests where id = p_request_id;
  if not found then
    raise exception 'request not found';
  end if;

  v_from := v_row.status;
  update public.tradio_role_access_requests
  set status = p_status,
      reviewed_at = now(),
      reviewed_by = v_uid,
      reviewer_note = coalesce(p_note, reviewer_note)
  where id = p_request_id
  returning * into v_row;

  v_event := case p_status
    when 'rejected' then 'rejected'
    when 'restricted' then 'restricted'
    when 'needs_more_info' then 'needs_more_info'
    else 'updated'
  end;

  insert into public.tradio_access_request_events (request_id, actor_user_id, event_type, from_status, to_status, note)
  values (p_request_id, v_uid, v_event, v_from, p_status, p_note);

  return v_row;
end;
$$;

create or replace function public.tradio_grant_role_from_request(
  p_request_id uuid,
  p_note text
)
returns public.tradio_role_access_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.tradio_role_access_requests;
  v_from text;
begin
  if not public.tradio_is_platform_admin() then
    raise exception 'platform admin required';
  end if;

  select * into v_row from public.tradio_role_access_requests where id = p_request_id;
  if not found then
    raise exception 'request not found';
  end if;

  v_from := v_row.status;

  -- Apply the grant according to the request type.
  if v_row.requested_role in ('artist', 'producer', 'dj') then
    insert into public.tradio_user_roles (user_id, role, role_status, granted_by, role_metadata)
    values (v_row.user_id, v_row.requested_role, 'active', v_uid,
            jsonb_build_object('source', 'access_request', 'request_id', v_row.id))
    on conflict (user_id, role)
      do update set role_status = 'active', granted_by = excluded.granted_by, granted_at = now();
  elsif v_row.request_type = 'verification' then
    update public.tradio_profiles set tradio_verification_status = 'verified' where user_id = v_row.user_id;
  elsif v_row.request_type = 'broadcast' then
    update public.tradio_profiles set tradio_broadcast_access_status = 'cleared' where user_id = v_row.user_id;
  end if;

  update public.tradio_role_access_requests
  set status = 'approved',
      reviewed_at = now(),
      reviewed_by = v_uid,
      reviewer_note = coalesce(p_note, reviewer_note)
  where id = p_request_id
  returning * into v_row;

  insert into public.tradio_access_request_events (request_id, actor_user_id, event_type, from_status, to_status, note)
  values (p_request_id, v_uid, 'approved', v_from, 'approved', p_note);

  return v_row;
end;
$$;

-- ── Execution grants ─────────────────────────────────────────
-- Admin RPCs enforce tradio_is_platform_admin() internally, so they are safe to
-- expose to authenticated; they raise for non-admins.
grant execute on function public.tradio_is_platform_admin() to authenticated;
grant execute on function public.tradio_submit_access_request(text, text, jsonb, jsonb) to authenticated;
grant execute on function public.tradio_update_access_request(uuid, jsonb, jsonb, boolean) to authenticated;
grant execute on function public.tradio_cancel_access_request(uuid) to authenticated;
grant execute on function public.tradio_review_access_request(uuid, text, text) to authenticated;
grant execute on function public.tradio_grant_role_from_request(uuid, text) to authenticated;
