# Tasks — Post Reactions / Likes Verification & Hardening

Do not start any task until the previous one is complete and its result is recorded.

---

## T-1 Inspect existing hook

File: `src/hooks/use-supabase-reactions.ts`

Verify:
- [ ] Hook reads `user_post_reactions` for count (SELECT with `count: "exact"`)
- [ ] Hook reads current user's reaction (SELECT filtered by `post_id` + `user_id`)
- [ ] Toggle deletes all rows for `(post_id, user_id)` before inserting
- [ ] Optimistic update sets state before async call
- [ ] Rollback restores previous state on error
- [ ] `(supabase as any)` cast — note whether it causes a TS error or is silently suppressed

Record: any TypeScript errors found, any logic gaps.

---

## T-2 Inspect PostCard integration

File: `src/components/feed/PostCard.tsx`

Verify:
- [ ] `useSupabaseReactions(post.id, post.likes)` is called
- [ ] `toggleReaction` is called on emoji tap with correct argument
- [ ] `result.ok === false` paths show toast and do not crash
- [ ] `reactionPending` disables the picker during in-flight requests
- [ ] No RESTORE component is imported
- [ ] `post.id` is a real Supabase UUID (not a mock string like `"1"`)

Record: whether `post.id` is a real UUID or a mock string — this is critical. If the feed is still using mock posts, reactions cannot write to the DB.

---

## T-3 Inspect schema reference

Source: `C:\Users\info\TREY-TV-RESTORE-599\supabase\migrations\20260501235000_user_social_posts.sql`

Confirm:
- [ ] Table columns: `id`, `post_id`, `user_id`, `reaction_type`, `created_at`
- [ ] Unique constraint: `(post_id, user_id, reaction_type)` — NOT `(post_id, user_id)`
- [ ] `reaction_type` check constraint: `('like','love','laugh','wow','sad','angry')`
- [ ] RLS SELECT: `using (true)` — public read
- [ ] RLS INSERT: `to authenticated with check (user_id = auth.uid())`
- [ ] RLS DELETE: `to authenticated using (user_id = auth.uid())`

Record: any discrepancy between the migration reference and what the hook assumes.

---

## T-4 Run TypeScript check

```
cd C:\Users\info\TREY-TV-ANTIGRAVITY
pnpm tsc --noEmit
```

- [ ] Zero errors → proceed to T-5
- [ ] Errors found → record each error, patch only the reactions-related ones, re-run before proceeding

---

## T-5 Run build

```
cd C:\Users\info\TREY-TV-ANTIGRAVITY
pnpm build
```

- [ ] Build succeeds → proceed to T-6
- [ ] Build fails → record error, patch, re-run before proceeding

---

## T-6 Live test — signed-out tap

With dev server running (`pnpm dev`):

1. Open http://localhost:3000 while signed out (or in incognito)
2. Tap the 🔥 reaction button on any post
3. Verify:
   - [ ] Toast appears ("Sign up to react" or similar)
   - [ ] Redirected to `/onboarding`
   - [ ] No JS error in browser console
   - [ ] No browser alert dialog

Record: pass/fail and any console errors.

---

## T-7 Live test — signed-in reaction insert/delete

Requires a signed-in session with a real Supabase user.

1. Sign in at http://localhost:3000
2. Navigate to the feed
3. Confirm posts are real (UUIDs in post IDs, not `"1"`, `"2"`, `"3"`)
   - [ ] If posts are mock → reactions cannot be tested against DB; record this blocker
4. Tap 🔥 on a post:
   - [ ] Count increments immediately (optimistic)
   - [ ] Emoji activates visually
   - [ ] No console error
5. Tap 🔥 again (toggle off):
   - [ ] Count decrements
   - [ ] Emoji deactivates
6. Tap 💎 on the same post:
   - [ ] Previous reaction removed, new one active
   - [ ] Count stays at 1 (not 2)
7. Check Supabase dashboard or run a direct query to confirm the row exists/was deleted

Record: pass/fail for each step. If DB write is blocked by RLS, record the exact error.

---

## T-8 Report RLS / DB write status

Based on T-7:

- [ ] INSERT succeeds for authenticated user → RLS is correct
- [ ] DELETE succeeds for authenticated user → RLS is correct
- [ ] INSERT blocked → record the Supabase error code and message; do NOT bypass with service role in browser
- [ ] DELETE blocked → same

If RLS blocks writes, the fix is a migration on the Supabase project — not a code change in the Vite app. Record the required policy and flag for a separate migration task.

---

## T-9 Patch (only if needed)

Apply patches only for issues found in T-1 through T-8.

Allowed patches:
- Fix TypeScript errors in `use-supabase-reactions.ts` without restructuring the hook
- Fix TypeScript errors in `PostCard.tsx` without changing JSX
- Add a missing null guard if a crash path was found
- Correct the reaction type mapping if a mismatch was found

Not allowed:
- Restructuring the hook
- Changing PostCard layout or visual design
- Adding new dependencies
- Bypassing RLS with service role in the browser

---

## T-10 Final validation

After any patches from T-9:

```
pnpm tsc --noEmit
pnpm build
```

- [ ] Both pass with zero errors
- [ ] Re-run T-6 (signed-out tap) to confirm no regression
- [ ] Update `migration-map.md`: move reactions from "Next / Needs Wiring" to "✅ Real" only if all proof is complete

---

## Definition of Done

Reactions are confirmed real when ALL of the following are true:
1. `pnpm tsc --noEmit` passes
2. `pnpm build` passes
3. Signed-out tap shows toast, no crash
4. Signed-in insert writes to `user_post_reactions`
5. Signed-in delete removes from `user_post_reactions`
6. Count updates without page reload
7. Lovable UI is visually unchanged
