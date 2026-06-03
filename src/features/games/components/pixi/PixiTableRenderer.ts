/**
 * PixiTableRenderer.ts
 * Renders the premium casino table surface, rim, and lighting layers.
 * Game-specific scenes (Blackjack, Spades, Bullshit) add their card/chip
 * content on top of this base.
 */
import { Application, Container, Graphics, Sprite, Texture } from "pixi.js";
import type { TableLayout } from "./pixiLayout";

export type TableStyle = "blackjack" | "spades" | "bullshit";

const STYLE_COLORS: Record<TableStyle, { felt: number; rim: number; spot: number; glow: number }> =
  {
    blackjack: { felt: 0x0a1f1a, rim: 0x2a1a04, spot: 0xffc857, glow: 0xffc857 },
    spades: { felt: 0x071320, rim: 0x051828, spot: 0x00b7ff, glow: 0x00b7ff },
    bullshit: { felt: 0x12082a, rim: 0x0e0420, spot: 0xa855f7, glow: 0xa855f7 },
  };

export interface TableScene {
  app: Application;
  root: Container;
  /** Sub-layer for table surface (felt, rim, lighting) — z index 0 */
  tableLayer: Container;
  /** Sub-layer for cards and chips — z index 1 */
  cardLayer: Container;
  /** Sub-layer for effects (glows, particles) — z index 2 */
  fxLayer: Container;
  layout: TableLayout;
  style: TableStyle;
  reducedMotion: boolean;
  time: number;
  rim: Graphics;
  felt: Graphics;
  spotA: Graphics;
  spotB: Graphics;
  centerRing: Graphics;
}

/**
 * Build the full table scene structure.
 * After calling this, add game-specific content to scene.cardLayer.
 */
export function buildTableScene(
  app: Application,
  layout: TableLayout,
  style: TableStyle,
  reducedMotion: boolean,
): TableScene {
  const root = new Container();
  const tableLayer = new Container();
  const cardLayer = new Container();
  const fxLayer = new Container();
  root.addChild(tableLayer, cardLayer, fxLayer);
  app.stage.addChild(root);

  const colors = STYLE_COLORS[style];
  const { w, h } = layout;

  // ── Outer rim / felt — transparent so CSS gradient background shows through ──
  const rim = new Graphics();
  const rimPad = Math.min(w, h) * 0.032;
  rim.roundRect(0, 0, w, h, Math.min(28, w * 0.07)).fill({ color: colors.rim, alpha: 0 });
  tableLayer.addChild(rim);

  const felt = new Graphics();
  felt
    .roundRect(rimPad, rimPad, w - rimPad * 2, h - rimPad * 2, Math.min(20, w * 0.05))
    .fill({ color: colors.felt, alpha: 0 });
  tableLayer.addChild(felt);

  // Felt grain (fine crosshatch pattern for texture)
  const grain = new Graphics();
  const gs = 7;
  for (let gx = rimPad; gx < w - rimPad; gx += gs) {
    grain.moveTo(gx, rimPad).lineTo(gx, h - rimPad);
  }
  grain.stroke({ color: 0xffffff, alpha: 0.018, width: 0.5 });
  tableLayer.addChild(grain);

  // ── Spotlight A (top center — dealer zone for BJ, top opponent for Spades) ──
  const spotA = new Graphics();
  spotA.ellipse(w / 2, h * 0.25, w * 0.38, h * 0.18).fill({ color: colors.spot, alpha: 0.055 });
  tableLayer.addChild(spotA);

  // ── Spotlight B (bottom center — player zone) ──
  const spotB = new Graphics();
  spotB.ellipse(w / 2, h * 0.75, w * 0.38, h * 0.18).fill({ color: colors.spot, alpha: 0.04 });
  tableLayer.addChild(spotB);

  // ── Overhead center spotlight (diffuse round glow) ──────────
  const centerGlow = new Graphics();
  centerGlow.circle(w / 2, h / 2, Math.min(w, h) * 0.35).fill({ color: 0xffffff, alpha: 0.025 });
  tableLayer.addChild(centerGlow);

  // ── Center ring (casino logo zone) ──────────────────────────
  const centerRing = new Graphics();
  const cr = Math.min(w, h) * 0.16;
  centerRing
    .circle(w / 2, h / 2, cr)
    .fill({ color: colors.glow, alpha: 0.025 })
    .stroke({ color: colors.glow, alpha: 0.28, width: 1.2 });
  // Inner ring
  centerRing.circle(w / 2, h / 2, cr * 0.65).stroke({ color: 0xffffff, alpha: 0.06, width: 0.8 });
  tableLayer.addChild(centerRing);

  // ── Vignette (dark corners) ─────────────────────────────────
  const vig = new Graphics();
  vig
    .roundRect(rimPad, rimPad, w - rimPad * 2, h - rimPad * 2, Math.min(20, w * 0.05))
    .fill({ color: 0x000000, alpha: 0 })
    .stroke({ color: 0x000000, alpha: 0.0 });
  // Shadow insets
  vig
    .roundRect(
      rimPad + 4,
      rimPad + 4,
      w - rimPad * 2 - 8,
      h - rimPad * 2 - 8,
      Math.min(18, w * 0.04),
    )
    .fill({ color: 0x000000, alpha: 0 });
  tableLayer.addChild(vig);

  // ── Top highlight sheen (lens reflection) ──────────────────
  const sheen = new Graphics();
  sheen
    .ellipse(w / 2, rimPad + h * 0.06, w * 0.48, h * 0.06)
    .fill({ color: 0xffffff, alpha: 0.045 });
  tableLayer.addChild(sheen);

  return {
    app,
    root,
    tableLayer,
    cardLayer,
    fxLayer,
    layout,
    style,
    reducedMotion,
    time: 0,
    rim,
    felt,
    spotA,
    spotB,
    centerRing,
  };
}

