# Design — Wire Edit Profile to Supabase

## Schema: `profiles` (relevant columns)

```sql
id                   uuid  primary key  = auth.users.id
display_name         text  not null
username             text  not null  UNIQUE
bio                  text
location             text
profile_accent_color text              -- used by live app (use-current-user.ts)
public_profile_uid   text              -- DO NOT UPDATE
role                 text              -- DO NOT UPDATE
verification_type    text              -- DO NOT UPDATE
is_verified          boolean           -- DO NOT UPDATE
verified_creator     boolean           -- DO NOT UPDATE
updated_at           timestamptz       -- auto-set by trigger on update
```

### RLS

```
"Public profiles are viewable" → SELECT using (true)
"Users manage own profile"     → ALL using (auth.uid() = id) with check (auth.uid() = id)
```

The `for all` policy covers UPDATE. No separate UPDATE policy needed.

---

## Current `save()` Function (as-found)

```ts
const save = () => {
  if (!user) signIn("creator"); // mock sign-in if no mock session
  updateUser({ name, handle, bio, location, link, avatar, banner, accent });
  toast.success("Profile published ✨");
  setTimeout(() => nav({ to: "/u/$uid", params: { uid: base.uid } }), 350);
};
```

This is synchronous. It calls `updateUser()` from `@/lib/auth` (mock AuthProvider)
and navigates. No DB write.

---

## Implementation: Add DB write to `save()`

The `save()` function becomes async. The DB write runs alongside the existing
`updateUser()` call. If the DB write fails, the user is informed but the mock
update still applies.

### Fields written to DB

| DB column              | Draft field      | Notes                      |
| ---------------------- | ---------------- | -------------------------- |
| `display_name`         | `draft.name`     |                            |
| `username`             | `draft.handle`   | UNIQUE — catch 23505 error |
| `bio`                  | `draft.bio`      |                            |
| `location`             | `draft.location` |                            |
| `profile_accent_color` | `draft.accent`   |                            |

Fields NOT written: `avatar_url`, `banner_url` (blob URLs), `website_url` (out of scope),
`public_profile_uid`, `role`, `verification_type`, `is_verified`, `verified_creator`.

### New `save()` logic

```
Signed-in:
1. Get supabaseUser from useSupabaseAuth()
2. Attempt supabase.from("profiles").update({...}).eq("id", supabaseUser.id)
3. If error.code === "23505" → toast("Username already taken — try another"), return (no updateUser, no nav)
4. If other error → toast("Failed to save profile"), return (no updateUser, no nav)
5. DB succeeded → call updateUser() with draft values
6. toast.success("Profile published ✨")
7. Navigate

Signed-out (no supabaseUser):
1. Skip DB write entirely
2. Call updateUser() (existing mock behavior)
3. toast.success("Profile published ✨")
4. Navigate
```

### Auth imports

`edit-profile.tsx` already imports `useAuth` from `@/lib/auth` (mock).
The DB write needs `user.id` from `useAuth()` from `@/hooks/use-auth` (Supabase).
Both must be imported under different names:

```ts
import { useAuth } from "@/lib/auth"; // existing — mock
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth"; // new — Supabase session
```

---

## Files Changed

| File                          | Change                                                        |
| ----------------------------- | ------------------------------------------------------------- |
| `src/routes/edit-profile.tsx` | Add `useSupabaseAuth` import + make `save()` async + DB write |

No other files change.

---

## Rollback

Remove the `useSupabaseAuth` import and revert `save()` to its original synchronous
form. One function, one import. Instant revert.
