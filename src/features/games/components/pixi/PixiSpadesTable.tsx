/**
 * PixiSpadesTable.tsx
 * Full Pixi-rendered Spades game table scene.
 *
 * Renders:
 *   - 4-seat luxury table layout
 *   - Per-seat face-down card stacks with Trey TV card backs
 *   - Player hand as a full fan (at bottom)
 *   - Center trick landing zone with 4 card slots
 *   - Card play animations (slide from hand to center)
 *   - Trick winner sweep with glow
 *   - Turn indicator glow ring
 *   - Ambient table lighting
 *
 * React controls: score, bids, bid buttons, play button, header, game-over modal.
 */
import React, { useEffect, useRef } from "react";
import { Application, Container, Graphics, Ticker } from "pixi.js";
import { buildLayout, seatCenter, fanLayout, type TableLayout } from "./pixiLayout";
import { loadCardBack, loadCardFaces } from "./pixiAssets";
import {
  buildTableScene,
  tickTableScene,
  destroyTableScene,
  emitBurst,
  tickSparks,
  type TableScene,
} from "./PixiTableRenderer";
import { makeCardSprite } from "./PixiCardSprite";
import { tween, tickTween, ease, type Tween } from "./pixiAnimations";

export interface PixiSpadesProps {
  /** hands[0] = player hand (my hand face-up), hands[1..3] = face-down opponent hands */
  hands: string[][];
  /** Cards in center trick: [{seat, cardId}, ...] */
  trick: Array<{ seat: number; cardId: string }>;
  /** Which seat is "bottom" (the user) */
  mySeat: number;
  /** Currently active seat */
  currentSeat: number;
  /** If set, this seat just won the trick */
  winnerSeat: number | null;
  /** Cards in my hand the user has selected */
  selectedCardId: string | null;
  /** Legal card IDs for this turn */
  legalCards: string[];
  /** Accent color hex */
  accent: string;
  /** Key that changes on every state change */
  eventKey: string;
  /** Callback when a card in the hand is clicked */
  onCardClick?: (cardId: string) => void;
  className?: string;
  /** If false, skip rendering the player hand fan (hand is rendered in React instead) */
  renderHand?: boolean;
}

interface SpadesScene {
  table: TableScene;
  seatContainers: Container[];
  centerContainer: Container;
  handContainer: Container;
  turnRing: Graphics;
  tweens: Tween[];
  sparks: ReturnType<typeof emitBurst>;
  cardBack: import("pixi.js").Texture | null;
  cardFaces: Map<string, import("pixi.js").Texture>;
  layout: TableLayout;
  lastEventKey: string;
}

function accentNum(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

async function buildSpadesScene(
  host: HTMLDivElement,
  props: PixiSpadesProps,
): Promise<SpadesScene | null> {
  const rect = host.getBoundingClientRect();
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  const app = new Application();
  await app.init({
    width: w,
    height: h,
    backgroundAlpha: 0,
    antialias: !reducedMotion,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, reducedMotion ? 1.25 : 2),
    preference: "webgl",
    powerPreference: "low-power",
  });
  app.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
  host.appendChild(app.canvas);

  const layout = buildLayout(w, h);
  const table = buildTableScene(app, layout, "spades", reducedMotion);

  const seatContainers = [0, 1, 2, 3].map(() => new Container());
  const centerContainer = new Container();
  const handContainer = new Container();

  // Turn ring (glowing circle that appears around the active seat)
  const turnRing = new Graphics();
  turnRing.circle(0, 0, layout.cardW * 0.85).stroke({ color: 0xffc857, alpha: 0.72, width: 2 });
  turnRing.alpha = 0;

  table.cardLayer.addChild(...seatContainers, centerContainer, handContainer, turnRing);

  const cardBack = await loadCardBack();

  return {
    table,
    seatContainers,
    centerContainer,
    handContainer,
    turnRing,
    tweens: [],
    sparks: [],
    cardBack,
    cardFaces: new Map(),
    layout,
    lastEventKey: "",
  };
}

