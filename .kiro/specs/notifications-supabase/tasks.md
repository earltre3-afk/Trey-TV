# Tasks: Notifications — Supabase Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Prerequisite:** requirements.md and design.md approved.

---

## Task 1 — Preserve mock items as rollback target

**Files involved:**

- `src/components/layout/NotificationsPopover.tsx`

**What to do:**
At the bottom of `NotificationsPopover.tsx`, add the existing hardcoded `items` array as a commented-out block labeled `// MOCK FALLBACK`. Do not change any logic. This is the rollback artifact — if the Supabase hook causes issues, uncomment and revert in under a minute.

**Acceptance criteria:**

- The comment block exists at the bottom of the file.
- No logic is changed.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** No UI change. Additive comment only.

**Rollback risk:** None.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

---

## Task 2 — Define internal Supabase types and helper functions

**Files involved:**

- `src/hooks/use-notifications.ts` (new file)

**What to do:**
Create `src/hooks/use-notifications.ts` with only types and pure helper functions — no React, no Supabase calls yet.

Include:

1. `SupabaseNotificationRow` type (internal)
2. `ActorProfile` type (internal)
3. `NotificationItem` type (exported — mirrors the `N` type in `NotificationsPopover.tsx`)
4. `typeToKind(type: string): NotificationItem['kind']` — pure function
5. `deriveText(row: SupabaseNotificationRow, actor?: ActorProfile): string` — pure function
6. `timeAgo(iso: string): string` — pure function

Export only `NotificationItem` and the three helper functions. Keep internal types unexported.

**Acceptance criteria:**

- File compiles with zero TypeScript errors.
- No React imports, no Supabase imports in this task.
- `pnpm tsc --noEmit` passes.

**Visual preservation:** No UI change. New file only.

**Rollback risk:** None. New file, nothing imports it yet.

**Terminal validation:**

```
pnpm tsc --noEmit
```

---

## Task 3 — Implement `useNotifications()` hook

**Files involved:**

- `src/hooks/use-notifications.ts`
- `src/hooks/use-current-user.ts` (read-only reference)
- `src/lib/supabase-browser.ts` (read-only reference)

**What to do:**
Add the `useNotifications()` hook to `src/hooks/use-notifications.ts`:

1. Import `useState`, `useEffect` from React.
2. Import `useCurrentUser` from `@/hooks/use-current-user`.
3. Import `supabase` from `@/lib/supabase-browser`.
4. Implement the hook:
   - If `user` is null: return `{ notifications: [], unreadCount: 0, markRead: noop, markAllRead: noop, loading: false }`.
   - On mount with user: fetch `notifications` (select fields per design.md §3a), batch-fetch actor profiles, map to `NotificationItem[]`.
   - `unreadCount` = `notifications.filter(n => n.unread).length` (derived, no extra query).
   - `markRead(id)`: optimistic update + Supabase UPDATE (see design.md §3b).
   - `markAllRead()`: optimistic update + Supabase UPDATE (see design.md §3c).
   - On fetch error: `notifications = []`, no crash, no alert.
5. Export `useNotifications` as named export.

**Acceptance criteria:**

- Hook compiles with zero TypeScript errors.
- Signed-out path returns empty state without calling Supabase.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** No UI change. Hook not yet consumed.

**Rollback risk:** Low. New file, nothing imports it yet.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

---

## Task 4 — Wire `useNotifications()` into `NotificationsPopover`

**Files involved:**

- `src/components/layout/NotificationsPopover.tsx`
- `src/hooks/use-notifications.ts` (read-only)

**What to do:**
Make five targeted edits to `NotificationsPopover.tsx`:

1. Add import: `import { useNotifications, type NotificationItem } from '@/hooks/use-notifications';`
2. Replace the local `N` type with `NotificationItem` (or alias: `type N = NotificationItem`).
3. Replace the hardcoded `const items: N[] = [...]` with:
   ```ts
   const { notifications: items, unreadCount, markRead, markAllRead } = useNotifications();
   ```
4. Replace the hardcoded `const unread = items.filter((i) => i.unread).length;` with `unreadCount` from the hook.
5. Wire the footer "Mark all as read" button: add `markAllRead()` call before the existing `toast.success(...)`.
6. Wire each item's click/link handler: add `markRead(n.id)` call when an item is clicked.

Do not change any JSX structure, class names, or layout.

**Acceptance criteria:**

- Popover renders with real data when signed in (or empty list when signed out).
- Unread count in header reflects real `read_at IS NULL` count.
- "Mark all as read" calls `markAllRead()` and fires the existing toast.
- Clicking an item calls `markRead(id)`.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** No structural, layout, or style changes to `NotificationsPopover.tsx`. The popover looks identical. If no notifications exist in Supabase, the list is empty — correct behavior, not a regression.

**Rollback risk:** Medium. Rollback: uncomment the mock `items` block from Task 1, remove the hook import and destructure, restore the hardcoded `unread` line.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

---

## Task 5 — Final cleanup and verification

**Files involved:**

- `src/hooks/use-notifications.ts`
- `src/components/layout/NotificationsPopover.tsx`

**What to do:**

1. Remove any unused imports from both files.
2. Confirm `creators` import from `mock-data` is removed from `NotificationsPopover.tsx` if no longer used.
3. Confirm `activity-store.tsx` is untouched.
4. Confirm `notifications.tsx` route is untouched.
5. Run full type check and build.

**Acceptance criteria:**

- Zero TypeScript errors: `pnpm tsc --noEmit`.
- Clean production build: `pnpm build`.
- No unused imports in modified files.
- `activity-store.tsx` and `notifications.tsx` route are byte-for-byte unchanged.
- Mock fallback comment block still present in `NotificationsPopover.tsx`.

**Visual preservation:** No UI change.

**Rollback risk:** None. Cleanup only.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

---

## Summary Table

| #   | Task                                | Files                      | Risk   | Validation  |
| --- | ----------------------------------- | -------------------------- | ------ | ----------- |
| 1   | Preserve mock as rollback           | NotificationsPopover.tsx   | None   | tsc + build |
| 2   | Types and pure helpers              | use-notifications.ts (new) | None   | tsc         |
| 3   | Implement useNotifications() hook   | use-notifications.ts       | Low    | tsc + build |
| 4   | Wire hook into NotificationsPopover | NotificationsPopover.tsx   | Medium | tsc + build |
| 5   | Final cleanup and verification      | both                       | None   | tsc + build |

All tasks are sequential. Do not start a task until the previous task's validation passes.

---

## Do Not Touch

- `src/lib/activity-store.tsx` — local user action tracking, separate concern
- `src/routes/activity.tsx` — local activity history, separate concern
- `src/routes/notifications.tsx` — ComingSoonPage stub, leave as-is
- Any RESTORE UI components
