# Tradio Show Foundation + Real AI Builder — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Tradio's "Build Show With AI" call real Gemini 2.5 (full segment lineup + spoken host scripts) and persist shows to the database, replacing the `data.ts` mocks in `ShowBuilder` and `DJStudio`.

**Architecture:** Extract the existing local `generateShowPlan` into a pure shared module (`showPlan.ts`) usable by both client and server; add a `generateRadioShow` Gemini server fn (schema-validated, falls back to the local generator); add a `tradio_radio_shows` table + a `radioShowService` (Supabase-or-local-fallback); wire `ShowBuilder`/`DJStudio` to them.

**Tech Stack:** React + TanStack Start server functions, Supabase (Postgres) via the linked Trizzy Hub CLI, Gemini 2.5 (`aiGenerateJson` + `responseSchema`), `node:test` (run via `npx tsx --test`), Playwright smoke.

Spec: `docs/superpowers/specs/2026-06-01-tradio-show-foundation-ai-builder-design.md`

**Consistency reconciliations (vs spec):**
- `RadioShow.status` (in `data.ts`) is `'draft'|'template'|'scheduled'|'live'|'archived'`. The migration CHECK uses **these exact values** (spec's `'replay'` → use `'archived'`).
- `ShowSegment` gains a new optional `script?: string` (the spoken host lines).

---

## File structure
- Create `supabase/migrations/20260601030000_tradio_radio_shows.sql` — table + RLS.
- Modify `src/tradio/components/tradio/data.ts` — add `script?: string` to `ShowSegment`.
- Create `src/tradio/components/tradio/showPlan.ts` — pure: `ShowBuilderFormState`, `emptyForm`, `generateShowPlan`, segment-type coercion + `validateGeneratedShow`.
- Create `src/tradio/components/tradio/showPlan.test.ts` — `node:test` for coercion/validation.
- Modify `src/lib/trey-i/vertex.server.ts` — add `generateRadioShow` server fn.
- Create `src/tradio/components/tradio/radioShowService.ts` — generate/save/list/get/delete (Supabase-or-fallback).
- Modify `src/tradio/components/tradio/screens/ShowBuilder.tsx` — import form/generator from `showPlan.ts`; wire Generate→AI, Save→DB, tabs→DB, render `script`.
- Modify `src/tradio/components/tradio/screens/DJStudio.tsx` — Shows tab → `listMyShows()`.

---

## Task 1: Migration — `tradio_radio_shows`

**Files:** Create `supabase/migrations/20260601030000_tradio_radio_shows.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Tradio radio shows: persistence for the AI show builder.
create table if not exists public.tradio_radio_shows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Show',
  mood text,
  duration_min integer,
  target_audience text,
  host_tone text,
  music_source text,
  status text not null default 'draft'
    check (status in ('draft','template','scheduled','live','archived')),
  is_template boolean not null default false,
  ai_generated boolean not null default false,
  segments jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tradio_radio_shows_user on public.tradio_radio_shows(user_id);
create index if not exists idx_tradio_radio_shows_template on public.tradio_radio_shows(is_template) where is_template;

drop trigger if exists trg_tradio_radio_shows_updated_at on public.tradio_radio_shows;
create trigger trg_tradio_radio_shows_updated_at
  before update on public.tradio_radio_shows
  for each row execute function public.tradio_set_updated_at();

alter table public.tradio_radio_shows enable row level security;

drop policy if exists "tradio_radio_shows_select" on public.tradio_radio_shows;
create policy "tradio_radio_shows_select"
  on public.tradio_radio_shows for select
  using (auth.uid() = user_id or is_template = true);

drop policy if exists "tradio_radio_shows_insert" on public.tradio_radio_shows;
create policy "tradio_radio_shows_insert"
  on public.tradio_radio_shows for insert
  with check (auth.uid() = user_id);

drop policy if exists "tradio_radio_shows_update" on public.tradio_radio_shows;
create policy "tradio_radio_shows_update"
  on public.tradio_radio_shows for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tradio_radio_shows_delete" on public.tradio_radio_shows;
create policy "tradio_radio_shows_delete"
  on public.tradio_radio_shows for delete
  using (auth.uid() = user_id);
```

- [ ] **Step 2: Dry-run** — Run: `supabase db push --dry-run --linked` — Expected: lists `20260601030000_tradio_radio_shows.sql` as pending.
- [ ] **Step 3: Apply** — Run: `printf 'y\n' | supabase db push --linked` — Expected: `Applying migration 20260601030000...` then `Finished`.
- [ ] **Step 4: Verify** — Run (service-role key as `$KEY`): `curl -s -o /dev/null -w "%{http_code}\n" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" "https://wcdwlqnfcsuaacbvdmgx.supabase.co/rest/v1/tradio_radio_shows?select=id&limit=1"` — Expected: `200`.
- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260601030000_tradio_radio_shows.sql
git commit -m "feat(tradio): tradio_radio_shows table + RLS"
```

---

## Task 2: Extract pure show-plan module + validation (TDD)

**Files:**
- Modify `src/tradio/components/tradio/data.ts` (add `script?` to `ShowSegment`)
- Create `src/tradio/components/tradio/showPlan.ts`
- Test `src/tradio/components/tradio/showPlan.test.ts`
- Modify `src/tradio/components/tradio/screens/ShowBuilder.tsx` (remove the moved code, import it)

- [ ] **Step 1: Add `script` to `ShowSegment`**

In `data.ts`, inside `export interface ShowSegment { ... }`, after the `hostNotes?: string;` line add:
```ts
  script?: string;
```

- [ ] **Step 2: Write the failing test** — `src/tradio/components/tradio/showPlan.test.ts`

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { coerceSegmentType, validateGeneratedShow, SHOW_SEGMENT_TYPES, emptyForm } from './showPlan';

test('coerceSegmentType accepts canonical types', () => {
  for (const t of SHOW_SEGMENT_TYPES) assert.equal(coerceSegmentType(t), t);
});
test('coerceSegmentType is case-insensitive + tolerant', () => {
  assert.equal(coerceSegmentType('Music-Block'), 'music-block');
  assert.equal(coerceSegmentType('HOST-TALK'), 'host-talk');
});
test('coerceSegmentType rejects unknown', () => {
  assert.equal(coerceSegmentType('banana'), null);
  assert.equal(coerceSegmentType(42), null);
});
test('validateGeneratedShow drops invalid segments + clamps duration', () => {
  const show = validateGeneratedShow(
    { title: 'X', segments: [
      { type: 'intro', title: 'Hi', duration: 5, hostNotes: 'n', script: 's' },
      { type: 'bogus', title: 'Bad', duration: 100 },
      { type: 'music-block', title: 'Block', duration: 999999 },
    ] },
    emptyForm,
  );
  assert.equal(show.segments.length, 2);             // bogus dropped
  assert.equal(show.segments[0].duration, 15);       // clamped up to min
  assert.equal(show.segments[1].duration, 1800);     // clamped down to max
  assert.equal(show.aiGenerated, true);
});
test('validateGeneratedShow throws when no valid segments', () => {
  assert.throws(() => validateGeneratedShow({ title: 'X', segments: [{ type: 'nope', title: 'a', duration: 10 }] }, emptyForm));
});
```

- [ ] **Step 3: Run it (fails — module missing)** — Run: `npx tsx --test src/tradio/components/tradio/showPlan.test.ts` — Expected: FAIL (cannot find `./showPlan`).

- [ ] **Step 4: Create `src/tradio/components/tradio/showPlan.ts`**

Move `ShowBuilderFormState`, `emptyForm`, and `generateShowPlan` out of `ShowBuilder.tsx` and add validation. Full file:

```ts
import type { RadioShow, ShowSegment } from './data';

export const SHOW_SEGMENT_TYPES: ShowSegment['type'][] = [
  'intro', 'music-block', 'host-talk', 'fan-request',
  'producer-spotlight', 'artist-premiere', 'commercial', 'poll', 'closing',
];

const MIN_SEGMENT_SEC = 15;
const MAX_SEGMENT_SEC = 1800;

export type SaveTarget = 'live show' | 'replay' | 'template';

export type ShowBuilderFormState = {
  showName: string;
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
  saveAs: SaveTarget;
};

export const emptyForm: ShowBuilderFormState = {
  showName: '',
  showLength: 120,
  showMood: 'late-night',
  targetAudience: 'fans who want premieres and discovery',
  hostTone: 'warm, cinematic',
  musicSource: 'artist station plus Tradio catalog',
  selectedStation: 'station-trey-trizzy',
  commercialBreaks: 2,
  fanInteractionStyle: 'polls, shoutouts, and request queue',
  includeProducerBeatSpotlight: true,
  includeArtistPremiere: true,
  includeListenerRequests: true,
  saveAs: 'template',
};

/** Local deterministic fallback generator (no AI). */
export const generateShowPlan = (form: ShowBuilderFormState): RadioShow => ({
  id: 'generated-show-pass-3',
  title: form.showName || 'Midnight Network Session',
  duration: form.showLength,
  mood: form.showMood,
  targetAudience: form.targetAudience,
  hostTone: form.hostTone,
  musicSource: form.musicSource,
  selectedStation: form.selectedStation,
  commercialBreaks: form.commercialBreaks,
  fanInteractionStyle: form.fanInteractionStyle,
  includeProducerSpotlight: form.includeProducerBeatSpotlight,
  includeArtistPremiere: form.includeArtistPremiere,
  includeListenerRequests: form.includeListenerRequests,
  status: form.saveAs === 'template' ? 'template' : 'draft',
  aiGenerated: true,
  segments: [
    { id: 'gen-1', type: 'intro', title: 'Opening Intro', duration: 180, hostNotes: `Welcome listeners in a ${form.hostTone} voice and set the ${form.showMood} atmosphere.`, aiGenerated: true },
    { id: 'gen-2', type: 'host-talk', title: 'Host Notes', duration: 120, description: `Frame the show for ${form.targetAudience}.`, hostNotes: 'Mention that requests and votes shape the back half of the show.', aiGenerated: true },
    { id: 'gen-3', type: 'music-block', title: 'Song Block 1', duration: 480, description: `Curated from ${form.musicSource}.`, aiGenerated: true },
    { id: 'gen-4', type: 'host-talk', title: 'Transition Script', duration: 90, hostNotes: 'Move from the opener into fan participation without breaking the mood.', aiGenerated: true },
    { id: 'gen-5', type: 'commercial', title: 'Commercial / Ad Slot', duration: 60, description: `${form.commercialBreaks} planned break across the show.`, aiGenerated: true },
    ...(form.includeListenerRequests ? [{ id: 'gen-6', type: 'fan-request' as const, title: 'Fan Request Segment', duration: 360, description: form.fanInteractionStyle, aiGenerated: true }] : []),
    ...(form.includeProducerBeatSpotlight ? [{ id: 'gen-7', type: 'producer-spotlight' as const, title: 'Producer Beat Spotlight', duration: 240, description: 'Preview two beats and invite artists to save or pitch.', aiGenerated: true }] : []),
    ...(form.includeArtistPremiere ? [{ id: 'gen-8', type: 'artist-premiere' as const, title: 'Artist Premiere Block', duration: 300, description: 'Pinned release, premiere intro, and first-listen fan chat.', aiGenerated: true }] : []),
    { id: 'gen-9', type: 'music-block', title: 'DJ Mix Section', duration: 420, description: 'Blend catalog picks, beat spotlight stems, and requested tracks.', aiGenerated: true },
    { id: 'gen-10', type: 'poll', title: 'Listener Interaction Moment', duration: 180, description: 'Vote what plays next and collect shoutouts.', aiGenerated: true },
    { id: 'gen-11', type: 'closing', title: 'Closing Message + Replay Package', duration: 180, hostNotes: `Save as ${form.saveAs} and package highlights for replay listeners.`, aiGenerated: true },
  ],
});

/** Coerce a model-returned segment type to a canonical value, else null. */
export function coerceSegmentType(raw: unknown): ShowSegment['type'] | null {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.trim().toLowerCase();
  return SHOW_SEGMENT_TYPES.find((t) => t === cleaned) ?? null;
}

type RawSeg = { type?: unknown; title?: unknown; duration?: unknown; description?: unknown; hostNotes?: unknown; script?: unknown };
type RawShow = { title?: unknown; segments?: RawSeg[] };

/** Validate/coerce a raw AI show into a RadioShow. Throws if no valid segments. */
export function validateGeneratedShow(raw: RawShow, form: ShowBuilderFormState): RadioShow {
  const rawSegs = Array.isArray(raw?.segments) ? raw.segments : [];
  const segments: ShowSegment[] = [];
  rawSegs.forEach((s, i) => {
    const type = coerceSegmentType(s?.type);
    if (!type) return;
    const dur = Number(s?.duration);
    const duration = Number.isFinite(dur) ? Math.min(MAX_SEGMENT_SEC, Math.max(MIN_SEGMENT_SEC, Math.round(dur))) : 120;
    segments.push({
      id: `ai-${i + 1}`,
      type,
      title: typeof s?.title === 'string' && s.title.trim() ? s.title.trim() : type,
      duration,
      description: typeof s?.description === 'string' ? s.description : undefined,
      hostNotes: typeof s?.hostNotes === 'string' ? s.hostNotes : undefined,
      script: typeof s?.script === 'string' ? s.script : undefined,
      aiGenerated: true,
    });
  });
  if (!segments.length) throw new Error('AI returned no valid segments');
  const totalMin = Math.round(segments.reduce((sum, s) => sum + s.duration, 0) / 60);
  return {
    id: 'ai-generated-show',
    title: typeof raw?.title === 'string' && raw.title.trim() ? raw.title.trim() : (form.showName || 'AI Radio Show'),
    duration: totalMin,
    mood: form.showMood,
    targetAudience: form.targetAudience,
    hostTone: form.hostTone,
    musicSource: form.musicSource,
    selectedStation: form.selectedStation,
    commercialBreaks: form.commercialBreaks,
    fanInteractionStyle: form.fanInteractionStyle,
    includeProducerSpotlight: form.includeProducerBeatSpotlight,
    includeArtistPremiere: form.includeArtistPremiere,
    includeListenerRequests: form.includeListenerRequests,
    segments,
    status: form.saveAs === 'template' ? 'template' : 'draft',
    aiGenerated: true,
  };
}
```

- [ ] **Step 5: Remove the moved code from `ShowBuilder.tsx` and import it**

In `ShowBuilder.tsx`: delete the local `type ShowBuilderFormState`, `type SaveTarget`, `const emptyForm`, and `const generateShowPlan` definitions (they now live in `showPlan.ts`). Add an import near the top:
```ts
import { generateShowPlan, emptyForm, type ShowBuilderFormState, type SaveTarget } from '../showPlan';
```
(Leave all component code that *uses* them unchanged.)

- [ ] **Step 6: Run the test (passes)** — Run: `npx tsx --test src/tradio/components/tradio/showPlan.test.ts` — Expected: 5 pass, 0 fail.
- [ ] **Step 7: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "showPlan|ShowBuilder|tradio/components/tradio/data" || echo clean` — Expected: `clean`.
- [ ] **Step 8: Commit**

```bash
git add src/tradio/components/tradio/showPlan.ts src/tradio/components/tradio/showPlan.test.ts src/tradio/components/tradio/data.ts src/tradio/components/tradio/screens/ShowBuilder.tsx
git commit -m "refactor(tradio): extract showPlan module + segment validation; add segment script field"
```

---

## Task 3: `generateRadioShow` Gemini server fn

**Files:** Modify `src/lib/trey-i/vertex.server.ts`

- [ ] **Step 1: Add imports** (top of file, with the other imports)

```ts
import { generateShowPlan, validateGeneratedShow, SHOW_SEGMENT_TYPES, type ShowBuilderFormState } from "../../tradio/components/tradio/showPlan";
import type { RadioShow } from "../../tradio/components/tradio/data";
```

- [ ] **Step 2: Add the server fn** (append near the other `createServerFn` exports)

```ts
export const generateRadioShow = createServerFn({ method: "POST" })
  .inputValidator((input: { form: ShowBuilderFormState }) => input)
  .handler(async ({ data }): Promise<RadioShow> => {
    const { form } = data;
    try {
      const prompt = `You are Trey-I, an expert radio producer for Trey TV's Tradio. Design a complete live radio show plan from this brief:
- Show name: ${form.showName || "(untitled)"}
- Target length: ${form.showLength} minutes
- Mood: ${form.showMood}
- Target audience: ${form.targetAudience}
- Host tone: ${form.hostTone}
- Music source: ${form.musicSource}
- Commercial breaks: ${form.commercialBreaks}
- Fan interaction style: ${form.fanInteractionStyle}
- Include producer beat spotlight: ${form.includeProducerBeatSpotlight}
- Include artist premiere: ${form.includeArtistPremiere}
- Include listener requests: ${form.includeListenerRequests}

Produce an ordered list of segments whose durations sum to roughly ${form.showLength} minutes. Each segment has:
- type: one of ${SHOW_SEGMENT_TYPES.join(", ")}
- title: short, vivid
- duration: seconds (integer)
- description: 1 sentence on what happens
- hostNotes: a short production cue
- script: for TALK segments (intro, host-talk, closing, producer-spotlight, artist-premiere) write the actual spoken host lines (2-4 sentences, in the "${form.hostTone}" tone, speaking to "${form.targetAudience}"). For music-block, commercial, poll, fan-request, leave script as an empty string.

Return ONLY JSON: { "title": string, "segments": [ { "type", "title", "duration", "description", "hostNotes", "script" } ] }`;

      const parsed = await aiGenerateJson<any>({
        prompt,
        temperature: 0.8,
        maxTokens: 2048,
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            segments: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  type: { type: "STRING", enum: SHOW_SEGMENT_TYPES },
                  title: { type: "STRING" },
                  duration: { type: "INTEGER" },
                  description: { type: "STRING" },
                  hostNotes: { type: "STRING" },
                  script: { type: "STRING" },
                },
                required: ["type", "title", "duration"],
                propertyOrdering: ["type", "title", "duration", "description", "hostNotes", "script"],
              },
            },
          },
          required: ["title", "segments"],
          propertyOrdering: ["title", "segments"],
        },
      });

      return validateGeneratedShow(parsed, form);
    } catch (err) {
      console.error("[generateRadioShow] fallback to local generator:", err);
      return generateShowPlan(form);
    }
  });
