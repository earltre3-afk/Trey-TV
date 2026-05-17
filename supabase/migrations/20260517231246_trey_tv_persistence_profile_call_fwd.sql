-- Additive persistence pass for Trey TV social/profile/inbox/FWD integration.

alter table public.profiles
  add column if not exists show_fwd_gifs_on_profile boolean not null default false;

create table if not exists public.creator_subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references auth.users(id) on delete cascade,
  subscribed_to_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint creator_subscriptions_not_self check (subscriber_id <> subscribed_to_id),
  constraint creator_subscriptions_unique unique (subscriber_id, subscribed_to_id)
);

create index if not exists idx_creator_subscriptions_subscriber
  on public.creator_subscriptions(subscriber_id, created_at desc);
create index if not exists idx_creator_subscriptions_target
  on public.creator_subscriptions(subscribed_to_id, created_at desc);

alter table public.creator_subscriptions enable row level security;

drop policy if exists "creator_subscriptions_public_read" on public.creator_subscriptions;
create policy "creator_subscriptions_public_read"
on public.creator_subscriptions
for select
using (true);

drop policy if exists "creator_subscriptions_owner_insert" on public.creator_subscriptions;
create policy "creator_subscriptions_owner_insert"
on public.creator_subscriptions
for insert
to authenticated
with check (auth.uid() = subscriber_id and subscriber_id <> subscribed_to_id);

drop policy if exists "creator_subscriptions_owner_delete" on public.creator_subscriptions;
create policy "creator_subscriptions_owner_delete"
on public.creator_subscriptions
for delete
to authenticated
using (auth.uid() = subscriber_id);

grant select on public.creator_subscriptions to anon, authenticated;
grant insert, delete on public.creator_subscriptions to authenticated;

create table if not exists public.call_requests (
  id uuid primary key default gen_random_uuid(),
  caller_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  thread_id text,
  call_type text not null default 'audio' check (call_type in ('audio', 'video')),
  status text not null default 'requested' check (status in ('requested', 'accepted', 'declined', 'missed', 'canceled', 'ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint call_requests_not_self check (caller_id <> recipient_id)
);

create index if not exists idx_call_requests_recipient_status
  on public.call_requests(recipient_id, status, created_at desc);
create index if not exists idx_call_requests_caller_status
  on public.call_requests(caller_id, status, created_at desc);

alter table public.call_requests enable row level security;

drop policy if exists "call_requests_participant_read" on public.call_requests;
create policy "call_requests_participant_read"
on public.call_requests
for select
to authenticated
using (auth.uid() = caller_id or auth.uid() = recipient_id);

drop policy if exists "call_requests_caller_insert" on public.call_requests;
create policy "call_requests_caller_insert"
on public.call_requests
for insert
to authenticated
with check (auth.uid() = caller_id and caller_id <> recipient_id);

drop policy if exists "call_requests_participant_update" on public.call_requests;
create policy "call_requests_participant_update"
on public.call_requests
for update
to authenticated
using (auth.uid() = caller_id or auth.uid() = recipient_id)
with check (auth.uid() = caller_id or auth.uid() = recipient_id);

grant select, insert, update on public.call_requests to authenticated;
