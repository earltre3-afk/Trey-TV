# Trance Google Cloud Video Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace browser-side MediaPipe choreography video analysis with GCS direct upload + async Cloud Run job, keeping live-session MediaPipe unchanged.

**Architecture:** Three TanStack Start server functions (`createServerFn`) handle GCS signed-URL minting, Cloud Run job dispatch, and result polling. The client uploads directly to GCS (no Vercel in the data path) and polls every 3 s until the Cloud Run job writes its result JSON. A separate Python/FastAPI Cloud Run service downloads the video from GCS, runs MediaPipe Pose (IMAGE mode), and writes the `ChoreographyAnalysis` result back to GCS.

**Tech Stack:** `@google-cloud/storage` (v7), `google-auth-library` (v9), `@tanstack/react-start` `createServerFn`, Python 3.11, FastAPI, MediaPipe, OpenCV, Google Cloud Storage Python client.

## Global Constraints

- All Google Cloud credentials accessed via `GOOGLE_APPLICATION_CREDENTIALS` env var (ADC) — never hardcoded.
- GCS bucket name is `trance-media` (literal string, not configurable).
- Cloud Run URL read from `process.env.CLOUD_RUN_ANALYZE_URL` on the server.
- Server functions use lazy dynamic imports for `@google-cloud/storage` and `google-auth-library` so the module can be imported in tests without credentials.
- `applyAnalysisToDraft` in `tranceVideoAnalyzerService.ts` is **not changed** — only `analyzeChoreographyVideo` changes.
- Browser MediaPipe (`browserPoseProvider.ts`, `useTrancePoseSession`) is **not changed**.
- Output JSON from Cloud Run must satisfy the TypeScript `ChoreographyAnalysis` type exactly — field names are camelCase to match.
- Python service: `suggested` field value is the boolean `True` (JSON `true`), not a string.
- Poll interval: 3000 ms, max 100 polls (~5 min timeout).
- Fixture path: `shouldUseFixtures()` must short-circuit both upload and analysis without hitting GCS.

---

## File Map

### New files
| Path | Purpose |
|---|---|
| `src/lib/trance/gcs.server.ts` | Three `createServerFn` server functions |
| `src/routes/-tranceGcsServerFns.test.ts` | Structural tests for the three server functions |
| `trance-analyzer/main.py` | FastAPI app — `/analyze` endpoint |
| `trance-analyzer/pose.py` | MediaPipe frame extraction + landmark mapping |
| `trance-analyzer/storage.py` | GCS download/upload helpers |
| `trance-analyzer/requirements.txt` | Python deps |
| `trance-analyzer/Dockerfile` | Container definition |
| `trance-analyzer/test_pose.py` | Unit tests for `INDEX_TO_PART` + `extract_frames` |

### Modified files
| Path | Change |
|---|---|
| `src/trance/services/tranceVideoUploadService.ts` | Replace Supabase upload with GCS signed URL + direct PUT |
| `src/trance/services/tranceVideoAnalyzerService.ts` | Replace browser MediaPipe with Cloud Run poll |
| `src/trance/screens/BuilderScreen.tsx` | Update `handleAnalyzeFile` call site |

---

## Task 1: Install npm packages

**Files:**
- No new files — package.json + package-lock.json updated by npm

**Interfaces:**
- Produces: `@google-cloud/storage` Storage class, `google-auth-library` GoogleAuth class available for import in Task 2.

- [ ] **Step 1: Install packages**

```bash
npm install @google-cloud/storage google-auth-library
```

- [ ] **Step 2: Verify installation**

```bash
node -e "require('@google-cloud/storage'); require('google-auth-library'); console.log('ok')"
```

