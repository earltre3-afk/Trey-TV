# Design: Default Profile Layout System for New Users

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09

---

## 1. System Overview

```
u.$uid.tsx (route)
  ├── useProfile(uid)          ← real Supabase SELECT by public_profile_uid
  ├── useAuth()                ← session role, uid
  └── ProfilePageShell         ← master template
        ├── ProfileBanner
        ├── ProfileIdentityCard (mobile)
        ├── ProfileActionBar
        ├── ProfileStatsBar
        ├── NormalUserProfileModules  ← if profileType === 'user'
        │     ├── ProfileSectionCard
        │     └── ProfileEmptyState
        ├── CreatorProfileModules     ← if profileType === 'creator'
        │     ├── ProfileSectionCard
        │     └── ProfileEmptyState
        ├── ProfileOwnerControls      ← if isOwner
        └── PublicProfileControls     ← if !isOwner
```

---

## 2. Data Flow

```
URL: /u/:uid  (uid = public_profile_uid)
  │
  ├─ useProfile(uid) → SupabaseProfile | null
  │    SELECT: id, public_profile_uid, display_name, username,
  │            avatar_url, banner_url, bio, location,
  │            created_at, profile_accent_color
  │    (no is_creator, no age, no date_of_birth)
  │
  ├─ useAuth() → { user, isGuest, role, isApprovedCreator }
  │
  ├─ isOwnProfile = authUser.uid === uid
  ├─ viewerRole = isOwnProfile ? 'owner' : isGuest ? 'guest' : 'user'
  ├─ isCreatorProfile = isOwnProfile && (role === 'creator' || role === 'admin')
  │
  └─ ProfileData built from dbProfile (real) or fallback (loading/error)
        └─ ProfilePageShell renders based on profileType + viewerRole
```

---

## 3. Required Fix: `is_creator` removal

### `src/hooks/use-profile.ts`

Remove `is_creator: boolean` from `SupabaseProfile`:

```ts
// BEFORE:
export interface SupabaseProfile {
  ...
  is_creator: boolean;
  ...
}

// AFTER:
export interface SupabaseProfile {
  id: string;
  public_profile_uid: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
  profile_accent_color: string | null;
}
```

### `src/routes/u.$uid.tsx`

Remove `dbProfile.is_creator ||` from the `isCreatorProfile` expression and the stale JSDoc line:

```ts
// BEFORE (line 19 JSDoc):
 *   - If dbProfile.is_creator === true → "creator"

// AFTER: remove that line entirely

// BEFORE (line 95):
const isCreatorProfile =
  dbProfile.is_creator ||
  (isOwnProfile && (role === "creator" || role === "admin"));

// AFTER:
const isCreatorProfile = isOwnProfile && (role === "creator" || role === "admin");
```

No other changes to `u.$uid.tsx`.

---

## 4. Component Responsibility Map

| Component | Responsibility | Data source |
|---|---|---|
| `ProfilePageShell` | Layout orchestration, follow/subscribe state | `ProfileData` prop |
| `ProfileBanner` | Hero banner, desktop identity overlay, nav buttons | `ProfileContext` |
| `ProfileIdentityCard` | Mobile identity: name, handle, badges, bio, CTA | `ProfileContext` |
| `ProfileStatsBar` | Stats grid (user vs creator variants) | `ProfileContext` |
| `ProfileActionBar` | Action buttons (owner / public / guest variants) | `ProfileContext` |
| `NormalUserProfileModules` | User content: bio, Top 3, tabs, posts grid | `ProfileContext` + `follow-store` + mock |
| `CreatorProfileModules` | Creator content: bio, tabs, episodes, shows | `ProfileContext` + `submissions-store` |
| `ProfileOwnerControls` | Owner sidebar: rewards, shortcuts, analytics | `ProfileContext` |
| `PublicProfileControls` | Public sidebar: share, engagement, creators | `ProfileContext` + mock |
| `ProfileSectionCard` | Reusable section wrapper | props |
| `ProfileEmptyState` | Empty state within sections | props |

---

## 5. Profile Type Decision Tree

```
Is the viewer the profile owner AND role === 'creator' or 'admin'?
  YES → profileType = 'creator'
  NO  → profileType = 'user'

(profiles.is_creator is never queried — column does not exist)
```

---

## 6. Files Changed

### Required fix (before commit):
| File | Change |
|---|---|
| `src/hooks/use-profile.ts` | Remove `is_creator: boolean` from `SupabaseProfile` |
| `src/routes/u.$uid.tsx` | Remove `dbProfile.is_creator ||` and stale JSDoc line |

### New files (already written, commit as-is):
| File | Status |
|---|---|
| `src/components/profile/ProfileTypes.ts` | New |
| `src/components/profile/ProfilePageShell.tsx` | New |
| `src/components/profile/ProfileBanner.tsx` | New |
| `src/components/profile/ProfileIdentityCard.tsx` | New |
| `src/components/profile/ProfileStatsBar.tsx` | New |
| `src/components/profile/ProfileActionBar.tsx` | New |
| `src/components/profile/ProfileOwnerControls.tsx` | New |
| `src/components/profile/PublicProfileControls.tsx` | New |
| `src/components/profile/ProfileSectionCard.tsx` | New |
| `src/components/profile/NormalUserProfileModules.tsx` | New |
| `src/components/profile/CreatorProfileModules.tsx` | New |
| `src/components/profile/index.ts` | New |

---

## 7. Rollback Plan

Revert `src/routes/u.$uid.tsx` to the previous version (before ProfilePageShell was introduced). The `src/components/profile/` directory can remain — it is not imported anywhere else. Revert `src/hooks/use-profile.ts` to restore `is_creator: boolean` if needed for other consumers (none currently).

---

## 8. Validation

```
pnpm tsc --noEmit   # zero errors — confirms is_creator fix is clean
pnpm build          # clean build
```
