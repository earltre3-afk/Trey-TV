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
| Creator Studio post queue | `src/hooks/use-creator-submit.ts` | `creator_post_queue` |

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
- `profiles.is_creator` is not used — column does not exist in current schema.
- Browser SELECT only on `channels`, `shows`, `episodes`.
- Fan list and fan count use safe mock fallback (`follower_count` not confirmed in schema).
- Metric cards remain hardcoded.

### 3b. Metadata drafts — `creator_edit_projects`
- `useCreatorSubmit.saveDraft()` INSERT/UPDATE on `creator_edit_projects`.
- `useCreatorSubmit.submitForReview()` UPDATE `status = 'submitted'` on `creator_edit_projects`.
- `submissions-store.tsx` remains as local optimistic/rollback layer — not deleted.
- Supabase failures are non-blocking and do not break local draft flow.

### 3c. Cloudflare Stream direct upload
- `requestDirectUpload` is a `createServerFn` — runs server-side only (commit 46f970b).
- `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_STREAM_API_TOKEN` read from `process.env` inside the server function — never in `VITE_*` env vars, never in client bundle.
- Browser receives only: temporary `uploadURL` (1h TTL), `uid`, `expires`, `draftId`.
- Client uploads via XHR POST FormData to the temporary URL — no Cloudflare token in browser.
- `stream_uid` stored in `creator_edit_projects` after upload.
- `draftId` passed as `?id=` search param to `/creator-studio/submit`.

### 3d. creator_post_queue entry creation (commit 8b482a5)
- Queue row inserted inside `submitForReview()` only after `stream_uid` is confirmed from `creator_edit_projects` by `rowId + creator_id`.
- Missing or empty `stream_uid` skips queue creation silently — returns `true`, no crash.
- Pre-insert SELECT on `creator_id + edit_project_id` prevents duplicate rows from repeated submit calls.
- `approval_status` hardcoded to `'pending'` — never user-controlled.
- `is_plus_content` forced `false` for episode 1 or 2 (satisfies DB constraint `creator_post_queue_first_two_not_plus_check`).
- Queue INSERT failure is non-fatal — submit flow returns `true` regardless.
- No service-role key. Browser INSERT allowed by RLS: `creator_id = auth.uid() AND approval_status = 'pending' AND is_approved_creator_for_current_user()`.

---

## 4. Known Constraints and Intentional Limits

| Area | Constraint |
|---|---|
| Edit Profile | `avatar_url`, `banner_url`, `website_url`, `date_of_birth`, `age`, `is_creator`, `role`, verification fields excluded from writes |
| Inbox / DMs | `message_type`, `encrypted_*`, `attachment_*` columns out of scope; `as any` cast due to missing generated Supabase typings |
| Notifications | Browser SELECT + UPDATE `read_at` only — INSERT is server-side trigger only |
| Rewards | SELECT only — no INSERT/UPDATE/DELETE; no Stripe/payment/payout/gift write logic |
| Creator Studio fans | Fan list mock; `follower_count` query removed as unsafe |
| `creator_post_queue` | No unique DB constraint yet on `(creator_id, edit_project_id)` — pre-insert SELECT covers normal cases; race-proof constraint is future hardening |
| `profiles.is_creator` | Column does not exist in current schema — never query it |
| `profiles.age` / `profiles.date_of_birth` | Do not query unless a specific task explicitly requires it |

---

## 5. Still Mock or Local-Only

| File / Feature | Status |
|---|---|
| `src/lib/mock-data.ts` | MOCK — `creators[]`, `moods[]`, `currentUser` still used by several routes |
| `src/lib/feed-store.tsx` | MOCK feed store |
| `src/lib/activity-store.tsx` | LOCAL only — tracks user's own reactions/saves/shares in localStorage; intentionally not wired to `notifications` table |
| `src/lib/submissions-store.tsx` | Preserved as local optimistic/rollback layer — not deleted |
| `src/routes/notifications.tsx` | ComingSoonPage stub — notification surface is the popover |
| Rewards gift / perk actions | `toast.success()` only — no write |
| Creator strip in feed | Still uses `mock-data.ts creators[]` |
| Creator Studio fans | Mock fallback |
| Creator Studio schedule / settings / channel / interactions / rewards routes | NOT WIRED — out of scope |
| Admin routes | Routes exist — require service-role (server-side only) — not wired |
| Auth login/signup flow | Routes exist but use mock |

---

## 6. Intentionally Out of Scope

- Admin review UI for `creator_post_queue`
- Edit Studio / export features
- Stripe / payments / subscriptions / creator payouts
- Avatar / banner upload
- Push / email notifications
- Realtime subscriptions
- `community_rewards`, `community_badges`, `user_badges`, `reward_redemptions` tables
- Unique DB constraint on `creator_post_queue(creator_id, edit_project_id)`

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

## 8. Next Recommended Lane: Creator Studio post queue read-back / status display

Now that `creator_post_queue` rows are being written, creators have no visibility into their submission status inside the app. The next lane is to surface queue row status back to the creator.

### What this involves
- Read `creator_post_queue` rows for the current creator (SELECT by `creator_id = auth.uid()`).
- Display `approval_status` (`pending` / `approved` / `rejected` / `needs_changes`) on the submissions list or submitted confirmation page.
- RLS already allows SELECT for `creator_id = auth.uid() AND is_approved_creator_for_current_user()`.
- No new tables. No writes. Read-only.

### Risks before starting
- Do not redesign the submissions list UI — wire data into existing Lovable components only.
- Do not touch `creator-studio.edit.tsx` or Watch Now / Guide.
- Do not expose secrets.
- Do not use `profiles.is_creator`.
- Spec required before any implementation.

### After that: Admin review UI
- Admin review of `creator_post_queue` requires service-role key — must be a server function or server route, never a browser query.
- Spec required. Do not start until post queue read-back is confirmed build-safe.
