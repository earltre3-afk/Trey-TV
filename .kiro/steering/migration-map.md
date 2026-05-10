# Backend Migration Map

Status of each feature area: what's real, what's still mock, what's next.

---

## ✅ Real (confirmed wired and tested)

| Feature | Hook / File | Table |
|---------|-------------|-------|
| Auth session | `src/hooks/use-auth.ts` | Supabase Auth |
| Feed posts | `src/hooks/use-posts.ts` | `user_posts` |
| Public profile | `src/hooks/use-profile.ts` | `profiles` |
| Supabase client/env | `src/lib/supabase-browser.ts`, `src/lib/backend-env.ts` | — |
| Post reactions/likes | `src/hooks/use-supabase-reactions.ts` | `user_post_reactions` |
| Comments | `src/lib/comments-store.tsx` | `user_post_comments` — tsc ✅ build ✅ (no browser validation) |
| Current user profile | `src/hooks/use-current-user.ts` + `src/components/CurrentUserSync.tsx` | `profiles` — bridges Supabase auth into Lovable AuthProvider — tsc ✅ build ✅ (signed-in visual verification pending, browser validation intentionally skipped) |
| Follow state | `src/lib/follow-store.tsx` | `follows` (`follower_id`, `following_id`) — `public_profile_uid` resolved to `profiles.id` before writing `following_id` — tsc ✅ build ✅ (no browser validation) |
| Edit profile | `src/routes/edit-profile.tsx` | `profiles` — updates: `display_name`, `username`, `bio`, `location`, `profile_accent_color` — excluded: `public_profile_uid`, `role`, verification fields, `avatar_url`, `banner_url`, `website_url`, `date_of_birth`, `age`, `is_creator` — tsc ✅ build ✅ (no browser validation) |
| Inbox / DMs | `src/lib/messages-store.tsx` | `direct_messages` — columns: `id`, `sender_id`, `recipient_id`, `body`, `read_at`, `created_at` — threads derived client-side by peer UUID (no conversations table) — peer profiles resolved via `profiles` FK joins and username lookup — attachments/encryption/message_type out of scope this phase — `as any` cast present due to missing generated Supabase table typings — tsc ✅ build ✅ (no browser validation) |
| Notifications | `src/hooks/use-notifications.ts` + `src/components/layout/NotificationsPopover.tsx` | `notifications` — columns: `id`, `user_id`, `actor_id`, `type`, `message`, `read_at`, `created_at`, `post_id`, `comment_id`, `video_id`, `metadata` — browser SELECTs and UPDATEs `read_at` only — browser INSERT intentionally not used (server-side triggers write notifications) — `src/routes/notifications.tsx` remains ComingSoonPage stub — `activity-store.tsx` remains local user activity, not notification inbox — tsc ✅ build ✅ (no browser validation) |
| Rewards | `src/hooks/use-rewards.ts` + `src/routes/rewards.tsx` | `community_credit_balances`, `community_credit_events` — browser SELECT only, no INSERT/UPDATE/DELETE/UPSERT — no Stripe/payment/payout/gift write logic — card UID from `useCurrentUser().public_profile_uid` (`profiles.public_profile_uid`) — gift/perk actions remain toast-only — tsc ✅ build ✅ (no browser validation) |
| Creator Studio (read-only dashboard) | `src/hooks/use-creator-studio.ts` + `CreatorStudioLayout.tsx` + `creator-studio.index.tsx` + `creator-studio.submissions.tsx` + `creator-studio.analytics.tsx` + `creator-studio.fans.tsx` | `channels`, `shows`, `episodes` — access gate uses `channels.owner_email` matched against `supabase.auth.getUser()` email — `profiles.is_creator` not used — browser SELECT only, no writes — uploads/Cloudflare Stream/Edit Studio/payouts/Stripe/admin remain out of scope — fan list and fan count remain mock/fallback (`follower_count` not confirmed in migrations/types; unsafe query removed in commit 8023b58) — tsc ✅ build ✅ (no browser validation) |
| Creator Studio (submit metadata) | `src/hooks/use-creator-submit.ts` + `creator-studio.submit.tsx` | `creator_edit_projects` — metadata-only draft/submit INSERT + UPDATE — `creator_post_queue` wired in same hook (see row below) — no video file upload, no Cloudflare Stream code — `submissions-store.tsx` remains UI source of truth / rollback layer — Supabase failures are non-blocking and do not break local draft flow — tsc ✅ build ✅ (no browser validation) |
| Creator Studio (Cloudflare Stream upload) | `src/lib/creator-studio/upload.server.ts` + `src/hooks/use-cloudflare-upload.ts` + `creator-studio.edit.tsx` | `creator_edit_projects` (`stream_uid` field) — server function creates Cloudflare direct upload URL — `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_STREAM_API_TOKEN` are server-only (no `VITE_*` prefix) — browser never receives Cloudflare API token — client uploads via XHR POST FormData with progress — `stream_uid` stored in `creator_edit_projects` after upload — tsc ✅ build ✅ (no browser validation) |
| Creator Studio (creator_post_queue wiring) | `src/hooks/use-creator-submit.ts` | `creator_post_queue` — queue row inserted inside `submitForReview()` only after a valid `stream_uid` is confirmed from `creator_edit_projects` — `stream_uid` read from DB by `rowId + creator_id`, never from component state — missing/empty `stream_uid` skips queue creation silently — pre-insert SELECT on `creator_id + edit_project_id` prevents duplicate rows — `approval_status` hardcoded to `'pending'` — `is_plus_content` forced `false` for episode 1 or 2 — queue INSERT failure is non-fatal to submit flow — no service-role key — admin review UI remains out of scope — Edit Studio/export remains out of scope — commit 8b482a5 — tsc ✅ build ✅ (no browser validation) |
| Creator Studio (post queue read-back) | `src/hooks/use-creator-post-queue.ts` + `creator-studio.submissions.tsx` | `creator_post_queue` — SELECT-only creator-facing status display — `approval_status` maps directly into existing `Submission.status` labels/tones — queue rows merged with local submissions; queue-backed status wins when `edit_project_id` matches — `admin_notes` not selected or displayed — no INSERT/UPDATE/DELETE — no service-role key — `profiles.is_creator` not used — admin review UI remains out of scope — status writes/approval/rejection remain out of scope — Edit Studio/export remains out of scope — tsc ✅ build ✅ (no browser validation) |
| Admin Creator Post Review | `src/lib/admin/post-queue.server.ts` + `src/hooks/use-admin-post-queue.ts` + `admin.content-approval.tsx` + `admin.content-approval.$id.tsx` | `creator_post_queue`, `creator_edit_projects` — server functions authenticate caller first (normal auth client), then authorize via `profiles.role = 'admin'` or `ADMIN_EMAILS` env var, then construct service-role client — browser `isAdmin`/`localStorage` is visual-only gate, not authorization — `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_EMAILS` appear only in server-only code, no `VITE_*` prefix — review actions update `creator_post_queue.approval_status` + `admin_notes` and sync `creator_edit_projects.status` (`approved→published`, `rejected→rejected`, `needs_changes→ready`, `pending→submitted`) — no payouts, Stripe, Edit Studio/export — tsc ✅ build ✅ (no browser validation) |
| Admin Publishing Activation | `src/lib/admin/post-queue.server.ts` | `creator_post_queue`, `creator_edit_projects`, `episodes` — on approval, `reviewAdminPostQueue` publishes the approved queue item as an episode — publishing is server-side only, after `verifyAdmin()` passes and service-role client is constructed — idempotency: SELECT by `(show_id, video_asset_id)` first; UPDATE existing row if found, INSERT new row if not — `video_asset_id` = `creator_post_queue.stream_uid` — `episodes.edit_project_id` does not exist; `ON CONFLICT (edit_project_id)` is never used — `admin_publish_override = true` set on episode row to bypass DB readiness trigger (`zz_episodes_enforce_publish_readiness`); `admin_publish_override_by` and `admin_publish_override_at` populated for audit — rollback on episode write failure: best-effort revert of `creator_post_queue.approval_status → pending`, `creator_post_queue.admin_notes → null`, `creator_edit_projects.status → submitted` — Watch Now / Guide not touched (both are static/localStorage) — no payouts, Stripe, Edit Studio/export — tsc ✅ build ✅ (no browser validation) |
| Default Profile Layout System | `src/components/profile/` + `src/routes/u.$uid.tsx` + `src/hooks/use-profile.ts` | `profiles` — reusable step-and-repeat profile layout template for all new user and creator profiles — `ProfilePageShell` accepts `ProfileData` + `ViewerRole` and renders `NormalUserProfileModules` or `CreatorProfileModules` based on `profileType` — all profile components are prop-driven through `ProfileData`, no direct Supabase queries in components — `public_profile_uid` routing preserved — real Supabase profile data preserved via `useProfile` — `profiles.is_creator` not queried (stale type removed from `use-profile.ts`) — `profiles.age` / `date_of_birth` not used — Creator/admin pipeline untouched — Watch Now/Guide untouched — tsc ✅ build ✅ (no browser validation) |