```

- [ ] **Step 3: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "vertex.server" || echo clean` — Expected: `clean`.
- [ ] **Step 4: Commit**

```bash
git add src/lib/trey-i/vertex.server.ts
git commit -m "feat(tradio): generateRadioShow Gemini server fn (schema-validated + fallback)"
```

---

## Task 4: `radioShowService`

**Files:** Create `src/tradio/components/tradio/radioShowService.ts`

- [ ] **Step 1: Create the service**

```ts
import { isSupabaseConfigured, supabase } from '@/tradio/lib/supabaseClient';
import { handleMissingTradioTables } from './auth/tradioProfileBootstrap';
import { generateShowPlan, type ShowBuilderFormState } from './showPlan';
import { generateRadioShow } from '@/lib/trey-i/vertex.server';
import type { RadioShow } from './data';

export type ShowServiceSource = 'ai' | 'local' | 'supabase' | 'mock';
export interface ShowServiceResult<T> { source: ShowServiceSource; data: T | null; warning: string | null; }

const rowToShow = (row: Record<string, any>): RadioShow => ({
  id: String(row.id),
  title: row.title ?? 'Untitled Show',
  duration: Number(row.duration_min ?? 0),
  mood: row.mood ?? '',
  targetAudience: row.target_audience ?? '',
  hostTone: row.host_tone ?? '',
  musicSource: row.music_source ?? '',
  selectedStation: row.settings?.selectedStation,
  commercialBreaks: Number(row.settings?.commercialBreaks ?? 0),
  fanInteractionStyle: row.settings?.fanInteractionStyle ?? '',
  includeProducerSpotlight: Boolean(row.settings?.includeProducerSpotlight),
  includeArtistPremiere: Boolean(row.settings?.includeArtistPremiere),
  includeListenerRequests: Boolean(row.settings?.includeListenerRequests),
  segments: Array.isArray(row.segments) ? row.segments : [],
  status: row.status ?? 'draft',
  aiGenerated: Boolean(row.ai_generated),
});

const showToRow = (show: RadioShow, userId: string) => ({
  user_id: userId,
  title: show.title,
  mood: show.mood,
  duration_min: show.duration,
  target_audience: show.targetAudience,
  host_tone: show.hostTone,
  music_source: show.musicSource,
  status: show.status === 'template' ? 'template' : show.status,
  is_template: show.status === 'template',
  ai_generated: show.aiGenerated,
  segments: show.segments,
  settings: {
    selectedStation: show.selectedStation,
    commercialBreaks: show.commercialBreaks,
    fanInteractionStyle: show.fanInteractionStyle,
    includeProducerSpotlight: show.includeProducerSpotlight,
    includeArtistPremiere: show.includeArtistPremiere,
    includeListenerRequests: show.includeListenerRequests,
  },
});

/** Generate a show plan via Gemini; falls back to the local generator. */
export async function generateShow(form: ShowBuilderFormState): Promise<ShowServiceResult<RadioShow>> {
  try {
    const show = await generateRadioShow({ data: { form } });
    return { source: show.aiGenerated ? 'ai' : 'local', data: show, warning: null };
  } catch (err) {
    return { source: 'local', data: generateShowPlan(form), warning: err instanceof Error ? err.message : 'AI unavailable' };
  }
}

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function saveShow(show: RadioShow): Promise<ShowServiceResult<RadioShow>> {
  if (!isSupabaseConfigured || !supabase) return { source: 'mock', data: show, warning: 'Supabase not configured; show kept locally.' };
  const uid = await currentUserId();
  if (!uid) return { source: 'mock', data: show, warning: 'Sign in to save shows.' };
  try {
    const { data, error } = await supabase.from('tradio_radio_shows').insert(showToRow(show, uid)).select('*').maybeSingle();
    if (error) return { source: 'mock', data: show, warning: handleMissingTradioTables(error).message };
    return { source: 'supabase', data: data ? rowToShow(data) : show, warning: null };
  } catch (err) {
    return { source: 'mock', data: show, warning: handleMissingTradioTables(err).message };
  }
}

export async function listMyShows(): Promise<ShowServiceResult<RadioShow[]>> {
  if (!isSupabaseConfigured || !supabase) return { source: 'mock', data: null, warning: null };
  const uid = await currentUserId();
  if (!uid) return { source: 'mock', data: null, warning: null };
  try {
    const { data, error } = await supabase.from('tradio_radio_shows').select('*').eq('user_id', uid).order('updated_at', { ascending: false });
    if (error) return { source: 'mock', data: null, warning: handleMissingTradioTables(error).message };
    return { source: 'supabase', data: (Array.isArray(data) ? data : []).map(rowToShow), warning: null };
  } catch (err) {
    return { source: 'mock', data: null, warning: handleMissingTradioTables(err).message };
  }
}

export async function listTemplates(): Promise<ShowServiceResult<RadioShow[]>> {
  if (!isSupabaseConfigured || !supabase) return { source: 'mock', data: null, warning: null };
  try {
    const { data, error } = await supabase.from('tradio_radio_shows').select('*').eq('is_template', true).order('updated_at', { ascending: false });
    if (error) return { source: 'mock', data: null, warning: handleMissingTradioTables(error).message };
    return { source: 'supabase', data: (Array.isArray(data) ? data : []).map(rowToShow), warning: null };
  } catch (err) {
    return { source: 'mock', data: null, warning: handleMissingTradioTables(err).message };
  }
}

export async function deleteShow(id: string): Promise<ShowServiceResult<null>> {
  if (!isSupabaseConfigured || !supabase) return { source: 'mock', data: null, warning: null };
  try {
    const { error } = await supabase.from('tradio_radio_shows').delete().eq('id', id);
    if (error) return { source: 'mock', data: null, warning: handleMissingTradioTables(error).message };
    return { source: 'supabase', data: null, warning: null };
  } catch (err) {
    return { source: 'mock', data: null, warning: handleMissingTradioTables(err).message };
  }
}
```

