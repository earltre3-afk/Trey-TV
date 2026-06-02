# Design — Post Reactions / Likes Verification & Hardening

## Current Implementation (as-found)

### Hook: `src/hooks/use-supabase-reactions.ts`

- Reads current user reaction via `user_post_reactions` filtered by `post_id` + `user_id`
- Reads count via `select("id", { count: "exact", head: true })` on `user_post_reactions`
- Toggle: deletes all rows for `(post_id, user_id)`, then inserts new row if reaction is non-null
- Optimistic update: yes — state is set before the async call, rolled back on error
- Auth: uses `useAuth()` from `src/hooks/use-auth.ts`
- TypeScript issue: uses `(supabase as any).from("user_post_reactions")` — typed workaround needed

### Component: `src/components/feed/PostCard.tsx`

- Imports `useSupabaseReactions` and calls it with `post.id` and `post.likes`
- Calls `toggleReaction(reaction === k ? null : k)` on emoji tap
- Handles `result.ok === false` with toast + redirect
- Disables picker while `reactionPending === true`
- Also imports `useActivity` from `src/lib/activity-store` — this is the local-only mock store; it is NOT used for reaction state (only for saves/shares/activity log). No conflict.

### Schema: `user_post_reactions` (from RESTORE migration reference)

```sql
id            uuid  primary key
post_id       uuid  not null  → user_posts.id  (cascade delete)
user_id       uuid  not null  → auth.users.id  (cascade delete)
reaction_type text  not null  default 'like'
              check: ('like','love','laugh','wow','sad','angry')
created_at    timestamptz not null

unique(post_id, user_id, reaction_type)   ← NOT unique(post_id, user_id)
```

### RLS (from RESTORE migration reference)

| Operation | Policy             | Condition                           |
| --------- | ------------------ | ----------------------------------- |
| SELECT    | public             | `using (true)` — anyone can read    |
| INSERT    | authenticated only | `with check (user_id = auth.uid())` |
| DELETE    | authenticated only | `using (user_id = auth.uid())`      |

---

## Known Issues to Verify

### Issue 1 — `(supabase as any)` cast

The hook wraps the table call in a helper that casts to `any` to avoid a TypeScript error about `user_post_reactions` not being in the generated types. This suppresses type safety.

**Approach:** If the Supabase types file exists at `src/lib/database.types.ts` or similar, add the table type. If no types file exists, the `any` cast is acceptable for now but must be documented. Do not generate a types file as part of this task — that is a separate task.

### Issue 2 — Unique constraint is `(post_id, user_id, reaction_type)`, not `(post_id, user_id)`

The hook deletes all rows for `(post_id, user_id)` before inserting, which correctly enforces one-reaction-per-user. However, if the delete succeeds but the insert fails, the user ends up with no reaction (correct rollback behavior). If the delete fails, the insert is skipped (correct). The logic is safe.

### Issue 3 — Reaction type mapping

The Lovable UI uses custom keys (`fire`, `gem`, `crown`, `dead`, `cinematic`). The DB accepts (`like`, `love`, `laugh`, `wow`, `sad`, `angry`). The hook maps between them. The mapping must be verified to be exhaustive and consistent in both directions.

Current mapping:

```
fire      → like      (reverse: like → fire)
gem       → love      (reverse: love → gem)
crown     → wow       (reverse: wow → crown)
dead      → laugh     (reverse: laugh → dead)
cinematic → sad       (reverse: sad → cinematic)
```

`angry` has no Lovable equivalent — this is fine (it will never be inserted).

### Issue 4 — Count source

The hook initializes `likeCount` from `post.likes` (the mock data field). After a toggle it refreshes from the live count. On mount it also fetches the live count. This is correct behavior but depends on `user_post_reactions` being queryable (RLS SELECT is public — confirmed).

---

## Hardening Plan (only if issues are confirmed)

| Issue                      | Fix                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| `any` cast causes TS error | Add minimal inline type or suppress with `// eslint-disable` comment — do not restructure the hook |
| RLS blocks INSERT/DELETE   | Report the policy gap — do not bypass with service role in browser                                 |
| Count not updating         | Verify `fetchCount` is called after toggle and state is set                                        |
| Signed-out crash           | Already handled in PostCard — verify toast fires and no error is thrown                            |

---

## What Does NOT Change

- PostCard JSX/layout
- REACTIONS array in `activity-store.tsx`
- `useActivity` (saves/shares remain local-only)
- Any other route or component
