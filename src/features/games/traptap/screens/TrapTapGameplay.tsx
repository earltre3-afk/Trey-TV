// Trap Tap — gameplay screen. Self-contained canvas rhythm engine + neon HUD.
//
// - Notes are beat-matched to the track (see traptapData.buildChart) and driven by
//   audio.currentTime, so taps line up with the music.
// - `audioOffsetMs` calibrates device/output latency without changing visuals/judging
//   relative to each other.
// - HUD values are written imperatively via refs (no per-frame React re-render) so the
//   60fps path stays smooth; React state only drives the start/pause overlays.
// - JUNE NINETEENTH gets a special Black Power / Juneteenth theme.

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Pause } from 'lucide-react';
import { TrapTapSong, TrapTapDifficulty, TrapTapResult, Judgment } from '../traptapTypes';
import { buildChart, LANE_COLORS, LANE_COUNT, gradeFor, formatTime } from '../traptapData';
import { getBest } from '../traptapStorage';

interface Props {
  song: TrapTapSong;
  difficulty: TrapTapDifficulty;
  /** Latency calibration in ms (notes shifted earlier/later vs audio). */
  audioOffsetMs?: number;
  /** Approach-speed multiplier on top of the difficulty's own speed. */
  noteSpeedMult?: number;
  /** 'Lenient' | 'Normal' | 'Strict' timing leniency. */
  hitWindow?: 'Lenient' | 'Normal' | 'Strict';
  onFinish: (result: TrapTapResult) => void;
  onExit: () => void;
}

const KEY_MAP: Record<string, number> = {
  KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3,
  ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3,
};

