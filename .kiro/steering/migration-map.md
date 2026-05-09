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
| Submissions | `src/lib/submissions-store.tsx` | `creator_applications` / `episodes` |

---

## 🔴 Not Started

| Feature | Notes |
|---------|-------|
| Auth login/signup flow | Routes exist (`login.tsx`, `signup.tsx`) but use mock |
| Creator Studio | Routes exist — needs real episode/channel data |
| Rewards | Route exists (`rewards.tsx`) — stub only |
| Admin | Routes exist — needs service-role (server-side only) |

---

## Migration Priority Order

1. ~~**Current user profile**~~ — ✅ done (`profiles` via `use-current-user.ts` + `CurrentUserSync.tsx`)
2. ~~**Comments**~~ — ✅ done (`user_post_comments`)
3. ~~**Follow state**~~ — ✅ done (`follows`)
4. ~~**Edit profile**~~ — ✅ done (`profiles` — text fields only; avatar/banner upload out of scope)
5. ~~**Inbox**~~ — ✅ done (`direct_messages` via `messages-store.tsx`)
6. ~~**Notifications**~~ — ✅ done (`notifications` via `use-notifications.ts` + `NotificationsPopover.tsx`)
7. **Creator Studio** — wire to `episodes`, `channels`
8. **Rewards** — wire to `community_credits`

Each item above requires a spec before implementation.