- [ ] **Step 2: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "radioShowService" || echo clean` — Expected: `clean`. (If importing a server fn into client code raises an issue, confirm `generateRadioShow` is callable as `generateRadioShow({ data: { form } })` — TanStack server fns are client-callable; this matches how `judgeSignalTest` is invoked from `tests.natural-ability.tsx`.)
- [ ] **Step 3: Commit**

```bash
git add src/tradio/components/tradio/radioShowService.ts
git commit -m "feat(tradio): radioShowService (generate/save/list/delete, supabase-or-local)"
```

---

## Task 5: Wire `ShowBuilder` to AI + persistence

**Files:** Modify `src/tradio/components/tradio/screens/ShowBuilder.tsx`

- [ ] **Step 1: Add imports + state**

Add import:
```ts
import { generateShow, saveShow, listMyShows, listTemplates } from '../radioShowService';
import { toast } from 'sonner';
```
In the `ShowBuilder` component, add state:
```ts
  const [generating, setGenerating] = useState(false);
  const [dbShows, setDbShows] = useState<RadioShow[] | null>(null);
  const [dbTemplates, setDbTemplates] = useState<RadioShow[] | null>(null);
```
(`RadioShow` is already imported from `../data`.)

- [ ] **Step 2: Replace the local `generate` with the AI call**

Replace the existing `const generate = () => { ... }` with:
```ts
  const generate = async () => {
    setGenerating(true);
    try {
      const res = await generateShow(form);
      if (res.data) {
        setGeneratedShow(res.data);
        setSaved(false);
        setIsSimulating(false);
        if (res.source === 'local') toast('Used the offline builder (AI unavailable).');
      }
    } finally {
      setGenerating(false);
    }
  };
