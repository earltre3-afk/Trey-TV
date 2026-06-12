# Bubble Arc Create Menu — Design Spec

**Date:** 2026-06-11
**Surface:** Trey TV mobile web — bottom navigation
**Replaces:** Existing `CreateWheel.tsx` click handler and `InstagramStylePostSheet.tsx` bottom sheet
**Status:** Approved (visual direction locked at v10 mockup, gesture model confirmed)

---

## 1. Goal

Replace the current single-tap `+ → bottom sheet` flow with a dual-gesture interaction:

- **Tap** → opens the camera flow directly into the last-used capture type.
- **Press-and-hold** → blooms a half-circle arc of 4 neon-glass bubbles above the nav bar. While still holding, the user slides their thumb across the arc; the bubble under the thumb lifts + glows. On release, the highlighted bubble's flow opens.

The visual aesthetic is **premium liquid glass on a night-time stage**, with vibrant neon rims (cyan / magenta / violet / mint) and deeper-shade filled picture-icons inside translucent orbs.

## 2. Why

The current bottom sheet (`InstagramStylePostSheet.tsx`) is generic, lists 6 options that aren't all reachable, and feels like a borrowed Instagram pattern. The redesign:

- Reads as a signature Trey TV interaction, not a copy of another app.
- Reduces friction for repeat creators (tap = last-used flow, one motion).
- Trims the option set from 6 → 4 (Photo / Video / Story / Reel) — only formats `/create` already accepts.
- Establishes a glass + neon visual language that ties into the existing gold-on-black premium shell.

## 3. Out of scope

- Backend changes — `/create` already accepts `?type=` for each of the 4 formats.
- The bottom nav itself — Home / Search / + / Inbox / You remain as-is.
- The standard + button visual — the original Trey TV gold-ring style stays. Only its handler changes.
- Other create surfaces (Live, Tradio drop, Trance, Collab, Poll) — explicitly deferred. The arc is intentionally limited to the four standard social formats.
- Desktop behavior — desktop nav has no + button; this design is mobile-only. Desktop continues to use the existing `CreateWheel`-less side-menu create flow.

## 4. Gesture model

| Gesture | Effect |
|---|---|
| **Tap** (press down + release in < 220 ms with no movement) | Navigate to `/create?type=<last-used>` (default `photo` for first-time users). |
| **Press-and-hold** (press down ≥ 220 ms) | Trigger arc bloom + light haptic. Arc stays open as long as the pointer is down. |
| **Slide while holding** | The bubble closest to the pointer becomes the "hover" bubble. Lifts, scales, glows. |
| **Release on a bubble** | Confirm-haptic, arc collapses, navigate to `/create?type=<bubble.id>`. |
| **Release outside the arc / on the + itself** | Cancel-haptic, arc collapses, no navigation. |
| **Escape key** (when arc is open) | Cancel and close the arc. |

The 220 ms threshold matches the platform default press-and-hold (long-press) interval and is below the user-perceptible "I'm waiting" floor for a tap.

### Hover hit-testing

While the pointer is down inside `device-body`:

1. Compute pointer position relative to the arc pivot (the center of the + button).
2. Compute the angular position of each bubble (`-72°`, `-24°`, `+24°`, `+72°` from vertical).
3. The "hovered" bubble is whichever angular slot the pointer's angle falls into:
   - `-90°` to `-48°` → Photo
   - `-48°` to `0°` → Video
   - `0°` to `+48°` → Story
   - `+48°` to `+90°` → Reel
4. Outside that 180° upper arc, no bubble is hovered (a release here cancels).

