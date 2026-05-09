# Tasks: Inbox / Direct Messages — Supabase Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Prerequisite:** requirements.md and design.md approved.

---

## Task 1 — Preserve the mock store as a rollback target

**Files involved:**
- `src/lib/messages-store.tsx` (read-only in this task)
- `src/lib/messages-store.mock.tsx` (new file — copy of current mock)

**What to do:**
Copy the current `messages-store.tsx` to `messages-store.mock.tsx` verbatim. Do not modify either file. This is the rollback artifact.

**Acceptance criteria:**
- `messages-store.mock.tsx` exists and is byte-for-byte identical to the current `messages-store.tsx`.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** No UI change. This task touches no route files.

**Rollback risk:** None. Additive only.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

---

## Task 2 — Define Supabase types for direct_messages

**Files involved:**
- `src/lib/messages-store.tsx` (add types only, no logic change yet)

**What to do:**
Add a `SupabaseDM` type at the top of `messages-store.tsx` that mirrors the Supabase row shape returned by the joined query. This type is used only internally and does not affect the exported `Ctx` interface.

```ts
type SupabaseDMProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  verification_type: string | null;
};

type SupabaseDM = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
  message_type?: string | null;
  sender: SupabaseDMProfile | null;
  recipient: SupabaseDMProfile | null;
};
```

**Acceptance criteria:**
- Types compile without error.
- No exported interface changes.
- `pnpm tsc --noEmit` passes.

**Visual preservation:** No UI change.

**Rollback risk:** None. Types only.

**Terminal validation:**
```
pnpm tsc --noEmit
```

---

## Task 3 — Add helper functions: row → Lovable shape

**Files involved:**
- `src/lib/messages-store.tsx`

**What to do:**
Add two pure helper functions (no side effects, no Supabase calls):

1. `dmProfileToPeer(profile: SupabaseDMProfile): Peer` — maps a joined profile row to the Lovable `Peer` shape.
2. `dmRowsToState(rows: SupabaseDM[], myId: string): { threads: ThreadMeta[]; messages: Message[] }` — groups raw rows into threads and messages.

Rules for `dmProfileToPeer`:
- `id` = profile.id
- `name` = `profile.display_name ?? profile.username ?? 'Unknown'`
- `handle` = `profile.username ?? profile.id`
- `avatar` = `profile.avatar_url ?? '/placeholder-user.jpg'`
- `verified` = `profile.verification_type === 'gold' ? 'creator' : profile.verification_type === 'green' ? 'user' : undefined`
- `online` = `false`

Rules for `dmRowsToState`:
- Thread ID = peer's `profiles.id` (UUID string)
- `from` = `row.sender_id === myId ? 'me' : 'them'`
- `ts` = `new Date(row.created_at).getTime()`
- `status` = `row.from === 'me' && row.read_at != null ? 'read' : 'delivered'`
- `myLastReadAt` per thread = max `created_at` of rows where `from === 'them'` and `read_at != null`
- `lastReadAt` per thread = 0 (not tracked client-side in this phase)

**Acceptance criteria:**
- Functions are pure and have no Supabase imports.
- `pnpm tsc --noEmit` passes.
- No exported interface changes.

**Visual preservation:** No UI change.

**Rollback risk:** None. Internal helpers only.

**Terminal validation:**
```
pnpm tsc --noEmit
```

---

## Task 4 — Replace mock state with Supabase fetch on mount

**Files involved:**
- `src/lib/messages-store.tsx`
- `src/lib/supabase-browser.ts` (read-only reference)
- `src/hooks/use-current-user.ts` (read-only reference)

**What to do:**
In `MessagesProvider`:

1. Import `supabase` from `@/lib/supabase-browser`.
2. Import `useCurrentUser` from `@/hooks/use-current-user`.
3. Replace the `SEED_THREADS` / `SEED_MSGS` initial state with `[]`.
4. Remove the `localStorage` hydration `useEffect`.
5. Remove the `localStorage` persistence `useEffect`.
6. Add a `useEffect` that:
   - Reads `user` from `useCurrentUser()`.
   - If `user` is null: sets `threads = []`, `messages = []`, returns.
   - If `user` exists: queries `direct_messages` with the joined select (see design.md §2a).
   - On success: calls `dmRowsToState(rows, user.id)` and sets state.
   - On error: sets `threads = []`, `messages = []` (silent fail).
7. Add a `loading` state (internal only, not in `Ctx`).

The `SEED_PEERS` constant and mock data imports can be removed. The `creators` import from `mock-data` can be removed if no longer used.

**Acceptance criteria:**
- Signed-in user: threads load from Supabase on mount.
- Signed-out user: threads = [], no crash, no alert.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- Lovable inbox UI renders without visual change.

**Visual preservation:** The inbox UI renders identically. If no messages exist in Supabase, the thread list is empty — this is correct behavior, not a regression.

