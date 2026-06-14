# Tradio AI Radio Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a production-ready AI radio show workflow where approved DJs can generate, edit, save, reload, schedule, launch, and end canonical Tradio broadcasts.

**Architecture:** Keep the fast remounted Tradio mobile shell, but replace mock identity and no-op actions with an authenticated HTTP API under `/api/tradio/broadcast/*`. The API verifies the Supabase bearer token and an active `dj`, `admin`, or `owner` grant, uses the existing normalized broadcast tables, calls the existing server AI provider, and falls back to a clearly labeled deterministic plan. A focused client service and capability provider drive the builder, broadcast creator, and a lightweight live host console.

**Tech Stack:** React 19, TanStack Start, TypeScript, Supabase/Postgres/RLS, Gemini through the existing Trey-I AI provider, LiveKit, `node:test` via `npx tsx --test`, Playwright WebKit.

**Spec:** `docs/superpowers/specs/2026-06-14-tradio-approved-dj-show-builder-design.md`

---

## File Structure

- Create `supabase/migrations/20260614010000_tradio_ai_builder_workflow.sql`
  - Adds transactional draft-save and schedule RPCs, conflict protection, and workflow indexes.
- Modify `src/lib/tradio-broadcast/showTypes.ts`
  - Becomes the one client/server builder domain model.
- Modify `src/lib/tradio-broadcast/showPlan.ts`
  - Owns deterministic fallback generation, AI normalization, block mapping, and readiness rules.
- Create `src/lib/tradio-broadcast/showPlan.test.ts`
  - Covers normalization, fallback labeling, duration clamping, canonical block mapping, and readiness.
- Modify `src/lib/trey-i/tradioServerAuth.ts`
  - Adds approved-host capability verification.
- Modify `src/lib/trey-i/tradioServerAuth.test.ts`
  - Covers DJ/admin/owner grants and denied statuses.
- Modify `src/lib/trey-i/broadcastAi.server.ts`
  - Extracts directly callable server AI helpers while preserving existing server-function exports.
- Create `src/lib/tradio-broadcast/broadcastRepository.server.ts`
  - Owns canonical show bundle persistence, retrieval, scheduling, launch, and end operations.
- Create `src/lib/tradio-broadcast/broadcastRepository.server.test.ts`
  - Tests repository payloads and ownership enforcement with a fake Supabase client.
- Create `src/lib/tradio-broadcast/broadcastApi.server.ts`
  - Dispatches authenticated `/api/tradio/broadcast/*` requests.
- Create `src/lib/tradio-broadcast/broadcastApi.server.test.ts`
  - Tests routing, status codes, authorization, and safe error payloads.
- Modify `src/server.ts`
  - Mounts the broadcast API before TanStack SSR.
- Create `src/lib/tradio-broadcast/broadcastClient.ts`
  - Browser API client that attaches the real Supabase access token.
- Create `src/tradio/contexts/BroadcastCapabilityContext.tsx`
  - Loads host capabilities without blocking the Tradio first paint.
- Modify `src/tradio/platform/TradioProvider.tsx`
  - Mounts the capability provider.
- Modify `src/tradio/contexts/TradioIdentityContext.tsx`
  - Removes production local role switching and maps the signed-in Trey TV identity.
- Modify `src/components/tradio/screens/HomeScreen.tsx`
  - Shows host tools only to approved hosts and shows an access-request action otherwise.
- Modify `src/components/tradio/screens/ShowBuilderScreen.tsx`
  - Wires AI generation, editing, save/reload, source labels, retry, and readiness.
- Modify `src/components/tradio/screens/BroadcastCreatorScreen.tsx`
  - Uses canonical channels, scheduling, readiness, and launch.
- Create `src/components/tradio/screens/MyShowsScreen.tsx`
  - Lists and reopens canonical saved shows.
- Create `src/components/tradio/screens/LiveBroadcastConsoleScreen.tsx`
  - Connects the host microphone to LiveKit, displays the rundown, and ends the broadcast.
- Modify `src/tradio/mobile/MobileTradioApp.tsx`
  - Adds My Shows and Live Console navigation state.
- Create `src/routes/-tradioBroadcastBuilder.test.ts`
  - Guards production wiring and prevents mock-role/no-op regressions.
- Create `e2e/tradio-ai-radio-builder.spec.ts`
  - Browser acceptance coverage for host and non-host behavior.
- Create `playwright.config.ts`
  - Starts the local app and defines Chromium and WebKit projects.

## Task 1: Consolidate the Builder Domain and Readiness Rules

**Files:**
- Modify: `src/lib/tradio-broadcast/showTypes.ts`
- Modify: `src/lib/tradio-broadcast/showPlan.ts`
- Create: `src/lib/tradio-broadcast/showPlan.test.ts`
- Delete after consumers move: `src/components/tradio/services/radioShowTypes.ts`
- Delete after consumers move: `src/components/tradio/services/showPlan.ts`

- [ ] **Step 1: Write failing normalization and readiness tests**

