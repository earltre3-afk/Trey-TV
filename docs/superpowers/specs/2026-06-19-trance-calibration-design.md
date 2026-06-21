# Trance Calibration Overlay — Design Spec

**Date:** 2026-06-19  
**Scope:** Phase 1 only. Mobile-first calibration gate + desktop QR handoff gate before practice sessions. No new routes, no practice session redesign.

---

## Overview

Trance movement tracking is mobile-first. The practice session gate enforces this at the device level.

**Mobile:** When a user navigates to a Trance practice session for the first time, a full-screen `CalibrationOverlay` runs before `LearnModeScreen` becomes active. It verifies camera readiness, captures a self-reported skill level, and runs three short physical movement tests. The result is saved as a versioned `calibrationProfile` on the user's profile. Subsequent practice sessions bypass calibration entirely unless the user resets it from their profile.

**Desktop/non-mobile:** A blocking `QRMobileHandoffGate` screen is shown instead of the practice session. It instructs the user to scan a QR code with their phone to continue. The desktop does not run calibration and does not start the practice session — it waits on that screen.

The corrected flow is:

```
Mobile  → CalibrationGate → [CalibrationOverlay if first time] → Practice Session
Desktop → CalibrationGate → QRMobileHandoffGate (blocking, no session)
            ↓
        Mobile scans QR → Auth check → [CalibrationGate if needed] → Practice Session
```

**Phase 2 (separate spec):** Redesign the practice session UI with a mobile-optimized full-bleed camera layout, minimal HUD, and cue strip. Phase 1 must not touch session layout.

---

## Architecture

### Entry point

`src/routes/trance.session.$routineId.practice.tsx` is changed from rendering `<LearnModeScreen />` directly to wrapping it in `<CalibrationGate>`:

```tsx
// trance.session.$routineId.practice.tsx
import { createFileRoute } from "@tanstack/react-router";
import { CalibrationGate } from "@/trance/calibration/CalibrationGate";
import LearnModeScreen from "@/trance/screens/LearnModeScreen";

export const Route = createFileRoute("/trance/session/$routineId/practice")({
  component: () => (
    <CalibrationGate>
      <LearnModeScreen />
    </CalibrationGate>
  ),
});
```

### CalibrationGate

`src/trance/calibration/CalibrationGate.tsx`

Reads device type, auth state, and calibration profile. Branches into one of three outcomes — in this order:

1. **Non-mobile device detected** → renders `<QRMobileHandoffGate routineId={routineId} />`. `children` (LearnModeScreen) is never mounted. Practice does not start.

