# Requirements: Default Profile Layout System for New Users

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Scope:** Audit and commit the existing WIP profile layout system. This is a reusable, automated, step-and-repeat profile template — not a redesign or rebuild of the profile page.

---

## 1. What This Is (and Is Not)

**This is:** A modular, reusable profile layout template that every new user and creator account automatically inherits. The same shell renders both profile types by switching modules based on `profileType`. The visual design is preserved exactly from the existing Lovable profile page.

**This is not:** A redesign, a rebuild, or a replacement of the Lovable UI. The layout structure, glass/neon-border styling, color tokens, and component patterns are identical to the existing Lovable profile page.

---

## 2. Current WIP Status

**Git status:**
```
M  src/routes/u.$uid.tsx
?? src/components/profile/
```

**TypeScript:** ✅ passed  
**Build:** ✅ passed  
**Safe to commit:** Yes, with one required fix (see §4).

---

## 3. Implementation Audit

### 3.1 `src/components/profile/ProfileTypes.ts` ✅

Defines all shared types: `ViewerRole`, `ProfileType`, `ProfileStats`, `ProfileRewards`, `ProfileData`, `ProfileContext`. No Supabase queries. No `profiles.is_creator`. No `profiles.age`. Pure type definitions.

### 3.2 `src/components/profile/ProfilePageShell.tsx` ✅

Master template. Accepts `{ profile: ProfileData; viewerRole: ViewerRole }`. Derives context, handles follow/subscribe state, renders:
- `ProfileBanner` (hero)
- `ProfileIdentityCard` (mobile identity)
- `ProfileActionBar` (mobile non-owner actions)
- 2-col desktop layout: main column + sidebar
- Main column: `ProfileStatsBar` + `NormalUserProfileModules` or `CreatorProfileModules`
- Sidebar: `ProfileOwnerControls` or `PublicProfileControls`
- Mobile sidebar below main content

No hardcoded profile data. All data flows through `ProfileData` prop. ✅

### 3.3 `src/routes/u.$uid.tsx` ✅ (with one fix required — see §4)

Resolves `viewerRole` from auth state. Builds `ProfileData` from:
1. Real Supabase profile via `useProfile(uid)` (primary)
2. Auth session user fallback (loading state)
3. Mock `currentUser` fallback (error state)

`public_profile_uid`-based routing preserved — `useProfile(uid)` queries by `public_profile_uid`. ✅

**Issue found:** Line 95 references `dbProfile.is_creator`. The `SupabaseProfile` type in `use-profile.ts` declares `is_creator: boolean` but the SELECT query does not include `is_creator`. The column does not exist in the current schema. At runtime `dbProfile.is_creator` is always `undefined` (falsy) — no crash, but the type is stale and the reference is misleading.

**Required fix:** Remove `dbProfile.is_creator` from the `isCreatorProfile` expression and the JSDoc comment. Rely solely on `isOwnProfile && (role === 'creator' || role === 'admin')` for creator detection. Also remove `is_creator: boolean` from `SupabaseProfile` in `use-profile.ts`.

### 3.4 `src/components/profile/ProfileBanner.tsx` ✅

Cinematic hero banner. Owner/creator/user treatments via CSS class switching. Desktop identity overlay. Mobile avatar overlap. No Supabase queries. No `is_creator`. No `age`.

### 3.5 `src/components/profile/ProfileIdentityCard.tsx` ✅

Mobile-only identity block. Display name, handle, badge row, bio, location/link, CTA buttons. Adapts by `profileType` and `viewerRole`. No Supabase queries.

### 3.6 `src/components/profile/ProfileStatsBar.tsx` ✅

Stats bar. Creator: Fans / Episodes / Watch Hrs / Subscribers. Normal user: Posts / Followers / Following / Prescriptions. No Supabase queries.

### 3.7 `src/components/profile/ProfileActionBar.tsx` ✅

Action button row. Owner: Edit Profile + Creator Studio (if creator) + Share + Copy UID. Public user: Follow + Subscribe (creator) + Gift (creator) + Message (non-creator) + Notify + Share. Guest: Sign up + Share. No Supabase queries.

### 3.8 `src/components/profile/ProfileOwnerControls.tsx` ✅

Owner-only sidebar. Rewards card, Creator Studio shortcut (creator), analytics teaser (creator), engagement snapshot (normal user), quick shortcuts. No Supabase queries. Stats are hardcoded mock values — acceptable for this phase.

### 3.9 `src/components/profile/PublicProfileControls.tsx` ✅

Public/guest sidebar. Share/Copy/More actions, engagement snapshot (hardcoded), "Frequently watched together" (uses `mock-data.ts creators[]`), guest CTA. No Supabase queries. Mock data usage is acceptable for this phase.

### 3.10 `src/components/profile/ProfileSectionCard.tsx` ✅

Reusable section card with optional title, icon, trailing, owner/public styling. `ProfileEmptyState` helper. No Supabase queries.

