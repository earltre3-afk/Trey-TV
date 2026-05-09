# Design: Notifications — Supabase Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09

---

## 1. Architecture Overview

```
AppHeader
  └── NotificationsPopover          ← existing Lovable component
        └── useNotifications()      ← NEW hook (src/hooks/use-notifications.ts)
              ├── useCurrentUser()  ← existing hook
              ├── supabase-browser  ← existing client
              └── notifications     ← Supabase table (SELECT + UPDATE via RLS)
```

One new file: `src/hooks/use-notifications.ts`.  
One existing file modified: `src/components/layout/NotificationsPopover.tsx`.  
No other files touched.

---

## 2. New Hook: `use-notifications.ts`

```ts
// Public interface
type NotificationItem = {
  id: string;
  kind: 'like' | 'comment' | 'follow' | 'live' | 'trey' | 'boost';
  who?: { name: string; avatar: string; handle: string };
  text: string;
  time: string;
  unread: boolean;
  to?: string;
};

type UseNotificationsReturn = {
  notifications: NotificationItem[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  loading: boolean;
};
```

The `NotificationItem` type mirrors the existing `N` type in `NotificationsPopover.tsx` so the component requires minimal changes.

---

## 3. Data Flow

### 3a. Load (mount)

```
useNotifications() mounts
  → user = useCurrentUser()
  → if null: return { notifications: [], unreadCount: 0, loading: false }
  → setLoading(true)
  → supabase
      .from('notifications')
      .select('id, user_id, actor_id, type, message, read_at, created_at, post_id, comment_id, video_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
  → collect unique actor_ids from rows
  → if actor_ids.length:
      supabase.from('profiles')
        .select('id, display_name, username, avatar_url, verification_type')
        .in('id', actor_ids)
  → map rows + profiles → NotificationItem[]
  → setNotifications(items)
  → setLoading(false)
```

### 3b. markRead(id)

```
→ if !user: return
→ optimistic: setNotifications(prev => prev.map(n => n.id === id ? {...n, unread: false} : n))
→ supabase.from('notifications').update({ read_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', user.id)
→ on error: silent (optimistic state stays — non-critical)
```

### 3c. markAllRead()

```
→ if !user: return
→ optimistic: setNotifications(prev => prev.map(n => ({...n, unread: false})))
→ supabase.from('notifications').update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id).is('read_at', null)
→ on error: silent
```

---

## 4. Type Mapping

### Supabase `type` → Lovable `kind`

```ts
function typeToKind(type: string): NotificationItem['kind'] {
  if (type === 'new_follower' || type === 'user_followed') return 'follow';
  if (type === 'post_liked' || type === 'like_on_video') return 'like';
  if (type === 'post_commented' || type === 'comment_on_video' || type === 'reply_to_comment') return 'comment';
  if (type === 'post_saved') return 'boost';
  return 'trey';
}
```

### Notification text derivation

```ts
function deriveText(row: SupabaseNotification, actor?: ActorProfile): string {
  const name = actor?.display_name ?? 'Someone';
  if (row.type === 'post_liked' || row.type === 'like_on_video') return 'liked your post';
  if (row.type === 'post_commented' || row.type === 'comment_on_video') return 'commented on your post';
  if (row.type === 'reply_to_comment') return 'replied to your comment';
  if (row.type === 'new_follower' || row.type === 'user_followed') return 'started following you';
  if (row.type === 'post_saved') return 'saved your post';
  return row.message ?? 'sent you a notification';
}
```

### Relative time

```ts
function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}
```

### Supabase row → `NotificationItem`

| Supabase field | `NotificationItem` field | Notes |
|---|---|---|
| `id` | `id` | |
| `type` | `kind` | via `typeToKind()` |
| actor profile | `who` | `{ name: display_name, avatar: avatar_url, handle: username }` |
| derived | `text` | via `deriveText()` |
| `created_at` | `time` | via `timeAgo()` |
| `read_at === null` | `unread` | `true` if null |
| `post_id` | `to` | `post_id ? '/feed' : undefined` (no deep link in this phase) |

---

## 5. Changes to `NotificationsPopover.tsx`

Minimal — three targeted changes only:

1. **Import** `useNotifications` at the top.
2. **Replace** the hardcoded `items` constant with `const { notifications: items, unreadCount, markRead, markAllRead } = useNotifications()`.
3. **Wire** the footer "Mark all as read" button: add `markAllRead()` call alongside the existing `toast.success(...)`.
4. **Wire** each item's click handler: add `markRead(n.id)` call.
5. **Replace** the hardcoded `unread` count in the header with `unreadCount`.

The `N` type in the popover is replaced by `NotificationItem` from the hook (same shape). Filter tab logic operates on `items` as before — no change needed.

---

## 6. Internal Supabase Types

```ts
type SupabaseNotificationRow = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  message: string | null;
  read_at: string | null;
  created_at: string;
  post_id: string | null;
  comment_id: string | null;
  video_id: string | null;
};

type ActorProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  verification_type: string | null;
};
```

These are internal to `use-notifications.ts` and not exported.

---

## 7. Files Changed

| File | Change |
|---|---|
| `src/hooks/use-notifications.ts` | New file |
| `src/components/layout/NotificationsPopover.tsx` | 5 targeted edits (import, replace items, wire markRead/markAllRead/unreadCount) |

No other files touched. `activity-store.tsx`, `notifications.tsx` route, and `activity.tsx` route are untouched.

---

## 8. Rollback Plan

Before modifying `NotificationsPopover.tsx`, the hardcoded `items` array is preserved as a comment block at the bottom of the file. To rollback: delete the `useNotifications()` call, uncomment the mock array, remove the import. One-minute revert.

---

## 9. Validation

```
pnpm tsc --noEmit   # zero errors
pnpm build          # clean build
```

No browser, no Playwright, no screenshots.
