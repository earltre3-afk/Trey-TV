
# Plan — Publishing workflow + admin approval + UI anchoring

## Part A — UI anchoring tweaks

### A1. Mount side panel menu to the top of the page
File: `src/components/layout/SideMenu.tsx`

Change the panel from a left-slide drawer to a **top-anchored sheet** that drops down from the top of the viewport.
- Replace `left-0 top-0 bottom-0 w-[86%]` with `top-0 left-0 right-0 max-h-[92vh] w-full`.
- Replace `translate-x-*` open/close transition with `translate-y-*` (slides down from `-translate-y-full` to `translate-y-0`).
- Round only the bottom corners (`rounded-b-[32px]`).
- Keep the existing scrim, hamburger trigger in `AppHeader`, and all menu items / role gating logic unchanged.
- Items grid becomes 2 columns on mobile so it fits without overflow.

No change needed to `AppHeader` — the existing `Menu` button at the top-left already triggers it.

### A2. Trey-I chat panel pops out next to the floating icon
File: `src/components/ai/TreyIWidget.tsx`

The widget already anchors the panel to the launcher position via `panelStyle`. Two tightening changes:
- Keep launcher visible while panel is open (remove `opacity-0 pointer-events-none scale-50` on launcher when `open`).
- Position the panel **beside** the launcher horizontally (left if launcher on right edge, right if on left edge) instead of stacking above it. Compute `left = onLeft ? pos.x + SIZE + 8 : pos.x - W - 8` with viewport clamping; vertical centered to launcher then clamped.
- Add a small connector caret/glow line between launcher and panel for the "popout" feel.

No other widget logic changes.

## Part B — Creator publishing workflow

### B1. New: `src/lib/submissions-store.tsx`
Lightweight in-memory + `localStorage` store (mock backend) exposing a React context:
- `Submission` type with all the requested fields (`content_id, creator_id, title, short_description, full_description, viewer_context, creator_note, show_id, show_title, season_number, episode_number, episode_type, category, tags[], mood_tags[], thumbnail_url, poster_url, video_url, duration, quality, visibility, access_type, content_rating, explicit_content, status, admin_feedback, admin_internal_note, submitted_at, reviewed_at, approved_at, published_at, scheduled_at, created_at, updated_at`).
- `status` union: `"draft" | "pending" | "approved" | "rejected" | "needs_changes" | "scheduled" | "published"`.
- Actions: `createDraft`, `updateDraft`, `submit`, `approve`, `reject(feedback)`, `requestChanges(feedback)`, `schedule(date)`, `publish`, `remove`.
- Seeds 3 example submissions (1 pending, 1 needs_changes, 1 published) so the admin queue isn't empty on first load.
- `// TODO: replace with Supabase / server backend.`
- Provider mounted in `src/routes/__root.tsx` next to `AuthProvider` and `ActivityProvider`.

### B2. Edit: `src/routes/creator-studio.edit.tsx`
- Wire the existing **Export** button (or add an additional **Next: Content Details** primary button in the header) to:
  1. `createDraft({ title: projectName, video_url: mediaUrl, quality, duration })` if no draft id yet.
  2. `navigate({ to: "/creator-studio/submit", search: { id } })`.
- Keep the existing Export dialog as a "quick publish" backup but route its primary CTA to the same `/creator-studio/submit` flow.

### B3. New: `src/routes/creator-studio.submit.tsx` — "Prepare Your Episode"
Permission guard mirrors the Edit Studio (guest → `/login`, non-creator → `CreatorLockedScreen`).

Sections rendered as glass cards with neon borders, in this order:
1. **Content Preview Card** — large 16:9 thumbnail/video tile, duration overlay, Quality chip, Draft chip, three buttons (Back to Edit Studio → `/creator-studio/edit`, Replace Thumbnail, Preview Episode opens a `Dialog` with placeholder `<video>`).
2. **Episode Identity** — title, show, season #, episode #, episode type select (Full Episode / Clip / Trailer / BTS / Promo / Music Video / Interview / Live Replay / Bonus).
3. **Viewer Context** — short description, full description, "what to know", "why it matters", optional creator note, content tags chip-input, mood tags chip-input, category multi-select (Music, Comedy, Motivation, Fashion, Gaming, Lifestyle, Documentary, BTS, Live Performance, Interview).
4. **Series Organization** — segmented control "Use existing show" / "Create new show". Existing → select from creator's shows. New → show title/description/category/cover/visibility. Toggles: trailer, bonus, season finale, premiere. Episode release order numeric.
5. **Thumbnail & Cover** — episode thumbnail upload, vertical poster upload, series cover upload, "Use current video frame" button (mock: picks a placeholder), 3 auto-generated suggestion thumbs.
6. **Audience & Visibility** — intended audience select, content rating select, language select, explicit toggle, visibility radio (Public / Subscribers only / Private draft / Scheduled — date picker appears when scheduled). Note about Episode 1 & 2 free preview.
7. **Monetization / Access** — radio: Free / Subscribers only / Premium purchase / Gift-supported. Premium/Gift options show a "Coming soon — payments not connected" disabled state with `// TODO: payments`.
8. **Final Review Checklist** — derived from form state. Each row: green check or grey dot.
9. **Submit panel** — sticky bottom bar with the **Submit for Admin Approval** button, disabled until required fields complete: title, show, season, episode, short description, category, thumbnail, visibility, policy ack checkbox.

On submit → store transitions draft to `pending`, navigates to `/creator-studio/submitted?id=...`.

### B4. New: `src/routes/creator-studio.submitted.tsx`
Confirmation screen with: success glow, "Your episode has been submitted for admin approval", next-steps copy, three buttons → Back to Creator Hub / View Submission Status (`/creator-studio/submissions`) / Upload Another (`/creator-studio/edit`).

