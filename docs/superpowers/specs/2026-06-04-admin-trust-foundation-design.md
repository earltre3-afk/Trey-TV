# Admin Control Panel — Wave 1: Trust Foundation

**Status:** Approved design (pending spec review)
**Date:** 2026-06-04
**Author:** Claude + Trey
**Part of:** "Make the admin panel fully functional across the Trey TV platform" — built in waves.

---

## Background

The admin panel already exists: ~21 routes under `AdminShell` (`src/components/layout/AdminShell.tsx`),
most genuinely wired to Supabase (e.g. `admin.users.tsx` performs real ban/suspend/gold/creator
mutations and audit logging; `admin.tsx` pulls live stats via `fetchAdminStats`). This is an
audit-and-complete effort, not a greenfield build.

The full goal — "run the entire platform from the control panel, including all legal and necessary
functions" — spans many subsystems and is decomposed into waves:

| Wave | Theme | Delivers |
|------|-------|----------|
| **1 — Trust foundation** *(this spec)* | Authorization, audit, roles | Server-verified admin actions, granular roles/permissions, tamper-evident audit log |
| 2 — Legal & compliance | The "legal functions" | Real DB + actions for deletion/DMCA/export/retention/consent |
| 3 — Content & moderation | Make it real | Replace mock Content Approval / Videos / Recommendations |
| 4 — Economy | Points & rewards integrity | Ledger integrity, redemptions, payouts, fraud controls |
| 5 — Vertical ops | Tradio / Trance / Games / Music | Broadcast, clip review, archive, studios |
| 6 — Platform config | CMS & ops | Site editor, settings/flags, developer-app oversight, analytics |

## Problem being solved in Wave 1

There are **three inconsistent sources of admin truth** today:

1. **`admin_users` table** (`role`: owner/admin/moderator) — read client-side via
   `useSupabaseSession` (`src/lib/supabase-session.tsx:267-288`), plus an owner-email fallback.
2. **`profiles.role === "admin"`** — used server-side in `src/lib/auth-http.server.ts:72`.
3. **Client-only mock role** — `src/lib/auth.tsx:426` sets
   `isAdmin = role === "admin" || isRealAdmin`, and `signIn("admin")` can set `role="admin"` purely
   in `localStorage` with nothing backing it.

Consequence: the `AdminShell` gate (`if (!isAdmin) return <Navigate to="/login" />`) can be satisfied
by client-only state. The only real protection today is whether the `is_admin()` RLS policies are
airtight, and privileged/destructive mutations run **from the browser client**, not from a
server-verified path. There is also no tamper-evidence on `admin_audit_log` (clients insert directly).

## Goals

- One canonical, DB-backed source of admin identity and permissions.
- Privileged/destructive admin actions execute through a **server-verified** path.
- Granular roles + permissions, enforced server-side.
- **Tamper-evident, append-only** audit log; clients cannot write or alter it.
- Migrate the existing **user-management actions** as the reference implementation for later waves.

## Non-goals (deferred to later waves)

- Wiring legal destructive actions (deletion/DMCA/takedown) — Wave 2.
- Replacing mock Content Approval / Videos / Recommendations — Wave 3.
- Economy, vertical ops, platform CMS — Waves 4-6.
- Any visual/layout redesign of admin screens. Wave 1 changes only the **data path behind existing
  buttons**; behavior and appearance are preserved.

## Chosen architecture

**Hybrid: thin server endpoints + SECURITY DEFINER SQL RPCs.**

Endpoints verify the JWT and admin permission; SQL RPCs perform the mutation and write the audit row
in a single atomic transaction. This reuses both patterns already in the codebase
(`auth-http.server.ts` endpoints and the `tradio_*` legal RPCs) and gives the strongest tamper-evidence.

---

## Design

### 1. Canonical admin identity

`admin_users` is the single authority:

```
admin_users(
  user_id uuid pk references auth.users,
  role text not null check (role in ('owner','admin','moderator','legal')),
  permissions text[] not null default '{}',   -- explicit grants beyond role defaults
  granted_by uuid references auth.users,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz                       -- null = active
)
```

Postgres helper functions (all read **active** rows: `revoked_at is null`):