2. **Mobile, loading** → renders a centered spinner (same pattern as `LearnModeScreen`'s loading state: `TranceShell hideNav` + animated border ring + label). This covers the brief profile read.

3. **Mobile, not authenticated** → redirects to the Trey TV login route with a `?redirect=` param pointing back to the current practice URL (including any `?handoff=` param). `LearnModeScreen` is not mounted.

4. **Mobile, authenticated, not yet calibrated** → renders `<CalibrationOverlay onComplete={handleComplete} />` full-screen. `children` is NOT mounted.

5. **Mobile, authenticated, already calibrated** → renders `children` (LearnModeScreen mounts and runs normally).

On `handleComplete`: sets local `calibrated = true`, unmounts the overlay, mounts LearnModeScreen.

`LearnModeScreen` does not mount in any blocked state (non-mobile, unauthenticated, uncalibrated). No session attempt is created, no countdown starts, no cues render, and no scoring begins while any gate is active.

### Desktop QR Handoff Gate

`src/trance/calibration/QRMobileHandoffGate.tsx`

Displayed on desktop/non-mobile as a full-screen blocking UI. It renders:

- Headline: **"Continue Practice on Mobile"**
- Subtext: *"Trance uses your phone's camera for movement tracking. Scan the code below with your phone to continue."*
- QR code (rendered with `react-qr-code`, a new dependency)
- URL encoded in the QR:
  ```
  https://tv.treytrizzy.com/trance/session/${routineId}/practice?handoff=${handoffToken}
  ```
- Soft footer: *"Make sure you're logged in on your phone."*

#### Handoff token

The `handoffToken` is a URL-safe base64 string encoding:

```ts
interface HandoffToken {
  routineId: string;
  mode: "practice";
  exp: number; // Unix timestamp ms — Date.now() + 15 minutes
}
```

Generated client-side when `QRMobileHandoffGate` mounts. No server round-trip or signing key required for Phase 1. The token provides the expiry window for UX clarity.

When the mobile device loads the URL, `CalibrationGate` decodes the `handoff` param. If `exp < Date.now()`, it renders an expiry message ("This QR code has expired. Ask the person on desktop to refresh the page.") and does not proceed. If valid, continues through the normal mobile gate flow.

The QR code is regenerated (and a new token issued) when the desktop user refreshes the page.

#### Auth enforcement on mobile after QR scan

When the mobile device hits the practice URL (whether via QR or directly):
- `CalibrationGate` checks `isAuthed` from `useTranceIdentity`.
- If not authenticated → redirects to the Trey TV login route with `?redirect=/trance/session/${routineId}/practice?handoff=${originalToken}`.
- After login, the redirect returns them to the practice route with the original token. If the token is still valid, proceeds to CalibrationOverlay or directly to practice.

`useTranceIdentity` currently returns a "guest" identity for unauthenticated users rather than null — `CalibrationGate` must check `isAuthed` directly (not `identity?.authUserId`), since `authUserId` is `"guest"` for unauthenticated users.

### Preloading

Routine data and the pose model preload through the calibration itself:
- `CalibrationOverlay` calls `useTrancePoseSession("Practice")` and calls `pose.start()` at Step 1. This warms up the MediaPipe model and acquires the camera stream.
- On calibration completion, the overlay calls `pose.stop()` which releases `getUserMedia` cleanly. `LearnModeScreen` then mounts and requests camera access fresh — there is no shared stream between the two.
- Routine data can be pre-fetched via a TanStack Router `loader` on the practice route in a future pass. For Phase 1 it loads normally after `LearnModeScreen` mounts.

### No new route files

The overlay and QR gate are React components, not route files. No new TanStack Router files. The `?handoff=` query param is read via `useSearch()` inside `CalibrationGate` — no route param schema change needed since TanStack Router passes unknown search params through.

---

## CalibrationProfile type

Add to `src/trance/types/index.ts`:

```ts
export type CalibrationLevel = "beginner" | "intermediate" | "advanced";
export type CalibrationTrackingQuality = "poor" | "ok" | "good" | "excellent";

export interface CalibrationProfile {
  completed: true;
  version: 1;
  completedAt: string;        // ISO 8601
  deviceType: "mobile";       // Phase 1 is mobile-only
  selectedLevel: CalibrationLevel;   // user's self-report
  assignedLevel: CalibrationLevel;   // move test result (may differ)
  scores: {
    timing: number;       // 0–100
    bodyControl: number;  // 0–100
    range: number;        // 0–100
    camera: number;       // 0–100
  };
  trackingQuality: CalibrationTrackingQuality;
}
```

Add as optional field on `DancerProfile`:

```ts
export interface DancerProfile extends TranceUser {
  // ... existing fields ...
  calibrationProfile?: CalibrationProfile;
}
```

### Persistence

`tranceProfileService` gets two new methods:

```ts
getCalibrationProfile(userId: string): Promise<CalibrationProfile | null>
saveCalibrationProfile(userId: string, profile: CalibrationProfile): Promise<void>
```

In fixture mode both are no-ops (returns `null` / logs). In production they read/write a `calibration_profile` JSONB column on `trance_profiles`. A Supabase migration adds this column as nullable JSONB.

`CalibrationGate` calls `getCalibrationProfile`. `CalibrationOverlay` calls `saveCalibrationProfile` before calling `onComplete`.

---

## 4-Step Calibration Flow

All steps run inside `CalibrationOverlay`. Camera is owned by the overlay's `useTrancePoseSession("Practice")` instance throughout. The user cannot dismiss the overlay — they must complete all 4 steps or navigate away from the route entirely.

### Step 1 — Camera Setup

Calls `pose.start()` immediately on mount. While `pose.status` is `"requesting_permission"` or `"camera_ready"`, shows a loading indicator.

Once `status === "tracking"`, displays three live status checks derived from `pose.confidence` and `pose.warnings`:

| Check | Source | Pass condition |
|---|---|---|
| Full body visible | `confidence.fullBodyInFrame` | `true` |
| Lighting OK | `confidence.lightingOk` | `true` |
| Distance OK | absence of `FramingWarning` about distance | no distance warning |

Status dots update in real time (green / amber / red). "Looks Good →" button is enabled only when all three checks pass. If `pose.status === "unavailable"` or `"permission_denied"`, shows an error state with guidance (no retry loop — user must resolve then navigate back).

### Step 2 — Level Quiz

Static UI. Three cards: Beginner, Intermediate, Advanced. Single-select. Default is none — the user must tap one before the "Next: Quick Move Test →" button enables. The selected value is stored as `selectedLevel`. This is a soft signal — Step 3 may adjust it.

### Step 3 — 3-Move Physical Test

Three moves in sequence. Each follows the same sub-flow:

1. **Preview (3s):** Ghost figure animation shows the move. Name and count displayed. No scoring yet.
2. **Countdown (3s):** 3 → 2 → 1 → Go. Pose detection continues but scores not recorded.
3. **Active scoring (8s):** Live skeleton canvas shown. Pose engine records per-frame `confidence` readings. Score accumulates in real time via a progress bar.
4. **Transition:** Automatic, no tap required.

Moves in order:
1. Step Touch — lateral weight shift, 8-count
2. Arm + Body Wave — full-body articulation, 8-count  
3. Direction Change — quarter-turn with rebound, 8-count

Scoring per move derives from `pose.confidence` sampled at ~12 fps during the active window:
- **Timing:** percentage of frames where confidence is stable (not flickering), interpreted as body control through the beat
- **Body control:** mean `bodyConfidence` across active frames
- **Range:** mean `visibleRatio` (proxy for extension and coverage)
- **Camera:** `lightingOk && fullBodyInFrame` sustained across active window → maps to tracking quality enum

Final scores are the average of all three moves per metric.

**Level adjustment:** Applied after all three moves complete.
- `selectedLevel === "advanced"` + mean `bodyConfidence < 0.55` → `assignedLevel = "intermediate"`
- `selectedLevel === "beginner"` + mean `bodyConfidence > 0.75` → `assignedLevel = "intermediate"`
- `selectedLevel === "intermediate"` → always `assignedLevel = "intermediate"` (no adjustment)
- All other combinations → `assignedLevel === selectedLevel`

The adjustment only shifts one level in either direction. A beginner will never be assigned "advanced" in a single pass.

`trackingQuality` mapping:
- `camera < 50` → `"poor"`
- `50–69` → `"ok"`
- `70–84` → `"good"`
- `85+` → `"excellent"`

### Step 4 — Result Screen

Shows:
- Large badge: ✓ with glow in green
- Assigned level (headline)
- One-line description calibrated to the level
- Score breakdown: Timing / Body Control / Range / Camera — each shown as a label + qualitative value (Strong / Good / Developing)
- Divider
- "Start Practice →" CTA — calls `saveCalibrationProfile` then `onComplete`
- Below the CTA, soft copy: *"You can recalibrate anytime from your profile."*

The "Reset Trance Calibration" action in the profile/settings screen (added in Phase 1) calls `tranceProfileService.clearCalibrationProfile(userId)` to null out the column. Next practice session will show calibration again.

---

## Camera ownership contract

| Phase | Owner | What it does |
|---|---|---|
| Calibration active | `CalibrationOverlay` via `useTrancePoseSession("Practice")` | Full camera + pose tracking. Passive analysis only — no routine scoring. |
| Calibration complete | Overlay calls `pose.stop()` → stream released | Camera off briefly |
| Practice session mounts | `LearnModeScreen` via `useTrancePoseSession("Practice")` | New `getUserMedia` call. Camera on again for session. |

`stop()` in `useTrancePoseSession` calls `stream.getTracks().forEach(t => t.stop())` and nulls `videoRef.srcObject`. There is no shared stream reference between the two consumers. This is the correct handoff pattern.

---

## Profile screen changes

One new action added to `ProfileScreen.tsx` in Phase 1:

- Label: **Reset Trance Calibration**
- Visible only when `calibrationProfile` is present on the user's profile
- Tap → confirm dialog ("This will run you through calibration again next time you practice.") → calls `tranceProfileService.clearCalibrationProfile(userId)` → local state update clears the display

No other profile screen changes.

---

## New dependency

`react-qr-code` — SVG-based QR code component for React 19. Used only in `QRMobileHandoffGate`.

```
pnpm add react-qr-code
```

---

## New files

| File | Purpose |
|---|---|
| `src/trance/calibration/CalibrationGate.tsx` | Device detect + auth check + calibration check — gates LearnModeScreen |
| `src/trance/calibration/QRMobileHandoffGate.tsx` | Desktop blocking screen with QR code and handoff token |
| `src/trance/calibration/CalibrationOverlay.tsx` | Full 4-step overlay component (mobile only) |
| `src/trance/calibration/steps/CameraSetupStep.tsx` | Step 1 UI |
| `src/trance/calibration/steps/LevelQuizStep.tsx` | Step 2 UI |
| `src/trance/calibration/steps/MoveTestStep.tsx` | Step 3 — single move component, used 3× |
| `src/trance/calibration/steps/ResultStep.tsx` | Step 4 UI |
| `src/trance/calibration/useCalibrationScoring.ts` | Accumulates per-frame scores during move test, computes final calibration result |
| `src/trance/calibration/handoffToken.ts` | `encodeHandoffToken` / `decodeHandoffToken` / `isHandoffTokenExpired` utilities |

---

## Modified files

| File | Change |
|---|---|
| `src/routes/trance.session.$routineId.practice.tsx` | Wrap `LearnModeScreen` in `<CalibrationGate>` |
| `src/trance/types/index.ts` | Add `CalibrationProfile`, `CalibrationLevel`, `CalibrationTrackingQuality`, `HandoffToken`; add `calibrationProfile?` to `DancerProfile` |
| `src/trance/services/tranceProfileService.ts` | Add `getCalibrationProfile`, `saveCalibrationProfile`, `clearCalibrationProfile` |
| `src/trance/screens/ProfileScreen.tsx` | Add "Reset Trance Calibration" action |

---

## Out of scope for Phase 1

- Practice session layout redesign (full-bleed camera, HUD, cue strip) — Phase 2
- Server-signed handoff tokens (Phase 1 uses client-generated base64 with expiry timestamp)
- Real-time QR scan detection on desktop (desktop stays on the handoff screen — no websocket "scan detected" feedback)
- Calibration from onboarding or first-launch flow
- Calibration affecting routine difficulty recommendations
- Per-routine recalibration
- Calibration for Learn or Performance modes
- Analytics events for calibration funnel
- Server-side migration (Supabase column add is the only backend change)

---

## Phase 2 note

Phase 2 replaces `LearnModeScreen`'s practice layout with a mobile-optimized design: full-bleed camera feed as background, skeleton overlay, score + timer in top corners, and a NOW/NEXT cue strip anchored to the bottom. Phase 2 is a separate spec and does not interact with Phase 1 calibration code except through the same `useTrancePoseSession` hook.
