# Trance — Google Cloud Video Analysis Design

**Date:** 2026-06-21
**Status:** Approved

---

## Goal

Replace browser-side MediaPipe IMAGE-mode choreography video analysis with an async Google Cloud pipeline: direct GCS upload from the client, Cloud Run (Python + MediaPipe) for server-side analysis, and Vercel API routes as the thin orchestration layer. Live session pose tracking (browser MediaPipe VIDEO mode) is unchanged.

---

## Boundary

| Workflow | Provider | Changes? |
|---|---|---|
| Live calibration / practice pose tracking | Browser MediaPipe (VIDEO mode) | **No** |
| Choreography video upload | Supabase Storage → **GCS** | **Yes** |
| Choreography video analysis | Browser MediaPipe IMAGE mode → **Cloud Run** | **Yes** |
| Supabase writes (draft, routine data) | Supabase | **No** |

---

## Section 1 — Infrastructure

**GCS bucket:** `trance-media`
- `videos/{routineId}/{jobId}/{filename}` — uploaded choreography videos
- `results/{jobId}.json` — analysis results (status + payload)

**Cloud Run service:** `trance-analyzer`
- Private (no public HTTP access)
- Python 3.11, FastAPI, MediaPipe, OpenCV
- Memory: 2Gi (MediaPipe model + frame buffers)
- Timeout: 3600s (long videos)
- Min instances: 0

**Service account:** `trance-analyzer-sa`
- Roles: `Storage Object Admin`, `run.invoker`

**ADC on Vercel:** `GOOGLE_APPLICATION_CREDENTIALS` env var pointing to service account key JSON. Used by both `@google-cloud/storage` (signed URLs + result reads/writes) and `google-auth-library` (ID token to call Cloud Run).

---

## Section 2 — Vercel API Routes

Three new files under `src/routes/api/trance/`:

### `gcs-upload-url.ts` — `POST /api/trance/gcs-upload-url`

```
Body: { routineId, filename, contentType }

1. Generate crypto UUID → jobId
2. Compose GCS path: videos/{routineId}/{jobId}/{filename}
3. Mint GCS v4 signed URL (PUT, 15 min, matching contentType)
4. Return: { uploadUrl, gcsPath, jobId }
```

Uses `@google-cloud/storage`. No Supabase involvement.

### `analyze-start.ts` — `POST /api/trance/analyze-start`

```
Body: { gcsPath, jobId, intervalMs? }

1. Mint Cloud Run ID token via google-auth-library
2. POST to Cloud Run /analyze → expect 202 (immediate)
3. Write gs://trance-media/results/{jobId}.json = { status: "pending" }
4. Return: { jobId }
```

If Cloud Run is unreachable, write `{ status: "failed", error: "cloud run unavailable" }` immediately and return 500.

### `analyze-status.ts` — `GET /api/trance/analyze-status?jobId=…`

```
1. Download gs://trance-media/results/{jobId}.json
2. If 404 → return { status: "pending" }
3. Return JSON as-is: { status, result? } or { status, error }
```

---

## Section 3 — Cloud Run Service (`trance-analyzer`)

**File layout:**
```
trance-analyzer/
  Dockerfile
  requirements.txt
  main.py       — FastAPI app, /analyze endpoint
  pose.py       — MediaPipe frame extraction + landmark mapping
  storage.py    — GCS read/write helpers
  schema.py     — ChoreographyAnalysis dataclasses
```

**`POST /analyze` endpoint:**
```
Body: { gcsPath, jobId, intervalMs? }

Returns 202 immediately.
Background task:
  a. Download gs://trance-media/{gcsPath} → temp file
  b. cv2.VideoCapture(tmp_path)
  c. For each sample point (every intervalMs ms, default 500):
       cap.set(cv2.CAP_PROP_POS_MSEC, ts)
       ret, frame = cap.read()
       Run mp.solutions.pose.Pose(static_image_mode=True)
       Map landmarks → ChoreographyTargetFrame
  d. Write gs://trance-media/results/{jobId}.json:
       { "status": "done", "result": <ChoreographyAnalysis> }
  e. On any exception:
       { "status": "failed", "error": "<message>" }
```

