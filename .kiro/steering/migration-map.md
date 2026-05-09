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
| Current user | `src/lib/mock-data.ts` → `currentUser` | `profiles` (auth user) |
| Comments | `src/lib/comments-store.tsx` | `user_post_comments` |
| Follow state | `src/lib/follow-store.tsx` | `follows` |
| Inbox / DMs | `src/lib/messages-store.tsx` | `direct_messages` |
| Activity feed | `src/lib/activity-store.tsx` | `notifications` |
| Submissions | `src/lib/submissions-store.tsx` | `creator_applications` / `episodes` |

---

## 🔴 Not Started

| Feature | Notes |
|---------|-------|
| Auth login/signup flow | Routes exist (`login.tsx`, `signup.tsx`) but use mock |
| Edit profile | Route exists (`edit-profile.tsx`) — needs real save |
| Creator Studio | Routes exist — needs real episode/channel data |
| Notifications | Route exists (`notifications.tsx`) — stub only |
| Rewards | Route exists (`rewards.tsx`) — stub only |
| Admin | Routes exist — needs service-role (server-side only) |

---

## Migration Priority Order

1. **Current user profile** — replace `mock-data.currentUser` with auth user's real profile
2. **Comments** — wire `comments-store` to `user_post_comments`
3. **Follow state** — wire `follow-store` to `follows` table
4. **Edit profile** — save form to `profiles` table
5. **Inbox** — wire `messages-store` to `direct_messages`
6. **Notifications** — wire `activity-store` to `notifications`
7. **Creator Studio** — wire to `episodes`, `channels`
8. **Rewards** — wire to `community_credits`

Each item above requires a spec before implementation.
