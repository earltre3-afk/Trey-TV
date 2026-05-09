# Lovable Backend Migration — Current State Checkpoint

**Project:** TREY-TV-ANTIGRAVITY  
**Branch:** `lovable-shell-backend-wiring`  
**Date:** 2026-05-09  
**Build status:** `pnpm tsc --noEmit` ✅ · `pnpm build` ✅  
**Browser validation:** intentionally skipped by user preference — terminal/code validation only unless explicitly requested.

---

## 1. What Is Real (Supabase-backed, build-safe)

| Feature | Hook / File | Table(s) |
|---|---|---|
| Supabase client + env | `src/lib/supabase-browser.ts`, `src/lib/backend-env.ts` | — |
| Auth session | `src/hooks/use-auth.ts` | Supabase Auth |
| Current user profile bridge | `src/hooks/use-current-user.ts` + `src/components/CurrentUserSync.tsx` | `profiles` |
| Feed posts | `src/hooks/use-posts.ts` | `user_posts` |
| Public profiles | `src/hooks/use-profile.ts` | `profiles` |
| Post reactions / likes | `src/hooks/use-supabase-reactions.ts` | `user_post_reactions` |
| Comments | `src/lib/comments-store.tsx` | `user_post_comments` |
| Follows | `src/lib/follow-store.tsx` | `follows` |
| Edit Profile | `src/routes/edit-profile.tsx` | `profiles` |
| Inbox / DMs | `src/lib/messages-store.tsx` | `direct_messages` |
| Notifications | `src/hooks/use-notifications.ts` + `src/components/layout/NotificationsPopover.tsx` | `notifications` |
| Rewards (read-only) | `src/hooks/use-rewards.ts` + `src/routes/rewards.tsx` | `community_credit_balances`, `community_credit_events` |
| Creator Studio dashboard | `src/hooks/use-creator-studio.ts` + `creator-studio.index.tsx` | `channels`, `shows`, `episodes` |
| Creator Studio metadata drafts | `src/hooks/use-creator-submit.ts` + `creator-studio.submit.tsx` | `creator_edit_projects` |
| Creator Studio Cloudflare upload | `src/lib/creator-studio/upload.server.ts` + `src/hooks/use-cloudflare-upload.ts` + `creator-studio.edit.tsx` | `creator_edit_projects` (`stream_uid` field) |
| Creator Studio post queue (write) | `src/hooks/use-creator-submit.ts` | `creator_post_queue` |
| Creator Studio post queue (read-back) | `src/hooks/use-creator-post-queue.ts` + `creator-studio.submissions.tsx` | `creator_post_queue` |

---

## 2. Supabase Tables Wired

```
profiles
user_posts
user_post_reactions
user_post_comments
follows
direct_messages
notifications
community_credit_balances
community_credit_events
channels
shows
episodes
creator_edit_projects
creator_post_queue
```

---

## 3. Creator Studio Flow — Full Status

### 3a. Read-only dashboard
- Access gate: `channels.owner_email` matched against `supabase.auth.getUser()` email.
- `profiles.is_creator` not used — column does not exist in current schema.
- Browser SELECT only on `channels`, `shows`, `episodes`.
- Fan list and fan count use safe mock fallback.
- Metric cards remain hardcoded.

### 3b. Metadata drafts — `creator_edit_projects`
- `useCreatorSubmit.saveDraft()` INSERT/UPDATE on `creator_edit_projects`.
- `useCreatorSubmit.submitForReview()` UPDATE `status = 'submitted'`.
- `submissions-store.tsx` remains as local optimistic/rollback layer.

### 3c. Cloudflare Stream direct upload (commit 46f970b)
- `requestDirectUpload` is a `createServerFn` — server-side only.
- `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_STREAM_API_TOKEN` in `process.env` inside the server function — never in `VITE_*` env vars, never in client bundle.
- Browser receives only: temporary `uploadURL` (1h TTL), `uid`, `expires`, `draftId`.
- Client uploads via XHR POST FormData — no Cloudflare token in browser.
- `stream_uid` stored in `creator_edit_projects` after upload.

### 3d. creator_post_queue entry creation (commit 8b482a5)
- Queue row inserted inside `submitForReview()` only after `stream_uid` confirmed from DB.
- Missing/empty `stream_uid` skips queue creation silently.
- Pre-insert SELECT on `creator_id + edit_project_id` prevents duplicate rows.
- `approval_status` hardcoded to `'pending'`. `is_plus_content` forced `false` for episodes 1–2.
- Queue INSERT failure is non-fatal. No service-role key.

