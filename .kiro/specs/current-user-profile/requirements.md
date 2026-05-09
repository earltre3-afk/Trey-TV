# Requirements — Replace mock-data.currentUser with Real Supabase Profile

## Context

`currentUser` from `src/lib/mock-data.ts` is imported in 17 files. It provides the
signed-in user's identity to layout components, routes, and stores. The goal is to
replace it with the real authenticated user's Supabase profile while preserving every
pixel of the Lovable UI.

---

## Functional Requirements

### FR-1 Real profile fetch
When a Supabase session exists, the authenticated user's profile must be loaded from
the `profiles` table using `auth.user.id`.

### FR-2 Shape compatibility
Real profile data must be mapped into the existing `SessionUser` shape from
`src/lib/auth.tsx`. No consuming component may need to change its props or rendering.

### FR-3 Signed-out fallback
When no session exists, all components must continue rendering using `currentUser`
from `src/lib/mock-data.ts`. No blank state, no null crash.

### FR-4 Missing profile fallback
If the authenticated user has no row in `profiles`, fall back to `currentUser` mock.
Do not crash or show an error state.

### FR-5 Safe fields only
Only these columns may be queried:
`id`, `public_profile_uid`, `display_name`, `username`, `avatar_url`, `banner_url`,
`bio`, `location`, `created_at`, `role`, `verification_type`, `is_verified`,
`verified_creator`, `profile_accent_color`

### FR-6 Banned fields
Must NOT query: `is_creator`, `age`, `date_of_birth`, `email`, `phone`, or any
internal onboarding answer columns.

### FR-7 BottomNav profile link
`BottomNav` must link to `/u/${real_public_profile_uid}` when signed in.

### FR-8 AppHeader avatar
`AppHeader` must show the real `avatar_url` when signed in.

### FR-9 SideMenu profile card
`SideMenu` must show real `display_name`, `username`, and `avatar_url` when signed in.

### FR-10 No auth system collision
`src/hooks/use-auth.ts` (Supabase session) and `src/lib/auth.tsx` (mock AuthProvider /
`SessionUser`) must both continue to exist and function. The new code bridges them —
it does not replace either.

### FR-11 TypeScript passes
`pnpm tsc --noEmit` must pass with zero errors.

### FR-12 Build passes
`pnpm build` must complete with zero errors.

### FR-13 Lovable UI unchanged
No layout, color, spacing, or component structure may change.

---

## Out of Scope
- Saving profile edits to Supabase
- Stats (followers, following, posts count) — remain mock
- Comments, messaging, notifications, rewards, creator studio, admin
- Real-time profile subscriptions
