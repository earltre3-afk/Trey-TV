# Trey TV Game Room — Module

Premium online card game module for Trey TV. Plug into the existing Games tab.

## What's inside

- **Live multiplayer rooms** — Supabase-backed `game_rooms`, `game_room_players`, `game_sessions`, `game_moves`, `game_scores`. Realtime sync via `postgres_changes` and per-room broadcast channels. Reconnect resumes your seat using the saved guest identity in `localStorage`.
- **6-character room codes** — Generated server-side with collision retry. Public or private. `joinRoomByCode()` evicts a bot if the table is full of bots.
- **Bot fallback** — Host can fill empty seats with bots in one tap. Bots are driven exclusively by the **host** seat (authoritative engine pattern), so all clients see the same outcome.
- **Flagship Spades** — full bidding, trick-taking, trump logic (Blades = Spades), team scoring, bag penalties, multi-round play to a target score (default 500).

- **Custom Trey TV Deck** — neon-styled cards rendered to match the uploaded artwork aesthetic, with full rank/suit mapping (Blades/Soul/Crowns/Sparks → Spades/Hearts/Diamonds/Clubs).
- **Suit Legend Modal** — players always know how custom suits map to real gameplay.

## File layout

```
src/features/games/
├── GameRoomModule.tsx          // Main entry — mount this under /games
├── components/
│   ├── GameRoomHome.tsx        // Hub / lobby
│   ├── AdminPanel.tsx
│   ├── shared/
│   │   ├── TreyCard.tsx        // Neon card component
│   │   └── SuitLegendModal.tsx
│   ├── spades/SpadesTable.tsx
│   ├── blackjack/BlackjackTable.tsx
│   └── bullshit/BullshitTable.tsx
└── lib/
    ├── cards/cardManifest.ts   // 52-card manifest + deck utils
    ├── spades/spadesEngine.ts  // Rules engine + bots
    ├── blackjack/blackjackEngine.ts
    └── bullshit/bullshitEngine.ts
```

## How to mount under the existing Trey TV Games tab

### Option A — drop-in component

In your existing Trey TV `App.tsx` or Games-tab route component:

```tsx
import { GameRoomModule } from "@/features/games/GameRoomModule";

// In your routes:
<Route path="/games/*" element={<GameRoomModule />} />;
```

### Option B — admin route

```tsx
import { AdminGameRoomModule } from "@/features/games/GameRoomModule";
<Route path="/admin/games" element={<AdminGameRoomModule />} />;
```

### Option C — direct game launch

```tsx
<GameRoomModule initialView="spades" />
```

## Suggested route map (matches blueprint)

| Route              | Component                              |
| ------------------ | -------------------------------------- |
| `/games`           | `GameRoomModule` (home)                |
| `/games/spades`    | `GameRoomModule initialView=spades`    |
| `/games/blackjack` | `GameRoomModule initialView=blackjack` |
| `/games/bullshit`  | `GameRoomModule initialView=bullshit`  |
| `/admin/games`     | `AdminGameRoomModule`                  |

## Card assets

The Trey TV deck is rendered in `TreyCard.tsx` using CSS + the custom suit metadata in `cardManifest.ts`. The manifest stores the `assetPath` for each card under `public/assets/games/cards/trey-tv-deck/<suit>/<RANK><LETTER>.png`. To swap in PNG art:

1. Crop each card from the uploaded image sheets.
2. Save with the exact filename (e.g. `AS.png`, `KH.png`).
3. Place in the matching suit folder.
4. Update `TreyCard.tsx` to render `<img src={card.assetPath} />` instead of the CSS layer when a real asset is present.

The naming convention in `cardManifest.ts` already matches the required format from the spec.

## Suit mapping (gameplay vs display)

| Gameplay | Display Suit | Color  |
| -------- | ------------ | ------ |
| Spades   | **Blades**   | purple |
| Hearts   | **Soul**     | red    |
| Diamonds | **Crowns**   | blue   |
| Clubs    | **Sparks**   | green  |

The rules engines (`spadesEngine`, `blackjackEngine`, `bullshitEngine`) operate on the **gameplay** identity. Display is purely cosmetic. Spades is always trump in Spades regardless of how Blades looks.

## Database schema (Supabase / Postgres)

Apply this migration to enable server-backed rooms:

```sql
create table if not exists game_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text unique not null,
  game_type text not null check (game_type in ('spades','blackjack','bullshit')),
  status text not null default 'waiting' check (status in ('waiting','active','ended','abandoned')),
  host_user_id uuid not null,
  max_players int not null default 4,
  current_players int not null default 0,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists game_room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references game_rooms(id) on delete cascade,
  user_id uuid not null,
  display_name text not null,
  seat_index int not null,
  team_index int,
  is_bot boolean not null default false,
  is_ready boolean not null default false,
  is_connected boolean not null default true,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (room_id, seat_index)
);

create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references game_rooms(id) on delete cascade,
  game_type text not null,
  status text not null default 'active',
  current_turn_seat int,
  round_number int not null default 1,
  phase text,
  state_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists game_moves (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references game_sessions(id) on delete cascade,
  player_id uuid not null,
  move_type text not null,
  move_payload jsonb not null,
  move_number int not null,
  created_at timestamptz not null default now()
);

create table if not exists game_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references game_sessions(id) on delete cascade,
  room_id uuid not null references game_rooms(id),
  player_id uuid not null,
  team_index int,
  score int not null default 0,
  round_score int not null default 0,
  metadata_json jsonb,
  created_at timestamptz not null default now()
);

-- RLS recommended
alter table game_rooms enable row level security;
alter table game_room_players enable row level security;
alter table game_sessions enable row level security;
alter table game_moves enable row level security;
alter table game_scores enable row level security;
```

## Realtime

Use Supabase Realtime channels keyed by `room:<roomId>` to broadcast:

- `player_joined`, `player_left`, `player_ready`
- `game_started`, `card_dealt`, `bid_placed`, `card_played`
- `turn_changed`, `trick_resolved`, `score_updated`, `game_ended`

The engines in `lib/` are pure functions — they can run on the client for instant UX, then be validated on the server by re-applying the same engine against the canonical `state_json`. Never trust the client for final score.

## Environment

Create `.env` with:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Free-play disclaimer

This module is for entertainment only. No real-money wagering, deposits, withdrawals, or cash prizes. All chips/points are virtual and non-redeemable.