Distance from the pivot does not affect hit-testing (users won't reach the exact 110 px radius reliably). The whole 180° upper half above the nav is the live target area.

## 5. Visual specification (v10)

### Layout

- **Arc pivot**: anchored at the horizontal center of the + button, vertical position equal to the top edge of the nav bar.
- **Bubble positions**: 4 bubbles at angles `-72°, -24°, +24°, +72°` from vertical, radius **110 px** from the pivot.
- **Bubble size**: **40 × 40 px** circle, transformed with `scale(1)` idle, `scale(1.4)` hovered.
- **Bubble spacing**: derived from radius and angles; the leftmost and rightmost bubbles land roughly above the Home and You nav items respectively.
- **Z-order**: scrim → horizon glow → bubbles (z 7) → + button (z 6) → bottom nav (z 5).

### Bubble palette

| Bubble | Rim hex | Icon deep | Icon mid |
|---|---|---|---|
| Photo | `#00FFFF` (cyan) | `#007A99` | `#00B8E0` |
| Video | `#FF00B8` (magenta) | `#8B0066` | `#C2008C` |
| Story | `#B800FF` (violet) | `#4D008A` | `#7A00C2` |
| Reel | `#00FF88` (mint) | `#008055` | `#00B377` |

### Bubble — idle state

- **Body** (translucent glass):
  - `backdrop-filter: blur(14px) saturate(2.2) brightness(1.15)` — backdrop refraction is what makes it read as glass.
  - `background: radial-gradient(circle at 38% 32%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.04) 100%)` — light-to-clear, no dark fill.
- **Border**: `1.5px solid var(--neon-pure)` — full-saturation neon hex.
- **Outer rim bloom** (box-shadow stack, no inner neon tint):
  - `0 0 6px var(--neon-pure)`
  - `0 0 12px var(--neon-bright)` (rgba ~0.85)
  - `0 0 26px var(--neon-bright)`
  - `0 0 50px var(--neon-soft)` (rgba ~0.35)
- **Inner highlights**:
  - Top-left specular pseudo-element: 14 × 6 px white sheen, `blur(1px)`, positioned at `top:1px left:5px`.
  - Top-right satellite pseudo-element: 3.5 × 3.5 px white dot, `blur(0.3px)`, positioned at `top:4px right:5px`.
  - Inset top white line: `inset 0 1.5px 0 rgba(255,255,255,0.5)`.
  - Inset bottom subtle shadow: `inset 0 -3px 8px rgba(0,0,0,0.15)` — gives mass without darkening the body.
- **Drop shadow** (ambient): `0 10px 22px rgba(0,0,0,0.45)`.

### Icon — picture-icon spec

Each icon is a filled SVG silhouette inside a 24 × 24 viewBox, rendered at **28 × 28 px** (70% of the orb). All four use a vertical linearGradient on the body fill from `--icon-mid` (top) to `--icon-deep` (bottom). White-or-near-white accents are layered on top for legibility.

- **Photo**: Camera body shape (rounded rect with viewfinder bump). Lens is a layered circle: outer mid-cyan ring, inner deep-cyan core, tiny white hot-spot highlight at 10:30, small white flash rectangle in the upper-right.
- **Video**: Camcorder body (rect) on the left, brighter-magenta lens block (parallelogram) on the right. Inside the rect: dark inner accent circle, bright mid-magenta lens, tiny white spec. Small white record dot above-right of the lens.
- **Story**: IG-style story ring (outer gradient circle), dark inner ring (`#1a0033` background of the orb interior), deep-violet inner core, **white play triangle** centered.
- **Reel**: Vertical phone-frame rounded rect in deep mint, dark top notch, lighter mint inner screen, **white play triangle** centered, tiny mint corner dots near the top.

**Icon filter** (idle): `drop-shadow(0 0 3px var(--neon-soft)) drop-shadow(0 1px 2px rgba(0,0,0,0.55))` — keeps a soft neon halo and a subtle drop shadow so the icon doesn't float weightlessly.

### Bubble — hover state (thumb-over)

- Scale `1.4`, border `2px`, body brightens to:
  `radial-gradient(circle at 38% 32%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.14) 45%, rgba(255,255,255,0.06) 100%)`.
- Rim bloom expands: `0 0 8px / 0 0 22px / 0 0 55px / 0 0 100px` of progressively softer rim color.
- Icon filter intensifies: `drop-shadow(0 0 5px var(--neon-bright))`.
- **Selected dot**: 4 × 4 px circle in `var(--neon-pure)` with double drop-shadow, positioned 11 px above the bubble center. Confirms the active pick.
- Hover transition: `all 0.32s cubic-bezier(0.22, 1.2, 0.36, 1)` (slight overshoot spring).

### Beam (optional accent during hover)

A 0.5 px tall narrow gradient line from the + center to the hovered bubble, color = bubble's rim hex, with a soft drop-shadow glow. Anchored at the arc pivot, rotated to the bubble's angle. Reinforces "you're connected to what you picked from the button you're pressing."

### Stage (background while arc is open)

- **Scrim**: `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(2,3,15,0.85) 60%, rgba(0,0,8,0.95) 100%)` + `backdrop-filter: blur(12px) saturate(0.7)`. Dims the underlying feed and lowers its saturation so the arc reads as the focal stage.
- **Horizon glow**: bottom-anchored 240 px tall, three overlapping radial gradients — cyan-left, magenta-right, violet-center — at low alpha, behind everything. Gives the bubbles something colorful to refract.
- **Stars**: ~5 small static neon-tinted dots scattered in the upper area. Atmosphere, not animation.
- **Arc thread**: optional 0.5 px white-blue dashed-not-dashed half-circle at the bubble radius, very low opacity, with a soft drop-shadow. Hints at the arc path without being a UI element. Can be omitted on lower-end devices.

### Standard + button (unchanged)

Visual stays exactly as today's `CreateWheel.tsx`:
- `bg-background` (`#0A0A0F`), `border-2 border-primary` (gold `#FFC857`).
- `glow-gold animate-glow-pulse` (existing global animation).
- 64 × 64 px, `Plus` icon at `size-7`, translated up `-1.75rem` to perch above the nav.
- During press-and-hold, no visual change is required by spec — the arc itself signals the state. (Optional polish: pause `animate-glow-pulse` and bump the gold glow alpha slightly while pressed. Mark as nice-to-have, not a blocker.)

## 6. States and transitions

| State | Description | Duration |
|---|---|---|
| **Idle** | Just the + button. Arc not mounted. | — |
| **Pressing** | Pointer is down on +, < 220 ms elapsed. No visual change yet. | 0–220 ms |
| **Opening** | 220 ms reached. Arc mounts. Bubbles animate from inside the + outward to their final positions along the arc. Each bubble staggered ~30 ms. Stagger order: outside-in (Photo and Reel first, Video and Story next) to read as a graceful bloom. | ~280 ms total |
| **Open / idle hover** | Arc visible, no bubble highlighted (pointer not yet over the arc). | — |
| **Open / hovering** | A bubble is highlighted per hit-test. Transitions are smooth — when the pointer crosses an angular boundary the leaving bubble drops back to idle scale while the entering bubble lifts. | 320 ms per transition |
| **Confirming** | Release on a bubble. Confirm haptic. Bubble does a brief 1.5× pop, neon ring pulses outward, arc collapses, navigation fires after the collapse begins (~150 ms in) to feel snappy. | ~280 ms total |
| **Cancelling** | Release outside any bubble. Cancel haptic. Bubbles collapse back into the + and arc unmounts. | ~220 ms |

## 7. Haptics

Uses the existing `haptic()` helper in `src/lib/haptics.ts`.

- **On hold trigger** (220 ms): `haptic("selection")`
- **On hover change** (pointer crosses into a new bubble): `haptic("selection")` — light
- **On confirm**: `haptic("medium")` (or `haptic("success")` if the helper exposes it; use `"selection"` if not)
- **On cancel**: no haptic (silence is the cancel cue)

## 8. Accessibility

- The + button keeps a meaningful `aria-label="Create"` and `aria-haspopup="menu"`.
- Press-and-hold is a pointer/touch interaction. For keyboard users, the + button still **opens** the arc on `Space`/`Enter` (treats it as a single-tap that opens the arc instead of going straight to camera). Arrow keys move focus across bubbles, `Enter` selects, `Escape` cancels.
- Each bubble has an `aria-label="Create a Photo"` (etc.) and `role="menuitem"`.
- Respect `prefers-reduced-motion`:
  - Skip the spring bloom — fade arc in over 80 ms.
  - Skip the hover lift transition — change states instantly.
  - Skip the confirm pop — collapse directly.
- Focus ring on the active bubble matches the rim color and is visible against the night scrim.

## 9. Last-used type persistence

- Store the last selected type in `localStorage` under the key `treytv.create.lastType` after any confirm.
- Read on every tap (before navigation). Default if missing or invalid: `"photo"`.
- Valid values: `"photo" | "video" | "story" | "reel"`. Anything else falls back to default.

## 10. Component architecture

### Replace
- `src/components/layout/InstagramStylePostSheet.tsx` → deleted.
- `src/lib/post-sheet-context.tsx` → renamed and generalized as `src/lib/create-arc-context.tsx`.

### New files
- `src/components/layout/CreateBubbleArc.tsx` — the arc itself: 4 bubbles, hit-testing, bloom/collapse animation, beam, selected-dot.
- `src/components/layout/CreateBubbleArc.css.ts` (or co-located style block) — the neon palette tokens and keyframes.
- `src/hooks/use-press-and-hold.ts` — extracts the 220 ms gesture detection so it can be reused. Returns `{ onPointerDown, onPointerUp, onPointerMove, onPointerCancel, state: "idle" | "pressing" | "holding" }` and an `onHoldStart`/`onHoldRelease(target)` callback pair.
- `src/lib/last-create-type.ts` — read/write helpers for `localStorage` last-used-type with a typed enum.

### Modified files
- `src/components/layout/CreateWheel.tsx`:
  - Uses `use-press-and-hold`.
  - On tap: read `last-create-type.ts`, navigate to `/create?type=<type>`.
  - On hold-start: open the arc context.
  - On hold-release-with-bubble: close arc, persist type, navigate.
  - On hold-release-cancel: just close.
- `src/lib/create-arc-context.tsx`: exposes `isOpen`, `hoveredId`, `openArc()`, `closeArc()`, `setHovered(id|null)`. Lives at the root just like the old `PostSheetProvider`.
- `src/routes/__root.tsx`: rename `PostSheetProvider` import to `CreateArcProvider`, swap `<InstagramStylePostSheet>` for `<CreateBubbleArc>`. (The new component reads its own props from context, same shape.)

### Other touched files
- `src/lib/haptics.ts`: no changes required if `"selection"` and `"medium"` exist. Check first.

## 11. Implementation file plan (counts)

- **2 deletions**: `InstagramStylePostSheet.tsx`, `post-sheet-context.tsx`.
- **4 new**: `CreateBubbleArc.tsx`, `use-press-and-hold.ts`, `last-create-type.ts`, `create-arc-context.tsx`.
- **2 modified**: `CreateWheel.tsx`, `__root.tsx`.

## 12. Testing

- **Unit**: `use-press-and-hold` — hit fires on hold ≥ 220 ms, not on quick tap, cancels on `pointercancel`.
- **Unit**: `last-create-type` — round-trip storage, invalid values fall back to `"photo"`.
- **Unit**: hit-testing function in `CreateBubbleArc` — given a pointer angle, returns the correct bubble id (boundary cases at `-48° / 0° / +48°`).
- **Integration / visual**: a Storybook (or dev-server walkthrough) showing each state — idle, holding, hovering each of 4 bubbles, confirm pop, cancel collapse.
- **Manual**: real mobile device test of the gesture on iOS Safari and Android Chrome (the two `backdrop-filter` engines render the glass slightly differently — confirm rims still pop on both).
- **Typecheck**: `tsc --noEmit` must pass with 0 errors before merge (matches the standing project rule).
- **Reduced-motion**: toggle the OS setting and confirm the arc skips spring transitions.

## 13. Risks and mitigations

- **`backdrop-filter` performance on low-end Android** — fallback: detect via a small `prefers-reduced-transparency` check or the existing `use-device-profile` (if reinstated) and reduce blur radius. Currently `use-device-profile` is intentionally NOT in the codebase (it was part of the broken mobile pass we reverted); we accept the small risk of slightly slower paint on the bottom 5 percent of devices in exchange for the visual.
- **Gesture conflict with scroll** — the + button sits inside the bottom nav, which is `position: absolute`. Press starts on the button itself, so the page scroll listener doesn't capture it. Confirm during implementation that the press handler calls `e.preventDefault()` on the `pointerdown` to suppress any accidental scroll-jacking.
- **localStorage unavailable** (incognito on iOS Safari is known to throw on some versions) — `last-create-type.ts` wraps in try/catch and silently falls back to in-memory default.
- **Backend `/create?type=…` rejection** — `/create` must accept exactly the four values. Verify in implementation; if any are missing, add them with a passthrough default to `photo`.

## 14. Open questions (resolved during brainstorming, recorded for traceability)

- **Tap behavior**: confirmed = camera into last-used type.
- **Panel scope**: confirmed = Photo, Video, Story, Reel only.
- **Gesture model**: confirmed = press-and-hold opens the arc, slide+release picks, release outside cancels.
- **Aesthetic**: confirmed = liquid glass + neon rim only, night-time stage, deeper-shade picture-icons, no labels under the bubbles.
- **Sizing**: confirmed = 40 px bubbles, 28 px icons, 110 px arc radius.
- **+ button**: confirmed = original Trey TV gold-ring + glow style, unchanged.
