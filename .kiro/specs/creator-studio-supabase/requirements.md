# Requirements: Creator Studio — Read-Only Dashboard Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Scope:** Read-only dashboard data only. No uploads, no Cloudflare Stream, no edit studio, no payouts, no Stripe, no admin tools, no redesign.

---

## 1. Goal

Replace mock/seed data in the Creator Studio dashboard with real Supabase reads. The existing `CreatorStudioLayout` access gate, the dashboard index, the submissions list, and the analytics episode table are the primary wiring targets. No structural UI changes.

---

## 2. What the Lovable Creator Studio Currently Uses

| Surface                                   | Current source                                | Target                                   |
| ----------------------------------------- | --------------------------------------------- | ---------------------------------------- |
| Access gate (`isApprovedCreator`)         | `useAuth()` mock field                        | `channels` table — owner_email match     |
| Creator name / handle                     | `useAuth().user` mock                         | `useCurrentUser()` (already real)        |
| Submissions list                          | `submissions-store.tsx` (localStorage + seed) | `episodes` table (own channel)           |
| Submission counts (pending/approved/etc.) | Derived from mock store                       | Derived from real episodes               |
| Best performer title                      | First published submission                    | First published episode title            |
| Analytics episode table                   | Filtered mock submissions                     | Real episodes from `episodes` table      |
| Fans page                                 | `mock-data.ts creators[]`                     | `follows` table (already wired globally) |
| Channel page fields                       | `useAuth().user` mock                         | `channels` table (own channel)           |

---

## 3. Schema Verification

### Table: `public.channels`

| Column           | Type          | Notes                                                        |
| ---------------- | ------------- | ------------------------------------------------------------ |
| `id`             | PK            |                                                              |
| `owner_email`    | `text`        | Access gate — matches `auth.jwt()->>'email'`                 |
| `status`         | `text`        | `draft` / `active` — approved = status in ('draft','active') |
| `slug`           | `text`        | Public channel URL slug                                      |
| `name` / `title` | `text`        | Channel display name (check actual column name)              |
| `banner_url`     | `text`        | nullable                                                     |
| `avatar_url`     | `text`        | nullable                                                     |
| `created_at`     | `timestamptz` |                                                              |
| `updated_at`     | `timestamptz` |                                                              |

**RLS:** `owner_email = auth.jwt()->>'email'` for SELECT and UPDATE.  
**Access gate logic:** A user is an approved creator if a `channels` row exists where `owner_email = auth.jwt()->>'email'` AND `status IN ('draft', 'active')`. Do NOT use `profiles.is_creator`.

### Table: `public.episodes`

| Column           | Type               | Notes                                                      |
| ---------------- | ------------------ | ---------------------------------------------------------- |
| `id`             | `uuid` PK          |                                                            |
| `channel_id`     | FK → `channels.id` | Ownership                                                  |
| `show_id`        | FK → `shows.id`    |                                                            |
| `title`          | `text`             |                                                            |
| `season_number`  | `integer`          |                                                            |
| `episode_number` | `integer`          |                                                            |
| `thumbnail_url`  | `text`             | nullable                                                   |
| `publish_status` | `text`             | `draft` / `scheduled` / `published` / `archived`           |
| `scheduled_at`   | `timestamptz`      | nullable                                                   |
| `published_at`   | `timestamptz`      | nullable                                                   |
| `audio_status`   | `text`             | `pending_review` / `cleared` / `needs_review` / `rejected` |
| `created_at`     | `timestamptz`      |                                                            |
| `updated_at`     | `timestamptz`      |                                                            |

**RLS:** Owners manage own episodes via `channel_id` → `channels.owner_email = auth.jwt()->>'email'`.

### Table: `public.shows`

| Column       | Type               | Notes                           |
| ------------ | ------------------ | ------------------------------- |
| `id`         | PK                 |                                 |
| `channel_id` | FK → `channels.id` |                                 |
| `title`      | `text`             | Show display name               |
| `status`     | `text`             | `draft` / `active` / `archived` |
| `created_at` | `timestamptz`      |                                 |

**RLS:** Owners manage own shows via `channel_id` → `channels.owner_email`.

### Writes Out of Scope

| Table                    | Reason                                   |
| ------------------------ | ---------------------------------------- |
| `episodes` INSERT/UPDATE | Upload wiring is out of scope            |
| `shows` INSERT/UPDATE    | Show creation is out of scope            |
| `channels` UPDATE        | Channel editing is out of scope          |
| `creator_post_queue`     | Submission queue writes are out of scope |
| `creator_edit_projects`  | Edit studio is out of scope              |

---

## 4. Functional Requirements

### FR-1: Creator access hook

- Create `src/hooks/use-creator-studio.ts`.
- Queries `channels` where `owner_email = auth.jwt()->>'email'` AND `status IN ('draft','active')`.
- Exposes: `channel`, `isApprovedCreator`, `loading`.
- Signed-out: `{ channel: null, isApprovedCreator: false, loading: false }` — no crash.
- Non-creator signed-in user: same empty state — the existing `CreatorGate` UI renders correctly.

### FR-2: Wire `CreatorStudioLayout` access gate