### B5. New: `src/routes/creator-studio.submissions.tsx`
Lists the current creator's submissions from the store as glass cards:
- Thumbnail, title, show · S#E#, status chip (color-coded), submitted date, admin feedback expandable panel when present.
- Per-row actions: View Details (modal with full submission), Edit/Resubmit (only if `needs_changes` → routes back to `/creator-studio/submit?id=...`), Delete Draft (only if `draft`).

### B6. Edit: `src/components/layout/SideMenu.tsx`
Add "My Submissions" link under the creator section pointing to `/creator-studio/submissions`.

## Part C — Admin approval system

### C1. New: `src/components/layout/AdminShell.tsx`
Wraps `AppShell wide` with a premium **Admin Sidebar** (left rail on `md+`, collapsible top tabs on mobile). Sections:
- Overview (`/admin`)
- Content Approval (`/admin/content-approval`)
- Creator Applications (`/admin/creators`)
- Users (`/admin/users`)
- Reports (`/admin/reports`)
- Videos (`/admin/videos`)
- Analytics (`/admin/analytics-admin` or `/analytics`)
- Recommendations (`/admin/recommendations`)
- Site Settings (`/settings`)

Liquid-glass dark panel, glowing active state. Uses `useRouterState` for active link. Guards admin-only via `useAuth().isAdmin`.

For sections without dedicated routes yet, link items render as `disabled` chips with a small "Soon" tag — no broken links. Existing `/admin` and `/analytics` keep their current behavior; only their visual chrome is wrapped.

### C2. Edit: `src/routes/admin.tsx`
Wrap existing content in `AdminShell`. Reuse existing KPI tiles + reports/creator approval cards but restyle to match new neon design tokens already used elsewhere. Add a **Content Approval** quick-link card pointing to `/admin/content-approval` showing pending count from the submissions store. Existing functionality preserved.

### C3. New: `src/routes/admin.content-approval.tsx`
- Header: "Content Approval" + subtitle.
- 5 stat cards: Pending Review, Approved This Week, Needs Changes, Rejected, Published — counts pulled from the store.
- Search bar (filter by title/creator) + filter chips (All / Pending / Approved / Needs Changes / Rejected / Scheduled / Published).
- List of submission cards with: thumbnail, title, creator (name + handle), show · S#E#, duration, category, tags (first 3), submitted date, status chip, quick actions: Review (→ detail), Approve, Needs Changes (opens feedback dialog), Reject (opens reason dialog).

### C4. New: `src/routes/admin.content-approval.$id.tsx`
Full review experience:
- Large preview player (placeholder `<video>` or thumb).
- Two-column layout (stacks on mobile): left = video + thumbnail, right = full submission metadata (title, creator, show, season/ep, descriptions, viewer context, tags/categories/moods, visibility, monetization, content rating, dates, revision history list).
- **Admin moderation checklist** card with the requested checks; admin must tick all before "Approve & Publish" enables.
- **Admin notes** area: public feedback (sent to creator) + internal note (admin-only).
- Action bar: Approve, Approve & Publish Immediately, Schedule Release (date input), Request Changes (requires feedback), Reject (requires reason), Move back to Draft, Preview public episode page (`/watch/$id`).

### C5. New: `src/routes/admin.creators.tsx`, `src/routes/admin.users.tsx`, `src/routes/admin.reports.tsx`, `src/routes/admin.videos.tsx`, `src/routes/admin.recommendations.tsx`
Lightweight pages wrapped in `AdminShell`, each with placeholder lists/tables built from existing mock data (`creators`, `posts`) styled with neon glass. These exist so the new sidebar has destinations and don't break links. Existing `/admin` aggregate page still works.

All admin routes guard via `if (!isAdmin) return <Navigate to="/login" />`.

## Part D — Public watch route

### D1. New: `src/routes/watch.$id.tsx`
Public episode detail page:
- If submission status is not `approved` / `published` and viewer is not the owning creator/admin → render "Episode unavailable" glass card.
- Otherwise: large video player area, title, creator chip (links to `/u/$uid`), show · S#E#, description, viewer context, tags, like/comment/save/share controls (toast placeholders), Related Episodes rail (other approved submissions), More From Creator rail.

## Part E — Wiring & safety

- `__root.tsx`: wrap children with `<SubmissionsProvider>` next to existing providers.
- `routeTree.gen.ts`: regenerated automatically by the TanStack Router Vite plugin.
- No schema changes, no new dependencies.
- All TODO comments mark backend hookup points (`// TODO: wire to Supabase`).
- Existing routes (`/creator-hub`, `/creator-studio/edit`, `/admin`, `/analytics`, `/onboarding`, profile, feed, rewards) are not removed or renamed.
- Trey-I onboarding files untouched.
- Mobile width 440px verified: every new page uses `space-y-*` stacks, scroll containers for long rails, no fixed widths beyond viewport.

## Acceptance

- Hamburger opens a top-anchored panel that slides down.
- Trey-I floating icon stays visible; its chat pops out beside it.
- Creator: Edit Studio → "Next: Content Details" → `/creator-studio/submit` → fills form → "Submit" → confirmation → status visible in `/creator-studio/submissions`.
- Admin: `/admin/content-approval` shows the pending submission with stats and filters; opening a card lands on `/admin/content-approval/[id]` with full detail, checklist, and Approve / Request Changes / Reject actions.
- Approved/published items are viewable at `/watch/[id]`; non-approved items show "unavailable".
- All routes role-gated; guest → `/login`, normal user → locked screen, creator/admin appropriate access.
- No build errors, no horizontal overflow at 440px.
