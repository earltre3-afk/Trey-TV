/**
 * useFocusGrid — D-pad / remote / gamepad navigation for the Trey TV shell.
 *
 * Strategy:
 *  - Discover all focusable elements in the DOM (buttons, inputs, [tabindex],
 *    or anything explicitly tagged with `data-focusable`).
 *  - Cluster them into rows by their vertical position (centers within
 *    ROW_TOLERANCE px belong to the same row).
 *  - Within a row, sort by X. Up/Down jumps between rows, Left/Right walks
 *    inside a row. Wrap-around at edges. Row memory remembers the last column
 *    index used in each row so returning to a row restores horizontal position.
 *  - Enter / Gamepad-A => click(). Backspace/Escape / Gamepad-B => back().
 *  - Polls navigator.getGamepads() each frame for Fire Stick / Android TV /
 *    Xbox / PS controllers.
 *
 * Wire-up:
 *  - Mount <FocusManager onBack={...} /> once near the root of the TV shell.
 *  - Optionally drop <SpatialFocusRing /> for the visible neon outline that
 *    tracks whichever element currently has :focus.
 *  - Components don't need to know about this hook — any `<button>` or
 *    element with `tabIndex={0}` participates. To opt-out, add
 *    `data-focusable="false"` or `tabIndex={-1}`.
 */
import { useEffect, useRef } from 'react';

const ROW_TOLERANCE = 36; // px — vertical clustering threshold for "same row"
const REPEAT_INITIAL_MS = 380;
const REPEAT_INTERVAL_MS = 90;
const STICK_DEADZONE = 0.55;

type Dir = 'up' | 'down' | 'left' | 'right';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[data-focusable="true"]',
].join(',');

function isVisible(el: HTMLElement) {
  if (el.hasAttribute('disabled')) return false;
  if (el.getAttribute('data-focusable') === 'false') return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  // Off-screen (allow slight bleed for horizontally-scrollable rows)
  if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return false;
  const style = getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none') return false;
  return true;
}

type FocusItem = { el: HTMLElement; rect: DOMRect };
type Grid = { rows: FocusItem[][]; flat: FocusItem[] };

function buildGrid(): Grid {
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(isVisible);

  const items: FocusItem[] = nodes.map((el) => ({ el, rect: el.getBoundingClientRect() }));
  // Sort by Y, then X
  items.sort((a, b) => {
    const cy = a.rect.top + a.rect.height / 2 - (b.rect.top + b.rect.height / 2);
    if (Math.abs(cy) > ROW_TOLERANCE) return cy;
    return a.rect.left - b.rect.left;
  });

  // Cluster into rows
  const rows: FocusItem[][] = [];
  for (const it of items) {
    const cy = it.rect.top + it.rect.height / 2;
    const row = rows[rows.length - 1];
    if (row) {
      const rowCy =
        row.reduce((s, r) => s + r.rect.top + r.rect.height / 2, 0) / row.length;
      if (Math.abs(cy - rowCy) <= ROW_TOLERANCE) {
        row.push(it);
        continue;
      }
    }
    rows.push([it]);
  }
  // Sort each row by X
  rows.forEach((r) => r.sort((a, b) => a.rect.left - b.rect.left));

  return { rows, flat: items };
}

function findIndex(grid: Grid, el: HTMLElement | null): { r: number; c: number } | null {
  if (!el) return null;
  for (let r = 0; r < grid.rows.length; r++) {
    const c = grid.rows[r].findIndex((it) => it.el === el);
    if (c !== -1) return { r, c };
  }
  return null;
}

