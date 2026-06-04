# Admin Trust Foundation (Wave 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every privileged admin action run through a server-verified, permission-checked path that writes a tamper-evident audit row, with one canonical DB-backed source of admin identity — migrating the user-management actions as the reference implementation.

**Architecture:** Thin server endpoints (`/api/admin/*` in `src/server.ts`, following `auth-http.server.ts`) verify the caller's Supabase JWT and admin permission, then call `SECURITY DEFINER` Postgres RPCs that perform the mutation and append a hash-chained audit row in one transaction. A shared TS permission matrix mirrors the SQL role→permission defaults. The client calls these endpoints instead of writing to Supabase directly.

**Tech Stack:** TanStack Start (React 19) + Vite; Supabase (Postgres + RLS, `pgcrypto`); Node built-in test runner (`node:test`); Supabase CLI (`supabase db push --linked`) against the **Trizzy Hub** project.

---

## Ground rules for the executor

- **Deploy/account rule (hard):** Only commit/push/apply if GitHub = `earltre3@gmail.com`, Supabase = **Trizzy Hub** (`wcdwlqnfcsuaacbvdmgx`), workspace = `C:\Users\info\TREY-TV-ANTIGRAVITY`. Apply migrations with `supabase db push --linked` — **never** via the Supabase MCP (it's connected to the wrong project).
- **UI rule (hard):** Do not change admin screen layout/visuals. The only UI edits here swap the data path behind existing buttons; behavior and appearance must be identical. Confirm before editing any `.tsx` screen.
- **Concurrent agent:** A second agent may touch this branch. Stage only the specific files each task names; never `git add -A`.
- **SQL testing:** Run SQL assertions inside `begin; … rollback;` against a **local/shadow** Postgres (`supabase start` local stack, or a disposable DB) — never test destructive SQL against Trizzy Hub. Migrations reach Trizzy Hub only after local verification and explicit user go-ahead.
- **Test command pattern (TS):** `node --test <path-to-.test.ts>` (matches existing tests like `src/lib/tradio/callerLogic.test.ts`).

---

## File Structure

**Create:**
- `src/lib/admin/permissions.ts` — shared role list, permission keys, role→permission defaults, `roleHasPermission(role, perm, extraGrants?)`. Single source the SQL mirrors.
- `src/lib/admin/permissions.test.ts` — node:test for the matrix.
- `src/lib/admin/adminActions.ts` — pure mapping `adminActionSpec`: action name → `{ path, method, requiredPermission }`; `requiredPermissionFor(action)`. Shared by endpoint + client.
- `src/lib/admin/adminActions.test.ts` — node:test for the action specs.
- `src/lib/admin/admin-http.server.ts` — `handleAdminApiRequest(request)`: JWT verify → permission check → RPC dispatch → safe JSON.
- `supabase/migrations/20260604120000_admin_identity_permissions.sql` — admin_users columns + `admin_role`/`has_admin_permission` + reconcile `is_admin`.
- `supabase/migrations/20260604120500_admin_audit_hardening.sql` — audit columns, hash chain, RLS, `admin_audit_verify`.
- `supabase/migrations/20260604121000_admin_action_rpcs.sql` — `admin_set_user_status`, `admin_set_gold`, `admin_set_creator_status`.
- `docs/superpowers/notes/admin-live-schema-baseline.md` — captured introspection output (Task 1).

**Modify:**
- `src/server.ts` — dispatch `/api/admin/*` to `handleAdminApiRequest` inside `handleOAuthApiRequest`.
- `src/lib/admin-api.ts` — add `callAdminApi`; retire the client-side `logAdminAction` insert.
- `src/routes/admin.users.tsx` — call `callAdminApi` instead of direct Supabase writes (behavior preserved).
- `src/lib/auth-http.server.ts` — derive admin from `admin_users`, not `profiles.role`.
- `src/lib/auth.tsx` — harden `effectiveIsAdmin` so client-only mock role only grants admin under the dev/tester flag.
- `src/routes/admin.audit-log.tsx` — read-only integrity badge from `admin_audit_verify`.

---

## Task 1: Capture the live schema baseline (read-only)

No code change — produces a reference the later SQL relies on. The CREATE statements for `admin_users`, `admin_audit_log`, `is_admin`, `is_owner` are not in the repo; capture them from Trizzy Hub before writing idempotent SQL.

**Files:**
- Create: `docs/superpowers/notes/admin-live-schema-baseline.md`

- [ ] **Step 1: Confirm the linked project**

Run: `supabase projects list`
Expected: the linked project (●) is **Trizzy Hub** `wcdwlqnfcsuaacbvdmgx`. If not, stop and tell the user.

- [ ] **Step 2: Dump the relevant schema (read-only)**

Run:
```bash
supabase db dump --linked --schema public -f - | \
  grep -iE -A30 "TABLE .*(admin_users|admin_audit_log)|FUNCTION .*(is_admin|is_owner)" \
  > docs/superpowers/notes/admin-live-schema-baseline.md
```
If `db dump` is unavailable, run the introspection SQL via the Supabase SQL editor and paste results into the file:
```sql
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema='public' and table_name in ('admin_users','admin_audit_log')
order by table_name, ordinal_position;

select pg_get_functiondef(p.oid)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('is_admin','is_owner');
```

- [ ] **Step 3: Record assumptions to verify**

Append to the file the columns this plan assumes exist (so the executor can diff):
- `admin_users(user_id uuid, email text, role text)`
- `admin_audit_log(id uuid, admin_user_id uuid, action text, target_type text, target_id text, metadata jsonb, reason text, created_at timestamptz)`

Note any differences. Idempotent SQL below tolerates extra columns; if a **type** differs (e.g. `target_id` is uuid not text), flag it before proceeding.

- [ ] **Step 4: Commit the note**

```bash
git add docs/superpowers/notes/admin-live-schema-baseline.md
git commit -m "docs(admin): capture live admin schema baseline for Wave 1"
```

---

## Task 2: Shared permission matrix (TS)

**Files:**
- Create: `src/lib/admin/permissions.ts`
- Test: `src/lib/admin/permissions.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/admin/permissions.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_ROLES,
  ADMIN_PERMISSIONS,
  ROLE_PERMISSIONS,
  roleHasPermission,
} from "./permissions.ts";

test("owner has every permission", () => {
  for (const perm of ADMIN_PERMISSIONS) {
    assert.equal(roleHasPermission("owner", perm), true, `owner missing ${perm}`);
  }
});

test("moderator can ban but not grant gold", () => {
  assert.equal(roleHasPermission("moderator", "users.ban"), true);
  assert.equal(roleHasPermission("moderator", "users.gold"), false);
});

test("legal can act on legal but not change platform settings", () => {
  assert.equal(roleHasPermission("legal", "legal.act"), true);
  assert.equal(roleHasPermission("legal", "platform.settings"), false);
});

test("only owner can manage admins and platform settings", () => {
  for (const role of ADMIN_ROLES) {
    const expected = role === "owner";
    assert.equal(roleHasPermission(role, "admin.manage"), expected);
    assert.equal(roleHasPermission(role, "platform.settings"), expected);
  }
});

test("extra per-row grants widen a role", () => {
  assert.equal(roleHasPermission("moderator", "users.gold", ["users.gold"]), true);
});

test("ROLE_PERMISSIONS only references declared permission keys", () => {
  for (const perms of Object.values(ROLE_PERMISSIONS)) {
    for (const p of perms) assert.ok(ADMIN_PERMISSIONS.includes(p), `unknown ${p}`);
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test src/lib/admin/permissions.test.ts`
Expected: FAIL (cannot find module `./permissions.ts`).

- [ ] **Step 3: Implement the matrix**

```ts
// src/lib/admin/permissions.ts
export const ADMIN_ROLES = ["owner", "admin", "moderator", "legal"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_PERMISSIONS = [
  "users.ban",
  "users.gold",
  "creators.approve",
  "content.moderate",
  "reports.resolve",
  "rewards.manage",
  "legal.act",
  "platform.settings",
  "admin.manage",
  "audit.read",
] as const;
export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  owner: [...ADMIN_PERMISSIONS],
  admin: [
    "users.ban",
    "users.gold",
    "creators.approve",
    "content.moderate",
    "reports.resolve",
    "rewards.manage",
    "audit.read",
  ],
  moderator: ["users.ban", "content.moderate", "reports.resolve"],
  legal: ["legal.act", "audit.read"],
};

export function roleHasPermission(
  role: AdminRole,
  perm: AdminPermission,
  extraGrants: readonly string[] = [],
): boolean {
  if (ROLE_PERMISSIONS[role]?.includes(perm)) return true;
  return extraGrants.includes(perm);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test src/lib/admin/permissions.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/permissions.ts src/lib/admin/permissions.test.ts
git commit -m "feat(admin): shared role/permission matrix"
```

---

## Task 3: Admin action specs (TS)

Maps each Wave-1 action to its endpoint path + required permission. Shared by the server endpoint and the client helper so they cannot drift.

**Files:**
- Create: `src/lib/admin/adminActions.ts`
- Test: `src/lib/admin/adminActions.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/admin/adminActions.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { ADMIN_ACTIONS, requiredPermissionFor } from "./adminActions.ts";
import { ADMIN_PERMISSIONS } from "./permissions.ts";

test("every action maps to a declared permission and POST path", () => {
  for (const [name, spec] of Object.entries(ADMIN_ACTIONS)) {
    assert.ok(ADMIN_PERMISSIONS.includes(spec.requiredPermission), `${name} bad perm`);
    assert.ok(spec.path.startsWith("/api/admin/"), `${name} bad path`);
    assert.equal(spec.method, "POST");
  }
});

test("requiredPermissionFor resolves known actions and rejects unknown", () => {
  assert.equal(requiredPermissionFor("users.status"), "users.ban");
  assert.equal(requiredPermissionFor("users.gold"), "users.gold");
  assert.equal(requiredPermissionFor("users.creator"), "creators.approve");
  assert.equal(requiredPermissionFor("nope" as never), null);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test src/lib/admin/adminActions.test.ts`
Expected: FAIL (cannot find module `./adminActions.ts`).

- [ ] **Step 3: Implement**

```ts
// src/lib/admin/adminActions.ts
import type { AdminPermission } from "./permissions.ts";

export type AdminActionName = "users.status" | "users.gold" | "users.creator";

export interface AdminActionSpec {
  path: string;
  method: "POST";
  requiredPermission: AdminPermission;
}

export const ADMIN_ACTIONS: Record<AdminActionName, AdminActionSpec> = {
  "users.status": { path: "/api/admin/users/status", method: "POST", requiredPermission: "users.ban" },
  "users.gold": { path: "/api/admin/users/gold", method: "POST", requiredPermission: "users.gold" },
  "users.creator": { path: "/api/admin/users/creator", method: "POST", requiredPermission: "creators.approve" },
};

export function requiredPermissionFor(action: AdminActionName): AdminPermission | null {
  return ADMIN_ACTIONS[action]?.requiredPermission ?? null;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test src/lib/admin/adminActions.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/adminActions.ts src/lib/admin/adminActions.test.ts
git commit -m "feat(admin): action->endpoint->permission specs"
```

---

## Task 4: Migration — admin identity & permission helpers

Idempotent. Adds `admin_users` grant-tracking columns, the `admin_role`/`has_admin_permission` functions, and reconciles `is_admin`/`is_owner` to read **active** `admin_users` rows.

**Files:**
- Create: `supabase/migrations/20260604120000_admin_identity_permissions.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 20260604120000_admin_identity_permissions.sql
-- Canonical admin identity + permission helpers. Idempotent.

alter table public.admin_users add column if not exists permissions text[] not null default '{}';
alter table public.admin_users add column if not exists granted_by uuid references auth.users(id);
alter table public.admin_users add column if not exists granted_at timestamptz not null default now();
alter table public.admin_users add column if not exists revoked_at timestamptz;

-- Role check tolerant of legacy values; allow the four canonical roles.
do $$ begin
  alter table public.admin_users drop constraint if exists admin_users_role_check;
  alter table public.admin_users
    add constraint admin_users_role_check
    check (role in ('owner','admin','moderator','legal'));
exception when others then null; end $$;

create or replace function public.admin_role(p_uid uuid)
returns text language sql stable security definer set search_path = public as $$
  select role from public.admin_users
  where user_id = p_uid and revoked_at is null
  order by case role when 'owner' then 0 when 'admin' then 1 when 'legal' then 2 else 3 end
  limit 1
$$;

-- Role default permissions mirror src/lib/admin/permissions.ts (ROLE_PERMISSIONS).
create or replace function public.admin_role_default_permissions(p_role text)
returns text[] language sql immutable as $$
  select case p_role
    when 'owner' then array['users.ban','users.gold','creators.approve','content.moderate','reports.resolve','rewards.manage','legal.act','platform.settings','admin.manage','audit.read']
    when 'admin' then array['users.ban','users.gold','creators.approve','content.moderate','reports.resolve','rewards.manage','audit.read']
    when 'moderator' then array['users.ban','content.moderate','reports.resolve']
    when 'legal' then array['legal.act','audit.read']
    else array[]::text[]
  end
$$;

create or replace function public.has_admin_permission(p_uid uuid, p_perm text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users
    where user_id = p_uid and revoked_at is null
      and ( p_perm = any(public.admin_role_default_permissions(role))
            or p_perm = any(coalesce(permissions, '{}')) )
  )
$$;

-- Reconcile is_admin / is_owner to the active-row model.
create or replace function public.is_admin(p_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = p_uid and revoked_at is null)
$$;

create or replace function public.is_owner(p_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users
                 where user_id = p_uid and role = 'owner' and revoked_at is null)
$$;

grant execute on function public.is_admin(uuid), public.is_owner(uuid),
  public.admin_role(uuid), public.has_admin_permission(uuid, text) to authenticated, anon;
```

- [ ] **Step 2: Verify locally in a transaction (no live writes)**

Against a local/shadow DB with the baseline schema loaded, run:
```sql
begin;
  -- seed a moderator
  insert into public.admin_users(user_id, email, role)
  values ('00000000-0000-0000-0000-000000000001','mod@test','moderator')
  on conflict (user_id) do update set role='moderator', revoked_at=null;

  do $$ begin
    assert public.is_admin('00000000-0000-0000-0000-000000000001'), 'mod should be admin';
    assert public.has_admin_permission('00000000-0000-0000-0000-000000000001','users.ban'), 'mod can ban';
    assert not public.has_admin_permission('00000000-0000-0000-0000-000000000001','users.gold'), 'mod cannot gold';
    assert not public.is_owner('00000000-0000-0000-0000-000000000001'), 'mod not owner';
  end $$;
rollback;
```
Expected: completes with no `assertion failed` error.

- [ ] **Step 3: Commit (do NOT push to Trizzy Hub yet)**

```bash
git add supabase/migrations/20260604120000_admin_identity_permissions.sql
git commit -m "feat(db): canonical admin identity + permission helpers"
```

---

## Task 5: Migration — audit log hardening + hash chain + verify

**Files:**
- Create: `supabase/migrations/20260604120500_admin_audit_hardening.sql`

- [ ] **Step 1: Write the migration**

```sql
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

-- Canonical payload + hash used by the RPCs (Task 6).
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
  for r in select * from public.admin_audit_log order by created_at asc, id asc loop
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
```

- [ ] **Step 2: Verify locally**

Against local/shadow DB:
```sql
begin;
  select * from public.admin_audit_verify(); -- expect ok=true on a fresh/empty or consistent log
rollback;
```
Expected: a single row `ok=t, broken_at=NULL` (full chain test happens in Task 7 once rows exist).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260604120500_admin_audit_hardening.sql
git commit -m "feat(db): tamper-evident append-only admin audit log"
```

---

## Task 6: Migration — SECURITY DEFINER action RPCs (mutate + audit atomically)

**Files:**
- Create: `supabase/migrations/20260604121000_admin_action_rpcs.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 20260604121000_admin_action_rpcs.sql
-- Privileged admin mutations: permission re-check + mutation + audit in one txn.

create or replace function public._admin_write_audit(
  p_actor uuid, p_actor_role text, p_action text,
  p_target_type text, p_target_id text, p_before jsonb, p_after jsonb, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_prev text; v_now timestamptz := now(); v_payload text; v_hash text;
begin
  select row_hash into v_prev from public.admin_audit_log
    order by created_at desc, id desc limit 1;
  v_payload := public.admin_audit_payload(p_actor, p_action, p_target_type, p_target_id, p_before, p_after, v_now);
  v_hash := public.admin_audit_hash(v_prev, v_payload);
  insert into public.admin_audit_log
    (admin_user_id, action, target_type, target_id, reason, actor_role,
     "before", "after", prev_hash, row_hash, created_at)
  values (p_actor, p_action, p_target_type, p_target_id, p_reason, p_actor_role,
          p_before, p_after, v_prev, v_hash, v_now);
end $$;

create or replace function public.admin_set_user_status(
  p_actor uuid, p_target uuid, p_status text, p_reason text, p_days int default null)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare v_before jsonb; v_after public.profiles; v_until timestamptz;
begin
  if not public.has_admin_permission(p_actor, 'users.ban') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_status not in ('active','suspended','banned') then
    raise exception 'bad status' using errcode = '22023';
  end if;
  select to_jsonb(p.*) into v_before from public.profiles p where p.id = p_target;
  if v_before is null then raise exception 'not found' using errcode = 'P0002'; end if;
  v_until := case when p_days is not null then now() + make_interval(days => p_days) end;
  update public.profiles set
    status = p_status,
    ban_reason = case when p_status='active' then null else p_reason end,
    banned_at = case when p_status='active' then null else now() end,
    banned_until = case when p_status='active' then null else v_until end
  where id = p_target returning * into v_after;
  perform public._admin_write_audit(p_actor, public.admin_role(p_actor),
    'user_'||p_status, 'user', p_target::text, v_before, to_jsonb(v_after), p_reason);
  return v_after;
end $$;

create or replace function public.admin_set_gold(
  p_actor uuid, p_target uuid, p_value boolean)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare v_before jsonb; v_after public.profiles;
begin
  if not public.has_admin_permission(p_actor, 'users.gold') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select to_jsonb(p.*) into v_before from public.profiles p where p.id = p_target;
  if v_before is null then raise exception 'not found' using errcode = 'P0002'; end if;
  update public.profiles set
    gold_verified = p_value,
    gold_verified_at = case when p_value then now() else null end,
    gold_verified_by = case when p_value then p_actor else null end
  where id = p_target returning * into v_after;
  perform public._admin_write_audit(p_actor, public.admin_role(p_actor),
    case when p_value then 'gold_granted' else 'gold_revoked' end,
    'user', p_target::text, v_before, to_jsonb(v_after), null);
  return v_after;
end $$;

create or replace function public.admin_set_creator_status(
  p_actor uuid, p_target uuid, p_status text)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare v_before jsonb; v_after public.profiles;
begin
  if not public.has_admin_permission(p_actor, 'creators.approve') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_status not in ('approved','revoked') then
    raise exception 'bad status' using errcode = '22023';
  end if;
  select to_jsonb(p.*) into v_before from public.profiles p where p.id = p_target;
  if v_before is null then raise exception 'not found' using errcode = 'P0002'; end if;
  update public.profiles set creator_status = p_status
  where id = p_target returning * into v_after;
  perform public._admin_write_audit(p_actor, public.admin_role(p_actor),
    'creator_'||p_status, 'user', p_target::text, v_before, to_jsonb(v_after), null);
  return v_after;
end $$;

-- Service-role-only execution (endpoints call via service client).
revoke execute on function
  public.admin_set_user_status(uuid,uuid,text,text,int),
  public.admin_set_gold(uuid,uuid,boolean),
  public.admin_set_creator_status(uuid,uuid,text)
from public, anon, authenticated;
```

- [ ] **Step 2: Verify locally (permission + audit chain)**

Against local/shadow DB with `profiles` + an admin seeded:
```sql
begin;
  insert into public.admin_users(user_id,email,role)
    values ('00000000-0000-0000-0000-0000000000aa','owner@test','owner')
    on conflict (user_id) do update set role='owner', revoked_at=null;
  insert into public.profiles(id, username, email, status)
    values ('00000000-0000-0000-0000-0000000000bb','t','t@t','active')
    on conflict (id) do nothing;

  perform public.admin_set_user_status('00000000-0000-0000-0000-0000000000aa',
    '00000000-0000-0000-0000-0000000000bb','banned','spam',null);
  perform public.admin_set_gold('00000000-0000-0000-0000-0000000000aa',
    '00000000-0000-0000-0000-0000000000bb', true);

  do $$ declare v record; begin
    select * into v from public.admin_audit_verify();
    assert v.ok, 'audit chain must verify after two actions';
  end $$;

  -- moderator cannot grant gold
  insert into public.admin_users(user_id,email,role)
    values ('00000000-0000-0000-0000-0000000000cc','mod@test','moderator')
    on conflict (user_id) do update set role='moderator', revoked_at=null;
  do $$ begin
    begin
      perform public.admin_set_gold('00000000-0000-0000-0000-0000000000cc',
        '00000000-0000-0000-0000-0000000000bb', true);
      assert false, 'moderator gold should have raised';
    exception when sqlstate '42501' then null; end;
  end $$;
rollback;
```
Expected: completes with no assertion failure.

- [ ] **Step 3: Verify tamper detection**

```sql
begin;
  -- (seed + one action as above) then corrupt a row and expect a broken link
  update public.admin_audit_log set "after" = '{"tampered":true}'::jsonb
    where id = (select id from public.admin_audit_log order by created_at desc limit 1);
  do $$ declare v record; begin
    select * into v from public.admin_audit_verify();
    assert not v.ok, 'tampered row must break the chain';
  end $$;
rollback;
```
Expected: completes with no assertion failure (i.e. `ok` was false as expected).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260604121000_admin_action_rpcs.sql
git commit -m "feat(db): security-definer admin action RPCs with atomic audit"
```

---

## Task 7: Apply migrations to Trizzy Hub (gated)

- [ ] **Step 1: Get explicit user go-ahead**

Confirm with the user: "Apply the three Wave-1 migrations to Trizzy Hub now?" Do not proceed without a yes.

- [ ] **Step 2: Push**

Run: `supabase db push --linked`
Expected: the three `20260604120000/120500/121000` migrations apply cleanly.

- [ ] **Step 3: Smoke-check on Trizzy Hub (read-only)**

```sql
select public.is_admin(auth.uid()); -- as the owner account, expect true
select * from public.admin_audit_verify(); -- expect ok=true
```

---

## Task 8: Server endpoint module

**Files:**
- Create: `src/lib/admin/admin-http.server.ts`

- [ ] **Step 1: Implement the handler**

Mirror `src/lib/auth-http.server.ts` (bearer verification via `getTreyIServiceClient`).

```ts
// src/lib/admin/admin-http.server.ts
import { getTreyIServiceClient } from "@/lib/trey-i/onboarding.server";
import { ADMIN_ACTIONS, type AdminActionName } from "@/lib/admin/adminActions";
import { roleHasPermission, type AdminRole } from "@/lib/admin/permissions";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function getUserFromBearer(request: Request) {
  const bearer = (request.headers.get("authorization") ?? "").match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!bearer) return null;
  try {
    const { data, error } = await getTreyIServiceClient().auth.getUser(bearer);
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

async function loadAdmin(userId: string): Promise<{ role: AdminRole; permissions: string[] } | null> {
  const { data } = await getTreyIServiceClient()
    .from("admin_users")
    .select("role, permissions, revoked_at")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .maybeSingle();
  if (!data?.role) return null;
  return { role: data.role as AdminRole, permissions: (data.permissions as string[]) ?? [] };
}

// Maps "/api/admin/users/status" -> action name. Returns null if unknown.
function actionForPath(pathname: string): AdminActionName | null {
  for (const [name, spec] of Object.entries(ADMIN_ACTIONS)) {
    if (spec.path === pathname) return name as AdminActionName;
  }
  return null;
}

async function dispatch(action: AdminActionName, actorId: string, body: any) {
  const svc = getTreyIServiceClient();
  switch (action) {
    case "users.status":
      return svc.rpc("admin_set_user_status", {
        p_actor: actorId, p_target: body.target, p_status: body.status,
        p_reason: body.reason ?? null, p_days: body.days ?? null,
      });
    case "users.gold":
      return svc.rpc("admin_set_gold", { p_actor: actorId, p_target: body.target, p_value: !!body.value });
    case "users.creator":
      return svc.rpc("admin_set_creator_status", {
        p_actor: actorId, p_target: body.target, p_status: body.status,
      });
  }
}

export async function handleAdminApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/admin/")) return null;
  if (request.method === "OPTIONS") return json({});
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const action = actionForPath(url.pathname);
  if (!action) return json({ error: "Unknown admin action." }, 404);

  const user = await getUserFromBearer(request);
  if (!user) return json({ error: "Not authenticated." }, 401);

  const admin = await loadAdmin(user.id);
  if (!admin) return json({ error: "Forbidden." }, 403);

  const required = ADMIN_ACTIONS[action].requiredPermission;
  if (!roleHasPermission(admin.role, required, admin.permissions)) {
    return json({ error: "Forbidden." }, 403);
  }

  let body: any;
  try { body = await request.json(); } catch { return json({ error: "Bad request." }, 400); }
  if (!body?.target) return json({ error: "Missing target." }, 400);

  const { data, error } = (await dispatch(action, user.id, body)) ?? { data: null, error: null };
  if (error) {
    const status = (error as any).code === "42501" ? 403 : 400;
    return json({ error: "Action failed." }, status);
  }
  return json({ ok: true, record: data });
}
```

- [ ] **Step 2: Typecheck/lint the new file**

Run: `npx eslint src/lib/admin/admin-http.server.ts`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/admin/admin-http.server.ts
git commit -m "feat(admin): server-verified /api/admin endpoint handler"
```

---

## Task 9: Wire `/api/admin/*` into the server

**Files:**
- Modify: `src/server.ts` (inside `handleOAuthApiRequest`, alongside the other `handle*ApiRequest` calls near lines 46-62)

- [ ] **Step 1: Add the import**

Add near the other server imports (after line 10):
```ts
import { handleAdminApiRequest } from "./lib/admin/admin-http.server";
```

- [ ] **Step 2: Dispatch early in `handleOAuthApiRequest`**

Immediately after `const url = new URL(request.url);` in `handleOAuthApiRequest`, add:
```ts
  const adminResponse = await handleAdminApiRequest(request);
  if (adminResponse) return adminResponse;
```

- [ ] **Step 3: Manual verification**

With the dev server warm, run:
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/admin/users/gold \
  -H "content-type: application/json" -d '{"target":"x","value":true}'
```
Expected: `401` (no bearer) — proves the route is wired and rejects unauthenticated callers.

- [ ] **Step 4: Commit**

```bash
git add src/server.ts
git commit -m "feat(server): route /api/admin/* to admin handler"
```

---

## Task 10: Client helper + retire client-side audit insert

**Files:**
- Modify: `src/lib/admin-api.ts`

- [ ] **Step 1: Add `callAdminApi` and retire `logAdminAction`'s insert**

Add to `src/lib/admin-api.ts`:
```ts
import { ADMIN_ACTIONS, type AdminActionName } from "@/lib/admin/adminActions";

export async function callAdminApi(action: AdminActionName, payload: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return { error: "Not authenticated." };
  const res = await fetch(ADMIN_ACTIONS[action].path, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { error: (body as any).error ?? `Request failed (${res.status}).` };
  return { record: (body as any).record };
}
```

Replace the body of `logAdminAction` so it no longer inserts client-side (audit is now written by the RPCs). Keep the export to avoid breaking imports:
```ts
export async function logAdminAction(_params: {
  action: string; target_type?: string; target_id?: string;
  metadata?: Record<string, any>; reason?: string;
}) {
  // Audit rows are written server-side inside the admin RPCs (tamper-evident chain).
  // Retained as a no-op so existing callers compile; remove callers in their own waves.
  return { error: undefined as string | undefined };
}
```

- [ ] **Step 2: Lint**

Run: `npx eslint src/lib/admin-api.ts`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/admin-api.ts
git commit -m "feat(admin): callAdminApi helper; audit now server-written"
```

---

## Task 11: Migrate `admin.users.tsx` to the server path (behavior-preserving)

**Files:**
- Modify: `src/routes/admin.users.tsx` (the `ban`, `unban`, `toggleGold`, `toggleCreator` handlers, ~lines 49-125)

- [ ] **Step 1: Replace direct Supabase writes with `callAdminApi`**

Import: `import { callAdminApi } from "@/lib/admin-api";` (and drop the now-unused `logAdminAction` import if unused).

`ban`:
```ts
  const ban = async (u: any, days: number | null) => {
    const reason = prompt(
      days ? `Suspend @${u.username} for ${days}d. Reason:` : `Ban @${u.username}. Reason:`,
    );
    if (reason === null) return;
    const { error } = await callAdminApi("users.status", {
      target: u.id, status: days ? "suspended" : "banned", reason, days,
    });
    if (error) return toast.error(error);
    toast.success(days ? `Suspended for ${days}d` : "User banned");
    refetch();
  };
```

`unban`:
```ts
  const unban = async (u: any) => {
    const { error } = await callAdminApi("users.status", {
      target: u.id, status: "active", reason: null, days: null,
    });
    if (error) return toast.error(error);
    toast.success("Reinstated");
    refetch();
  };
```

`toggleGold`:
```ts
  const toggleGold = async (u: any) => {
    const { error } = await callAdminApi("users.gold", { target: u.id, value: !u.gold_verified });
    if (error) return toast.error(error);
    toast.success(!u.gold_verified ? "Gold granted" : "Gold revoked");
    refetch();
  };
```

`toggleCreator`:
```ts
  const toggleCreator = async (u: any) => {
    const next = u.creator_status === "approved" ? "revoked" : "approved";
    const { error } = await callAdminApi("users.creator", { target: u.id, status: next });
    if (error) return toast.error(error);
    toast.success(next === "approved" ? "Creator approved" : "Creator revoked");
    refetch();
  };
```

- [ ] **Step 2: Confirm no visual/JSX change**

Run: `git diff src/routes/admin.users.tsx`
Expected: only the four handler bodies + imports changed; **no JSX/markup changes**.

- [ ] **Step 3: Manual end-to-end check (warm dev server, signed in as owner)**

In the app, ban then reinstate a test user; toggle gold; toggle creator. Each shows the same toast and list refresh as before. Then on `/admin/audit-log` confirm new rows appeared and the integrity badge (Task 13) reads "verified".

- [ ] **Step 4: Commit**

```bash
git add src/routes/admin.users.tsx
git commit -m "feat(admin): user actions go through server-verified API"
```

---

## Task 12: Reconcile server + client admin determination

**Files:**
- Modify: `src/lib/auth-http.server.ts` (the `is_admin` derivations at lines ~72 and ~114)
- Modify: `src/lib/auth.tsx` (line ~426)

- [ ] **Step 1: Server — derive admin from `admin_users`**

In `handleAuthSession` and `handleAuthMe`, after loading `profile`, replace `is_admin: profile?.role === "admin"` with an `admin_users` lookup:
```ts
    const { data: adminRow } = await service
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .is("revoked_at", null)
      .maybeSingle();
    const isAdmin = !!adminRow?.role;
```
and use `is_admin: isAdmin` in the JSON. (Leave `role: profile?.role` as-is for display.)

- [ ] **Step 2: Client — harden the admin gate**

In `src/lib/auth.tsx`, change line ~426:
```ts
  // Real DB-backed admin only; mock role grants admin solely in dev/tester builds.
  const allowMockAdmin = import.meta.env.DEV || import.meta.env.VITE_TESTER_ADMIN_AUTOLOGIN === "true";
  const effectiveIsAdmin = isRealAdmin || (allowMockAdmin && role === "admin");
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/lib/auth-http.server.ts src/lib/auth.tsx`
Expected: no errors.

- [ ] **Step 4: Manual check**

In a production-like build (`VITE_TESTER_ADMIN_AUTOLOGIN` unset), confirm a non-admin session cannot reach `/admin` (gate redirects). In dev, the tester admin still works.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth-http.server.ts src/lib/auth.tsx
git commit -m "feat(auth): single admin_users source; harden client admin gate"
```

---

## Task 13: Audit-log integrity badge (read-only)

**Files:**
- Modify: `src/routes/admin.audit-log.tsx`

- [ ] **Step 1: Add a verify query + badge**

Add near the existing audit queries:
```ts
  const { data: integrity } = useQuery({
    queryKey: ["admin", "audit-verify"],
    queryFn: async () => {
      const { data } = await supabase.rpc("admin_audit_verify");
      const row = Array.isArray(data) ? data[0] : data;
      return row as { ok: boolean; broken_at: string | null } | null;
    },
    refetchInterval: 60000,
  });
```
Render a small read-only badge in the existing header area (match current styling; no layout overhaul):
```tsx
  {integrity && (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full border ${
        integrity.ok
          ? "border-emerald-400/40 text-emerald-300"
          : "border-rose-400/40 text-rose-300"
      }`}
    >
      {integrity.ok ? "Audit chain verified" : `Tamper detected @ ${integrity.broken_at}`}
    </span>
  )}
```

- [ ] **Step 2: Confirm minimal diff**

Run: `git diff src/routes/admin.audit-log.tsx`
Expected: one query + one badge span; no restructuring of the page.

- [ ] **Step 3: Manual check**

`/admin/audit-log` shows "Audit chain verified" after Task 11 actions.

- [ ] **Step 4: Commit**

```bash
git add src/routes/admin.audit-log.tsx
git commit -m "feat(admin): audit-log integrity badge from admin_audit_verify"
```

---

## Self-Review

**Spec coverage:**
- Canonical identity → Tasks 4, 12. Roles/permissions matrix → Tasks 2, 4. Server-side admin API (hybrid) → Tasks 8, 9, 6. SECURITY DEFINER RPCs (atomic mutate+audit) → Task 6. Tamper-evident audit + `admin_audit_verify` → Tasks 5, 13. Client gate hardening → Task 12. Migrate user-management as reference → Tasks 10, 11. Testing → Tasks 2, 3 (TS), 4-6 (SQL assertions), 9/11/12/13 (manual). Deploy gating → Task 7. **No spec section is unaddressed.**

**Placeholder scan:** No TBD/TODO; every code/SQL step is concrete. The `logAdminAction` no-op is intentional and documented.

**Type consistency:** `AdminRole`/`AdminPermission` (Task 2) reused in Tasks 3 & 8. `AdminActionName` + `ADMIN_ACTIONS` (Task 3) reused in Tasks 8, 10, 11. RPC names/params (`admin_set_user_status(p_actor,p_target,p_status,p_reason,p_days)`, `admin_set_gold(p_actor,p_target,p_value)`, `admin_set_creator_status(p_actor,p_target,p_status)`) match between Task 6 (definitions) and Task 8 (`svc.rpc` calls). `admin_audit_payload`/`admin_audit_hash` signatures match between Tasks 5 and 6. `admin_audit_verify()` return shape `{ok, broken_at}` matches between Tasks 5, 6, and 13.

**Known risk to watch during execution:** the SQL assumes `profiles` columns `status, ban_reason, banned_at, banned_until, gold_verified, gold_verified_at, gold_verified_by, creator_status` (all used today by `admin.users.tsx`) and that `target_id` is text. Task 1 verifies these against Trizzy Hub before Task 7 applies anything.