function renderSpades(scene: SpadesScene, props: PixiSpadesProps) {
  const { layout, seatContainers, centerContainer, handContainer, cardBack, cardFaces } = scene;
  const accent = accentNum(props.accent);
  const { cardW, cardH, cx, cy, w, h } = layout;

  // Clear all
  seatContainers.forEach((c) => c.removeChildren().forEach((ch) => ch.destroy()));
  centerContainer.removeChildren().forEach((c) => c.destroy());
  handContainer.removeChildren().forEach((c) => c.destroy());

  // ── Opponent card stacks (seats 1, 2, 3) ──────────────────
  [1, 2, 3].forEach((relSeat) => {
    const absSeat = ((props.mySeat + relSeat) % 4) as 0 | 1 | 2 | 3;
    const pos = seatCenter(absSeat, layout, props.mySeat);
    const count = props.hands[absSeat]?.length ?? 0;
    const isActive = props.currentSeat === absSeat;
    const stackCount = Math.min(count, 5);

    const container = seatContainers[absSeat];
    container.x = pos.x;
    container.y = pos.y;

    // Draw grouped face-down card stacks near each seat without covering portraits.
    for (let i = 0; i < stackCount; i++) {
      const card = makeCardSprite({
        cardW: cardW * 0.66,
        cardH: cardH * 0.66,
        faceDown: true,
        backTex: cardBack,
        accent,
      });
      const isHoriz = relSeat === 2; // top seat — horizontal fan
      if (isHoriz) {
        card.x = (i - (stackCount - 1) / 2) * cardW * 0.2;
        card.y = i * -1.5;
      } else {
        card.x = (i - (stackCount - 1) / 2) * cardW * 0.12;
        card.y = i * -1.5;
        card.rotation = (i - (stackCount - 1) / 2) * 0.025;
      }
      container.addChild(card);
    }

    // Active seat turn ring
    if (isActive) {
      scene.turnRing.x = pos.x;
      scene.turnRing.y = pos.y;
      scene.turnRing.alpha = 1;
    }
  });

  if (props.currentSeat === props.mySeat) {
    scene.turnRing.alpha = 0;
  } else if (![1, 2, 3].some((r) => (props.mySeat + r) % 4 === props.currentSeat)) {
    scene.turnRing.alpha = 0;
  }

  // ── Center trick landing slots (always visible, faint ghost outlines) ──────
  const trickCenterY = cy - cardH * 0.18;
  const trickSlots: Record<number, { x: number; y: number; r: number }> = {
    0: { x: cx, y: trickCenterY + cardH * 0.5, r: 0 }, // bottom
    1: { x: cx - cardW * 0.74, y: trickCenterY, r: -0.025 }, // left
    2: { x: cx, y: trickCenterY - cardH * 0.5, r: 0 }, // top
    3: { x: cx + cardW * 0.74, y: trickCenterY, r: 0.025 }, // right
  };

  const inset = new Graphics();
  inset
    .roundRect(
      cx - cardW * 1.4,
      trickCenterY - cardH * 0.96,
      cardW * 2.8,
      cardH * 1.92,
      cardW * 0.28,
    )
    .fill({ color: 0x020815, alpha: 0.24 })
    .stroke({ color: accent, alpha: 0.14, width: 1.0 });
  centerContainer.addChild(inset);

  const innerGlow = new Graphics();
  innerGlow
    .ellipse(cx, trickCenterY, cardW * 1.42, cardH * 0.88)
    .fill({ color: accent, alpha: props.trick.length > 0 ? 0.045 : 0.018 });
  centerContainer.addChild(innerGlow);

  // Draw landing-slot outlines so played cards sit in a clean trick zone.
  const slotW = cardW * 0.88;
  const slotH = cardH * 0.88;
  const slotR = slotW * 0.1;
  Object.values(trickSlots).forEach(({ x, y }) => {
    const slotBg = new Graphics();
    slotBg
      .roundRect(x - slotW / 2, y - slotH / 2, slotW, slotH, slotR)
      .fill({ color: 0xffffff, alpha: props.trick.length > 0 ? 0.02 : 0.008 })
      .stroke({ color: accent, alpha: props.trick.length > 0 ? 0.16 : 0.075, width: 1 });
    centerContainer.addChild(slotBg);
  });

  props.trick.forEach(({ seat, cardId }) => {
    const relSeat = ((seat - props.mySeat + 4) % 4) as 0 | 1 | 2 | 3;
    const slot = trickSlots[relSeat];
    const card = makeCardSprite({
      cardW: cardW * 0.88,
      cardH: cardH * 0.88,
      faceDown: false,
      faceTex: cardFaces.get(cardId) ?? null,
      cardId,
      backTex: cardBack,
      accent,
    });
    card.x = slot.x;
    card.y = slot.y;
    card.rotation = slot.r;

    if (!scene.table.reducedMotion) {
      const fromPos = seatCenter(seat as 0 | 1 | 2 | 3, layout, props.mySeat);
      const tw = tween(
        card,
        { x: fromPos.x, y: fromPos.y, scaleX: 0.5, scaleY: 0.5, alpha: 0.5 },
        { x: card.x, y: card.y, scaleX: 1, scaleY: 1, alpha: 1 },
        0.34,
        { ease: ease.outCubic },
      );
      scene.tweens.push(tw);
    }
    centerContainer.addChild(card);
  });

  // ── Trick winner sweep ─────────────────────────────────────
  if (props.winnerSeat !== null) {
    const winPos = seatCenter(props.winnerSeat as 0 | 1 | 2 | 3, layout, props.mySeat);
    if (!scene.table.reducedMotion) {
      scene.sparks.push(...emitBurst(scene.table, winPos.x, winPos.y, 0xffc857, 28));
      // Sweep glow from center to winner
      const sweepGlow = new Graphics();
      sweepGlow.circle(0, 0, cardW * 0.55).fill({ color: 0xffc857, alpha: 0.42 });
      sweepGlow.x = cx;
      sweepGlow.y = cy;
      scene.table.fxLayer.addChild(sweepGlow);
      const sw = tween(
        sweepGlow,
        { x: cx, y: cy, scaleX: 0.3, scaleY: 0.3, alpha: 0.72 },
        { x: winPos.x, y: winPos.y, scaleX: 2.2, scaleY: 2.2, alpha: 0 },
        0.72,
        { ease: ease.outCubic, onComplete: () => sweepGlow.destroy() },
      );
      scene.tweens.push(sw);
    }
  }

  // ── My hand (bottom) ───────────────────────────────────────
  if (props.renderHand !== false) {
    const myHand = props.hands[props.mySeat] ?? [];
    const handCardW = cardW * 0.9;
    const handCardH = cardH * 0.9;
    const fanItems = fanLayout(myHand.length, handCardW, w * 0.64, handCardH * 0.1);
    const handY = h * 0.7;

    myHand.forEach((cardId, i) => {
      const fan = fanItems[i];
      const isSelected = cardId === props.selectedCardId;
      const isLegal = props.legalCards.includes(cardId);
      const dimFactor = props.legalCards.length > 0 && !isLegal ? 0 : 1;

      const card = makeCardSprite({
        cardW: handCardW,
        cardH: handCardH,
        faceDown: false,
        faceTex: cardFaces.get(cardId) ?? null,
        cardId,
        backTex: cardBack,
        accent,
        dimFactor,
      });
      card.x = cx + fan.dx;
      card.y = handY + fan.dy + (isSelected ? -handCardH * 0.18 : 0);
      card.rotation = fan.rotation;
      card.scale.set(isSelected ? 1.06 : 1);

      // Playable glow ring
      if (isLegal && !isSelected) {
        const glow = new Graphics();
        glow
          .roundRect(
            -handCardW / 2 - 2,
            -handCardH / 2 - 2,
            handCardW + 4,
            handCardH + 4,
            handCardW * 0.13,
          )
          .fill({ color: accent, alpha: 0.12 })
          .stroke({ color: accent, alpha: 0.55, width: 1.2 });
        card.addChildAt(glow, 0);
      }
      // Selected glow
      if (isSelected) {
        const selGlow = new Graphics();
        selGlow
          .roundRect(
            -handCardW / 2 - 4,
            -handCardH / 2 - 4,
            handCardW + 8,
            handCardH + 8,
            handCardW * 0.15,
          )
          .fill({ color: 0xffc857, alpha: 0.18 })
          .stroke({ color: 0xffc857, alpha: 0.8, width: 1.8 });
        card.addChildAt(selGlow, 0);
      }

      // Interactivity
      card.eventMode = "static";
      card.cursor = isLegal ? "pointer" : "default";
      card.on("pointerdown", () => {
        if (isLegal && props.onCardClick) props.onCardClick(cardId);
      });

      handContainer.addChild(card);
    });
  }
}

