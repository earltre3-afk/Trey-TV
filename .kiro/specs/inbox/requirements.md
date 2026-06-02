# Requirements — Wire Inbox / Direct Messages to Supabase

## Context

The Lovable inbox (`src/routes/inbox.tsx`) is a full-featured DM UI backed by a mock
localStorage store (`src/lib/messages-store.tsx`). It shows a conversation list on the
left and a chat panel on the right. Threads are keyed by `peer.handle` (string).
The goal is to replace the localStorage internals with real `direct_messages` DB reads
and writes while keeping the identical public API and all UI unchanged.

---

## Functional Requirements

### FR-1 Load conversations on mount

When a signed-in user opens the inbox, their conversations must be loaded from
`direct_messages` where `sender_id = auth.uid()` OR `recipient_id = auth.uid()`.
Conversations are derived by grouping on the peer's `profiles.id`.

### FR-2 Load messages for a thread

When a thread is opened, messages must be fetched from `direct_messages` for the
pair `(auth.uid(), peer_profiles_id)` ordered by `created_at asc`.

### FR-3 Send a message

A signed-in user sending a message must insert a row into `direct_messages` with:

- `sender_id = auth.uid()`
- `recipient_id = peer_profiles_id` (resolved from `public_profile_uid`)
- `body = draft text`
- `message_type = 'text'`

### FR-4 Mark messages read

When a thread is opened, unread messages sent by the peer must be marked read by
setting `read_at = now()` on rows where `recipient_id = auth.uid()` and `read_at IS NULL`.
This is permitted by the RLS UPDATE policy for recipients.

### FR-5 Unread count

`unreadOf(threadId)` must return the count of messages where `recipient_id = auth.uid()`
and `read_at IS NULL` for that thread.

### FR-6 Peer profile resolution

The store receives `{ id: public_profile_uid, handle, name, avatar }` from the UI.
`public_profile_uid` must be resolved to `profiles.id` (UUID) before any DB write.
This is the same pattern used in the follows implementation.

### FR-7 Simulated auto-reply removed

The mock `send()` function simulates a reply after 2.8 seconds. This simulation
must be removed for real DB threads. Mock threads (non-UUID peers) may keep it.

### FR-8 Mock fallback for non-UUID peers

When a thread's peer `id` is a mock string (e.g. `"chris"`, `"treyi"`), fall back
to localStorage behavior. Do not attempt DB reads or writes.

### FR-9 Signed-out graceful handling

If no Supabase session exists, the inbox must render using mock/seed data only.
No crash, no error state.

### FR-10 No private data exposed

Do not expose `sender_id` or `recipient_id` UUIDs in the `Message` or `Peer` shape.
The UI only sees `from: "me" | "them"`, `text`, `ts`, `status`.

### FR-11 Encrypted fields excluded

`encrypted_ciphertext`, `encrypted_iv`, `encrypted_salt`, `encryption_version` are
out of scope. Do not read or write them. `message_type` must always be `'text'`.

### FR-12 Attachment fields excluded

`attachment_url`, `attachment_type`, `attachment_metadata` are out of scope.

### FR-13 RLS respected

- SELECT: `sender_id = auth.uid() OR recipient_id = auth.uid()`
- INSERT: `sender_id = auth.uid()`
- UPDATE (read_at only): `recipient_id = auth.uid()`
- No DELETE policy exists — do not attempt deletes.

### FR-14 Lovable UI unchanged

No JSX, layout, color, or component structure may change in `inbox.tsx`.

### FR-15 TypeScript passes

`pnpm tsc --noEmit` must pass with zero errors.

### FR-16 Build passes

`pnpm build` must complete with zero errors.

---

## Out of Scope

- Encrypted messages
- Attachment/media messages
- Message deletion
- Real-time subscriptions (Supabase Realtime)
- Friend requests wiring
- Activity tab wiring
- Requests tab wiring
- Pagination of messages