/** Pick the column in a target row whose horizontal center is closest to `anchorX`. */
function closestColInRow(row: FocusItem[], anchorX: number): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < row.length; i++) {
    const cx = row[i].rect.left + row[i].rect.width / 2;
    const d = Math.abs(cx - anchorX);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

type Memory = {
  // Last column INDEX visited in each row, keyed by row index.
  // We re-key on each rebuild via center-x of the previously focused element.
  anchorX: number;
  rowAnchors: Map<number, number>; // rowIndex -> column index
};

function move(grid: Grid, current: HTMLElement | null, dir: Dir, mem: Memory): HTMLElement | null {
  if (grid.rows.length === 0) return null;

  // No current focus? Grab the first thing.
  const cur = findIndex(grid, current);
  if (!cur) {
    const row = grid.rows[0];
    return row[0]?.el ?? null;
  }

  const { r, c } = cur;

  if (dir === 'left' || dir === 'right') {
    const row = grid.rows[r];
    let next = c + (dir === 'right' ? 1 : -1);
    if (next < 0) next = row.length - 1; // wrap
    if (next >= row.length) next = 0; // wrap
    const target = row[next];
    if (target) {
      mem.anchorX = target.rect.left + target.rect.width / 2;
      mem.rowAnchors.set(r, next);
      return target.el;
    }
    return null;
  }

  // up / down
  const step = dir === 'down' ? 1 : -1;
  let nextRow = r + step;
  if (nextRow < 0) nextRow = grid.rows.length - 1;
  if (nextRow >= grid.rows.length) nextRow = 0;

  const targetRow = grid.rows[nextRow];
  if (!targetRow || targetRow.length === 0) return null;

  // Prefer row memory; otherwise pick the column closest to current anchorX.
  let col = mem.rowAnchors.get(nextRow);
  if (col == null || col >= targetRow.length) {
    col = closestColInRow(targetRow, mem.anchorX);
  }
  const target = targetRow[col];
  if (!target) return null;
  mem.rowAnchors.set(nextRow, col);
  // Don't overwrite anchorX on vertical moves — that's the whole point of row memory.
  return target.el;
}

function scrollIntoViewSoft(el: HTMLElement) {
  try {
    el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  } catch {
    el.scrollIntoView();
  }
}

export type FocusManagerOptions = {
  onBack?: () => void;
  onMenu?: () => void;
  /** Set to false to disable keyboard binding (e.g. inside a chat input). */
  enabled?: boolean;
};

export function useFocusGrid(opts: FocusManagerOptions = {}) {
  const { onBack, onMenu, enabled = true } = opts;
  const memRef = useRef<Memory>({ anchorX: 0, rowAnchors: new Map() });
  const repeatRef = useRef<{
    dir: Dir | null;
    timer: ReturnType<typeof setInterval> | null;
    initial: ReturnType<typeof setTimeout> | null;
  }>({
    dir: null,
    timer: null,
    initial: null,
  });
  // Stable refs for callbacks so the effect doesn't tear down each render.
  const onBackRef = useRef(onBack);
  const onMenuRef = useRef(onMenu);
  onBackRef.current = onBack;
  onMenuRef.current = onMenu;

  useEffect(() => {
    if (!enabled) return;

    const isTextInputFocused = () => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
      if (el.isContentEditable) return true;
      return false;
    };

    const doMove = (dir: Dir) => {
      const grid = buildGrid();
      const active = document.activeElement as HTMLElement | null;
      // First-ever navigation: seed anchorX from current focus or center of screen.
      if (memRef.current.anchorX === 0) {
        if (active) {
          const r = active.getBoundingClientRect();
          memRef.current.anchorX = r.left + r.width / 2;
        } else {
          memRef.current.anchorX = window.innerWidth / 2;
        }
      }
      const next = move(grid, active, dir, memRef.current);
      if (next) {
        next.focus({ preventScroll: true });
        scrollIntoViewSoft(next);
      }
    };

    const startRepeat = (dir: Dir) => {
      stopRepeat();
      repeatRef.current.dir = dir;
      doMove(dir);
      repeatRef.current.initial = setTimeout(() => {
        repeatRef.current.timer = setInterval(() => {
          if (repeatRef.current.dir) doMove(repeatRef.current.dir);
        }, REPEAT_INTERVAL_MS);
      }, REPEAT_INITIAL_MS);
    };

    const stopRepeat = () => {
      repeatRef.current.dir = null;
      if (repeatRef.current.initial) clearTimeout(repeatRef.current.initial);
      if (repeatRef.current.timer) clearInterval(repeatRef.current.timer);
      repeatRef.current.initial = null;
      repeatRef.current.timer = null;
    };

    const KEY_DIR: Record<string, Dir> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Don't hijack typing inside chat/search boxes.
      if (isTextInputFocused() && e.key !== 'Escape') return;

      const dir = KEY_DIR[e.key];
      if (dir) {
        e.preventDefault();
        if (repeatRef.current.dir !== dir) startRepeat(dir);
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        const el = document.activeElement as HTMLElement | null;
        if (el && el !== document.body) {
          e.preventDefault();
          el.click();
        }
        return;
      }
      if (e.key === 'Backspace' || e.key === 'Escape') {
        e.preventDefault();
        onBackRef.current?.();
        return;
      }
      if (e.key === 'ContextMenu' || e.key === 'F10') {
        e.preventDefault();
        onMenuRef.current?.();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (KEY_DIR[e.key]) stopRepeat();
    };

    // ---------- Gamepad polling ----------
    // Buttons: 0=A/OK, 1=B/Back, 2=X, 3=Y/Menu,
    //          12=DPad Up, 13=DPad Down, 14=DPad Left, 15=DPad Right
    // Axes: 0/1 = left stick X/Y
    type GP = { btns: boolean[]; stickDir: Dir | null };
    const prev: Record<number, GP> = {};
    let raf = 0;

    const gpDir = (gp: Gamepad): Dir | null => {
      if (gp.buttons[12]?.pressed) return 'up';
      if (gp.buttons[13]?.pressed) return 'down';
      if (gp.buttons[14]?.pressed) return 'left';
      if (gp.buttons[15]?.pressed) return 'right';
      const x = gp.axes[0] ?? 0;
      const y = gp.axes[1] ?? 0;
      if (Math.abs(x) < STICK_DEADZONE && Math.abs(y) < STICK_DEADZONE) return null;
      if (Math.abs(x) > Math.abs(y)) return x > 0 ? 'right' : 'left';
      return y > 0 ? 'down' : 'up';
    };

    const pollGamepads = () => {
      const pads = (navigator.getGamepads?.() ?? []) as (Gamepad | null)[];
      for (const gp of pads) {
        if (!gp) continue;
        const state = prev[gp.index] ?? { btns: [], stickDir: null };
        // A button (OK)
        const aDown = !!gp.buttons[0]?.pressed;
        const aWas = !!state.btns[0];
        if (aDown && !aWas) {
          const el = document.activeElement as HTMLElement | null;
          if (el && el !== document.body) el.click();
        }
        // B button (Back)
        const bDown = !!gp.buttons[1]?.pressed;
        const bWas = !!state.btns[1];
        if (bDown && !bWas) onBackRef.current?.();
        // Y/Menu
        const yDown = !!gp.buttons[3]?.pressed;
        const yWas = !!state.btns[3];
        if (yDown && !yWas) onMenuRef.current?.();

        // Direction (treat as edge-triggered for stick, repeat for held dpad)
        const dir = gpDir(gp);
        if (dir && dir !== state.stickDir) {
          // Edge: just changed
          if (repeatRef.current.dir !== dir) startRepeat(dir);
        } else if (!dir && state.stickDir) {
          stopRepeat();
        }

        prev[gp.index] = {
          btns: gp.buttons.map((b) => !!b?.pressed),
          stickDir: dir,
        };
      }
      raf = requestAnimationFrame(pollGamepads);
    };

    const onGamepadConnected = () => {
      if (!raf) raf = requestAnimationFrame(pollGamepads);
    };
    const onGamepadDisconnected = () => {
      // Keep polling — other pads may still be connected.
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('gamepadconnected', onGamepadConnected);
    window.addEventListener('gamepaddisconnected', onGamepadDisconnected);
    // Kick off polling immediately (already-connected pads).
    if (!raf) raf = requestAnimationFrame(pollGamepads);

    // Auto-seed focus to first focusable element if nothing is focused yet.
    const seedTimer = setTimeout(() => {
      if (document.activeElement === document.body || !document.activeElement) {
        const grid = buildGrid();
        const first = grid.rows[0]?.[0]?.el;
        if (first) first.focus({ preventScroll: true });
      }
    }, 100);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('gamepadconnected', onGamepadConnected);
      window.removeEventListener('gamepaddisconnected', onGamepadDisconnected);
      stopRepeat();
      cancelAnimationFrame(raf);
      clearTimeout(seedTimer);
    };
  }, [enabled]);
}
