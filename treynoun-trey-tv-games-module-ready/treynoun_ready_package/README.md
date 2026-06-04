# Treynoun for Trey TV Games

Treynoun is a Trey TV Games module add-on built as a playable local React/TypeScript game. It turns nouns into a mystery-chase party game: players chase a hidden Target Noun through clue signals, category locks, hints, traps, chaos pressure, streaks, scoring, and live-room style interaction.

## What is included

- `/games/treynoun` route
- Trey TV Games entry card for Treynoun
- Full Treynoun game flow
- Solo Noun Chase
- Pass The Noun local party flow
- Noun Battle lobby and playable battle shell
- Live Noun Room shell
- Leaderboard shell
- Local scoring engine
- Local match/stat persistence through `localStorage`
- TypeScript utility functions for guesses, scoring, chaos, hints, and clue validation
- Mobile-first neon/liquid-glass Trey TV game UI

## Validated commands

These passed in this package:

```bash
npm run typecheck
npm run lint
npm run build
```

Lint currently reports non-blocking Fast Refresh warnings from shared UI/template files, but there are no lint errors.

## Workstation setup

Recommended:

- Node.js 20 LTS or newer
- npm 10 or newer

Install and run:

```bash
npm install
npm run dev
```

Local-only dev server:

```bash
npm run dev:local
```

LAN/workstation-friendly dev server:

```bash
npm run dev:host
```

Production build:

```bash
npm run build
```

Full validation:

```bash
npm run validate
```

## Trey TV integration path

Copy this feature folder into the Trey TV repo:

```text
src/features/games/treynoun/
```

Then add the route:

```text
/games/treynoun
```

Use:

```tsx
import TreynounGame from '@/features/games/treynoun/TreynounGame';
```

and render:

```tsx
<TreynounGame />
```

More detailed integration notes are in `TREYTV_GAMES_MODULE_INTEGRATION.md`.

## Current backend status

This package is intentionally local/playable with mock data and localStorage persistence. It does not connect Supabase, real multiplayer, real live chat, real rewards, or real user auth yet. The state and component structure are ready for those systems to be wired in after the shell is merged into Trey TV.

## Core game vocabulary

- Target Noun: the hidden answer
- Noun Trail: the three clue signals
- Lock In: final answer submission
- Category Lock: optional person/place/thing prediction for bonus points
- Chaos Meter: pressure meter caused by wrong guesses, hints, and risky moves
- Noun Trap: high-risk score multiplier move
- Hot Trail: streak system
- Noun Score: match score