Expected output: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add @google-cloud/storage and google-auth-library"
```

---

## Task 2: GCS server functions

**Files:**
- Create: `src/lib/trance/gcs.server.ts`
- Create: `src/routes/-tranceGcsServerFns.test.ts`

**Interfaces:**
- Consumes: `createServerFn` from `@tanstack/react-start`; `@google-cloud/storage` (lazy); `google-auth-library` (lazy)
- Produces:
  - `gcsGetUploadUrl({ data: { routineId, filename, contentType } })` → `Promise<{ uploadUrl: string; gcsPath: string; jobId: string }>`
  - `gcsAnalyzeStart({ data: { gcsPath, jobId, intervalMs } })` → `Promise<{ jobId: string }>`
  - `gcsAnalyzeStatus({ data: { jobId } })` → `Promise<{ status: string; result?: ChoreographyAnalysis; error?: string }>`

- [ ] **Step 1: Write the failing structural test**

Create `src/routes/-tranceGcsServerFns.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("gcs server functions", () => {
  it("gcsGetUploadUrl is a callable server function", async () => {
    const mod = await import("../lib/trance/gcs.server");
    assert.equal(typeof mod.gcsGetUploadUrl, "function");
  });

  it("gcsAnalyzeStart is a callable server function", async () => {
    const mod = await import("../lib/trance/gcs.server");
    assert.equal(typeof mod.gcsAnalyzeStart, "function");
  });

  it("gcsAnalyzeStatus is a callable server function", async () => {
    const mod = await import("../lib/trance/gcs.server");
    assert.equal(typeof mod.gcsAnalyzeStatus, "function");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vite-node --test src/routes/-tranceGcsServerFns.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/lib/trance/gcs.server.ts`**

```ts
import { createServerFn } from "@tanstack/react-start";
import type { ChoreographyAnalysis } from "@/trance/types";

const BUCKET = "trance-media";

// ── Signed URL for direct client-to-GCS upload ──────────────────────────────

type GcsUploadUrlInput = { routineId: string; filename: string; contentType: string };
type GcsUploadUrlResult = { uploadUrl: string; gcsPath: string; jobId: string };

const validateUploadInput = (input: GcsUploadUrlInput): GcsUploadUrlInput => ({
  routineId: String(input?.routineId ?? ""),
  filename: String(input?.filename ?? ""),
  contentType: String(input?.contentType ?? ""),
});

export const gcsGetUploadUrl = createServerFn({ method: "POST" })
  .inputValidator(validateUploadInput)
  .handler(async ({ data }): Promise<GcsUploadUrlResult> => {
    const { Storage } = await import("@google-cloud/storage");
    const jobId = crypto.randomUUID();
    const gcsPath = `videos/${data.routineId}/${jobId}/${data.filename}`;
    const storage = new Storage();
    const [uploadUrl] = await storage.bucket(BUCKET).file(gcsPath).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType: data.contentType,
    });
    return { uploadUrl, gcsPath, jobId };
  });

// ── Trigger Cloud Run async analysis job ────────────────────────────────────

type AnalyzeStartInput = { gcsPath: string; jobId: string; intervalMs?: number };

const validateAnalyzeStartInput = (input: AnalyzeStartInput): AnalyzeStartInput => ({
  gcsPath: String(input?.gcsPath ?? ""),
  jobId: String(input?.jobId ?? ""),
  intervalMs: typeof input?.intervalMs === "number" ? input.intervalMs : 500,
});

export const gcsAnalyzeStart = createServerFn({ method: "POST" })
  .inputValidator(validateAnalyzeStartInput)
  .handler(async ({ data }): Promise<{ jobId: string }> => {
    const { Storage } = await import("@google-cloud/storage");
    const { GoogleAuth } = await import("google-auth-library");

    const cloudRunUrl = process.env.CLOUD_RUN_ANALYZE_URL;
    if (!cloudRunUrl) throw new Error("CLOUD_RUN_ANALYZE_URL is not configured");

    const storage = new Storage();

    // Write pending status before calling Cloud Run so polling never sees a gap.
    await storage
      .bucket(BUCKET)
      .file(`results/${data.jobId}.json`)
      .save(JSON.stringify({ status: "pending" }), { contentType: "application/json" });

    try {
      const auth = new GoogleAuth();
      const client = await auth.getIdTokenClient(cloudRunUrl);
      const res = await client.request({
        url: `${cloudRunUrl}/analyze`,
        method: "POST",
        data: { gcsPath: data.gcsPath, jobId: data.jobId, intervalMs: data.intervalMs },
      });
      if ((res.status as number) !== 202) {
        throw new Error(`Cloud Run returned ${res.status}`);
      }
    } catch (err) {
      // If Cloud Run is unreachable, write failed status immediately.
      await storage
        .bucket(BUCKET)
        .file(`results/${data.jobId}.json`)
        .save(
          JSON.stringify({ status: "failed", error: err instanceof Error ? err.message : "cloud run unavailable" }),
          { contentType: "application/json" },
        );
      throw err;
    }

    return { jobId: data.jobId };
  });

// ── Poll analysis result ─────────────────────────────────────────────────────

type AnalyzeStatusInput = { jobId: string };
type AnalyzeStatusResult =
  | { status: "pending" }
  | { status: "done"; result: ChoreographyAnalysis }
  | { status: "failed"; error: string };

const validateAnalyzeStatusInput = (input: AnalyzeStatusInput): AnalyzeStatusInput => ({
  jobId: String(input?.jobId ?? ""),
});

export const gcsAnalyzeStatus = createServerFn({ method: "GET" })
  .inputValidator(validateAnalyzeStatusInput)
  .handler(async ({ data }): Promise<AnalyzeStatusResult> => {
    const { Storage } = await import("@google-cloud/storage");
    const storage = new Storage();
    try {
      const [contents] = await storage
        .bucket(BUCKET)
        .file(`results/${data.jobId}.json`)
        .download();
      return JSON.parse(contents.toString()) as AnalyzeStatusResult;
    } catch (err: any) {
      if (err?.code === 404) return { status: "pending" };
      throw err;
    }
  });
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vite-node --test src/routes/-tranceGcsServerFns.test.ts
```

Expected: 3 pass, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add src/lib/trance/gcs.server.ts src/routes/-tranceGcsServerFns.test.ts
git commit -m "feat(trance): add GCS server functions for upload URL, analyze start/status"
```

---

## Task 3: Update tranceVideoUploadService

**Files:**
- Modify: `src/trance/services/tranceVideoUploadService.ts`

**Interfaces:**
- Consumes: `gcsGetUploadUrl` from `@/lib/trance/gcs.server` (Task 2)
- Produces:
  - `tranceVideoUploadService.uploadChoreographyVideo(file: File, routineId: string, onProgress?: (pct: number) => void)` → `Promise<{ jobId: string; gcsPath: string }>`
  - (Removes `uploadRoutineVideo` — replaced by `uploadChoreographyVideo`)

- [ ] **Step 1: Replace the file contents**

Overwrite `src/trance/services/tranceVideoUploadService.ts` with:

```ts
import { shouldUseFixtures } from "./config";
import { gcsGetUploadUrl } from "@/lib/trance/gcs.server";

export const tranceVideoUploadService = {
  uploadChoreographyVideo: async (
    file: File,
    routineId: string,
    onProgress?: (pct: number) => void,
  ): Promise<{ jobId: string; gcsPath: string }> => {
    if (shouldUseFixtures()) {
      onProgress?.(100);
      return { jobId: `mock-job-${Date.now()}`, gcsPath: `videos/mock/${routineId}/${file.name}` };
    }

    // 1. Get a v4 signed URL from the server function (no Supabase involved).
    const { uploadUrl, gcsPath, jobId } = await gcsGetUploadUrl({
      data: { routineId, filename: file.name, contentType: file.type || "video/mp4" },
    });

    // 2. PUT directly to GCS — large file, never touches Vercel.
    onProgress?.(5);
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "video/mp4" },
      body: file,
    });
    if (!res.ok) throw new Error(`GCS upload failed: ${res.status} ${res.statusText}`);
    onProgress?.(100);

    return { jobId, gcsPath };
  },
};
```

- [ ] **Step 2: Update the services barrel to keep the same export name**

`src/trance/services/index.ts` already exports `tranceVideoUploadService` from this file — no change needed there. Verify TypeScript compiles cleanly:

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep "tranceVideoUploadService" | head -10
```

Expected: no lines (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/trance/services/tranceVideoUploadService.ts
git commit -m "feat(trance): replace Supabase video upload with GCS signed URL + direct PUT"
```

---

## Task 4: Update tranceVideoAnalyzerService

**Files:**
- Modify: `src/trance/services/tranceVideoAnalyzerService.ts`

**Interfaces:**
- Consumes: `gcsAnalyzeStart`, `gcsAnalyzeStatus` from `@/lib/trance/gcs.server` (Task 2)
- Produces:
  - `tranceVideoAnalyzerService.analyzeChoreographyVideo(input: { gcsPath: string; jobId: string; intervalMs?: number })` → `Promise<ChoreographyAnalysis>`
  - `tranceVideoAnalyzerService.applyAnalysisToDraft` — **unchanged**

- [ ] **Step 1: Replace `analyzeChoreographyVideo` and add imports; keep `applyAnalysisToDraft` verbatim**

The complete new file (copy `applyAnalysisToDraft` exactly from the existing file at lines 203–245):

```ts
import { supabase } from "@/lib/supabase";
import { shouldUseFixtures } from "./config";
import { gcsAnalyzeStart, gcsAnalyzeStatus } from "@/lib/trance/gcs.server";
import type {
  ChoreographyAnalysis,
} from "../types";

const DEFAULT_INTERVAL_MS = 500;
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 100;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const FIXTURE_ANALYSIS: ChoreographyAnalysis = {
  durationMs: 10000,
  sampledFrameCount: 0,
  targetTimeline: [],
  suggestedCountSections: [],
  suggestedDirectionCues: [],
  suggestedMoveHints: [],
  suggested: true,
  poseProvider: "fixture",
  poseModelVersion: "fixture-v0",
};

export const tranceVideoAnalyzerService = {
  analyzeChoreographyVideo: async (input: {
    gcsPath: string;
    jobId: string;
    intervalMs?: number;
  }): Promise<ChoreographyAnalysis> => {
    if (shouldUseFixtures()) {
      await sleep(1500);
      return FIXTURE_ANALYSIS;
    }

    const intervalMs = input.intervalMs ?? DEFAULT_INTERVAL_MS;

    // Trigger Cloud Run (returns 202 immediately; job runs in background).
    await gcsAnalyzeStart({ data: { gcsPath: input.gcsPath, jobId: input.jobId, intervalMs } });

    // Poll GCS results file until done, failed, or timed out.
    for (let i = 0; i < MAX_POLLS; i++) {
      await sleep(POLL_INTERVAL_MS);
      const status = await gcsAnalyzeStatus({ data: { jobId: input.jobId } });
      if (status.status === "done") return (status as any).result as ChoreographyAnalysis;
      if (status.status === "failed") throw new Error((status as any).error ?? "Analysis failed");
    }

    throw new Error("Analysis timed out after 5 minutes.");
  },

  /**
   * Apply AI suggestions to a DRAFT routine for the choreographer to review/edit.
   * Replaces any existing sections/cues/hints on the draft. Does NOT publish —
   * the routine stays a private/pending draft until the choreographer publishes.
   */
  applyAnalysisToDraft: async (routineId: string, analysis: ChoreographyAnalysis): Promise<void> => {
    if (shouldUseFixtures()) {
      console.log("[Dev Mode] Mock apply choreography suggestions to draft:", routineId, analysis);
      return;
    }
    // Clear previous suggestions for an idempotent re-apply.
    await Promise.all([
      supabase.from("trance_count_sections").delete().eq("routine_id", routineId),
      supabase.from("trance_move_hints").delete().eq("routine_id", routineId),
      supabase.from("trance_direction_cues").delete().eq("routine_id", routineId),
    ]);

    if (analysis.suggestedCountSections.length) {
      await supabase.from("trance_count_sections").insert(
        analysis.suggestedCountSections.map((s) => ({
          routine_id: routineId,
          index: s.index,
          label: s.label,
          counts: s.counts,
        })),
      );
    }
    if (analysis.suggestedMoveHints.length) {
      await supabase.from("trance_move_hints").insert(
        analysis.suggestedMoveHints.map((h) => ({
          routine_id: routineId,
          timestamp: h.timestamp,
          label: h.label,
          description: h.description,
        })),
      );
    }
    if (analysis.suggestedDirectionCues.length) {
      await supabase.from("trance_direction_cues").insert(
        analysis.suggestedDirectionCues.map((c) => ({
          routine_id: routineId,
          timestamp: c.timestamp,
          direction: c.direction,
          facing: c.facing,
        })),
      );
    }
  },
};
```

- [ ] **Step 2: Verify TypeScript compiles (no type errors)**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep "tranceVideoAnalyzerService\|gcs.server" | head -20
```

Expected: no lines (no errors in those files).

- [ ] **Step 3: Commit**

```bash
git add src/trance/services/tranceVideoAnalyzerService.ts
git commit -m "feat(trance): replace browser MediaPipe analyzer with Cloud Run async poll"
```

---

## Task 5: Update BuilderScreen call site

**Files:**
- Modify: `src/trance/screens/BuilderScreen.tsx` (lines ~85–103, ~257)

**Interfaces:**
- Consumes:
  - `tranceVideoUploadService.uploadChoreographyVideo(file, routineId)` → `{ jobId, gcsPath }` (Task 3)
  - `tranceVideoAnalyzerService.analyzeChoreographyVideo({ gcsPath, jobId })` → `ChoreographyAnalysis` (Task 4)

- [ ] **Step 1: Update `handleAnalyzeFile` in BuilderScreen.tsx**

Find `handleAnalyzeFile` (around line 85) and replace it:

Old:
```ts
const handleAnalyzeFile = async (file: File) => {
  setAnalyzing(true);
  setAnalyzeProgress(0);
  setAiAnalysis(null);
  try {
    const analysis = await tranceVideoAnalyzerService.analyzeChoreographyVideo({
      file,
      onProgress: (p) => setAnalyzeProgress(Math.round(p * 100)),
    });
    setAiAnalysis(analysis);
    toast.success(
      `AI suggested ${analysis.suggestedCountSections.length} sections, ${analysis.suggestedDirectionCues.length} cues, ${analysis.suggestedMoveHints.length} hints — review before publishing.`,
    );
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "AI analysis failed.");
  } finally {
    setAnalyzing(false);
  }
};
```

New:
```ts
const handleAnalyzeFile = async (file: File) => {
  setAnalyzing(true);
  setAnalyzeProgress(0);
  setAiAnalysis(null);
  try {
    const tempRoutineId = crypto.randomUUID();
    const { jobId, gcsPath } = await tranceVideoUploadService.uploadChoreographyVideo(
      file,
      tempRoutineId,
      (pct) => setAnalyzeProgress(Math.round(pct * 0.2)), // upload = 0–20%
    );
    setAnalyzeProgress(20);
    const analysis = await tranceVideoAnalyzerService.analyzeChoreographyVideo({ gcsPath, jobId });
    setAiAnalysis(analysis);
    setAnalyzeProgress(100);
    toast.success(
      `AI suggested ${analysis.suggestedCountSections.length} sections, ${analysis.suggestedDirectionCues.length} cues, ${analysis.suggestedMoveHints.length} hints — review before publishing.`,
    );
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "AI analysis failed.");
  } finally {
    setAnalyzing(false);
  }
};
```

- [ ] **Step 2: Remove the stale mock `uploadRoutineVideo` call (around line 257)**

Search for `uploadRoutineVideo` in BuilderScreen.tsx and remove the line (it references the deleted function). If it's inside a `shouldUseFixtures()` block, remove only that call expression.

Run:
```bash
grep -n "uploadRoutineVideo" src/trance/screens/BuilderScreen.tsx
```

If it appears, delete the line(s). If the surrounding `if` block becomes empty, delete that too.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep "BuilderScreen" | head -20
```