const PixiSpadesTable: React.FC<PixiSpadesProps> = (props) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<SpadesScene | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let ro: ResizeObserver | null = null;

    async function init() {
      const scene = await buildSpadesScene(host!, propsRef.current);
      if (disposed || !scene) {
        scene?.table.app.destroy(
          { removeView: true, releaseGlobalResources: true },
          { children: true, texture: false },
        );
        return;
      }
      sceneRef.current = scene;

      const loadMissingFaces = (s: SpadesScene) => {
        const p = propsRef.current;
        const newCards = p.hands
          .flat()
          .concat(p.trick.map((t) => t.cardId))
          .filter((id) => !s.cardFaces.has(id));
        if (newCards.length === 0) return;
        loadCardFaces(newCards).then((newFaces) => {
          newFaces.forEach((tex, id) => s.cardFaces.set(id, tex));
          if (sceneRef.current === s) renderSpades(s, propsRef.current);
        });
      };

      renderSpades(scene, propsRef.current);
      scene.lastEventKey = propsRef.current.eventKey;
      loadMissingFaces(scene);

      ro = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        if (!sceneRef.current) return;
        sceneRef.current.table.app.renderer.resize(Math.max(1, width), Math.max(1, height));
        sceneRef.current.layout = buildLayout(Math.max(1, width), Math.max(1, height));
        sceneRef.current.table.layout = sceneRef.current.layout;
        renderSpades(sceneRef.current, propsRef.current);
      });
      ro.observe(host!);

      scene.table.app.ticker.add((ticker: Ticker) => {
        const dt = Math.min(ticker.deltaMS / 1000, 0.05);
        const s = sceneRef.current;
        if (!s) return;
        tickTableScene(s.table, dt);

        // Turn ring pulse
        if (!s.table.reducedMotion) {
          s.turnRing.alpha = s.turnRing.alpha > 0 ? 0.55 + Math.sin(s.table.time * 2.8) * 0.45 : 0;
        }

        s.tweens = s.tweens.filter((tw) => tickTween(tw, dt));
        s.sparks = tickSparks(s.sparks, dt);

        const p = propsRef.current;
        if (p.eventKey !== s.lastEventKey) {
          renderSpades(s, propsRef.current);
          loadMissingFaces(s);
          s.lastEventKey = p.eventKey;
        }
      });
    }

    init().catch(() => {
      sceneRef.current = null;
    });

    return () => {
      disposed = true;
      ro?.disconnect();
      const s = sceneRef.current;
      sceneRef.current = null;
      if (s) destroyTableScene(s.table);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={props.className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit" }}
    />
  );
};

export default PixiSpadesTable;