Create `src/lib/tradio-broadcast/showPlan.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFallbackPlan,
  mapPlanToCanonicalBlocks,
  normalizeGeneratedPlan,
  validateShowReadiness,
} from "./showPlan.ts";
import { emptyShowBuilderForm } from "./showTypes.ts";

test("normalization requires an opening and closing block", () => {
  assert.throws(
    () =>
      normalizeGeneratedPlan(
        { title: "No ending", blocks: [{ type: "host-talk", title: "Talk", duration: 90 }] },
        emptyShowBuilderForm,
      ),
    /opening and closing/i,
  );
});

test("normalization clamps durations and rejects unknown block types", () => {
  const result = normalizeGeneratedPlan(
    {
      title: "Night Shift",
      blocks: [
        { type: "intro", title: "Open", duration: 2, script: "Welcome." },
        { type: "unknown", title: "Bad", duration: 50 },
        { type: "closing", title: "Close", duration: 99999, script: "Goodnight." },
      ],
    },
    emptyShowBuilderForm,
  );
  assert.equal(result.segments.length, 2);
  assert.equal(result.segments[0].duration, 15);
  assert.equal(result.segments[1].duration, 1800);
  assert.equal(result.generationSource, "ai");
});

test("fallback is usable and honestly labeled", () => {
  const result = buildFallbackPlan({ ...emptyShowBuilderForm, showName: "Offline Hour" });
  assert.equal(result.generationSource, "offline");
  assert.equal(result.aiGenerated, false);
  assert.equal(result.segments[0].type, "intro");
  assert.equal(result.segments.at(-1)?.type, "closing");
});

test("canonical mapping preserves order and rights defaults", () => {
  const blocks = mapPlanToCanonicalBlocks(buildFallbackPlan(emptyShowBuilderForm));
  assert.deepEqual(blocks.map((block) => block.sort_order), blocks.map((_, index) => index));
  assert.equal(blocks.find((block) => block.block_type === "song")?.rights_status, "unclear");
  assert.equal(blocks.find((block) => block.block_type === "intro")?.clearance_status, "cleared");
});

test("readiness blocks missing scripts and uncleared music", () => {
  const plan = buildFallbackPlan(emptyShowBuilderForm);
  plan.segments[0].script = "";
  plan.segments.push({
    id: "song-1",
    type: "music-block",
    title: "Uncleared track",
    duration: 180,
    rightsStatus: "unclear",
    clearanceStatus: "unclear",
  });
  const result = validateShowReadiness(plan);
  assert.equal(result.ready, false);
  assert.match(result.errors.join(" "), /script/i);
  assert.match(result.errors.join(" "), /rights/i);
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```powershell
npx tsx --test src/lib/tradio-broadcast/showPlan.test.ts
```

Expected: FAIL because the new domain exports do not exist.

- [ ] **Step 3: Replace the duplicate builder types with one canonical model**

In `src/lib/tradio-broadcast/showTypes.ts`, define:

```ts
export type BuilderSegmentType =
  | "intro"
  | "station-drop"
  | "music-block"
  | "host-talk"
  | "fan-request"
  | "producer-spotlight"
  | "artist-premiere"
  | "commercial"
  | "poll"
  | "closing";

export type GenerationSource = "ai" | "offline";
export type BuilderStatus = "draft" | "template" | "scheduled" | "live" | "archived";

export interface ShowBuilderFormState {
  showName: string;
  description: string;
  showLength: number;
  showMood: string;
  targetAudience: string;
  hostTone: string;
  musicSource: string;
  selectedStation: string;
  commercialBreaks: number;
  fanInteractionStyle: string;
  includeProducerBeatSpotlight: boolean;
  includeArtistPremiere: boolean;
  includeListenerRequests: boolean;
  saveAs: "live show" | "replay" | "template";
}

export interface ShowSegment {
  id: string;
  type: BuilderSegmentType;
  title: string;
  duration: number;
  description?: string;
  hostNotes?: string;
  script?: string;
  assetId?: string;
  mediaUrl?: string;
  rightsStatus?: "tradio_native" | "creator_owned" | "approved_submission" | "licensed_catalog" | "unclear";
  clearanceStatus?: "unclear" | "cleared" | "review_needed";
}

export interface RadioShow {
  id?: string;
  episodeId?: string;
  title: string;
  description: string;
  duration: number;
  mood: string;
  targetAudience: string;
  hostTone: string;
  musicSource: string;
  selectedStation: string;
  commercialBreaks: number;
  fanInteractionStyle: string;
  includeProducerSpotlight: boolean;
  includeArtistPremiere: boolean;
  includeListenerRequests: boolean;
  segments: ShowSegment[];
  status: BuilderStatus;
  generationSource: GenerationSource;
  aiGenerated: boolean;
  scheduledFor?: string;
  timezone?: string;
  liveSessionId?: string;
}

export interface BroadcastChannelSummary {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "active" | "paused" | "hidden" | "archived";
  visibility: "public" | "private" | "unlisted";
}

export interface ClearedMusicCandidate {
  id: string;
  title: string;
  artist: string;
  rightsStatus: "tradio_native" | "creator_owned" | "approved_submission" | "licensed_catalog";
  clearanceStatus: "cleared";
}

export interface BroadcastCapabilities {
  loading: boolean;
  authenticated: boolean;
  canHost: boolean;
  primaryRole: "fan" | "dj" | "admin" | "owner";
  actions: Array<"build" | "save" | "schedule" | "launch" | "end">;
  error?: string;
}

export interface LaunchOptions {
  channelId: string;
  recordingEnabled: boolean;
  chatEnabled: boolean;
  callInsEnabled: boolean;
  maxListeners: number;
}

export interface LiveLaunchResult {
  showId: string;
  episodeId: string;
  sessionId: string;
  roomId: string;
  roomName: string;
  livekitUrl: string;
  token: string;
  rundown: ShowSegment[];
}

export interface EndBroadcastResult {
  sessionId: string;
  episodeStatus: "archived";
  archiveQueued: boolean;
  postShowQueued: boolean;
}

export const emptyShowBuilderForm: ShowBuilderFormState = {
  showName: "",
  description: "",
  showLength: 60,
  showMood: "late-night",
  targetAudience: "fans who want premieres and discovery",
  hostTone: "warm, cinematic",
  musicSource: "Tradio catalog",
  selectedStation: "",
  commercialBreaks: 2,
  fanInteractionStyle: "polls, shoutouts, and request queue",
  includeProducerBeatSpotlight: true,
  includeArtistPremiere: true,
  includeListenerRequests: true,
  saveAs: "live show",
};
```

- [ ] **Step 4: Implement normalization, fallback, canonical mapping, and readiness**

In `src/lib/tradio-broadcast/showPlan.ts`, retain the current deterministic segment ideas but expose these exact functions:

```ts
export function normalizeGeneratedPlan(
  raw: unknown,
  form: ShowBuilderFormState,
): RadioShow;

export function buildFallbackPlan(form: ShowBuilderFormState): RadioShow;

