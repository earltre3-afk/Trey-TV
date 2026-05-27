-- ─────────────────────────────────────────────────────────────────────────────
-- Watch parties + per-channel public chat + AI moderation audit
-- See: docs/superpowers/specs/2026-05-24-watch-party-design.md
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. watch_parties ────────────────────────────────────────────────────────
create table if not exists public.watch_parties (
  id            uuid primary key default gen_random_uuid(),
  host_id       uuid not null references auth.users(id) on delete cascade,
  channel_id    text not null,
  name          text,
  invite_token  text not null unique default replace(gen_random_uuid()::text, '-', ''),
  max_members   int  not null default 10 check (max_members between 1 and 50),
  created_at    timestamptz not null default now(),
  ended_at      timestamptz
);

create index if not exists idx_watch_parties_host on public.watch_parties(host_id);
create index if not exists idx_watch_parties_invite_active
  on public.watch_parties(invite_token)
  where ended_at is null;

alter table public.watch_parties enable row level security;

-- ── 2. party_members ────────────────────────────────────────────────────────
create table if not exists public.party_members (
  party_id    uuid not null references public.watch_parties(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('host','member')),
  muted_chat  boolean not null default false,
  muted_mic   boolean not null default false,
  kicked      boolean not null default false,
  joined_at   timestamptz not null default now(),
  primary key (party_id, user_id)
);

create index if not exists idx_party_members_user_active
  on public.party_members(user_id)
  where kicked = false;

alter table public.party_members enable row level security;

-- Enforce max_members at insert time (cheaper than after-the-fact UPDATE check).
create or replace function public.enforce_party_max_members() returns trigger
language plpgsql as $$
declare
  cap int;
  active_count int;
begin
  select max_members into cap
    from public.watch_parties where id = new.party_id;
  select count(*) into active_count
    from public.party_members
    where party_id = new.party_id and kicked = false;
  if active_count >= cap then
    raise exception 'party_full' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists party_members_max_trg on public.party_members;
create trigger party_members_max_trg
  before insert on public.party_members
  for each row execute function public.enforce_party_max_members();

-- ── 3. chat_messages (party + public) ───────────────────────────────────────
create table if not exists public.chat_messages (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('party','public')),
  scope_id      text not null,                -- party_id::text for party, channel handle for public
  sender_id     uuid not null references auth.users(id) on delete cascade,
  body          text not null check (length(body) between 1 and 500),
  created_at    timestamptz not null default now()
);

create index if not exists idx_chat_messages_scope_recent
  on public.chat_messages(kind, scope_id, created_at desc);

create index if not exists idx_chat_messages_sender_recent
  on public.chat_messages(sender_id, created_at desc);

alter table public.chat_messages enable row level security;

-- ── 4. chat_moderation_events (audit) ───────────────────────────────────────
create table if not exists public.chat_moderation_events (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references auth.users(id) on delete cascade,
  message_text  text not null,
  verdict       text not null check (verdict in ('clean','nudge','block','timeout')),
  severity      text not null check (severity in ('none','low','medium','high')),
  reason        text,
  kind          text not null check (kind in ('party','public')),
  scope_id      text not null,
  created_at    timestamptz not null default now()
);

create index if not exists idx_chat_mod_events_sender_recent
  on public.chat_moderation_events(sender_id, created_at desc);

alter table public.chat_moderation_events enable row level security;

-- ── 5. RLS policies ─────────────────────────────────────────────────────────

-- watch_parties: members can read their party row; anyone authed can create;
-- only host can update. Invite-token lookup is done by the
-- accept_party_invite() SECURITY DEFINER function so we don't need a
-- separate token-scoped SELECT policy.
drop policy if exists "watch_parties_member_select" on public.watch_parties;
create policy "watch_parties_member_select"
  on public.watch_parties for select to authenticated
  using (
    exists (
      select 1 from public.party_members pm
      where pm.party_id = watch_parties.id
        and pm.user_id  = auth.uid()
        and pm.kicked   = false
    )
  );

drop policy if exists "watch_parties_self_insert" on public.watch_parties;
create policy "watch_parties_self_insert"
  on public.watch_parties for insert to authenticated
  with check (host_id = auth.uid());

drop policy if exists "watch_parties_host_update" on public.watch_parties;
create policy "watch_parties_host_update"
  on public.watch_parties for update to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

-- party_members: members can read; host can insert/update/delete; self can
-- mark themselves kicked (leave party).
drop policy if exists "party_members_member_select" on public.party_members;
create policy "party_members_member_select"
  on public.party_members for select to authenticated
  using (
    exists (
      select 1 from public.party_members pm2
      where pm2.party_id = party_members.party_id
        and pm2.user_id  = auth.uid()
        and pm2.kicked   = false
    )
  );