function rgba(hex: string | undefined | null, a: number): string {
  if (!hex || typeof hex !== 'string') return `rgba(255, 255, 255, ${a})`;
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  if (isNaN(n)) return `rgba(255, 255, 255, ${a})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// ─── Juneteenth / Black Power Theme ───
const isJuneteenthSong = (song: TrapTapSong) => song.id === 'june-nineteenth';

// Pan-African palette: Red, Black, Green + Gold accent
const JUNETEENTH_LANE_COLORS = ['#E31B23', '#C8102E', '#00843D', '#FFD700'];
const JUNETEENTH_BG =
  'radial-gradient(ellipse at 50% -8%, rgba(227,27,35,0.22), transparent 46%),' +
  'radial-gradient(ellipse at 0% 26%, rgba(0,132,61,0.16), transparent 50%),' +
  'radial-gradient(ellipse at 100% 32%, rgba(255,215,0,0.12), transparent 48%),' +
  'linear-gradient(180deg,#0a0600 0%,#060200 58%,#000 100%)';
const DEFAULT_BG =
  'radial-gradient(ellipse at 50% -8%, rgba(255,0,128,0.20), transparent 46%),' +
  'radial-gradient(ellipse at 0% 26%, rgba(0,180,255,0.12), transparent 50%),' +
  'radial-gradient(ellipse at 100% 32%, rgba(176,38,255,0.16), transparent 48%),' +
  'linear-gradient(180deg,#07010f 0%,#020006 58%,#000 100%)';

const TrapTapGameplay: React.FC<Props> = ({
  song,
  difficulty,
  audioOffsetMs = 0,
  noteSpeedMult = 1,
  hitWindow = 'Normal',
  onFinish,
  onExit,
}) => {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'paused'>('ready');
  const isJune = isJuneteenthSong(song);
  const laneColors = isJune ? JUNETEENTH_LANE_COLORS : LANE_COLORS;

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const laneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const els = useRef<Record<string, HTMLElement | null>>({});
  // Mutable engine state (never triggers React renders).
  const E = useRef<any>({});
  const finishedRef = useRef(false);

  // Keep latest tunables available to the loop without re-running setup.
  const tun = useRef({ audioOffsetMs, noteSpeedMult, hitWindow });
  tun.current = { audioOffsetMs, noteSpeedMult, hitWindow };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const activeLaneColors = isJune ? JUNETEENTH_LANE_COLORS : LANE_COLORS;

    const winScale = () => ({ Lenient: 1.4, Normal: 1, Strict: 0.7 }[tun.current.hitWindow] || 1);
    const offsetSec = () => (tun.current.audioOffsetMs || 0) / 1000;
    // BPM-synced approach: notes arrive over exactly 4 beats so they're
    // locked to the musical grid — if you know the song, you feel the rhythm.
    const beatSec = 60 / song.bpm;
    const leadVal = () => (beatSec * 4) / (difficulty.speed * (tun.current.noteSpeedMult || 1));

    const eng = E.current;
    eng.chart = buildChart(song, difficulty);
    eng.lead = leadVal();
    eng.score = 0;
    eng.combo = 0;
    eng.maxCombo = 0;
    eng.counts = { pp: 0, p: 0, g: 0, m: 0 };
    eng.judged = 0;
    eng.accSum = 0;
    eng.feverFill = 0;
    eng.feverActive = false;
    eng.feverUntil = 0;
    eng.startIdx = 0;
    eng.particles = [];
    eng.laneFlash = [0, 0, 0, 0];
    eng.hitFlash = 0;
    eng.best = getBest(song.id, difficulty.name);
    eng.countdownDone = false;
    eng.running = false;
    eng.audio = null;
    eng.raf = 0;
    eng.geo = null;
    eng.keyHeld = [false, false, false, false];

    // ---------- geometry (3D HIGHWAY PERSPECTIVE) ----------
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      eng.canvasRect = rect;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = rect.width, H = rect.height;
      const vanishY = H * 0.18;   // vanishing point near top
      const hitY = H * 0.82;      // hit zone near bottom
      const playW = W * 0.92;
      const margin = (W - playW) / 2;
      const laneW = playW / LANE_COUNT;
      // Bottom lane centers (spread wide at the bottom)
      const botCenters: number[] = [];
      for (let i = 0; i < LANE_COUNT; i++) {
        botCenters.push(margin + laneW * (i + 0.5));
      }
      // Top lane centers converge to center vanishing point
      const topCenters: number[] = [];
      const converge = 0.12; // how much lanes converge (0 = all at center, 1 = no converge)
      for (let i = 0; i < LANE_COUNT; i++) {
        topCenters.push(W / 2 + (botCenters[i] - W / 2) * converge);
      }
      // Lane boundaries for 3D coordinate mapping and grid rendering
      const botBoundaries: number[] = [];
      const topBoundaries: number[] = [];
      for (let i = 0; i <= LANE_COUNT; i++) {
        const bx = margin + laneW * i;
        botBoundaries.push(bx);
        topBoundaries.push(W / 2 + (bx - W / 2) * converge);
      }
      const recR = Math.min(laneW * 0.42, 48);
      eng.geo = { W, H, vanishY, hitY, botCenters, topCenters, botBoundaries, topBoundaries, laneW, recR };
    };
    resize();
    window.addEventListener('resize', resize);

    // ---------- HUD sync ----------
    const setText = (k: string, v: string) => { if (els.current[k]) els.current[k]!.textContent = v; };
    setText('best', 'BEST ' + eng.best.toLocaleString());

    // ---------- judging ----------
    const comboMult = () => {
      const c = eng.combo;
      return c < 8 ? 1 : c < 20 ? 2 : c < 40 ? 4 : c < 80 ? 6 : 8;
    };

    const showJudge = (j: Judgment) => {
      const wrap = els.current.judge, main = els.current.judgeMain, sub = els.current.judgeSub;
      if (!wrap || !main || !sub) return;
      const map: Record<Judgment, { t: string; s: string; g: string; sc: string }> = isJune ? {
        pp: { t: 'PERFECT+', s: 'POWER HIT', g: 'linear-gradient(90deg,#FFD700,#E31B23 50%,#00843D)', sc: 'rgba(255,215,0,.4)' },
        p: { t: 'PERFECT', s: 'FREEDOM', g: 'linear-gradient(90deg,#E31B23,#FFD700)', sc: 'rgba(227,27,35,.35)' },
        g: { t: 'GOOD', s: 'RISE UP', g: 'linear-gradient(90deg,#00843D,#FFD700)', sc: 'rgba(0,132,61,.3)' },
        m: { t: 'MISS', s: '', g: 'linear-gradient(90deg,#8B0000,#4a0000)', sc: 'rgba(139,0,0,.3)' },
      } : {
        pp: { t: 'PERFECT+', s: 'ULTRA HIT', g: 'linear-gradient(90deg,#ffd23f,#fff 50%,#00e0ff)', sc: 'rgba(176,38,255,.4)' },
        p: { t: 'PERFECT', s: 'GREAT', g: 'linear-gradient(90deg,#00e0ff,#fff)', sc: 'rgba(0,180,255,.35)' },
        g: { t: 'GOOD', s: 'NICE', g: 'linear-gradient(90deg,#B026FF,#fff)', sc: 'rgba(176,38,255,.3)' },
        m: { t: 'MISS', s: '', g: 'linear-gradient(90deg,#ff3b6b,#ff7a3b)', sc: 'rgba(255,59,107,.3)' },
      };
      const m = map[j];
      main.textContent = m.t;
      main.style.background = m.g;
      (main.style as any).webkitBackgroundClip = 'text';
      main.style.backgroundClip = 'text';
      sub.textContent = m.s;
      sub.style.display = m.s ? 'inline-block' : 'none';
      sub.style.background = m.sc;
      wrap.classList.remove('tt-pop');
      void wrap.offsetWidth;
      wrap.classList.add('tt-pop');
    };

    const pushHud = () => {
      setText('score', eng.score.toLocaleString());
      setText('best', 'BEST ' + Math.max(eng.best, getBest(song.id, difficulty.name)).toLocaleString());
      const cEl = els.current.combo;
      if (cEl) {
        cEl.textContent = String(eng.combo);
        cEl.classList.remove('tt-pop'); void cEl.offsetWidth; cEl.classList.add('tt-pop');
      }
      setText('bottomCombo', String(eng.combo));
      setText('comboMult', 'x' + comboMult());
      const acc = eng.judged ? eng.accSum / eng.judged : 100;
      setText('acc', acc.toFixed(2).replace(/\.?0+$/, '') + '%');
      const gd = gradeFor(acc);
      if (els.current.grade) {
        els.current.grade!.textContent = gd.grade;
        els.current.grade!.style.color = gd.color;
        els.current.grade!.style.textShadow = '0 0 12px ' + gd.color + '80';
      }
    };

    const spawnParticles = (lane: number, j: Judgment) => {
      const g = eng.geo; if (!g) return;
      const x = g.botCenters[lane], y = g.hitY, col = activeLaneColors[lane];
      
      // Spawn different types of premium effects!
      // 1. Radial Streaks (high-velocity laser streaks shooting outwards)
      const numStreaks = j === 'pp' ? 12 : j === 'p' ? 8 : 4;
      for (let i = 0; i < numStreaks; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 250 + Math.random() * 350;
        eng.particles.push({
          type: 'streak',
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          max: 0.22 + Math.random() * 0.18,
          col,
          width: 1.5 + Math.random() * 2.0,
          length: 12 + Math.random() * 18
        });
      }

      // 2. Floating Orbiters / Sparks (slower, floating sparks with deceleration/friction, no gravity)
      const numSparks = j === 'pp' ? 14 : j === 'p' ? 9 : 5;
      for (let i = 0; i < numSparks; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 150;
        eng.particles.push({
          type: 'spark',
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          drag: 0.88,
          life: 0,
          max: 0.4 + Math.random() * 0.35,
          col,
          r: 2.0 + Math.random() * 3.0
        });
      }

      // 3. Shockwave Flash Ring (expanding circular ring)
      eng.particles.push({
        type: 'ring',
        x, y,
        life: 0,
        max: 0.28,
        col,
        startR: recR * 0.6,
        endR: recR * 3.5,
        width: 3.5
      });

      // 4. Center Lens Flare Star
      eng.particles.push({
        type: 'lensflare',
        x, y,
        life: 0,
        max: 0.22,
        col,
        maxSize: recR * 2.2
      });

      if (eng.particles.length > 300) eng.particles.splice(0, eng.particles.length - 300);
    };

    const activateFever = () => {
      eng.feverActive = true;
      eng.feverUntil = (eng.audio ? eng.audio.currentTime : 0) + 8;
      if (rootRef.current) rootRef.current.style.filter = 'saturate(1.35) brightness(1.08)';
      const ft = els.current.feverText;
      if (ft) { ft.classList.remove('tt-fever-go'); void ft.offsetWidth; ft.classList.add('tt-fever-go'); }
    };
    const deactivateFever = () => {
      eng.feverActive = false; eng.feverFill = 0;
      if (rootRef.current) rootRef.current.style.filter = '';
    };    const judgeHit = (j: Judgment, lane: number) => {
      const base = { pp: 100, p: 80, g: 40, m: 0 }[j];
      const accW = { pp: 100, p: 92, g: 55, m: 0 }[j];
      eng.counts[j]++; eng.judged++; eng.accSum += accW;
      eng.combo++; if (eng.combo > eng.maxCombo) eng.maxCombo = eng.combo;
      const fever = eng.feverActive ? 2 : 1;
      eng.score += Math.round(base * comboMult() * fever * difficulty.mult);
      if (eng.score > eng.best) eng.best = eng.score;
      eng.feverFill = Math.min(1, eng.feverFill + (j === 'pp' ? 0.06 : j === 'p' ? 0.045 : 0.022));
      if (eng.feverFill >= 1 && !eng.feverActive) activateFever();
      spawnParticles(lane, j);
      eng.hitFlash = performance.now();
      showJudge(j);
      pushHud();
    };

    const registerMiss = () => {
      eng.counts.m++; eng.judged++;
      eng.combo = 0;
      eng.feverFill = Math.max(0, eng.feverFill - 0.1);
      showJudge('m');
      pushHud();
    };

    eng.laneHeld = [false, false, false, false];

    const pressLane = (lane: number) => {
      if (!eng.running) return;
      eng.laneFlash[lane] = performance.now();
      eng.laneHeld[lane] = true;
      if (!eng.countdownDone || !eng.audio) return;
      const ws = winScale();
      const t = eng.audio.currentTime + offsetSec();
      const goodWin = 0.16 * ws;
      let best: any = null, bestDt = goodWin + 1;
      for (let i = eng.startIdx; i < eng.chart.length; i++) {
        const n = eng.chart[i];
        if (n.time > t + goodWin) break;
        if (n.hit || n.missed || n.holdHeadHit || n.lane !== lane) continue;
        const dt = Math.abs(n.time - t);
        if (dt < bestDt) { bestDt = dt; best = n; }
      }
      if (best) {
        if (best.holdDuration) {
          best.holdHeadHit = true;
          best.holdActive = true;
          const j: Judgment = bestDt <= 0.05 * ws ? 'pp' : bestDt <= 0.1 * ws ? 'p' : 'g';
          judgeHit(j, lane);
        } else {
          best.hit = true;
          const j: Judgment = bestDt <= 0.05 * ws ? 'pp' : bestDt <= 0.1 * ws ? 'p' : 'g';
          judgeHit(j, lane);
        }
      }
    };
    eng.pressLane = pressLane;

    const releaseLane = (lane: number) => {
      eng.laneHeld[lane] = false;
      if (!eng.running || !eng.audio) return;
      const t = eng.audio.currentTime + offsetSec();
      for (let i = eng.startIdx; i < eng.chart.length; i++) {
        const n = eng.chart[i];
        if (n.time > t + 1.0) break;
        // Hold notes stay in their own lane — no cross-lane checking needed
        if (n.holdDuration && n.holdActive && n.lane === lane) {
          const endTime = n.time + n.holdDuration;
          if (t < endTime - 0.1) {
            n.holdActive = false;
            n.holdReleasedEarly = true;
            n.missed = true;
            registerMiss();
          }
        }
      }
    };
    eng.releaseLane = releaseLane;

    // ---------- drawing (3D HIGHWAY) ----------
    const drawStar = (cx: number, cy: number, rx: number, ry: number, col: string) => {
      // Outer glow shape instead of slow shadowBlur
      ctx.fillStyle = rgba(col, 0.4);
      ctx.beginPath();
      ctx.arc(cx, cy, rx * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 4-pointed squircle-like star inside notes and receptor pads matching reference
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - ry);
      ctx.quadraticCurveTo(cx, cy, cx + rx, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + ry);
      ctx.quadraticCurveTo(cx, cy, cx - rx, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - ry);
      ctx.closePath();
      ctx.fill();
    };

    // 3D perspective helpers
    // p: 0 = vanishing point (far away), 1 = hit line (right in front)
    const perspT = (p: number) => Math.pow(Math.max(0, Math.min(1, p)), 1.5);
    
    const laneX = (lane: number, p: number) => {
      const g = eng.geo; if (!g) return 0;
      const w = perspT(p);
      return g.topCenters[lane] + (g.botCenters[lane] - g.topCenters[lane]) * w;
    };
    
    const boundX = (i: number, p: number) => {
      const g = eng.geo; if (!g) return 0;
      const w = perspT(p);
      return g.topBoundaries[i] + (g.botBoundaries[i] - g.topBoundaries[i]) * w;
    };

    const laneY = (p: number) => {
      const g = eng.geo; if (!g) return 0;
      return g.vanishY + (g.hitY - g.vanishY) * perspT(p);
    };
    
    // Scale factor: tiny far away, full size close
    const perspScale = (p: number) => 0.08 + 0.92 * perspT(p);
    const drawDisc = (cx: number, cy: number, rx: number, squash: number, col: string, isFist: boolean) => {
      const ry = rx * squash; // squashed top face
      const thickness = rx * 0.35; // height of the 3D cylinder
      
      // 0. Ambient shadow/glow on the road beneath the disc
      const shadowY = cy + thickness;
      const shGrad = ctx.createRadialGradient(cx, shadowY, 0, cx, shadowY, rx * 1.5);
      shGrad.addColorStop(0, rgba(col, 0.45));
      shGrad.addColorStop(0.5, rgba(col, 0.12));
      shGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shGrad;
      ctx.beginPath();
      ctx.ellipse(cx, shadowY, rx * 1.5, ry * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 1. Draw side wall (cylinder height extrusion)
      const sideGrad = ctx.createLinearGradient(cx - rx, cy, cx + rx, cy + thickness);
      sideGrad.addColorStop(0, rgba(col, 0.28));
      sideGrad.addColorStop(0.3, rgba(col, 0.68));
      sideGrad.addColorStop(0.7, rgba(col, 0.88));
      sideGrad.addColorStop(1, rgba(col, 0.28));
      ctx.fillStyle = sideGrad;
      
      ctx.beginPath();
      ctx.ellipse(cx, cy + thickness, rx, ry, 0, 0, Math.PI);
      ctx.lineTo(cx + rx, cy);
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI, true);
      ctx.lineTo(cx - rx, cy + thickness);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = rgba(col, 0.55);
      ctx.lineWidth = Math.max(1, rx * 0.04);
      ctx.stroke();

      // 2. Draw top cap background
      ctx.fillStyle = 'rgba(8, 4, 18, 0.96)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Ambient face glow
      const faceGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
      faceGlow.addColorStop(0, rgba(col, 0.6));
      faceGlow.addColorStop(0.85, rgba(col, 0.15));
      faceGlow.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = faceGlow;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4. Bright outer glowing rim
      ctx.strokeStyle = rgba(col, 0.98);
      ctx.lineWidth = Math.max(2.0, rx * 0.08);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Specular metallic sheen sweep on the face
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = rx * 0.07;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 0.72, ry * 0.72, Math.PI * 0.25, -Math.PI * 0.35, Math.PI * 0.15);
      ctx.stroke();

      // 6. Specular highlight accent on the top surface
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = Math.max(1, rx * 0.05);
      ctx.beginPath();
      ctx.ellipse(cx, cy - ry * 0.2, rx * 0.72, ry * 0.52, 0, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();

      // 7. Center icon / star
      if (isFist) {
        const fs = rx * 0.28;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath();
        ctx.roundRect(cx - fs * 0.4, cy - fs * 0.5, fs * 0.8, fs * 0.6, fs * 0.12);
        ctx.fill();
        ctx.fillRect(cx - fs * 0.2, cy + fs * 0.1, fs * 0.4, fs * 0.45);
      } else {
        drawStar(cx, cy, rx * 0.26, ry * 0.26, col);
      }
    };

    // Draw the big 3D cylindrical receptor pad at the hit line
    const drawReceptor = (cx: number, cy: number, R: number, col: string, fl: number, beatEnv: number) => {
      const squash = 0.35; // flat perspective
      const ry = R * squash;
      
      // Pulse animation based on beat and tap flash
      const pulse = 1 + beatEnv * 0.04 + fl * 0.12;
      const pR = R * pulse;
      const pRy = ry * pulse;
      
      // Receptors depress (thickness decreases) when tapped!
      const thickness = R * 0.42 * (1 - fl * 0.22);
      
      // 1. Ambient glow on the road beneath the receptor
      const ambGr = ctx.createRadialGradient(cx, cy + thickness, 0, cx, cy + thickness, pR * 2.8);
      ambGr.addColorStop(0, rgba(col, 0.42 + fl * 0.48));
      ambGr.addColorStop(0.4, rgba(col, 0.16 + fl * 0.2));
      ambGr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ambGr;
      ctx.beginPath();
      ctx.ellipse(cx, cy + thickness, pR * 2.8, pRy * 2.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw 3D side wall
      const wallGrad = ctx.createLinearGradient(cx - pR, cy, cx + pR, cy + thickness);
      wallGrad.addColorStop(0, rgba(col, 0.2));
      wallGrad.addColorStop(0.3, rgba(col, 0.6 + fl * 0.2));
      wallGrad.addColorStop(0.7, rgba(col, 0.8 + fl * 0.2));
      wallGrad.addColorStop(1, rgba(col, 0.2));
      ctx.fillStyle = wallGrad;
      
      ctx.beginPath();
      ctx.ellipse(cx, cy + thickness, pR, pRy, 0, 0, Math.PI);
      ctx.lineTo(cx + pR, cy);
      ctx.ellipse(cx, cy, pR, pRy, 0, 0, Math.PI, true);
      ctx.lineTo(cx - pR, cy + thickness);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = rgba(col, 0.45 + fl * 0.3);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 3. Top cap background
      ctx.fillStyle = 'rgba(6, 3, 15, 0.94)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, pR, pRy, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4. Top face circular radial glow
      const faceGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, pR);
      faceGlow.addColorStop(0, rgba(col, 0.6 + fl * 0.38));
      faceGlow.addColorStop(0.85, rgba(col, 0.18 + fl * 0.18));
      faceGlow.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = faceGlow;
      ctx.beginPath();
      ctx.ellipse(cx, cy, pR, pRy, 0, 0, Math.PI * 2);
      ctx.fill();

      // 5. Thick outer glowing rim
      ctx.strokeStyle = rgba(col, 0.92 + fl * 0.08);
      ctx.lineWidth = 3.5 + fl * 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, pR * 0.95, pRy * 0.95, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 6. Inner concentric rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, pR * 0.72, pRy * 0.72, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = rgba(col, 0.35);
      ctx.beginPath();
      ctx.ellipse(cx, cy, pR * 0.48, pRy * 0.48, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 7. Center icon
      if (isJune) {
        const fs = pR * 0.22;
        ctx.fillStyle = rgba(col, 0.8 + fl * 0.2);
        ctx.beginPath();
        ctx.roundRect(cx - fs * 0.4, cy - fs * 0.45, fs * 0.8, fs * 0.55, fs * 0.12);
        ctx.fill();
        ctx.fillRect(cx - fs * 0.2, cy + fs * 0.1, fs * 0.4, fs * 0.4);
      } else {
        drawStar(cx, cy, pR * 0.22, pRy * 0.22, col);
      }

      // Floating hologram ring hovering above
      const hoverY = cy - 10 - beatEnv * 6;
      ctx.strokeStyle = rgba(col, 0.45 + beatEnv * 0.3);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, hoverY, pR * 0.85, pRy * 0.85, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Connecting vertical laser lines from pad to floating ring
      ctx.strokeStyle = rgba(col, 0.2 + beatEnv * 0.2);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx - pR * 0.85, cy);
      ctx.lineTo(cx - pR * 0.85, hoverY);
      ctx.moveTo(cx + pR * 0.85, cy);
      ctx.lineTo(cx + pR * 0.85, hoverY);
      ctx.stroke();

      // Tap shockwave expansion
      if (fl > 0) {
        const ringProgress = 1.0 + (1 - fl) * 2.2;
        // Primary glowing ring
        ctx.strokeStyle = rgba(col, fl * 0.9);
        ctx.lineWidth = 4 * fl;
        ctx.beginPath();
        ctx.ellipse(cx, cy, pR * ringProgress, pRy * ringProgress, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Secondary offset chromatic ring
        const altCol = isJune ? '#FFD700' : '#00B4FF';
        ctx.strokeStyle = rgba(altCol, fl * 0.5);
        ctx.lineWidth = 1.5 * fl;
        ctx.beginPath();
        ctx.ellipse(cx - 2 * fl, cy, pR * (ringProgress * 0.9), pRy * (ringProgress * 0.9), 0, 0, Math.PI * 2);
        ctx.stroke();

        // Inner shockwave glow
        const innerGlow = ctx.createRadialGradient(cx, cy, pR * 0.5, cx, cy, pR * ringProgress);
        innerGlow.addColorStop(0, 'rgba(0,0,0,0)');
        innerGlow.addColorStop(0.8, rgba(col, fl * 0.15));
        innerGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.ellipse(cx, cy, pR * ringProgress, pRy * ringProgress, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const draw = (t: number, now: number) => {
      const g = eng.geo; if (!g) return;
      const { W, H, vanishY, hitY, botCenters, topCenters, botBoundaries, topBoundaries, laneW, recR } = g;
      ctx.clearRect(0, 0, W, H);
      const beat = 60 / song.bpm;
      const beatPhase = (t - (song.beatOffset || 0)) / beat;
      const beatEnv = Math.max(0, 1 - (beatPhase - Math.floor(beatPhase)));

      // ── Draw dark road surface background trapezoid ──
      // Project the boundaries to the bottom H of the canvas so the road borders stay straight relative to the lanes
      const pBoundLeft = topBoundaries[0] + (botBoundaries[0] - topBoundaries[0]) * ((H - vanishY) / (hitY - vanishY));
      const pBoundRight = topBoundaries[LANE_COUNT] + (botBoundaries[LANE_COUNT] - topBoundaries[LANE_COUNT]) * ((H - vanishY) / (hitY - vanishY));

      ctx.fillStyle = 'rgba(4, 2, 10, 0.72)';
      ctx.beginPath();
      ctx.moveTo(topBoundaries[0], vanishY);
      ctx.lineTo(topBoundaries[LANE_COUNT], vanishY);
      ctx.lineTo(pBoundRight, H);
      ctx.lineTo(pBoundLeft, H);
      ctx.closePath();
      ctx.fill();

      // ── Draw horizon separator line and city background grid glow ──
      const horGrad = ctx.createLinearGradient(0, vanishY, W, vanishY);
      horGrad.addColorStop(0, 'rgba(0,0,0,0)');
      horGrad.addColorStop(0.15, rgba(isJune ? '#E31B23' : '#FF0080', 0.28));
      horGrad.addColorStop(0.5, '#ffffff');
      horGrad.addColorStop(0.85, rgba(isJune ? '#00843D' : '#00B4FF', 0.28));
      horGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = horGrad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, vanishY);
      ctx.lineTo(W, vanishY);
      ctx.stroke();

      // Horizon diffuse background glow
      const horizonGlow = ctx.createRadialGradient(W / 2, vanishY, 0, W / 2, vanishY, H * 0.18);
      horizonGlow.addColorStop(0, rgba(isJune ? '#E31B23' : '#B026FF', 0.4));
      horizonGlow.addColorStop(0.5, rgba(isJune ? '#FFD700' : '#00B4FF', 0.15));
      horizonGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = horizonGlow;
      ctx.beginPath();
      ctx.arc(W / 2, vanishY, H * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // ── Draw perspective grid lines (scrolling beats as laser lines) ──
      const firstBeat = Math.ceil((t - eng.lead) / beat) * beat;
      for (let tb = firstBeat; tb < t + eng.lead; tb += beat) {
        const p = (t - (tb - eng.lead)) / eng.lead;
        if (p < 0 || p > 1) continue;
        const ly = laneY(p);
        const lx1 = boundX(0, p);
        const lx2 = boundX(LANE_COUNT, p);
        
        const glowOpacity = 0.22 * Math.pow(p, 2.5);
        const gridCol = isJune ? '#FFD700' : '#B026FF';
        
        // Soft under-glow for laser line
        ctx.strokeStyle = rgba(gridCol, glowOpacity);
        ctx.lineWidth = 5 * p;
        ctx.beginPath();
        ctx.moveTo(lx1, ly);
        ctx.lineTo(lx2, ly);
        ctx.stroke();
        
        // Bright core line
        ctx.strokeStyle = rgba('#ffffff', glowOpacity * 2.5);
        ctx.lineWidth = 1.5 * p;
        ctx.beginPath();
        ctx.moveTo(lx1, ly);
        ctx.lineTo(lx2, ly);
        ctx.stroke();
      }

      // ── Draw lane dividers and glowing 3D tubular side rails ──
      // All boundary lines (edges and lane dividers) are rendered as glowing tubes to stay lit up
      const drawRail = (i: number) => {
        const col = i < LANE_COUNT ? activeLaneColors[i] : activeLaneColors[LANE_COUNT - 1];
        const tx = topBoundaries[i];
        const bx = botBoundaries[i];
        const pbx = tx + (bx - tx) * ((H - vanishY) / (hitY - vanishY));
        
        // Aura glow
        ctx.strokeStyle = rgba(col, 0.28);
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(tx, vanishY);
        ctx.lineTo(pbx, H);
        ctx.stroke();
        
        // Outer core
        ctx.strokeStyle = rgba(col, 0.6);
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(tx, vanishY);
        ctx.lineTo(pbx, H);
        ctx.stroke();
        
        // Main tubular body
        ctx.strokeStyle = col;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(tx, vanishY);
        ctx.lineTo(pbx, H);
        ctx.stroke();
        
        // Specular highlight line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(tx, vanishY);
        ctx.lineTo(pbx, H);
        ctx.stroke();
      };
      
      for (let i = 0; i <= LANE_COUNT; i++) {
        drawRail(i);
      }

      // Draw center path guides down the middle of each lane
      for (let i = 0; i < LANE_COUNT; i++) {
        const col = activeLaneColors[i];
        const tx = topCenters[i];
        const bx = botCenters[i];
        const pbx = tx + (bx - tx) * ((H - vanishY) / (hitY - vanishY));
        
        ctx.strokeStyle = rgba(col, 0.12);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(tx, vanishY);
        ctx.lineTo(pbx, H);
        ctx.stroke();
      }

      // ── Draw 3D side pillars / light posts zooming by ──
      const spacing = 0.8; // seconds spacing between pillars
      const speed = difficulty.speed * (tun.current.noteSpeedMult || 1);
      const pillarCount = 6;
      const tPhase = (t * speed) % spacing;
      for (let k = -1; k < pillarCount; k++) {
        const p = (k * spacing + tPhase) / (spacing * (pillarCount - 2)); // normalized progress 0 to 1
        if (p < 0 || p > 1.1) continue;
        const ly = laneY(p);
        const lScale = perspScale(p);
        
        // Left pillar location
        const lx = boundX(0, p) - 25 * lScale;
        // Right pillar location
        const rx = boundX(LANE_COUNT, p) + 25 * lScale;
        
        const pilH = 45 * lScale;
        const pilW = 6 * lScale;
        
        const drawPillar = (px: number, isLeft: boolean) => {
          const col = isLeft ? activeLaneColors[0] : activeLaneColors[LANE_COUNT - 1];
          const flareCol = isJune ? '#FFD700' : '#B026FF';
          
          // Pillar base shadow
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.beginPath();
          ctx.ellipse(px, ly, pilW * 1.8, pilW * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Glowing beam tube
          const pilGrad = ctx.createLinearGradient(px, ly, px, ly - pilH);
          pilGrad.addColorStop(0, rgba(col, 0.8));
          pilGrad.addColorStop(0.5, rgba(col, 0.4));
          pilGrad.addColorStop(1, rgba(flareCol, 0.95));
          
          ctx.fillStyle = pilGrad;
          ctx.beginPath();
          ctx.roundRect(px - pilW / 2, ly - pilH, pilW, pilH, pilW / 2);
          ctx.fill();
          
          // Specular highlight on post
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = pilW * 0.25;
          ctx.beginPath();
          ctx.moveTo(px - pilW * 0.2, ly);
          ctx.lineTo(px - pilW * 0.2, ly - pilH);
          ctx.stroke();
          
          // Light cap aura glow
          const capR = pilW * 1.6;
          const capGrad = ctx.createRadialGradient(px, ly - pilH, 0, px, ly - pilH, capR * 2.8);
          capGrad.addColorStop(0, '#ffffff');
          capGrad.addColorStop(0.3, rgba(flareCol, 0.85));
          capGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = capGrad;
          ctx.beginPath();
          ctx.arc(px, ly - pilH, capR * 2.8, 0, Math.PI * 2);
          ctx.fill();
        };
        
        drawPillar(lx, true);
        drawPillar(rx, false);
      }

      // ── Draw hold trails ──
      for (let i = eng.startIdx; i < eng.chart.length; i++) {
        const n = eng.chart[i];
        if (n.time > t + eng.lead) break;
        if (n.missed || n.hit) continue;
        if (n.holdDuration) {
          const endTime = n.time + n.holdDuration;
          if (t > endTime + 0.15) continue;

          let pHead = (t - (n.time - eng.lead)) / eng.lead;
          if (n.holdHeadHit) pHead = 1.0;
          pHead = Math.max(0, Math.min(1.0, pHead));
          let pTail = (t - (endTime - eng.lead)) / eng.lead;
          pTail = Math.max(0, Math.min(1.0, pTail));
          if (pHead <= pTail) continue;

          const col = activeLaneColors[n.lane];
          const numSteps = 14;
          const leftPts: { x: number; y: number }[] = [];
          const rightPts: { x: number; y: number }[] = [];
          for (let step = 0; step <= numSteps; step++) {
            const ratio = step / numSteps;
            const p = pTail + (pHead - pTail) * ratio;
            const cx = laneX(n.lane, p);
            const cy = laneY(p);
            const sc = perspScale(p);
            const w = laneW * 0.28 * sc;
            leftPts.push({ x: cx - w, y: cy });
            rightPts.push({ x: cx + w, y: cy });
          }

          // Filled trail
          ctx.beginPath();
          ctx.moveTo(leftPts[0].x, leftPts[0].y);
          for (let s = 1; s <= numSteps; s++) ctx.lineTo(leftPts[s].x, leftPts[s].y);
          for (let s = numSteps; s >= 0; s--) ctx.lineTo(rightPts[s].x, rightPts[s].y);
          ctx.closePath();
          const tGrad = ctx.createLinearGradient(0, leftPts[0].y, 0, leftPts[numSteps].y);
          tGrad.addColorStop(0, rgba(col, 0.05));
          tGrad.addColorStop(1, rgba(col, n.holdActive ? 0.7 : 0.35));
          ctx.fillStyle = tGrad; ctx.fill();

          // Techy Ladder/Mesh texture along the hold trail
          ctx.strokeStyle = rgba('#ffffff', n.holdActive ? 0.25 : 0.08);
          ctx.lineWidth = n.holdActive ? 2 : 1;
          for (let s = 0; s <= numSteps; s += 2) {
            const ly1 = leftPts[s].y;
            const lx1 = leftPts[s].x;
            const rx1 = rightPts[s].x;
            ctx.beginPath();
            ctx.moveTo(lx1, ly1);
            ctx.lineTo(rx1, ly1);
            ctx.stroke();
          }

          // Borders
          ctx.strokeStyle = rgba(col, n.holdActive ? 0.95 : 0.55);
          ctx.lineWidth = n.holdActive ? 3.5 : 1.8;
          ctx.beginPath();
          for (let s = 0; s <= numSteps; s++) { s === 0 ? ctx.moveTo(leftPts[s].x, leftPts[s].y) : ctx.lineTo(leftPts[s].x, leftPts[s].y); }
          ctx.stroke();
          ctx.beginPath();
          for (let s = 0; s <= numSteps; s++) { s === 0 ? ctx.moveTo(rightPts[s].x, rightPts[s].y) : ctx.lineTo(rightPts[s].x, rightPts[s].y); }
          ctx.stroke();

          // Hold glow at hit line
          if (n.holdActive) {
            const hx = botCenters[n.lane];
            const glowPhase = (now / 120) % (Math.PI * 2);
            const glowPulse = 0.6 + 0.4 * Math.sin(glowPhase);
            const glowR = recR * (1.5 + glowPulse * 0.7);
            const gGr = ctx.createRadialGradient(hx, hitY, recR * 0.2, hx, hitY, glowR * 2);
            gGr.addColorStop(0, rgba(col, 0.5 * glowPulse));
            gGr.addColorStop(0.5, rgba(col, 0.2 * glowPulse));
            gGr.addColorStop(1, rgba(col, 0));
            ctx.fillStyle = gGr;
            ctx.beginPath(); ctx.arc(hx, hitY, glowR * 2, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = rgba(col, 0.8 * glowPulse); ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.ellipse(hx, hitY, recR * (1.0 + glowPulse * 0.4), recR * 0.35 * (1.0 + glowPulse * 0.4), 0, 0, Math.PI * 2); ctx.stroke();
          }

          // Tail cap (3D disc)
          const tailSc = perspScale(pTail);
          if (tailSc > 0.12) {
            const tcx = laneX(n.lane, pTail);
            const tcy = laneY(pTail);
            const tr = recR * 0.55 * tailSc;
            const tsq = 0.25 + 0.2 * tailSc;
            ctx.fillStyle = 'rgba(8,4,18,0.9)';
            ctx.beginPath(); ctx.ellipse(tcx, tcy, tr, tr * tsq, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = rgba(col, 0.8); ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.ellipse(tcx, tcy, tr, tr * tsq, 0, 0, Math.PI * 2); ctx.stroke();
          }
        }
      }

      // ── Hit line flare ──
      const hf = Math.max(0, 1 - (now - eng.hitFlash) / 250);
      // Horizontal hit line
      ctx.strokeStyle = `rgba(255,255,255,${0.08 + hf * 0.5})`;
      ctx.lineWidth = 1.5 + hf * 4;
      ctx.beginPath();
      ctx.moveTo(botBoundaries[0], hitY);
      ctx.lineTo(botBoundaries[LANE_COUNT], hitY);
      ctx.stroke();
      // Bright flare burst on hit
      if (hf > 0.1) {
        const flareGr = ctx.createLinearGradient(botBoundaries[0], hitY, botBoundaries[LANE_COUNT], hitY);
        flareGr.addColorStop(0, `rgba(255,255,255,0)`);
        flareGr.addColorStop(0.5, `rgba(255,255,255,${hf * 0.25})`);
        flareGr.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.fillStyle = flareGr;
        ctx.fillRect(botBoundaries[0], hitY - 3 * hf, (botBoundaries[LANE_COUNT] - botBoundaries[0]), 6 * hf);
      }

      // ── Draw 3D vertical beam projection when lane is tapped ──
      for (let i = 0; i < LANE_COUNT; i++) {
        const fl = Math.max(0, 1 - (now - eng.laneFlash[i]) / 220);
        if (fl > 0.02) {
          const col = activeLaneColors[i];
          const x = botCenters[i];
          const tx = topCenters[i];
          const beamW = recR * 1.4 * fl;
          const beamH = H * 0.45 * fl;
          
          const beamGrad = ctx.createLinearGradient(0, hitY, 0, hitY - beamH);
          beamGrad.addColorStop(0, rgba(col, fl * 0.35));
          beamGrad.addColorStop(0.5, rgba(col, fl * 0.12));
          beamGrad.addColorStop(1, 'rgba(0,0,0,0)');
          
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          const tScale = perspScale(1 - fl * 0.45);
          const topW = beamW * tScale;
          ctx.moveTo(x - beamW, hitY);
          ctx.lineTo(tx - topW, hitY - beamH);
          ctx.lineTo(tx + topW, hitY - beamH);
          ctx.lineTo(x + beamW, hitY);
          ctx.closePath();
          ctx.fill();
        }
      }

      // ── Draw 3D disc notes ──
      for (let i = eng.startIdx; i < eng.chart.length; i++) {
        const n = eng.chart[i];
        if (n.time > t + eng.lead) break;
        if (n.hit || n.missed || n.holdHeadHit) continue;
        const p = (t - (n.time - eng.lead)) / eng.lead;
        if (p < 0 || p > 1.02) continue;
        const cx = laneX(n.lane, p);
        const cy = laneY(p);
        const sc = perspScale(p);
        const noteR = recR * sc;
        // Squash factor: very flat far away, rounder up close
        const squash = 0.2 + 0.25 * sc;
        drawDisc(cx, cy, noteR, squash, activeLaneColors[n.lane], isJune);
      }

      // ── Draw 3D receptor pads at hit line ──
      for (let i = 0; i < LANE_COUNT; i++) {
        const x = botCenters[i], y = hitY, col = activeLaneColors[i];
        const fl = Math.max(0, 1 - (now - eng.laneFlash[i]) / 220);
        drawReceptor(x, y, recR, col, fl, beatEnv);
      }

      // Premium Particles rendering (Streaks, Orbiters, Ring, and Flare)
      for (const pt of eng.particles) {
        const a = 1 - pt.life / pt.max;
        
        if (pt.type === 'streak') {
          // Draw a glowing streak line along its velocity vector
          const vel = Math.sqrt(pt.vx * pt.vx + pt.vy * pt.vy);
          if (vel === 0) continue;
          const dx = pt.vx / vel;
          const dy = pt.vy / vel;
          const len = pt.length * a;
          
          ctx.strokeStyle = rgba(pt.col, a * 0.9);
          ctx.lineWidth = pt.width * a;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x - dx * len, pt.y - dy * len);
          ctx.stroke();
          
          // White core
          ctx.strokeStyle = rgba('#ffffff', a);
          ctx.lineWidth = pt.width * 0.4 * a;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x - dx * len * 0.6, pt.y - dy * len * 0.6);
          ctx.stroke();
        } 
        else if (pt.type === 'spark') {
          const pr = Math.max(0, pt.r * a);
          
          // Draw outer glow (larger semi-transparent circle) instead of slow shadowBlur
          ctx.fillStyle = rgba(pt.col, a * 0.25);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pr * 2.5, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw diamond shapes
          ctx.fillStyle = rgba(pt.col, a * 0.9);
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y - pr);
          ctx.lineTo(pt.x + pr * 0.6, pt.y);
          ctx.lineTo(pt.x, pt.y + pr);
          ctx.lineTo(pt.x - pr * 0.6, pt.y);
          ctx.closePath();
          ctx.fill();
          
          // Core
          ctx.fillStyle = rgba('#ffffff', a);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pr * 0.35, 0, Math.PI * 2);
          ctx.fill();
        } 
        else if (pt.type === 'ring') {
          // Draw expanding shockwave ring
          const currentR = Math.max(0, pt.startR + (pt.endR - pt.startR) * (pt.life / pt.max));
          ctx.strokeStyle = rgba(pt.col, a * 0.8);
          ctx.lineWidth = pt.width * a;
          ctx.beginPath();
          ctx.ellipse(pt.x, pt.y, currentR, currentR * 0.35, 0, 0, Math.PI * 2);
          ctx.stroke();
        } 
        else if (pt.type === 'lensflare') {
          // Draw expanding central glowing star
          const sz = Math.max(0, pt.maxSize * Math.sin((pt.life / pt.max) * Math.PI));
          drawStar(pt.x, pt.y, sz, sz * 0.35, pt.col);
        }
      }
      ctx.shadowBlur = 0; // reset
    };

    // ---------- main loop ----------
    const loop = (now: number) => {
      if (!eng.running) return;
      const dt = Math.min(0.05, (now - eng.lastT) / 1000); eng.lastT = now;
      const audio = eng.audio;
      if (!audio) { eng.raf = requestAnimationFrame(loop); return; }
      eng.lead = leadVal();
      const at = audio.currentTime;
      const t = at + offsetSec();
      const missWin = 0.18 * winScale();

      while (eng.startIdx < eng.chart.length) {
        const n = eng.chart[eng.startIdx];
        if (n.hit || n.missed) { eng.startIdx++; continue; }
        if (t > n.time + missWin) {
          if (n.holdDuration && n.holdActive) break;
          if (n.holdDuration && n.holdReleasedEarly) { eng.startIdx++; continue; }
          n.missed = true; registerMiss(); eng.startIdx++; continue;
        }
        break;
      }

      // Process hold ticks and success/fails
      for (let i = eng.startIdx; i < eng.chart.length; i++) {
        const n = eng.chart[i];
        if (n.time > t + eng.lead) break;
        if (n.holdDuration && n.holdActive) {
          const endTime = n.time + n.holdDuration;
          if (t >= endTime) {
            n.holdActive = false;
            n.hit = true;
            spawnParticles(n.lane, 'pp');
          } else {
            // Hold notes stay in their own lane — check only n.lane
            if (!eng.laneHeld[n.lane]) {
              n.holdActive = false;
              n.holdReleasedEarly = true;
              n.missed = true;
              registerMiss();
            } else {
              // Tick score
              if (Math.random() < 0.22) {
                eng.score += Math.round(1.2 * comboMult() * (eng.feverActive ? 2 : 1) * difficulty.mult);
                const g = eng.geo;
                if (g) {
                  const px = g.botCenters[n.lane] + (Math.random() - 0.5) * 20;
                  const py = g.hitY;
                  eng.particles.push({
                    type: 'spark',
                    x: px, y: py,
                    vx: (Math.random() - 0.5) * 110,
                    vy: -140 - Math.random() * 140,
                    life: 0, max: 0.35 + Math.random() * 0.25,
                    col: activeLaneColors[n.lane], r: 1.2 + Math.random() * 2.2
                  });
                }
              }
            }
          }
        }
      }

      if (eng.feverActive && t >= eng.feverUntil) deactivateFever();
      if (eng.feverActive) eng.feverFill = Math.max(0, eng.feverFill - dt / 8);

      if (els.current.feverFill) (els.current.feverFill as HTMLElement).style.width = (eng.feverFill * 100).toFixed(1) + '%';
      if (els.current.bolt) {
        const ready = eng.feverFill >= 1 || eng.feverActive;
        const b = els.current.bolt as HTMLElement;
        b.style.color = ready ? '#ffd23f' : 'rgba(255,255,255,.35)';
        b.style.filter = ready ? 'drop-shadow(0 0 8px #ffd23f)' : '';
      }
      if (els.current.progress) (els.current.progress as HTMLElement).style.width = Math.min(100, (at / song.duration) * 100).toFixed(2) + '%';
      setText('time', formatTime(at) + ' / ' + formatTime(song.duration));

      for (let i = eng.particles.length - 1; i >= 0; i--) {
        const pt = eng.particles[i]; pt.life += dt;
        if (pt.life >= pt.max) { eng.particles.splice(i, 1); continue; }
        if (pt.drag) {
          pt.vx *= Math.pow(pt.drag, dt * 60);
          pt.vy *= Math.pow(pt.drag, dt * 60);
        }
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
      }

      draw(t, now);

      if (at >= song.duration - 0.05) { finish(); return; }
      eng.raf = requestAnimationFrame(loop);
    };
    eng.loop = loop;

    // ---------- countdown ----------
    const startCountdown = () => {
      const el = els.current.count;
      if (!el) { eng.countdownDone = true; return; }
      const seq = ['3', '2', '1', isJune ? '✊' : 'GO'];
      let i = 0;
      const step = () => {
        if (!eng.running) return;
        if (i >= seq.length) { eng.countdownDone = true; el.style.opacity = '0'; return; }
        el.textContent = seq[i];
        el.classList.remove('tt-count-go'); void el.offsetWidth; el.classList.add('tt-count-go');
        i++;
        eng.countTimer = window.setTimeout(step, 650);
      };
      step();
    };

    // ---------- finish ----------
    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const acc = eng.judged ? eng.accSum / eng.judged : 100;
      const gd = gradeFor(acc);
      const prevBest = getBest(song.id, difficulty.name);
      const result: TrapTapResult = {
        songId: song.id, songTitle: song.title, artist: song.artist, difficulty: difficulty.name,
        score: eng.score, accuracy: +acc.toFixed(2), maxCombo: eng.maxCombo,
        grade: gd.grade, rank: gd.rank, counts: { ...eng.counts },
        isNewBest: eng.score > prevBest,
      };
      teardown();
      onFinish(result);
    };
    eng.finish = finish;

    // ---------- begin / teardown ----------
    const begin = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = 0.92;
      audio.currentTime = 0;
      eng.audio = audio;
      audio.play().catch((err) => {
        console.error("TrapTap audio playback failed:", err);
      });
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      eng.running = true;
      eng.countdownDone = false;
      eng.lastT = performance.now();
      startCountdown();
      cancelAnimationFrame(eng.raf);
      eng.raf = requestAnimationFrame(loop);
    };
    eng.begin = begin;

    const teardown = () => {
      eng.running = false;
      cancelAnimationFrame(eng.raf);
      clearTimeout(eng.countTimer);
      if (eng.audio) {
        try { eng.audio.pause(); } catch { /* */ }
        eng.audio = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (rootRef.current) rootRef.current.style.filter = '';
    };
    eng.teardown = teardown;

    const activePointers = new Map<number, number>();

    const getLaneFromXY = (clientX: number, clientY: number) => {
      const rect = eng.canvasRect || (canvasRef.current ? canvasRef.current.getBoundingClientRect() : null);
      if (!rect) return 0;
      const relativeX = clientX - rect.left;
      const relativeY = clientY - rect.top;
      
      const g = eng.geo;
      if (!g) return 0;
      const { vanishY, H, hitY, topBoundaries, botBoundaries } = g;
      
      // Interpolate based on screen-space vertical coordinates
      // Map depth relative to hitY since our road guides pass through botBoundaries at hitY.
      const t = Math.max(0, (relativeY - vanishY) / (hitY - vanishY));
      
      // Check which trapezoidal lane the touch coordinates fall within
      for (let i = 0; i < LANE_COUNT; i++) {
        const leftBound = topBoundaries[i] + (botBoundaries[i] - topBoundaries[i]) * t;
        const rightBound = topBoundaries[i+1] + (botBoundaries[i+1] - topBoundaries[i+1]) * t;
        if (relativeX >= leftBound && relativeX < rightBound) {
          return i;
        }
      }
      // Fallback: compare relative X to boundaries at target height
      if (relativeX < topBoundaries[0] + (botBoundaries[0] - topBoundaries[0]) * t) return 0;
      return LANE_COUNT - 1;
    };

    // ---------- inputs ----------
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') { e.preventDefault(); eng.requestPause?.(); return; }
      if (e.code in KEY_MAP) {
        e.preventDefault();
        const lane = KEY_MAP[e.code];
        if (!eng.keyHeld[lane]) {
          eng.keyHeld[lane] = true;
          eng.laneHeld[lane] = true;
          pressLane(lane);
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code in KEY_MAP) {
        e.preventDefault();
        const lane = KEY_MAP[e.code];
        eng.keyHeld[lane] = false;
        
        let pointerHolding = false;
        activePointers.forEach((l) => { if (l === lane) pointerHolding = true; });
        if (!pointerHolding) {
          eng.laneHeld[lane] = false;
          releaseLane(lane);
        }
      }
    };
    const onBlur = () => {
      for (let i = 0; i < LANE_COUNT; i++) {
        if (eng.keyHeld[i] || eng.laneHeld[i]) {
          eng.keyHeld[i] = false;
          eng.laneHeld[i] = false;
          releaseLane(i);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    const laneHandlers: Array<{ el: HTMLDivElement; downFn: any; moveFn: any; upFn: any }> = [];
    laneRefs.current.forEach((el, lane) => {
      if (!el) return;
      const downFn = (e: PointerEvent) => {
        e.preventDefault();
        try { el.setPointerCapture(e.pointerId); } catch {}
        activePointers.set(e.pointerId, lane);
        
        const newHeld = [false, false, false, false];
        activePointers.forEach((l) => { newHeld[l] = true; });
        for (let i = 0; i < LANE_COUNT; i++) {
          eng.laneHeld[i] = newHeld[i] || eng.keyHeld[i];
        }
        pressLane(lane);
      };

      const moveFn = (e: PointerEvent) => {
        if (!activePointers.has(e.pointerId)) return;
        const oldLane = activePointers.get(e.pointerId);
        const newLane = getLaneFromXY(e.clientX, e.clientY);
        if (oldLane !== newLane) {
          activePointers.set(e.pointerId, newLane);
          
          const newHeld = [false, false, false, false];
          activePointers.forEach((l) => { newHeld[l] = true; });
          for (let i = 0; i < LANE_COUNT; i++) {
            eng.laneHeld[i] = newHeld[i] || eng.keyHeld[i];
          }

          let otherHoldingOld = eng.keyHeld[oldLane!];
          activePointers.forEach((l, id) => {
            if (id !== e.pointerId && l === oldLane) otherHoldingOld = true;
          });
          if (!otherHoldingOld) {
            releaseLane(oldLane!);
          }
        }
      };

      const upFn = (e: PointerEvent) => {
        e.preventDefault();
        try { el.releasePointerCapture(e.pointerId); } catch {}
        const oldLane = activePointers.get(e.pointerId);
        activePointers.delete(e.pointerId);

        const newHeld = [false, false, false, false];
        activePointers.forEach((l) => { newHeld[l] = true; });
        for (let i = 0; i < LANE_COUNT; i++) {
          eng.laneHeld[i] = newHeld[i] || eng.keyHeld[i];
        }

        if (oldLane !== undefined) {
          let otherHoldingOld = eng.keyHeld[oldLane];
          activePointers.forEach((l) => { if (l === oldLane) otherHoldingOld = true; });
          if (!otherHoldingOld) {
            releaseLane(oldLane);
          }
        }
      };

      el.addEventListener('pointerdown', downFn);
      el.addEventListener('pointermove', moveFn);
      el.addEventListener('pointerup', upFn);
      el.addEventListener('pointercancel', upFn);
      laneHandlers.push({ el, downFn, moveFn, upFn });
    });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      laneHandlers.forEach(({ el, downFn, moveFn, upFn }) => {
        el.removeEventListener('pointerdown', downFn);
        el.removeEventListener('pointermove', moveFn);
        el.removeEventListener('pointerup', upFn);
        el.removeEventListener('pointercancel', upFn);
      });
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song, difficulty]);

  // Wire overlay buttons to engine actions.
  const start = () => { setPhase('playing'); E.current.begin?.(); };
  const requestPause = () => {
    if (!E.current.running) return;
    E.current.audio?.pause();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    E.current.running = false;
    cancelAnimationFrame(E.current.raf);
    setPhase('paused');
  };
  E.current.requestPause = requestPause;
  const resume = () => {
    setPhase('playing');
    E.current.audio?.play().catch(() => {});
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
    E.current.running = true;
    E.current.lastT = performance.now();
    E.current.raf = requestAnimationFrame(E.current.loop);
  };
  const endNow = () => { E.current.finish?.(); };

  // Theme colors
  const accent = isJune ? '#E31B23' : LANE_COLORS[0];
  const feverGrad = isJune
    ? 'linear-gradient(90deg,#E31B23,#FFD700)'
    : 'linear-gradient(90deg,#FF0080,#B026FF)';
  const progressGrad = isJune
    ? 'linear-gradient(90deg,#E31B23,#00843D,#FFD700)'
    : 'linear-gradient(90deg,#FF0080,#B026FF,#00B4FF)';
  const feverShadow = isJune
    ? '0 0 10px rgba(227,27,35,.6)'
    : '0 0 10px rgba(255,0,128,.6)';
  const progressShadow = isJune
    ? '0 0 8px rgba(0,132,61,.7)'
    : '0 0 8px rgba(176,38,255,.7)';
  const diffChipBg = isJune ? 'rgba(227,27,35,.16)' : 'rgba(255,0,128,.16)';
  const diffChipBorder = isJune ? 'rgba(227,27,35,.3)' : 'rgba(255,0,128,.3)';
  const diffChipColor = isJune ? '#FFD700' : '#ff77b6';
  const comboColor = isJune ? '#FFD700' : '#ff5cb0';
  const comboShadow = isJune ? '0 0 14px rgba(255,215,0,.5)' : '0 0 14px rgba(255,0,128,.5)';
  const comboMultColor = isJune ? '#E31B23' : '#ff8fc6';
  const accGradeColor = isJune ? '#FFD700' : '#3ff0c0';
  const bestColor = isJune ? '#00843D' : '#8fb4ff';
  const readyTitleGrad = isJune
    ? 'linear-gradient(100deg,#E31B23,#FFD700 42%,#00843D 78%)'
    : 'linear-gradient(100deg,#FF0080,#B026FF 50%,#00B4FF)';
  const startBtnGrad = isJune
    ? 'linear-gradient(100deg,#E31B23,#8B0000 55%,#00843D)'
    : 'linear-gradient(100deg,#FF0080,#B026FF 55%,#00B4FF)';
  const feverBannerGrad = isJune
    ? 'linear-gradient(100deg,#E31B23,#FFD700,#00843D)'
    : 'linear-gradient(100deg,#FF0080,#B026FF,#00B4FF)';
  const feverBannerShadow = isJune
    ? 'drop-shadow(0 0 24px rgba(255,215,0,.7))'
    : 'drop-shadow(0 0 24px rgba(176,38,255,.7))';
  const countdownGrad = isJune
    ? 'linear-gradient(120deg,#E31B23,#FFD700,#00843D)'
    : 'linear-gradient(120deg,#FF0080,#B026FF,#00B4FF)';
  const countdownShadow = isJune
    ? 'drop-shadow(0 0 30px rgba(255,215,0,.6))'
    : 'drop-shadow(0 0 30px rgba(176,38,255,.6))';
  const bottomLabelColor = isJune ? '#E31B23' : '#ff5cb0';
  const bottomComboColor = isJune ? '#FFD700' : '#5cd0ff';
  const bottomBorderA = isJune ? 'rgba(227,27,35,.25)' : 'rgba(255,0,128,.25)';
  const bottomBorderB = isJune ? 'rgba(0,132,61,.25)' : 'rgba(0,180,255,.25)';
  const resumeBtnGrad = isJune
    ? 'linear-gradient(100deg,#E31B23,#8B0000)'
    : 'linear-gradient(100deg,#FF0080,#B026FF)';
  const resumeBtnShadow = isJune ? '0 0 22px rgba(227,27,35,.4)' : '0 0 22px rgba(255,0,128,.4)';

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 overflow-hidden select-none"
      style={{
        color: '#fff',
        background: isJune ? JUNETEENTH_BG : DEFAULT_BG,
        fontFamily: "'Inter',system-ui,sans-serif",
      }}
    >
      <style>{`
        @keyframes ttJudgePop{0%{transform:translate(-50%,6px) scale(.7);opacity:0}18%{transform:translate(-50%,0) scale(1.12);opacity:1}70%{opacity:1;transform:translate(-50%,0) scale(1)}100%{transform:translate(-50%,-10px) scale(.96);opacity:0}}
        .tt-pop{animation:ttJudgePop .62s cubic-bezier(.2,.9,.25,1) forwards}
        @keyframes ttComboPop{0%{transform:scale(1)}30%{transform:scale(1.28)}100%{transform:scale(1)}}
        .tt-combo.tt-pop{animation:ttComboPop .34s ease-out}
        @keyframes ttCountPop{0%{transform:translate(-50%,-50%) scale(2.1);opacity:0}30%{opacity:1}100%{transform:translate(-50%,-50%) scale(.5);opacity:0}}
        .tt-count-go{animation:ttCountPop .9s ease-out forwards}
        @keyframes ttFeverFlash{0%{opacity:0;transform:translateX(-50%) scale(.6)}20%{opacity:1;transform:translateX(-50%) scale(1.05)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) scale(1.1)}}
        .tt-fever-go{animation:ttFeverFlash 2.4s ease-out forwards}
      `}</style>

      {isJune && (
        <video
          ref={videoRef}
          src="/home/trey-origin-hero.mp4"
          loop
          muted
          playsInline
          autoPlay
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{
            zIndex: 0,
            opacity: 0.25,
          }}
        />
      )}

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" style={{ zIndex: 1 }} />
      <audio
        ref={audioRef}
        src={song.audioUrl}
        preload="auto"
      />

      {/* lane hit zones */}
      <div className="absolute left-0 right-0 flex" style={{ top: '54%', bottom: '8%', zIndex: 2 }}>
        {Array.from({ length: LANE_COUNT }).map((_, i) => (
          <div key={i} ref={(el) => { laneRefs.current[i] = el; }} className="flex-1 h-full" />
        ))}
      </div>

      {/* judgment */}
      <div ref={(el) => { els.current.judge = el; }} className="tt-pop" style={{ position: 'absolute', left: '50%', top: '60%', transform: 'translate(-50%,0)', zIndex: 6, textAlign: 'center', pointerEvents: 'none', opacity: 0 }}>
        <div ref={(el) => { els.current.judgeMain = el; }} style={{ fontWeight: 900, fontSize: 42, lineHeight: 1, background: 'linear-gradient(90deg,#ffd23f,#fff 50%,#00e0ff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 2px 14px rgba(255,255,255,.35))' }}>PERFECT+</div>
        <div ref={(el) => { els.current.judgeSub = el; }} style={{ marginTop: 6, fontWeight: 800, fontSize: 13, letterSpacing: '.34em', color: '#fff', background: 'rgba(176,38,255,.4)', display: 'inline-block', padding: '3px 12px', borderRadius: 8, textIndent: '.34em' }}>ULTRA HIT</div>
      </div>

      {/* top HUD */}
      <div className="absolute left-0 right-0 top-0" style={{ zIndex: 7, padding: 'calc(env(safe-area-inset-top) + 12px) 12px 0' }}>
        <div className="flex items-center" style={{ gap: 9 }}>
          <button onClick={requestPause} className="flex items-center justify-center" style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 14, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', backdropFilter: 'blur(12px)' }}>
            <Pause size={18} />
          </button>
          <div className="flex items-center" style={{ flex: 1, minWidth: 0, gap: 10, padding: '7px 11px 7px 7px', borderRadius: 16, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', backdropFilter: 'blur(12px)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,#1a0a2e,#04121f)' }}>
              <img src={song.coverArtUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}{isJune && ' ✊'}</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.55)', marginTop: 3 }}>{song.artist}</div>
            </div>
            <span style={{ flexShrink: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: '.08em', padding: '3px 7px', borderRadius: 7, background: diffChipBg, border: `1px solid ${diffChipBorder}`, color: diffChipColor }}>{difficulty.name.toUpperCase()}</span>
          </div>
          <div style={{ flexShrink: 0, width: 100, padding: '8px 10px', borderRadius: 14, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', backdropFilter: 'blur(12px)' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, letterSpacing: '.18em', color: 'rgba(255,255,255,.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{isJune ? 'POWER' : 'FEVER'}<span ref={(el) => { els.current.bolt = el; }} style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>{isJune ? '✊' : '⚡'}</span></div>
            <div style={{ marginTop: 6, height: 8, borderRadius: 5, background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}>
              <div ref={(el) => { els.current.feverFill = el; }} style={{ height: '100%', width: '0%', borderRadius: 5, background: feverGrad, boxShadow: feverShadow }} />
            </div>
          </div>
        </div>

        <div className="flex items-center" style={{ gap: 9, marginTop: 11 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 3, background: 'rgba(255,255,255,.12)', overflow: 'hidden' }}>
            <div ref={(el) => { els.current.progress = el; }} style={{ height: '100%', width: '0%', background: progressGrad, boxShadow: progressShadow }} />
          </div>
          <span ref={(el) => { els.current.time = el; }} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,.5)', flexShrink: 0 }}>0:00 / 0:00</span>
        </div>

        <div className="flex items-start justify-between" style={{ gap: 10, marginTop: 12 }}>
          <div style={{ minWidth: 74, padding: '8px 12px', borderRadius: 18, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', backdropFilter: 'blur(12px)' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, letterSpacing: '.18em', color: 'rgba(255,255,255,.5)' }}>COMBO</div>
            <div ref={(el) => { els.current.combo = el; }} className="tt-combo" style={{ fontWeight: 900, fontSize: 26, lineHeight: 1, color: comboColor, textShadow: comboShadow }}>0</div>
            <div ref={(el) => { els.current.comboMult = el; }} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: comboMultColor, marginTop: 2 }}>x1</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '9px 14px 11px', borderRadius: '0 0 22px 22px', background: 'linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.03))', border: '1px solid rgba(255,255,255,.14)', borderTop: 'none', backdropFilter: 'blur(14px)', boxShadow: '0 10px 30px rgba(0,0,0,.4)' }}>
            <div ref={(el) => { els.current.score = el; }} style={{ fontWeight: 900, fontSize: 30, lineHeight: 1 }}>0</div>
            <div ref={(el) => { els.current.best = el; }} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '.14em', color: bestColor, marginTop: 4 }}>BEST 0</div>
          </div>
          <div style={{ minWidth: 74, textAlign: 'right', padding: '8px 12px', borderRadius: 18, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', backdropFilter: 'blur(12px)' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, letterSpacing: '.18em', color: 'rgba(255,255,255,.5)' }}>ACCURACY</div>
            <div ref={(el) => { els.current.acc = el; }} style={{ fontWeight: 900, fontSize: 21, lineHeight: 1.1 }}>100%</div>
            <div ref={(el) => { els.current.grade = el; }} style={{ fontWeight: 900, fontSize: 14, color: accGradeColor, textShadow: `0 0 12px ${accGradeColor}80`, marginTop: 1 }}>S+</div>
          </div>
        </div>
      </div>

      {/* fever / power banner */}
      <div ref={(el) => { els.current.feverText = el; }} style={{ position: 'absolute', left: '50%', bottom: '15%', transform: 'translateX(-50%)', zIndex: 6, opacity: 0, pointerEvents: 'none', fontWeight: 900, fontSize: 46, letterSpacing: '.04em', fontStyle: 'italic', background: feverBannerGrad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: feverBannerShadow, whiteSpace: 'nowrap' }}>{isJune ? 'BLACK POWER ✊' : 'FEVER MODE'}</div>

      {/* bottom wordmark */}
      <div className="absolute left-0 right-0 bottom-0" style={{ zIndex: 7, padding: '0 14px calc(env(safe-area-inset-bottom) + 12px)' }}>
        <div className="flex items-center justify-between" style={{ gap: 10 }}>
          <div className="flex items-center" style={{ gap: 7, padding: '8px 12px', borderRadius: 13, background: 'rgba(255,255,255,.05)', border: `1px solid ${bottomBorderA}` }}>
            <span style={{ color: bottomLabelColor }}>{isJune ? '✊' : '⚡'}</span>
            <div style={{ lineHeight: 1.05, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: '.1em' }}><div>{isJune ? 'BLACK' : 'ULTRA'}</div><div style={{ color: comboMultColor }}>{isJune ? 'POWER' : 'BURST'}</div></div>
          </div>
          <div style={{ textAlign: 'right', padding: '8px 12px', borderRadius: 13, background: 'rgba(255,255,255,.05)', border: `1px solid ${bottomBorderB}` }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '.14em', color: 'rgba(255,255,255,.55)' }}>COMBO</div>
            <div ref={(el) => { els.current.bottomCombo = el; }} style={{ fontWeight: 900, fontSize: 15, color: bottomComboColor, lineHeight: 1, marginTop: 1 }}>0</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 9, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '.6em', color: isJune ? 'rgba(227,27,35,.45)' : 'rgba(255,255,255,.32)', textIndent: '.6em' }}>{isJune ? 'J U N E T E E N T H' : 'T R A P\u00a0\u00a0T A P'}</div>
      </div>

      {/* countdown */}
      <div ref={(el) => { els.current.count = el; }} className="tt-count-go" style={{ position: 'absolute', left: '50%', top: '48%', transform: 'translate(-50%,-50%)', zIndex: 8, fontWeight: 900, fontSize: 120, lineHeight: 1, opacity: 0, pointerEvents: 'none', background: countdownGrad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: countdownShadow }}>3</div>

      {/* ready overlay */}
      {phase === 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 9, background: isJune ? 'rgba(10,6,0,.82)' : 'rgba(2,0,8,.78)', backdropFilter: 'blur(8px)', gap: 16 }}>
          {isJune && <div style={{ fontSize: 64, lineHeight: 1, filter: 'drop-shadow(0 0 20px rgba(227,27,35,.5))' }}>✊</div>}
          <div style={{ fontWeight: 900, fontSize: 34, letterSpacing: '-.01em', background: readyTitleGrad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{song.title}</div>
          {isJune && <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '.18em', color: '#FFD700', textShadow: '0 0 12px rgba(255,215,0,.4)' }}>FREEDOM · LIBERATION · POWER</div>}
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, letterSpacing: '.14em', color: 'rgba(255,255,255,.55)' }}>{song.artist} · {difficulty.name.toUpperCase()} · {Math.round(song.bpm)} BPM</div>
          <button onClick={start} style={{ marginTop: 8, padding: '16px 48px', borderRadius: 16, fontWeight: 900, letterSpacing: '.2em', cursor: 'pointer', border: 'none', color: '#fff', background: startBtnGrad, boxShadow: `0 0 30px ${rgba(accent, 0.5)}` }}>▶ TAP TO START</button>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, letterSpacing: '.14em', color: 'rgba(255,255,255,.4)' }}>TAP THE LANES · OR KEYS D F J K</div>
          <button onClick={onExit} style={{ marginTop: 4, background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={15} /> Back to Games</button>
        </div>
      )}

      {/* pause overlay */}
      {phase === 'paused' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 9, background: isJune ? 'rgba(10,6,0,.85)' : 'rgba(2,0,8,.82)', backdropFilter: 'blur(8px)', gap: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: '.18em' }}>PAUSED</div>
          <button onClick={resume} style={{ width: 220, padding: 15, borderRadius: 15, cursor: 'pointer', fontWeight: 800, letterSpacing: '.12em', border: 'none', color: '#fff', background: resumeBtnGrad, boxShadow: resumeBtnShadow }}>RESUME</button>
          <button onClick={endNow} style={{ width: 220, padding: 15, borderRadius: 15, cursor: 'pointer', fontWeight: 800, letterSpacing: '.12em', color: isJune ? '#FFD700' : '#ff8fc6', background: isJune ? 'rgba(227,27,35,.08)' : 'rgba(255,0,128,.08)', border: `1px solid ${isJune ? 'rgba(227,27,35,.25)' : 'rgba(255,0,128,.25)'}` }}>END SONG</button>
          <button onClick={onExit} style={{ width: 220, padding: 15, borderRadius: 15, cursor: 'pointer', fontWeight: 800, letterSpacing: '.12em', color: 'rgba(255,255,255,.8)', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.16)' }}>QUIT TO GAMES</button>
        </div>
      )}
    </div>
  );
};

export default TrapTapGameplay;
