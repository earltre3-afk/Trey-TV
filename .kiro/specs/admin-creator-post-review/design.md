# Design: Admin Review UI — creator_post_queue

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09

---

## 1. Architecture Overview

```
admin.content-approval.tsx
  └── useAdminPostQueue()                    ← NEW hook
        └── getAdminPostQueue()              ← NEW server function
              ├── auth check (admin only)
              └── service-role SELECT creator_post_queue (all rows)

admin.content-approval.$id.tsx
  ├── getAdminPostQueueItem({ queueId })     ← NEW server function (called on mount)
  │     ├── auth check (admin only)
  │     └── service-role SELECT single row + admin_notes
  └── reviewAdminPostQueue({ ... })          ← NEW server function (on action buttons)
        ├── auth check (admin only)
        ├── validation (approval rules, own-content check)
        ├── service-role UPDATE creator_post_queue
        └── service-role UPDATE creator_edit_projects (status sync)
```

New files: `src/lib/admin/post-queue.server.ts`, `src/hooks/use-admin-post-queue.ts`  
Modified files: `src/routes/admin.content-approval.tsx`, `src/routes/admin.content-approval.$id.tsx`

**Security note:** `AdminShell` / `isAdmin` in the browser is a visual-only gate (localStorage mock). It does not authorize server-side actions. Every server function independently verifies admin identity server-side before constructing the service-role client.

---

## 2. New File: `src/lib/admin/post-queue.server.ts`

### 2.1 Types

```ts
export type AdminQueueItem = {
  id: string;
  creator_id: string;
  edit_project_id: string | null;
  channel_id: string | null;
  show_id: string | null;
  episode_number: number | null;
  title: string;
  description: string | null;
  stream_uid: string;
  thumbnail_url: string | null;
  visibility: string;
  is_plus_content: boolean;
  scheduled_at: string | null;
  approval_status: 'pending' | 'approved' | 'rejected' | 'needs_changes';
  created_at: string;
  updated_at: string;
};

export type AdminQueueItemDetail = AdminQueueItem & {
  admin_notes: string | null;
};
```

### 2.2 Admin verification helper (internal)

Authorization order: authenticate first with the normal auth client, authorize second, construct service-role client only after both pass.

```ts
async function verifyAdmin(accessToken: string): Promise<{ id: string; email: string }> {
  const supabaseEnv = getSupabasePublicEnv();
  if (!supabaseEnv) throw new Error('Admin not configured');

  // Step 1: authenticate with normal auth client — service-role not involved yet
  const authClient = createClient(supabaseEnv.url, supabaseEnv.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data: { user }, error } = await authClient.auth.getUser(accessToken);
  if (error || !user?.email) throw new Error('Admin access required');

  // Step 2: authorize — check profiles.role = 'admin' first
  const { data: profile } = await (authClient as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role === 'admin') return { id: user.id, email: user.email };

  // Fallback: check ADMIN_EMAILS server-only env var
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? [];
  if (adminEmails.length > 0 && adminEmails.includes(user.email.toLowerCase())) {
    return { id: user.id, email: user.email };
  }

  throw new Error('Admin access required');
}
```

`verifyAdmin` never touches the service-role client. The service-role client is only constructed in `getAdminClient()`, which is only called after `verifyAdmin` returns successfully.

### 2.3 Service-role client helper (internal)

Only called after `verifyAdmin` returns successfully.

```ts
function getAdminClient() {
  // VITE_SUPABASE_URL is already public — safe to reuse here
  const url = process.env.VITE_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) throw new Error('Admin not configured');
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
```

`SUPABASE_SERVICE_ROLE_KEY` has no `VITE_*` prefix — never injected into the client bundle. `ADMIN_EMAILS` and `SUPABASE_SERVICE_ROLE_KEY` are both read only inside `createServerFn` handlers via `process.env`.

### 2.4 `getAdminPostQueue`

