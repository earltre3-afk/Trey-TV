import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as Application, C as Container, G as Graphics } from "../_libs/pixi.js.mjs";
import { b as buildLayout, a as loadCardBack, s as seatCenter, f as fanLayout, l as loadCardFaces } from "./GameRoomModule-B9ywzUMa.mjs";
import { d as destroyTableScene, t as tickTableScene, a as tickTween, b as tickSparks, c as buildTableScene, m as makeCardSprite, e as tween, g as ease, f as emitBurst } from "./pixiAnimations-DWQQaIfT.mjs";
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
async function buildSpadesScene(host, props) {
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
  app.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
  host.appendChild(app.canvas);
  const layout = buildLayout(w, h);
  const table = buildTableScene(app, layout, "spades", reducedMotion);
  const seatContainers = [0, 1, 2, 3].map(() => new Container());
  const centerContainer = new Container();
  const handContainer = new Container();
  const turnRing = new Graphics();
  turnRing.circle(0, 0, layout.cardW * 0.85).stroke({ color: 16762967, alpha: 0.72, width: 2 });
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
    cardFaces: /* @__PURE__ */ new Map(),
    layout,
    lastEventKey: ""
  };
}
function renderSpades(scene, props) {
  const { layout, seatContainers, centerContainer, handContainer, cardBack, cardFaces } = scene;
  const accent = accentNum(props.accent);
  const { cardW, cardH, cx, cy, w, h } = layout;
  seatContainers.forEach((c) => c.removeChildren().forEach((ch) => ch.destroy()));
  centerContainer.removeChildren().forEach((c) => c.destroy());
  handContainer.removeChildren().forEach((c) => c.destroy());
  [1, 2, 3].forEach((relSeat) => {
    const absSeat = (props.mySeat + relSeat) % 4;
    const pos = seatCenter(absSeat, layout, props.mySeat);
    const count = props.hands[absSeat]?.length ?? 0;
    const isActive = props.currentSeat === absSeat;
    const stackCount = Math.min(count, 5);
    const container = seatContainers[absSeat];
    container.x = pos.x;
    container.y = pos.y;
    for (let i = 0; i < stackCount; i++) {
      const card = makeCardSprite({
        cardW: cardW * 0.66,
        cardH: cardH * 0.66,
        faceDown: true,
        backTex: cardBack,
        accent
      });
      const isHoriz = relSeat === 2;
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
  const trickCenterY = cy - cardH * 0.18;
  const trickSlots = {
    0: { x: cx, y: trickCenterY + cardH * 0.5, r: 0 },
    // bottom
    1: { x: cx - cardW * 0.74, y: trickCenterY, r: -0.025 },
    // left
    2: { x: cx, y: trickCenterY - cardH * 0.5, r: 0 },
    // top
    3: { x: cx + cardW * 0.74, y: trickCenterY, r: 0.025 }
    // right
  };
  const inset = new Graphics();
  inset.roundRect(cx - cardW * 1.4, trickCenterY - cardH * 0.96, cardW * 2.8, cardH * 1.92, cardW * 0.28).fill({ color: 133141, alpha: 0.24 }).stroke({ color: accent, alpha: 0.14, width: 1 });
  centerContainer.addChild(inset);
  const innerGlow = new Graphics();
  innerGlow.ellipse(cx, trickCenterY, cardW * 1.42, cardH * 0.88).fill({ color: accent, alpha: props.trick.length > 0 ? 0.045 : 0.018 });
  centerContainer.addChild(innerGlow);
  const slotW = cardW * 0.88;
  const slotH = cardH * 0.88;
  const slotR = slotW * 0.1;
  Object.values(trickSlots).forEach(({ x, y }) => {
    const slotBg = new Graphics();
    slotBg.roundRect(x - slotW / 2, y - slotH / 2, slotW, slotH, slotR).fill({ color: 16777215, alpha: props.trick.length > 0 ? 0.02 : 8e-3 }).stroke({ color: accent, alpha: props.trick.length > 0 ? 0.16 : 0.075, width: 1 });
    centerContainer.addChild(slotBg);
  });
  props.trick.forEach(({ seat, cardId }) => {
    const relSeat = (seat - props.mySeat + 4) % 4;
    const slot = trickSlots[relSeat];
    const card = makeCardSprite({
      cardW: cardW * 0.88,
      cardH: cardH * 0.88,
      faceDown: false,
      faceTex: cardFaces.get(cardId) ?? null,
      cardId,
      backTex: cardBack,
      accent
    });
    card.x = slot.x;
    card.y = slot.y;
    card.rotation = slot.r;
    if (!scene.table.reducedMotion) {
      const fromPos = seatCenter(seat, layout, props.mySeat);
      const tw = tween(
        card,
        { x: fromPos.x, y: fromPos.y, scaleX: 0.5, scaleY: 0.5, alpha: 0.5 },
        { x: card.x, y: card.y, scaleX: 1, scaleY: 1, alpha: 1 },
        0.34,
        { ease: ease.outCubic }
      );
      scene.tweens.push(tw);
    }
    centerContainer.addChild(card);
  });
  if (props.winnerSeat !== null) {
    const winPos = seatCenter(props.winnerSeat, layout, props.mySeat);
    if (!scene.table.reducedMotion) {
      scene.sparks.push(...emitBurst(scene.table, winPos.x, winPos.y, 16762967, 28));
      const sweepGlow = new Graphics();
      sweepGlow.circle(0, 0, cardW * 0.55).fill({ color: 16762967, alpha: 0.42 });
      sweepGlow.x = cx;
      sweepGlow.y = cy;
      scene.table.fxLayer.addChild(sweepGlow);
      const sw = tween(
        sweepGlow,
        { x: cx, y: cy, scaleX: 0.3, scaleY: 0.3, alpha: 0.72 },
        { x: winPos.x, y: winPos.y, scaleX: 2.2, scaleY: 2.2, alpha: 0 },
        0.72,
        { ease: ease.outCubic, onComplete: () => sweepGlow.destroy() }
      );
      scene.tweens.push(sw);
    }
  }
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
        dimFactor
      });
      card.x = cx + fan.dx;
      card.y = handY + fan.dy + (isSelected ? -handCardH * 0.18 : 0);
      card.rotation = fan.rotation;
      card.scale.set(isSelected ? 1.06 : 1);
      if (isLegal && !isSelected) {
        const glow = new Graphics();
        glow.roundRect(-handCardW / 2 - 2, -handCardH / 2 - 2, handCardW + 4, handCardH + 4, handCardW * 0.13).fill({ color: accent, alpha: 0.12 }).stroke({ color: accent, alpha: 0.55, width: 1.2 });
        card.addChildAt(glow, 0);
      }
      if (isSelected) {
        const selGlow = new Graphics();
        selGlow.roundRect(-handCardW / 2 - 4, -handCardH / 2 - 4, handCardW + 8, handCardH + 8, handCardW * 0.15).fill({ color: 16762967, alpha: 0.18 }).stroke({ color: 16762967, alpha: 0.8, width: 1.8 });
        card.addChildAt(selGlow, 0);
      }
      card.eventMode = "static";
      card.cursor = isLegal ? "pointer" : "default";
      card.on("pointerdown", () => {
        if (isLegal && props.onCardClick) props.onCardClick(cardId);
      });
      handContainer.addChild(card);
    });
  }
}
const PixiSpadesTable = (props) => {
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
      const scene = await buildSpadesScene(host, propsRef.current);
      if (disposed || !scene) {
        scene?.table.app.destroy({ removeView: true, releaseGlobalResources: true }, { children: true, texture: false });
        return;
      }
      sceneRef.current = scene;
      const loadMissingFaces = (s) => {
        const p = propsRef.current;
        const newCards = p.hands.flat().concat(p.trick.map((t) => t.cardId)).filter((id) => !s.cardFaces.has(id));
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
      ro.observe(host);
      scene.table.app.ticker.add((ticker) => {
        const dt = Math.min(ticker.deltaMS / 1e3, 0.05);
        const s = sceneRef.current;
        if (!s) return;
        tickTableScene(s.table, dt);
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
  PixiSpadesTable as default
};
