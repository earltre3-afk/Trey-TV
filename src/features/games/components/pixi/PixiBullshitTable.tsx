/**
 * PixiBullshitTable.tsx
 * Full Pixi-rendered Bullshit/Cheat table scene.
 *
 * Renders:
 *   - Purple luxury table surface
 *   - 3 opponent card stacks (top grid zone)
 *   - Center pile (face-down stacked cards with pile count)
 *   - Reveal animation: cards fly from pile to center and flip
 *   - Dramatic "BULLSHIT!" burst when bluff is caught
 *   - Player hand at bottom (same as Spades fan)
 *   - Pile shake during awaiting-challenge
 *   - Call BS dramatic sequence
 *
 * React controls: Claim button, Call BS, Pass, header, game-over modal.
 */
import React, { useEffect, useRef } from "react";
import { Application, Container, Graphics, Ticker } from "pixi.js";
import { buildLayout, fanLayout, type TableLayout } from "./pixiLayout";
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

export interface PixiBullshitProps {
  myHand: string[];
  /** Opponent hands [{ name, cardCount }, ...] */
  opponents: Array<{ name: string; cardCount: number }>;
  /** Cards in the pile (face-down) */
  pileCount: number;
  /** Revealed cards during a reveal event */
  revealCards: string[] | null;
  /** Whether the reveal was a lie or truth */
  revealLiar: boolean | null;
  /** Is awaiting challenge (pile shaking) */
  awaitingChallenge: boolean;
  /** Selected card IDs in player's hand */
  selectedCards: string[];
  /** Is it the player's turn to claim */
  isMyTurn: boolean;
  /** Expected rank string (e.g. "5") */
  expectedRank: string;
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

interface BSScene {
  table: TableScene;
  pileContainer: Container;
  revealContainer: Container;
  handContainer: Container;
  opponentContainers: Container[];
  pileShakeOffset: number;
  pileShakeDelta: number;
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

async function buildBSScene(
  host: HTMLDivElement,
  props: PixiBullshitProps,
): Promise<BSScene | null> {
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
  const table = buildTableScene(app, layout, "bullshit", reducedMotion);

  const pileContainer = new Container();
  const revealContainer = new Container();
  const handContainer = new Container();
  const opponentContainers = [0, 1, 2].map(() => new Container());

  table.cardLayer.addChild(pileContainer, revealContainer, ...opponentContainers, handContainer);

  const allCards = props.myHand.concat(props.revealCards ?? []);
  const [cardBack, cardFaces] = await Promise.all([loadCardBack(), loadCardFaces(allCards)]);

  return {
    table,
    pileContainer,
    revealContainer,
    handContainer,
    opponentContainers,
    pileShakeOffset: 0,
    pileShakeDelta: 0,
    tweens: [],
    sparks: [],
    cardBack,
    cardFaces,
    layout,
    lastEventKey: "",
  };
}

function renderBS(scene: BSScene, props: PixiBullshitProps) {
  const {
    layout,
    pileContainer,
    revealContainer,
    handContainer,
    opponentContainers,
    cardBack,
    cardFaces,
  } = scene;
  const accent = accentNum(props.accent);
  const { cardW, cardH, cx, cy, w, h } = layout;

  // Clear
  scene.tweens = [];
  pileContainer.removeChildren().forEach((c) => c.destroy());

  revealContainer.removeChildren().forEach((c) => c.destroy());
  handContainer.removeChildren().forEach((c) => c.destroy());
  opponentContainers.forEach((c) => c.removeChildren().forEach((ch) => ch.destroy()));

  // ── Opponent card stacks (top 3 zones) ─────────────────────
  const oppCount = Math.min(props.opponents.length, 3);
  const oppZoneW = w / oppCount;
  props.opponents.slice(0, 3).forEach((opp, i) => {
    const oz = opponentContainers[i];
    const oxCenter = oppZoneW * i + oppZoneW / 2;
    oz.x = 0;
    oz.y = 0;

    const stackCount = Math.min(opp.cardCount, 4);
    for (let j = 0; j < stackCount; j++) {
      const card = makeCardSprite({
        cardW: cardW * 0.68,
        cardH: cardH * 0.68,
        faceDown: true,
        backTex: cardBack,
        accent,
      });
      card.x = oxCenter + (j - (stackCount - 1) / 2) * cardW * 0.18;
      card.y = h * 0.19 + j * -2.5; // shifted down from 0.14 to sit below avatar at 8%
      card.rotation = (j - (stackCount - 1) / 2) * 0.04;
      oz.addChild(card);
    }
  });

  // ── Center pile ─────────────────────────────────────────────
  const pileY = cy - cardH * 0.1;
  const displayCount = Math.min(props.pileCount, 8);

  if (!props.revealCards) {
    for (let i = 0; i < displayCount; i++) {
      const card = makeCardSprite({
        cardW: cardW * 0.88,
        cardH: cardH * 0.88,
        faceDown: true,
        backTex: cardBack,
        accent,
      });
      card.x = cx + (i - displayCount / 2) * cardW * 0.08 + Math.random() * 3 - 1.5;
      card.y = pileY - i * 1.6;
      card.rotation = (Math.random() - 0.5) * 0.12;
      pileContainer.addChild(card);
    }

    // Pile count badge
    if (props.pileCount > 0) {
      const badge = new Graphics();
      const bR = cardW * 0.28;
      badge
        .circle(0, 0, bR)
        .fill({ color: 0x1a0a2a, alpha: 0.88 })
        .stroke({ color: accent, alpha: 0.7, width: 1.4 });
      badge.x = cx + cardW * 0.36;
      badge.y = pileY - displayCount * 1.6 - bR * 0.8;
      pileContainer.addChild(badge);
    }

    // Awaiting-challenge pile shake is handled in ticker
  }

  // ── Reveal sequence ─────────────────────────────────────────
  if (props.revealCards && props.revealCards.length > 0) {
    const revealCount = props.revealCards.length;
    const isLiar = props.revealLiar === true;
    const isTruth = props.revealLiar === false;
    const revealColor = isLiar ? 0xef4444 : isTruth ? 0x22c55e : accent;

    props.revealCards.forEach((id, i) => {
      const card = makeCardSprite({
        cardW: cardW * 0.92,
        cardH: cardH * 0.92,
        faceDown: false,
        faceTex: cardFaces.get(id) ?? null,
        backTex: cardBack,
        accent: revealColor,
      });
      const spacing = Math.min(cardW * 0.72, (w * 0.75) / Math.max(revealCount, 1));
      const startX = cx - ((revealCount - 1) * spacing) / 2;
      card.x = startX + i * spacing;
      card.y = cy;
      card.rotation = (i - (revealCount - 1) / 2) * 0.05;

      // Reveal glow ring
      const glow = new Graphics();
      glow
        .roundRect(-cardW / 2 - 4, -cardH / 2 - 4, cardW + 8, cardH + 8, cardW * 0.14)
        .fill({ color: revealColor, alpha: 0.22 })
        .stroke({ color: revealColor, alpha: 0.75, width: 2 });
      card.addChildAt(glow, 0);

      if (!scene.table.reducedMotion) {
        const tw = tween(
          card,
          { y: pileY, scaleX: 0.4, scaleY: 0.4, alpha: 0, rotation: Math.PI / 2 },
          { y: card.y, scaleX: 1, scaleY: 1, alpha: 1, rotation: card.rotation },
          0.55,
          { ease: ease.outBack, delay: i * 0.08 },
        );
        scene.tweens.push(tw);
      }
      revealContainer.addChild(card);
    });

    // Dramatic burst
    if (!scene.table.reducedMotion) {
      scene.sparks.push(...emitBurst(scene.table, cx, cy, revealColor, isLiar ? 48 : 28));
    }
  }

  // ── Player hand at bottom ───────────────────────────────────
  if (props.renderHand !== false) {
    const myHand = props.myHand;
    const handCardW = cardW * 0.9;
    const handCardH = cardH * 0.9;
    const fanItems = fanLayout(myHand.length, handCardW, w * 0.64, handCardH * 0.1);
    const handY = h * 0.7;

    myHand.forEach((cardId, i) => {
      const fan = fanItems[i];
      const isSel = props.selectedCards.includes(cardId);

      const card = makeCardSprite({
        cardW: handCardW,
        cardH: handCardH,
        faceDown: false,
        faceTex: cardFaces.get(cardId) ?? null,
        backTex: cardBack,
        accent,
      });
      card.x = cx + fan.dx;
      card.y = handY + fan.dy + (isSel ? -handCardH * 0.18 : 0);
      card.rotation = fan.rotation;
      card.scale.set(isSel ? 1.06 : 1);

      if (isSel) {
        const selGlow = new Graphics();
        selGlow
          .roundRect(
            -handCardW / 2 - 4,
            -handCardH / 2 - 4,
            handCardW + 8,
            handCardH + 8,
            handCardW * 0.15,
          )
          .fill({ color: accent, alpha: 0.18 })
          .stroke({ color: accent, alpha: 0.8, width: 1.8 });
        card.addChildAt(selGlow, 0);
      }

      // Interactivity
      card.eventMode = "static";
      card.cursor = "pointer";
      card.on("pointerdown", () => {
        if (props.onCardClick) props.onCardClick(cardId);
      });

      handContainer.addChild(card);
    });
  }
}

const PixiBullshitTable: React.FC<PixiBullshitProps> = (props) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<BSScene | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let ro: ResizeObserver | null = null;