Expected: no lines.

- [ ] **Step 4: Commit**

```bash
git add src/trance/screens/BuilderScreen.tsx
git commit -m "feat(trance): update BuilderScreen to upload then analyze via Cloud Run"
```

---

## Task 6: Cloud Run Python service

**Files:**
- Create: `trance-analyzer/requirements.txt`
- Create: `trance-analyzer/Dockerfile`
- Create: `trance-analyzer/schema.py`
- Create: `trance-analyzer/storage.py`
- Create: `trance-analyzer/pose.py`
- Create: `trance-analyzer/main.py`
- Create: `trance-analyzer/test_pose.py`

**Interfaces:**
- Consumes: GCS bucket `trance-media`, env var `GOOGLE_APPLICATION_CREDENTIALS` (ADC)
- Produces: `POST /analyze` → 202, then writes `results/{jobId}.json` to GCS

- [ ] **Step 1: Write the failing Python unit tests**

Create `trance-analyzer/test_pose.py`:

```python
import unittest

class TestIndexToPart(unittest.TestCase):
    def test_all_17_landmarks_defined(self):
        from pose import INDEX_TO_PART
        self.assertEqual(len(INDEX_TO_PART), 17)

    def test_nose_is_index_0(self):
        from pose import INDEX_TO_PART
        self.assertEqual(INDEX_TO_PART[0], "nose")

    def test_left_wrist_is_index_15(self):
        from pose import INDEX_TO_PART
        self.assertEqual(INDEX_TO_PART[15], "left_wrist")

    def test_right_ankle_is_index_28(self):
        from pose import INDEX_TO_PART
        self.assertEqual(INDEX_TO_PART[28], "right_ankle")

    def test_all_part_names_are_strings(self):
        from pose import INDEX_TO_PART
        for idx, part in INDEX_TO_PART.items():
            self.assertIsInstance(part, str, f"index {idx} has non-string part name")

    def test_no_duplicate_part_names(self):
        from pose import INDEX_TO_PART
        names = list(INDEX_TO_PART.values())
        self.assertEqual(len(names), len(set(names)))


class TestExtractFramesSignature(unittest.TestCase):
    def test_extract_frames_is_callable(self):
        from pose import extract_frames
        self.assertTrue(callable(extract_frames))


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd trance-analyzer && python -m pytest test_pose.py -v 2>&1 | head -20
```

