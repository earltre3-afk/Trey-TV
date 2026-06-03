# Requirements: Inbox / Direct Messages — Supabase Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Scope:** Inbox / DMs only. No notifications, rewards, creator studio, admin, or redesign.

---

## 1. Goal

Replace the 100% mock `messages-store.tsx` with real Supabase reads and writes, using the existing Lovable inbox UI unchanged. Signed-in users must be able to view, send, receive, and read-mark direct messages stored in the `direct_messages` table.

---

## 2. Schema Verification

### Table: `public.direct_messages`

| Column                 | Type                      | Notes                                                         |
| ---------------------- | ------------------------- | ------------------------------------------------------------- |
| `id`                   | `uuid` PK                 | `gen_random_uuid()`                                           |
| `sender_id`            | `uuid` FK → `profiles.id` | NOT NULL                                                      |
| `recipient_id`         | `uuid` FK → `profiles.id` | NOT NULL                                                      |
| `body`                 | `text`                    | NOT NULL                                                      |
| `read_at`              | `timestamptz`             | NULL = unread                                                 |
| `created_at`           | `timestamptz`             | NOT NULL, default `now()`                                     |
| `message_type`         | `text`                    | default `'text'`; check: text/encrypted/gif/photo/video/voice |
| `encrypted_ciphertext` | `text`                    | nullable                                                      |
| `encrypted_iv`         | `text`                    | nullable                                                      |
| `encrypted_salt`       | `text`                    | nullable                                                      |
| `encryption_version`   | `text`                    | nullable                                                      |
| `attachment_url`       | `text`                    | nullable                                                      |
| `attachment_type`      | `text`                    | nullable                                                      |
| `attachment_metadata`  | `jsonb`                   | default `'{}'`                                                |

Constraint: `sender_id <> recipient_id` (no self-messages).

### RLS Policies

| Operation | Policy                                                |
| --------- | ----------------------------------------------------- |
| SELECT    | `auth.uid() = sender_id OR auth.uid() = recipient_id` |
| INSERT    | `auth.uid() = sender_id`                              |
| UPDATE    | `auth.uid() = recipient_id` (for marking read only)   |

No service-role key is used in the browser. All queries go through the anon/user Supabase browser client and are enforced by RLS.

### Thread / Conversation Model

There is no separate `conversations` or `threads` table. Threads are derived client-side by grouping messages by the peer's `profiles.id`. The Lovable store uses `peer.handle` as the thread ID; the Supabase layer will use `peer.id` (UUID) as the canonical thread key, mapped to the Lovable `threadId` field.

---

## 3. Functional Requirements

### FR-1: Auth Guard

- If the user is not signed in, the inbox renders the existing Lovable empty/placeholder state.
- No crash, no browser alert, no redirect loop.
- The store returns empty threads and zero unread count for unauthenticated users.

### FR-2: Load Conversations (Thread List)

- On mount, fetch all `direct_messages` rows where `sender_id = me OR recipient_id = me`.
- Group rows client-side by the peer's `profiles.id` to form threads.
- Each thread exposes: peer profile (id, display_name, username, avatar_url, verification), last message preview, unread count, last message timestamp.
- Threads are sorted by most recent message descending.
- Limit: 40 messages on initial load (covers most recent threads adequately).

### FR-3: Load Messages Within a Thread

- When a thread is opened, display all messages for that peer pair already loaded in FR-2.
- Messages are sorted ascending by `created_at`.
- Each message maps to the Lovable `Message` shape: `{id, threadId, from:'me'|'them', text, ts, status}`.
- `status` is derived: if `from === 'me'` and `read_at` is set → `'read'`; else `'delivered'`.

### FR-4: Send a Message

- Inserting a new row into `direct_messages` with `sender_id = auth.uid()`, `recipient_id = peer.id`, `body = text`, `message_type = 'text'`.
- On success, optimistically append the message to local state with `status: 'sent'`.
- On error, surface a toast (using existing `sonner` toast) and do not crash.
- Signed-out users: send button is disabled or shows a sign-in prompt (no crash).

### FR-5: Mark Messages as Read

- When a thread is opened, update `read_at = now()` for all rows where `recipient_id = auth.uid()` AND `read_at IS NULL` AND the peer matches.
- This uses the RLS-allowed UPDATE policy (`recipient_id = auth.uid()`).
- Unread count in the thread list updates reactively after marking.

### FR-6: Peer Profile Resolution

- Peer profiles are loaded as joined data from the `profiles` table via the FK joins on `sender_id` and `recipient_id`.
- Required profile fields: `id`, `display_name`, `username`, `avatar_url`, `verification_type` (for badge).
- Do not query `profiles.is_creator` (column does not exist in current schema).
- Do not query `profiles.age` or `profiles.date_of_birth`.

### FR-7: Signed-Out Graceful Handling

- `useCurrentUser()` returns `null` when unauthenticated.
- The messages hook/store detects `null` user and returns: `threads = []`, `totalUnread = 0`, all operations are no-ops.
- No `window.alert`, no thrown errors, no broken renders.

### FR-8: Visual Preservation

- The Lovable inbox route (`src/routes/inbox.tsx`) is not modified structurally.
- All existing UI elements (tabs, thread list, chat panel, composer, AI suggestions, activity tab, requests tab) remain visually identical.
- The only change to `inbox.tsx` is replacing the mock `useMessages()` import source if the store is moved/replaced.

### FR-9: No Private Data Exposure

- Do not expose `service_role` key in the Vite app.
- Do not log or render raw Supabase error objects to the UI.
- Do not expose `date_of_birth`, `email`, or other PII fields from joined profiles.

### FR-10: Realtime (Optional / Phase 2)

- Realtime subscription for new incoming messages is out of scope for this phase.
- The store will support a manual refresh or polling pattern as a future extension point.
- The interface contract must not block realtime being added later.

---

## 4. Non-Functional Requirements

- **Build safety:** Every change must pass `pnpm tsc --noEmit` and `pnpm build` before being considered done.
- **No browser validation:** No Playwright, no screenshots, no Read URL checks unless explicitly requested.
- **Rollback safety:** The mock store must remain importable as a fallback. The new Supabase store is a drop-in replacement with the same exported interface.
- **No new dependencies:** Use only packages already in `package.json` (`@supabase/supabase-js`, `sonner`, existing React hooks).
- **No redesign:** Do not import RESTORE UI components. Do not alter Lovable component structure.

---

## 5. Out of Scope

- Message encryption (AES-GCM fields exist in schema but are not wired in this phase)
- Attachment uploads (attachment_url/type/metadata columns exist but are not used)
- Realtime push for incoming messages
- Message requests / accept-decline flow (UI exists but remains mock)
- Activity tab (remains mock — driven by notifications, separate feature)
- Notifications
- Rewards
- Creator Studio
- Admin tools
