# Lovable Backend Migration — Current State Checkpoint

**Project:** TREY-TV-ANTIGRAVITY  
**Branch:** `lovable-shell-backend-wiring`  
**Date:** 2026-05-09  
**Build status:** `pnpm tsc --noEmit` ✅ · `pnpm build` ✅  
**Git status:** clean working tree  
**Browser validation:** intentionally skipped by user preference — terminal/code validation only unless explicitly requested.

---

## 1. What Is Real (Supabase-backed, build-safe)

| Feature                                  | Hook / File                                                                                                                                  | Table(s)                                                  |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Supabase client + env                    | `src/lib/supabase-browser.ts`, `src/lib/backend-env.ts`                                                                                      | —                                                         |
| Auth session                             | `src/hooks/use-auth.ts`                                                                                                                      | Supabase Auth                                             |
| Current user profile bridge              | `src/hooks/use-current-user.ts` + `src/components/CurrentUserSync.tsx`                                                                       | `profiles`                                                |
| Feed posts                               | `src/hooks/use-posts.ts`                                                                                                                     | `user_posts`                                              |
| Public profiles                          | `src/hooks/use-profile.ts`                                                                                                                   | `profiles`                                                |
| Post reactions / likes                   | `src/hooks/use-supabase-reactions.ts`                                                                                                        | `user_post_reactions`                                     |
| Comments                                 | `src/lib/comments-store.tsx`                                                                                                                 | `user_post_comments`                                      |
| Follows                                  | `src/lib/follow-store.tsx`                                                                                                                   | `follows`                                                 |
| Edit Profile                             | `src/routes/edit-profile.tsx`                                                                                                                | `profiles`                                                |
| Inbox / DMs                              | `src/lib/messages-store.tsx`                                                                                                                 | `direct_messages`                                         |
| Notifications                            | `src/hooks/use-notifications.ts` + `src/components/layout/NotificationsPopover.tsx`                                                          | `notifications`                                           |
| Rewards (read-only)                      | `src/hooks/use-rewards.ts` + `src/routes/rewards.tsx`                                                                                        | `community_credit_balances`, `community_credit_events`    |
| Creator Studio dashboard                 | `src/hooks/use-creator-studio.ts` + `creator-studio.index.tsx`                                                                               | `channels`, `shows`, `episodes`                           |
| Creator Studio metadata drafts           | `src/hooks/use-creator-submit.ts` + `creator-studio.submit.tsx`                                                                              | `creator_edit_projects`                                   |
| Creator Studio Cloudflare upload         | `src/lib/creator-studio/upload.server.ts` + `src/hooks/use-cloudflare-upload.ts` + `creator-studio.edit.tsx`                                 | `creator_edit_projects` (`stream_uid`)                    |
| Creator Studio post queue (write)        | `src/hooks/use-creator-submit.ts`                                                                                                            | `creator_post_queue`                                      |
| Creator Studio post queue (read-back)    | `src/hooks/use-creator-post-queue.ts` + `creator-studio.submissions.tsx`                                                                     | `creator_post_queue`                                      |
| Admin Creator Post Review                | `src/lib/admin/post-queue.server.ts` + `src/hooks/use-admin-post-queue.ts` + `admin.content-approval.tsx` + `admin.content-approval.$id.tsx` | `creator_post_queue`, `creator_edit_projects`             |
| Admin Publishing Activation              | `src/lib/admin/post-queue.server.ts`                                                                                                         | `creator_post_queue`, `creator_edit_projects`, `episodes` |
| Default Profile Layout System            | `src/components/profile/` + `src/routes/u.$uid.tsx` + `src/hooks/use-profile.ts`                                                             | `profiles`                                                |
| Trey-I Onboarding (Phase 1 — text-first) | `src/lib/trey-i/intake.server.ts` + `src/lib/trey-i/onboarding.server.ts` + `src/routes/onboarding.voice.tsx`                                | `intake_sessions`, `profiles`                             |
| Trey-I Phase 2 — TTS                     | `src/lib/trey-i/tts.server.ts` + `src/routes/onboarding.voice.tsx`                                                                           | — (no table; Gemini TTS API)                              |

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
intake_sessions
```

---

## 3. Full Creator Pipeline Status

| Stage                          | File(s)                                                                     | Status                                                         |
| ------------------------------ | --------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Metadata draft                 | `use-creator-submit.ts` + `creator-studio.submit.tsx`                       | ✅ Real — `creator_edit_projects` INSERT/UPDATE                |
| Cloudflare Stream upload       | `upload.server.ts` + `use-cloudflare-upload.ts` + `creator-studio.edit.tsx` | ✅ Real — server function, token server-side only              |
| Post queue entry creation      | `use-creator-submit.ts`                                                     | ✅ Real — `creator_post_queue` INSERT after valid `stream_uid` |
| Creator-facing queue read-back | `use-creator-post-queue.ts` + `creator-studio.submissions.tsx`              | ✅ Real — SELECT only, `admin_notes` excluded                  |
| Admin review                   | `admin/post-queue.server.ts` + `use-admin-post-queue.ts` + admin routes     | ✅ Real — server functions, service-role server-only           |

---

## 4. Trey-I Onboarding — Current State (commit 8d4c1a5)

| Phase                            | File(s)                                                              | Status                                                                                 |
| -------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Phase 1 — text-first             | `intake.server.ts` + `onboarding.server.ts` + `onboarding.voice.tsx` | ✅ Real — stage machine, filler detection, profile save, `public_profile_uid` redirect |
| Phase 2 — TTS                    | `tts.server.ts` + `onboarding.voice.tsx`                             | ✅ Real — Gemini TTS, non-blocking, fire-and-forget                                    |
| Phase 3 — ElevenLabs voice input | —                                                                    | Out of scope                                                                           |
| Phase 4 — Gemini Live            | —                                                                    | Out of scope                                                                           |

**TTS security:** `GOOGLE_GENAI_API_KEY` / `GEMINI_API_KEY` / `GOOGLE_API_KEY` are server-only env vars (no `VITE_` prefix). Browser receives only `{ audioBase64, mimeType }` or `{ audioBase64: null }` — never API keys. TTS failure is silent and non-fatal.

**`@google/genai ^1.50.1`** added to `package.json` dependencies.

**TreyIWidget** (`src/components/ai/TreyIWidget.tsx`) remains a visual-only mock — separate future lane, not wired to any AI.

**.claude/** is local untracked Claude output — do not commit.

---

## 5. Admin Creator Post Review — Security Details

Two stashes are present on this branch. Do not pop or apply unless explicitly requested.

| Stash       | Description                                         |
| ----------- | --------------------------------------------------- |
| `stash@{0}` | WIP default profile layout route for new users      |
| `stash@{1}` | WIP default profile layout components for new users |

These stashes contain the in-progress Default Profile Layout System for new users. They must be applied carefully and in order when that lane begins.

---

## 6. Known Constraints and Intentional Limits

| Area                                      | Constraint                                                                                                                        |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Edit Profile                              | `avatar_url`, `banner_url`, `website_url`, `date_of_birth`, `age`, `is_creator`, `role`, verification fields excluded from writes |
| Notifications                             | Browser SELECT + UPDATE `read_at` only — INSERT is server-side trigger only                                                       |
| Rewards                                   | SELECT only — no Stripe/payment/payout/gift write logic                                                                           |
| Creator Studio fans                       | Fan list mock; `follower_count` query removed as unsafe                                                                           |
| `creator_post_queue` unique constraint    | No DB-level unique constraint on `(creator_id, edit_project_id)` yet                                                              |
| `admin_notes`                             | Admin-only — never in creator-facing hooks                                                                                        |
| `profiles.is_creator`                     | Column does not exist — never query it                                                                                            |
| `profiles.age` / `profiles.date_of_birth` | Do not query unless a specific task explicitly requires it                                                                        |

---

## 7. Still Mock or Local-Only

| File / Feature                                                               | Status                                                                     |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `src/lib/mock-data.ts`                                                       | MOCK — `creators[]`, `moods[]`, `currentUser` still used by several routes |
| `src/lib/feed-store.tsx`                                                     | MOCK feed store                                                            |
| `src/lib/activity-store.tsx`                                                 | LOCAL only — user's own reactions/saves/shares in localStorage             |
| `src/lib/submissions-store.tsx`                                              | Local optimistic/rollback layer — preserved, not deleted                   |
| `src/routes/notifications.tsx`                                               | ComingSoonPage stub                                                        |
| Rewards gift / perk actions                                                  | `toast.success()` only — no write                                          |
| Creator strip in feed                                                        | Still uses `mock-data.ts creators[]`                                       |
| Creator Studio fans                                                          | Mock fallback                                                              |
| Creator Studio schedule / settings / channel / interactions / rewards routes | NOT WIRED — out of scope                                                   |
| Admin users / videos / reports / recommendations routes                      | NOT WIRED — out of scope                                                   |
| Auth login/signup flow                                                       | Routes exist but use mock                                                  |

---

## 8. Intentionally Out of Scope

- Public episode/post publishing after admin approval
- Creator notifications on approval/rejection
- Edit Studio / export features
- Stripe / payments / subscriptions / creator payouts
- Avatar / banner upload
- Push / email notifications
- Realtime subscriptions
- Unique DB constraint on `creator_post_queue(creator_id, edit_project_id)`

---

## 9. Hard Rules (carry forward to all future tasks)

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

## 10. Next Recommended Lane: Default Profile Layout System for New Users

Two stashes (`stash@{0}` and `stash@{1}`) contain WIP for this lane. Apply in order when ready.

### What this involves

- A default profile layout for new users who have not yet customized their profile.
- Should be reusable for both normal users and creators.
- Wires into the existing `profiles` table and Lovable profile route.

### Risks before starting

- Apply stashes carefully and in order — `stash@{1}` (components) first, then `stash@{0}` (route).
- Do not disturb the Creator Studio / admin pipeline.
- Preserve the Lovable shell — no redesign.
- Keep the layout step-and-repeat reusable for normal users and creators.
- Do not use `profiles.is_creator`.
- Spec required before any implementation beyond applying the stashes.