- `CreatorStudioLayout` currently reads `isApprovedCreator` from `useAuth()`.
- Replace with `isApprovedCreator` from `useCreatorStudio()`.
- The `CreatorGate` component and its copy remain unchanged.
- Signed-out redirect to `/login` remains unchanged.

### FR-3: Load episodes for the signed-in creator

- `useCreatorStudio()` also fetches `episodes` where `channel_id = channel.id`.
- Exposes: `episodes` (array), `shows` (array).
- Limit: 50 episodes on initial load.
- On error: `episodes = []`, no crash.

### FR-4: Map episodes to Lovable `Submission` shape

- The dashboard index and submissions page consume `useSubmissions()` from `submissions-store.tsx`.
- The new hook exposes a `submissions` array that maps real `episodes` rows to the existing `Submission` type shape used by the UI.
- Mapped fields:
  - `content_id` = `episode.id`
  - `creator_id` = `channel.id` (channel ownership, not user UUID)
  - `title` = `episode.title`
  - `show_title` = matched show title from `shows` array
  - `season_number` = `episode.season_number`
  - `episode_number` = `episode.episode_number`
  - `thumbnail_url` = `episode.thumbnail_url ?? ''`
  - `status` = mapped from `episode.publish_status` (see mapping below)
  - `scheduled_at` = `episode.scheduled_at ?? undefined`
  - `updated_at` = `episode.updated_at`
  - `created_at` = `episode.created_at`
  - All other `Submission` fields: safe empty defaults (`''`, `[]`, `false`, etc.)

### FR-5: `publish_status` → `SubmissionStatus` mapping

| `episode.publish_status` | `Submission.status` |
| ------------------------ | ------------------- |
| `draft`                  | `draft`             |
| `scheduled`              | `scheduled`         |
| `published`              | `published`         |
| `archived`               | `approved`          |
| anything else            | `pending`           |

### FR-6: Wire dashboard index to real data

- Replace `useSubmissions()` in `creator-studio.index.tsx` with `useCreatorStudio()`.
- `pending`, `approved`, `needsChanges`, `top` counts derived from real episodes.
- `myName` and `channelHandle` from `useCurrentUser()` (already real).
- Metric cards (Views, Watch Time, Followers, Engagement) remain hardcoded — analytics wiring is out of scope.

### FR-7: Wire submissions page to real data

- Replace `useSubmissions()` in `creator-studio.submissions.tsx` with `useCreatorStudio()`.
- The `store.remove()` and `store.submit()` calls on draft items: remain as no-ops or toast-only for this phase (no write wiring).
- Filter, search, grid/list view, and bulk select UI remain unchanged.

### FR-8: Wire analytics episode table to real data

- In `creator-studio.analytics.tsx`, the episode performance table currently filters `store.submissions` for published/approved/scheduled.
- Replace with `episodes` from `useCreatorStudio()` filtered to `publish_status = 'published'`.
- Sparkline chart values remain randomly generated (analytics data wiring is out of scope).

### FR-9: Wire fans page follower count

- `creator-studio.fans.tsx` currently uses `mock-data.ts creators[]` for the fan list.
- The fan list itself remains mock (fan profile data wiring is out of scope).
- The `Total Fans` metric card: replace hardcoded `"32.7K"` with `currentUser?.follower_count?.toLocaleString() ?? '—'` from `useCurrentUser()` (already real from `profiles`).

### FR-10: Signed-out / non-creator graceful handling

- All hooks return empty/false state for unauthenticated users.
- `CreatorGate` renders correctly for non-creators.
- No crash, no browser alert, no broken renders.

### FR-11: Visual preservation

- No structural, layout, or style changes to any Creator Studio route or component.
- The only changes are data source replacements.
- Mock seed data in `submissions-store.tsx` is preserved — the store is not deleted, only bypassed in the wired routes.

### FR-12: No writes from browser

- No INSERT, UPDATE, DELETE on `episodes`, `shows`, `channels`, `creator_post_queue`, or `creator_edit_projects`.
- Draft delete button in submissions page: becomes a no-op toast for this phase.

---

## 5. Non-Functional Requirements

- **Build safety:** Every change must pass `pnpm tsc --noEmit` and `pnpm build`.
- **No browser validation:** No Playwright, no screenshots, no Read URL checks.
- **No new dependencies.**
- **No redesign:** No RESTORE UI components. No structural changes.
- **Rollback:** `submissions-store.tsx` is untouched. Reverting the three route files restores mock behavior in one step.

---

## 6. Out of Scope

- Episode/video upload (Cloudflare Stream)
- Edit studio (`creator-studio.edit.tsx`, `creator-studio.submit.tsx`)
- Channel editing writes
- Show creation
- Analytics real data (view counts, watch time, engagement)
- Fan profile data (fan list remains mock)
- Creator rewards sub-page (`creator-studio.rewards.tsx`)
- Schedule page (`creator-studio.schedule.tsx`)
- Interactions page (`creator-studio.interactions.tsx`)
- Settings page (`creator-studio.settings.tsx`)
- Admin tools
- Payments / Stripe / creator payouts
