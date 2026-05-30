import { C as Container, G as Graphics, S as Sprite, T as Text } from "../_libs/pixi.js.mjs";
const STYLE_COLORS = {
  blackjack: { felt: 663322, rim: 2759172, spot: 16762967, glow: 16762967 },
  spades: { felt: 463648, rim: 333864, spot: 47103, glow: 47103 },
  bullshit: { felt: 1181738, rim: 918560, spot: 11032055, glow: 11032055 }
};
function buildTableScene(app, layout, style, reducedMotion) {
  const root = new Container();
  const tableLayer = new Container();
  const cardLayer = new Container();
  const fxLayer = new Container();
  root.addChild(tableLayer, cardLayer, fxLayer);
  app.stage.addChild(root);
  const colors = STYLE_COLORS[style];
  const { w, h } = layout;
  const rim = new Graphics();
  const rimPad = Math.min(w, h) * 0.032;
  rim.roundRect(0, 0, w, h, Math.min(28, w * 0.07)).fill({ color: colors.rim, alpha: 0 });
  tableLayer.addChild(rim);
  const felt = new Graphics();
  felt.roundRect(rimPad, rimPad, w - rimPad * 2, h - rimPad * 2, Math.min(20, w * 0.05)).fill({ color: colors.felt, alpha: 0 });
  tableLayer.addChild(felt);
  const grain = new Graphics();
  const gs = 7;
  for (let gx = rimPad; gx < w - rimPad; gx += gs) {
    grain.moveTo(gx, rimPad).lineTo(gx, h - rimPad);
  }
  grain.stroke({ color: 16777215, alpha: 0.018, width: 0.5 });
  tableLayer.addChild(grain);
  const spotA = new Graphics();
  spotA.ellipse(w / 2, h * 0.25, w * 0.38, h * 0.18).fill({ color: colors.spot, alpha: 0.055 });
  tableLayer.addChild(spotA);
  const spotB = new Graphics();
  spotB.ellipse(w / 2, h * 0.75, w * 0.38, h * 0.18).fill({ color: colors.spot, alpha: 0.04 });
  tableLayer.addChild(spotB);
  const centerGlow = new Graphics();
  centerGlow.circle(w / 2, h / 2, Math.min(w, h) * 0.35).fill({ color: 16777215, alpha: 0.025 });
  tableLayer.addChild(centerGlow);
  const centerRing = new Graphics();
  const cr = Math.min(w, h) * 0.16;
  centerRing.circle(w / 2, h / 2, cr).fill({ color: colors.glow, alpha: 0.025 }).stroke({ color: colors.glow, alpha: 0.28, width: 1.2 });
  centerRing.circle(w / 2, h / 2, cr * 0.65).stroke({ color: 16777215, alpha: 0.06, width: 0.8 });
  tableLayer.addChild(centerRing);
  const vig = new Graphics();
  vig.roundRect(rimPad, rimPad, w - rimPad * 2, h - rimPad * 2, Math.min(20, w * 0.05)).fill({ color: 0, alpha: 0 }).stroke({ color: 0, alpha: 0 });
  vig.roundRect(rimPad + 4, rimPad + 4, w - rimPad * 2 - 8, h - rimPad * 2 - 8, Math.min(18, w * 0.04)).fill({ color: 0, alpha: 0 });
  tableLayer.addChild(vig);
  const sheen = new Graphics();
  sheen.ellipse(w / 2, rimPad + h * 0.06, w * 0.48, h * 0.06).fill({ color: 16777215, alpha: 0.045 });
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
    centerRing
  };
}
function tickTableScene(scene, dt) {
  scene.time += dt;
  if (scene.reducedMotion) return;
  const t = scene.time;
  STYLE_COLORS[scene.style];
  const pulse = 0.5 + Math.sin(t * 0.6) * 0.5;
  scene.centerRing.alpha = 0.6 + pulse * 0.4;
  scene.spotA.alpha = 0.85 + pulse * 0.15;
  scene.spotB.alpha = 0.8 + pulse * 0.2;
}
function emitBurst(scene, x, y, color, count = 20) {
  const sparks = [];
  const n = scene.reducedMotion ? Math.min(count, 8) : count;
  for (let i = 0; i < n; i++) {
    const angle = Math.PI * 2 * i / n + Math.random() * 0.5;
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
      ttl: 0.5 + Math.random() * 0.4
    });
  }
  return sparks;
}
function tickSparks(sparks, dt) {
  return sparks.filter((s) => {
    s.life += dt;
    s.g.x = s.g.x += s.vx * dt;
    s.g.y = s.g.y += s.vy * dt;
    s.vx *= 0.982;
    s.vy *= 0.982;
    s.g.alpha = Math.max(0, 1 - s.life / s.ttl);
    s.g.scale.set(1 + s.life / s.ttl * 1.2);
    if (s.life >= s.ttl) {
      s.g.destroy();
      return false;
    }
    return true;
  });
}
function destroyTableScene(scene) {
  scene.app.destroy({ removeView: true, releaseGlobalResources: true }, { children: true, texture: false });
}
function makeCardSprite(opts) {
  const {
    cardW,
    cardH,
    radius = cardW * 0.1,
    faceDown = true,
    faceTex = null,
    cardId,
    backTex = null,
    accent = 47103,
    dimFactor = 1
  } = opts;
  const root = new Container();
  const shadow = new Graphics();
  shadow.roundRect(-cardW / 2 + 3, -cardH / 2 + 6, cardW - 4, cardH - 4, radius + 2).fill({ color: 0, alpha: 0.55 });
  shadow.filters = [];
  shadow.y = 4;
  root.addChild(shadow);
  const body = new Container();
  root.addChild(body);
  if (faceDown && backTex) {
    const sprite = new Sprite(backTex);
    sprite.anchor.set(0.5);
    sprite.width = cardW;
    sprite.height = cardH;
    body.addChild(sprite);
  } else if (!faceDown && faceTex) {
    const sprite = new Sprite(faceTex);
    sprite.anchor.set(0.5);
    sprite.width = cardW;
    sprite.height = cardH;
    body.addChild(sprite);
  } else {
    const cardBg = new Graphics();
    cardBg.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, radius).fill({ color: 463135, alpha: 0.96 }).stroke({ color: accent, alpha: 0.6, width: 1.4 });
    body.addChild(cardBg);
    if (faceDown) {
      const backBg = new Graphics();
      backBg.roundRect(-cardW / 2 + 3, -cardH / 2 + 3, cardW - 6, cardH - 6, radius * 0.7).fill({ color: 265242, alpha: 1 }).stroke({ color: 47103, alpha: 0.28, width: 0.8 });
      body.addChild(backBg);
      const pattern = new Graphics();
      const pw = cardW - 10;
      const ph = cardH - 10;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 3; col++) {
          const px = -pw / 2 + col * (pw / 2) + pw / 4;
          const py = -ph / 2 + row * (ph / 4);
          pattern.rect(px - 2, py - 2, 4, 4).fill({ color: 47103, alpha: 0.15 });
        }
      }
      body.addChild(pattern);
      const ring = new Graphics();
      ring.circle(0, 0, cardW * 0.25).fill({ color: 3354, alpha: 0.9 }).stroke({ color: 47103, alpha: 0.55, width: 1.2 });
      body.addChild(ring);
      const letter = new Graphics();
      const tw = cardW * 0.14;
      const th = cardH * 0.14;
      letter.rect(-tw / 2, -th * 0.5, tw, th * 0.2).fill({ color: 47103, alpha: 0.8 });
      letter.rect(-tw * 0.1, -th * 0.3, tw * 0.2, th * 0.8).fill({ color: 47103, alpha: 0.8 });
      body.addChild(letter);
    } else {
      const cardMeta = parseCardId(cardId);
      const suitFill = cardMeta.suit === "H" ? 15680580 : cardMeta.suit === "D" ? 47103 : cardMeta.suit === "C" ? 2278750 : cardMeta.suit === "S" ? 11032055 : accent;
      const rankGfx = new Graphics();
      rankGfx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, radius).fill({ color: 925488, alpha: 1 });
      body.addChild(rankGfx);
      const diamond = new Graphics();
      const ds = cardW * 0.22;
      diamond.poly([0, -ds, ds, 0, 0, ds, -ds, 0]).fill({ color: suitFill, alpha: 0.25 }).stroke({ color: suitFill, alpha: 0.7, width: 1 });
      body.addChild(diamond);
      const rankStyle = {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: Math.max(10, cardW * 0.22),
        fontWeight: "900",
        fill: 16317180
      };
      const suitStyle = {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: Math.max(10, cardW * 0.18),
        fontWeight: "900",
        fill: suitFill
      };
      const topRank = new Text({ text: cardMeta.rank, style: rankStyle });
      topRank.anchor.set(0, 0);
      topRank.x = -cardW / 2 + cardW * 0.1;
      topRank.y = -cardH / 2 + cardH * 0.07;
      body.addChild(topRank);
      const topSuit = new Text({ text: cardMeta.suit, style: suitStyle });
      topSuit.anchor.set(0, 0);
      topSuit.x = topRank.x;
      topSuit.y = topRank.y + cardH * 0.13;
      body.addChild(topSuit);
      const centerSuit = new Text({ text: cardMeta.suit, style: { ...suitStyle, fontSize: Math.max(16, cardW * 0.34) } });
      centerSuit.anchor.set(0.5);
      centerSuit.x = 0;
      centerSuit.y = 0;
      body.addChild(centerSuit);
      const bottomRank = new Text({ text: cardMeta.rank, style: rankStyle });
      bottomRank.anchor.set(1, 1);
      bottomRank.rotation = Math.PI;
      bottomRank.x = cardW / 2 - cardW * 0.1;
      bottomRank.y = cardH / 2 - cardH * 0.07;
      body.addChild(bottomRank);
      const bottomSuit = new Text({ text: cardMeta.suit, style: suitStyle });
      bottomSuit.anchor.set(1, 1);
      bottomSuit.rotation = Math.PI;
      bottomSuit.x = bottomRank.x;
      bottomSuit.y = bottomRank.y - cardH * 0.13;
      body.addChild(bottomSuit);
    }
  }
  const gloss = new Graphics();
  gloss.roundRect(-cardW / 2 + 2, -cardH / 2 + 2, cardW - 4, cardH * 0.38, radius * 0.8).fill({ color: 16777215, alpha: 0.1 });
  root.addChild(gloss);
  if (dimFactor < 1) {
    root.alpha = 0.45 + dimFactor * 0.55;
  }
  return root;
}
function parseCardId(cardId) {
  if (!cardId || cardId.length < 2) return { rank: "?", suit: "?" };
  return {
    rank: cardId.slice(0, -1).toUpperCase(),
    suit: cardId.slice(-1).toUpperCase()
  };
}
const ease = {
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  outBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
};
function tickTween(tween2, dt) {
  if ((tween2.delay ?? 0) > 0) {
    tween2.delay = (tween2.delay ?? 0) - dt;
    return true;
  }
  tween2.elapsed += dt;
  const raw = Math.min(tween2.elapsed / tween2.duration, 1);
  const t = tween2.easeFn(raw);
  const { obj, from, to } = tween2;
  if (from.x !== void 0 && to.x !== void 0) obj.x = from.x + (to.x - from.x) * t;
  if (from.y !== void 0 && to.y !== void 0) obj.y = from.y + (to.y - from.y) * t;
  if (from.rotation !== void 0 && to.rotation !== void 0) obj.rotation = from.rotation + (to.rotation - from.rotation) * t;
  if (from.alpha !== void 0 && to.alpha !== void 0) obj.alpha = from.alpha + (to.alpha - from.alpha) * t;
  if (from.scaleX !== void 0 && to.scaleX !== void 0) obj.scale.x = from.scaleX + (to.scaleX - from.scaleX) * t;
  if (from.scaleY !== void 0 && to.scaleY !== void 0) obj.scale.y = from.scaleY + (to.scaleY - from.scaleY) * t;
  if (raw >= 1) {
    tween2.onComplete?.();
    return false;
  }
  return true;
}
function tween(obj, from, to, duration, options = {}) {
  if (from.x !== void 0) obj.x = from.x;
  if (from.y !== void 0) obj.y = from.y;
  if (from.rotation !== void 0) obj.rotation = from.rotation;
  if (from.alpha !== void 0) obj.alpha = from.alpha;
  if (from.scaleX !== void 0) obj.scale.x = from.scaleX;
  if (from.scaleY !== void 0) obj.scale.y = from.scaleY;
  return {
    obj,
    from,
    to,
    duration,
    elapsed: 0,
    easeFn: options.ease ?? ease.outCubic,
    onComplete: options.onComplete,
    delay: options.delay ?? 0
  };
}
export {
  tickTween as a,
  tickSparks as b,
  buildTableScene as c,
  destroyTableScene as d,
  tween as e,
  emitBurst as f,
  ease as g,
  makeCardSprite as m,
  tickTableScene as t
};