Or if pytest isn't installed yet:
```bash
cd trance-analyzer && python test_pose.py 2>&1
```

Expected: ImportError — `pose` module not found.

- [ ] **Step 3: Create `trance-analyzer/requirements.txt`**

```
fastapi==0.115.12
uvicorn[standard]==0.34.2
mediapipe==0.10.21
opencv-python-headless==4.10.0.84
google-cloud-storage==2.19.0
```

- [ ] **Step 4: Create `trance-analyzer/schema.py`**

```python
from dataclasses import dataclass, field
from typing import Literal


@dataclass
class PoseLandmark:
    x: float
    y: float
    z: float
    visibility: float
    bodyPart: str
    timestampMs: int


@dataclass
class ChoreographyTargetFrame:
    timestampMs: int
    landmarks: list


@dataclass
class ChoreographyAnalysis:
    durationMs: float
    sampledFrameCount: int
    targetTimeline: list
    suggestedCountSections: list = field(default_factory=list)
    suggestedDirectionCues: list = field(default_factory=list)
    suggestedMoveHints: list = field(default_factory=list)
    suggested: bool = True
    poseProvider: str = "cloud-run-mediapipe-pose"
    poseModelVersion: str = "mediapipe-pose-legacy-v1"
```

- [ ] **Step 5: Create `trance-analyzer/pose.py`**