export function mapPlanToCanonicalBlocks(show: RadioShow): Array<{
  block_type: BlockType;
  title: string;
  description: string | null;
  script_text: string | null;
  asset_id: string | null;
  media_url: string | null;
  start_time_seconds: number;
  duration_seconds: number;
  sort_order: number;
  approval_status: "pending";
  rights_status: RightsStatus;
  clearance_status: ClearanceStatus;
  metadata: Record<string, unknown>;
}>;

export function validateShowReadiness(show: RadioShow): {
  ready: boolean;
  errors: string[];
  warnings: string[];
};

export function formatDuration(seconds: number): string;
```

Use a mapping table rather than string replacement:

```ts
const CANONICAL_BLOCK_TYPE: Record<BuilderSegmentType, BlockType> = {
  intro: "intro",
  "station-drop": "station_drop",
  "music-block": "song",
  "host-talk": "voiceover",
  "fan-request": "submission_block",
  "producer-spotlight": "producer_spotlight",
  "artist-premiere": "artist_spotlight",
  commercial: "ad",
  poll: "interview",
  closing: "outro",
};
```

Readiness must require intro, outro, non-empty scripts for intro/host-talk/closing, positive ordered durations, a selected station before schedule/launch, a schedule target when checking a scheduled launch, and cleared rights for every music/media segment.

- [ ] **Step 5: Run the domain tests**

Run:

```powershell
npx tsx --test src/lib/tradio-broadcast/showPlan.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 6: Commit the domain layer**

```powershell
git add -- src/lib/tradio-broadcast/showTypes.ts src/lib/tradio-broadcast/showPlan.ts src/lib/tradio-broadcast/showPlan.test.ts
git commit -m "feat(tradio): define canonical AI show builder domain"
```

## Task 2: Add Transactional Persistence and Schedule Conflict Protection

**Files:**
- Create: `supabase/migrations/20260614010000_tradio_ai_builder_workflow.sql`
- Test: `src/lib/trey-i/tradioMigrationCompatibility.test.ts`

- [ ] **Step 1: Extend the migration compatibility test**

Add assertions that the migration contains:

```ts
assert.match(sql, /create or replace function public\.tradio_save_show_bundle/i);
assert.match(sql, /create or replace function public\.tradio_schedule_episode/i);
assert.match(sql, /grant execute on function public\.tradio_save_show_bundle.*service_role/i);
assert.match(sql, /exclude using gist/i);
assert.doesNotMatch(sql, /grant execute.*authenticated/i);
```

- [ ] **Step 2: Run the compatibility test and verify failure**

```powershell
npx tsx --test src/lib/trey-i/tradioMigrationCompatibility.test.ts
```

Expected: FAIL because the workflow migration does not exist.

- [ ] **Step 3: Create the workflow migration**

The migration must:

1. Enable `btree_gist`.
2. Add a partial exclusion constraint preventing overlapping `scheduled` or `live` slots for the same `owner_user_id`.
3. Create `tradio_save_show_bundle(p_owner_user_id uuid, p_show jsonb, p_episode jsonb, p_blocks jsonb)`.
4. Upsert the show and episode, replace their blocks/scripts in one transaction, and return `show_id` plus `episode_id`.
5. Create `tradio_schedule_episode(p_owner_user_id uuid, p_episode_id uuid, p_start_time timestamptz, p_end_time timestamptz, p_timezone text, p_visibility text)`.
6. Restrict both functions to `service_role`.

The save function must write only server-supplied ownership:

```sql
insert into public.tradio_shows (
  id, owner_user_id, title, slug, description, show_type, mood_tags,
  audience_tags, visibility, status, mood, target_audience, host_mode,
  music_source_pref, ad_preference, schedule_intent, updated_at
) values (
  coalesce(nullif(p_show->>'id', '')::uuid, gen_random_uuid()),
  p_owner_user_id,
  p_show->>'title',
  p_show->>'slug',
  nullif(p_show->>'description', ''),
  coalesce(p_show->>'show_type', 'dj-show'),
  coalesce(array(select jsonb_array_elements_text(p_show->'mood_tags')), '{}'::text[]),
  coalesce(array(select jsonb_array_elements_text(p_show->'audience_tags')), '{}'::text[]),
  coalesce(p_show->>'visibility', 'private'),
  'draft',
  p_show->>'mood',
  p_show->>'target_audience',
  p_show->>'host_mode',
  p_show->>'music_source_pref',
  p_show->>'ad_preference',
  p_show->>'schedule_intent',
  now()
)
on conflict (id) do update
set title = excluded.title,
    description = excluded.description,
    mood = excluded.mood,
    target_audience = excluded.target_audience,
    host_mode = excluded.host_mode,
    music_source_pref = excluded.music_source_pref,
    updated_at = now()
where tradio_shows.owner_user_id = p_owner_user_id
returning id into v_show_id;
```

Iterate `p_blocks` with `jsonb_array_elements`, insert canonical blocks in `sort_order`, then insert a `tradio_show_scripts` row for each non-empty `script_text`.

- [ ] **Step 4: Run migration static checks**

```powershell
npx tsx --test src/lib/trey-i/tradioMigrationCompatibility.test.ts
git diff --check -- supabase/migrations/20260614010000_tradio_ai_builder_workflow.sql
```

Expected: PASS and no whitespace errors.

- [ ] **Step 5: Commit the migration**

```powershell
git add -- supabase/migrations/20260614010000_tradio_ai_builder_workflow.sql src/lib/trey-i/tradioMigrationCompatibility.test.ts
git commit -m "feat(tradio): add transactional show save and scheduling"
```

## Task 3: Enforce Approved DJ Authorization

**Files:**
- Modify: `src/lib/trey-i/tradioServerAuth.ts`
- Modify: `src/lib/trey-i/tradioServerAuth.test.ts`

- [ ] **Step 1: Write failing host-capability tests**

Add tests for:

