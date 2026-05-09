# Design — Replace mock-data.currentUser with Real Supabase Profile

## Critical Finding: Two `useAuth` hooks coexist

| File | Import path | Returns |
|------|-------------|---------|
| `src/hooks/use-auth.ts` | `@/hooks/use-auth` | `session`, `user` (Supabase `User`), `isSignedIn` |
| `src/lib/auth.tsx` | `@/lib/auth` | `SessionUser`, `role`, `isGuest`, `isCreator`, `updateUser`, etc. |

Most layout components import from `@/lib/auth` (the mock one).
`PostCard` and `use-supabase-reactions` import from `@/hooks/use-auth` (the real one).

**This split must be preserved.** The new code bridges them — it does not collapse them.

---

## Existing Shapes

### `currentUser` (mock-data.ts)
```ts
{
  name: string        // "Trey"
  handle: string      // "trey"
  uid: string         // "4234118205271678"
  avatar: string      // imported image asset
  banner: string      // "/profile-banner"
  bio: string
  location: string
  link: string        // "trey.tv"
  verified: "creator" | "user"
  stats: { posts: number; followers: string; following: number; prescriptions: string }
}
```

### `SessionUser` (auth.tsx) — the target shape
```ts
{
  name: string
  handle: string
  uid: string
  avatar: string
  banner?: string
  bio: string
  location?: string
  link?: string
  accent?: "gold" | "magenta" | "cyan" | "purple"
  verified?: "creator" | "user"
  role: Role
  creatorStatus?: CreatorStatus
  stats: { posts: number; followers: string; following: number; prescriptions: string }
  rewards?: { points: number; tier: "BRONZE" | "SILVER" | "GOLD" | "DIAMOND" }
}
```

`SessionUser` is a superset of `currentUser`. The mock already satisfies the shape.

---

## Field Mapping: Supabase → SessionUser

| SessionUser field | Supabase column | Fallback |
|-------------------|-----------------|---------|
| `name` | `display_name` | `currentUser.name` |
| `handle` | `username` | `currentUser.handle` |
| `uid` | `public_profile_uid` | `currentUser.uid` |
| `avatar` | `avatar_url` | `currentUser.avatar` |
| `banner` | `banner_url` | `""` |
| `bio` | `bio` | `currentUser.bio` |
| `location` | `location` | `currentUser.location` |
| `accent` | `profile_accent_color` (mapped below) | `"gold"` |
| `verified` | derived from `role` / `verification_type` (below) | `currentUser.verified` |
| `role` | `role` (mapped below) | `"user"` |
| `link` | — not in safe columns | `currentUser.link` |
| `stats` | — no count columns in safe set | `currentUser.stats` |
| `rewards` | — out of scope | `currentUser.rewards` |
| `creatorStatus` | — out of scope | `"not_applied"` |

### `profile_accent_color` → `accent`
```
"gold" | "magenta" | "cyan" | "purple" → same value
null / anything else                   → "gold"
```

### `role` column → `Role`
```
"admin" | "master_admin" → "admin"
"creator"               → "creator"
"user" | null | other   → "user"
```

### `verified` derivation
```
verified_creator === true OR verification_type === "gold" → "creator"
is_verified === true OR verification_type === "green"     → "user"
otherwise                                                 → undefined
```

---

## Implementation: Two New Files, One Minimal Edit

### 1. `src/hooks/use-current-user.ts` (new)

A hook that returns the real profile as `SessionUser`, or `currentUser` fallback.

```
useCurrentUser(): SessionUser
```

Logic:
1. Call `useAuth()` from `@/hooks/use-auth` → get `user`, `isSignedIn`
2. If `!isSignedIn` → return `currentUser` immediately (no fetch)
3. Fetch `profiles` where `id = user.id`, select safe columns only
4. While loading → return `currentUser` (no spinner, no layout shift)
5. On error or missing row → return `currentUser`
6. On success → return mapped `SessionUser`

### 2. `src/components/CurrentUserSync.tsx` (new)

A zero-render component. Calls `useCurrentUser()` and pushes real data into the
mock `AuthProvider` via `updateUser()` from `useAuth()` (`@/lib/auth`).

```tsx
export function CurrentUserSync() {
  // calls useCurrentUser() + updateUser() when real profile loads
  return null;
}
```

Why a separate component instead of modifying `AuthProvider`:
- `AuthProvider` is in `src/lib/auth.tsx` — importing Supabase client there would
  tangle the two auth systems and risk circular imports.
- A bridge component keeps the boundary clean and is trivially removable.

### 3. `src/routes/__root.tsx` (minimal edit)

Mount `<CurrentUserSync />` once inside `RootComponent`, inside `<AuthProvider>`.
One import line, one JSX element. Nothing else changes.

```tsx
// Inside RootComponent, after <AuthProvider>:
<CurrentUserSync />
```

---

## What Does NOT Change

- `src/lib/mock-data.ts` — `currentUser` stays, untouched
- All 17 consuming files — zero changes
- `src/lib/auth.tsx` — zero changes
- `src/hooks/use-auth.ts` — zero changes
- All Lovable UI components — zero changes

---

## Rollback

Remove `<CurrentUserSync />` from `__root.tsx` and delete the two new files.
All 17 consumers revert to mock data instantly. Zero risk to existing functionality.
