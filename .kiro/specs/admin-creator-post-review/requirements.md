# Requirements: Admin Review UI — creator_post_queue

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Scope:** Wire the existing Lovable admin content-approval UI to real `creator_post_queue` data. Admin can read submissions and update `approval_status` + `admin_notes` via a server function. No redesign. No payouts. No Stripe. No Edit Studio.

---

## 1. Goal

The admin content-approval pages (`/admin/content-approval` and `/admin/content-approval/$id`) already exist in the Lovable shell with full UI — cards, filters, checklist, approve/reject/needs-changes buttons, feedback textarea, internal note textarea. They currently read from `submissions-store` (mock). This spec wires them to real `creator_post_queue` data.

---

## 2. Security Boundary — Non-Negotiable

| Rule | Detail |
|---|---|
| `isAdmin` / `AdminShell` is visual-only | The browser `isAdmin` flag reads from `localStorage` (mock-based). It is a UI convenience gate only — it does not authorize any server-side action |
| Service-role key stays server-side | `creator_post_queue` has no admin RLS policy — admin SELECT/UPDATE requires the service-role client inside a `createServerFn` handler |
| No `VITE_SUPABASE_SERVICE_ROLE_KEY` | A `VITE_*` or `NEXT_PUBLIC_*` prefix exposes the value to the browser — the service-role key must never use either prefix |
| Auth client first, service-role second | Every server function verifies the caller with the normal anon/auth client before constructing the service-role client. The service-role client is never used to return or update data before authorization passes |
| Server-side admin identity check | After confirming the user is authenticated, the server function checks admin identity against a server-only source: `profiles.role = 'admin'` (DB) or `ADMIN_EMAILS` env var allowlist (see §4) |
| Unauthorized callers get a safe error | Any unauthenticated or non-admin call throws `'Admin access required'` — no queue data is returned |
| Creators cannot approve their own content | Server function checks `queue.creator_id !== adminUser.id` before approving |
| `admin_notes` is admin-only | Written and read only in admin server functions — never returned to creator-facing hooks |
| `profiles.is_creator` not used | Column does not exist |

### Why service-role is required

The `creator_post_queue` RLS policies only cover creator-owned rows (`creator_id = auth.uid()`). There is no admin SELECT/UPDATE policy. The admin client (service-role) bypasses RLS and can read all rows. This is the same pattern used in RESTORE's `getAdminCreatorPostQueue()`.

The service-role key must live in a `createServerFn` handler — the same pattern already established by `upload.server.ts`.

---

## 3. Schema Verification

### `creator_post_queue` — all fields, admin view

| Column | Admin can read? | Admin can write? | Notes |
|---|---|---|---|
| `id` | ✅ | ❌ | Queue row UUID |
| `creator_id` | ✅ | ❌ | Creator's auth UID |
| `edit_project_id` | ✅ | ❌ | Links to `creator_edit_projects` |
| `channel_id` | ✅ | ❌ | Creator's channel |
| `show_id` | ✅ | ❌ | Show reference |
| `episode_number` | ✅ | ❌ | Episode number |
| `title` | ✅ | ❌ | Creator-supplied |
| `description` | ✅ | ❌ | Creator-supplied |
| `stream_uid` | ✅ | ❌ | Cloudflare Stream UID |
| `thumbnail_url` | ✅ | ❌ | Creator-supplied |
| `visibility` | ✅ | ❌ | Creator-supplied |
| `is_plus_content` | ✅ | ❌ | Creator-supplied |
| `scheduled_at` | ✅ | ❌ | Creator-supplied |
| `approval_status` | ✅ | ✅ | Admin sets: `pending` / `approved` / `rejected` / `needs_changes` |
| `admin_notes` | ✅ | ✅ | Admin-only — visible in admin UI, never in creator-facing hooks |
| `created_at` | ✅ | ❌ | Auto |
| `updated_at` | ✅ | ❌ | Auto via trigger |

### `approval_status` valid values (DB constraint)

```
'pending' | 'approved' | 'rejected' | 'needs_changes'
```

### Side effect on `creator_edit_projects` after approval decision

When `approval_status` is updated, the linked `creator_edit_projects` row should also be updated:

| `approval_status` | `creator_edit_projects.status` |
|---|---|
| `'approved'` | `'published'` |
| `'rejected'` | `'rejected'` |
| `'needs_changes'` | `'ready'` |
| `'pending'` | `'submitted'` |

This mirrors the RESTORE pattern. The `creator_edit_projects` UPDATE uses the same service-role client inside the same server function — no separate call needed.

### Approval validation rules (from RESTORE reference)

Before setting `approval_status = 'approved'`:
- `title` must be non-empty
- `stream_uid` must be non-empty
- `episode_number` must be a positive integer
- `channel_id` must be present
- `show_id` must be present
- `edit_project_id` must be present
- If `episode_number` is 1 or 2, `is_plus_content` must be `false`
- Admin cannot approve their own content (`creator_id !== admin's auth.uid()`)

For `rejected` or `needs_changes`: `admin_notes` must be non-empty.

---

## 4. Admin Authorization

`isAdmin` in the Lovable app reads `role === 'admin'` from `localStorage`. `AdminShell` uses this as a visual gate (redirects to `/login`). **This is not a security boundary** — it is a UI convenience only. Any user who bypasses the UI can still call server functions.

Real admin authorization happens server-side in every server function, in this order:

1. **Authenticate** — call `supabase.auth.getUser(accessToken)` with the normal anon/auth client. If this fails, throw `'Admin access required'` immediately. The service-role client is not constructed yet.
2. **Authorize** — check admin identity against a server-only source:
   - **Primary:** `profiles.role = 'admin'` for the authenticated user's ID (queried with the auth client, not service-role).
   - **Fallback:** If `profiles.role` is not reliable or not yet populated, check `ADMIN_EMAILS` — a server-only env var (no `VITE_*` prefix) containing a comma-separated list of authorized admin email addresses. The authenticated user's email must be in this list.
