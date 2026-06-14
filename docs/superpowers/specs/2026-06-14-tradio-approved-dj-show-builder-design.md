# Tradio Approved DJ Show Builder Design

**Date:** 2026-06-14
**Status:** Approved design
**Delivery order:** Release 2 of 3

## Purpose

Finish the Tradio AI Radio Show Builder as a production workflow for approved DJs. Approved DJs can
generate, edit, save, schedule, launch, and archive radio shows. Fans and unapproved users cannot
enter host controls.

Related designs:

- `2026-06-14-native-trey-tv-fire-tv-design.md`
- `2026-06-14-tradio-shared-music-platform-design.md`

## Current State

The remounted Tradio UI contains:

- `src/components/tradio/screens/ShowBuilderScreen.tsx`
- `src/components/tradio/screens/BroadcastCreatorScreen.tsx`
- `src/tradio/mobile/MobileTradioApp.tsx`

These screens currently use local state. The local identity provider permits mock role switching,
the show generator is deterministic, and the save, schedule, and launch buttons do not complete a
production transaction.

The repository already contains production-oriented backend assets:

- `tradio_user_roles` and access-request migrations
- `tradio_shows`
- `tradio_show_episodes`
- `tradio_show_blocks`
- scripts, voice renders, station drops, ad slots, submissions, schedules, analytics, playout,
  archive, and post-show publishing tables/services
- AI server functions in `src/lib/trey-i/broadcastAi.server.ts`

The implementation standardizes on these existing assets. It does not create another parallel show
schema.

## Access Model

Production host access requires a verified Trey TV session and one of:

- Active `dj` role in `tradio_user_roles`
- Active `admin` role
- Active `owner` role

`role_status` must be `active` or `approved`, with `restricted`, `revoked`, and `archived` denied.
Client localStorage and mock identities never grant production host capability.

Fans, artists, and producers may request DJ or broadcast access through the existing access request
system. They receive listener or role-specific UI until approved.

Every mutating server endpoint verifies the bearer token and re-checks the role. UI gating is not a
security boundary.

## Canonical Show Model

The builder writes to the existing normalized broadcast model:

- `tradio_shows`: show identity and reusable format
- `tradio_show_episodes`: a scheduled, live, replay, or archived edition
- `tradio_show_blocks`: ordered rundown segments
- `tradio_show_scripts`: generated or edited host scripts
- `tradio_broadcast_slots`: schedule and recurrence
- Existing voice, assembly, playout, archive, analytics, and publishing records

The older `tradio_radio_shows` table is treated as legacy. Existing rows are migrated or read through
an adapter before any eventual removal. New UI writes do not create new legacy rows.

## Server API

All production operations use authenticated server endpoints under `/api/tradio/broadcast/*`:

- `GET /capabilities`
- `GET /shows`
- `POST /shows`
- `GET /shows/:id`
- `PATCH /shows/:id`
- `DELETE /shows/:id`
- `POST /shows/:id/generate`
- `POST /episodes`
- `PATCH /episodes/:id`
- `POST /episodes/:id/schedule`
- `POST /episodes/:id/readiness`
- `POST /episodes/:id/launch`
- `POST /episodes/:id/end`

Endpoints return explicit authorization, validation, conflict, and service-unavailable errors. The
client service converts them into user-facing states without exposing server internals.

## AI Generation

The builder calls the existing server AI layer for:

- Rundown generation
- Host scripts
- Station drops
- Ad reads
- Music block suggestions

Server output is parsed and normalized into canonical block types. Durations are clamped, unknown
types are rejected, and a show must include a valid opening and closing.

If AI is unavailable or returns invalid output, the deterministic local generator creates a usable
offline plan. The UI labels the result "offline plan" and allows editing and saving. It never
pretends the fallback came from AI.

## DJ Workflow

### Entry

The Tradio home checks server capabilities. Approved DJs see:

- Build AI Radio Show
- Broadcast Creator
- My Shows
- Scheduled
- Live Console
- Replays

Unapproved users see the listener surface and an access-request action.

### Build

The DJ defines:

- Show name and description
- Duration
- Mood and target audience
- Host tone
- Music source
- Station
- Commercial breaks
- Fan requests
- Producer spotlight
- Artist premiere
- Schedule intent

AI generates the episode and blocks. The DJ can edit text, scripts, timing, media references, and
block order.

### Save and schedule

Save persists the show, episode, blocks, and scripts as one logical operation. Scheduling writes a
broadcast slot only after the episode passes validation.

### Readiness

The readiness check blocks launch when required conditions fail:

- Missing intro or outro
- Empty required script
- Uncleared music or submitted media
- Invalid duration or block ordering
- Missing station or schedule target

Warnings that do not violate policy remain visible but do not block launch.

### Launch and end

Launch creates or activates the live session and routes to the existing live room/playout systems.
End finalizes the session, recording, analytics, archive, and post-show pipeline.

## UI Boundaries

- DJ authoring remains a mobile/web workflow.
- The native TV app is a listener and playback surface, not a remote-control show editor.
- `ShowBuilderScreen` and `BroadcastCreatorScreen` become views over one shared broadcast service.
- The mock role switcher and mock admin toggles are removed from production builds.
- Loading states preserve the Tradio shell and never replace it with a cover page.

## Error Handling

- Unauthorized: show listener UI and access-request action.
- AI unavailable: use deterministic offline plan.
- Save failure: retain the edited plan locally and offer retry.
- Schedule conflict: preserve the draft and show the conflicting slot.
- Launch failure: keep the episode scheduled/draft and return an actionable error.
- Live service failure: keep the console mounted with offline audio/interactions clearly disabled.

## Testing

Unit:

- Capability resolution for each role/status
- AI response normalization and fallback
- Block ordering and duration validation
- Readiness rules
- Schedule conflict rules
- Legacy show adapter

Integration:

- Server rejects unapproved DJs
- Approved DJ creates, edits, saves, reloads, and deletes a show
- Generate writes canonical blocks and scripts
- Schedule creates a broadcast slot
- Launch requires readiness and starts a live session
- End creates archive/post-show work

Browser:

- Mobile Tradio opens without a cover screen
- Approved DJ sees host tools
- Fan does not see host tools
- Refresh preserves saved show and active role
- Safari/WebKit builder interaction remains responsive

## Acceptance Criteria

Release 2 is complete only when:

1. Mock role switching cannot grant production DJ access.
2. An approved DJ can generate, edit, save, reload, schedule, launch, and end a show.
3. AI failure still produces an editable, honestly labeled fallback plan.
4. Data is stored in the canonical broadcast tables.
5. The live and post-show systems receive the created episode.
6. An unapproved user receives a server-enforced denial.

## Out of Scope

- DJ authoring with a Fire TV remote
- New voice providers beyond existing adapters
- Replacing LiveKit
- Creating a second broadcast schema