```python
import cv2
import mediapipe as mp


# Mirrors mediapipeLoader.ts INDEX_TO_PART exactly.
INDEX_TO_PART: dict[int, str] = {
    0:  "nose",
    2:  "left_eye",
    5:  "right_eye",
    7:  "left_ear",
    8:  "right_ear",
    11: "left_shoulder",
    12: "right_shoulder",
    13: "left_elbow",
    14: "right_elbow",
    15: "left_wrist",
    16: "right_wrist",
    23: "left_hip",
    24: "right_hip",
    25: "left_knee",
    26: "right_knee",
    27: "left_ankle",
    28: "right_ankle",
}


def extract_frames(video_path: str, interval_ms: int) -> tuple[list[dict], float]:
    """
    Sample the video at every interval_ms and run MediaPipe Pose (IMAGE mode).
    Returns (timeline, duration_ms) where timeline is a list of ChoreographyTargetFrame dicts.
    """
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0
    duration_ms = (total_frames / fps) * 1000 if fps > 0 else 0

    pose = mp.solutions.pose.Pose(static_image_mode=True)
    timeline: list[dict] = []

    t = 0.0
    while t < duration_ms:
        cap.set(cv2.CAP_PROP_POS_MSEC, t)
        ret, frame = cap.read()
        if not ret:
            break

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = pose.process(frame_rgb)

        if result.pose_landmarks:
            landmarks = []
            for idx, part_name in INDEX_TO_PART.items():
                lm = result.pose_landmarks.landmark[idx]
                landmarks.append({
                    "x": lm.x,
                    "y": lm.y,
                    "z": lm.z,
                    "visibility": lm.visibility,
                    "bodyPart": part_name,
                    "timestampMs": int(t),
                })
            timeline.append({"timestampMs": int(t), "landmarks": landmarks})

        t += interval_ms

    cap.release()
    pose.close()
    return timeline, duration_ms
```

