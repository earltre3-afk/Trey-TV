# Design: Creator Studio — Post Queue Read-back / Status Display

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09

---

## 1. Architecture Overview

```
creator-studio.submissions.tsx
  ├── useCreatorStudio().submissions    ← existing (episodes table)
  ├── useCreatorPostQueue().queueRows   ← NEW hook
  └── useMemo: merge + deduplicate      ← NEW logic in submissions.tsx
        └── renders into existing SubmissionCard / SubmissionRow
              (STATUS_LABEL + STATUS_TONE already handle all approval_status values)
```

Two changes total:

1. New file: `src/hooks/use-creator-post-queue.ts`
2. Targeted edit: `src/routes/creator-studio.submissions.tsx` — import hook, add merge `useMemo`

No new UI components. No new status labels. No new badge styles.

---

## 2. New File: `src/hooks/use-creator-post-queue.ts`

```ts
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import { useCreatorStudio } from "@/hooks/use-creator-studio";

export type QueueRow = {
  id: string;
  edit_project_id: string | null;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  episode_number: number | null;
  stream_uid: string;
  visibility: string;
  approval_status: "pending" | "approved" | "rejected" | "needs_changes";
  created_at: string;
  updated_at: string;
};

export type UseCreatorPostQueueReturn = {
  queueRows: QueueRow[];
  loading: boolean;
};

export function useCreatorPostQueue(): UseCreatorPostQueueReturn {
  const { isApprovedCreator } = useCreatorStudio();
  const [queueRows, setQueueRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isApprovedCreator) return;

    let mounted = true;
    setLoading(true);

    async function load() {
      try {
        const supabase = createBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await (supabase as any)
          .from("creator_post_queue")
          .select(
            "id, edit_project_id, title, description, thumbnail_url, episode_number, stream_uid, visibility, approval_status, created_at, updated_at",
          )
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (mounted) setQueueRows((data as QueueRow[]) ?? []);
      } catch {
        // non-fatal — leave queueRows empty
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = true;
    };
  }, [isApprovedCreator]);

  return { queueRows, loading };
}
```

**Key properties:**

- `admin_notes` is not in the SELECT — never fetched, never displayed.
- Gated on `isApprovedCreator` from `useCreatorStudio()` — same access gate already in use.
- Non-fatal on error — returns empty array.
- `(supabase as any)` cast — consistent with existing pattern throughout the codebase.

---

## 3. Mapping `QueueRow` → `Submission`

Pure module-level function in `creator-studio.submissions.tsx` (not exported):

```ts
function queueRowToSubmission(row: QueueRow): Submission {
  return {
    content_id: row.id,
    creator_id: "",
    creator_name: "",
    creator_handle: "",
    creator_avatar: "",
    title: row.title,
    short_description: row.description ?? "",
    full_description: "",
    viewer_context: "",
    what_to_know: "",
    why_it_matters: "",
    creator_note: "",
    show_id: "",
    show_title: "",
    season_number: 1,
    episode_number: row.episode_number ?? 1,
    episode_type: "Full Episode",
    category: [],
    tags: [],
    mood_tags: [],
    thumbnail_url: row.thumbnail_url ?? "",
    poster_url: "",
    video_url: "",
    duration: "",
    quality: "",
    visibility: "public",
    access_type: "free",
    content_rating: "",
    language: "",
    explicit_content: false,
    is_trailer: false,
    is_bonus: false,
    is_finale: false,
    is_premiere: false,
    status: row.approval_status,
    admin_feedback: "",
    admin_internal_note: "",
    policy_ack: true,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
```

`status: row.approval_status` works directly because `approval_status` values (`'pending'`, `'approved'`, `'rejected'`, `'needs_changes'`) are a subset of `SubmissionStatus`. TypeScript will accept this without a cast.

---

## 4. Merge Logic in `creator-studio.submissions.tsx`

Replace the existing `const mine = submissions;` line with a `useMemo` that merges both sources:

```ts
// Add import at top:
import { useCreatorPostQueue, type QueueRow } from "@/hooks/use-creator-post-queue";

// Add inside SubmissionsPage():
const { queueRows } = useCreatorPostQueue();

// Replace: const mine = submissions;
const mine = useMemo(() => {
  // Map queue rows to Submission shape
  const queueSubmissions = queueRows.map(queueRowToSubmission);

  // Build a set of edit_project_ids that have a queue row
  const queuedEditProjectIds = new Set(queueRows.map((r) => r.edit_project_id).filter(Boolean));

  // Keep episode-derived submissions that don't have a queue row
  const episodeOnly = submissions.filter((s) => !queuedEditProjectIds.has(s.content_id));

  return [...queueSubmissions, ...episodeOnly];
}, [submissions, queueRows]);
```

The `queueRowToSubmission` function is defined at module level (outside the component) so it doesn't need to be in the `useMemo` dependency array.

---

## 5. Data Flow

```
SubmissionsPage mounts
  │
  ├─ useCreatorStudio() → submissions (from episodes table)
  │
  ├─ useCreatorPostQueue() → queueRows (from creator_post_queue)
  │
  └─ useMemo merge:
       ├─ queueRows → mapped to Submission (status = approval_status)
       ├─ episodes with no matching queue row → kept as-is
       └─ merged list sorted by updated_at DESC (existing sort in filtered useMemo)
             │
             └─ SubmissionCard / SubmissionRow render STATUS_LABEL[s.status]
                  (existing — no change needed)
```

---

## 6. Why No New UI Is Needed

The submissions page already has:

- `STATUS_LABEL` for all four `approval_status` values (`pending` → `"Pending Review"`, etc.)
- `STATUS_TONE` badge classes for all four values
- Filter chips for `pending`, `approved`, `rejected`, `needs_changes`
- `admin_feedback` conditional render (shows nothing when `''`)
- `RowActions` that renders "Edit & resubmit" for `needs_changes`, "View" for `approved`/`published`

Queue rows slot directly into this existing structure with no visual changes.

---

## 7. Files Changed

| File                                        | Change                                                                                                    |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/hooks/use-creator-post-queue.ts`       | New file — SELECT hook                                                                                    |
| `src/routes/creator-studio.submissions.tsx` | Import hook; add `queueRowToSubmission` function; replace `const mine = submissions` with merge `useMemo` |

No other files modified.

---

## 8. Rollback Plan

Remove the `useCreatorPostQueue` import and the merge `useMemo` from `submissions.tsx`, restoring `const mine = submissions`. The hook file can remain — it is not called if not imported.

---

## 9. Validation

```
pnpm tsc --noEmit   # zero new errors
pnpm build          # clean build
```