```

- [ ] **Step 3: Replace `save` with real persistence**

Replace the existing `const save = () => { ... }` with:
```ts
  const save = async () => {
    const show = generatedShow ?? generateShowPlan(form);
    if (!generatedShow) setGeneratedShow(show);
    const res = await saveShow(show);
    setSaved(true);
    toast[res.source === 'supabase' ? 'success' : 'message'](
      res.source === 'supabase' ? 'Show saved to your library' : (res.warning ?? 'Saved locally'),
    );
    if (res.source === 'supabase') void refreshShows();
  };
```

- [ ] **Step 4: Add a loader for DB shows/templates**

Add, inside the component:
```ts
  const refreshShows = async () => {
    const [mine, tmpl] = await Promise.all([listMyShows(), listTemplates()]);
    if (mine.source === 'supabase') setDbShows(mine.data ?? []);
    if (tmpl.source === 'supabase') setDbTemplates(tmpl.data ?? []);
  };
  useEffect(() => { void refreshShows(); }, []);
```

- [ ] **Step 5: Use DB lists in the tabs (fall back to mocks)**

- In the `templates` tab, change the source array from `SHOW_TEMPLATES` to `(dbTemplates ?? SHOW_TEMPLATES)`.
- In the `saved` tab, change `RADIO_SHOWS` to `(dbShows ?? RADIO_SHOWS)`.

- [ ] **Step 6: Render the AI `script` on segment cards**

In the standard (non-editing) segment card, right after the `{segment.hostNotes && (...)}` block, add:
```tsx
                                  {segment.script && <p className="mt-1.5 rounded-xl border border-cyan-400/15 bg-cyan-500/[0.04] p-2 text-[11px] leading-relaxed text-cyan-100/80"><span className="font-bold uppercase tracking-wider text-cyan-300/70 text-[9px] mr-1">Script</span>{segment.script}</p>}