### 3.11 `src/components/profile/NormalUserProfileModules.tsx` ✅

Normal user main column. Desktop bio card, profile completion nudge (owner), interests, Top 3 friends, content tabs (Posts/Liked/Saved/About), posts grid (uses `prescribed` mock data), About tab. No Supabase queries. Mock data usage is acceptable for this phase.

### 3.12 `src/components/profile/CreatorProfileModules.tsx` ✅

Creator main column. Creator bio card, owner quick analytics (mobile), channel stats bar, tab nav (Home/Shows/Episodes/Live/About), featured episode card, shows rail, episodes grid, community panel. Uses `useSubmissions()` from `submissions-store` for episode data — this is the local optimistic layer, acceptable for this phase. No `is_creator` queries.

### 3.13 `src/components/profile/index.ts` ✅

Clean barrel export. All components and types re-exported.

---

## 4. Required Fix Before Commit

### Fix: Remove `is_creator` reference from `u.$uid.tsx` and `use-profile.ts`

**Problem:** `dbProfile.is_creator` is referenced in `u.$uid.tsx` line 95 and in the JSDoc comment at line 19. The `SupabaseProfile` type in `use-profile.ts` declares `is_creator: boolean` but the SELECT query does not include it (column does not exist in current schema). This is a stale type reference.

**Fix in `src/routes/u.$uid.tsx`:**
- Remove `dbProfile.is_creator ||` from the `isCreatorProfile` expression (line 95).
- Remove the JSDoc comment line `*   - If dbProfile.is_creator === true → "creator"` (line 19).

**Fix in `src/hooks/use-profile.ts`:**
- Remove `is_creator: boolean;` from the `SupabaseProfile` interface.

**Result:** `isCreatorProfile` becomes:
```ts
const isCreatorProfile = isOwnProfile && (role === 'creator' || role === 'admin');
```

This is the correct behavior — creator status is determined by the authenticated session role, not a non-existent DB column.

**Impact:** No visual change. No behavior change for any real user (the column was never in the SELECT, so `dbProfile.is_creator` was always `undefined`/falsy). TypeScript becomes cleaner.

---

## 5. Functional Requirements

### FR-1: Reusable template for all profile types

- `ProfilePageShell` renders any profile by accepting `ProfileData` and `ViewerRole`.
- `profileType: 'user'` → `NormalUserProfileModules` + user stats bar.
- `profileType: 'creator'` → `CreatorProfileModules` + creator stats bar.
- No hardcoded profile-specific data in any component.

### FR-2: Profile type determination

- Creator: `isOwnProfile && (role === 'creator' || role === 'admin')`.
- Normal user: all other authenticated profiles.
- `profiles.is_creator` is never queried (column does not exist).

### FR-3: Viewer role logic

- `viewerRole = 'owner'` when `authUser.uid === uid` and not guest.
- `viewerRole = 'guest'` when `isGuest`.
- `viewerRole = 'user'` otherwise.

### FR-4: Real Supabase data preserved

- `useProfile(uid)` queries by `public_profile_uid` — routing preserved.
- Real fields used: `display_name`, `username`, `avatar_url`, `banner_url`, `bio`, `location`, `created_at`, `profile_accent_color`.
- Fallback to session user or mock on loading/error — no crash.

### FR-5: Owner controls

- Owner sees: Edit Profile button, Creator Studio shortcut (if creator), rewards card, analytics teaser, quick shortcuts.
- Non-owner sees: follow/subscribe/message/share actions, public engagement snapshot.

### FR-6: Visual preservation

- All Lovable glass/neon-border/owner-neon/owner-glass/liquid-glass CSS classes preserved.
- Color tokens unchanged.
- Layout structure (banner → identity → stats → modules → sidebar) unchanged.
- No new UI elements beyond what is already in the WIP.

### FR-7: No impact on Creator/admin pipeline

- No changes to `use-creator-submit.ts`, `use-creator-studio.ts`, `use-creator-post-queue.ts`, `use-admin-post-queue.ts`, or any admin/creator route.

### FR-8: No Watch Now / Guide changes

- `watch.$id.tsx` and guide routes are not touched.

### FR-9: Terminal validation only

- `pnpm tsc --noEmit` — zero errors.
- `pnpm build` — clean build.

---

## 6. Non-Functional Requirements

- **No new dependencies.**
- **No redesign.**
- **Rollback:** Revert `u.$uid.tsx` to the previous version. The `src/components/profile/` directory can remain — it is not imported anywhere else.

---

## 7. Out of Scope

- Wiring real stats (followers, posts, watch hours) from Supabase — mock/fallback values are acceptable for this phase
- Real episode data in `CreatorProfileModules` — `submissions-store` local layer is acceptable for this phase
- Real "Frequently watched together" data — mock `creators[]` is acceptable for this phase
- Avatar / banner upload
- Profile completion percentage calculation
- Real analytics data in owner controls