- [ ] **Step 6: Create `trance-analyzer/storage.py`**

```python
import json
from google.cloud import storage as gcs

BUCKET_NAME = "trance-media"


def download_video(gcs_path: str, local_path: str) -> None:
    client = gcs.Client()
    blob = client.bucket(BUCKET_NAME).blob(gcs_path)
    blob.download_to_filename(local_path)


def write_result(job_id: str, payload: dict) -> None:
    client = gcs.Client()
    blob = client.bucket(BUCKET_NAME).blob(f"results/{job_id}.json")
    blob.upload_from_string(
        json.dumps(payload),
        content_type="application/json",
    )
```

- [ ] **Step 7: Create `trance-analyzer/main.py`**

```python
import tempfile
import traceback
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from pose import extract_frames
from storage import download_video, write_result

app = FastAPI()


class AnalyzeRequest(BaseModel):
    gcsPath: str
    jobId: str
    intervalMs: int = 500


def run_analysis(gcs_path: str, job_id: str, interval_ms: int) -> None:
    try:
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            tmp_path = tmp.name
        download_video(gcs_path, tmp_path)
        timeline, duration_ms = extract_frames(tmp_path, interval_ms)
        result = {
            "durationMs": duration_ms,
            "sampledFrameCount": len(timeline),
            "targetTimeline": timeline,
            "suggestedCountSections": [],
            "suggestedDirectionCues": [],
            "suggestedMoveHints": [],
            "suggested": True,
            "poseProvider": "cloud-run-mediapipe-pose",
            "poseModelVersion": "mediapipe-pose-legacy-v1",
        }
        write_result(job_id, {"status": "done", "result": result})
    except Exception:
        write_result(job_id, {"status": "failed", "error": traceback.format_exc()[:500]})


@app.post("/analyze", status_code=202)
async def analyze(req: AnalyzeRequest, background_tasks: BackgroundTasks) -> dict:
    background_tasks.add_task(run_analysis, req.gcsPath, req.jobId, req.intervalMs)
    return {"jobId": req.jobId}


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
```