```

- [ ] **Step 7: Show a generating state on the button**

The form's `Generate Plan` button is in `ShowBuilderForm` (separate component) calling `onGenerate`. Pass `generating` down: add `generating?: boolean` to `ShowBuilderForm`'s props, pass `generating={generating}` from the parent's `<ShowBuilderForm ... />`, and on the Generate `PrimaryButton` set `disabled={... || generating}` and label `{generating ? 'Generating…' : 'Generate Plan'}`.

- [ ] **Step 8: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "ShowBuilder" || echo clean` — Expected: `clean`.
- [ ] **Step 9: Commit**

```bash
git add src/tradio/components/tradio/screens/ShowBuilder.tsx
git commit -m "feat(tradio): ShowBuilder uses real AI generation + DB persistence"
```

---

## Task 6: Wire `DJStudio` Shows tab to the DB

**Files:** Modify `src/tradio/components/tradio/screens/DJStudio.tsx`

- [ ] **Step 1: Load the host's shows**

Add import: `import { listMyShows } from '../radioShowService';` and `import type { RadioShow } from '../data';` (if not present). In the component add:
```ts
  const [myShows, setMyShows] = useState<RadioShow[] | null>(null);
  useEffect(() => { void (async () => { const r = await listMyShows(); if (r.source === 'supabase') setMyShows(r.data ?? []); })(); }, []);
```

