-- 20260604120500_admin_audit_hardening.sql
-- Tamper-evident, append-only admin_audit_log. Idempotent.

create extension if not exists pgcrypto;

alter table public.admin_audit_log add column if not exists actor_role text;
alter table public.admin_audit_log add column if not exists ip inet;
alter table public.admin_audit_log add column if not exists user_agent text;
alter table public.admin_audit_log add column if not exists "before" jsonb;
alter table public.admin_audit_log add column if not exists "after" jsonb;
alter table public.admin_audit_log add column if not exists prev_hash text;
alter table public.admin_audit_log add column if not exists row_hash text;

-- Monotonic insertion order for the hash chain. now() is constant within a
-- transaction, so created_at can tie; seq guarantees a deterministic chain order.
create sequence if not exists public.admin_audit_seq;
alter table public.admin_audit_log add column if not exists seq bigint default nextval('public.admin_audit_seq');

-- Canonical payload + hash used by the RPCs.
create or replace function public.admin_audit_payload(
  p_admin uuid, p_action text, p_target_type text, p_target_id text,
  p_before jsonb, p_after jsonb, p_created_at timestamptz)
returns text language sql immutable as $$
  select coalesce(p_admin::text,'') || '|' || coalesce(p_action,'') || '|' ||
         coalesce(p_target_type,'') || '|' || coalesce(p_target_id,'') || '|' ||
         coalesce(p_before::text,'') || '|' || coalesce(p_after::text,'') || '|' ||
         coalesce(p_created_at::text,'')
$$;

create or replace function public.admin_audit_hash(p_prev text, p_payload text)
returns text language sql immutable as $$
  select encode(digest(coalesce(p_prev,'') || p_payload, 'sha256'), 'hex')
$$;

-- Append-only: block client writes; only SECURITY DEFINER / service role write.
alter table public.admin_audit_log enable row level security;
revoke insert, update, delete on public.admin_audit_log from authenticated, anon;

drop policy if exists admin_audit_select on public.admin_audit_log;
create policy admin_audit_select on public.admin_audit_log
  for select using (public.has_admin_permission(auth.uid(), 'audit.read'));

-- Walk the chain; return the first broken link (null id => chain OK).
create or replace function public.admin_audit_verify()
returns table(ok boolean, broken_at uuid) language plpgsql stable security definer
set search_path = public as $$
declare r record; expected_prev text := ''; calc text;
begin
  -- The tamper-evident chain covers rows written by the admin RPCs (row_hash set),
  -- ordered by the monotonic seq. Legacy pre-migration rows (row_hash null) are
  -- outside the chain by design.
  for r in select * from public.admin_audit_log where row_hash is not null order by seq asc loop
    calc := public.admin_audit_hash(
      expected_prev,
      public.admin_audit_payload(r.admin_user_id, r.action, r.target_type,
        r.target_id, r."before", r."after", r.created_at));
    if r.row_hash is distinct from calc or r.prev_hash is distinct from nullif(expected_prev,'') then
      ok := false; broken_at := r.id; return next; return;
    end if;
    expected_prev := r.row_hash;
  end loop;
  ok := true; broken_at := null; return next;
end $$;

grant execute on function public.admin_audit_verify() to authenticated;
