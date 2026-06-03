# Tasks — Admin Publishing Activation

## Schema Findings (Pre-confirmed — No Research Task Needed)

The following was confirmed by reading reference migrations before writing this spec:

| Finding                           | Result                                                       |
| --------------------------------- | ------------------------------------------------------------ |
| `episodes.edit_project_id` column | **Does NOT exist** in any migration                          |
| `ON CONFLICT (edit_project_id)`   | **Not valid** — column absent                                |
| Unique constraint for idempotency | `(show_id, slug)` only                                       |
| Idempotency strategy              | SELECT on `(show_id, video_asset_id)` → UPDATE or INSERT     |
| DB trigger on episodes            | `zz_episodes_enforce_publish_readiness` blocks naive publish |
| Bypass for admin publishing       | `admin_publish_override = true` (built into trigger)         |
| `episodes` RLS                    | Enabled — service-role required                              |

---

## Task 1 — Extend queue SELECT to include missing fields

**Goal:** The existing `reviewAdminPostQueue` SELECT does not fetch `description`,
`thumbnail_url`, or `scheduled_at`. These are required for the episode payload.

**Files involved:**

- `src/lib/admin/post-queue.server.ts`

**Steps:**

1. In `reviewAdminPostQueue`, extend the `.select(...)` string to include
   `description, thumbnail_url, scheduled_at`.
2. The `queue` variable is typed via `as any` cast — no type change needed.

**Acceptance criteria:**

- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- No behavior change — SELECT only.

**Security boundary:**

- Inside `reviewAdminPostQueue` server function only.
- `verifyAdmin()` already runs before this SELECT.

**Visual preservation:** Admin UI routes not modified. No visual change.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

**Rollback risk:** Low. SELECT-only change. Revert the select string if tsc fails.

---

## Task 2 — Add slugify helper inside post-queue.server.ts

**Goal:** `episodes` requires a non-null `slug`. A local `slugify` function is needed
to derive it from `queue.title`.

**Files involved:**

- `src/lib/admin/post-queue.server.ts`

**Steps:**

1. Add a module-level `slugify` function (not exported):
   ```typescript
   function slugify(value: string): string {
     return value
       .toLowerCase()
       .trim()
       .replace(/[^a-z0-9]+/g, "-")
       .replace(/^-+|-+$/g, "")
       .slice(0, 70);
   }
   ```
2. No other changes in this task.

**Acceptance criteria:**

- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Security boundary:** Pure utility function, no I/O.

**Visual preservation:** No UI change.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

**Rollback risk:** None.

---

## Task 3 — Implement episode INSERT/UPDATE on approval

**Goal:** After the existing `creator_post_queue` and `creator_edit_projects` updates
succeed, INSERT or UPDATE an `episodes` row when `approvalStatus === "approved"`.

**Files involved:**

- `src/lib/admin/post-queue.server.ts`

**Steps:**

1. Inside the `reviewAdminPostQueue` handler, after the two existing UPDATE calls,
   add an `if (data.approvalStatus === "approved")` block.

2. Build the episode payload:

   ```typescript
   const now = new Date().toISOString();
   const isScheduled = !!queue.scheduled_at && new Date(queue.scheduled_at) > new Date();
   const accessType =
     queue.episode_number <= 2 ? "free" : queue.is_plus_content ? "locked" : "free";
   const baseSlug = slugify(queue.title);

   const episodePayload = {
     channel_id: queue.channel_id,
     show_id: queue.show_id,
     episode_number: queue.episode_number,
     season_number: 1,
     title: queue.title,
     slug: baseSlug,
     description: queue.description ?? null,
     thumbnail_url: queue.thumbnail_url ?? null,
     video_thumbnail_url: queue.thumbnail_url ?? null,
     video_provider: "cloudflare_stream",
     video_asset_id: queue.stream_uid,
     video_status: "ready",
     publish_status: isScheduled ? "scheduled" : "published",
     access_type: accessType,
     scheduled_at: queue.scheduled_at ?? null,
     admin_publish_override: true,
     admin_publish_override_by: adminUser.id,
     admin_publish_override_at: now,
     updated_at: now,
   };
   ```

3. Check for an existing episode by `(show_id, video_asset_id)`:

   ```typescript
   const { data: existing } = await (supabase as any)
     .from("episodes")
     .select("id")
     .eq("show_id", queue.show_id)
     .eq("video_asset_id", queue.stream_uid)
     .maybeSingle();
   ```

4. If `existing` → UPDATE (omit `slug` to preserve the original):

   ```typescript
   const { error: episodeError } = await (supabase as any)
     .from("episodes")
     .update({ ...episodePayload, slug: undefined })
     .eq("id", existing.id);
   ```

