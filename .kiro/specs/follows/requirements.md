# Requirements — Wire Follow/Unfollow to Supabase

## Context

The Lovable app has a fully-built follow system backed by a mock localStorage store
(`src/lib/follow-store.tsx`). Follow buttons appear in three places:

- `src/routes/u.$uid.tsx` — public profile page
- `src/routes/channel.$handle.tsx` — channel page
- `src/routes/explore.tsx` — creator discovery grid

All three call `useFollow()` from `@/lib/follow-store`, which exposes `toggle()` and
`isFollowing()`. The goal is to replace the localStorage internals with Supabase
`follows` table writes while keeping the identical public API and all UI unchanged.

---

## Functional Requirements

### FR-1 Load follow state on mount

When a signed-in user views a profile or channel, the app must check whether they
already follow that profile by querying `follows` where
`follower_id = auth.uid()` and `following_id = target_profiles.id`.

### FR-2 Signed-in follow

A signed-in user clicking Follow must insert a row into `follows` with
`follower_id = auth.uid()` and `following_id = target_profiles.id`.

### FR-3 Signed-in unfollow

A signed-in user clicking Unfollow must delete the row from `follows` where
`follower_id = auth.uid()` and `following_id = target_profiles.id`.

### FR-4 Optimistic update

The follow button state must update immediately on click. If the DB write fails,
the state must revert and a toast must inform the user.

### FR-5 Signed-out graceful handling

Clicking Follow while signed out must show a toast and redirect to `/onboarding`.
Must not crash or throw an unhandled error.

### FR-6 `isFollowing` keyed by handle

The existing `isFollowing(handle)` API must continue to work. Internally the store
maps `handle → profiles.id` for DB operations.

### FR-7 UUID resolution for target profile

The `toggle()` call receives `public_profile_uid` as `id` (not the internal
`profiles.id` UUID). The store must resolve `public_profile_uid → profiles.id`
before inserting into `follows`. This requires a lookup on `profiles`.

### FR-8 Mock fallback for non-UUID targets

When `toggle()` is called with a mock `id` (e.g. `"chris"`, `"treyi"`) that is not
a `public_profile_uid`, fall back to localStorage behavior. Do not attempt a DB write.

### FR-9 `bumpWatch` stays local

`bumpWatch(handle)` is used for local watch-score tracking. It remains local-only.
No DB column for watch score.

### FR-10 `topThree` stays local

`topThree` is derived from local `watchScore`. Remains local-only.

### FR-11 No private data exposed

Do not expose `follower_id` or `following_id` UUIDs to the UI. The UI only sees
`handle`, `name`, `avatar`.

### FR-12 RLS respected

Do not bypass RLS with a service-role key in the browser. The `follows` RLS
`for all` policy covers insert/delete with `auth.uid() = follower_id`.

### FR-13 Lovable UI unchanged

No JSX, layout, color, or component structure may change in any consuming file.

### FR-14 TypeScript passes

`pnpm tsc --noEmit` must pass with zero errors.

### FR-15 Build passes

`pnpm build` must complete with zero errors.

---

## Out of Scope

- Follower/following count display wired to DB
- Notifications on new follow
- Messaging, rewards, creator studio, admin
- `bumpWatch` or `topThree` wired to DB
