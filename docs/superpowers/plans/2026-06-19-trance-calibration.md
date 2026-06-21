# Trance Calibration Overlay + Desktop QR Handoff Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate the Trance practice session behind a mobile-first calibration overlay (4-step flow that saves a versioned profile) and a desktop QR handoff screen that routes non-mobile users to continue on their phone.

**Architecture:** A `CalibrationGate` component wraps `LearnModeScreen` in the existing practice route. It branches on device type first (non-mobile → `QRMobileHandoffGate`, mobile → auth check → calibration check → practice). The calibration overlay owns the camera for its 4 steps and releases it cleanly before the practice session starts.

**Tech Stack:** React 19, TanStack Router, `useTrancePoseSession` (existing hook), Supabase JSONB column for persistence, `react-qr-code` (new dependency), `node:test` + `vite-node` for utility tests.

---

## File map

**New files:**
- `src/trance/calibration/handoffToken.ts` — pure encode/decode/expiry utilities
- `src/trance/calibration/handoffToken.test.ts` — tests for handoffToken
- `src/trance/calibration/useCalibrationScoring.ts` — scoring pure functions + hook
- `src/trance/calibration/useCalibrationScoring.test.ts` — tests for scoring utilities
- `src/trance/calibration/QRMobileHandoffGate.tsx` — desktop blocking screen
- `src/trance/calibration/steps/CameraSetupStep.tsx` — Step 1
- `src/trance/calibration/steps/LevelQuizStep.tsx` — Step 2
- `src/trance/calibration/steps/MoveTestStep.tsx` — Step 3 (reused ×3)
- `src/trance/calibration/steps/ResultStep.tsx` — Step 4
- `src/trance/calibration/CalibrationOverlay.tsx` — orchestrates steps 1–4
- `src/trance/calibration/CalibrationGate.tsx` — top-level gate

**Modified files:**
- `src/trance/types/index.ts` — add `CalibrationLevel`, `CalibrationTrackingQuality`, `CalibrationProfile`, `HandoffToken`; add `calibrationProfile?` to `DancerProfile`
- `src/trance/services/tranceProfileService.ts` — add `getCalibrationProfile`, `saveCalibrationProfile`, `clearCalibrationProfile`
- `src/routes/trance.session.$routineId.practice.tsx` — wrap `LearnModeScreen` in `<CalibrationGate>`
- `src/trance/screens/ProfileScreen.tsx` — add "Reset Trance Calibration" action

---

### Task 1: Install `react-qr-code`

**Files:**
- Modify: `package.json` (via pnpm)

- [ ] **Step 1: Install**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && pnpm add react-qr-code
```

Expected: `dependencies` in `package.json` now includes `react-qr-code`.

- [ ] **Step 2: Verify install**

```bash
node -e "require.resolve('react-qr-code')" 2>/dev/null && echo ok || echo fail
```

Expected output: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add react-qr-code for trance desktop QR handoff gate"
```

---

### Task 2: Add types

**Files:**
- Modify: `src/trance/types/index.ts`

- [ ] **Step 1: Add calibration types after the `SessionMode` type line**

Open `src/trance/types/index.ts`. After the line `export type SessionMode = "Learn" | "Practice" | "Performance";`, insert:

```ts
export type CalibrationLevel = "beginner" | "intermediate" | "advanced";
export type CalibrationTrackingQuality = "poor" | "ok" | "good" | "excellent";

export interface CalibrationProfile {
  completed: true;
  version: 1;
  completedAt: string;
  deviceType: "mobile";
  selectedLevel: CalibrationLevel;
  assignedLevel: CalibrationLevel;
  scores: {
    timing: number;
    bodyControl: number;
    range: number;
    camera: number;
  };
  trackingQuality: CalibrationTrackingQuality;
}

export interface HandoffToken {
  routineId: string;
  mode: "practice";
  exp: number;
}
```

- [ ] **Step 2: Add `calibrationProfile?` to `DancerProfile`**

In `src/trance/types/index.ts`, find the `DancerProfile` interface. Add after the `memberNumber?` line:

```ts
  calibrationProfile?: CalibrationProfile;
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors related to the added types.

- [ ] **Step 4: Commit**

```bash
git add src/trance/types/index.ts
git commit -m "feat(trance): add CalibrationProfile and HandoffToken types"
```

---

### Task 3: Handoff token utilities

**Files:**
- Create: `src/trance/calibration/handoffToken.ts`
- Create: `src/trance/calibration/handoffToken.test.ts`

- [ ] **Step 1: Write failing test first**

Create `src/trance/calibration/handoffToken.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { encodeHandoffToken, decodeHandoffToken, isHandoffTokenExpired } from "./handoffToken";

test("encodeHandoffToken produces a non-empty URL-safe string", () => {
  const token = encodeHandoffToken("rt001");
  assert.ok(token.length > 0);
  assert.doesNotMatch(token, /[+/=]/); // URL-safe: no +, /, =
});

test("decodeHandoffToken round-trips correctly", () => {
  const encoded = encodeHandoffToken("rt001");
  const decoded = decodeHandoffToken(encoded);
  assert.ok(decoded !== null);
  assert.equal(decoded!.routineId, "rt001");
  assert.equal(decoded!.mode, "practice");
  assert.ok(decoded!.exp > Date.now());
});

test("decodeHandoffToken returns null for garbage input", () => {
  assert.equal(decodeHandoffToken("not-valid-base64!!!"), null);
});

test("isHandoffTokenExpired returns false for fresh token", () => {
  const encoded = encodeHandoffToken("rt001");
  const decoded = decodeHandoffToken(encoded)!;
  assert.equal(isHandoffTokenExpired(decoded), false);
});

test("isHandoffTokenExpired returns true for expired token", () => {
  const expired = { routineId: "rt001", mode: "practice" as const, exp: Date.now() - 1000 };
  assert.equal(isHandoffTokenExpired(expired), true);
});

