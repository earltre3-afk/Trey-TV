# Trey TV Games Module Integration Notes

## Goal

Merge Treynoun into the existing Trey TV Games module as a new game route, without replacing or redesigning the rest of the Games module.

## Files to copy

Copy the full feature folder:

```text
src/features/games/treynoun/
```

This folder contains the game state machine, screens, local scoring engine, mock data, UI shell, and utilities.

## Route to add

Add a route for:

```text
/games/treynoun
```

Example React Router entry:

```tsx
import TreynounGame from '@/features/games/treynoun/TreynounGame';

<Route path="/games/treynoun" element={<TreynounGame />} />
```

If the Trey TV repo uses Next.js/App Router instead of React Router, create:

```text
app/games/treynoun/page.tsx
```

and render the component client-side:

```tsx
'use client';

import TreynounGame from '@/features/games/treynoun/TreynounGame';

export default function TreynounPage() {
  return <TreynounGame />;
}
```

## Games module card to add

Add a card to the existing Trey TV Games list:

```ts
{
  id: 'treynoun',
  title: 'Treynoun',
  subtitle: 'Chase the noun. Crack the clues. Lock it in.',
  cta: 'Play',
  route: '/games/treynoun',
  badge: 'NEW',
  live: true
}
```

## Existing app compatibility notes

Treynoun currently includes its own visual shell in:

```text
src/features/games/treynoun/components/TreyShell.tsx
```

When merging into the production Trey TV repo, keep the game logic but consider replacing `TreyHeader` and `TreyBottomNav` with the existing official Trey TV app shell components so the module inherits the real navigation, logo, auth state, profile avatar, and layout spacing.

The current header uses a text fallback for `TREYTV`. If the production repo has the official Trey TV logo asset, wire that logo into `TreyHeader` or replace the shell header entirely with the existing app header.

## State and persistence

Current local persistence:

```text
src/features/games/treynoun/treynounStorage.ts
```

It uses `localStorage` for:

- Total Noun Score
- Best Hot Trail
- Gems earned
- Rank estimate
- Match history

Future Supabase wiring should replace or supplement this storage layer without changing every screen.

## Backend-ready seams

Good future integration points:

- `treynounStorage.ts`: replace localStorage with user profile/game stats tables
- `treynounMockData.ts`: replace mock nouns, teams, and live chat with backend records
- `TreynounBattleScreen.tsx`: replace local team state with realtime presence/channel state
- `TreynounLiveRoom.tsx`: replace mock feed with Trey TV live comments/chat
- `treynounScoring.ts`: keep as authoritative shared scoring logic or port to RPC/server validation
- `treynounUtils.ts`: keep for validation, normalization, clue rules, and close-guess detection

## Do not overwrite these blindly

Do not blindly replace the production Trey TV versions of:

```text
src/App.tsx
src/pages/GamesPage.tsx
src/features/games/GamesHome.tsx
src/components/ui/
```

Those are included here because this package can run standalone. In the production Trey TV repo, merge only the Treynoun game folder and add the route/card carefully.

## Validation status

The package was checked with:

```bash
npm run typecheck
npm run lint
npm run build
```

Result:

- TypeScript: passed
- Build: passed
- Lint: passed with warnings only

Warnings are existing Fast Refresh warnings from shared UI/template files and do not block build.
