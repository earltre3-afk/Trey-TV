# Requirements: Notifications — Supabase Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Scope:** Notifications only. No push, no email, no rewards, no creator studio, no admin, no redesign.

---

## 1. Goal

Replace the hardcoded mock items array in `NotificationsPopover` with real Supabase data from the `notifications` table, using a new `useNotifications()` hook. The popover UI remains visually unchanged. The `notifications.tsx` route remains a ComingSoonPage stub — it is not the wiring target.

---

## 2. Key Insight: Two Separate Surfaces

| Surface                | File                                             | Status                            | Action               |
| ---------------------- | ------------------------------------------------ | --------------------------------- | -------------------- |
| `NotificationsPopover` | `src/components/layout/NotificationsPopover.tsx` | Mock hardcoded array              | **Wire to Supabase** |
| `/notifications` route | `src/routes/notifications.tsx`                   | ComingSoonPage stub               | **Leave unchanged**  |
| `activity-store.tsx`   | `src/lib/activity-store.tsx`                     | Tracks user's own actions locally | **Leave unchanged**  |
| `/activity` route      | `src/routes/activity.tsx`                        | Shows local activity history      | **Leave unchanged**  |

The `activity-store` is not notifications — it tracks the current user's own reactions/saves/shares in localStorage. Do not conflate or merge these.

---

## 3. Schema Verification

### Table: `public.notifications`

| Column       | Type                        | Notes                          |
| ------------ | --------------------------- | ------------------------------ |
| `id`         | `uuid` PK                   | `gen_random_uuid()`            |
| `user_id`    | `uuid` FK → `profiles.id`   | NOT NULL — the recipient       |
| `actor_id`   | `uuid` FK → `profiles.id`   | nullable — who triggered it    |
| `type`       | `text`                      | NOT NULL — see type enum below |
| `message`    | `text`                      | nullable — fallback copy       |
| `read_at`    | `timestamptz`               | nullable — NULL = unread       |
| `created_at` | `timestamptz`               | NOT NULL, default `now()`      |
| `video_id`   | `uuid` FK → `videos.id`     | nullable                       |
| `comment_id` | `uuid` FK → `comments.id`   | nullable                       |
| `post_id`    | `uuid` FK → `user_posts.id` | nullable                       |
| `metadata`   | `jsonb`                     | default `'{}'`                 |

### Type Enum

```
new_follower | comment_on_video | like_on_video | reply_to_comment |
post_liked | post_commented | post_saved | user_followed
```

### RLS Policies

| Operation | Policy                                                       |
| --------- | ------------------------------------------------------------ |
| SELECT    | `auth.uid() = user_id`                                       |
| UPDATE    | `auth.uid() = user_id`                                       |
| INSERT    | No browser INSERT — server-side triggers write notifications |

No service-role key is used in the browser. All queries use the anon/user Supabase browser client enforced by RLS.

---

## 4. Functional Requirements

### FR-1: New `useNotifications()` hook

- Create `src/hooks/use-notifications.ts`.
- Exposes: `notifications`, `unreadCount`, `markRead(id)`, `markAllRead()`, `loading`.
- Signed-out: returns `{ notifications: [], unreadCount: 0, loading: false }` — no crash, no alert.
- Does not replace or touch `activity-store.tsx`.

### FR-2: Load notifications

- On mount (when user is signed in), fetch from `notifications` where `user_id = auth.uid()`.
- Order: `created_at DESC`, limit 30.
- Batch-fetch actor profiles by `actor_id` in a single `profiles` query.
- Required profile fields: `id`, `display_name`, `username`, `avatar_url`, `verification_type`.
- Do not query `profiles.is_creator`, `profiles.age`, or `profiles.date_of_birth`.

### FR-3: Unread count

- `unreadCount` = count of rows where `read_at IS NULL`.
- Derived from loaded notifications — no separate count query needed.
- The popover header currently shows `{unread} new updates` — this must reflect the real count.

### FR-4: Mark single notification as read

- `markRead(id)`: update `read_at = now()` where `id = X AND user_id = auth.uid()`.
- Optimistically update local state before the Supabase call.
- On error: silent fail (non-critical).
- Signed-out: no-op.

### FR-5: Mark all as read

- `markAllRead()`: update `read_at = now()` where `user_id = auth.uid() AND read_at IS NULL`.
- Optimistically update local state.
- On error: silent fail.
- Signed-out: no-op.
- The popover footer "Mark all as read" button currently fires a toast only — wire it to `markAllRead()` and keep the toast.

### FR-6: Type → Lovable `kind` mapping

Map `notifications.type` to the Lovable `N["kind"]` used by `NotificationsPopover`:

| Supabase `type`                                            | Lovable `kind` |
| ---------------------------------------------------------- | -------------- |
| `new_follower` / `user_followed`                           | `follow`       |
| `post_liked` / `like_on_video`                             | `like`         |
| `post_commented` / `comment_on_video` / `reply_to_comment` | `comment`      |
| `post_saved`                                               | `boost`        |
| anything else                                              | `trey`         |

### FR-7: Notification text

- If `actor.display_name` is available, use it as the `who` name.
- Use `message` field if present; otherwise derive copy from `type` (same logic as RESTORE `notificationCopy`).
- `time` field: relative string derived from `created_at` (e.g. "2m", "1h", "3d").

### FR-8: Signed-out graceful handling

- `useCurrentUser()` returns `null` when unauthenticated.
- Hook returns empty state immediately — no Supabase call, no crash, no alert.
- Popover renders with 0 unread and empty list (existing empty state or no items shown).

### FR-9: Visual preservation

- `NotificationsPopover.tsx` layout, styling, filter tabs, and footer are not changed structurally.
- The only changes to `NotificationsPopover.tsx` are:
  1. Replace the hardcoded `items` array with data from `useNotifications()`.
  2. Wire the "Mark all as read" footer button to `markAllRead()`.
  3. Wire individual item click to `markRead(id)`.
- Filter tabs (All/Mentions/Likes/Follows/Live) remain present — client-side filtering on loaded data.

### FR-10: No private data exposure

- Do not expose `service_role` key in the Vite app.
- Do not log raw Supabase errors to the UI.
- Do not expose `date_of_birth`, `email`, or other PII from joined profiles.

### FR-11: No INSERT from browser

- Notifications are written by server-side triggers only.
- The hook never calls `.insert()` on the `notifications` table.

---

## 5. Non-Functional Requirements

- **Build safety:** Every change must pass `pnpm tsc --noEmit` and `pnpm build`.
- **No browser validation:** No Playwright, no screenshots, no Read URL checks.
- **No new dependencies:** Use only existing packages (`@supabase/supabase-js`, `sonner`, React hooks).
- **No redesign:** Do not import RESTORE UI components. Do not alter Lovable component structure.
- **Rollback:** The mock `items` array is preserved in a comment or backup file so it can be restored in one step.

---

## 6. Out of Scope

- Push notifications (browser/mobile)
- Email notifications
- Realtime subscription for incoming notifications
- The `/notifications` route (remains ComingSoonPage)
- The `activity-store.tsx` and `/activity` route (local user actions — separate concern)
- Filter tab persistence (tabs remain UI-only client-side filter)
- Pagination / infinite scroll
- Notification preferences / mute settings