### 3e. creator_post_queue read-back / status display
- `useCreatorPostQueue` SELECTs `creator_post_queue` rows for the signed-in creator.
- `admin_notes` is not selected or displayed — admin-internal field.
- `approval_status` values (`pending`, `approved`, `rejected`, `needs_changes`) map directly into existing `Submission.status` labels and tone classes — no new UI needed.
- Queue rows merged with local submissions in `creator-studio.submissions.tsx`; queue-backed status wins when `edit_project_id` matches a local row's `content_id`.
- SELECT-only — no writes, no approval/rejection actions.
- No service-role key. `profiles.is_creator` not used.

---

## 4. Known Constraints and Intentional Limits

| Area | Constraint |
|---|---|
| Edit Profile | `avatar_url`, `banner_url`, `website_url`, `date_of_birth`, `age`, `is_creator`, `role`, verification fields excluded from writes |
| Inbox / DMs | `message_type`, `encrypted_*`, `attachment_*` out of scope; `as any` cast due to missing generated Supabase typings |
| Notifications | Browser SELECT + UPDATE `read_at` only — INSERT is server-side trigger only |
| Rewards | SELECT only — no Stripe/payment/payout/gift write logic |
| Creator Studio fans | Fan list mock; `follower_count` query removed as unsafe |
| `creator_post_queue` admin_notes | Not fetched or displayed in creator-facing UI |
| `creator_post_queue` unique constraint | No DB-level unique constraint on `(creator_id, edit_project_id)` yet — pre-insert SELECT covers normal cases |
| `profiles.is_creator` | Column does not exist — never query it |
| `profiles.age` / `profiles.date_of_birth` | Do not query unless a specific task explicitly requires it |

---

## 5. Still Mock or Local-Only

| File / Feature | Status |
|---|---|
| `src/lib/mock-data.ts` | MOCK — `creators[]`, `moods[]`, `currentUser` still used by several routes |
| `src/lib/feed-store.tsx` | MOCK feed store |
| `src/lib/activity-store.tsx` | LOCAL only — user's own reactions/saves/shares in localStorage; not wired to `notifications` table |
| `src/lib/submissions-store.tsx` | Local optimistic/rollback layer — preserved, not deleted |
| `src/routes/notifications.tsx` | ComingSoonPage stub |
| Rewards gift / perk actions | `toast.success()` only — no write |
| Creator strip in feed | Still uses `mock-data.ts creators[]` |
| Creator Studio fans | Mock fallback |
| Creator Studio schedule / settings / channel / interactions / rewards routes | NOT WIRED — out of scope |
| Admin routes | Routes exist — require service-role (server-side only) — not wired |
| Auth login/signup flow | Routes exist but use mock |

---

## 6. Intentionally Out of Scope

- Admin review UI for `creator_post_queue` (approval/rejection writes)
- Edit Studio / export features
- Stripe / payments / subscriptions / creator payouts
- Avatar / banner upload
- Push / email notifications
- Realtime subscriptions
- `community_rewards`, `community_badges`, `user_badges`, `reward_redemptions` tables
- Unique DB constraint on `creator_post_queue(creator_id, edit_project_id)`
- Displaying `admin_notes` to creators

---

## 7. Hard Rules (carry forward to all future tasks)

1. Do not redesign the Lovable UI.
2. Do not replace Lovable components with RESTORE components.
3. Do not import RESTORE UI components.
4. Use RESTORE only as backend/schema/API reference.
5. Replace mock data with real Supabase data inside the existing Lovable design.
6. Do not expose `service_role` key in the Vite app.
7. Do not commit `.env.local`.
8. Do not query `profiles.is_creator` (column does not exist).
9. Do not query `profiles.age`.
10. Every task must pass `pnpm tsc --noEmit` and `pnpm build` before being considered done.
11. No browser validation unless explicitly requested.
12. Do not touch Watch Now / Guide unless the task explicitly targets those pages.
13. Do not touch Cloudflare token handling unless the task specifically targets Cloudflare upload/security.

---

## 8. Next Recommended Lane: Admin Review UI for `creator_post_queue`

Creators can now submit videos and see their review status. The missing piece is the admin side: reviewing, approving, rejecting, or requesting changes on `creator_post_queue` rows.

### What this involves
- Read `creator_post_queue` rows for admin review (all creators, not just current user).
- UPDATE `approval_status` to `approved`, `rejected`, or `needs_changes`.
- Optionally write `admin_notes`.
- This requires a **server-side route or `createServerFn`** — browser must never hold the service-role key.
- The existing `src/routes/admin.tsx` shell exists but is not wired.

### Risks before starting
- Service-role key must stay server-side only — use `createServerFn` pattern already established by `upload.server.ts`.
- Do not add a `VITE_SUPABASE_SERVICE_ROLE_KEY` env var — it would be exposed to the browser.
- Do not redesign the admin UI — wire data into existing Lovable admin route shell.
- Do not touch Watch Now / Guide.
- Do not use `profiles.is_creator`.
- Spec required before any implementation.
