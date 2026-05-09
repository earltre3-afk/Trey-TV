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
| Creator Studio (submit metadata) | `src/hooks/use-creator-submit.ts` + `creator-studio.submit.tsx` | `creator_edit_projects` — metadata-only draft/submit INSERT + UPDATE — `creator_post_queue` intentionally not used (`stream_uid NOT NULL` requires Cloudflare Stream upload) — no video file upload, no Cloudflare Stream code — `submissions-store.tsx` remains UI source of truth / rollback layer — Supabase failures are non-blocking and do not break local draft flow — tsc ✅ build ✅ (no browser validation) |
| Creator Studio (Cloudflare Stream upload) | `src/lib/creator-studio/upload.server.ts` + `src/hooks/use-cloudflare-upload.ts` + `creator-studio.edit.tsx` | `creator_edit_projects` (`stream_uid` field) — server function creates Cloudflare direct upload URL — `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_STREAM_API_TOKEN` are server-only (no `VITE_*` prefix) — browser never receives Cloudflare API token — client uploads via XHR POST FormData with progress — `stream_uid` stored in `creator_edit_projects` after upload — `creator_post_queue` not touched (now unblocked for a future spec once `stream_uid` exists) — commit 46f970b — tsc ✅ build ✅ (no browser validation) |

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