```ts
test("host access accepts active dj grants", async () => {
  const result = await verifyTradioHostAccess("token", createHostClient({
    userId: "dj-1",
    roles: [{ role: "dj", role_status: "active" }],
  }));
  assert.equal(result.primaryRole, "dj");
});

test("host access accepts app admins without a dj row", async () => {
  const result = await verifyTradioHostAccess("token", createHostClient({
    userId: "admin-1",
    isAdmin: true,
    roles: [],
  }));
  assert.equal(result.primaryRole, "admin");
});

for (const roleStatus of ["requested", "restricted", "revoked", "archived"]) {
  test(`host access rejects ${roleStatus} dj grants`, async () => {
    await assert.rejects(
      verifyTradioHostAccess("token", createHostClient({
        userId: "user-1",
        roles: [{ role: "dj", role_status: roleStatus }],
      })),
      /approved DJ access required/i,
    );
  });
}
```

- [ ] **Step 2: Run the auth tests and verify failure**

```powershell
npx tsx --test src/lib/trey-i/tradioServerAuth.test.ts
```

Expected: FAIL because `verifyTradioHostAccess` does not exist.

- [ ] **Step 3: Implement server-enforced host capability**

Extend the client type with a minimal `from()` query shape and add:

```ts
export type TradioHostRole = "dj" | "admin" | "owner";

export async function verifyTradioHostAccess(
  accessToken: string,
  client: TradioServerAuthClient,
): Promise<{ verifiedUserId: string; primaryRole: TradioHostRole }> {
  const { verifiedUserId } = await verifyTradioAccessToken(accessToken, client);
  const { data: appAdmin } = await client.rpc("is_admin", { _user_id: verifiedUserId });
  if (appAdmin === true) return { verifiedUserId, primaryRole: "admin" };

  const { data, error } = await client
    .from("tradio_user_roles")
    .select("role,role_status")
    .eq("user_id", verifiedUserId)
    .in("role", ["dj", "admin", "owner"]);

  if (error) throw new Error("Approved DJ access could not be verified");
  const grant = (data ?? []).find(
    (row) =>
      (row.role === "dj" || row.role === "admin" || row.role === "owner") &&
      (row.role_status === "active" || row.role_status === "approved"),
  );
  if (!grant) throw new Error("Approved DJ access required");
  return { verifiedUserId, primaryRole: grant.role };
}
```

- [ ] **Step 4: Run auth tests**

```powershell
npx tsx --test src/lib/trey-i/tradioServerAuth.test.ts
```

Expected: all existing and new tests pass.

- [ ] **Step 5: Commit authorization**

```powershell
git add -- src/lib/trey-i/tradioServerAuth.ts src/lib/trey-i/tradioServerAuth.test.ts
git commit -m "feat(tradio): enforce approved DJ host capability"
```

## Task 4: Build the Canonical Server Repository

**Files:**
- Create: `src/lib/tradio-broadcast/broadcastRepository.server.ts`
- Create: `src/lib/tradio-broadcast/broadcastRepository.server.test.ts`

- [ ] **Step 1: Write failing repository tests**

Cover:

- `saveShowBundle` sends the verified user ID to `tradio_save_show_bundle`.
- `getShowBundle` rejects a show owned by another user unless admin.
- `createEpisode` and `updateEpisode` preserve canonical ownership and normalized metadata.
- `scheduleEpisode` calculates `end_time` from canonical duration and surfaces `23P01` as a schedule conflict.
- `deleteShow` filters by both `id` and `owner_user_id`.
- `listChannels` returns active channels owned by the host plus public active channels.
- `listLegacyShows` maps `tradio_radio_shows` rows as read-only drafts and saving one creates canonical rows.

Use a chainable fake client and assert exact RPC/query calls.

- [ ] **Step 2: Run repository tests and verify failure**

```powershell
npx tsx --test src/lib/tradio-broadcast/broadcastRepository.server.test.ts
```

Expected: FAIL because the repository does not exist.

- [ ] **Step 3: Implement repository boundaries**

Export:

```ts
export interface BroadcastRepository {
  listShows(userId: string): Promise<RadioShow[]>;
  getShowBundle(userId: string, showId: string, isAdmin?: boolean): Promise<RadioShow | null>;
  saveShowBundle(userId: string, show: RadioShow): Promise<RadioShow>;
  createEpisode(userId: string, showId: string, show: RadioShow): Promise<RadioShow>;
  updateEpisode(userId: string, episodeId: string, show: RadioShow): Promise<RadioShow>;
  deleteShow(userId: string, showId: string, isAdmin?: boolean): Promise<void>;
  listLegacyShows(userId: string): Promise<RadioShow[]>;
  listClearedMusicCandidates(
    userId: string,
    mood: string,
    count: number,
  ): Promise<Array<{
    id: string;
    title: string;
    artist: string;
    rightsStatus: "tradio_native" | "creator_owned" | "approved_submission" | "licensed_catalog";
    clearanceStatus: "cleared";
  }>>;
  listChannels(userId: string): Promise<BroadcastChannelSummary[]>;
  scheduleEpisode(userId: string, show: RadioShow, startAt: string, timezone: string): Promise<RadioShow>;
  launchEpisode(userId: string, show: RadioShow, options: LaunchOptions): Promise<LiveLaunchResult>;
  endEpisode(userId: string, sessionId: string): Promise<EndBroadcastResult>;
}
```

`saveShowBundle` must call `mapPlanToCanonicalBlocks(show)` and then:

```ts
const { data, error } = await client.rpc("tradio_save_show_bundle", {
  p_owner_user_id: userId,
  p_show: toShowPayload(show),
  p_episode: toEpisodePayload(show),
  p_blocks: mapPlanToCanonicalBlocks(show),
});
```

Never accept `owner_user_id`, `user_id`, or host IDs from a browser payload.

`listShows` appends legacy rows from `tradio_radio_shows` only when they have no canonical alias. Legacy rows are marked in metadata as read-only; the first Save runs `saveShowBundle` and returns canonical `showId` and `episodeId`.

`listClearedMusicCandidates` queries approved rows from the existing Tradio music submission/catalog sources, excludes `unclear` and `review_needed` records, and returns an empty list rather than inserting fake production tracks.

`launchEpisode` must:

