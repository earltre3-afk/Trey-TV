# Requirements — Wire Comments to Supabase

## Context

The Lovable `PostCard` has a fully-built inline comment UI backed by a mock
localStorage store (`src/lib/comments-store.tsx`). Comments open inline below
each post, support add/reply/delete/edit/like, and are keyed by `post.id`.
When real DB posts are shown, `post.id` is a real Supabase UUID — making it
possible to wire comments to `user_post_comments` without changing any UI.

---

## Functional Requirements

### FR-1 Load real comments
When a post's comment section is opened, comments must be fetched from
`user_post_comments` for that `post_id`.

### FR-2 Signed-in insert
A signed-in user submitting the comment form must insert a row into
`user_post_comments` with `creator_id = auth.user.id`.

### FR-3 Signed-in delete (own only)
A signed-in user may delete their own comment. The delete button is already
rendered by the Lovable UI when `isMine(c)` is true. The hook must only
delete rows where `creator_id = auth.uid()` (enforced by RLS).

### FR-4 Reply support
The Lovable UI supports replies via `parentId`. The DB has `parent_comment_id`.
Replies must be inserted with `parent_comment_id` set when a reply is in progress.

### FR-5 Signed-out graceful handling
Submitting the comment form while signed out must show a toast and redirect to
`/onboarding`. This is already handled in `PostCard` — the hook must not crash
or throw when called without a session.

### FR-6 Comment count
The comment count displayed in the PostCard action row (`post.comments + allComments.length`)
must reflect real loaded comments. No page reload required.

### FR-7 Mock fallback for mock posts
When `post.id` is a mock string (e.g. `"1"`, `"2"`, `"3"`) rather than a UUID,
the hook must fall back to the existing localStorage behavior. Real DB fetch
only fires for UUID-shaped post IDs.

### FR-8 Comment like stays local
There is no `user_post_comment_likes` table in the schema. Comment likes remain
local-only (existing `toggleLike` in the store). Do not add a DB table for this.

### FR-9 Edit stays local
The Lovable UI supports editing comments. The DB has UPDATE RLS but edit is
out of scope for this task. Edit continues to work locally only.

### FR-10 No private data exposed
Comments must only display: author `display_name`, `username`, `avatar_url`,
`public_profile_uid` (for profile links), `body`, `created_at`.
Do not expose `creator_id` (internal UUID), `metadata`, or `deleted_at`.

### FR-11 RLS respected
Do not bypass RLS with a service-role key in the browser. If RLS blocks an
operation, report it — do not work around it.

### FR-12 No RESTORE UI imported
No component from `TREY-TV-RESTORE-599/components/` may be imported.

### FR-13 Lovable UI unchanged
`PostCard.tsx` JSX/layout must not change. The comment section renders exactly
as it does today — only the data source changes.

### FR-14 TypeScript passes
`pnpm tsc --noEmit` must pass with zero errors.

### FR-15 Build passes
`pnpm build` must complete with zero errors.

---

## Out of Scope
- Comment likes wired to DB
- Comment edit wired to DB
- Notifications on new comment
- Pagination / infinite scroll for comments
- Moderation status filtering (show all `visible` comments only)
- Admin tools