```ts
export const getAdminPostQueue = createServerFn({ method: 'POST' })
  .inputValidator(validateAccessToken)
  .handler(async ({ data }): Promise<AdminQueueItem[]> => {
    await verifyAdmin(data.accessToken);
    const supabase = getAdminClient();
    const { data: rows, error } = await (supabase as any)
      .from('creator_post_queue')
      .select('id, creator_id, edit_project_id, channel_id, show_id, episode_number, title, description, stream_uid, thumbnail_url, visibility, is_plus_content, scheduled_at, approval_status, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw new Error('Failed to load queue');
    return (rows as AdminQueueItem[]) ?? [];
  });
```

Note: `admin_notes` is NOT in this SELECT — list view does not expose it.

### 2.5 `getAdminPostQueueItem`

```ts
export const getAdminPostQueueItem = createServerFn({ method: 'POST' })
  .inputValidator(validateQueueItemInput)
  .handler(async ({ data }): Promise<AdminQueueItemDetail | null> => {
    await verifyAdmin(data.accessToken);
    const supabase = getAdminClient();
    const { data: row } = await (supabase as any)
      .from('creator_post_queue')
      .select('id, creator_id, edit_project_id, channel_id, show_id, episode_number, title, description, stream_uid, thumbnail_url, visibility, is_plus_content, scheduled_at, approval_status, admin_notes, created_at, updated_at')
      .eq('id', data.queueId)
      .maybeSingle();
    return (row as AdminQueueItemDetail) ?? null;
  });
```

### 2.6 `reviewAdminPostQueue`

```ts
export const reviewAdminPostQueue = createServerFn({ method: 'POST' })
  .inputValidator(validateReviewInput)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const adminUser = await verifyAdmin(data.accessToken);
    const supabase = getAdminClient();

    const validStatuses = ['pending', 'approved', 'rejected', 'needs_changes'];
    if (!validStatuses.includes(data.approvalStatus)) throw new Error('Invalid approval status');

    if ((data.approvalStatus === 'rejected' || data.approvalStatus === 'needs_changes') && !data.adminNotes.trim()) {
      throw new Error('A note is required when rejecting or requesting changes');
    }

    const { data: queue } = await (supabase as any)
      .from('creator_post_queue')
      .select('id, creator_id, edit_project_id, channel_id, show_id, episode_number, title, stream_uid, is_plus_content')
      .eq('id', data.queueId)
      .maybeSingle();

    if (!queue) throw new Error('Submission not found');

    if (data.approvalStatus === 'approved') {
      if (!queue.title?.trim()) throw new Error('Approval blocked: missing title');
      if (!queue.stream_uid?.trim()) throw new Error('Approval blocked: missing stream UID');
      if (!queue.episode_number || queue.episode_number < 1) throw new Error('Approval blocked: invalid episode number');
      if (!queue.channel_id) throw new Error('Approval blocked: missing channel');
      if (!queue.show_id) throw new Error('Approval blocked: missing show');
      if (!queue.edit_project_id) throw new Error('Approval blocked: missing edit project');
      if ((queue.episode_number === 1 || queue.episode_number === 2) && queue.is_plus_content) {
        throw new Error('Approval blocked: episodes 1 and 2 must be free');
      }
      if (queue.creator_id === adminUser.id) throw new Error('Admins cannot approve their own content');
    }

    const { error: updateError } = await (supabase as any)
      .from('creator_post_queue')
      .update({ approval_status: data.approvalStatus, admin_notes: data.adminNotes.trim() || null })
      .eq('id', data.queueId);

    if (updateError) throw new Error(updateError.message);

    if (queue.edit_project_id) {
      const projectStatusMap: Record<string, string> = {
        approved: 'published',
        rejected: 'rejected',
        needs_changes: 'ready',
        pending: 'submitted',
      };
      await (supabase as any)
        .from('creator_edit_projects')
        .update({ status: projectStatusMap[data.approvalStatus] })
        .eq('id', queue.edit_project_id);
    }

    return { ok: true };
  });
```

---

## 3. New File: `src/hooks/use-admin-post-queue.ts`

```ts
export function useAdminPostQueue() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<AdminQueueItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const result = await getAdminPostQueue({ data: { accessToken: session.access_token } });
      setItems(result);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { load(); }, [load]);

  return { items, loading, reload: load };
}
```

