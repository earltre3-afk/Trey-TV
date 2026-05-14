import React, { useEffect, useRef } from 'react';
import { Application, Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import type { PixiTableEffectsProps } from './PixiTableEffectsLazy';

type PixiNode = Container | Graphics | Sprite;

interface MotionNode {
  node: PixiNode;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startRot: number;
  endRot: number;
  life: number;
  ttl: number;
  scaleFrom: number;
  scaleTo: number;
  fade?: boolean;
}

interface ParticleNode {
  node: Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  ttl: number;
}

interface PixiScene {
  app: Application;
  root: Container;
  bg: Graphics;
  rings: Container;
  trails: Container;
  bursts: Container;
  motion: MotionNode[];
  particles: ParticleNode[];
  texture: Texture | null;
  width: number;
  height: number;
  time: number;
  lastEventKey: string;
  lastBet: number;
}

function colorToNumber(color: string): number {
  return Number.parseInt(color.replace('#', ''), 16);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function seatPoint(seat: number | null | undefined, w: number, h: number) {
  if (seat === 0) return { x: w / 2, y: h * 0.88 };
  if (seat === 1) return { x: w * 0.13, y: h / 2 };
  if (seat === 2) return { x: w / 2, y: h * 0.12 };
  return { x: w * 0.87, y: h / 2 };
}

function makeCard(texture: Texture | null, accent: number): PixiNode {
  if (texture) {
    const card = new Sprite(texture);
    card.anchor.set(0.5);
    card.width = 34;
    card.height = 50;
    card.alpha = 0.92;
    return card;
  }

  const card = new Graphics();
  card.roundRect(-17, -25, 34, 50, 6)
    .fill({ color: 0x07111f, alpha: 0.92 })
    .stroke({ color: accent, alpha: 0.72, width: 1.4 });
  card.circle(0, 0, 8).fill({ color: accent, alpha: 0.25 });
  card.circle(0, 0, 3).fill({ color: 0xffffff, alpha: 0.28 });
  return card;
}

function makeChip(accent: number): Graphics {
  const chip = new Graphics();
  chip.circle(0, 0, 12)
    .fill({ color: accent, alpha: 0.92 })
    .stroke({ color: 0xffffff, alpha: 0.42, width: 2 });
  chip.circle(0, 0, 7).stroke({ color: 0x05070d, alpha: 0.55, width: 2 });
  chip.circle(0, 0, 2).fill({ color: 0xffffff, alpha: 0.55 });
  return chip;
}

function addMotion(scene: PixiScene, node: PixiNode, opts: Omit<MotionNode, 'node' | 'life'>) {
  node.x = opts.startX;
  node.y = opts.startY;
  node.rotation = opts.startRot;
  node.scale.set(opts.scaleFrom);
  scene.trails.addChild(node);
  scene.motion.push({ node, life: 0, ...opts });
}

function addBurst(scene: PixiScene, x: number, y: number, color: number, count = 18) {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.45;
    const speed = 28 + Math.random() * 86;
    const dot = new Graphics();
    dot.circle(0, 0, 1.6 + Math.random() * 2.8).fill({ color, alpha: 0.78 });
    dot.x = x;
    dot.y = y;
    scene.bursts.addChild(dot);
    scene.particles.push({
      node: dot,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      ttl: 0.65 + Math.random() * 0.45,
    });
  }
}

function drawScene(scene: PixiScene, props: PixiTableEffectsProps) {
  const { bg, rings, width: w, height: h } = scene;
  const accent = colorToNumber(props.accent);
  const alt = props.game === 'blackjack' ? 0xffc857 : props.game === 'bullshit' ? 0xa855f7 : 0x00b7ff;

  bg.clear();
  bg.roundRect(0, 0, w, h, Math.min(34, w * 0.08))
    .fill({ color: 0x02050c, alpha: 0.1 });
  bg.ellipse(w / 2, h / 2, w * 0.52, h * 0.42)
    .fill({ color: accent, alpha: 0.045 })
    .stroke({ color: accent, alpha: 0.16, width: 1.4 });
  bg.ellipse(w / 2, h / 2, w * 0.32, h * 0.24)
    .stroke({ color: alt, alpha: 0.18, width: 1 });
  bg.ellipse(w / 2, h / 2, w * 0.18, h * 0.12)
    .fill({ color: alt, alpha: 0.035 })
    .stroke({ color: 0xffffff, alpha: 0.05, width: 1 });

  rings.removeChildren().forEach(child => child.destroy());
  for (let i = 0; i < 3; i += 1) {
    const ring = new Graphics();
    ring.ellipse(0, 0, w * (0.24 + i * 0.12), h * (0.16 + i * 0.09))
      .stroke({ color: i % 2 ? alt : accent, alpha: 0.07 + i * 0.025, width: 1 });
    ring.x = w / 2;
    ring.y = h / 2;
    ring.rotation = i * 0.4;
    rings.addChild(ring);
  }
}

function triggerEvent(scene: PixiScene, props: PixiTableEffectsProps) {
  const accent = colorToNumber(props.accent);
  const w = scene.width;
  const h = scene.height;
  const center = { x: w / 2, y: h / 2 };
  const cards = clamp(props.cardCount ?? 0, 0, 8);

  if (props.game === 'spades') {
    const from = seatPoint(props.winnerSeat ?? cards % 4, w, h);
    for (let i = 0; i < Math.max(1, cards); i += 1) {
      const node = makeCard(scene.texture, accent);
      addMotion(scene, node, {
        startX: from.x,
        startY: from.y,
        endX: center.x + (i - cards / 2) * 18,
        endY: center.y + Math.sin(i) * 16,
        startRot: -0.8 + i * 0.2,
        endRot: -0.16 + i * 0.1,
        ttl: 0.72,
        scaleFrom: 0.45,
        scaleTo: 0.9,
        fade: true,
      });
    }
    if (props.winnerSeat !== null && props.winnerSeat !== undefined) {
      const target = seatPoint(props.winnerSeat, w, h);
      const sweep = new Graphics();
      sweep.circle(0, 0, Math.min(w, h) * 0.08).fill({ color: 0xffc857, alpha: 0.42 });
      addMotion(scene, sweep, {
        startX: center.x,
        startY: center.y,
        endX: target.x,
        endY: target.y,
        startRot: 0,
        endRot: 0,
        ttl: 0.78,
        scaleFrom: 0.3,
        scaleTo: 2.1,
        fade: true,
      });
      addBurst(scene, target.x, target.y, 0xffc857, 26);
    } else {
      addBurst(scene, center.x, center.y, accent, 10);
    }
  }

  if (props.game === 'blackjack') {
    if ((props.bet ?? 0) !== scene.lastBet && (props.bet ?? 0) > 0) {
      const chipCount = clamp(Math.ceil((props.bet ?? 0) / 100), 2, 8);
      for (let i = 0; i < chipCount; i += 1) {
        const chip = makeChip(0xffc857);
        addMotion(scene, chip, {
          startX: w * (0.22 + i * 0.08),
          startY: h * 0.96,
          endX: center.x + (i - chipCount / 2) * 10,
          endY: center.y + 18 + Math.sin(i) * 8,
          startRot: 0,
          endRot: 5 + i,
          ttl: 0.82,
          scaleFrom: 0.35,
          scaleTo: 0.85,
          fade: true,
        });
      }
      scene.lastBet = props.bet ?? 0;
    }
    for (let i = 0; i < Math.max(1, cards); i += 1) {
      const node = makeCard(scene.texture, 0xffc857);
      addMotion(scene, node, {
        startX: w / 2,
        startY: -20,
        endX: center.x + (i - cards / 2) * 16,
        endY: i % 2 ? h * 0.3 : h * 0.72,
        startRot: -0.25,
        endRot: (i - cards / 2) * 0.08,
        ttl: 0.68 + i * 0.025,
        scaleFrom: 0.42,
        scaleTo: 0.86,
        fade: true,
      });
    }
    if (props.result) {
      const color = props.result === 'win' || props.result === 'blackjack' ? 0x22c55e : props.result === 'push' ? 0xffc857 : 0xef4444;
      addBurst(scene, center.x, center.y, color, 34);
    }
  }

  if (props.game === 'bullshit') {
    const pileCount = clamp(props.secondaryCount ?? cards, 1, 7);
    for (let i = 0; i < pileCount; i += 1) {
      const node = makeCard(scene.texture, 0xa855f7);
      addMotion(scene, node, {
        startX: w * (0.16 + Math.random() * 0.68),
        startY: props.reveal ? center.y : h * 0.85,
        endX: center.x + (i - pileCount / 2) * 16,
        endY: center.y + Math.sin(i * 0.8) * 12,
        startRot: props.reveal ? Math.PI / 2 : -0.45,
        endRot: -0.2 + i * 0.09,
        ttl: props.reveal ? 0.95 : 0.7,
        scaleFrom: props.reveal ? 0.25 : 0.42,
        scaleTo: props.reveal ? 1 : 0.82,
        fade: true,
      });
    }
    addBurst(scene, center.x, center.y, props.reveal ? (props.result === 'truth' ? 0x22c55e : 0xef4444) : 0xa855f7, props.reveal ? 38 : 14);
  }
}

const PixiTableEffects: React.FC<PixiTableEffectsProps> = (props) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<PixiScene | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const hostEl = hostRef.current;
    if (!hostEl || typeof ResizeObserver === 'undefined') return;
    const host: HTMLDivElement = hostEl;

    let disposed = false;
    let ro: ResizeObserver | null = null;

    async function init() {
      const rect = host.getBoundingClientRect();
      const app = new Application();
      await app.init({
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        preference: 'webgl',
        powerPreference: 'low-power',
      });
      if (disposed) {
        app.destroy(true, { children: true, texture: false });
        return;
      }

      app.canvas.style.width = '100%';
      app.canvas.style.height = '100%';
      app.canvas.style.display = 'block';
      host.appendChild(app.canvas);

      const root = new Container();
      const bg = new Graphics();
      const rings = new Container();
      const trails = new Container();
      const bursts = new Container();
      root.addChild(bg, rings, trails, bursts);
      app.stage.addChild(root);

      let texture: Texture | null = null;
      try {
        texture = await Assets.load('/assets/games/cards/trey-tv-luxury/card-back.png');
      } catch {
        texture = null;
      }

      const scene: PixiScene = {
        app,
        root,
        bg,
        rings,
        trails,
        bursts,
        motion: [],
        particles: [],
        texture,
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
        time: 0,
        lastEventKey: '',
        lastBet: 0,
      };
      sceneRef.current = scene;
      drawScene(scene, propsRef.current);
      triggerEvent(scene, propsRef.current);
      scene.lastEventKey = propsRef.current.eventKey;

      ro = new ResizeObserver(([entry]) => {
        const box = entry.contentRect;
        const width = Math.max(1, box.width);
        const height = Math.max(1, box.height);
        app.renderer.resize(width, height);
        scene.width = width;
        scene.height = height;
        drawScene(scene, propsRef.current);
      });
      ro.observe(host);

      app.ticker.add((ticker) => {
        const dt = Math.min(ticker.deltaMS / 1000, 0.05);
        scene.time += dt;
        scene.rings.rotation = Math.sin(scene.time * 0.22) * 0.06;
        scene.rings.children.forEach((ring, i) => {
          ring.rotation += dt * (0.035 + i * 0.018);
          ring.alpha = 0.72 + Math.sin(scene.time * 1.2 + i) * 0.22;
        });

        const latest = propsRef.current;
        if (latest.eventKey !== scene.lastEventKey) {
          drawScene(scene, latest);
          triggerEvent(scene, latest);
          scene.lastEventKey = latest.eventKey;
        }

        scene.motion = scene.motion.filter((item) => {
          item.life += dt;
          const t = clamp(item.life / item.ttl, 0, 1);
          const eased = easeOutCubic(t);
          item.node.x = item.startX + (item.endX - item.startX) * eased;
          item.node.y = item.startY + (item.endY - item.startY) * eased;
          item.node.rotation = item.startRot + (item.endRot - item.startRot) * eased;
          const nextScale = item.scaleFrom + (item.scaleTo - item.scaleFrom) * eased;
          item.node.scale.set(nextScale);
          if (item.fade) item.node.alpha = Math.sin(Math.PI * t) * 0.95;
          if (t >= 1) {
            item.node.destroy();
            return false;
          }
          return true;
        });

        scene.particles = scene.particles.filter((p) => {
          p.life += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.node.x = p.x;
          p.node.y = p.y;
          p.node.alpha = Math.max(0, 1 - p.life / p.ttl);
          p.node.scale.set(1 + (p.life / p.ttl) * 1.4);
          if (p.life >= p.ttl) {
            p.node.destroy();
            return false;
          }
          return true;
        });
      });
    }

    init().catch(() => {
      sceneRef.current = null;
    });

    return () => {
      disposed = true;
      ro?.disconnect();
      const scene = sceneRef.current;
      sceneRef.current = null;
      scene?.app.destroy(true, { children: true, texture: false });
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={props.className}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
    />
  );
};

export default PixiTableEffects;