---

## 🟠 Next / Needs Wiring (spec required before coding)

No items currently queued. See Mock section below for candidates.

---

## 🟡 Mock (needs real wiring)

| Feature | Mock Location | Target Table / API |
|---------|--------------|-------------------|
| Feed creators strip | `src/lib/mock-data.ts` → `creators[]` | `profiles` (following or featured) |
| Prescribed content | `src/lib/mock-data.ts` → `prescribed[]` | `prescribe_me` / recommendations |
| Mood filter | `src/lib/mock-data.ts` → `moods[]` | Static enum (keep as-is for now) |
| Activity feed | `src/lib/activity-store.tsx` | Local user actions only (reactions/saves/shares) — intentionally not wired to `notifications` table; notification inbox handled separately via `use-notifications.ts` |
| Submissions | `src/lib/submissions-store.tsx` | Preserved as mock/rollback artifact — episodes now loaded via `use-creator-studio.ts`; store not deleted |

---

## 🔴 Not Started

| Feature | Notes |
|---------|-------|
| Auth login/signup flow | Routes exist (`login.tsx`, `signup.tsx`) but use mock |
| Admin | Routes exist — needs service-role (server-side only) |

---

## Migration Priority Order

1. ~~**Current user profile**~~ — ✅ done (`profiles` via `use-current-user.ts` + `CurrentUserSync.tsx`)
2. ~~**Comments**~~ — ✅ done (`user_post_comments`)
3. ~~**Follow state**~~ — ✅ done (`follows`)
4. ~~**Edit profile**~~ — ✅ done (`profiles` — text fields only; avatar/banner upload out of scope)
5. ~~**Inbox**~~ — ✅ done (`direct_messages` via `messages-store.tsx`)
6. ~~**Notifications**~~ — ✅ done (`notifications` via `use-notifications.ts` + `NotificationsPopover.tsx`)
7. ~~**Creator Studio**~~ — ✅ done (read-only dashboard: `channels`, `shows`, `episodes` via `use-creator-studio.ts`; uploads/edit/payouts out of scope)
8. ~~**Rewards**~~ — ✅ done (`community_credit_balances` + `community_credit_events` via `use-rewards.ts`; read-only)

Each item above requires a spec before implementation.