drop policy if exists "party_members_host_insert" on public.party_members;
create policy "party_members_host_insert"
  on public.party_members for insert to authenticated
  with check (
    exists (
      select 1 from public.watch_parties wp
      where wp.id = party_id and wp.host_id = auth.uid()
    )
    -- The first row (host) is inserted by the create-party server fn (SECURITY DEFINER).
    -- Members joining via invite token go through accept_party_invite() (SECURITY DEFINER).
    -- Direct INSERTs are only host-driven invites from the follower picker.
  );

drop policy if exists "party_members_host_update" on public.party_members;
create policy "party_members_host_update"
  on public.party_members for update to authenticated
  using (
    exists (
      select 1 from public.watch_parties wp
      where wp.id = party_id and wp.host_id = auth.uid()
    )
  );

drop policy if exists "party_members_self_leave" on public.party_members;
create policy "party_members_self_leave"
  on public.party_members for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and kicked = true);

-- chat_messages: SELECT is split by kind. INSERT is blocked here — clients MUST
-- use the post_chat_message() function which runs moderation + rate-limit.
drop policy if exists "chat_messages_public_select" on public.chat_messages;
create policy "chat_messages_public_select"
  on public.chat_messages for select to authenticated
  using (kind = 'public');

drop policy if exists "chat_messages_party_select" on public.chat_messages;
create policy "chat_messages_party_select"
  on public.chat_messages for select to authenticated
  using (
    kind = 'party'
    and exists (
      select 1 from public.party_members pm
      where pm.party_id::text = chat_messages.scope_id
        and pm.user_id = auth.uid()
        and pm.kicked = false
    )
  );

-- chat_moderation_events: admin-only read; insert via SECURITY DEFINER fn only.
drop policy if exists "chat_mod_events_admin_select" on public.chat_moderation_events;
create policy "chat_mod_events_admin_select"
  on public.chat_moderation_events for select to authenticated
  using (public.is_admin(auth.uid()));

-- ── 6. Server-side functions ────────────────────────────────────────────────

-- accept_party_invite: validate token, insert member row.
create or replace function public.accept_party_invite(p_invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_party_id uuid;
  v_user_id  uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select id into v_party_id
    from public.watch_parties
   where invite_token = p_invite_token
     and ended_at is null
   limit 1;

  if v_party_id is null then
    raise exception 'invite_invalid_or_party_ended' using errcode = 'P0001';
  end if;

  -- If they were previously kicked, refuse.
  if exists (
    select 1 from public.party_members
    where party_id = v_party_id and user_id = v_user_id and kicked = true
  ) then
    raise exception 'kicked' using errcode = 'P0001';
  end if;

  -- Idempotent: if already a member, just return.
  if exists (
    select 1 from public.party_members
    where party_id = v_party_id and user_id = v_user_id
  ) then
    return v_party_id;
  end if;

  -- Trigger enforces the 10-member cap.
  insert into public.party_members (party_id, user_id, role)
       values (v_party_id, v_user_id, 'member');

  return v_party_id;
end $$;

grant execute on function public.accept_party_invite(text) to authenticated;

-- create_watch_party: insert party + add host as first member.
create or replace function public.create_watch_party(p_channel_id text, p_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_party_id uuid;
  v_user_id  uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  insert into public.watch_parties (host_id, channel_id, name)
       values (v_user_id, p_channel_id, p_name)
       returning id into v_party_id;

  insert into public.party_members (party_id, user_id, role)
       values (v_party_id, v_user_id, 'host');

  return v_party_id;
end $$;

grant execute on function public.create_watch_party(text, text) to authenticated;

-- post_chat_message will be created in a follow-up migration once the
-- Trey-I moderation server function is wired (see Phase 2 of the spec).
-- It needs to call out to the app server, which is done from createServerFn
-- on the TS side, not from inside Postgres. The TS server fn writes directly
-- to chat_messages via the service-role client.

-- ── 7. End-party TTL cron ───────────────────────────────────────────────────
-- A simple SQL function the app cron calls hourly.
create or replace function public.expire_stale_watch_parties()
returns int
language sql
security definer
set search_path = public
as $$
  with expired as (
    update public.watch_parties
       set ended_at = now()
     where ended_at is null
       and created_at < now() - interval '4 hours'
     returning 1
  )
  select count(*)::int from expired;
$$;

grant execute on function public.expire_stale_watch_parties() to service_role;
