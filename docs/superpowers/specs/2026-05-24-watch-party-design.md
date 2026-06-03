# Watch Parties + Public Channel Chat — Design Spec

**Date:** 2026-05-24
**Owner:** californiatrey@gmail.com
**Status:** Approved for implementation

---

## 1. Goal

Two related real-time features for Trey TV:

1. **Private watch party** — a host streams any live Trey TV channel and invites up to 10 viewers to watch together. The party has private text chat and voice-mic. Host controls: change the channel, kick viewers, mute viewers' chat or mic, invite by link or by picking from followers.
2. **Public per-channel community chat** — a 24/7 text-only chat panel that sits underneath the live video on every `/channel/$handle` page. No voice. Anyone signed in can post (subject to AI moderation and rate limiting).

Both flows are gated by Trey-I AI moderation (Gemini 2.5 Flash via the existing `vertex.server.ts` plumbing).

## 2. Non-goals (Phase 1)

- Co-host promotion (only one host per party)
- Past-party browse or "rewind"
- Persistent voice recordings (mic is ephemeral)
- Mobile push notifications for invites (deep link only)
- Emoji reactions during playback (chat is text only)
- Image/GIF uploads in chat (text only)
- Voice / mic AI moderation (Phase 2 — Phase 1 lets hosts mute mic manually)
- Frame-accurate video sync between members (each viewer's HLS session drifts ±5–15s)

## 3. High-level architecture

```
┌─ /channel/$handle (public) ────────────────────────────────────────────┐
│ <Hero / metadata>                                                      │
│ ┌──────────────────────────────────────────────────────────────┐       │
│ │ LIVE NOW Pluto iframe (existing — added in previous session)  │      │
│ └──────────────────────────────────────────────────────────────┘       │
│ "Start watch party →" (new — only visible to signed-in users)          │
│ ┌──────────────────────────────────────────────────────────────┐       │
│ │ PUBLIC COMMUNITY CHAT (Supabase Realtime · per-channel)      │       │
│ │ No mic. Text only. AI-moderated.                             │       │
│ └──────────────────────────────────────────────────────────────┘       │
└────────────────────────────────────────────────────────────────────────┘

┌─ /watch-party/$id (private) ───────────────────────────────────────────┐
│ ┌────────────────────────────────┐  ┌──────────────────────────────┐   │
│ │ Synced Pluto iframe            │  │ MEMBERS (avatars · up to 11) │   │
│ │ (channel from party row;       │  │ Host-only popovers on each:  │   │
│ │  swap broadcast over Realtime) │  │  - Kick                      │   │
│ └────────────────────────────────┘  │  - Mute chat                 │   │
│ ┌────────────────────────────────┐  │  - Mute mic                  │   │
│ │ PARTY CHAT (Realtime · party_  │  ├──────────────────────────────┤   │
│ │ scoped) + AI mod                │  │ HOST CONTROLS                │   │
│ ├────────────────────────────────┤  │  - Change channel ▾          │   │
│ │ MIC BAR (LiveKit room          │  │  - Invite ▾ (link / followers)│  │
│ │ wp:<party_id>)                 │  │  - End party                 │   │
│ └────────────────────────────────┘  └──────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

## 4. Real-time transport matrix

| Concern                       | Tech                                                                             | Why                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Text chat persistence         | Postgres table `chat_messages`                                                   | Need history + RLS + AI mod audit                                                                 |
| Text chat delivery            | Supabase Realtime `postgres_changes` on `chat_messages` filtered by `scope_id`   | Already in stack; free; persistent                                                                |
| Channel-change push           | Supabase Realtime `broadcast` on topic `wp:<id>`                                 | No DB write needed for the broadcast itself; row update on `watch_parties` is the source of truth |
| Member presence (online dots) | Supabase Realtime `presence`                                                     | Built-in, free                                                                                    |
| Mic / voice                   | LiveKit room `wp:<party-id>`                                                     | Already wired in `livekit-token.server.ts`; add `"watch-party"` RoomKind                          |
| Force-mute mic                | `RoomServiceClient.updateParticipant({ canPublish: false })` on `muted_mic=true` | Native LiveKit feature, instant                                                                   |

## 5. Data model

Three new tables. All have RLS enabled.

### 5.1 `watch_parties`

```sql
create table watch_parties (
  id            uuid primary key default gen_random_uuid(),
  host_id       uuid not null references auth.users(id) on delete cascade,
  channel_id    text not null,                       -- Trey TV channel id (e.g. "ch-zay")
  name          text,                                -- optional party name set by host
  invite_token  text not null unique default replace(gen_random_uuid()::text, '-', ''),
  max_members   int not null default 10,             -- enforced via trigger
  created_at    timestamptz not null default now(),
  ended_at      timestamptz
);

create index on watch_parties (host_id);
create index on watch_parties (invite_token) where ended_at is null;
```

### 5.2 `party_members`

```sql
create table party_members (
  party_id    uuid not null references watch_parties(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('host','member')),
  muted_chat  boolean not null default false,
  muted_mic   boolean not null default false,
  kicked      boolean not null default false,
  joined_at   timestamptz not null default now(),
  primary key (party_id, user_id)
);

create index on party_members (user_id) where kicked = false;
```

**Enforcement trigger** — fires on INSERT to enforce `max_members`:

```sql
create function enforce_party_max_members() returns trigger language plpgsql as $$
declare
  cap int;
  active_count int;
begin
  select max_members into cap from watch_parties where id = new.party_id;
  select count(*) into active_count from party_members
    where party_id = new.party_id and kicked = false;
  if active_count >= cap then
    raise exception 'party_full' using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger party_members_max
before insert on party_members
for each row execute function enforce_party_max_members();
```

### 5.3 `chat_messages`

```sql
create table chat_messages (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('party','public')),
  scope_id      text not null,            -- party_id::text for party, channel handle for public
  sender_id     uuid not null references auth.users(id) on delete cascade,
  body          text not null check (length(body) between 1 and 500),
  created_at    timestamptz not null default now()
);

