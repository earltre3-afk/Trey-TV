# Tradio Broadcast Studio Pass 7: Interactive Chat & Live Host Polls

## 1. What Was Built

Tradio Broadcast Studio Pass 7 adds listener participation to the Tradio Live Room. Fans tuning into public broadcasts can join timeline-linked live chat, cast votes in host polls, and react to streams in real time. Hosts, creators, and admins can pin announcements, highlight shoutouts, toggle live room features, manage slow mode, and review flagged messages.

---

## 2. Live Room Architecture

Interactive live rooms are tied to public broadcast channels or playing queue items. Permission-sensitive writes use server functions, while standard app reads use Supabase Row Level Security.

```text
Listener UI
  -> Supabase Postgres change streams
  -> Server operations for permission-sensitive writes
  -> RLS policies for direct app reads
```

---

## 3. Chat System

- Timeline-linked messages store `playback_position_seconds`.
- Roles include `listener`, `creator`, `host`, `admin`, and `system`.
- User-submitted text is escaped server-side and capped at 240 characters client-side.
- Slow mode supports configurable cooldowns such as 5 seconds.

---

## 4. Poll System

- Polls move from `draft` to `active` to `closed`.
- Logged-in and anonymous voting are supported.
- Results can show `always`, `after_vote`, `after_close`, or `never`.
- Unique constraints prevent duplicate voting unless `allow_multiple` is enabled.

---

## 5. Realtime Subscriptions

- Chat inserts append immediately.
- Poll vote inserts refresh tallies.
- Message updates handle moderation status changes.
- Offline local mode simulates chat activity for development.

---

## 6. Moderation And Reporting

- Listeners can report offensive messages.
- Reports flag the message and route it to creator/admin review.
- Authorized creators can pin, highlight, hide, remove, and close interactive items.

---

## 7. RLS And Privacy

- `tradio_live_rooms`: visible when the channel is active and public, or to the owner/admin.
- `tradio_live_chat_messages`: visible only when public and `moderation_status = 'visible'`.
- `tradio_live_polls`: public listeners can read non-draft polls.
- `tradio_live_poll_votes`: users can insert their own votes.
- `tradio_live_moderation_reports`: private to reporter, room host/creator, and admins.

---

## 8. Player Relationship

Interactive rooms use the persistent Tradio player and MiniPlayer. The room layer should never interrupt background audio playback.

---

## 9. Analytics Hooks

- Active listener heartbeats within the last 2 minutes.
- Chat message and unique chatter counts.
- Poll vote and active poll counts.
- Engagement rate by active listeners.
- Top reaction moment by playback position bucket.

---

## 10. Files Created

- `supabase/migrations/20260608000000_tradio_live_room_polls.sql`
- `src/tradio/components/tradio/types/broadcastLiveRoomTypes.ts`
- `src/tradio/components/tradio/services/broadcastLiveRoomService.ts`
- `src/tradio/components/tradio/services/broadcastPollService.ts`
- `src/tradio/components/tradio/services/broadcastModerationService.ts`
- `src/tradio/components/tradio/services/broadcastLiveRoomRealtime.ts`
- `src/lib/trey-i/broadcastLiveRoom.server.ts`
- `src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx`

---

## 11. Recommended Next Pass

Pass 8 should add in-room SFX drops and multi-mic call-ins.
