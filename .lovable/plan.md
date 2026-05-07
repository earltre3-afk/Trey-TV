## Goal

Wire the Creator Hub "Upload" button to a new premium **Creator Edit Studio** at `/creator-studio/edit`, gated by role, in the Trey TV neon liquid-glass theme. The existing studio at `/creator-hub/studio` stays untouched as a backup.

## Files to change / create

### 1. New: `src/routes/creator-studio.edit.tsx`
Full mobile-first editor page. Permission guard via `useAuth()`:
- `isGuest` → redirect to `/login`
- signed-in but not creator/admin → render premium "Creator Access Locked" card with CTA to `/apply` (route doesn't exist; fall back to `/premium` or render a `ComingSoonPage`-style inline lock)
- creator/admin → render the studio

Layout (rendered inside a custom full-bleed shell, not `AppShell`, so we can hide the bottom nav and use the editor dock instead — but to "not break bottom nav" we'll use `AppShell wide` and just visually anchor the dock above it with extra bottom padding on mobile).

Sections:
1. **Top header bar** (sticky, glass): back button → `/creator-hub`, centered "CREATOR EDIT STUDIO" wordmark with gradient, project name dropdown ("Untitled Episode"), AI UHD/4K/1080p/720p quality dropdown, glowing gold/violet **Export** button.
2. **Preview canvas** (rounded-3xl, neon border):
   - Empty state: dashed glass drop zone with `Upload` icon, copy "Upload your episode, clip, or promo to start editing", **Select Media** button (uses hidden `<input type="file" accept="video/*,image/*">`).
   - Uploading → progress bar; Processing → shimmer; Ready → preview a `<video>` from the local object URL (or fallback to `posts[0].media`); Error → red glass card with retry.
   - Timecode overlay top-right `00:00 / 00:45`, 4K/HDR chip top-left.
3. **Playback controls row** under preview: fullscreen, snapshot, prev, play/pause, next, undo, redo, more.
4. **Timeline editor** (horizontally scrollable on mobile):
   - Top strip: timecode, Snap toggle, zoom +/-.
   - Ruler with tick labels.
   - Tracks: Video (thumbnails), Overlay (Neon Glow chip), Text ("Trey TV" gold chip), Audio (waveform bars), Captions (CC chips). Each row has left label + visibility eye icon. Selected clip glows gold/violet. Vertical white playhead line.
   - "+ Add layer" dashed button at bottom.
5. **Clip action bar** (visible when a clip is "selected" in local state): Split, Trim, Speed, Transitions, Effects, Delete.
6. **Tool dock** (sticky bottom, glass-strong, horizontally scrollable): Edit, Audio, Text, Effects, Overlay, Captions, Filters, Adjust, **AI Assist** (special circular gold/purple glow button on the right). Active tool glows gold. Padded above mobile bottom nav so they don't collide.
7. **AI Assist drawer** (uses shadcn `Sheet`): liquid-glass right/bottom sheet with grid of buttons — Generate captions, Suggest title, Suggest description, Create hashtags, Thumbnail ideas, Improve hook, Auto-cut highlights, Music mood, Promo caption, Score upload readiness. Each button calls `toast()` placeholder; `// TODO: wire to Trey-I backend`.
8. **Export panel** (shadcn `Dialog`): Title, Description, Show/series select, Episode #, Visibility (Draft/Private/Public radio), Quality (HD/4K/AI UHD), Thumbnail picker (3 frame thumbs), Schedule date input, Publish button → `toast.success("Export queued")` then close. `// TODO: wire to upload pipeline`.

State (all `useState`, no backend):
- `mediaUrl`, `uploadState: "empty"|"uploading"|"processing"|"ready"|"error"`, `selectedClipId`, `activeTool`, `showAI`, `showExport`, `quality`, `projectName`, `snap`, `zoom`.

Route definition:
```tsx
export const Route = createFileRoute("/creator-studio/edit")({
  component: CreatorStudioEdit,
  head: () => ({ meta: [
    { title: "Creator Edit Studio — Trey TV" },
    { name: "description", content: "Cinematic mobile-first editor for Trey TV creators." },
  ]}),
});
```

### 2. Edit: `src/routes/creator-hub.tsx`
Change the two `navigate({ to: "/creator-hub/studio" })` calls (Upload button on hero and "Upload Episode" / "Trey-I Studio" tool tiles) to `navigate({ to: "/creator-studio/edit" })`. Leave the Trey-I Studio tile pointing to `/creator-studio/edit` as well (closest match). Keep everything else intact.

### 3. Auto-regenerated: `src/routeTree.gen.ts`
Will pick up the new `/creator-studio/edit` route automatically — no manual edit.

## Permission guard pattern

Inline in the component (matches existing app convention — no `_authenticated` layout in this codebase):

```tsx
const { isGuest, isCreator } = useAuth();
const navigate = useNavigate();
useEffect(() => { if (isGuest) navigate({ to: "/login" }); }, [isGuest]);
if (isGuest) return null;
if (!isCreator) return <CreatorLockedScreen />;
```

`CreatorLockedScreen` is a local component in the same file: glass card, Crown icon, "Creator access required", CTA buttons → `/premium` (Apply for creator) and `/creator-hub` (Back).

## Styling

Reuse existing utility classes already in `src/styles.css`: `glass`, `glass-strong`, `neon-border`, `glow-gold`, `hover-lift`, `tilt-press`, `shimmer-sweep`, `animate-rise`, `text-gradient-gold`, `conic-ring`, `animate-glow-pulse`. No new CSS needed.

## What is NOT changed

- `/creator-hub/studio` route stays as-is (backup / not linked anymore but keeps build green and existing deep links).
- `AppShell`, `BottomNav`, `AppHeader`, auth, onboarding, Trey-I widget, profile, feed, rewards — all untouched.
- No new dependencies.

## Acceptance

- Tap Upload on Creator Hub → navigates to `/creator-studio/edit`.
- Guest hitting `/creator-studio/edit` → bounced to `/login`.
- Signed-in `user` (not creator) → sees locked screen with Apply CTA.
- Creator/admin → sees full editor; can pick a file, scrub local preview, toggle tools, open AI Assist sheet, open Export dialog.
- No horizontal page overflow on 485px viewport (timeline scrolls inside its own container).
- Build is clean.
