# AI Repo Handoff: Trey TV Production Setup

Last updated: 2026-05-11

This file is for any AI or engineer touching this repo. Read this before changing Supabase, Vercel, Cloudflare, auth, onboarding, or deployment wiring.

## Source Of Truth

- Local repo: `C:\Users\info\TREY-TV-ANTIGRAVITY`
- Production app/project of truth: `v0-trey-tv-mvp`
- Vercel project URL: `https://vercel.com/bandlabthe-9878s-projects/v0-trey-tv-mvp`
- Production domain: `https://tv.treytrizzy.com`
- GitHub remote: `https://github.com/californiatrey-ship-it/trey-tv-network.git`

Do not create a new Vercel project for this app. Use the linked project in `.vercel/project.json`.

## Vercel

`.vercel/project.json` is linked to:

- `projectId`: `prj_2MznMeWaGANWyH8vgc3jHcixG6Ty`
- `orgId`: `team_gTkfBHnifvXUBWvFDw1QRnBN`
- `projectName`: `v0-trey-tv-mvp`

Use this deployment flow:

```powershell
vercel build --prod
vercel deploy --prebuilt --prod
```

`vercel deploy --prod` without the prebuilt step has previously been less reliable for this repo. Prefer the prebuilt path above.

After deploy, verify that the deployment aliases include:

- `https://tv.treytrizzy.com`
- `https://v0-trey-tv-mvp.vercel.app`

## Supabase

Linked Supabase project:

- Project ref: `wcdwlqnfcsuaacbvdmgx`
- Local config: `supabase/config.toml`
- Public URL: `https://wcdwlqnfcsuaacbvdmgx.supabase.co`

Current local/remote migration history was repaired on 2026-05-11. The expected aligned migration list is:

- `20260510003806`
- `20260511000001`
- `20260511000002`
- `20260511000003`
- `20260511000004`

Before changing schema, run:

```powershell
supabase migration list
supabase db push --dry-run
```

Expected healthy result:

```text
Remote database is up to date.
```

Important: an older baseline migration, `20260510003744_527b9397-fb6d-4b15-9648-1b5df1d985ce.sql`, was moved to `supabase/migrations_archive/` because it could not safely replay against the current production schema. Do not move it back into `supabase/migrations` unless you intentionally redesign the migration history.

If a future migration is needed:

1. Add a new timestamped SQL file under `supabase/migrations`.
2. Make it idempotent where possible with `if not exists`, `create or replace`, and `on conflict`.
3. Run `supabase db push --dry-run`.
4. Run `supabase db push`.
5. Re-run `supabase migration list`.

## UID And Onboarding Contract

The app expects each completed user to have one durable Supabase auth UID plus one public profile UID used across the app.

Canonical private key:

- `auth.users.id`
- `profiles.id`
- `user_preferences.user_id`
- `community_credit_balances.user_id`
- other private app tables with `user_id`

Canonical public identity:

- `profiles.public_profile_uid`
- `profiles.site_uid` is a legacy alias kept in sync for older app code.

Onboarding completion must preserve the existing UID and only fill missing account rows. The relevant code is:

- `src/lib/trey-i/onboarding.server.ts`
- `supabase/migrations/20260511000004_onboarding_uid_account_bootstrap.sql`

Do not regenerate or change an existing `public_profile_uid` for a user unless the owner explicitly asks for identity repair.

## Cloudflare / Domain

The production domain is `tv.treytrizzy.com` and is currently aliased by Vercel. If DNS or Cloudflare changes are needed, keep Vercel as the production deployment target and only adjust DNS/Cloudflare records to point traffic to the existing Vercel project.

Do not create a separate hosting target in Cloudflare for this app unless the owner explicitly changes the architecture.

## Secrets

Do not paste secrets into chat or commit them. Local env files may contain keys needed for development, but future AI should treat them as sensitive.

Check env locally only when needed:

- `.env`
- `.env.local`
- Vercel project environment variables
- Supabase project settings

## Quick Health Checks

Use these before deploy:

```powershell
pnpm.cmd exec tsc --noEmit
pnpm.cmd build
supabase db push --dry-run
```

Known normal warning:

- Vite chunk-size warnings can appear and have not blocked production deploys.
- Some third-party packages print ignored `"use client"` directive warnings during Vercel builds.

