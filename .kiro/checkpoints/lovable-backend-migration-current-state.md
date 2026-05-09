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
```

---

## 3. Known Constraints and Intentional Limits

| Area | Constraint |
|---|---|
| Edit Profile | `avatar_url`, `banner_url`, `website_url`, `date_of_birth`, `age`, `is_creator`, `role`, verification fields excluded from writes |
| Inbox / DMs | `message_type`, `encrypted_*`, `attachment_*` columns out of scope; `as any` cast due to missing generated Supabase typings |
| Notifications | Browser SELECT + UPDATE `read_at` only — INSERT is server-side trigger only |
| Rewards | SELECT only — no INSERT/UPDATE/DELETE; no Stripe/payment/payout/gift write logic |
| `profiles.is_creator` | Column does not exist in current schema — never query it |
| `profiles.age` / `profiles.date_of_birth` | Do not query unless a specific task explicitly requires it |

---

## 4. Still Mock or Local-Only

| File / Feature | Status |
|---|---|
| `src/lib/mock-data.ts` | MOCK — `creators[]`, `posts[]`, `moods[]`, `currentUser` still used by several routes |
| `src/lib/feed-store.tsx` | MOCK feed store |
| `src/lib/activity-store.tsx` | LOCAL only — tracks user's own reactions/saves/shares in localStorage; intentionally not wired to `notifications` table |
| `src/lib/submissions-store.tsx` | MOCK — targets `creator_applications` / `episodes` |
| `src/routes/notifications.tsx` | ComingSoonPage stub — not the notification surface (popover is) |
| Rewards gift sending | `toast.success()` only — no write |
| Rewards perk redemption | `toast.success()` only — no write |
| Creator strip in feed/rewards | Still uses `mock-data.ts creators[]` |
| Creator Studio routes | All routes exist but are not wired to real data |
| Admin routes | All routes exist — require service-role (server-side only) |

---

## 5. Intentionally Out of Scope So Far

- Push notifications (browser/mobile)
- Email notifications
- Realtime subscriptions (no Supabase channels wired)
- Avatar / banner upload
- Creator episode/channel/video uploads
- Stripe / payments / subscriptions / creator payouts
- Admin tools (require service-role key — must never be in the Vite browser app)
- Auth login/signup flow (routes exist but use mock)
- `community_rewards`, `community_badges`, `user_badges`, `reward_redemptions` tables

---

## 6. Hard Rules (carry forward to all future tasks)

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

---

## 7. Next Recommended Feature Lane: Creator Studio

Creator Studio is the largest remaining unconnected surface. All routes exist under `src/routes/creator-studio.*`. They currently render with mock/stub data.

### Risks Before Starting

- Creator Studio routes are large files (some 20k–35k characters). Read each file before speccing.
- Some routes may reference `profiles.is_creator` — must be removed/replaced.
- Episode/video upload involves Cloudflare Stream — that is out of scope for initial wiring; display-only first.
- Submissions store (`submissions-store.tsx`) is mock — needs real `creator_applications` / `episodes` data.
- RLS on creator tables likely requires `is_creator = true` or `creator_approved_at IS NOT NULL` — verify before writing queries.
- Do not wire admin-level queries (fan management, revenue ledger) from the browser.

### Suggested Implementation Order for Creator Studio

1. **Creator Studio access guard** — check if current user is an approved creator before rendering studio routes; graceful fallback if not.
2. **Creator Studio index / dashboard** — wire real channel/profile data to the studio home.
3. **Submissions list** — wire `submissions-store.tsx` to real `creator_applications` or `episodes` table (read-only first).
4. **Submit content** — wire the submit form to real episode/post insert (requires careful RLS check).
5. **Analytics** — wire to real view/like/comment counts from existing tables (read-only).
6. **Fans** — wire to real `follows` data (already wired globally — reuse).
7. **Schedule / channel settings** — wire to real channel data if table exists.

Each sub-task requires a spec before implementation. Do not start coding until a spec is approved.
