# Trey TV Cinematic Streaming-Box Skin

This package is the cleaned Trey TV TV-app skin prepared from the uploaded `cinematic-premium-futuristic.zip` shell.

## What was changed

- Hid the bottom dev screen switcher from production builds. It now only renders during `import.meta.env.DEV`.
- Replaced the TypeScript `any` errors in the TV shell with safe types.
- Added a Free TV Guide adapter layer that calls Trey TV internal routes instead of exposing provider credentials to the TV client.
- Updated the Guide screen so it can use `/api/free-tv/schedule` when the real backend route exists, while keeping cinematic fallback data so the shell still works by itself.
- Added `.env.example` notes showing that the API key and access token belong in the backend only.

## Important security rule

Do not put the Free TV provider API key or access token in this Vite/TV client package.

The TV shell calls Trey TV internal backend routes such as:

- `/api/free-tv/status`
- `/api/free-tv/channels`
- `/api/free-tv/search?q=`
- `/api/free-tv/schedule?country=US&date=YYYY-MM-DD`
- `/api/free-tv/channel/[id]`
- `/api/free-tv/channel/[id]/schedule`

The real Trey TV backend should privately call the provider with:

- `FREE_TV_API_BASE_URL`
- `FREE_TV_API_KEY`
- `FREE_TV_ACCESS_TOKEN`
- `FREE_TV_PROVIDER`

## Commands verified

```bash
npm install
npm run build
npm run lint
```

Build passes.

Lint has 0 errors. It still has Fast Refresh warnings from existing shadcn/theme files that export helper constants from component files. Those warnings do not block the build.

## Merge target

Use this as the TV-side visual shell for the Trey TV streaming-box app. Merge surgically into the real TV app package, usually under something like:

- `apps/trey-tv-tv/src/features/tv-shell/`
- `src/features/tv-shell/`

Do not overwrite the full Trey TV repo blindly.

## Current fallback behavior

The Guide screen attempts to call `/api/free-tv/schedule`. If the backend route is unavailable, it displays the included premium Trey TV mock guide data and marks the source as `SHELL FALLBACK`.