    async function init() {
      const scene = await buildBSScene(host!, propsRef.current);
      if (disposed || !scene) {
        scene?.table.app.destroy(
          { removeView: true, releaseGlobalResources: true },
          { children: true, texture: false },
        );
        return;
      }
      sceneRef.current = scene;

      const allCards = propsRef.current.myHand.concat(propsRef.current.revealCards ?? []);
      const newFaces = await loadCardFaces(allCards.filter((id) => !scene.cardFaces.has(id)));
      newFaces.forEach((t, id) => scene.cardFaces.set(id, t));

      renderBS(scene, propsRef.current);
      scene.lastEventKey = propsRef.current.eventKey;

      ro = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        if (!sceneRef.current) return;
        sceneRef.current.table.app.renderer.resize(Math.max(1, width), Math.max(1, height));
        sceneRef.current.layout = buildLayout(Math.max(1, width), Math.max(1, height));
        sceneRef.current.table.layout = sceneRef.current.layout;
        renderBS(sceneRef.current, propsRef.current);
      });
      ro.observe(host!);

      scene.table.app.ticker.add((ticker: Ticker) => {
        const dt = Math.min(ticker.deltaMS / 1000, 0.05);
        const s = sceneRef.current;
        if (!s) return;
        tickTableScene(s.table, dt);

        // Pile shake when awaiting challenge
        if (propsRef.current.awaitingChallenge && !s.table.reducedMotion) {
          s.pileShakeDelta += dt;
          s.pileContainer.x = Math.sin(s.pileShakeDelta * 22) * 3.5;
        } else {
          s.pileContainer.x = 0;
          s.pileShakeDelta = 0;
        }

        s.tweens = s.tweens.filter((tw) => tickTween(tw, dt));
        s.sparks = tickSparks(s.sparks, dt);

        const p = propsRef.current;
        if (p.eventKey !== s.lastEventKey) {
          const newCards = p.myHand
            .concat(p.revealCards ?? [])
            .filter((id) => !s.cardFaces.has(id));
          if (newCards.length > 0) {
            loadCardFaces(newCards).then((newFaces) => {
              newFaces.forEach((tex, id) => s.cardFaces.set(id, tex));
              if (sceneRef.current === s) renderBS(s, propsRef.current);
            });
          } else {
            renderBS(s, propsRef.current);
          }
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

export default PixiBullshitTable;