- `is_admin(uuid) returns boolean` — reconciled to read `admin_users` (currently ambiguous).
- `is_owner(uuid) returns boolean` — role = 'owner'.
- `admin_role(uuid) returns text` — the active role, or null.
- `has_admin_permission(uuid, key text) returns boolean` — true if `key` is in the role's default
  set OR in the row's `permissions[]`.

Server (`auth-http.server.ts`) stops deriving admin from `profiles.role` and uses `admin_users`
(via the service client / `is_admin`). `profiles.role` is no longer load-bearing for admin
determination. (If other code still reads `profiles.role` for display, leave it; it is no longer a
security boundary.)

**Client gate hardening** (`src/lib/auth.tsx`): the production admin gate requires DB-backed
`isRealAdmin`. The mock path (`signIn("admin")`, localStorage `role`) grants admin **only** when the
existing tester/dev flag is on:

```
effectiveIsAdmin = isRealAdmin || ((import.meta.env.DEV || TESTER_ADMIN_AUTOLOGIN) && role === "admin")
```

### 2. Roles & permissions matrix

Permission keys: `users.ban`, `users.gold`, `creators.approve`, `content.moderate`,
`reports.resolve`, `rewards.manage`, `legal.act`, `platform.settings`, `admin.manage`, `audit.read`.

Default role → permissions:

| Permission | owner | admin | moderator | legal |
|---|:--:|:--:|:--:|:--:|
| users.ban | ✓ | ✓ | ✓ | |
| users.gold | ✓ | ✓ | | |
| creators.approve | ✓ | ✓ | | |
| content.moderate | ✓ | ✓ | ✓ | |
| reports.resolve | ✓ | ✓ | ✓ | |
| rewards.manage | ✓ | ✓ | | |
| legal.act | ✓ | | | ✓ |
| platform.settings | ✓ | | | |
| admin.manage | ✓ | | | |
| audit.read | ✓ | ✓ | | ✓ |

Only `owner` can grant/revoke admins (`admin.manage`) and change platform settings
(`platform.settings`). The matrix lives in one shared module so the SQL defaults and a TS mirror stay
in lockstep (single definition, generated/checked).

### 3. Server-side admin API

New `src/lib/admin/admin-http.server.ts` exporting `handleAdminApiRequest(request, env)`, wired into
`handleOAuthApiRequest` in `src/server.ts` under the `/api/admin/*` prefix (same place
`handleAuthSession` etc. are dispatched).

Per-request flow:

1. `getUserFromBearer(request)` — verify Supabase JWT via the service client (reuse the
   `auth-http.server.ts` helper).
2. Resolve `{ role, permissions }` from `admin_users` (service-client read).
3. Check the action's required permission via `has_admin_permission`. Fail → `403`.
4. Call the corresponding SQL RPC with the service client.
5. Return safe JSON. Never leak internals/stack traces. `401` no/invalid/expired JWT; `403`
   insufficient permission; `400` bad input; `200` with the updated record on success.

Wave 1 endpoints (reference implementation — user management):

- `POST /api/admin/users/status` — ban / suspend / reinstate `{ target, status, reason, days? }`
- `POST /api/admin/users/gold` — grant/revoke gold `{ target, value }`
- `POST /api/admin/users/creator` — approve/revoke creator `{ target, status }`

Client helper: `callAdminApi(action, payload)` in `src/lib/admin-api.ts` attaches the current
session's bearer token and POSTs to the endpoint. `src/routes/admin.users.tsx` calls it instead of
writing to Supabase directly. **UI behavior is identical** — same buttons, same toasts, same refetch.

### 4. SECURITY DEFINER RPCs (atomic mutate + audit)

One function per action, e.g.:

- `admin_set_user_status(p_target uuid, p_status text, p_reason text, p_days int)`
- `admin_set_gold(p_target uuid, p_value boolean)`
- `admin_set_creator_status(p_target uuid, p_status text)`

Each function takes an explicit acting-admin id `p_actor uuid` (the service role has no
`auth.uid()`; the endpoint passes the verified caller id). SECURITY DEFINER, `search_path` pinned:

1. Re-checks `has_admin_permission(p_actor, <key>)` — defense in depth even though the endpoint
   already checked.