create index on chat_messages (kind, scope_id, created_at desc);
create index on chat_messages (sender_id, created_at desc);   -- for rate limiting
```

### 5.4 `chat_moderation_events` (audit)

```sql
create table chat_moderation_events (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references auth.users(id) on delete cascade,
  message_text  text not null,
  verdict       text not null check (verdict in ('clean','nudge','block','timeout')),
  severity      text not null check (severity in ('none','low','medium','high')),
  reason        text,
  kind          text not null check (kind in ('party','public')),
  scope_id      text not null,
  created_at    timestamptz not null default now()
);

create index on chat_moderation_events (sender_id, created_at desc);
```

## 6. RLS policies (plain English + SQL)

**`watch_parties`**

- SELECT: only members of the party (`exists(select 1 from party_members where party_id=watch_parties.id and user_id=auth.uid() and kicked=false)`) OR a row matched by `invite_token` for join lookup (separate policy with a one-shot SELECT scoped to the token).
- INSERT: any authed user; trigger ensures `host_id = auth.uid()`.
- UPDATE: `auth.uid() = host_id`.

**`party_members`**

- SELECT: party members (`exists(select 1 from party_members pm2 where pm2.party_id=party_members.party_id and pm2.user_id=auth.uid() and pm2.kicked=false)`).
- INSERT: only the host (`exists(select 1 from watch_parties where id=party_id and host_id=auth.uid())`) OR via a server function `accept_party_invite(invite_token)` that validates the token and inserts as `member`.
- UPDATE: host on any member row; self-update only allowed for setting `kicked=true` (leave party).

**`chat_messages`**

- SELECT:
  - `kind='public'`: anyone authed.
  - `kind='party'`: only members of that party.
- INSERT: blocked at app level; clients call `post_chat_message(kind, scope_id, body)` server function which runs Trey-I moderation, increments rate-limit counters, then writes the row.

**`chat_moderation_events`**

- SELECT: admins only (`auth.jwt() ->> 'role' = 'admin'`) — used for tuning the moderation prompt.
- INSERT: only by the `post_chat_message` server function.

## 7. Server functions

### 7.1 `post_chat_message(kind, scope_id, body) → message_id | error`

Pseudocode:

```ts
async function postChatMessage(kind, scopeId, body, userId) {
  // 1. Authorization
  if (kind === "party") {
    requireActivePartyMember(scopeId, userId); // membership + not muted_chat + not kicked
  } else {
    requireSignedIn(userId);
  }

  // 2. Rate limit: 5 msgs per 10 seconds per user
  const recent = await db.query`select count(*) from chat_messages
    where sender_id = ${userId} and created_at > now() - interval '10 seconds'`;
  if (recent >= 5) return { error: "rate_limited" };

  // 3. AI moderation — Trey-I
  const verdict = await moderateChat(body); // calls vertex.server.ts with task "moderate_chat"
  await db.insert("chat_moderation_events", {
    sender_id: userId,
    message_text: body,
    ...verdict,
    kind,
    scope_id: scopeId,
  });

  if (verdict.verdict === "block") return { error: "blocked", reason: verdict.reason };
  if (verdict.verdict === "timeout") {
    await autoMute(userId, scopeId, "5 minutes");
    return { error: "blocked", reason: verdict.reason, timeoutMinutes: 5 };
  }

  // 4. Repeat-offender check: 3 blocks in last 10 min → auto-timeout
  if (verdict.verdict !== "clean") {
    const offences = await db.query`select count(*) from chat_moderation_events
      where sender_id = ${userId} and created_at > now() - interval '10 minutes'
      and verdict in ('block','timeout')`;
    if (offences >= 3) {
      await autoMute(userId, scopeId, "5 minutes");
      return { error: "blocked", reason: "repeat_offender", timeoutMinutes: 5 };
    }
  }

  // 5. Insert + Realtime broadcast happens automatically via postgres_changes
  const messageId = await db.insert("chat_messages", {
    kind,
    scope_id: scopeId,
    sender_id: userId,
    body,
  });
  return { message_id: messageId, nudge: verdict.verdict === "nudge" ? verdict.reason : null };
}
```

### 7.2 `accept_party_invite(invite_token) → party_id | error`

- Looks up party by token (must not be `ended_at`).
- Inserts a `party_members` row (member role) — trigger enforces 10-member cap.
- Returns `party_id` for client redirect.

### 7.3 `change_party_channel(party_id, channel_id) → ok | error`

- Host-only.
- `UPDATE watch_parties SET channel_id = $2 WHERE id = $1 AND host_id = auth.uid()`.
- Members subscribed to `postgres_changes` on `watch_parties` row pick up the change.

### 7.4 `set_member_flag(party_id, user_id, field, value)` (host action)

- One function handles `kick`, `muted_chat`, `muted_mic`.
- For `muted_mic`: also calls LiveKit `RoomServiceClient.updateParticipant({ permission: { canPublish: !value } })` server-side.

## 8. AI moderation (Trey-I)

### 8.1 New `VertexTask`

Add to `src/lib/trey-i/vertex.server.ts`:

```ts
export type VertexTask /* existing */ = "moderate_chat";