1. Re-run readiness.
2. Verify channel ownership or admin access.
3. Create or resolve a `tradio_live_rooms` row for the channel.
4. Create a `tradio_live_mic_sessions` row tied to show/episode.
5. Mark the session `live`.
6. Mark the episode and matching slot/queue item live.
7. Create a LiveKit host token using the existing server environment.
8. Return only safe IDs, room name, token, LiveKit URL, and rundown.

`endEpisode` must mark the live mic session ended, close the room, complete the queue/slot, archive the episode, and enqueue recording/archive/post-show work when recording exists.

- [ ] **Step 4: Run repository tests**

```powershell
npx tsx --test src/lib/tradio-broadcast/broadcastRepository.server.test.ts
```

Expected: all repository tests pass.

- [ ] **Step 5: Commit repository**

```powershell
git add -- src/lib/tradio-broadcast/broadcastRepository.server.ts src/lib/tradio-broadcast/broadcastRepository.server.test.ts
git commit -m "feat(tradio): add canonical broadcast repository"
```

## Task 5: Secure the AI Generation Path

**Files:**
- Modify: `src/lib/trey-i/broadcastAi.server.ts`
- Create: `src/lib/tradio-broadcast/broadcastAiWorkflow.server.ts`
- Create: `src/lib/tradio-broadcast/broadcastAiWorkflow.server.test.ts`

- [ ] **Step 1: Write failing AI workflow tests**

Test that:

- Valid AI output normalizes to `generationSource: "ai"`.
- Invalid JSON uses `buildFallbackPlan`.
- Provider failure uses `buildFallbackPlan`.
- Fallback returns a warning and never sets `aiGenerated: true`.
- Intro, host-talk, and closing blocks receive generated host scripts.
- Station-drop blocks use the existing station-drop generator.
- Commercial blocks use the existing ad-read generator.
- Music blocks receive only cleared catalog/submission suggestions; no candidate leaves rights as `unclear`.
- The input user ID is never included in the model prompt.

- [ ] **Step 2: Extract directly callable AI helpers**

In `broadcastAi.server.ts`, add plain functions:

```ts
export async function generateShowRundown(input: RundownInput): Promise<ParsedRundownResponse> {
  const prompt = buildRundownPrompt(input);
  const result = await aiGenerateText({
    prompt,
    systemInstruction: "You are the AI Program Director for Tradio. Return only strict JSON.",
  });
  return parseRundownJson(result.text);
}
```

Change the existing `generateShowRundownServer` handler to call this function, preserving existing callers.

Also extract directly callable `generateHostScripts`, `generateStationDrop`, and `generateAdRead` helpers. Their existing `createServerFn` exports become thin wrappers over the helpers.

- [ ] **Step 3: Implement the approved-host AI workflow**

`broadcastAiWorkflow.server.ts` exports:

```ts
export async function generateApprovedDjPlan(
  form: ShowBuilderFormState,
  generate: (input: RundownInput) => Promise<ParsedRundownResponse> = generateShowRundown,
): Promise<{ show: RadioShow; warning?: string }> {
  try {
    const generated = await generate(toRundownInput(form));
    const normalized = normalizeGeneratedPlan(mapRundownResponse(generated), form);
    const enriched = await enrichGeneratedBlocks(normalized, {
      generateHostScripts,
      generateStationDrop,
      generateAdRead,
      listClearedMusicCandidates,
    });
    return { show: enriched };
  } catch {
    return {
      show: buildFallbackPlan(form),
      warning: "AI is unavailable. This offline plan is editable and can still be saved.",
    };
  }
}
```

Implement enrichment with this contract:

```ts
async function enrichGeneratedBlocks(
  show: RadioShow,
  dependencies: {
    generateHostScripts: typeof generateHostScripts;
    generateStationDrop: typeof generateStationDrop;
    generateAdRead: typeof generateAdRead;
    listClearedMusicCandidates: (mood: string, count: number) => Promise<ClearedMusicCandidate[]>;
  },
): Promise<RadioShow>;
```

Host script failures keep the normalized script if present. Station-drop and ad-read failures keep editable fallback text. When no cleared music candidate exists, keep the music block but add a readiness warning and do not invent a track ID.

- [ ] **Step 4: Run AI tests**