- [ ] **Step 8: Create `trance-analyzer/Dockerfile`**

```dockerfile
FROM python:3.11-slim

# OpenCV runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

- [ ] **Step 9: Run unit tests to verify they pass**

```bash
cd trance-analyzer && python test_pose.py -v
```

Expected: 7 tests pass, 0 fail.

- [ ] **Step 10: Commit**

```bash
git add trance-analyzer/
git commit -m "feat(trance): add Cloud Run Python service for async video pose analysis"
```

---

## Environment Variables Required

Before deploying, configure these on Vercel (and locally via `.env.local` for dev):

| Variable | Where needed | Value |
|---|---|---|
| `GOOGLE_APPLICATION_CREDENTIALS` | Vercel server functions | Service account key JSON (as secret) |
| `CLOUD_RUN_ANALYZE_URL` | Vercel server functions | Cloud Run service URL, e.g. `https://trance-analyzer-xxx-uc.a.run.app` |

The Cloud Run service picks up `GOOGLE_APPLICATION_CREDENTIALS` from its attached service account automatically (no env var needed inside the container).

## Deployment Notes

1. Build and push the Cloud Run container:
   ```bash
   gcloud builds submit trance-analyzer/ --tag gcr.io/<PROJECT_ID>/trance-analyzer
   gcloud run deploy trance-analyzer --image gcr.io/<PROJECT_ID>/trance-analyzer \
     --region us-central1 --no-allow-unauthenticated --memory 2Gi --timeout 3600
   ```
2. Grant the service account `trance-analyzer-sa` the `run.invoker` role on the Cloud Run service.
3. Set `CLOUD_RUN_ANALYZE_URL` on Vercel to the URL shown by `gcloud run services describe trance-analyzer --format='value(status.url)'`.

## Supabase Migration (outstanding from calibration feature)

This plan does not require a new migration. The outstanding migration from the calibration feature still needs to be run:

```sql
ALTER TABLE trance_profiles ADD COLUMN IF NOT EXISTS calibration_profile JSONB;
```