test("token expiry is approximately 15 minutes from now", () => {
  const before = Date.now();
  const encoded = encodeHandoffToken("rt001");
  const decoded = decodeHandoffToken(encoded)!;
  const fifteenMin = 15 * 60 * 1000;
  assert.ok(decoded.exp >= before + fifteenMin - 100);
  assert.ok(decoded.exp <= before + fifteenMin + 100);
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx vite-node src/trance/calibration/handoffToken.test.ts 2>&1
```

Expected: error `Cannot find module './handoffToken'`

- [ ] **Step 3: Create the implementation**

Create `src/trance/calibration/handoffToken.ts`:

```ts
import type { HandoffToken } from "../types";

const EXPIRY_MS = 15 * 60 * 1000;

export function encodeHandoffToken(routineId: string): string {
  const token: HandoffToken = {
    routineId,
    mode: "practice",
    exp: Date.now() + EXPIRY_MS,
  };
  return btoa(JSON.stringify(token))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function decodeHandoffToken(encoded: string): HandoffToken | null {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (padded.length % 4)) % 4;
    const json = atob(padded + "=".repeat(padding));
    const parsed = JSON.parse(json);
    if (
      typeof parsed.routineId !== "string" ||
      parsed.mode !== "practice" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    return parsed as HandoffToken;
  } catch {
    return null;
  }
}

export function isHandoffTokenExpired(token: HandoffToken): boolean {
  return Date.now() > token.exp;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx vite-node src/trance/calibration/handoffToken.test.ts 2>&1
```

Expected: all 6 tests pass, `pass 6` in output.

- [ ] **Step 5: Commit**

```bash
git add src/trance/calibration/handoffToken.ts src/trance/calibration/handoffToken.test.ts
git commit -m "feat(trance): add handoff token encode/decode utilities with tests"
```

---

### Task 4: Calibration scoring utilities

**Files:**
- Create: `src/trance/calibration/useCalibrationScoring.ts`
- Create: `src/trance/calibration/useCalibrationScoring.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/trance/calibration/useCalibrationScoring.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  scoreMoveFrames,
  averageMoveResults,
  assignCalibrationLevel,
  cameraScoreToTrackingQuality,
  type MoveFrameData,
} from "./useCalibrationScoring";

const goodFrame: MoveFrameData = {
  bodyConfidence: 0.85,
  visibleRatio: 0.9,
  lightingOk: true,
  fullBodyInFrame: true,
};

const badFrame: MoveFrameData = {
  bodyConfidence: 0.2,
  visibleRatio: 0.3,
  lightingOk: false,
  fullBodyInFrame: false,
};

test("scoreMoveFrames returns zeros for empty input", () => {
  const result = scoreMoveFrames([]);
  assert.deepEqual(result, { timing: 0, bodyControl: 0, range: 0, camera: 0 });
});

test("scoreMoveFrames scores all-good frames near 100", () => {
  const frames = Array.from({ length: 10 }, () => goodFrame);
  const result = scoreMoveFrames(frames);
  assert.ok(result.bodyControl >= 80, `bodyControl should be >=80, got ${result.bodyControl}`);
  assert.ok(result.range >= 80, `range should be >=80, got ${result.range}`);
  assert.equal(result.camera, 100);
});

test("scoreMoveFrames scores all-bad frames near 0", () => {
  const frames = Array.from({ length: 10 }, () => badFrame);
  const result = scoreMoveFrames(frames);
  assert.ok(result.bodyControl < 30, `bodyControl should be <30, got ${result.bodyControl}`);
  assert.equal(result.camera, 0);
});

test("averageMoveResults averages correctly", () => {
  const results = [
    { timing: 80, bodyControl: 60, range: 70, camera: 90 },
    { timing: 60, bodyControl: 80, range: 50, camera: 70 },
  ];
  const avg = averageMoveResults(results);
  assert.equal(avg.timing, 70);
  assert.equal(avg.bodyControl, 70);
  assert.equal(avg.range, 60);
  assert.equal(avg.camera, 80);
});

test("averageMoveResults returns zeros for empty input", () => {
  assert.deepEqual(averageMoveResults([]), { timing: 0, bodyControl: 0, range: 0, camera: 0 });
});

test("assignCalibrationLevel: advanced downgrade below 0.55", () => {
  assert.equal(assignCalibrationLevel("advanced", 0.5), "intermediate");
});

test("assignCalibrationLevel: advanced no downgrade above 0.55", () => {
  assert.equal(assignCalibrationLevel("advanced", 0.6), "advanced");
});

test("assignCalibrationLevel: beginner upgrade above 0.75", () => {
  assert.equal(assignCalibrationLevel("beginner", 0.8), "intermediate");
});

test("assignCalibrationLevel: beginner no upgrade below 0.75", () => {
  assert.equal(assignCalibrationLevel("beginner", 0.7), "beginner");
});

test("assignCalibrationLevel: intermediate always stays intermediate", () => {
  assert.equal(assignCalibrationLevel("intermediate", 0.1), "intermediate");
  assert.equal(assignCalibrationLevel("intermediate", 0.99), "intermediate");
});

test("cameraScoreToTrackingQuality maps correctly", () => {
  assert.equal(cameraScoreToTrackingQuality(0), "poor");
  assert.equal(cameraScoreToTrackingQuality(49), "poor");
  assert.equal(cameraScoreToTrackingQuality(50), "ok");
  assert.equal(cameraScoreToTrackingQuality(69), "ok");
  assert.equal(cameraScoreToTrackingQuality(70), "good");
  assert.equal(cameraScoreToTrackingQuality(84), "good");
  assert.equal(cameraScoreToTrackingQuality(85), "excellent");
  assert.equal(cameraScoreToTrackingQuality(100), "excellent");
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx vite-node src/trance/calibration/useCalibrationScoring.test.ts 2>&1
```

Expected: error `Cannot find module './useCalibrationScoring'`

- [ ] **Step 3: Create the implementation**

Create `src/trance/calibration/useCalibrationScoring.ts`:

```ts
import { useCallback, useRef, useState } from "react";
import type { CalibrationLevel, CalibrationTrackingQuality } from "../types";

export interface MoveFrameData {
  bodyConfidence: number;
  visibleRatio: number;
  lightingOk: boolean;
  fullBodyInFrame: boolean;
}

export interface MoveResult {
  timing: number;
  bodyControl: number;
  range: number;
  camera: number;
}

export function scoreMoveFrames(frames: MoveFrameData[]): MoveResult {
  if (frames.length === 0) return { timing: 0, bodyControl: 0, range: 0, camera: 0 };
  const n = frames.length;

  const meanConfidence = frames.reduce((s, f) => s + f.bodyConfidence, 0) / n;
  const variance = frames.reduce((s, f) => s + Math.pow(f.bodyConfidence - meanConfidence, 2), 0) / n;
  const timing = Math.round(Math.max(0, (1 - Math.min(variance * 4, 1)) * 100));
  const bodyControl = Math.round(meanConfidence * 100);
  const range = Math.round((frames.reduce((s, f) => s + f.visibleRatio, 0) / n) * 100);
  const camera = Math.round((frames.filter((f) => f.lightingOk && f.fullBodyInFrame).length / n) * 100);

  return { timing, bodyControl, range, camera };
}

export function averageMoveResults(results: MoveResult[]): MoveResult {
  if (results.length === 0) return { timing: 0, bodyControl: 0, range: 0, camera: 0 };
  const n = results.length;
  return {
    timing: Math.round(results.reduce((s, r) => s + r.timing, 0) / n),
    bodyControl: Math.round(results.reduce((s, r) => s + r.bodyControl, 0) / n),
    range: Math.round(results.reduce((s, r) => s + r.range, 0) / n),
    camera: Math.round(results.reduce((s, r) => s + r.camera, 0) / n),
  };
}

export function assignCalibrationLevel(
  selectedLevel: CalibrationLevel,
  meanBodyConfidence: number,
): CalibrationLevel {
  if (selectedLevel === "advanced" && meanBodyConfidence < 0.55) return "intermediate";
  if (selectedLevel === "beginner" && meanBodyConfidence > 0.75) return "intermediate";
  return selectedLevel;
}

export function cameraScoreToTrackingQuality(camera: number): CalibrationTrackingQuality {
  if (camera < 50) return "poor";
  if (camera < 70) return "ok";
  if (camera < 85) return "good";
  return "excellent";
}

export function useCalibrationScoring() {
  const frameBufferRef = useRef<MoveFrameData[]>([]);
  const [moveResults, setMoveResults] = useState<MoveResult[]>([]);

  const recordFrame = useCallback((data: MoveFrameData) => {
    frameBufferRef.current.push(data);
  }, []);

  const commitMove = useCallback((): MoveResult => {
    const result = scoreMoveFrames(frameBufferRef.current);
    frameBufferRef.current = [];
    setMoveResults((prev) => [...prev, result]);
    return result;
  }, []);

  const computeFinalResult = useCallback(
    (selectedLevel: CalibrationLevel) => {
      const final = averageMoveResults(moveResults);
      const meanBodyConfidence = moveResults.length > 0
        ? moveResults.reduce((s, r) => s + r.bodyControl, 0) / (moveResults.length * 100)
        : 0;
      return {
        selectedLevel,
        assignedLevel: assignCalibrationLevel(selectedLevel, meanBodyConfidence),
        scores: final,
        trackingQuality: cameraScoreToTrackingQuality(final.camera),
      };
    },
    [moveResults],
  );

  return { recordFrame, commitMove, computeFinalResult, moveResults };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx vite-node src/trance/calibration/useCalibrationScoring.test.ts 2>&1
```

Expected: all 13 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/trance/calibration/useCalibrationScoring.ts src/trance/calibration/useCalibrationScoring.test.ts
git commit -m "feat(trance): add calibration scoring utilities with tests"
```

---

### Task 5: Profile service additions

**Files:**
- Modify: `src/trance/services/tranceProfileService.ts`

- [ ] **Step 1: Add the three new methods to `tranceProfileService`**

Open `src/trance/services/tranceProfileService.ts`. At the end of the `tranceProfileService` object (before the final `}`), add:

```ts
  getCalibrationProfile: async (userId: string): Promise<CalibrationProfile | null> => {
    assertConfigured("ProfileService");
    if (shouldUseFixtures()) return null;

    const { data, error } = await supabase
      .from("trance_profiles")
      .select("calibration_profile")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return (data?.calibration_profile as CalibrationProfile | null) ?? null;
  },

  saveCalibrationProfile: async (userId: string, profile: CalibrationProfile): Promise<void> => {
    assertConfigured("ProfileService");
    if (shouldUseFixtures()) {
      console.log("[Dev Mode] Mock save calibration profile:", profile);
      return;
    }

    const { error } = await supabase
      .from("trance_profiles")
      .update({ calibration_profile: profile })
      .eq("id", userId);

    if (error) throw error;
  },

  clearCalibrationProfile: async (userId: string): Promise<void> => {
    assertConfigured("ProfileService");
    if (shouldUseFixtures()) {
      console.log("[Dev Mode] Mock clear calibration profile for user", userId);
      return;
    }

    const { error } = await supabase
      .from("trance_profiles")
      .update({ calibration_profile: null })
      .eq("id", userId);

    if (error) throw error;
  },
```

- [ ] **Step 2: Add the `CalibrationProfile` import to the file**

At the top of `src/trance/services/tranceProfileService.ts`, update the import from `"../types"` to include `CalibrationProfile`:

```ts
import { DancerProfile, ChoreographerProfile, CalibrationProfile } from "../types";
```

- [ ] **Step 3: Add the Supabase migration comment**

At the top of `src/trance/services/tranceProfileService.ts`, below the imports, add:

```ts
// DB: trance_profiles requires a nullable JSONB column:
// ALTER TABLE trance_profiles ADD COLUMN IF NOT EXISTS calibration_profile JSONB;
```

- [ ] **Step 4: TypeScript check**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/trance/services/tranceProfileService.ts
git commit -m "feat(trance): add getCalibrationProfile, saveCalibrationProfile, clearCalibrationProfile to profile service"
```

---

### Task 6: QRMobileHandoffGate

**Files:**
- Create: `src/trance/calibration/QRMobileHandoffGate.tsx`

- [ ] **Step 1: Create the component**

Create `src/trance/calibration/QRMobileHandoffGate.tsx`:

```tsx
import React from "react";
import QRCode from "react-qr-code";
import { TranceShell } from "../components/shell";
import { encodeHandoffToken } from "./handoffToken";

interface QRMobileHandoffGateProps {
  routineId: string;
}

const BASE_URL = "https://tv.treytrizzy.com";

export function QRMobileHandoffGate({ routineId }: QRMobileHandoffGateProps) {
  const token = React.useMemo(() => encodeHandoffToken(routineId), [routineId]);
  const url = `${BASE_URL}/trance/session/${encodeURIComponent(routineId)}/practice?handoff=${token}`;

  return (
    <TranceShell hideNav>
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="space-y-2">
          <div className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest">
            Mobile Required
          </div>
          <h1 className="text-2xl font-black text-white uppercase leading-tight">
            Continue Practice<br />on Mobile
          </h1>
          <p className="text-sm text-white/60 max-w-xs mx-auto">
            Trance uses your phone's camera for movement tracking. Scan the code below with your
            phone to continue.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[0_0_40px_-4px_rgba(217,70,239,0.4)]">
          <QRCode
            value={url}
            size={200}
            bgColor="#ffffff"
            fgColor="#0a0012"
            level="M"
          />
        </div>

        <p className="text-xs text-white/40 max-w-xs">
          Make sure you're logged in on your phone.
        </p>
      </div>
    </TranceShell>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/trance/calibration/QRMobileHandoffGate.tsx
git commit -m "feat(trance): add QRMobileHandoffGate for desktop users"
```

---

### Task 7: Step 1 — CameraSetupStep

**Files:**
- Create: `src/trance/calibration/steps/CameraSetupStep.tsx`

- [ ] **Step 1: Create the component**

Create `src/trance/calibration/steps/CameraSetupStep.tsx`:

```tsx
import React from "react";
import { PoseCameraCanvas } from "../../components/PoseCameraCanvas";
import { cn } from "../../components/primitives";
import type { UseTrancePoseSession } from "../../hooks/useTrancePoseSession";

interface CameraSetupStepProps {
  pose: UseTrancePoseSession;
  onReady: () => void;
}

function StatusDot({ ok }: { ok: boolean | undefined }) {
  return (
    <div
      className={cn(
        "w-2.5 h-2.5 rounded-full flex-shrink-0",
        ok === true && "bg-emerald-400",
        ok === false && "bg-red-400",
        ok === undefined && "bg-yellow-400 animate-pulse",
      )}
    />
  );
}

export function CameraSetupStep({ pose, onReady }: CameraSetupStepProps) {
  React.useEffect(() => {
    void pose.start();
    // pose.stop() is called by CalibrationOverlay when leaving step 1
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bodyVisible = pose.confidence?.fullBodyInFrame;
  const lightingOk = pose.confidence?.lightingOk;
  const distanceOk =
    pose.warnings.length === 0 ||
    !pose.warnings.some((w) => w.includes("distance") || w.includes("far") || w.includes("close"));

  const allGood = bodyVisible === true && lightingOk === true && distanceOk;

  const isError =
    pose.status === "unavailable" || pose.status === "permission_denied";

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
        <div className="text-4xl">📷</div>
        <div className="text-base font-black text-white uppercase">Camera Unavailable</div>
        <p className="text-sm text-white/60 max-w-xs">
          {pose.error?.code === "permission_denied"
            ? "Camera permission was denied. Allow camera access in your phone's settings, then come back."
            : "Your device doesn't support camera tracking. Try on a different device."}
        </p>
      </div>
    );
  }

  const isLoading =
    pose.status === "idle" ||
    pose.status === "requesting_permission" ||
    pose.status === "camera_ready";

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 relative">
        <PoseCameraCanvas pose={pose} className="min-h-[50vh]" />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-t-fuchsia-500 border-white/10 animate-spin" />
              <div className="text-xs text-white/50 uppercase tracking-widest">
                Starting camera…
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-6 space-y-4">
        <div>
          <div className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest mb-1">
            Step 1 of 4
          </div>
          <h2 className="text-lg font-black text-white uppercase">Frame Your Full Body</h2>
          <p className="text-xs text-white/50 mt-1">
            Step back until your head and feet are both visible.
          </p>
        </div>

        <div className="space-y-2.5">
          {[
            { label: "Full body visible", ok: bodyVisible },
            { label: "Lighting OK", ok: lightingOk },
            { label: "Distance OK", ok: distanceOk || pose.status !== "tracking" ? distanceOk : undefined },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-3">
              <StatusDot ok={pose.status === "tracking" ? ok : undefined} />
              <span className="text-sm font-semibold text-white/80">{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onReady}
          disabled={!allGood || pose.status !== "tracking"}
          className="w-full py-4 rounded-2xl font-black text-sm uppercase bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          Looks Good →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/trance/calibration/steps/CameraSetupStep.tsx
git commit -m "feat(trance): add CameraSetupStep (calibration step 1)"
```

---

### Task 8: Step 2 — LevelQuizStep

**Files:**
- Create: `src/trance/calibration/steps/LevelQuizStep.tsx`

- [ ] **Step 1: Create the component**

Create `src/trance/calibration/steps/LevelQuizStep.tsx`:

```tsx
import React from "react";
import { cn } from "../../components/primitives";
import type { CalibrationLevel } from "../../types";

interface LevelQuizStepProps {
  onConfirm: (level: CalibrationLevel) => void;
}

const LEVELS: { value: CalibrationLevel; label: string; description: string; accent: string }[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "Still learning timing, steps, and control",
    accent: "border-sky-400/40 bg-sky-500/10",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Can follow choreography with some practice",
    accent: "border-fuchsia-400/50 bg-fuchsia-500/15",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Pick up movement fast, want a challenge",
    accent: "border-orange-400/40 bg-orange-500/10",
  },
];

export function LevelQuizStep({ onConfirm }: LevelQuizStepProps) {
  const [selected, setSelected] = React.useState<CalibrationLevel | null>(null);

  return (
    <div className="flex flex-col min-h-screen px-5 py-8 gap-6">
      <div>
        <div className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest mb-1">
          Step 2 of 4
        </div>
        <h2 className="text-xl font-black text-white uppercase leading-tight">
          Where are you<br />starting?
        </h2>
        <p className="text-xs text-white/50 mt-1">
          We'll verify with a quick movement check.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {LEVELS.map((level) => {
          const isSelected = selected === level.value;
          return (
            <button
              key={level.value}
              onClick={() => setSelected(level.value)}
              className={cn(
                "w-full rounded-2xl border p-4 text-left transition-all",
                isSelected
                  ? `${level.accent} border-2`
                  : "border-white/10 bg-white/[0.03]",
              )}
            >
              <div className="font-black text-white uppercase text-sm">
                {level.label}
                {isSelected && " ✓"}
              </div>
              <div className="text-xs text-white/50 mt-0.5">{level.description}</div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => selected && onConfirm(selected)}
        disabled={!selected}
        className="mt-auto w-full py-4 rounded-2xl font-black text-sm uppercase bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
      >
        Next: Quick Move Test →
      </button>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/trance/calibration/steps/LevelQuizStep.tsx
git commit -m "feat(trance): add LevelQuizStep (calibration step 2)"
```

---

### Task 9: Step 3 — MoveTestStep

**Files:**
- Create: `src/trance/calibration/steps/MoveTestStep.tsx`

- [ ] **Step 1: Create the component**

Create `src/trance/calibration/steps/MoveTestStep.tsx`:

```tsx
import React from "react";
import { PoseCameraCanvas } from "../../components/PoseCameraCanvas";
import type { UseTrancePoseSession } from "../../hooks/useTrancePoseSession";
import type { MoveFrameData } from "../useCalibrationScoring";
import type { PoseConfidenceReport } from "../../types";

export interface MoveConfig {
  name: string;
  description: string;
  counts: string;
  moveIndex: number; // 0, 1, or 2
}

interface MoveTestStepProps {
  pose: UseTrancePoseSession;
  move: MoveConfig;
  onRecordFrame: (data: MoveFrameData) => void;
  onComplete: () => void;
}

type Phase = "preview" | "countdown" | "scoring" | "done";

const PREVIEW_MS = 3000;
const COUNTDOWN_MS = 3000;
const SCORING_MS = 8000;

function confidenceToFrameData(confidence: PoseConfidenceReport | null): MoveFrameData {
  return {
    bodyConfidence: confidence?.bodyConfidence ?? 0,
    visibleRatio: confidence?.visibleRatio ?? 0,
    lightingOk: confidence?.lightingOk ?? false,
    fullBodyInFrame: confidence?.fullBodyInFrame ?? false,
  };
}

export function MoveTestStep({ pose, move, onRecordFrame, onComplete }: MoveTestStepProps) {
  const [phase, setPhase] = React.useState<Phase>("preview");
  const [countdown, setCountdown] = React.useState(3);
  const [elapsed, setElapsed] = React.useState(0);
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Preview phase timer
  React.useEffect(() => {
    if (phase !== "preview") return;
    const t = setTimeout(() => setPhase("countdown"), PREVIEW_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Countdown phase
  React.useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("scoring");
      setElapsed(0);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Scoring phase: tick elapsed and record frames from pose.confidence
  React.useEffect(() => {
    if (phase !== "scoring") return;
    const interval = setInterval(() => {
      setElapsed((e) => {
        const next = e + 80;
        if (next >= SCORING_MS) {
          clearInterval(interval);
          setPhase("done");
          return SCORING_MS;
        }
        return next;
      });
      onRecordFrame(confidenceToFrameData(pose.confidence));
    }, 80);
    return () => clearInterval(interval);
  }, [phase, pose.confidence, onRecordFrame]);

  // Auto-advance when done
  React.useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => onCompleteRef.current(), 500);
    return () => clearTimeout(t);
  }, [phase]);

  const progress = phase === "scoring" ? (elapsed / SCORING_MS) * 100 : 0;
  const isScoringOrDone = phase === "scoring" || phase === "done";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Camera feed during scoring */}
      {isScoringOrDone ? (
        <div className="flex-1 relative">
          <PoseCameraCanvas pose={pose} className="min-h-[50vh]" />
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest">
              Move {move.moveIndex + 1} of 3
            </div>
            <div className="text-xs font-black text-white">
              {Math.max(0, Math.ceil((SCORING_MS - elapsed) / 1000))}s
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#0f0720] to-[#0a0012]">
          {phase === "countdown" ? (
            <div className="text-8xl font-black text-white animate-pulse">
              {countdown === 0 ? "Go!" : countdown}
            </div>
          ) : (
            <>
              <div className="text-6xl opacity-60">🕺</div>
              <div className="text-center px-6">
                <div className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest mb-1">
                  Move {move.moveIndex + 1} of 3 · Preview
                </div>
                <div className="text-lg font-black text-white uppercase">{move.name}</div>
                <div className="text-xs text-white/50 mt-1">
                  {move.description} · {move.counts}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Progress bar during scoring */}
      {isScoringOrDone && (
        <div className="px-5 py-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white/60 uppercase">
            <span>{move.name}</span>
            <span>{move.counts}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/trance/calibration/steps/MoveTestStep.tsx
git commit -m "feat(trance): add MoveTestStep (calibration step 3)"
```

---

### Task 10: Step 4 — ResultStep

**Files:**
- Create: `src/trance/calibration/steps/ResultStep.tsx`

- [ ] **Step 1: Create the component**

Create `src/trance/calibration/steps/ResultStep.tsx`:

```tsx
import React from "react";
import type { CalibrationProfile } from "../../types";

interface ResultStepProps {
  result: Omit<CalibrationProfile, "completed" | "version" | "completedAt" | "deviceType">;
  onStartPractice: () => void;
  saving: boolean;
}

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  beginner: "Sessions will build your fundamentals at a comfortable pace.",
  intermediate: "Sessions will challenge you while keeping movement clean.",
  advanced: "Sessions will push your timing, range, and precision.",
};

function qualitativeLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Good";
  return "Developing";
}

function qualitativeColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-300";
  return "text-white/50";
}

export function ResultStep({ result, onStartPractice, saving }: ResultStepProps) {
  const { assignedLevel, scores } = result;

  const metrics: { label: string; score: number }[] = [
    { label: "Timing", score: scores.timing },
    { label: "Body Control", score: scores.bodyControl },
    { label: "Range", score: scores.range },
    { label: "Camera", score: scores.camera },
  ];

  return (
    <div className="flex flex-col min-h-screen px-5 py-8 gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center shadow-[0_0_32px_-4px_rgba(16,185,129,0.6)] text-4xl">
          ✓
        </div>
        <div>
          <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">
            You're calibrated
          </div>
          <h2 className="text-2xl font-black text-white uppercase">
            You're {assignedLevel.charAt(0).toUpperCase() + assignedLevel.slice(1)}
          </h2>
          <p className="text-xs text-white/50 mt-1 max-w-xs">
            {LEVEL_DESCRIPTIONS[assignedLevel]}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/10">
        {metrics.map(({ label, score }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-semibold text-white/70">{label}</span>
            <span className={`text-sm font-black ${qualitativeColor(score)}`}>
              {qualitativeLabel(score)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-3">
        <button
          onClick={onStartPractice}
          disabled={saving}
          className="w-full py-4 rounded-2xl font-black text-sm uppercase bg-gradient-to-r from-emerald-600 to-teal-700 text-white disabled:opacity-60 transition-opacity"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Saving…
            </span>
          ) : (
            "Start Practice →"
          )}
        </button>
        <p className="text-center text-[10px] text-white/30">
          You can recalibrate anytime from your profile.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/trance/calibration/steps/ResultStep.tsx
git commit -m "feat(trance): add ResultStep (calibration step 4)"
```

---

### Task 11: CalibrationOverlay

**Files:**
- Create: `src/trance/calibration/CalibrationOverlay.tsx`

- [ ] **Step 1: Create the component**

Create `src/trance/calibration/CalibrationOverlay.tsx`:

```tsx
import React from "react";
import { useAuth } from "../auth/AuthContext";
import { useTrancePoseSession } from "../hooks/useTrancePoseSession";
import { tranceProfileService } from "../services/tranceProfileService";
import { useCalibrationScoring } from "./useCalibrationScoring";
import { CameraSetupStep } from "./steps/CameraSetupStep";
import { LevelQuizStep } from "./steps/LevelQuizStep";
import { MoveTestStep, type MoveConfig } from "./steps/MoveTestStep";
import { ResultStep } from "./steps/ResultStep";
import type { CalibrationLevel, CalibrationProfile } from "../types";

interface CalibrationOverlayProps {
  onComplete: () => void;
}

type CalibrationStep = 1 | 2 | 3 | 4;

const MOVES: MoveConfig[] = [
  { name: "Step Touch", description: "Lateral weight shift", counts: "8 counts", moveIndex: 0 },
  { name: "Arm + Body Wave", description: "Full-body articulation", counts: "8 counts", moveIndex: 1 },
  { name: "Direction Change", description: "Quarter-turn with rebound", counts: "8 counts", moveIndex: 2 },
];

export function CalibrationOverlay({ onComplete }: CalibrationOverlayProps) {
  const { effectiveProfile } = useAuth();
  const pose = useTrancePoseSession("Practice");
  const { recordFrame, commitMove, computeFinalResult } = useCalibrationScoring();

  const [step, setStep] = React.useState<CalibrationStep>(1);
  const [selectedLevel, setSelectedLevel] = React.useState<CalibrationLevel | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = React.useState(0);
  const [finalResult, setFinalResult] = React.useState<
    Omit<CalibrationProfile, "completed" | "version" | "completedAt" | "deviceType"> | null
  >(null);
  const [saving, setSaving] = React.useState(false);

  const handleCameraReady = () => setStep(2);

  const handleLevelConfirmed = (level: CalibrationLevel) => {
    setSelectedLevel(level);
    setStep(3);
  };

  const handleMoveComplete = () => {
    commitMove();
    if (currentMoveIndex < MOVES.length - 1) {
      setCurrentMoveIndex((i) => i + 1);
    } else {
      const result = computeFinalResult(selectedLevel!);
      setFinalResult(result);
      setStep(4);
    }
  };

  const handleStartPractice = async () => {
    if (!finalResult || saving) return;
    setSaving(true);
    try {
      const profile: CalibrationProfile = {
        completed: true,
        version: 1,
        completedAt: new Date().toISOString(),
        deviceType: "mobile",
        ...finalResult,
      };
      await tranceProfileService.saveCalibrationProfile(effectiveProfile.id, profile);
      pose.stop();
      onComplete();
    } catch (err) {
      console.error("Failed to save calibration profile:", err);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0012] overflow-y-auto">
      {step === 1 && <CameraSetupStep pose={pose} onReady={handleCameraReady} />}
      {step === 2 && <LevelQuizStep onConfirm={handleLevelConfirmed} />}
      {step === 3 && (
        <MoveTestStep
          key={currentMoveIndex}
          pose={pose}
          move={MOVES[currentMoveIndex]}
          onRecordFrame={recordFrame}
          onComplete={handleMoveComplete}
        />
      )}
      {step === 4 && finalResult && (
        <ResultStep
          result={finalResult}
          onStartPractice={handleStartPractice}
          saving={saving}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/trance/calibration/CalibrationOverlay.tsx
git commit -m "feat(trance): add CalibrationOverlay orchestrating 4-step calibration flow"
```

---

### Task 12: CalibrationGate

**Files:**
- Create: `src/trance/calibration/CalibrationGate.tsx`

- [ ] **Step 1: Create the component**

Create `src/trance/calibration/CalibrationGate.tsx`:

```tsx
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, useLocation, useParams } from "../hooks/router-compat";
import { TranceShell } from "../components/shell";
import { tranceProfileService } from "../services/tranceProfileService";
import { CalibrationOverlay } from "./CalibrationOverlay";
import { QRMobileHandoffGate } from "./QRMobileHandoffGate";
import { decodeHandoffToken, isHandoffTokenExpired } from "./handoffToken";
import type { CalibrationProfile } from "../types";

interface CalibrationGateProps {
  children: React.ReactNode;
}

export function CalibrationGate({ children }: CalibrationGateProps) {
  const isMobile = useIsMobile();
  const { isAuthed, loading: authLoading, effectiveProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { routineId = "" } = useParams<{ routineId: string }>();

  const [calibration, setCalibration] = React.useState<CalibrationProfile | null | undefined>(
    undefined, // undefined = still loading
  );
  const [calibrated, setCalibrated] = React.useState(false);
  const [tokenExpired, setTokenExpired] = React.useState(false);

  // Check handoff token expiry on first render
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const handoff = params.get("handoff");
    if (!handoff) return;
    const token = decodeHandoffToken(handoff);
    if (!token || isHandoffTokenExpired(token)) {
      setTokenExpired(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect unauthenticated mobile users to login
  React.useEffect(() => {
    if (!isMobile || authLoading) return;
    if (!isAuthed) {
      const redirectPath = `${location.pathname}${location.search}`;
      navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`, { replace: true });
    }
  }, [isMobile, isAuthed, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load calibration profile for authenticated mobile users
  React.useEffect(() => {
    if (!isMobile || !isAuthed || authLoading || calibrated) return;
    let active = true;
    async function load() {
      try {
        const profile = await tranceProfileService.getCalibrationProfile(effectiveProfile.id);
        if (active) setCalibration(profile);
      } catch {
        if (active) setCalibration(null);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [isMobile, isAuthed, authLoading, calibrated, effectiveProfile.id]);

  const handleCalibrationComplete = () => {
    setCalibrated(true);
  };

  // 1. Desktop: QR handoff gate
  if (!isMobile) {
    return <QRMobileHandoffGate routineId={routineId} />;
  }

  // 2. Mobile: expired handoff token
  if (tokenExpired) {
    return (
      <TranceShell hideNav>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="text-4xl">⏱</div>
          <h2 className="text-xl font-black text-white uppercase">QR Code Expired</h2>
          <p className="text-sm text-white/50 max-w-xs">
            Ask the person on desktop to refresh the page and scan the new code.
          </p>
        </div>
      </TranceShell>
    );
  }

  // 3. Mobile: auth check loading / redirect pending
  if (authLoading || !isAuthed) {
    return (
      <TranceShell hideNav>
        <div className="min-h-screen grid place-items-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-fuchsia-500 border-white/10 animate-spin mx-auto mb-4" />
            <div className="text-xs text-white/50 uppercase tracking-widest">Loading…</div>
          </div>
        </div>
      </TranceShell>
    );
  }

  // 4. Mobile: calibration profile loading
  if (calibration === undefined) {
    return (
      <TranceShell hideNav>
        <div className="min-h-screen grid place-items-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-fuchsia-500 border-white/10 animate-spin mx-auto mb-4" />
            <div className="text-xs text-white/50 uppercase tracking-widest">Loading…</div>
          </div>
        </div>
      </TranceShell>
    );
  }

  // 5. Mobile: uncalibrated — show overlay
  if (!calibrated && calibration === null) {
    return <CalibrationOverlay onComplete={handleCalibrationComplete} />;
  }

  // 6. Mobile: calibrated — render practice session
  return <>{children}</>;
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/trance/calibration/CalibrationGate.tsx
git commit -m "feat(trance): add CalibrationGate — device/auth/calibration gating for practice sessions"
```

---

### Task 13: Wire up practice route

**Files:**
- Modify: `src/routes/trance.session.$routineId.practice.tsx`

- [ ] **Step 1: Update the route file**

Replace the entire contents of `src/routes/trance.session.$routineId.practice.tsx` with:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { CalibrationGate } from "@/trance/calibration/CalibrationGate";
import LearnModeScreen from "@/trance/screens/LearnModeScreen";

export const Route = createFileRoute("/trance/session/$routineId/practice")({
  component: PracticeRoute,
});

function PracticeRoute() {
  return (
    <CalibrationGate>
      <LearnModeScreen />
    </CalibrationGate>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Structural test — verify route wraps gate**

Create `src/routes/-tranceCalibrationGate.test.ts`:

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const practiceRoute = readFileSync(
  new URL("./trance.session.$routineId.practice.tsx", import.meta.url),
  "utf8",
);

const calibrationGate = readFileSync(
  new URL("../trance/calibration/CalibrationGate.tsx", import.meta.url),
  "utf8",
);

test("practice route wraps LearnModeScreen in CalibrationGate", () => {
  assert.match(practiceRoute, /import\s+\{\s*CalibrationGate\s*\}\s+from/);
  assert.match(practiceRoute, /import\s+LearnModeScreen\s+from/);
  assert.match(practiceRoute, /<CalibrationGate>/);
  assert.match(practiceRoute, /<LearnModeScreen\s*\/>/);
  assert.doesNotMatch(practiceRoute, /component:\s*LearnModeScreen/);
});

test("CalibrationGate renders QRMobileHandoffGate for non-mobile", () => {
  assert.match(calibrationGate, /import\s+\{\s*QRMobileHandoffGate\s*\}/);
  assert.match(calibrationGate, /!isMobile/);
  assert.match(calibrationGate, /<QRMobileHandoffGate\s+routineId=\{routineId\}\s*\/>/);
});

test("CalibrationGate checks isAuthed not identity.authUserId", () => {
  assert.match(calibrationGate, /isAuthed/);
  assert.doesNotMatch(calibrationGate, /authUserId/);
});

test("CalibrationGate redirects to /login on unauthenticated mobile", () => {
  assert.match(calibrationGate, /\/login\?redirect=/);
  assert.match(calibrationGate, /encodeURIComponent/);
});

test("CalibrationGate checks handoff token expiry", () => {
  assert.match(calibrationGate, /import\s+\{\s*decodeHandoffToken.*isHandoffTokenExpired/);
  assert.match(calibrationGate, /isHandoffTokenExpired/);
  assert.match(calibrationGate, /tokenExpired/);
});
```

- [ ] **Step 4: Run structural test**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx vite-node src/routes/-tranceCalibrationGate.test.ts 2>&1
```

Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/routes/trance.session.$routineId.practice.tsx src/routes/-tranceCalibrationGate.test.ts
git commit -m "feat(trance): wire CalibrationGate into practice route + structural tests"
```

---

### Task 14: ProfileScreen — Reset Trance Calibration

**Files:**
- Modify: `src/trance/screens/ProfileScreen.tsx`

- [ ] **Step 1: Add imports**

In `src/trance/screens/ProfileScreen.tsx`, add `RotateCcw` to the lucide import:

```tsx
import {
  Crown,
  Flame,
  Trophy,
  Zap,
  ChevronRight,
  Heart,
  Star,
  Globe,
  ArrowUp,
  Share2,
  Settings,
  RotateCcw,
} from "lucide-react";
```

Add import for profile service and calibration type at the top:

```tsx
import { tranceProfileService } from "../services/tranceProfileService";
import type { CalibrationProfile } from "../types";
```

- [ ] **Step 2: Add state for calibration profile**

Inside `ProfileScreen`, add after the existing state declarations:

```tsx
const [calibrationProfile, setCalibrationProfile] = React.useState<CalibrationProfile | null | undefined>(undefined);
const [clearingCalibration, setClearingCalibration] = React.useState(false);
```

- [ ] **Step 3: Load calibration profile in existing useEffect or a new one**

After the `loadDbData` useEffect, add:

```tsx
React.useEffect(() => {
  if (!dancer?.id || !isAuthed) return;
  let active = true;
  tranceProfileService
    .getCalibrationProfile(dancer.id)
    .then((p) => {
      if (active) setCalibrationProfile(p);
    })
    .catch(() => {
      if (active) setCalibrationProfile(null);
    });
  return () => {
    active = false;
  };
}, [dancer?.id, isAuthed]);
```

- [ ] **Step 4: Add reset handler**

Inside `ProfileScreen`, add before the `return`:

```tsx
const handleResetCalibration = async () => {
  if (!dancer?.id || clearingCalibration) return;
  const confirmed = window.confirm(
    "This will run you through calibration again next time you practice.",
  );
  if (!confirmed) return;
  setClearingCalibration(true);
  try {
    await tranceProfileService.clearCalibrationProfile(dancer.id);
    setCalibrationProfile(null);
  } catch (err) {
    console.error("Failed to clear calibration profile:", err);
  } finally {
    setClearingCalibration(false);
  }
};
```

- [ ] **Step 5: Add the reset UI section**

In `ProfileScreen`'s JSX, directly before the closing `</TranceShell>` tag (after the "Entry points" grid), add:

```tsx
{/* Calibration reset */}
{isAuthed && calibrationProfile && (
  <div className="mt-4 mb-6">
    <TranceGlassCard className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black text-white uppercase">Trance Calibration</div>
          <div className="text-[10px] text-white/50 mt-0.5">
            {calibrationProfile.assignedLevel.charAt(0).toUpperCase() +
              calibrationProfile.assignedLevel.slice(1)}{" "}
            · Calibrated{" "}
            {new Date(calibrationProfile.completedAt).toLocaleDateString()}
          </div>
        </div>
        <button
          onClick={handleResetCalibration}
          disabled={clearingCalibration}
          className="flex items-center gap-1.5 text-[10px] font-black text-fuchsia-400 uppercase disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {clearingCalibration ? "Resetting…" : "Reset"}
        </button>
      </div>
    </TranceGlassCard>
  </div>
)}
```

- [ ] **Step 6: TypeScript check**

```bash
cd trey-tv-network-codex-tradio-pass12-distribution-desk && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 7: Commit**

```bash
git add src/trance/screens/ProfileScreen.tsx
git commit -m "feat(trance): add Reset Trance Calibration action to ProfileScreen"
```

---

## Self-review

**Spec coverage check:**
- ✅ Mobile → CalibrationGate → CalibrationOverlay (4 steps) → Practice (Tasks 7–11, 12, 13)
- ✅ Desktop → QRMobileHandoffGate with QR code + handoff token + expiry (Tasks 6, 3)
- ✅ Mobile auth check + login redirect (Task 12, CalibrationGate)
- ✅ Handoff token: routineId, mode, exp, 15-min expiry, URL-safe base64 (Task 3)
- ✅ Expired token renders expiry screen on mobile (Task 12)
- ✅ CalibrationProfile versioned type with all fields (Task 2)
- ✅ Step 1: camera setup with live status checks (Task 7)
- ✅ Step 2: level quiz, soft signal, single-select (Task 8)
- ✅ Step 3: 3 moves × (preview → countdown → 8s scoring) (Task 9)
- ✅ Step 4: result screen with assigned level, scores, "recalibrate" copy (Task 10)
- ✅ Camera ownership: overlay owns camera, releases on complete, LearnModeScreen mounts after (Task 11)
- ✅ Level adjustment logic (Task 4, `assignCalibrationLevel`)
- ✅ `isAuthed` checked directly, not `authUserId` (Task 12, Task 13 structural test)
- ✅ Profile service: getCalibrationProfile, saveCalibrationProfile, clearCalibrationProfile (Task 5)
- ✅ Supabase column migration comment in service file (Task 5)
- ✅ ProfileScreen: Reset Trance Calibration (visible when calibrated) (Task 14)
- ✅ LearnModeScreen never mounts during any blocked state (CalibrationGate renders `<>{children}</>` only in branch 6)
- ✅ react-qr-code installed (Task 1)

**No placeholders found.**

**Type consistency check:**
- `CalibrationLevel`, `CalibrationProfile`, `HandoffToken` defined in Task 2, used in Tasks 3, 4, 5, 10, 11, 12
- `MoveFrameData`, `MoveResult` defined in `useCalibrationScoring.ts` Task 4, imported in `MoveTestStep` Task 9 and `CalibrationOverlay` Task 11
- `MoveConfig` defined and exported in `MoveTestStep.tsx` Task 9, imported in `CalibrationOverlay` Task 11
- `recordFrame` returns `void`, `commitMove` returns `MoveResult`, `computeFinalResult` returns the Omit type — all consistent between Task 4 and Task 11
- `getCalibrationProfile` / `saveCalibrationProfile` / `clearCalibrationProfile` defined Task 5, called in Tasks 11, 12, 14