```powershell
npx tsx --test src/lib/tradio-broadcast/broadcastAiWorkflow.server.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit AI workflow**

```powershell
git add -- src/lib/trey-i/broadcastAi.server.ts src/lib/tradio-broadcast/broadcastAiWorkflow.server.ts src/lib/tradio-broadcast/broadcastAiWorkflow.server.test.ts
git commit -m "feat(tradio): connect approved DJ builder to server AI"
```

## Task 6: Add the Authenticated Broadcast HTTP API

**Files:**
- Create: `src/lib/tradio-broadcast/broadcastApi.server.ts`
- Create: `src/lib/tradio-broadcast/broadcastApi.server.test.ts`
- Modify: `src/server.ts`

- [ ] **Step 1: Write failing route tests**

Test:

- `GET /api/tradio/broadcast/capabilities` returns `401` without a token.
- An authenticated fan receives `{ canHost: false }` from capabilities.
- Every mutating endpoint returns `403` for an unapproved user.
- `POST /shows/:id/generate` returns an AI or offline plan.
- `POST /shows` persists a bundle.
- `POST /episodes` creates a canonical episode under an owned show.
- `PATCH /episodes/:id` updates an owned canonical episode.
- `POST /episodes/:id/schedule` returns `409` on conflict.
- `POST /episodes/:id/readiness` returns errors without mutating.
- `POST /episodes/:id/launch` returns live connection data.
- `POST /episodes/:id/end` returns an archive summary.
- Unknown paths return `null` so SSR can continue.

- [ ] **Step 2: Implement safe request helpers**

Use:

```ts
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function bearer(request: Request): string {
  return (request.headers.get("authorization") ?? "")
    .match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? "";
}
```

Never return stack traces, Supabase keys, model prompts, or raw database errors.

- [ ] **Step 3: Implement path dispatch**

`handleTradioBroadcastRequest(request)` returns `Response | null` and handles:

```text
GET    /api/tradio/broadcast/capabilities
GET    /api/tradio/broadcast/channels
GET    /api/tradio/broadcast/shows
POST   /api/tradio/broadcast/shows
GET    /api/tradio/broadcast/shows/:id
PATCH  /api/tradio/broadcast/shows/:id
DELETE /api/tradio/broadcast/shows/:id
POST   /api/tradio/broadcast/shows/:id/generate
POST   /api/tradio/broadcast/episodes
PATCH  /api/tradio/broadcast/episodes/:id
POST   /api/tradio/broadcast/episodes/:id/schedule
POST   /api/tradio/broadcast/episodes/:id/readiness
POST   /api/tradio/broadcast/episodes/:id/launch
POST   /api/tradio/broadcast/episodes/:id/end
```

Capabilities verifies authentication first, then catches host denial and returns:

```ts
{
  authenticated: true,
  canHost: false,
  primaryRole: "fan",
  actions: [],
}
```

Every other endpoint calls `verifyTradioHostAccess` before repository or AI work.

- [ ] **Step 4: Mount the API in `src/server.ts`**

Add:

```ts
import { handleTradioBroadcastRequest } from "./lib/tradio-broadcast/broadcastApi.server";
```

Before individual Tradio caller handling:

```ts
const tradioBroadcastResponse = await handleTradioBroadcastRequest(request);
if (tradioBroadcastResponse) return tradioBroadcastResponse;
```

- [ ] **Step 5: Run API tests**

```powershell
npx tsx --test src/lib/tradio-broadcast/broadcastApi.server.test.ts
```

Expected: all API tests pass.

- [ ] **Step 6: Commit API**

```powershell
git add -- src/lib/tradio-broadcast/broadcastApi.server.ts src/lib/tradio-broadcast/broadcastApi.server.test.ts src/server.ts
git commit -m "feat(tradio): expose secure broadcast builder API"
```

## Task 7: Replace Mock Role Authority with Real Capabilities

**Files:**
- Create: `src/lib/tradio-broadcast/broadcastClient.ts`
- Create: `src/tradio/contexts/BroadcastCapabilityContext.tsx`
- Modify: `src/tradio/platform/TradioProvider.tsx`
- Modify: `src/tradio/contexts/TradioIdentityContext.tsx`
- Modify: `src/components/tradio/screens/ArtistProfileScreen.tsx`

- [ ] **Step 1: Implement the authenticated browser client**

Each request obtains the live session:

```ts
export class BroadcastApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "BroadcastApiError";
  }
}