3. **Construct service-role client** — only after step 2 passes. The service-role client is never constructed before authorization succeeds.

### Required env vars for admin authorization

| Variable | Purpose | Exposed to browser? |
|---|---|---|
| `ADMIN_EMAILS` | Comma-separated admin email allowlist (fallback) | ❌ Never — no `VITE_*` prefix |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role client for bypassing RLS | ❌ Never — no `VITE_*` prefix |

If neither `profiles.role = 'admin'` nor `ADMIN_EMAILS` is configured, the server function throws `'Admin not configured'` — no queue data is returned.

---

## 5. Functional Requirements

### FR-1: New server function — `getAdminPostQueue`

Create `src/lib/admin/post-queue.server.ts`.

- `createServerFn` that accepts `{ accessToken: string }`.
- Verifies caller is authenticated and has `profiles.role = 'admin'`.
- Uses service-role Supabase client to SELECT all `creator_post_queue` rows (no `creator_id` filter — admin sees all).
- Does NOT select `admin_notes` in the list view — only in the detail view (FR-2).
- Returns `AdminQueueItem[]` ordered by `created_at DESC`, limit 100.
- On auth failure: throws `'Admin access required'`.
- On missing env: throws `'Admin not configured'`.

### FR-2: New server function — `getAdminPostQueueItem`

Same file. Accepts `{ accessToken: string; queueId: string }`.

- Verifies admin.
- SELECTs single row by `id` including `admin_notes`.
- Returns `AdminQueueItemDetail | null`.

### FR-3: New server function — `reviewAdminPostQueue`

Same file. Accepts `{ accessToken: string; queueId: string; approvalStatus: string; adminNotes: string }`.

- Verifies admin.
- Validates `approvalStatus` is one of the four valid values.
- Validates `adminNotes` is non-empty when `approvalStatus` is `'rejected'` or `'needs_changes'`.
- Runs approval validation checks when `approvalStatus` is `'approved'` (title, stream_uid, episode_number, channel_id, show_id, edit_project_id, plus-content rule, own-content rule).
- UPDATEs `creator_post_queue` row: `approval_status`, `admin_notes`.
- UPDATEs linked `creator_edit_projects` row: `status` (mapped from approval_status).
- Returns `{ ok: true }` on success.
- Throws descriptive error on validation failure or DB error.

### FR-4: New hook — `useAdminPostQueue`

Create `src/hooks/use-admin-post-queue.ts`.

- Calls `getAdminPostQueue` server function on mount.
- Gated on `useAuth().isAdmin` — no call if not admin.
- Returns `{ items: AdminQueueItem[]; loading: boolean; reload: () => void }`.
- `reload()` re-fetches the list (called after a review action succeeds).

### FR-5: Wire `admin.content-approval.tsx`

Replace `useSubmissions()` with `useAdminPostQueue()`. Map `AdminQueueItem` to `Submission` shape for the existing card/row components.

The existing approve/reject/needs-changes button handlers currently call `store.approve()` / `store.reject()` / `store.requestChanges()` — replace with calls to `reviewAdminPostQueue` server function, then call `reload()`.

### FR-6: Wire `admin.content-approval.$id.tsx`

On mount, call `getAdminPostQueueItem` to load the full detail including `admin_notes`.

The existing action buttons (Approve, Request Changes, Reject, Schedule) call `store.*` methods — replace with `reviewAdminPostQueue` server function calls.

The "Internal admin note" textarea maps to `admin_notes` (not `admin_internal_note` — that is a mock field).

The "Public feedback to creator" textarea maps to `admin_notes` as well (there is no separate creator-visible notes field in the schema — `admin_notes` is the single notes field).

### FR-7: Visual preservation

- `admin.content-approval.tsx` layout, stat tiles, filter chips, search bar, and card grid are structurally unchanged.
- `admin.content-approval.$id.tsx` layout, checklist, notes textareas, and action bar are structurally unchanged.
- No new UI elements.
- No Lovable component replaced.

### FR-8: `submissions-store` preserved

- `submissions-store.tsx` is not modified or deleted.
- The admin routes stop reading from it, but it remains for the creator-facing submit flow.

### FR-9: Graceful error handling

- If `getAdminPostQueue` fails: show empty state (existing "Nothing here" UI).
- If `reviewAdminPostQueue` fails: `toast.error(err.message)` — no crash.
- If admin env vars missing: `toast.error('Admin not configured')`.

---

## 6. Required Environment Variables

| Variable | Where set | Exposed to browser? |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + Cloudflare Workers secret | ❌ Never — no `VITE_*` prefix |
| `ADMIN_EMAILS` | `.env.local` + Cloudflare Workers secret | ❌ Never — no `VITE_*` prefix |

`VITE_SUPABASE_URL` is already set and is reused inside the server function to construct the service-role client. The service-role key itself must never use a `VITE_*` prefix.

---

## 7. Non-Functional Requirements

- **Build safety:** Every change must pass `pnpm tsc --noEmit` and `pnpm build`.
- **No browser validation:** No Playwright, no screenshots, no Read URL checks.
- **No new dependencies.**
- **No redesign.**
- **Rollback:** Restore `useSubmissions()` in both admin routes. The server function file can remain — it is not called if not imported.

---

## 8. Out of Scope

- Episode publishing to the public feed after approval (separate future lane)
- Cloudflare Stream playback in admin review
- Creator notifications on approval/rejection (server-side trigger — future lane)
- Admin user management / role assignment
- Edit Studio / export features
- Payments / Stripe / creator payouts
