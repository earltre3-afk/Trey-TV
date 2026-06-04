# Workstation Setup

This package is prepared to run on local laptops, LAN-accessible dev servers, cloud workstations, and AI coding workstations.

## Recommended environment

- Node.js 20 LTS or newer
- npm 10 or newer
- macOS, Windows, Linux, Codespaces, Replit-style workspaces, Famous/Builder-style workstations, or VS Code/Codex-style local environments

## Fresh install

```bash
npm install
```

The `package-lock.json` has been refreshed so `npm install` works cleanly. If a workstation supports `npm ci`, it should also work after this package is unpacked without changing dependencies.

## Run locally

```bash
npm run dev:local
```

## Run in a cloud/workstation environment

```bash
npm run dev:host
```

This binds Vite to `0.0.0.0`, which is usually required for browser previews in remote workstations.

## Preview production build

```bash
npm run build
npm run preview
```

## Validate before merging

```bash
npm run validate
```

This runs:

1. TypeScript check
2. ESLint
3. Production build

## Current notes

The game is local/playable and shell-ready for Trey TV. It does not require Supabase keys, environment variables, or backend services to run.
