# Design: Creator Studio — Read-Only Dashboard Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09

---

## 1. Architecture Overview

```
CreatorStudioLayout
  └── useCreatorStudio()          ← NEW hook (src/hooks/use-creator-studio.ts)
        ├── useCurrentUser()      ← existing (user.id, email, follower_count)
        ├── supabase-browser      ← existing client
        ├── channels              ← SELECT (RLS: owner_email = jwt email)
        ├── shows                 ← SELECT (RLS: owner via channel)
        └── episodes              ← SELECT (RLS: owner via channel)

Routes consuming useCreatorStudio():
  creator-studio.index.tsx        ← replaces useSubmissions()
  creator-studio.submissions.tsx  ← replaces useSubmissions()
  creator-studio.analytics.tsx    ← replaces useSubmissions() for episode table
  creator-studio.fans.tsx         ← replaces hardcoded follower count only
```

One new file. Four targeted route edits. `submissions-store.tsx` untouched.

---

## 2. New Hook: `use-creator-studio.ts`

### Public interface

```ts
type CreatorStudioData = {
  channel: ChannelRow | null;
  shows: ShowRow[];
  episodes: EpisodeRow[];
  submissions: Submission[];       // episodes mapped to Lovable Submission shape
  isApprovedCreator: boolean;
  loading: boolean;
};
```

`Submission` is imported from `@/lib/submissions-store` — same type, no duplication.

### Internal Supabase types (unexported)

```ts
type ChannelRow = {
  id: string;
  owner_email: string;
  status: string;
  slug: string | null;
  name?: string | null;
  title?: string | null;
  banner_url?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
};

type ShowRow = {
  id: string;
  channel_id: string;
  title: string;
  status: string;
  created_at: string;
};

type EpisodeRow = {
  id: string;
  channel_id: string;
  show_id: string;
  title: string;
  season_number: number;
  episode_number: number;
  thumbnail_url: string | null;
  publish_status: string;
  scheduled_at: string | null;
  published_at: string | null;
  audio_status: string | null;
  created_at: string;
  updated_at: string;
};
```

---

## 3. Data Flow

### 3a. Load (mount)

```
useCreatorStudio() mounts
  → user = useCurrentUser()
  → if null: return { channel:null, shows:[], episodes:[], submissions:[], isApprovedCreator:false, loading:false }
  → setLoading(true)
  → supabase
      .from('channels')
      .select('id, owner_email, status, slug, name, title, banner_url, avatar_url, created_at, updated_at')
      .eq('owner_email', user.email)          ← requires email from useCurrentUser()
      .in('status', ['draft', 'active'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  → if channel null: setIsApprovedCreator(false), setLoading(false), return
  → parallel:
      supabase.from('shows').select('id, channel_id, title, status, created_at')
        .eq('channel_id', channel.id)
        .order('created_at', { ascending: false })

      supabase.from('episodes').select('id, channel_id, show_id, title, season_number, episode_number, thumbnail_url, publish_status, scheduled_at, published_at, audio_status, created_at, updated_at')
        .eq('channel_id', channel.id)
        .order('created_at', { ascending: false })
        .limit(50)
  → map episodes + shows → Submission[]
  → setState({ channel, shows, episodes, submissions, isApprovedCreator: true })
  → setLoading(false)
```

### 3b. No writes

The hook is read-only. No INSERT, UPDATE, DELETE.

---

## 4. Key Design Decision: Email-Based Access Gate

The `channels` table uses `owner_email` (not `owner_id` / `user_id`) as the ownership field. The RLS policy is `owner_email = auth.jwt()->>'email'`.

`useCurrentUser()` currently exposes the Supabase `profiles` row. The `profiles` table has an `id` (= `auth.uid()`) but may not expose `email` directly (email is in `auth.users`, not `profiles`).

**Solution:** Use `supabase.auth.getUser()` inside the hook to get the authenticated user's email, separate from `useCurrentUser()`. This is a one-time call on mount, not a subscription.

```ts
const { data: { user: authUser } } = await supabase.auth.getUser();
const email = authUser?.email?.toLowerCase() ?? null;
if (!email) { /* not signed in */ return; }
```

This avoids adding `email` to the `profiles` schema or `useCurrentUser()`.

---

## 5. Episode → Submission Mapping