**Dockerfile (outline):**
```dockerfile
FROM python:3.11-slim
RUN apt-get install -y libgl1 libglib2.0-0
COPY requirements.txt .
RUN pip install fastapi uvicorn mediapipe opencv-python-headless \
                google-cloud-storage
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

---

## Section 4 — Client Service Changes

### `tranceVideoUploadService.ts`

Replaces Supabase Storage upload with GCS signed URL flow:

```ts
export async function uploadChoreographyVideo(
  file: File,
  routineId: string
): Promise<{ jobId: string; gcsPath: string }> {
  const { uploadUrl, gcsPath, jobId } = await fetch(
    "/api/trance/gcs-upload-url",
    { method: "POST", body: JSON.stringify({ routineId, filename: file.name, contentType: file.type }) }
  ).then(r => r.json());

  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  return { jobId, gcsPath };
}
```

### `tranceVideoAnalyzerService.ts`

Replaces browser MediaPipe IMAGE mode with Cloud Run trigger + poll:

```ts
export async function analyzeChoreographyVideo(
  gcsPath: string,
  jobId: string,
  intervalMs: number
): Promise<ChoreographyAnalysis> {
  await fetch("/api/trance/analyze-start", {
    method: "POST",
    body: JSON.stringify({ gcsPath, jobId, intervalMs }),
  });

  for (let i = 0; i < 100; i++) {
    await sleep(3000);
    const { status, result, error } = await fetch(
      `/api/trance/analyze-status?jobId=${jobId}`
    ).then(r => r.json());

    if (status === "done") return result as ChoreographyAnalysis;
    if (status === "failed") throw new Error(error ?? "Analysis failed");
  }
  throw new Error("Analysis timed out");
}
```

**Call site change:** one location passes `{ gcsPath, jobId }` instead of a Supabase URL. `applyAnalysisToDraft` and all Supabase writes are unchanged.

---

## Section 5 — Landmark Schema Mapping

The Python service maps MediaPipe's 33-point output to the same `PoseBodyPart` strings used in `mediapipeLoader.ts`. The index table is authoritative — it must not diverge from the TypeScript source.

**`INDEX_TO_PART` in `pose.py`:**
```python
INDEX_TO_PART = {
    0:  "nose",
    2:  "left_eye",       5:  "right_eye",
    7:  "left_ear",       8:  "right_ear",
    11: "left_shoulder",  12: "right_shoulder",
    13: "left_elbow",     14: "right_elbow",
    15: "left_wrist",     16: "right_wrist",
    23: "left_hip",       24: "right_hip",
    25: "left_knee",      26: "right_knee",
    27: "left_ankle",     28: "right_ankle",
}
```

**Output JSON shape (must satisfy `ChoreographyAnalysis`):**
```json
{
  "durationMs": 124000,
  "sampledFrameCount": 248,
  "targetTimeline": [
    {
      "timestampMs": 0,
      "landmarks": [
        { "x": 0.51, "y": 0.23, "z": -0.01, "visibility": 0.99,
          "bodyPart": "nose", "timestampMs": 0 }
      ]
    }
  ],
  "suggestedCountSections": [],
  "suggestedDirectionCues": [],
  "suggestedMoveHints": [],
  "suggested": true,
  "poseProvider": "cloud-run-mediapipe-pose",
  "poseModelVersion": "mediapipe-pose-legacy-v1"
}
```

`suggestedCountSections`, `suggestedDirectionCues`, and `suggestedMoveHints` are empty arrays in the MVP — they are derived downstream in the choreographer review UI, not by the analyzer. `suggested: true` is required by the TypeScript type literal.

---

## Section 6 — Error Handling

### Upload phase
- Vercel fails to mint signed URL → HTTP 500 → client throws, surfaces existing upload error UI
- Client PUT to GCS fails → client throws before `analyze-start` is called → no orphaned job

### Analysis phase
- Cloud Run unreachable / 5xx → `analyze-start` writes `{ status: "failed" }` immediately → client poll sees it on next tick
- Cloud Run background task crashes → `except` block writes `{ status: "failed", error: "<summary>" }`
- GCS result write fails inside Cloud Run → client times out after 100 polls (~5 min), throws `"Analysis timed out"`

### Poll phase
- `results/{jobId}.json` not yet written → GCS 404 → Vercel returns `{ status: "pending" }` → client keeps polling
- Corrupt result JSON → Vercel returns 500 → client throws on that tick
- 100-poll timeout → throws `"Analysis timed out"` → same error path as upload failure

### ADC / auth
- Missing or invalid `GOOGLE_APPLICATION_CREDENTIALS` → `google-auth-library` throws → Vercel route returns 500 with `"GCS auth failed"`
- Cloud Run ID token expired → `analyze-start` retries token mint once before failing

No client-side retry logic. All retries are either implicit (poll loop) or fatal (throw). The choreographer can re-upload if analysis fails.

---

## Dependencies

| Package | Used in | Purpose |
|---|---|---|
| `@google-cloud/storage` | Vercel routes | Signed URL minting, result read/write |
| `google-auth-library` | Vercel routes | ID token to call private Cloud Run |
| `fastapi` + `uvicorn` | Cloud Run | HTTP server |
| `mediapipe` | Cloud Run | Pose landmark detection (IMAGE mode) |
| `opencv-python-headless` | Cloud Run | Video decode + frame seek |
| `google-cloud-storage` (Python) | Cloud Run | GCS result write |

---

## Out of Scope

- Live session pose tracking (browser MediaPipe VIDEO mode) — unchanged
- Supabase reads/writes for routine drafts — unchanged
- Choreographer review UI — unchanged
- `suggestedCountSections` / `suggestedDirectionCues` / `suggestedMoveHints` generation logic — deferred to a future pass