**Rollback risk:** Medium. This removes mock seed data. If Supabase is unreachable, the inbox shows empty. Rollback: swap import back to `messages-store.mock.tsx`.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

---

## Task 5 — Wire send() to Supabase insert

**Files involved:**
- `src/lib/messages-store.tsx`

**What to do:**
Replace the mock `send()` implementation:

1. If `user` is null: return (no-op).
2. Look up `peerIdFromThreadId(threadId)` — the thread ID is the peer's UUID, so this is a direct lookup from `threads` state.
3. Optimistically append a `Message` with a temporary `id` (`crypto.randomUUID()`), `status: 'sent'`.
4. Call `supabase.from('direct_messages').insert({ sender_id: user.id, recipient_id: peerId, body: text, message_type: 'text' })`.
5. On success: replace the optimistic message with the real row (update `id` and set `status: 'delivered'`).
6. On error: remove the optimistic message, call `toast.error('Message failed to send')`.

Remove the simulated reply `setTimeout` blocks.

**Acceptance criteria:**
- Sending a message inserts a row in `direct_messages`.
- Optimistic message appears immediately.
- On error, message is removed and toast fires.
- Signed-out: send is a no-op.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** The send button and composer UI are unchanged. The optimistic message appears in the same bubble style as before.

**Rollback risk:** Medium. Rollback: swap to mock store.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

---

## Task 6 — Wire markRead() to Supabase update

**Files involved:**
- `src/lib/messages-store.tsx`

**What to do:**
Replace the mock `markRead()` implementation:

1. If `user` is null: return (no-op).
2. Get the peer UUID from `threads` state by `threadId`.
3. Call:
   ```
   supabase
     .from('direct_messages')
     .update({ read_at: new Date().toISOString() })
     .eq('recipient_id', user.id)
     .is('read_at', null)
     .eq('sender_id', peerId)
   ```
4. On success: update local message state to set `read_at` on affected rows, update `myLastReadAt` in thread meta.
5. On error: silent fail (non-critical).

**Acceptance criteria:**
- Opening a thread marks unread messages as read in Supabase.
- Unread count drops to 0 for that thread after marking.
- Signed-out: no-op.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** The unread badge count updates correctly. No visual change to the chat panel.

**Rollback risk:** Low. This is an additive update path. Rollback: swap to mock store.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

---

## Task 7 — Wire ensureFromHandle() to profile lookup

**Files involved:**
- `src/lib/messages-store.tsx`

**What to do:**
Replace the mock `ensureFromHandle(handle)` implementation:

1. If thread already exists in local state with matching `peer.handle`: return its `id`.
2. If `user` is null: return `null`.
3. Query `supabase.from('profiles').select('id,display_name,username,avatar_url,verification_type').eq('username', handle).single()`.
4. On success: call `openThread(dmProfileToPeer(profile))` and return the new thread ID.
5. On error or not found: return `null`.

This supports the `?to=<handle>` URL param used by the inbox route.

**Acceptance criteria:**
- Navigating to `/inbox?to=somehandle` opens a thread for that user if they exist in `profiles`.
- If the handle does not exist, no crash — thread list stays as-is.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** No UI change. The `?to=` flow works as before, now with real profiles.

**Rollback risk:** Low. Rollback: swap to mock store.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

---

## Task 8 — Final build verification and cleanup

**Files involved:**
- `src/lib/messages-store.tsx`
- `src/lib/mock-data.ts` (verify still used elsewhere before removing any imports)

**What to do:**
1. Remove any unused imports from `messages-store.tsx` (e.g., `creators` from `mock-data` if no longer referenced).
2. Verify `mock-data.ts` is still used by other files before removing it.
3. Run full build and type check.
4. Confirm `messages-store.mock.tsx` exists as rollback artifact.

**Acceptance criteria:**
- Zero TypeScript errors: `pnpm tsc --noEmit`.
- Clean production build: `pnpm build`.
- No unused imports in `messages-store.tsx`.
- `messages-store.mock.tsx` exists.

**Visual preservation:** No UI change.

**Rollback risk:** None. Cleanup only.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

---

## Summary Table

| # | Task | Files | Risk | Validation |
|---|---|---|---|---|
| 1 | Preserve mock as rollback | messages-store.mock.tsx | None | tsc + build |
| 2 | Define SupabaseDM types | messages-store.tsx | None | tsc |
| 3 | Add row→shape helpers | messages-store.tsx | None | tsc |
| 4 | Replace mock state with Supabase fetch | messages-store.tsx | Medium | tsc + build |
| 5 | Wire send() to insert | messages-store.tsx | Medium | tsc + build |
| 6 | Wire markRead() to update | messages-store.tsx | Low | tsc + build |
| 7 | Wire ensureFromHandle() to profile lookup | messages-store.tsx | Low | tsc + build |
| 8 | Final cleanup and verification | messages-store.tsx | None | tsc + build |

All tasks are sequential. Do not start a task until the previous task's validation passes.