/**
 * Animate the table breathing — subtle glow pulse on the rim and center ring.
 * Call once per ticker tick.
 */
export function tickTableScene(scene: TableScene, dt: number) {
  scene.time += dt;
  if (scene.reducedMotion) return;

  const t = scene.time;
  const colors = STYLE_COLORS[scene.style];
  const pulse = 0.5 + Math.sin(t * 0.6) * 0.5; // 0–1

  // Animate center ring alpha
  scene.centerRing.alpha = 0.6 + pulse * 0.4;

  // Subtly pulse the spot lights
  scene.spotA.alpha = 0.85 + pulse * 0.15;
  scene.spotB.alpha = 0.8 + pulse * 0.2;
}

/**
 * Emit a burst of particle sparks at a position.
 * Returned Containers are added to fxLayer and self-clean via the returned cleanup list.
 */
export function emitBurst(
  scene: TableScene,
  x: number,
  y: number,
  color: number,
  count = 20,
): Array<{ g: Graphics; vx: number; vy: number; life: number; ttl: number }> {
  const sparks: Array<{ g: Graphics; vx: number; vy: number; life: number; ttl: number }> = [];
  const n = scene.reducedMotion ? Math.min(count, 8) : count;
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n + Math.random() * 0.5;
    const speed = 30 + Math.random() * 90;
    const g = new Graphics();
    g.circle(0, 0, 1.4 + Math.random() * 2.6).fill({ color, alpha: 0.85 });
    g.x = x;
    g.y = y;
    scene.fxLayer.addChild(g);
    sparks.push({
      g,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      ttl: 0.5 + Math.random() * 0.4,
    });
  }
  return sparks;
}

/** Tick particle sparks. Returns still-alive sparks. */
export function tickSparks(
  sparks: Array<{ g: Graphics; vx: number; vy: number; life: number; ttl: number }>,
  dt: number,
): Array<{ g: Graphics; vx: number; vy: number; life: number; ttl: number }> {
  return sparks.filter((s) => {
    s.life += dt;
    s.g.x = s.g.x += s.vx * dt;
    s.g.y = s.g.y += s.vy * dt;
    s.vx *= 0.982;
    s.vy *= 0.982;
    s.g.alpha = Math.max(0, 1 - s.life / s.ttl);
    s.g.scale.set(1 + (s.life / s.ttl) * 1.2);
    if (s.life >= s.ttl) {
      s.g.destroy();
      return false;
    }
    return true;
  });
}

/** Full teardown of the scene */
export function destroyTableScene(scene: TableScene) {
  scene.app.destroy(
    { removeView: true, releaseGlobalResources: true },
    { children: true, texture: false },
  );
}