5. If not `existing` → INSERT; on slug collision (`error.code === "23505"`), retry
   with `slug: baseSlug + "-" + queue.episode_number`:

   ```typescript
   let { error: episodeError } = await (supabase as any).from("episodes").insert(episodePayload);
   if (episodeError?.code === "23505") {
     const retry = await (supabase as any)
       .from("episodes")
       .insert({ ...episodePayload, slug: `${baseSlug}-${queue.episode_number}` });
     episodeError = retry.error;
   }
   ```

6. If `episodeError` is non-null → rollback (Task 4) then throw.

**Acceptance criteria:**

- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- `approvalStatus !== "approved"` does not enter the episode block.
- `episode_number <= 2` always produces `access_type = "free"`.
- Future `scheduled_at` produces `publish_status = "scheduled"`.
- Null `scheduled_at` produces `publish_status = "published"`.
- `admin_publish_override = true` is always set on the episode row.

**Security boundary:**

- Episode write uses `getAdminClient()` (service-role). Never exposed to browser.
- `verifyAdmin()` runs before any write.
- `profiles.is_creator` not used.

**Visual preservation:**

- `admin.content-approval.tsx` and `admin.content-approval.$id.tsx` not modified.
- Watch Now, Guide, Feed not touched.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

**Rollback risk:** Medium.

- If the episode write throws at runtime, the queue row may be stuck at `"approved"`
  without an episode. Task 4 handles this.
- If tsc fails, revert the added block. Existing approval flow is unaffected.

---

## Task 4 — Implement rollback on episode write failure

**Goal:** If the episode INSERT/UPDATE fails after `approval_status` has been set to
`"approved"`, revert `creator_post_queue.approval_status` to `"pending"` and
`creator_edit_projects.status` to `"submitted"`, then throw the original error.

**Files involved:**

- `src/lib/admin/post-queue.server.ts`

**Steps:**

1. In the episode error handler (from Task 3), add:
   ```typescript
   // Best-effort revert
   await (supabase as any)
     .from("creator_post_queue")
     .update({ approval_status: "pending", admin_notes: null })
     .eq("id", data.queueId);
   if (queue.edit_project_id) {
     await (supabase as any)
       .from("creator_edit_projects")
       .update({ status: "submitted" })
       .eq("id", queue.edit_project_id);
   }
   throw new Error("Publishing failed: " + episodeError.message);
   ```
2. The revert is best-effort. If it fails, the original episode error is still thrown.

**Acceptance criteria:**

- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- Episode write failure causes the server function to throw (not return `{ ok: true }`).
- Admin UI receives the error (existing error handling in the route is sufficient).

**Security boundary:** Rollback writes use the same service-role client. No new env vars.

**Visual preservation:** Admin UI routes not modified.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

**Rollback risk:** Low. Block only runs on episode write failure. Retry is safe
(idempotent by `show_id + video_asset_id`).

---

## Task 5 — Update steering docs

**Goal:** Record the confirmed schema findings and new publishing behavior in steering docs.

**Files involved:**

- `.kiro/steering/migration-map.md`
- `.kiro/steering/file-map.md`

**Steps:**

1. In `migration-map.md`, add to the "Real" section:
   ```
   | Admin Publishing Activation | `src/lib/admin/post-queue.server.ts` |
   `episodes` — INSERT or UPDATE on approval; idempotent on (show_id, video_asset_id);
   admin_publish_override=true bypasses DB readiness trigger; rollback on failure;
   first-two-free enforced; service-role only; tsc ✅ build ✅ |
   ```
2. In `file-map.md`, update the `admin/post-queue.server.ts` entry to note that
   `reviewAdminPostQueue` now also writes to `episodes` on approval.
3. Add a note: `episodes.edit_project_id` does NOT exist — do not use ON CONFLICT on it.

**Acceptance criteria:** Both steering files updated. No code changes.

**Security boundary:** Documentation only.

**Terminal validation:** N/A.

**Rollback risk:** None.

---

## Execution Order

```
Task 1 (extend SELECT)
  → Task 2 (slugify helper)
    → Task 3 (INSERT/UPDATE logic)
      → Task 4 (rollback)
        → Task 5 (docs)
```

---

## Do Not Do

- Do not use `ON CONFLICT (edit_project_id)` — column does not exist on `episodes`
- Do not use `supabase.upsert()` with `onConflict: "edit_project_id"`
- Do not add `edit_project_id` to `episodes` (separate migration lane, out of scope)
- Do not set `publish_status = "published"` without `admin_publish_override = true`
  (DB trigger will block it)
- Do not modify `watch-data.ts`, `guide-store.tsx`, `feed-store.tsx`
- Do not modify `index.tsx` or `guide.tsx`
- Do not write to `user_posts`
- Do not modify `admin.content-approval.tsx` or `admin.content-approval.$id.tsx`
- Do not add any `VITE_`-prefixed env var
- Do not use `profiles.is_creator`
- Do not run browser validation, Playwright, or screenshots