async function accessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new BroadcastApiError(401, "Sign in to use DJ tools.");
  return token;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await accessToken();
  const response = await fetch(`/api/tradio/broadcast${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new BroadcastApiError(response.status, payload.error ?? "Request failed.");
  return payload as T;
}
```

Export typed `getCapabilities`, `listChannels`, `listShows`, `getShow`, `generatePlan`, `saveShow`, `createEpisode`, `updateEpisode`, `deleteShow`, `checkReadiness`, `scheduleEpisode`, `launchEpisode`, and `endEpisode`.

- [ ] **Step 2: Add a non-blocking capability provider**

The provider starts with:

```ts
const INITIAL: BroadcastCapabilities = {
  loading: true,
  authenticated: false,
  canHost: false,
  primaryRole: "fan",
  actions: [],
};
```

Render children immediately. Load capabilities in an effect and expose `refresh()`. A failed request sets a recoverable error but never replaces the Tradio shell.

- [ ] **Step 3: Mount the provider**

Wrap `TradioIdentityProvider` and the children in `BroadcastCapabilityProvider` inside `TradioProvider.tsx`.

- [ ] **Step 4: Remove production role switching**

Change `TradioIdentityContext` to derive display identity from `useAuth()` and broadcast role from `useBroadcastCapabilities()`. Remove localStorage role reads/writes and remove `MOCK_IDENTITIES` from the production provider.

The context value becomes:

```ts
interface IdentityContextType {
  role: TradioRole;
  identity: TradioIdentity;
  canHost: boolean;
}
```

Delete profile role-switch buttons from `ArtistProfileScreen.tsx`; display the verified role as read-only.

- [ ] **Step 5: Commit identity wiring**

```powershell
git add -- src/lib/tradio-broadcast/broadcastClient.ts src/tradio/contexts/BroadcastCapabilityContext.tsx src/tradio/platform/TradioProvider.tsx src/tradio/contexts/TradioIdentityContext.tsx src/components/tradio/screens/ArtistProfileScreen.tsx
git commit -m "feat(tradio): replace mock DJ roles with server capabilities"
```

## Task 8: Make the AI Show Builder Fully Interactive

**Files:**
- Modify: `src/components/tradio/screens/ShowBuilderScreen.tsx`
- Create: `src/components/tradio/screens/MyShowsScreen.tsx`
- Modify: `src/tradio/mobile/MobileTradioApp.tsx`

- [ ] **Step 1: Move the screen to canonical imports**

Replace imports from `../services/showPlan` and `../services/radioShowTypes` with:

```ts
import {
  emptyShowBuilderForm,
  type RadioShow,
  type ShowBuilderFormState,
  type ShowSegment,
} from "@/lib/tradio-broadcast/showTypes";
import { formatDuration } from "@/lib/tradio-broadcast/showPlan";
import {
  checkReadiness,
  generatePlan,
  saveShow,
} from "@/lib/tradio-broadcast/broadcastClient";
```

- [ ] **Step 2: Add explicit operation state**

Use:

```ts
type Operation = "idle" | "generating" | "saving" | "checking";
const [operation, setOperation] = useState<Operation>("idle");
const [message, setMessage] = useState<string | null>(null);
const [show, setShow] = useState<RadioShow | null>(initialShow ?? null);
```

Generation:

```ts
setOperation("generating");
try {
  const result = await generatePlan(form, show?.id);
  setShow(result.show);
  setMessage(result.warning ?? "AI show plan generated.");
  setStep("preview");
} catch (error) {
  setMessage(error instanceof Error ? error.message : "Could not generate the show.");
} finally {
  setOperation("idle");
}
```

- [ ] **Step 3: Add real editing**

Each expanded segment must edit title, duration, description, host notes, script, rights status, and clearance status. Add move-up, move-down, add-block, and delete-block actions that update local state only until Save.

- [ ] **Step 4: Add real save and readiness**

Save:

```ts
setOperation("saving");
try {
  const saved = await saveShow(show);
  setShow(saved.show);
  setMessage("Show saved.");
} catch (error) {
  localStorage.setItem("tradio.unsaved-show", JSON.stringify(show));
  setMessage(`${error instanceof Error ? error.message : "Save failed."} Your draft remains on this device.`);
} finally {
  setOperation("idle");
}
```

Readiness renders separate blocking errors and warnings. Do not hide or replace the builder while checking.

- [ ] **Step 5: Add My Shows**

`MyShowsScreen` loads `listShows()`, supports reopen and delete, and renders an empty state with a Build Show action. `MobileTradioApp` adds the `my-shows` state and passes the selected show back into `ShowBuilderScreen`.

- [ ] **Step 6: Remove duplicate component service files**

After all imports move:

```powershell
git rm -- src/components/tradio/services/showPlan.ts src/components/tradio/services/radioShowTypes.ts
```

- [ ] **Step 7: Commit builder UI**

```powershell
git add -- src/components/tradio/screens/ShowBuilderScreen.tsx src/components/tradio/screens/MyShowsScreen.tsx src/tradio/mobile/MobileTradioApp.tsx src/lib/tradio-broadcast/showTypes.ts src/lib/tradio-broadcast/showPlan.ts
git commit -m "feat(tradio): make AI show builder generate edit and save"
```

## Task 9: Wire Scheduling, Launch, and the Live Host Console

**Files:**
- Modify: `src/components/tradio/screens/BroadcastCreatorScreen.tsx`
- Create: `src/components/tradio/screens/LiveBroadcastConsoleScreen.tsx`
- Modify: `src/components/tradio/screens/HomeScreen.tsx`
- Modify: `src/tradio/mobile/MobileTradioApp.tsx`

- [ ] **Step 1: Gate host tools on capabilities**

`HomeScreen` reads `useBroadcastCapabilities()`. Approved hosts see Show Builder, Broadcast Creator, My Shows, Scheduled, and Live Console. Other users see:

```tsx
<a href="/apply/tradio-creator?role=dj">
  Request DJ / Host Access
</a>
```

- [ ] **Step 2: Replace mock stations and no-op launch**

`BroadcastCreatorScreen` loads `listChannels()`. It requires name, channel, and either `NOW` or a valid local date/time. Convert scheduled local time to ISO while preserving the browser timezone:

```ts
const startAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
```

Schedule calls `scheduleEpisode`. Go Live calls `checkReadiness`, then `launchEpisode`, then passes the returned live session to `onLiveStarted`.

- [ ] **Step 3: Build the focused live console**

The screen receives `LiveLaunchResult`, creates a LiveKit `Room`, and connects only after explicit host action:

```ts
const connectMic = async () => {
  const room = new Room();
  await room.connect(session.livekitUrl, session.token);
  const track = await createLocalAudioTrack({
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  });
  await room.localParticipant.publishTrack(track);
  roomRef.current = room;
  setMicState("live");
};
```

Render the current rundown, elapsed time, current block script, mic state, and End Broadcast. Ending disconnects LiveKit in `finally` after calling `endEpisode`.

If LiveKit connection or microphone permission fails, keep the console mounted, display the actionable error, disable live audio controls, and preserve End Broadcast and back navigation.

- [ ] **Step 4: Add mobile navigation**

Add `live-console`, `my-shows`, and `scheduled` screen states. Do not add a route-level cover or loading page.

- [ ] **Step 5: Commit scheduling and live workflow**

```powershell
git add -- src/components/tradio/screens/BroadcastCreatorScreen.tsx src/components/tradio/screens/LiveBroadcastConsoleScreen.tsx src/components/tradio/screens/HomeScreen.tsx src/tradio/mobile/MobileTradioApp.tsx
git commit -m "feat(tradio): schedule launch and end DJ broadcasts"
```

## Task 10: Add Regression and Browser Acceptance Tests

**Files:**
- Create: `src/routes/-tradioBroadcastBuilder.test.ts`
- Create: `e2e/tradio-ai-radio-builder.spec.ts`
- Create: `playwright.config.ts`

- [ ] **Step 1: Add source-wiring regression tests**

Assert:

- `ShowBuilderScreen` imports `broadcastClient`.
- Save and generate buttons call real client methods.
- `BroadcastCreatorScreen` calls schedule and launch methods.
- `HomeScreen` uses broadcast capabilities.
- `TradioIdentityContext` does not read `tradio_user_role`.
- Production source contains no `MOCK_IDENTITIES`.
- Tradio route still mounts directly without a cover screen.

- [ ] **Step 2: Add Playwright host tests**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://127.0.0.1:3000" },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["iPhone 13"] } },
  ],
});
```

Mock only the HTTP boundary, not component state:

```ts
await page.route("**/api/tradio/broadcast/capabilities", (route) =>
  route.fulfill({ json: { authenticated: true, canHost: true, primaryRole: "dj", actions: ["build", "schedule", "launch"] } }),
);
await page.route("**/api/tradio/broadcast/shows/*/generate", (route) =>
  route.fulfill({ json: { show: approvedShowFixture } }),
);
await page.route("**/api/tradio/broadcast/shows", async (route) => {
  if (route.request().method() === "POST") {
    await route.fulfill({ json: { show: { ...approvedShowFixture, id: "show-1", episodeId: "episode-1" } } });
    return;
  }
  await route.fulfill({ json: { shows: [] } });
});
```

Verify Generate, edit, Save, reload via My Shows, readiness, and schedule.

- [ ] **Step 3: Add Playwright fan and WebKit tests**

Verify an authenticated fan cannot see host actions. Run the host flow in WebKit mobile viewport and assert no welcome/loading cover appears.

- [ ] **Step 4: Run focused tests**

```powershell
npx tsx --test src/lib/tradio-broadcast/showPlan.test.ts src/lib/trey-i/tradioServerAuth.test.ts src/lib/tradio-broadcast/broadcastAiWorkflow.server.test.ts src/lib/tradio-broadcast/broadcastRepository.server.test.ts src/lib/tradio-broadcast/broadcastApi.server.test.ts src/routes/-tradioBroadcastBuilder.test.ts src/routes/-tradioLoading.test.ts
npx playwright test e2e/tradio-ai-radio-builder.spec.ts --project=chromium
npx playwright test e2e/tradio-ai-radio-builder.spec.ts --project=webkit
```

Expected: all focused tests pass.

- [ ] **Step 5: Commit tests**

```powershell
git add -- src/routes/-tradioBroadcastBuilder.test.ts e2e/tradio-ai-radio-builder.spec.ts playwright.config.ts
git commit -m "test(tradio): cover approved DJ builder workflow"
```

## Task 11: Verify, Migrate, and Deploy

**Files:**
- Modify: `.env.example`
- Create: `docs/TRADIO_AI_RADIO_BUILDER_RUNBOOK.md`

- [ ] **Step 1: Run the complete verification set**

```powershell
npx tsc --noEmit -p tsconfig.json
npx eslint src/lib/tradio-broadcast src/components/tradio/screens src/tradio/contexts src/tradio/mobile src/server.ts
npx tsx --test src/lib/tradio-broadcast/*.test.ts src/lib/trey-i/tradioServerAuth.test.ts src/lib/trey-i/tradioMigrationCompatibility.test.ts src/routes/-tradioBroadcastBuilder.test.ts src/routes/-tradioLoading.test.ts
npm run build
```

Expected: zero failures.

- [ ] **Step 2: Apply the Supabase migration**

Run:

```powershell
supabase db push --dry-run --linked
supabase db push --linked
```

Expected: the dry run lists `20260614010000_tradio_ai_builder_workflow.sql`; the apply completes without an RLS or function-grant error. Then query `information_schema.routine_privileges` and verify both workflow functions grant `EXECUTE` to `service_role` only.

- [ ] **Step 3: Verify required deployment environment**

Required server-only values:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
LIVEKIT_URL
LIVEKIT_API_KEY
LIVEKIT_API_SECRET
GEMINI_API_KEY or the existing configured Trey-I provider credential
```

Required public values:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Do not expose service-role, LiveKit secret, or AI provider secret with a `VITE_` prefix.

- [ ] **Step 4: Install and use the Vercel CLI for release verification**

The Vercel CLI is not currently installed. Install it:

```powershell
npm i -g vercel
```

Then authenticate/link to the `TV APP` team project, pull environment configuration, deploy a preview, inspect logs, and promote only after the preview passes:

```powershell
vercel env pull .env.local
vercel deploy
vercel logs <preview-url>
vercel deploy --prod
```

- [ ] **Step 5: Run live acceptance**

With one approved DJ account and one normal user:

1. Confirm the normal user receives server-enforced denial.
2. Generate with AI and confirm `generationSource` is `ai`.
3. Temporarily remove the AI credential in preview and confirm the editable `offline` plan.
4. Save, reload, edit, and delete a show.
5. Schedule a show and verify a conflicting schedule returns `409`.
6. Launch, connect the host microphone, and verify LiveKit receives the host track.
7. End the broadcast and verify session, slot, queue, episode, archive, and post-show states.
8. Repeat the builder flow in mobile Safari/WebKit with no cover screen.

- [ ] **Step 6: Write the operations runbook**

Create `docs/TRADIO_AI_RADIO_BUILDER_RUNBOOK.md` with these concrete sections:

```markdown
# Tradio AI Radio Builder Runbook

## Required Services
Supabase, Trey-I AI provider, LiveKit, and the Vercel TV APP project.

## Role Approval
An eligible host has an active or approved dj/admin/owner row in tradio_user_roles.

## Smoke Test
Generate, save, reload, schedule, launch, connect mic, end, and verify archive state.

## AI Fallback
Provider failure must return an editable plan labeled offline; it is not reported as AI output.

## Incident Checks
Check /api/tradio/broadcast/capabilities, Vercel function logs, Supabase RPC grants,
schedule conflicts, LiveKit credentials, and the live mic session row.

## Rollback
Promote the previous Vercel deployment and leave the forward-only database migration applied.
The prior UI does not call the new RPCs, so the additional functions and indexes are inert.
```

Update `.env.example` with:

```text
AI_PROVIDER=gemini
GOOGLE_GENAI_API_KEY=
# Alternative Gemini names already accepted by aiProvider.server.ts:
# GEMINI_API_KEY=
# GOOGLE_API_KEY=
```

- [ ] **Step 7: Final commit**

```powershell
git add -- .env.example docs/TRADIO_AI_RADIO_BUILDER_RUNBOOK.md
git commit -m "docs(tradio): add AI radio builder operations runbook"
```

## Self-Review

- **Spec coverage:** Tasks 3 and 6 enforce approved roles; Tasks 1 and 5 deliver real AI plus honest fallback; Tasks 2 and 4 persist the canonical normalized model; Tasks 8 and 9 deliver generate, edit, save, reload, schedule, readiness, launch, and end; Task 10 covers mobile/WebKit and denied users; Task 11 covers migration and production release.
- **No parallel schema:** The plan writes only `tradio_shows`, `tradio_show_episodes`, `tradio_show_blocks`, `tradio_show_scripts`, `tradio_broadcast_slots`, and the existing live/archive/post-show tables.
- **Security boundary:** Browser role state never authorizes a mutation. Every mutating API request derives the user from the bearer token and re-checks the host grant.
- **Performance boundary:** Capability loading happens after first paint and no route-level loading or welcome screen is introduced.
- **Type consistency:** `RadioShow`, `ShowSegment`, `ShowBuilderFormState`, `BroadcastCapabilities`, `LiveLaunchResult`, and repository method names remain consistent across all tasks.
- **Release boundary:** This plan completes the approved-DJ builder release only. Shared profile/post music and the native TV rewrite remain separate plans.
