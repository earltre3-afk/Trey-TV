# Design: Inbox / Direct Messages — Supabase Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09

---

## 1. Architecture Overview

The Lovable inbox UI (`src/routes/inbox.tsx`) consumes a single React context hook: `useMessages()`. The entire wiring change is contained to `src/lib/messages-store.tsx`. The route file is touched only if the import path changes — and only minimally.

```
inbox.tsx
  └── useMessages()                    ← same hook interface, no change to call sites
        └── MessagesProvider           ← replaces mock state with Supabase state
              ├── useCurrentUser()     ← existing hook (src/hooks/use-current-user.ts)
              ├── supabase-browser.ts  ← existing Supabase client
              └── direct_messages      ← Supabase table via RLS
```

No new files are strictly required. The change is a rewrite of `messages-store.tsx` internals only.

---

## 2. Data Flow

### 2a. Load (mount)

```
MessagesProvider mounts
  → useCurrentUser() → user (or null)
  → if null: state = { threads: [], messages: [] }  (no Supabase call)
  → if user:
      supabase
        .from('direct_messages')
        .select('id, sender_id, recipient_id, body, read_at, created_at,
                 sender:profiles!direct_messages_sender_id_fkey(id,display_name,username,avatar_url,verification_type),
                 recipient:profiles!direct_messages_recipient_id_fkey(id,display_name,username,avatar_url,verification_type)')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(40)
      → raw rows → groupByPeer() → ThreadMeta[] + Message[]
      → setState({ threads, messages })
```

### 2b. Send

```
send(threadId, text)
  → if !user: return (no-op)
  → optimistic: append Message{from:'me', status:'sent'} to local state
  → supabase
      .from('direct_messages')
      .insert({ sender_id: user.id, recipient_id: peerIdFromThreadId(threadId), body: text, message_type: 'text' })
  → on success: update optimistic message id with real row id, status → 'delivered'
  → on error: remove optimistic message, toast.error('Failed to send')
```

### 2c. Mark Read

```
markRead(threadId)
  → if !user: return
  → supabase
      .from('direct_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', user.id)
      .is('read_at', null)
      .eq('sender_id', peerIdFromThreadId(threadId))
  → on success: update local message state (set read_at)
  → update myLastReadAt in thread meta
```

---

## 3. Thread ID Strategy

The Lovable store uses `peer.handle` (username string) as the thread ID. Supabase uses UUIDs. The new store uses `peer.id` (UUID) as the canonical thread ID internally, which is also what the Lovable UI receives as `threadId`. This is a safe change because `threadId` is an opaque string in the UI — it is never displayed, only used as a key.

The `ensureFromHandle(handle)` function will look up the profile by username via a `profiles` query if the thread does not already exist in local state.

---

## 4. Type Mapping

### Supabase row → Lovable `Message`

| Supabase field | Lovable field | Notes |
|---|---|---|
| `id` | `id` | |
| peer UUID | `threadId` | peer's `profiles.id` |
| `sender_id === user.id` | `from: 'me'` | else `'them'` |
| `body` | `text` | |
| `created_at` (ms) | `ts` | `new Date(created_at).getTime()` |
| `read_at` (if mine) | `status` | `read_at != null` → `'read'`, else `'delivered'` |

### Supabase profile join → Lovable `Peer`

| Supabase field | Lovable field | Notes |
|---|---|---|
| `id` | `id` | UUID |
| `display_name` | `name` | fallback: `username` |
| `username` | `handle` | |
| `avatar_url` | `avatar` | fallback: `/placeholder-user.jpg` |
| `verification_type` | `verified` | `'gold'` → `'creator'`, `'green'` → `'user'`, else `undefined` |
| — | `online` | always `false` (realtime out of scope) |

---

## 5. Store Interface Contract

The exported interface of `messages-store.tsx` does not change. The `Ctx` type, `useMessages()` hook, and `MessagesProvider` component keep the same signatures. This ensures `inbox.tsx` requires zero structural changes.

```ts
// Unchanged public interface
type Ctx = {
  threads: ThreadMeta[];
  messagesOf: (threadId: string) => Message[];
  unreadOf: (threadId: string) => number;
  totalUnread: number;
  send: (threadId: string, text: string) => void;
  openThread: (peer: Peer) => string;
  markRead: (threadId: string) => void;
  ensureFromHandle: (handle: string) => string | null;
};
```

Internal state changes:
- Remove: `localStorage` persistence (Supabase is the source of truth)
- Remove: mock seed data and simulated replies
- Add: Supabase fetch on mount
- Add: Supabase insert on send
- Add: Supabase update on markRead
- Add: loading state (`loading: boolean`) — used internally, not exposed in Ctx

---

## 6. Error Handling

| Scenario | Behavior |
|---|---|
| User not signed in | Empty state, all operations are no-ops |
| Supabase fetch fails | `threads = []`, no crash, no alert |
| Send fails | Optimistic message removed, `toast.error('Message failed to send')` |
| markRead fails | Silent fail (non-critical) |
| Profile join returns null | Peer rendered with fallback name/avatar |

---

## 7. Files Changed

| File | Change |
|---|---|
| `src/lib/messages-store.tsx` | Rewrite internals; keep exported interface identical |
| `src/routes/inbox.tsx` | No change (unless import path shifts, then 1-line update) |

No new files are required. No new dependencies.

---

## 8. Rollback Plan

The mock store is preserved as `src/lib/messages-store.mock.tsx`. If the Supabase store causes a build failure or runtime regression, swap the import in `MessagesProvider` back to the mock version. The interface is identical so the swap is a one-line change.

---

## 9. Validation

```
pnpm tsc --noEmit   # must pass with zero errors
pnpm build          # must produce a clean build
```

No browser, no Playwright, no screenshots.
