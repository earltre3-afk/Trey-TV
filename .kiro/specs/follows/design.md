# Design — Wire Follow/Unfollow to Supabase

## Schema: `follows`

```sql
follower_id  uuid  not null  → public.profiles(id)  (cascade delete)
following_id uuid  not null  → public.profiles(id)  (cascade delete)
created_at   timestamptz not null  default now()
primary key (follower_id, following_id)
constraint follows_not_self check (follower_id <> following_id)
```

Note: `profiles.id = auth.users.id`. So `follower_id = auth.uid()` for the current user.

### RLS
| Operation | Policy | Condition |
|-----------|--------|-----------|
| SELECT | public | `using (true)` |
| ALL (insert/update/delete) | authenticated | `using (auth.uid() = follower_id) with check (auth.uid() = follower_id)` |

---

## Critical ID Mapping Problem

The Lovable `toggle()` API receives:
```ts
{ id: string, name: string, handle: string, avatar: string }
```

Where `id` is:
- `u.$uid.tsx` → `uid` (the URL param = `public_profile_uid`, e.g. `"4235358111618238"`)
- `channel.$handle.tsx` → `creator.uid` (same — `public_profile_uid`)
- `explore.tsx` → `c.id` (mock string like `"chris"`, `"treyi"`)

The DB `follows` table needs `following_id = profiles.id` (the internal UUID = `auth.users.id`).

**Resolution strategy:**
- If `id` looks like a `public_profile_uid` (numeric string, 16+ digits): query
  `profiles` where `public_profile_uid = id` to get the internal `profiles.id` UUID.
- If `id` is a short mock string: skip DB, use localStorage only.

### `public_profile_uid` guard
```ts
const PUBLIC_UID_RE = /^\d{10,}$/;
const isRealProfile = PUBLIC_UID_RE.test(id);
```

---

## Existing `FollowProvider` Public API (must not change)

```ts
type Ctx = {
  followed: FollowedCreator[]
  isFollowing: (handle: string) => boolean
  toggle: (c: { id: string; name: string; handle: string; avatar: string }) => boolean
  bumpWatch: (handle: string) => void
  topThree: FollowedCreator[]
}
```

`toggle()` returns `boolean` — `true` if now following, `false` if unfollowed.

---

## Implementation: Replace `FollowProvider` internals

One file changes: `src/lib/follow-store.tsx`.
The public API (`useFollow`, `FollowProvider`, `FollowedCreator`, `Ctx`) is unchanged.

### Internal state

```ts
// DB-backed follows keyed by handle (for isFollowing lookup)
const [dbFollowed, setDbFollowed] = useState<Set<string>>(new Set());
// Local follows for mock profiles (existing localStorage behavior)
const [localFollowed, setLocalFollowed] = useState<FollowedCreator[]>(SEED);
// Watch scores (local-only)
const [watchScores, setWatchScores] = useState<Record<string, number>>({});
```

### `isFollowing(handle)` logic
```
return dbFollowed.has(handle) || localFollowed.some(f => f.handle === handle)
```

### `toggle(c)` logic
```
if isRealProfile(c.id) and signed-in:
  optimistically update dbFollowed
  resolve profiles.id from public_profile_uid (single SELECT)
  if already following: DELETE from follows
  if not following: INSERT into follows
  on error: revert dbFollowed, toast("Follow failed")
  return new state

if isRealProfile(c.id) and signed-out:
  toast("Sign up to follow")
  nav to /onboarding
  return false

if mock id:
  update localFollowed (existing behavior)
  return new state
```

### `followed` array (for consumers that iterate it)
```
merge dbFollowed handles into FollowedCreator[] shape + localFollowed
```

### On mount (signed-in)
Fetch all `follows` rows where `follower_id = auth.uid()`, join `profiles` to get
`handle`, populate `dbFollowed` set.

```sql
select following:profiles!follows_following_id_fkey(
  public_profile_uid, display_name, username, avatar_url
)
from follows
where follower_id = auth.uid()
```

### `bumpWatch` and `topThree`
Remain local-only, operating on `localFollowed` + `watchScores`.

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/follow-store.tsx` | **Replace internals** — keep identical public API |

No other files change. All three consuming routes (`u.$uid.tsx`, `channel.$handle.tsx`,
`explore.tsx`) are untouched.

---

## Rollback

Restore `src/lib/follow-store.tsx` from git. All consumers revert to localStorage
instantly. Zero impact on any other file.