---

## 4. Mapping `AdminQueueItem` → `Submission`

Pure module-level function in `admin.content-approval.tsx` (not exported):

```ts
function queueItemToSubmission(item: AdminQueueItem): Submission {
  return {
    content_id: item.id,
    creator_id: item.creator_id,
    creator_name: '',
    creator_handle: '',
    creator_avatar: '',
    title: item.title,
    short_description: item.description ?? '',
    full_description: '',
    viewer_context: '', what_to_know: '', why_it_matters: '', creator_note: '',
    show_id: item.show_id ?? '',
    show_title: '',
    season_number: 1,
    episode_number: item.episode_number ?? 1,
    episode_type: 'Full Episode',
    category: [], tags: [], mood_tags: [],
    thumbnail_url: item.thumbnail_url ?? '',
    poster_url: '', video_url: '', duration: '', quality: '',
    visibility: 'public',
    access_type: item.is_plus_content ? 'subscribers' : 'free',
    content_rating: '', language: '',
    explicit_content: false, is_trailer: false, is_bonus: false,
    is_finale: false, is_premiere: false,
    status: item.approval_status,
    admin_feedback: '',
    admin_internal_note: '',
    policy_ack: true,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}
```

---

## 5. Changes to `admin.content-approval.tsx`

Replace:
```ts
const store = useSubmissions();
// ...
const stats = useMemo(() => ({ pending: store.submissions.filter(...) }), [store.submissions]);
const filtered = store.submissions.filter(...);
```

With:
```ts
const { items, loading, reload } = useAdminPostQueue();
const submissions = useMemo(() => items.map(queueItemToSubmission), [items]);
// stats and filtered use `submissions` instead of `store.submissions`
```

Replace button handlers:
```ts
// BEFORE:
onClick={() => { store.approve(s.content_id); toast.success("Approved"); }}
// AFTER:
onClick={async () => {
  try {
    const { data: { session } } = await createBrowserClient().auth.getSession();
    await reviewAdminPostQueue({ data: { accessToken: session!.access_token, queueId: s.content_id, approvalStatus: 'approved', adminNotes: '' } });
    toast.success('Approved');
    reload();
  } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
}}
```

Same pattern for "Needs Changes" and "Reject" — those pass `feedbackText` as `adminNotes`.

---

## 6. Changes to `admin.content-approval.$id.tsx`

Add a `useEffect` on mount to call `getAdminPostQueueItem` and load the full detail (including `admin_notes` into the `internal` state).

Replace `store.approve()` / `store.requestChanges()` / `store.reject()` calls with `reviewAdminPostQueue` calls, then `navigate({ to: '/admin/content-approval' })`.

---

## 7. Files Changed

| File | Change |
|---|---|
| `src/lib/admin/post-queue.server.ts` | New — three server functions + types |
| `src/hooks/use-admin-post-queue.ts` | New — list hook |
| `src/routes/admin.content-approval.tsx` | Replace `useSubmissions()` with `useAdminPostQueue()`; replace store action calls with server function calls |
| `src/routes/admin.content-approval.$id.tsx` | Add detail load on mount; replace store action calls with server function calls |

`submissions-store.tsx` is not modified.

---

## 8. Rollback Plan

Restore `useSubmissions()` in both admin routes and remove the server function imports. The server function file and hook can remain — they are not called if not imported.

---

## 9. Validation

```
pnpm tsc --noEmit   # zero new errors
pnpm build          # clean build — confirms SUPABASE_SERVICE_ROLE_KEY not in client bundle
grep -rn "SUPABASE_SERVICE_ROLE_KEY" src/routes/   # must return no matches
grep -rn "SUPABASE_SERVICE_ROLE_KEY" src/hooks/    # must return no matches
grep -rn "VITE_SUPABASE_SERVICE_ROLE" src/         # must return no matches
grep -rn "ADMIN_EMAILS" src/routes/                # must return no matches
grep -rn "ADMIN_EMAILS" src/hooks/                 # must return no matches
```
