# Design — Wire Comments to Supabase

## Schema: `user_post_comments`

```sql
id                 uuid  primary key  default gen_random_uuid()
post_id            uuid  not null  → user_posts.id  (cascade delete)
creator_id         uuid  not null  → auth.users.id  (cascade delete)
parent_comment_id  uuid  null      → user_post_comments.id  (cascade delete)
body               text  not null
metadata           jsonb not null  default '{}'
created_at         timestamptz not null  default now()
updated_at         timestamptz not null  default now()
moderation_status  text  default 'visible'
  check: ('visible','pending_review','hidden','removed')
deleted_at         timestamptz null
```

### RLS
| Operation | Policy | Condition |
|-----------|--------|-----------|
| SELECT | public | `using (true)` |
| INSERT | authenticated | `with check (creator_id = auth.uid())` |
| UPDATE | authenticated | `using/check (creator_id = auth.uid())` |
| DELETE | authenticated | `using (creator_id = auth.uid())` |

---

## Existing Lovable `Comment` Shape

```ts
type Comment = {
  id: string
  postId: string
  parentId?: string
  author: { name: string; handle: string; avatar: string }
  text: string
  likes: number
  likedByMe: boolean
  createdAt: number   // ms timestamp
  editedAt?: number
}
```

## DB → `Comment` Mapping

| Comment field | DB column / join | Notes |
|---------------|-----------------|-------|
| `id` | `id` | |
| `postId` | `post_id` | |
| `parentId` | `parent_comment_id` | null → undefined |
| `author.name` | `profiles.display_name` | joined via `creator_id` |
| `author.handle` | `profiles.username` | |
| `author.avatar` | `profiles.avatar_url` | fallback to pravatar |
| `text` | `body` | |
| `likes` | `0` | local-only, no DB table |
| `likedByMe` | `false` | local-only |
| `createdAt` | `new Date(created_at).getTime()` | |
| `editedAt` | `undefined` | edit stays local |

Select query:
```sql
select
  id, post_id, parent_comment_id, body, created_at,
  creator:profiles!user_post_comments_creator_id_fkey(
    public_profile_uid, display_name, username, avatar_url
  )
from user_post_comments
where post_id = $1
  and moderation_status = 'visible'
  and deleted_at is null
order by created_at asc
```

---

## UUID Guard

Mock posts have IDs like `"1"`, `"2"`, `"3"`. Real posts have UUIDs.
The hook must detect this and skip the DB fetch for non-UUID IDs:

```ts
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isRealPost = UUID_RE.test(postId);
```

---

## Implementation: Replace `CommentsProvider` internals

The Lovable `PostCard` calls `useComments()` from `@/lib/comments-store`.
The cleanest approach is to replace the `CommentsProvider` implementation
so `useComments()` returns real data — without changing `PostCard` at all.

### Strategy

Replace `src/lib/comments-store.tsx` with a version that:
1. Keeps the identical `Comment` type and `Ctx` interface
2. Keeps `useComments()` export
3. Replaces the localStorage store with a Supabase-backed store
4. Uses `useAuth()` from `@/hooks/use-auth` for session/user
5. Fetches comments per `postId` on demand (lazy — only when `byPost` is called
   for a postId that hasn't been fetched yet)
6. Falls back to localStorage for non-UUID post IDs (mock posts)

### `CommentsProvider` internal state

```ts
// Real comments fetched from DB, keyed by postId
const [dbComments, setDbComments] = useState<Record<string, Comment[]>>({});
// Fetched post IDs (to avoid re-fetching)
const [fetched, setFetched] = useState<Set<string>>(new Set());
// Local-only comments (mock posts + optimistic inserts before DB confirms)
const [localItems, setLocalItems] = useState<Comment[]>(SEED);
```

### `byPost(postId)` logic
```
if UUID → fetch from DB if not yet fetched, return dbComments[postId] ?? []
if not UUID → return localItems filtered by postId
```

### `add(postId, text, parentId)` logic
```
if UUID and signed-in:
  optimistically add to dbComments[postId]
  insert into user_post_comments
  on error: remove optimistic entry, toast("Comment failed")
if UUID and signed-out:
  no-op (PostCard already guards this with toast + redirect)
if not UUID:
  add to localItems (existing behavior)
```

### `remove(id)` logic
```
if UUID comment and signed-in:
  optimistically remove from dbComments
  delete from user_post_comments where id = $id
  on error: restore, toast("Delete failed")
if not UUID comment:
  remove from localItems
```

### `isMine(c)` logic
```
if signed-in: c.author.handle === supabaseUser's username
if signed-out: c.author.handle === currentUser.handle (existing behavior)
```

### `toggleLike` and `edit`
Remain local-only. No DB calls. Operate on whichever store the comment lives in.

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/comments-store.tsx` | **Replace internals** — keep identical public API |

**No other files change.** `PostCard.tsx` is untouched.

---

## Rollback

Restore the original `comments-store.tsx` from git. `PostCard` is unchanged so
it immediately reverts to localStorage behavior.