2. Captures `before` snapshot of the target row.
3. Performs the mutation.
4. Captures `after` snapshot.
5. Inserts the audit row (with hash chain — see §5) in the **same transaction**.
6. Returns the updated row.

### 5. Tamper-evident audit log

Harden `admin_audit_log` (extend the existing table, keep current columns):

Add: `actor_role text`, `ip inet`, `user_agent text`, `before jsonb`, `after jsonb`,
`prev_hash text`, `row_hash text`.

Hash chain, computed inside the RPCs:

```
row_hash = encode(digest(coalesce(prev_hash,'') || canonical_json(payload), 'sha256'), 'hex')
```

where `payload` = the immutable audit fields (actor, action, target, before, after, created_at) and
`prev_hash` = the most recent row's `row_hash`. Append-only chain.

RLS:

- Revoke `insert/update/delete` from `authenticated` and `anon`. Writes happen only inside
  SECURITY DEFINER RPCs / service role.
- `select` allowed to admins with `audit.read`.

Verification: `admin_audit_verify()` re-walks the chain and returns the first broken link (if any).
Surfaced **read-only** on `admin.audit-log.tsx` as an integrity badge ("chain verified" / "tamper
detected at …").

Remove the client-side insert in `logAdminAction` (`src/lib/admin-api.ts`): audit writes now occur
inside the RPCs. `logAdminAction` either becomes a thin reader/no-op or is deleted; callers that were
logging client-side are covered by the RPC writes.

### 6. Testing

- **Endpoint authz:** missing/invalid/expired JWT → 401; valid JWT without permission → 403; valid
  admin → 200 with expected mutation.
- **RPC authz:** non-admin denied; moderator can `users.ban` but not `users.gold`; owner can do all.
- **Audit chain:** sequential actions produce a continuous chain; `admin_audit_verify()` returns OK.
- **Tamper detection:** directly mutating an audit row (as service role in a test) makes
  `admin_audit_verify()` report the broken link.
- **Behavior parity:** `admin.users.tsx` actions produce the same observable result through the new
  path as before (manual verification in-app).

---

## Files touched (anticipated)

- `supabase/migrations/20260604120000_admin_trust_foundation.sql` (timestamp stamped at creation) —
  new: `admin_users` columns/constraints,
  helper functions, RPCs, `admin_audit_log` hardening + RLS, `admin_audit_verify`.
- `src/lib/admin/admin-http.server.ts` — new: `handleAdminApiRequest`.
- `src/server.ts` — wire `/api/admin/*` into `handleOAuthApiRequest`.
- `src/lib/admin/permissions.ts` — new: shared role→permission matrix (TS mirror of SQL).
- `src/lib/admin-api.ts` — add `callAdminApi`; remove/retire client-side `logAdminAction` insert.
- `src/lib/auth-http.server.ts` — admin determination via `admin_users`.
- `src/lib/auth.tsx` — harden `effectiveIsAdmin` gate.
- `src/routes/admin.users.tsx` — call `callAdminApi` instead of direct Supabase writes (behavior
  preserved).
- `src/routes/admin.audit-log.tsx` — read-only integrity badge from `admin_audit_verify`.

## Deployment & guardrails (per project memory rules)

- Migrations apply to the **Trizzy Hub** Supabase project via `supabase db push --linked` (the
  Supabase MCP is mis-connected — do not use it for migrations).
- No commit/push/deploy unless GitHub = earltre3@gmail.com, Supabase = Trizzy Hub,
  Vercel = v0-trey-tv-mvp, workspace = `C:\Users\info\TREY-TV-ANTIGRAVITY`.
- UI changes are limited to the data path behind existing buttons — no layout/visual change — and are
  confirmed before editing any screen (mobile/web app UI hard rule).

## Risks / open questions

- **Owner-email fallback:** `isTreyOwnerEmail` currently grants owner before a DB row exists. Keep it
  as a break-glass for the owner only, but ensure it does not widen access; document it.
- **Service-client availability at the edge:** `getTreyIServiceClient()` must be available in the
  server runtime path that serves `/api/admin/*` (it already serves `/api/auth/*`).
- **`auth.uid()` inside RPCs called via service client:** RPCs must receive the acting admin id
  explicitly (the service role has no `auth.uid()`); endpoints pass it. Defense-in-depth check uses
  the passed id, not `auth.uid()`.
