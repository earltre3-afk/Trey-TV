# Bubble Arc Create Menu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current single-tap → bottom-sheet Create flow with a dual-gesture flow on the `+` button — tap fires the camera into the last-used capture type; press-and-hold blooms a half-circle arc of four neon-glass bubbles (Photo / Video / Story / Reel) above the bottom nav, and sliding-then-releasing on a bubble launches that flow.

**Architecture:** Pure-logic helpers (`last-create-type.ts`, `hover-hit-test.ts`) tested with `node:test`. A `usePressAndHold` React hook handles the timer + pointer-capture lifecycle. A `CreateArcProvider` holds open/hovered state in context, mounted in `__root.tsx`. The `+` button (`CreateWheel.tsx`) owns the pointer gesture and pipes hover state into context; `CreateBubbleArc.tsx` is the purely-presentational visual that reads from context. No React-component tests (the project doesn't have a renderer set up); component-level verification is typecheck + manual smoke.

**Tech Stack:** TanStack Start + Vite + React 19 + TypeScript strict mode. Existing `haptic()` helper in `src/lib/haptics.ts`. Existing `Plus` icon from `lucide-react`. Existing TanStack Router for navigation.

**Spec reference:** [docs/superpowers/specs/2026-06-11-bubble-arc-create-menu-design.md](../specs/2026-06-11-bubble-arc-create-menu-design.md)

**Project root:** `C:/Users/info/trey-tv-network-codex-tradio-pass12-distribution-desk/trey-tv-network-codex-tradio-pass12-distribution-desk` (referenced as `$ROOT` in commands).

---

## File Structure

**New files:**
- `src/lib/last-create-type.ts` — `localStorage` read/write helpers with fallback.
- `src/lib/last-create-type.test.ts` — `node:test` unit tests for above.
- `src/lib/hover-hit-test.ts` — Pure function mapping (pointerX, pointerY, pivotX, pivotY) → `BubbleId | null`.
- `src/lib/hover-hit-test.test.ts` — `node:test` unit tests for the math.
- `src/hooks/use-press-and-hold.ts` — React hook for the 220 ms gesture lifecycle.
- `src/lib/create-arc-context.tsx` — Context + provider exposing `{ isOpen, hoveredId, openArc, closeArc, setHovered }`.
- `src/components/layout/CreateBubbleArc.tsx` — The visual arc — bubble SVGs, glass + neon CSS, bloom/collapse transitions. Purely presentational; reads context.

**Modified files:**
- `src/components/layout/CreateWheel.tsx` — Replaces current click handler. Owns the pointer gesture, pipes hover into context, fires navigation on release.
- `src/routes/__root.tsx` — Swap `PostSheetProvider` import + usage for `CreateArcProvider`. Swap `<InstagramStylePostSheet …/>` for `<CreateBubbleArc />`.

**Deleted files:**
- `src/components/layout/InstagramStylePostSheet.tsx`
- `src/lib/post-sheet-context.tsx`

---

## Testing notes

The project uses **Node's built-in test runner** (`node:test` + `node:assert/strict`), the same style as `src/lib/trey-i/broadcastCampaignRules.test.ts`. Node 25 (already installed) runs `.ts` directly via `--experimental-strip-types`.

**Run a single test file:**
```
node --experimental-strip-types --no-warnings=ExperimentalWarning --test src/lib/last-create-type.test.ts
```

**Typecheck (verification gate, run before any commit-equivalent step):**
```
./node_modules/.bin/tsc --noEmit
```

Expected: zero output, exit 0.

**Git is not configured in this folder** — "commit" steps below are verification-checkpoints (typecheck pass) instead of `git commit`. If you set up git later, batch the file groups into commits per task.

---

## Task 1: `last-create-type.ts` helper + tests

**Files:**
- Create: `src/lib/last-create-type.ts`
- Create: `src/lib/last-create-type.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/last-create-type.test.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CREATE_TYPES,
  DEFAULT_CREATE_TYPE,
  readLastCreateType,
  writeLastCreateType,
  type CreateType,
} from './last-create-type.ts';

function withMockStorage(fn: () => void) {
  const store = new Map<string, string>();
  const original = globalThis.localStorage;
  // @ts-expect-error — test shim
  globalThis.localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  };
  try {
    fn();
  } finally {
    // @ts-expect-error — restore
    globalThis.localStorage = original;
  }
}

test('CREATE_TYPES lists the four formats', () => {
  assert.deepEqual([...CREATE_TYPES], ['photo', 'video', 'story', 'reel']);
});

test('DEFAULT_CREATE_TYPE is photo', () => {
  assert.equal(DEFAULT_CREATE_TYPE, 'photo');
});

test('readLastCreateType returns default when storage empty', () => {
  withMockStorage(() => {
    assert.equal(readLastCreateType(), 'photo');
  });
});

test('writeLastCreateType + readLastCreateType round-trip', () => {
  withMockStorage(() => {
    writeLastCreateType('video');
    assert.equal(readLastCreateType(), 'video');
    writeLastCreateType('reel');
    assert.equal(readLastCreateType(), 'reel');
  });
});

test('readLastCreateType returns default for invalid stored value', () => {
  withMockStorage(() => {
    localStorage.setItem('treytv.create.lastType', 'BOGUS');
    assert.equal(readLastCreateType(), 'photo');
  });
});

test('readLastCreateType returns default when localStorage throws', () => {
  const original = globalThis.localStorage;
  // @ts-expect-error — test shim that throws
  globalThis.localStorage = {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('blocked'); },
  };
  try {
    assert.equal(readLastCreateType(), 'photo');
  } finally {
    // @ts-expect-error — restore
    globalThis.localStorage = original;
  }
});

test('writeLastCreateType silently no-ops when localStorage throws', () => {
  const original = globalThis.localStorage;
  // @ts-expect-error — test shim that throws
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => { throw new Error('blocked'); },
  };
  try {
    assert.doesNotThrow(() => writeLastCreateType('story'));
  } finally {
    // @ts-expect-error — restore
    globalThis.localStorage = original;
  }
});

test('CreateType union is the four formats', () => {
  const ok: CreateType[] = ['photo', 'video', 'story', 'reel'];
  assert.equal(ok.length, 4);
});
```

- [ ] **Step 2: Run test to verify it fails**

```
node --experimental-strip-types --no-warnings=ExperimentalWarning --test src/lib/last-create-type.test.ts
```

Expected: fail with module-not-found / type errors because the implementation doesn't exist yet.

- [ ] **Step 3: Implement the helper**

Create `src/lib/last-create-type.ts`:

```ts
export const CREATE_TYPES = ['photo', 'video', 'story', 'reel'] as const;
export type CreateType = typeof CREATE_TYPES[number];
export const DEFAULT_CREATE_TYPE: CreateType = 'photo';

const STORAGE_KEY = 'treytv.create.lastType';

function isCreateType(value: unknown): value is CreateType {
  return typeof value === 'string' && (CREATE_TYPES as readonly string[]).includes(value);
}

export function readLastCreateType(): CreateType {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return isCreateType(raw) ? raw : DEFAULT_CREATE_TYPE;
  } catch {
    return DEFAULT_CREATE_TYPE;
  }
}

export function writeLastCreateType(type: CreateType): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, type);
  } catch {
    // localStorage blocked (private mode, quota, etc.) — silently no-op.
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```
node --experimental-strip-types --no-warnings=ExperimentalWarning --test src/lib/last-create-type.test.ts
```

Expected: all 8 tests pass.

- [ ] **Step 5: Typecheck**

```
./node_modules/.bin/tsc --noEmit
```

Expected: zero output, exit 0.

---

## Task 2: `hover-hit-test.ts` pure function + tests

**Files:**
- Create: `src/lib/hover-hit-test.ts`
- Create: `src/lib/hover-hit-test.test.ts`

The arc bubbles sit at angles `-72°, -24°, +24°, +72°` from vertical at radius 110 px from the pivot (center of the `+` button, top of the nav). Spec section 4: bins split at `-48° / 0° / +48°`. Dead-zone radius of 30 px to prevent jitter when pointer is still on/near the `+` button.

- [ ] **Step 1: Write the failing test**

Create `src/lib/hover-hit-test.test.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { computeHoveredBubble } from './hover-hit-test.ts';

// Pivot is at (200, 700) for all these tests — represents the + button center.
const PIVOT_X = 200;
const PIVOT_Y = 700;

test('returns null when pointer is below pivot (dy >= 0)', () => {
  assert.equal(computeHoveredBubble(200, 720, PIVOT_X, PIVOT_Y), null);
  assert.equal(computeHoveredBubble(200, 700, PIVOT_X, PIVOT_Y), null);
});

test('returns null within dead-zone radius (< 30 px from pivot)', () => {
  // 20 px straight up
  assert.equal(computeHoveredBubble(200, 680, PIVOT_X, PIVOT_Y), null);
  // 29 px up + 0 right
  assert.equal(computeHoveredBubble(200, 671, PIVOT_X, PIVOT_Y), null);
});

test('photo bin: angle in [-90, -48) when above pivot beyond dead-zone', () => {
  // straight left + slight up — angle ≈ -90°
  assert.equal(computeHoveredBubble(100, 695, PIVOT_X, PIVOT_Y), 'photo');
  // -72° at radius 100 (well past dead-zone)
  // dx = 100 * sin(-72°) ≈ -95.1, dy = -100 * cos(-72°) ≈ -30.9
  assert.equal(computeHoveredBubble(200 - 95, 700 - 31, PIVOT_X, PIVOT_Y), 'photo');
});

test('video bin: angle in [-48, 0)', () => {
  // -24° at radius 110 → dx ≈ -44.7, dy ≈ -100.5
  assert.equal(computeHoveredBubble(200 - 45, 700 - 100, PIVOT_X, PIVOT_Y), 'video');
  // straight just-above-pivot but well past dead-zone, slightly left
  assert.equal(computeHoveredBubble(190, 600, PIVOT_X, PIVOT_Y), 'video');
});

test('story bin: angle in [0, +48)', () => {
  // +24° at radius 110 → dx ≈ +44.7, dy ≈ -100.5
  assert.equal(computeHoveredBubble(200 + 45, 700 - 100, PIVOT_X, PIVOT_Y), 'story');
  // straight just-above-pivot, slightly right
  assert.equal(computeHoveredBubble(210, 600, PIVOT_X, PIVOT_Y), 'story');
});

test('reel bin: angle in [+48, +90]', () => {
  // +72° at radius 100 → dx ≈ +95.1, dy ≈ -30.9
  assert.equal(computeHoveredBubble(200 + 95, 700 - 31, PIVOT_X, PIVOT_Y), 'reel');
  // straight right + slight up
  assert.equal(computeHoveredBubble(300, 695, PIVOT_X, PIVOT_Y), 'reel');
});

test('boundary at exactly -48° goes to video, not photo', () => {
  // -48° at radius 110 → dx ≈ -81.7, dy ≈ -73.6
  assert.equal(computeHoveredBubble(200 - 82, 700 - 74, PIVOT_X, PIVOT_Y), 'video');
});

test('boundary at exactly 0° goes to story', () => {
  // straight up, well past dead-zone
  assert.equal(computeHoveredBubble(200, 600, PIVOT_X, PIVOT_Y), 'story');
});

test('boundary at exactly +48° goes to reel', () => {
  // +48° at radius 110 → dx ≈ +81.7, dy ≈ -73.6
  assert.equal(computeHoveredBubble(200 + 82, 700 - 74, PIVOT_X, PIVOT_Y), 'reel');
});
```

- [ ] **Step 2: Run test to verify it fails**

```
node --experimental-strip-types --no-warnings=ExperimentalWarning --test src/lib/hover-hit-test.test.ts
```

Expected: fail with module-not-found.

- [ ] **Step 3: Implement the helper**

Create `src/lib/hover-hit-test.ts`:

```ts
import type { CreateType } from './last-create-type.ts';

export const DEAD_ZONE_RADIUS = 30;

const RAD_TO_DEG = 180 / Math.PI;

/**
 * Map a pointer position to a bubble id (or null) based on its angle from
 * vertical relative to the pivot. Pivot is the center of the + button at the
 * top of the bottom nav.
 *
 * - Pointer below pivot (dy >= 0): null.
 * - Pointer within DEAD_ZONE_RADIUS of pivot: null (prevents jitter on the +).
 * - Else: angle from vertical-up in degrees, binned per design spec section 4.
 */
export function computeHoveredBubble(
  pointerX: number,
  pointerY: number,
  pivotX: number,
  pivotY: number,
): CreateType | null {
  const dx = pointerX - pivotX;
  const dy = pointerY - pivotY;
  if (dy >= 0) return null;
  const distance = Math.hypot(dx, dy);
  if (distance < DEAD_ZONE_RADIUS) return null;
  const angleDeg = Math.atan2(dx, -dy) * RAD_TO_DEG;
  if (angleDeg >= -90 && angleDeg < -48) return 'photo';
  if (angleDeg >= -48 && angleDeg < 0) return 'video';
  if (angleDeg >= 0 && angleDeg < 48) return 'story';
  if (angleDeg >= 48 && angleDeg <= 90) return 'reel';
  return null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```
node --experimental-strip-types --no-warnings=ExperimentalWarning --test src/lib/hover-hit-test.test.ts
```

Expected: all 9 tests pass.

- [ ] **Step 5: Typecheck**

```
./node_modules/.bin/tsc --noEmit
```

Expected: zero output, exit 0.

---

## Task 3: `use-press-and-hold.ts` React hook

**Files:**
- Create: `src/hooks/use-press-and-hold.ts`

The hook detects a 220 ms long-press on a pointer-driven element. It owns the timer and pointer capture; it does NOT manage hover state (that's the caller's responsibility via `onMove`). Keyboard activation is handled separately by the caller (the + button still works on Space/Enter as a "tap").

- [ ] **Step 1: Create the hook**

Create `src/hooks/use-press-and-hold.ts`:

```ts
import { useCallback, useRef } from 'react';

export const HOLD_THRESHOLD_MS = 220;

export interface PressAndHoldHandlers {
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: React.PointerEvent<HTMLElement>) => void;
}

export interface UsePressAndHoldArgs {
  onTap: () => void;
  onHoldStart: () => void;
  onHoldMove: (pointerX: number, pointerY: number) => void;
  onHoldEnd: () => void;
  onHoldCancel: () => void;
}

type Phase = 'idle' | 'pressing' | 'holding';

export function usePressAndHold(args: UsePressAndHoldArgs): PressAndHoldHandlers {
  const phaseRef = useRef<Phase>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  // Latest args in a ref so the handlers don't re-bind on every render.
  const argsRef = useRef(args);
  argsRef.current = args;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (phaseRef.current !== 'idle') return;
    // Only respond to primary button / single-touch.
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    phaseRef.current = 'pressing';
    pointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // older browsers — capture isn't critical, hit-testing still works.
    }
    e.preventDefault();
    timerRef.current = setTimeout(() => {
      if (phaseRef.current === 'pressing') {
        phaseRef.current = 'holding';
        argsRef.current.onHoldStart();
      }
    }, HOLD_THRESHOLD_MS);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (phaseRef.current !== 'holding') return;
    if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
    argsRef.current.onHoldMove(e.clientX, e.clientY);
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
    const phase = phaseRef.current;
    clearTimer();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch { /* noop */ }
    phaseRef.current = 'idle';
    pointerIdRef.current = null;
    if (phase === 'pressing') {
      argsRef.current.onTap();
    } else if (phase === 'holding') {
      argsRef.current.onHoldEnd();
    }
  }, [clearTimer]);

  const onPointerCancel = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
    const phase = phaseRef.current;
    clearTimer();
    phaseRef.current = 'idle';
    pointerIdRef.current = null;
    if (phase === 'holding') {
      argsRef.current.onHoldCancel();
    }
  }, [clearTimer]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
```

- [ ] **Step 2: Typecheck**

```
./node_modules/.bin/tsc --noEmit
```

Expected: zero output, exit 0. (No usage yet — the hook just needs to compile.)

---

## Task 4: `create-arc-context.tsx` provider

**Files:**
- Create: `src/lib/create-arc-context.tsx`

Mirrors the existing `post-sheet-context.tsx` shape so the `__root.tsx` swap is one-for-one. Adds `hoveredId` + `setHovered`.

- [ ] **Step 1: Create the context**

Create `src/lib/create-arc-context.tsx`:

```tsx
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CreateType } from './last-create-type.ts';

interface CreateArcContextValue {
  isOpen: boolean;
  hoveredId: CreateType | null;
  openArc: () => void;
  closeArc: () => void;
  setHovered: (id: CreateType | null) => void;
}

const CreateArcContext = createContext<CreateArcContextValue | null>(null);

export function CreateArcProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<CreateType | null>(null);

  const openArc = useCallback(() => {
    setHoveredId(null);
    setIsOpen(true);
  }, []);
  const closeArc = useCallback(() => {
    setIsOpen(false);
    setHoveredId(null);
  }, []);
  const setHovered = useCallback((id: CreateType | null) => {
    setHoveredId(id);
  }, []);

  const value = useMemo<CreateArcContextValue>(
    () => ({ isOpen, hoveredId, openArc, closeArc, setHovered }),
    [isOpen, hoveredId, openArc, closeArc, setHovered],
  );

  return <CreateArcContext.Provider value={value}>{children}</CreateArcContext.Provider>;
}

export function useCreateArc(): CreateArcContextValue {
  const value = useContext(CreateArcContext);
  if (!value) {
    throw new Error('useCreateArc must be used inside a <CreateArcProvider>.');
  }
  return value;
}
```

- [ ] **Step 2: Typecheck**

```
./node_modules/.bin/tsc --noEmit
```

Expected: zero output, exit 0.

---

## Task 5: `CreateBubbleArc.tsx` — the visual

**Files:**
- Create: `src/components/layout/CreateBubbleArc.tsx`

Purely presentational. Reads `isOpen` and `hoveredId` from `useCreateArc()`. No event handlers — the `+` button (next task) handles all pointer events. The bloom animation is CSS transitions on `transform` + `opacity`.

This is a long file because it embeds the four picture-icon SVGs and the per-bubble palette. It is intentionally one file so the visual lives next to its only consumer.

- [ ] **Step 1: Create the component**

Create `src/components/layout/CreateBubbleArc.tsx`:

```tsx
import { useCreateArc } from '@/lib/create-arc-context';
import type { CreateType } from '@/lib/last-create-type';

const BUBBLES: Array<{ id: CreateType; angle: number; palette: BubblePalette }> = [
  { id: 'photo', angle: -72, palette: { pure: '#00FFFF', bright: 'rgba(0,255,255,0.85)', soft: 'rgba(0,200,255,0.35)' } },
  { id: 'video', angle: -24, palette: { pure: '#FF00B8', bright: 'rgba(255,0,184,0.85)', soft: 'rgba(255,40,180,0.35)' } },
  { id: 'story', angle:  24, palette: { pure: '#B800FF', bright: 'rgba(184,0,255,0.85)', soft: 'rgba(160,80,255,0.40)' } },
  { id: 'reel',  angle:  72, palette: { pure: '#00FF88', bright: 'rgba(0,255,136,0.85)', soft: 'rgba(0,255,150,0.35)' } },
];

interface BubblePalette {
  pure: string;
  bright: string;
  soft: string;
}

const ARC_RADIUS_PX = 110;

export function CreateBubbleArc() {
  const { isOpen, hoveredId } = useCreateArc();

  return (
    <div
      aria-hidden={!isOpen}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 60,
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 220ms ease',
      }}
    >
      {/* Scrim — dims the underlying feed while the arc is open. */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(2,3,15,0.85) 60%, rgba(0,0,8,0.95) 100%)',
          backdropFilter: 'blur(12px) saturate(0.7)',
          WebkitBackdropFilter: 'blur(12px) saturate(0.7)',
        }}
      />

      {/* Horizon glow — bottom-anchored, behind everything. */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 64, height: 240,
          pointerEvents: 'none',
          background: [
            'radial-gradient(40% 80% at 28% 100%, rgba(0,230,255,0.30) 0%, transparent 60%)',
            'radial-gradient(40% 80% at 72% 100%, rgba(255,40,180,0.26) 0%, transparent 60%)',
            'radial-gradient(60% 65% at 50% 100%, rgba(160,80,255,0.22) 0%, transparent 70%)',
          ].join(','),
          filter: 'blur(18px)',
        }}
      />

      {/* Arc pivot — anchored to top of the bottom nav, centered. */}
      <div
        style={{
          position: 'absolute', left: '50%', bottom: 64, width: 0, height: 0,
          transform: 'translateX(0)',
        }}
      >
        {BUBBLES.map((b, idx) => (
          <Bubble
            key={b.id}
            bubble={b}
            isHovered={hoveredId === b.id}
            isOpen={isOpen}
            staggerIndex={idx}
          />
        ))}
      </div>
    </div>
  );
}

function Bubble({
  bubble,
  isHovered,
  isOpen,
  staggerIndex,
}: {
  bubble: { id: CreateType; angle: number; palette: BubblePalette };
  isHovered: boolean;
  isOpen: boolean;
  staggerIndex: number;
}) {
  const { angle, palette, id } = bubble;
  // Outside-in stagger: indices 0 and 3 first (Photo + Reel), 1 and 2 next.
  const staggerMs = staggerIndex === 0 || staggerIndex === 3 ? 0 : 60;

  const baseTransform = isOpen
    ? `rotate(${angle}deg) translate(0, ${-ARC_RADIUS_PX}px) rotate(${-angle}deg)`
    : `rotate(${angle}deg) translate(0, -8px) rotate(${-angle}deg) scale(0.4)`;

  return (
    <div
      style={{
        position: 'absolute', left: 0, bottom: 0,
        transformOrigin: '0 0',
        transform: baseTransform,
        opacity: isOpen ? 1 : 0,
        transition: `transform 280ms cubic-bezier(0.22,1.2,0.36,1) ${staggerMs}ms, opacity 200ms ease ${staggerMs}ms`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 40, height: 40, margin: -20,
          borderRadius: '50%',
          position: 'relative',
          background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.04) 100%)',
          backdropFilter: 'blur(14px) saturate(2.2) brightness(1.15)',
          WebkitBackdropFilter: 'blur(14px) saturate(2.2) brightness(1.15)',
          border: `${isHovered ? 2 : 1.5}px solid ${palette.pure}`,
          boxShadow: [
            '0 10px 22px rgba(0,0,0,0.45)',
            `0 0 ${isHovered ? 8 : 6}px ${palette.pure}`,
            `0 0 ${isHovered ? 22 : 12}px ${palette.bright}`,
            `0 0 ${isHovered ? 55 : 26}px ${palette.bright}`,
            `0 0 ${isHovered ? 100 : 50}px ${palette.soft}`,
            'inset 0 0 0 0.5px rgba(0,0,0,0.22)',
            `inset 0 1.5px 0 rgba(255,255,255,${isHovered ? 0.7 : 0.5})`,
            'inset 0 -3px 8px rgba(0,0,0,0.15)',
          ].join(', '),
          display: 'grid', placeItems: 'center',
          transition: 'all 320ms cubic-bezier(0.22,1.2,0.36,1)',
          transformOrigin: 'center center',
          transform: isHovered ? 'scale(1.4)' : 'scale(1)',
        }}
      >
        {/* Top-left specular */}
        <span
          aria-hidden
          style={{
            position: 'absolute', top: 1, left: 5,
            width: 14, height: 6, borderRadius: '50%',
            background: 'linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 50%, transparent 80%)',
            filter: 'blur(1px)', zIndex: 4, pointerEvents: 'none',
          }}
        />
        {/* Top-right satellite */}
        <span
          aria-hidden
          style={{
            position: 'absolute', top: 4, right: 5,
            width: 3.5, height: 3.5, borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            filter: 'blur(0.3px)', opacity: 0.7, zIndex: 4, pointerEvents: 'none',
          }}
        />
        {/* Picture-icon */}
        <PictureIcon id={id} />
        {/* Selected dot above the hovered bubble */}
        {isHovered && (
          <span
            aria-hidden
            style={{
              position: 'absolute', left: '50%', top: -11,
              transform: 'translateX(-50%)',
              width: 4, height: 4, borderRadius: '50%',
              background: palette.pure,
              boxShadow: `0 0 10px ${palette.pure}, 0 0 20px ${palette.bright}`,
              zIndex: 5,
            }}
          />
        )}
      </div>
    </div>
  );
}

function PictureIcon({ id }: { id: CreateType }) {
  // Each icon: 28x28 (70% of the 40px orb), filled silhouette in a deeper
  // shade of the rim color. White accents for legibility.
  const sharedFilter =
    'drop-shadow(0 0 3px rgba(0,0,0,0.25)) drop-shadow(0 1px 2px rgba(0,0,0,0.55))';
  const svgStyle = { width: 28, height: 28, position: 'relative' as const, zIndex: 3, filter: sharedFilter };

  if (id === 'photo') {
    return (
      <svg viewBox="0 0 24 24" style={svgStyle}>
        <defs>
          <linearGradient id="ph-body" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00B8E0" />
            <stop offset="100%" stopColor="#007A99" />
          </linearGradient>
        </defs>
        <path d="M5 7h3l1.3-1.8a1.2 1.2 0 0 1 1-.5h5.4a1.2 1.2 0 0 1 1 .5L18 7h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" fill="url(#ph-body)" />
        <circle cx="12" cy="13.5" r="3.6" fill="#00D4F5" />
        <circle cx="12" cy="13.5" r="2.4" fill="#005C7A" />
        <circle cx="11" cy="12.5" r="0.7" fill="#ffffff" fillOpacity="0.95" />
        <rect x="16.5" y="8.5" width="1.6" height="1" rx="0.3" fill="#ffffff" fillOpacity="0.9" />
      </svg>
    );
  }
  if (id === 'video') {
    return (
      <svg viewBox="0 0 24 24" style={svgStyle}>
        <defs>
          <linearGradient id="vd-body" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C2008C" />
            <stop offset="100%" stopColor="#8B0066" />
          </linearGradient>
        </defs>
        <rect x="2.5" y="7" width="13" height="10" rx="2" fill="url(#vd-body)" />
        <path d="M15.5 9.5 21 6.5v11l-5.5-3z" fill="#FF1FB0" />
        <circle cx="6.5" cy="12" r="2.2" fill="#5C0044" />
        <circle cx="6.5" cy="12" r="1.2" fill="#FF52C2" />
        <circle cx="6" cy="11.5" r="0.4" fill="#ffffff" fillOpacity="0.95" />
        <circle cx="11.5" cy="10" r="0.6" fill="#ffffff" fillOpacity="0.95" />
      </svg>
    );
  }
  if (id === 'story') {
    return (
      <svg viewBox="0 0 24 24" style={svgStyle}>
        <defs>
          <linearGradient id="st-ring" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C24DFF" />
            <stop offset="100%" stopColor="#7A00C2" />
          </linearGradient>
          <linearGradient id="st-core" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7A00C2" />
            <stop offset="100%" stopColor="#4D008A" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="9.5" fill="url(#st-ring)" />
        <circle cx="12" cy="12" r="7.8" fill="#1a0033" />
        <circle cx="12" cy="12" r="6.8" fill="url(#st-core)" />
        <path d="M10 8.5v7l5.5-3.5z" fill="#ffffff" />
      </svg>
    );
  }
  // reel
  return (
    <svg viewBox="0 0 24 24" style={svgStyle}>
      <defs>
        <linearGradient id="rl-body" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00B377" />
          <stop offset="100%" stopColor="#006644" />
        </linearGradient>
      </defs>
      <rect x="5.5" y="2.5" width="13" height="19" rx="3" fill="url(#rl-body)" />
      <rect x="10" y="3.5" width="4" height="0.8" rx="0.4" fill="#003322" />
      <rect x="7" y="5" width="10" height="15" rx="1.5" fill="#00875C" />
      <path d="M10 9.5v7l6-3.5z" fill="#ffffff" />
      <circle cx="7.5" cy="3.5" r="0.4" fill="#00FFB4" />
      <circle cx="16.5" cy="3.5" r="0.4" fill="#00FFB4" />
    </svg>
  );
}
```

- [ ] **Step 2: Typecheck**

```
./node_modules/.bin/tsc --noEmit
```

Expected: zero output, exit 0.

---

## Task 6: Rewrite `CreateWheel.tsx` to drive the gesture

**Files:**
- Modify: `src/components/layout/CreateWheel.tsx` (full replacement — short file)

CreateWheel owns the pointer gesture, hit-tests on move, and fires navigation on release. It also handles keyboard activation (Space/Enter) as a tap. The button still keeps the gold-ring visual the user signed off on.

- [ ] **Step 1: Replace the file contents**

Replace `src/components/layout/CreateWheel.tsx` entirely:

```tsx
import { Plus } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useRef } from 'react';
import { useCreateArc } from '@/lib/create-arc-context';
import { haptic } from '@/lib/haptics';
import {
  CREATE_TYPES,
  readLastCreateType,
  writeLastCreateType,
  type CreateType,
} from '@/lib/last-create-type';
import { computeHoveredBubble } from '@/lib/hover-hit-test';
import { usePressAndHold } from '@/hooks/use-press-and-hold';

export function CreateWheel() {
  const navigate = useNavigate();
  const { openArc, closeArc, setHovered } = useCreateArc();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  // We need the latest hoveredId at release time without re-binding handlers
  // each render. Track it in a ref via setHovered's caller.
  const hoveredRef = useRef<CreateType | null>(null);

  const goToCreate = useCallback(
    (type: CreateType) => {
      writeLastCreateType(type);
      navigate({ to: '/create', search: { type } });
    },
    [navigate],
  );

  const getPivot = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: rect.left + rect.width / 2, y: rect.top };
  }, []);

  const handlers = usePressAndHold({
    onTap: () => {
      haptic('light');
      goToCreate(readLastCreateType());
    },
    onHoldStart: () => {
      haptic('selection');
      hoveredRef.current = null;
      openArc();
    },
    onHoldMove: (px, py) => {
      const pivot = getPivot();
      if (!pivot) return;
      const next = computeHoveredBubble(px, py, pivot.x, pivot.y);
      if (next !== hoveredRef.current) {
        hoveredRef.current = next;
        setHovered(next);
        if (next !== null) haptic('selection');
      }
    },
    onHoldEnd: () => {
      const target = hoveredRef.current;
      hoveredRef.current = null;
      closeArc();
      if (target !== null) {
        haptic('medium');
        goToCreate(target);
      }
    },
    onHoldCancel: () => {
      hoveredRef.current = null;
      closeArc();
    },
  });

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        haptic('light');
        goToCreate(readLastCreateType());
      }
    },
    [goToCreate],
  );

  return (
    <button
      ref={buttonRef}
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerCancel}
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
      className="relative size-16 rounded-full grid place-items-center bg-background border-2 border-primary text-primary glow-gold animate-glow-pulse select-none active:scale-[0.96] transition-transform duration-150 touch-manipulation"
      style={{
        marginTop: '-1.75rem',
        zIndex: 10001,
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none',
      }}
      aria-label="Create"
      aria-haspopup="menu"
      type="button"
    >
      <Plus className="size-7" />
      {/* Hidden helper — surfaces the menu items to assistive tech. */}
      <span className="sr-only">
        Tap to start a {readLastCreateType()}. Press and hold to choose: {CREATE_TYPES.join(', ')}.
      </span>
    </button>
  );
}
```

- [ ] **Step 2: Typecheck**

```
./node_modules/.bin/tsc --noEmit
```

Expected: zero output, exit 0.

---

## Task 7: Wire the new provider + arc into `__root.tsx`

**Files:**
- Modify: `src/routes/__root.tsx`

Three edits: swap the import, swap the provider, swap the rendered component. The existing `PostSheetProvider` / `InstagramStylePostSheet` references will be removed in Task 8 (deletion). For this task we just point `__root.tsx` at the new modules so the next typecheck pass would fail without Task 8 — that's the signal to chain straight into it.

- [ ] **Step 1: Swap imports**

In `src/routes/__root.tsx`, replace lines that currently read:

```ts
import { InstagramStylePostSheet } from "@/components/layout/InstagramStylePostSheet";
import { PostSheetProvider, usePostSheet } from "@/lib/post-sheet-context";
```

with:

```ts
import { CreateBubbleArc } from "@/components/layout/CreateBubbleArc";
import { CreateArcProvider, useCreateArc } from "@/lib/create-arc-context";
```

- [ ] **Step 2: Swap the provider**

Find the line `<PostSheetProvider>` and its matching `</PostSheetProvider>`. Replace both with `<CreateArcProvider>` / `</CreateArcProvider>`.

- [ ] **Step 3: Swap the `usePostSheet()` call inside `RootContent`**

Find the line that reads:

```ts
const { isOpen, closePostSheet } = usePostSheet();
```

Replace it with:

```ts
const { isOpen, closeArc } = useCreateArc();
```

- [ ] **Step 4: Swap the rendered component**

Find the line that renders the sheet:

```tsx
<InstagramStylePostSheet isOpen={isOpen} onClose={closePostSheet} />
```

Replace with:

```tsx
<CreateBubbleArc />
```

(The arc reads its own `isOpen` from context; `closeArc` is exposed for parity but the arc itself does not need it as a prop. The destructured `isOpen` / `closeArc` are no longer used at this `RootContent` scope after the swap — delete the destructuring line entirely if so. If a typecheck unused-binding warning surfaces in Step 5, delete `const { isOpen, closeArc } = useCreateArc();` outright.)

- [ ] **Step 5: Typecheck**

```
./node_modules/.bin/tsc --noEmit
```

Expected: zero output, exit 0. If TS errors mention unused locals, remove the `const { isOpen, closeArc } = useCreateArc();` line and re-run.

---

## Task 8: Delete the superseded files

**Files:**
- Delete: `src/components/layout/InstagramStylePostSheet.tsx`
- Delete: `src/lib/post-sheet-context.tsx`

- [ ] **Step 1: Verify no remaining references**

```
grep -rn "InstagramStylePostSheet\|post-sheet-context\|PostSheetProvider\|usePostSheet" src/
```

Expected: zero matches.

- [ ] **Step 2: Delete the files**

```
rm src/components/layout/InstagramStylePostSheet.tsx
rm src/lib/post-sheet-context.tsx
```

- [ ] **Step 3: Typecheck**

```
./node_modules/.bin/tsc --noEmit
```

Expected: zero output, exit 0.

---

## Task 9: Final verification

**Files:** none.

- [ ] **Step 1: Run the two unit-test files**

```
node --experimental-strip-types --no-warnings=ExperimentalWarning --test src/lib/last-create-type.test.ts src/lib/hover-hit-test.test.ts
```

Expected: all 17 tests pass (8 + 9).

- [ ] **Step 2: Full typecheck**

```
./node_modules/.bin/tsc --noEmit
```

Expected: zero output, exit 0.

- [ ] **Step 3: Lint (existing repo gate)**

```
./node_modules/.bin/eslint src/components/layout/CreateBubbleArc.tsx src/components/layout/CreateWheel.tsx src/lib/create-arc-context.tsx src/lib/last-create-type.ts src/lib/hover-hit-test.ts src/hooks/use-press-and-hold.ts
```

Expected: zero errors. Pre-existing warnings in other files are tolerated; new files should be clean.

- [ ] **Step 4: Manual smoke (browser)**

Boot the dev server (`pnpm dev`) and visit the home page on a touch-capable device or browser dev-tools touch-emulation:

1. **Tap** the `+` button. Expected: navigates to `/create?type=photo` (or last-used).
2. **Press and hold** the `+`. After 220 ms: four glass bubbles bloom along a half-circle above the nav, each with a vibrant neon rim (cyan / magenta / violet / mint). Background dims. Light haptic on supported devices.
3. **Slide thumb upward and across.** As the thumb crosses each angular bin (`-48° / 0° / +48°` from vertical), the closest bubble scales 1.4×, gets a brighter halo, shows a small dot above. Light haptic on each cross.
4. **Release on the violet (Story) bubble.** Expected: medium haptic, arc collapses, navigates to `/create?type=story`.
5. **Press, hold, release outside the arc.** Expected: arc collapses, no navigation.
6. **Press Escape** while the arc is open (keyboard). Expected: covered by the cancel path (`pointerCancel`-equivalent — if not, the user can release the pointer and the arc closes anyway).

If anything in steps 1–5 is broken, debug in code; do not declare the task complete from typecheck alone (typecheck won't catch a wrong hit-test bin or a missing haptic).

---

## Self-review notes (recorded after writing the plan)

**Spec coverage:** every numbered section in the spec maps to at least one task above —
- Section 1 (goal): Tasks 1–9 deliver the dual-gesture behavior end-to-end.
- Section 2 (why) / Section 3 (out of scope): informational, no tasks needed.
- Section 4 (gesture model): Task 2 (hit-test math) + Task 3 (220 ms threshold + tap/hold split) + Task 6 (calls all four handlers).
- Section 5 (visual spec): Task 5 (arc) + Task 6 (kept gold-ring + button).
- Section 6 (states and transitions): Task 5 (bloom/collapse via CSS transitions) + Task 6 (gesture state machine via hook).
- Section 7 (haptics): Task 6 (haptic calls).
- Section 8 (accessibility): Task 6 (`aria-label`, `aria-haspopup`, keyboard handler, `sr-only` listing).
- Section 9 (last-used persistence): Task 1.
- Section 10 (component architecture): Tasks 1, 2, 3, 4, 5, 6, 7, 8 map 1:1 to the listed deletions / new files / modifications.
- Section 11 (file counts): Tasks 1–8 deliver exactly 2 deletions + 4 new + 2 modified.
- Section 12 (testing): Task 1 unit tests + Task 2 unit tests + Task 9 typecheck + lint + manual.
- Section 13 (risks): `touch-action: none` on the button + try/catch on localStorage + drop-shadow-only neon (no `backdrop-filter` on the icons themselves) — addressed in Tasks 6, 1, 5 respectively.

**Placeholder scan:** no TBD / TODO / "implement later" / "handle edge cases" hand-waves. Every code-changing step has the exact code or the exact replacement.

**Type/name consistency:** `CreateType` is defined in Task 1 and re-imported in Tasks 2, 4, 5, 6. `useCreateArc` / `CreateArcProvider` defined Task 4, consumed Tasks 6, 7. `computeHoveredBubble` defined Task 2, used Task 6. `usePressAndHold` + the args interface defined Task 3, consumed Task 6. `BUBBLES` constant uses the same four ids as `CREATE_TYPES`. No drift.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-11-bubble-arc-create-menu.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
