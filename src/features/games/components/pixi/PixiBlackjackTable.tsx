/**
 * PixiBlackjackTable.tsx
 * Full Pixi-rendered Blackjack table scene.
 *
 * Renders:
 *   - Curved casino felt + rim
 *   - Dealer zone (top half) with face-down/face-up cards
 *   - Player zone (bottom half) with animated card deal
 *   - Chip stacks at bet zone
 *   - Win glow, bust pulse, push neutral
 *   - Card deal animation, card flip (half-scale-squish technique)
 *   - Lighting pulse
 *
 * React controls: Hit, Stand, Double, Deal, bet chips, header, scores.
 */
import React, { useEffect, useRef } from "react";
import { Application, Container, Graphics, Sprite, Ticker } from "pixi.js";
import { buildLayout, type TableLayout } from "./pixiLayout";
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

export interface PixiBJTableProps {
  /** All dealer card IDs (index 1 is the hole card when phase==="player") */
  dealerCards: string[];
  /** All player card IDs */
  playerCards: string[];
  /** Current game phase */
  phase: "betting" | "player" | "dealer" | "settled";
  /** Game result when settled */
  result?: "win" | "lose" | "push" | "blackjack" | "bust" | null;
  /** Current bet amount */
  bet: number;
  /** Accent color hex string */
  accent: string;
  /** Key that changes when state changes and scene should update */
  eventKey: string;
  className?: string;
}

interface BJScene {
  table: TableScene;
  dealerContainer: Container;
  playerContainer: Container;
  chipContainer: Container;
  betZone: Graphics;
  winOverlay: Graphics;
  tweens: Tween[];
  sparks: ReturnType<typeof emitBurst>;
  cardBack: import("pixi.js").Texture | null;
  cardFaces: Map<string, import("pixi.js").Texture>;
  layout: TableLayout;
  lastEventKey: string;
  lastBet: number;
}