SYSTEM_PROMPTS.moderate_chat = `
You are a real-time chat moderator for Trey TV. Evaluate the user's message
for safety. Reply with ONLY a JSON object on a single line:

{ "verdict": "clean" | "nudge" | "block" | "timeout",
  "severity": "none" | "low" | "medium" | "high",
  "reason": "short human-readable reason or empty" }

Rules:
- "clean": normal speech, banter, profanity directed at no one. Severity: none.
- "nudge": rude, heated, or borderline. Publish anyway with a private warning. Severity: low.
- "block": insults at a specific person, harassment, sexual content, spam links,
  doxxing, self-harm encouragement, hate-speech. Severity: medium.
- "timeout": slurs, threats, illegal content, sexualized minors. Severity: high.
  Also triggers an auto-mute.

Be conservative — when in doubt, prefer "nudge" over "block". Trey TV
embraces creator energy; we don't censor harmless trash-talk.
`;
```

Call with temperature 0, max tokens 80, response timeout 800ms (with safe fallback to `clean` on timeout so chat doesn't die if Gemini is slow).

### 8.2 Moderation flow client-side

1. User types, hits enter.
2. Message appears in their own chat list immediately, greyed out with a small spinner.
3. Server processes (rate limit → AI mod → insert).
4. On success: row appears via Realtime, optimistic row reconciles (matched by client-generated tempId).
5. On `block`: optimistic row turns red, strike-through, small badge "blocked by Trey-I: <reason>". Visible only to sender.
6. On `nudge`: row stays normal, toast at top: "Trey-I says: <reason>".
7. On `timeout`: same as block + sender's input is disabled with countdown "muted 4:58".

### 8.3 Cost

Gemini 2.5 Flash @ $0.075/1M input tokens. Per message: ~120 input tokens. 100K messages/month ≈ $0.90/month.

## 9. Frontend routes + components

### 9.1 New TanStack route

- `src/routes/watch-party.$id.tsx` — the private party page. Validates membership on load, subscribes to Realtime channels, mounts LiveKit voice, renders chat + members + host controls.

### 9.2 New components

- `src/components/watch-party/PartyVideo.tsx` — Pluto iframe driven by `party.channel_id`. Listens for channel-change broadcasts.
- `src/components/watch-party/PartyChat.tsx` — chat panel with AI moderation feedback.
- `src/components/watch-party/PartyMic.tsx` — LiveKit `<RoomAudioRenderer />` + per-participant mute buttons.
- `src/components/watch-party/MembersPanel.tsx` — avatars list with host control popovers.
- `src/components/watch-party/HostControls.tsx` — change-channel dropdown, invite drawer, end-party button.
- `src/components/watch-party/InviteModal.tsx` — copy link + pick-from-followers list.
- `src/components/chat/ChannelChatPanel.tsx` — public per-channel chat used on `/channel/$handle`.
- `src/components/chat/ChatComposer.tsx` — shared composer with AI mod feedback.
- `src/components/chat/ChatMessageList.tsx` — shared message list.

### 9.3 Edits to existing files

- `src/lib/livekit-token.server.ts` — add `"watch-party"` to `RoomKind`, resolve `roomName = wp:<party_id>`, grants based on `muted_mic`.
- `src/lib/trey-i/vertex.server.ts` — add `"moderate_chat"` task + system prompt.
- `src/routes/channel.$handle.tsx` — add `"Start watch party"` button + `<ChannelChatPanel>` under the LIVE NOW iframe.

No edit to `src/server.ts` is needed — all watch-party RPCs are exposed via `createServerFn` (see §11).

## 10. Invite flow

1. Host clicks "Invite" → opens `<InviteModal>`.
2. Modal shows:
   - "Copy link" → `${origin}/watch-party/${id}?join=${invite_token}`.
   - Follower picker — searchable list of the host's followers; tap to add. Calls a separate `host_add_member(party_id, user_id)` server fn that INSERTs a `party_members` row directly (skips token). Subject to the same 10-member trigger.
3. Friend opens the link.
4. Client checks `auth` — if not signed in, redirect to `/login?next=/watch-party/${id}?join=${token}`.
5. Client calls `accept_party_invite(token)` server function → row inserted (or `party_full` error).
6. On success, client navigates to `/watch-party/${id}` (without the token in URL).
7. Token can be rotated by host via "Reset invite link".

## 11. Server-function plumbing

Two reasonable patterns; we'll use the second because the project already prefers TanStack server fns for non-OAuth API surface:

1. ~Add to `src/server.ts` via `handleWatchPartyApiRequest`~ (verbose for many functions).
2. **createServerFn** per RPC in `src/lib/watch-party/party.server.ts`. Each function uses the Supabase service-role client where it needs to bypass RLS for moderation, and the user-scoped client for membership checks.

## 12. Authorization model

| Action                | Required check                                                   |
| --------------------- | ---------------------------------------------------------------- |
| Create party          | Signed in                                                        |
| Join via invite token | Signed in + token valid + party not full + not previously kicked |
| Read party row        | Member (not kicked)                                              |
| Read party chat       | Member (not kicked)                                              |
| Post party chat       | Member + not muted_chat + not rate-limited                       |
| Post public chat      | Signed in + not rate-limited                                     |
| Change channel        | Host                                                             |
| Kick member           | Host                                                             |
| Mute member chat      | Host                                                             |
| Mute member mic       | Host                                                             |
| End party             | Host                                                             |

Kicked members lose RLS access immediately — their Realtime subscription closes; client navigates them to `/`.

## 13. Abuse / safety limits

- Max 10 concurrent active members per party (DB trigger).
- Max 5 chat messages per 10s per user (server function check).
- 4-hour TTL on parties — a cron sets `ended_at = now()` on parties whose `created_at < now() - interval '4 hours'`. Members get a "party ended" message.
- AI repeat-offender auto-timeout (3 blocks in 10 min → 5 min mute).
- Per-channel public chat rate-limit same as party (5/10s shared across all chats).
- A simple admin RPC `admin_delete_message(message_id)` for emergency clean-up; UI deferred to Phase 2.

## 14. Open questions / explicit "we'll see"s

- **Notifications**: hosts may want a "your invite was accepted" toast. Out of scope Phase 1 — relies on `notifications-store` which is already there but not wired for this.
- **Reconnect after temporary network drop**: LiveKit handles itself; Supabase Realtime auto-reconnects; chat may show a "reconnecting" pill but should converge. Phase 2 to nail down edge cases.
- **What happens when the host leaves?** Phase 1: party ends immediately (`ended_at = now()`). Future: auto-promote earliest joiner to host.

## 15. Rollout

- Behind no flag — this is a real feature. But the route is auth-required; logged-out users see a "sign in to watch with friends" CTA on the entry button.
- Deploy first to a Vercel preview. Test invite + moderation manually.
- Promote to production after one successful preview party.

## 16. Implementation phases

In order, each safe to commit and ship independently:

1. **Migration + RLS + triggers + cron** (no code touches the app yet).
2. **`moderate_chat` task + `post_chat_message` server fn + audit table** (testable in isolation via the `vertex.server.ts` test pattern).
3. **Public chat panel on `/channel/$handle`** (uses #2; smaller blast radius than parties; validates the whole moderation + Realtime path on a single feature).
4. **LiveKit `"watch-party"` RoomKind extension** (token plumbing, no UI yet).
5. **`/watch-party/$id` route + components** (party video + chat; voice last).
6. **Host controls (change channel, kick, mute chat, mute mic)**.
7. **Invite flow (link + follower picker)**.
8. **"Start watch party" entry on `/channel/$handle`**.
9. **End-to-end smoke test** with two browser sessions.

---

**Acceptance criteria for "done":**

- Two real users can join a party from different machines, see the same Pluto channel, chat in real time with AI moderation showing nudges/blocks correctly, and use mic with host able to mute/unmute.
- Public chat on any channel page is live for signed-in users and rejects abusive messages via Trey-I.
- Host can kick, mute, change channel, and invite via link + follower picker.
- No regressions on existing pages.