- [ ] **Step 2: Use it in the `shows` tab**

In the `tab === 'shows'` shows grid, change the iterated array from `RADIO_SHOWS` to `(myShows ?? RADIO_SHOWS)`.

- [ ] **Step 3: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "DJStudio" || echo clean` — Expected: `clean`.
- [ ] **Step 4: Commit**

```bash
git add src/tradio/components/tradio/screens/DJStudio.tsx
git commit -m "feat(tradio): DJStudio Shows tab loads real shows"
```

---

## Task 7: End-to-end verification

- [ ] **Step 1: Run the unit tests** — Run: `npx tsx --test src/tradio/components/tradio/showPlan.test.ts` — Expected: 5/5 pass.
- [ ] **Step 2: Full touched-files typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "showPlan|radioShowService|vertex.server|ShowBuilder|DJStudio|tradio/components/tradio/data" || echo "ALL TOUCHED FILES CLEAN"` — Expected: `ALL TOUCHED FILES CLEAN`.
- [ ] **Step 3: Browser smoke (signed-in DJ/host)** — In the Tradio AI Show Builder: click **Generate Plan** → segments render, and talk segments show a **Script** block. Click **Save Show** → toast "saved to your library". Reload → the Saved tab lists the show from the DB.
- [ ] **Step 4: DB check** — Run (service-role `$KEY`): `curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" "https://wcdwlqnfcsuaacbvdmgx.supabase.co/rest/v1/tradio_radio_shows?select=id,title,ai_generated,status&order=created_at.desc&limit=1"` — Expected: the newest row matches the saved show.

---

## Self-review notes
- **Spec coverage:** real Gemini generation w/ scripts (Task 3), schema-enum + coercion + fallback (Tasks 2–3), persistence + RLS (Task 1), service layer (Task 4), ShowBuilder Generate/Save/tabs + script render (Task 5), DJStudio shows (Task 6), verification (Task 7). All covered.
- **Reconciliations:** status uses `'archived'` not `'replay'` (matches `RadioShow` type); `ShowSegment.script?` added (Task 2 Step 1).
- **Type consistency:** `ShowBuilderFormState`/`emptyForm`/`generateShowPlan` defined in `showPlan.ts` (Task 2), consumed by `vertex.server.ts` (Task 3), `radioShowService.ts` (Task 4), `ShowBuilder.tsx` (Task 5). `validateGeneratedShow`/`SHOW_SEGMENT_TYPES` defined Task 2, used Task 3. `generateRadioShow` defined Task 3, used Task 4. `generateShow/saveShow/listMyShows/listTemplates` defined Task 4, used Tasks 5–6.
- **Out of scope:** live audio (#2), chat/requests (#3), TTS host (#4), co-pilot (#5), music/replays (#6).