function accentNum(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

function makeChipStack(count: number, accent: number, cardW: number): Container {
  const stack = new Container();
  const r = cardW * 0.22;
  for (let i = 0; i < Math.min(count, 6); i++) {
    const chip = new Graphics();
    // Chip body
    chip
      .circle(0, 0, r)
      .fill({ color: 0x2a1604, alpha: 1 })
      .stroke({ color: 0xffe4a3, alpha: 0.8, width: 1.4 });
    chip.circle(0, 0, r * 0.88).fill({ color: accent, alpha: 0.92 });
    // Chip notches
    for (let j = 0; j < 8; j++) {
      const a = (Math.PI * 2 * j) / 8;
      chip
        .roundRect(
          Math.cos(a) * r * 0.78 - r * 0.08,
          Math.sin(a) * r * 0.78 - r * 0.24,
          r * 0.16,
          r * 0.48,
          r * 0.06,
        )
        .fill({ color: 0xffffff, alpha: 0.25 });
    }
    chip.circle(0, 0, r * 0.52).stroke({ color: 0x000000, alpha: 0.4, width: 1.2 });
    // Specular highlight
    chip.ellipse(-r * 0.24, -r * 0.28, r * 0.32, r * 0.2).fill({ color: 0xffffff, alpha: 0.38 });
    chip.y = -i * r * 0.28;
    stack.addChild(chip);
  }
  return stack;
}

async function buildBJScene(
  host: HTMLDivElement,
  props: PixiBJTableProps,
): Promise<BJScene | null> {
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

  app.canvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;";
  host.appendChild(app.canvas);

  const layout = buildLayout(w, h);
  const table = buildTableScene(app, layout, "blackjack", reducedMotion);

  // Zones
  const dealerContainer = new Container();
  const playerContainer = new Container();
  const chipContainer = new Container();

  // Bet zone marker (where chips land)
  const betZone = new Graphics();
  const bzW = layout.cardW * 2.8;
  const bzH = layout.cardH * 0.38;
  betZone
    .roundRect(-bzW / 2, -bzH / 2, bzW, bzH, bzH / 2)
    .fill({ color: 0xffc857, alpha: 0.07 })
    .stroke({ color: 0xffc857, alpha: 0.35, width: 1.2 });
  betZone.x = layout.cx;
  betZone.y = layout.h * 0.6;

  // Win/bust overlay
  const winOverlay = new Graphics();
  winOverlay.roundRect(0, 0, w, h, 0).fill({ color: 0x22c55e, alpha: 0 });
  winOverlay.x = 0;
  winOverlay.y = 0;
  winOverlay.alpha = 0;

  table.cardLayer.addChild(betZone, dealerContainer, playerContainer, chipContainer);
  table.fxLayer.addChild(winOverlay);

  // Load textures
  const allCards = [...props.dealerCards, ...props.playerCards];
  const [cardBack, cardFaces] = await Promise.all([loadCardBack(), loadCardFaces(allCards)]);

  const scene: BJScene = {
    table,
    dealerContainer,
    playerContainer,
    chipContainer,
    betZone,
    winOverlay,
    tweens: [],
    sparks: [],
    cardBack,
    cardFaces,
    layout,
    lastEventKey: "",
    lastBet: 0,
  };

  return scene;
}

function renderBJCards(scene: BJScene, props: PixiBJTableProps) {
  const { layout, dealerContainer, playerContainer, chipContainer, cardBack, cardFaces } = scene;
  const accent = accentNum(props.accent);
  const { cardW, cardH, cx, h } = layout;

  // Clear
  scene.tweens = [];
  dealerContainer.removeChildren().forEach((c) => c.destroy());

  playerContainer.removeChildren().forEach((c) => c.destroy());
  chipContainer.removeChildren().forEach((c) => c.destroy());

  // Dealer cards (top area)
  const dealerY = h * 0.28;
  const dCount = props.dealerCards.length;
  const dSpacing = Math.min(cardW * 0.55, (layout.w * 0.7) / Math.max(dCount, 1));
  const dStartX = cx - ((dCount - 1) * dSpacing) / 2;

  props.dealerCards.forEach((id, i) => {
    const isHole = props.phase === "player" && i === 1;
    const card = makeCardSprite({
      cardW,
      cardH,
      faceDown: isHole,
      faceTex: cardFaces.get(id) ?? null,
      backTex: cardBack,
      accent,
    });
    card.x = dStartX + i * dSpacing;
    card.y = dealerY;
    card.rotation = (i - (dCount - 1) / 2) * 0.03;

    // Deal animation
    if (!scene.table.reducedMotion) {
      const tw = tween(
        card,
        { x: cx, y: h * -0.1, alpha: 0, scaleX: 0.6, scaleY: 0.6 },
        { x: card.x, y: card.y, alpha: 1, scaleX: 1, scaleY: 1 },
        0.38,
        { ease: ease.outBack, delay: i * 0.09 },
      );
      scene.tweens.push(tw);
    }
    dealerContainer.addChild(card);
  });

  // Player cards (bottom area)
  const playerY = h * 0.68;
  const pCount = props.playerCards.length;
  const pSpacing = Math.min(cardW * 0.55, (layout.w * 0.78) / Math.max(pCount, 1));
  const pStartX = cx - ((pCount - 1) * pSpacing) / 2;
  const isPlayerPhase = props.phase === "player";

  props.playerCards.forEach((id, i) => {
    const card = makeCardSprite({
      cardW,
      cardH,
      faceDown: false,
      faceTex: cardFaces.get(id) ?? null,
      backTex: cardBack,
      accent,
    });
    card.x = pStartX + i * pSpacing;
    card.y = playerY;
    card.rotation = (i - (pCount - 1) / 2) * 0.04;

    // Selected player cards lift slightly
    if (isPlayerPhase) {
      card.y -= 4;
      // Glow on player cards during play phase
      const glow = new Graphics();
      glow
        .roundRect(-cardW / 2 - 3, -cardH / 2 - 3, cardW + 6, cardH + 6, cardW * 0.12)
        .fill({ color: accent, alpha: 0.18 });
      card.addChildAt(glow, 0);
    }

    if (!scene.table.reducedMotion) {
      const tw = tween(
        card,
        { x: cx, y: h * -0.1, alpha: 0, scaleX: 0.6, scaleY: 0.6 },
        { x: card.x, y: card.y, alpha: 1, scaleX: 1, scaleY: 1 },
        0.4,
        { ease: ease.outBack, delay: i * 0.1 + 0.05 },
      );
      scene.tweens.push(tw);
    }
    playerContainer.addChild(card);
  });

  // Chip stack at bet zone (shows when bet > 0 or in player/settled phase)
  if (props.bet > 0 && props.phase !== "betting") {
    const chipCount = Math.max(1, Math.min(Math.ceil(props.bet / 100), 8));
    const chips = makeChipStack(chipCount, 0xffc857, cardW);
    chips.x = cx;
    chips.y = h * 0.59;
    chipContainer.addChild(chips);
  }

  // Result overlay effects
  if (props.result && props.phase === "settled") {
    const isWin = props.result === "win" || props.result === "blackjack";
    const isBust = props.result === "lose";
    const isPush = props.result === "push";

    const overlayColor = isWin ? 0x22c55e : isBust ? 0xef4444 : 0xffc857;

    scene.winOverlay.clear();
    scene.winOverlay.roundRect(0, 0, layout.w, layout.h, 0).fill({ color: overlayColor, alpha: 0 });

    // Animate the overlay pulse
    if (!scene.table.reducedMotion) {
      const pulse = tween(scene.winOverlay, { alpha: 0.14 }, { alpha: 0 }, 0.9, {
        ease: ease.outQuart,
      });
      scene.tweens.push(pulse);
      // Burst
      scene.sparks.push(
        ...emitBurst(scene.table, cx, h * 0.5, overlayColor, isWin ? 36 : isBust ? 24 : 16),
      );
    }
  }
}

const PixiBlackjackTable: React.FC<PixiBJTableProps> = (props) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<BJScene | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let ro: ResizeObserver | null = null;

    async function init() {
      const scene = await buildBJScene(host!, propsRef.current);
      if (disposed || !scene) {
        scene?.table.app.destroy(
          { removeView: true, releaseGlobalResources: true },
          { children: true, texture: false },
        );
        return;
      }
      sceneRef.current = scene;
      renderBJCards(scene, propsRef.current);
      scene.lastEventKey = propsRef.current.eventKey;
      scene.lastBet = propsRef.current.bet;

      ro = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        const w = Math.max(1, width);
        const h = Math.max(1, height);
        if (!sceneRef.current) return;
        sceneRef.current.table.app.renderer.resize(w, h);
        sceneRef.current.layout = buildLayout(w, h);
        sceneRef.current.table.layout = sceneRef.current.layout;
        renderBJCards(sceneRef.current, propsRef.current);
      });
      ro.observe(host!);

      scene.table.app.ticker.add((ticker: Ticker) => {
        const dt = Math.min(ticker.deltaMS / 1000, 0.05);
        const s = sceneRef.current;
        if (!s) return;
        tickTableScene(s.table, dt);

        // Tween system
        s.tweens = s.tweens.filter((tw) => tickTween(tw, dt));
        s.sparks = tickSparks(s.sparks, dt);

        // Detect state change
        const p = propsRef.current;
        if (p.eventKey !== s.lastEventKey) {
          // Reload card face textures for any new cards, then re-render
          const newCards = [...p.dealerCards, ...p.playerCards].filter(
            (id) => !s.cardFaces.has(id),
          );
          if (newCards.length > 0) {
            loadCardFaces(newCards).then((newFaces) => {
              newFaces.forEach((tex, id) => s.cardFaces.set(id, tex));
              if (sceneRef.current === s) renderBJCards(s, propsRef.current);
            });
          } else {
            renderBJCards(s, propsRef.current);
          }
          s.lastEventKey = p.eventKey;
          s.lastBet = p.bet;
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

export default PixiBlackjackTable;
