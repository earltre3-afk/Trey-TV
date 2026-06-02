import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as Application, C as Container, G as Graphics } from "../_libs/pixi.js.mjs";
import { b as buildLayout, l as loadCardFaces, a as loadCardBack } from "./GameRoomModule-B9ywzUMa.mjs";
import { d as destroyTableScene, t as tickTableScene, a as tickTween, b as tickSparks, c as buildTableScene, m as makeCardSprite, e as tween, f as emitBurst, g as ease } from "./pixiAnimations-DWQQaIfT.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import "../_libs/eventemitter3.mjs";
import "../_libs/tiny-lru.mjs";
import "../_libs/parse-svg-path.mjs";
import "../_libs/earcut.mjs";
import "../_libs/ismobilejs.mjs";
import "../_libs/pixi__colord.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./MatchScreen-D5c34u8-.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "./router-BtgGywEC.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/zod.mjs";
import "node:crypto";
import "node:async_hooks";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./supabase-BQ18xbNk.mjs";
import "./useTvRemoteInput-3UKI_f2s.mjs";
function accentNum(hex) {
  return parseInt(hex.replace("#", ""), 16);
}
function makeChipStack(count, accent, cardW) {
  const stack = new Container();
  const r = cardW * 0.22;
  for (let i = 0; i < Math.min(count, 6); i++) {
    const chip = new Graphics();
    chip.circle(0, 0, r).fill({ color: 2758148, alpha: 1 }).stroke({ color: 16770211, alpha: 0.8, width: 1.4 });
    chip.circle(0, 0, r * 0.88).fill({ color: accent, alpha: 0.92 });
    for (let j = 0; j < 8; j++) {
      const a = Math.PI * 2 * j / 8;
      chip.roundRect(
        Math.cos(a) * r * 0.78 - r * 0.08,
        Math.sin(a) * r * 0.78 - r * 0.24,
        r * 0.16,
        r * 0.48,
        r * 0.06
      ).fill({ color: 16777215, alpha: 0.25 });
    }
    chip.circle(0, 0, r * 0.52).stroke({ color: 0, alpha: 0.4, width: 1.2 });
    chip.ellipse(-r * 0.24, -r * 0.28, r * 0.32, r * 0.2).fill({ color: 16777215, alpha: 0.38 });
    chip.y = -i * r * 0.28;
    stack.addChild(chip);
  }
  return stack;
}
async function buildBJScene(host, props) {
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
    powerPreference: "low-power"
  });
  app.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;";
  host.appendChild(app.canvas);
  const layout = buildLayout(w, h);
  const table = buildTableScene(app, layout, "blackjack", reducedMotion);
  const dealerContainer = new Container();
  const playerContainer = new Container();
  const chipContainer = new Container();
  const betZone = new Graphics();
  const bzW = layout.cardW * 2.8;
  const bzH = layout.cardH * 0.38;
  betZone.roundRect(-bzW / 2, -bzH / 2, bzW, bzH, bzH / 2).fill({ color: 16762967, alpha: 0.07 }).stroke({ color: 16762967, alpha: 0.35, width: 1.2 });
  betZone.x = layout.cx;
  betZone.y = layout.h * 0.6;
  const winOverlay = new Graphics();
  winOverlay.roundRect(0, 0, w, h, 0).fill({ color: 2278750, alpha: 0 });
  winOverlay.x = 0;
  winOverlay.y = 0;
  winOverlay.alpha = 0;
  table.cardLayer.addChild(betZone, dealerContainer, playerContainer, chipContainer);
  table.fxLayer.addChild(winOverlay);
  const allCards = [...props.dealerCards, ...props.playerCards];
  const [cardBack, cardFaces] = await Promise.all([
    loadCardBack(),
    loadCardFaces(allCards)
  ]);
  const scene = {
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
    lastBet: 0
  };
  return scene;
}
function renderBJCards(scene, props) {
  const { layout, dealerContainer, playerContainer, chipContainer, cardBack, cardFaces } = scene;
  const accent = accentNum(props.accent);
  const { cardW, cardH, cx, h } = layout;
  dealerContainer.removeChildren().forEach((c) => c.destroy());
  playerContainer.removeChildren().forEach((c) => c.destroy());
  chipContainer.removeChildren().forEach((c) => c.destroy());
  const dealerY = h * 0.28;
  const dCount = props.dealerCards.length;
  const dSpacing = Math.min(cardW * 0.55, layout.w * 0.7 / Math.max(dCount, 1));
  const dStartX = cx - (dCount - 1) * dSpacing / 2;
  props.dealerCards.forEach((id, i) => {
    const isHole = props.phase === "player" && i === 1;
    const card = makeCardSprite({
      cardW,
      cardH,
      faceDown: isHole,
      faceTex: cardFaces.get(id) ?? null,
      backTex: cardBack,
      accent
    });
    card.x = dStartX + i * dSpacing;
    card.y = dealerY;
    card.rotation = (i - (dCount - 1) / 2) * 0.03;
    if (!scene.table.reducedMotion) {
      const tw = tween(
        card,
        { x: cx, y: h * -0.1, alpha: 0, scaleX: 0.6, scaleY: 0.6 },
        { x: card.x, y: card.y, alpha: 1, scaleX: 1, scaleY: 1 },
        0.38,
        { ease: ease.outBack, delay: i * 0.09 }
      );
      scene.tweens.push(tw);
    }
    dealerContainer.addChild(card);
  });
  const playerY = h * 0.68;
  const pCount = props.playerCards.length;
  const pSpacing = Math.min(cardW * 0.55, layout.w * 0.78 / Math.max(pCount, 1));
  const pStartX = cx - (pCount - 1) * pSpacing / 2;
  const isPlayerPhase = props.phase === "player";
  props.playerCards.forEach((id, i) => {
    const card = makeCardSprite({
      cardW,
      cardH,
      faceDown: false,
      faceTex: cardFaces.get(id) ?? null,
      backTex: cardBack,
      accent
    });
    card.x = pStartX + i * pSpacing;
    card.y = playerY;
    card.rotation = (i - (pCount - 1) / 2) * 0.04;
    if (isPlayerPhase) {
      card.y -= 4;
      const glow = new Graphics();
      glow.roundRect(-cardW / 2 - 3, -cardH / 2 - 3, cardW + 6, cardH + 6, cardW * 0.12).fill({ color: accent, alpha: 0.18 });
      card.addChildAt(glow, 0);
    }
    if (!scene.table.reducedMotion) {
      const tw = tween(
        card,
        { x: cx, y: h * -0.1, alpha: 0, scaleX: 0.6, scaleY: 0.6 },
        { x: card.x, y: card.y, alpha: 1, scaleX: 1, scaleY: 1 },
        0.4,
        { ease: ease.outBack, delay: i * 0.1 + 0.05 }
      );
      scene.tweens.push(tw);
    }
    playerContainer.addChild(card);
  });
  if (props.bet > 0 && props.phase !== "betting") {
    const chipCount = Math.max(1, Math.min(Math.ceil(props.bet / 100), 8));
    const chips = makeChipStack(chipCount, 16762967, cardW);
    chips.x = cx;
    chips.y = h * 0.59;
    chipContainer.addChild(chips);
  }
  if (props.result && props.phase === "settled") {
    const isWin = props.result === "win" || props.result === "blackjack";
    const isBust = props.result === "lose";
    props.result === "push";
    const overlayColor = isWin ? 2278750 : isBust ? 15680580 : 16762967;
    scene.winOverlay.clear();
    scene.winOverlay.roundRect(0, 0, layout.w, layout.h, 0).fill({ color: overlayColor, alpha: 0 });
    if (!scene.table.reducedMotion) {
      const pulse = tween(
        scene.winOverlay,
        { alpha: 0.14 },
        { alpha: 0 },
        0.9,
        { ease: ease.outQuart }
      );
      scene.tweens.push(pulse);
      scene.sparks.push(...emitBurst(scene.table, cx, h * 0.5, overlayColor, isWin ? 36 : isBust ? 24 : 16));
    }
  }
}
const PixiBlackjackTable = (props) => {
  const hostRef = reactExports.useRef(null);
  const sceneRef = reactExports.useRef(null);
  const propsRef = reactExports.useRef(props);
  propsRef.current = props;
  reactExports.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let ro = null;
    async function init() {
      const scene = await buildBJScene(host, propsRef.current);
      if (disposed || !scene) {
        scene?.table.app.destroy({ removeView: true, releaseGlobalResources: true }, { children: true, texture: false });
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
      ro.observe(host);
      scene.table.app.ticker.add((ticker) => {
        const dt = Math.min(ticker.deltaMS / 1e3, 0.05);
        const s = sceneRef.current;
        if (!s) return;
        tickTableScene(s.table, dt);
        s.tweens = s.tweens.filter((tw) => tickTween(tw, dt));
        s.sparks = tickSparks(s.sparks, dt);
        const p = propsRef.current;
        if (p.eventKey !== s.lastEventKey) {
          const newCards = [...p.dealerCards, ...p.playerCards].filter((id) => !s.cardFaces.has(id));
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref: hostRef,
      className: props.className,
      "aria-hidden": "true",
      style: { position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit" }
    }
  );
};
export {
  PixiBlackjackTable as default
};