```ts
function episodeToSubmission(ep: EpisodeRow, shows: ShowRow[]): Submission {
  const show = shows.find(s => s.id === ep.show_id);
  return {
    content_id: ep.id,
    creator_id: ep.channel_id,
    creator_name: '',
    creator_handle: '',
    creator_avatar: '',
    title: ep.title,
    short_description: '',
    full_description: '',
    viewer_context: '',
    what_to_know: '',
    why_it_matters: '',
    creator_note: '',
    show_id: ep.show_id,
    show_title: show?.title ?? '',
    season_number: ep.season_number,
    episode_number: ep.episode_number,
    episode_type: 'Full Episode',
    category: [],
    tags: [],
    mood_tags: [],
    thumbnail_url: ep.thumbnail_url ?? '',
    poster_url: '',
    video_url: '',
    duration: '',
    quality: '',
    visibility: 'public',
    access_type: 'free',
    content_rating: '',
    language: '',
    explicit_content: false,
    is_trailer: false,
    is_bonus: false,
    is_finale: false,
    is_premiere: false,
    status: publishStatusToSubmissionStatus(ep.publish_status),
    admin_feedback: '',
    admin_internal_note: '',
    policy_ack: true,
    created_at: ep.created_at,
    updated_at: ep.updated_at,
  };
}

function publishStatusToSubmissionStatus(s: string): SubmissionStatus {
  if (s === 'draft') return 'draft';
  if (s === 'scheduled') return 'scheduled';
  if (s === 'published') return 'published';
  if (s === 'archived') return 'approved';
  return 'pending';
}
```

---

## 6. Changes to Route Files

### `creator-studio.index.tsx`
- Add import: `useCreatorStudio`
- Replace: `const { submissions } = useSubmissions()` → `const { submissions, isApprovedCreator } = useCreatorStudio()`
- Remove: `useSubmissions` import (if no longer used)
- `myName` / `channelHandle`: already from `useAuth()` — leave as-is (useCurrentUser bridge handles this)

### `creator-studio.submissions.tsx`
- Add import: `useCreatorStudio`
- Replace: `const store = useSubmissions()` → `const { submissions } = useCreatorStudio()`
- Replace: `const mine = user ? store.byCreator(user.uid) : store.submissions` → `const mine = submissions`
- `store.remove()` call: replace with `toast('Delete not available yet')` (no write this phase)
- `store.submit()` / `store.updateDraft()`: not called in this route — no change needed
- Keep `STATUS_LABEL`, `STATUS_TONE` imports from `submissions-store` (still needed for rendering)

### `creator-studio.analytics.tsx`
- Add import: `useCreatorStudio`
- Replace: `const store = useSubmissions()` → `const { episodes } = useCreatorStudio()`
- Replace: `store.submissions.filter(...)` → `episodes.filter(ep => ep.publish_status === 'published')`
- Episode table rows: use `ep.id`, `ep.title`, `ep.season_number`, `ep.episode_number` directly
- Sparkline values remain randomly generated

### `creator-studio.fans.tsx`
- Add import: `useCurrentUser`
- Replace: `"32.7K"` in Total Fans metric card → `` `${currentUser?.follower_count?.toLocaleString() ?? '—'}` ``
- Fan list remains mock — no other changes

---

## 7. `CreatorStudioLayout` Access Gate

`CreatorStudioLayout` reads `isApprovedCreator` from `useAuth()`. The Lovable `useAuth()` hook is the mock auth context — it has no real Supabase channel check.

**Approach:** Add `useCreatorStudio()` call inside `CreatorStudioLayout` and use its `isApprovedCreator` value instead of `useAuth().isApprovedCreator`. The `isGuest` redirect remains from `useAuth()` (already wired via `use-auth.ts`).

This is the minimal safe change: one additional hook call, one field swap.

---

## 8. Files Changed

| File | Change |
|---|---|
| `src/hooks/use-creator-studio.ts` | New file |
| `src/components/layout/CreatorStudioLayout.tsx` | Add `useCreatorStudio()`, replace `isApprovedCreator` source |
| `src/routes/creator-studio.index.tsx` | Replace `useSubmissions()` with `useCreatorStudio()` |
| `src/routes/creator-studio.submissions.tsx` | Replace `useSubmissions()` with `useCreatorStudio()`, wire `remove` to toast |
| `src/routes/creator-studio.analytics.tsx` | Replace `useSubmissions()` with `useCreatorStudio()` for episode table |
| `src/routes/creator-studio.fans.tsx` | Replace hardcoded follower count with `useCurrentUser()` |

`submissions-store.tsx` is not modified.

---

## 9. Rollback Plan

`submissions-store.tsx` is untouched. To rollback any route: restore the `useSubmissions()` import and remove the `useCreatorStudio()` call. Each route is independently revertible in under a minute.

---

## 10. Validation

```
pnpm tsc --noEmit   # zero errors
pnpm build          # clean build
```
