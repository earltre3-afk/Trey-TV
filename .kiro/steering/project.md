# Trey TV — Project Steering

## Active Project
**TREY-TV-ANTIGRAVITY** (`C:\Users\info\TREY-TV-ANTIGRAVITY`)
- Stack: TanStack Start + Vite + React 19 + Cloudflare Workers
- Dev server: http://localhost:3000
- Package manager: pnpm
- Build: `pnpm build` | Type check: `pnpm tsc --noEmit`

## Reference Project (read-only)
**TREY-TV-RESTORE-599** (`C:\Users\info\TREY-TV-RESTORE-599`)
- Stack: Next.js 15 App Router
- Use ONLY for: backend logic, schema types, API patterns, action references
- Do NOT import any UI components from RESTORE into ANTIGRAVITY

---

## Kiro's Role
- Protect the Lovable shell — do not redesign it
- Create specs before writing code
- Validate plans before implementing
- Wire backend functionality with the smallest safe change
- Every change must pass `pnpm tsc --noEmit` and `pnpm build`

---

## Confirmed Working Checkpoint (2026-05-09)
- Feed loads real data from `user_posts` table at `/`
- Profile loads real data from `profiles` table at `/u/4235358111618238`
- Post reactions read/write `user_post_reactions` (insert, delete, optimistic update, rollback)
- Reaction type mapping: `fire→like`, `gem→love`, `crown→wow`, `dead→laugh`, `cinematic→sad`
- Signed-out reaction tap: toast + redirect to `/onboarding`, no crash
- BottomNav is stable (no jump)
- TypeScript passes, build passes
- Lovable UI intact
- No RESTORE status box visible
