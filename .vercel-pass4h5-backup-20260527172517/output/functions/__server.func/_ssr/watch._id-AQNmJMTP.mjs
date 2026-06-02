import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { D as Route$17, b as useAuth$1, l as useGuide, E as useSubmissions, v as posts, F as STATUS_LABEL, H as STATUS_TONE } from "./router-BtgGywEC.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { D as episodeById, G as showById, E as channelById } from "./index.mjs";
import "../_libs/react-dom.mjs";
import { i as Lock, t as Crown, b as Heart, au as MessageCircle, a8 as Bookmark, ae as Share2 } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
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
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
const CIRCUMFERENCE = 2 * Math.PI * 65;
const SEG_COUNT = 10;
const STALL_ZONES = [[28, 32], [58, 63], [88, 92]];
const STATUS_MESSAGES = [
  [0, "Connecting to TreyTV…"],
  [10, "Authenticating stream…"],
  [22, "Loading channel data…"],
  [35, "Fetching video source…"],
  [48, "Buffering content…"],
  [60, "Optimizing quality…"],
  [72, "Almost there…"],
  [85, "Finalizing stream…"],
  [94, "Launching player…"],
  [99, "Starting now…"]
];
const MILESTONES = {
  25: "25% Loaded",
  50: "Halfway There",
  75: "75% Buffered",
  100: "Stream Ready"
};
function nextPct(cur) {
  for (const [lo, hi] of STALL_ZONES) {
    if (cur >= lo && cur < hi) return cur + (Math.random() < 0.3 ? 1 : 0);
  }
  return Math.min(cur + 1 + Math.floor(Math.random() * 2), 100);
}
function BufferingScreen({ onPlay }) {
  const [stars, setStars] = reactExports.useState([]);
  const [pct, setPct] = reactExports.useState(0);
  const [statusMsg, setStatusMsg] = reactExports.useState(STATUS_MESSAGES[0][1]);
  const [flash, setFlash] = reactExports.useState(null);
  const [complete, setComplete] = reactExports.useState(false);
  const pctRef = reactExports.useRef(0);
  const triggered = reactExports.useRef(/* @__PURE__ */ new Set());
  reactExports.useEffect(() => {
    setStars(
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 0.4 + Math.random() * 1.4,
        dur: `${2 + Math.random() * 4}s`,
        delay: `${Math.random() * 5}s`
      }))
    );
  }, []);
  reactExports.useEffect(() => {
    const tick = setInterval(() => {
      const next = nextPct(pctRef.current);
      if (next === pctRef.current) return;
      const prev = pctRef.current;
      pctRef.current = next;
      setPct(next);
      let msg = STATUS_MESSAGES[0][1];
      for (const [t, text] of STATUS_MESSAGES) {
        if (next >= t) msg = text;
      }
      setStatusMsg(msg);
      for (const key of [25, 50, 75, 100]) {
        if (next >= key && prev < key && !triggered.current.has(key)) {
          triggered.current.add(key);
          setFlash({ key: Date.now(), text: MILESTONES[key] });
        }
      }
      if (next >= 100) {
        clearInterval(tick);
        setTimeout(() => setComplete(true), 1200);
      }
    }, 60);
    return () => clearInterval(tick);
  }, []);
  const offset = CIRCUMFERENCE - pct / 100 * CIRCUMFERENCE;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: CSS }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "buf-root", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-noise" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-scan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-glow" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-stars", "aria-hidden": "true", children: stars.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "buf-star",
          style: { left: s.left, top: s.top, width: `${s.size}px`, height: `${s.size}px`, animationDuration: s.dur, animationDelay: s.delay }
        },
        s.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "buf-container", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "buf-logo-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "buf-logo-trey", children: "Trey" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "buf-logo-tv", children: [
            "TV",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "buf-spark", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "buf-sp buf-sp1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "buf-sp buf-sp2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "buf-sp buf-sp3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "buf-sp buf-sp4" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "buf-ring-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-ring-outer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-ring-arc" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-ring-mask" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "buf-ring-svg", viewBox: "0 0 160 160", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "bufRingGrad", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#c8860a" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "40%", stopColor: "#fce060" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "70%", stopColor: "#fff4a0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#f0c040" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("filter", { id: "bufRingGlow", x: "-20%", y: "-20%", width: "140%", height: "140%", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("feGaussianBlur", { stdDeviation: "2.5", result: "blur" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("feMerge", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "blur" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "SourceGraphic" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "buf-ring-track", cx: "80", cy: "80", r: "65" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "buf-ring-fill", cx: "80", cy: "80", r: "65", style: { strokeDashoffset: offset } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "buf-ring-inner", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "buf-pct-num", children: pct }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "buf-pct-sym", children: "%" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "buf-status-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-status-label", children: statusMsg }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-bar-track", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-bar-fill", style: { width: `${pct}%` }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-bar-head" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-ticks", children: [0, 25, 50, 75, 100].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `buf-tick${pct >= v ? " lit" : ""}`, children: v }, v)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-segs", children: Array.from({ length: SEG_COUNT }, (_, i) => {
            const threshold = (i + 1) * 10;
            const cls = pct >= threshold ? "done" : pct >= threshold - 10 ? "active" : "";
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `buf-seg${cls ? ` ${cls}` : ""}` }, i);
          }) })
        ] })
      ] }),
      flash && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-flash pop" }, `f-${flash.key}`),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "buf-badge show", children: [
          "✦ ",
          flash.text,
          " ✦"
        ] }, `b-${flash.key}`)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `buf-complete${complete ? " show" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "buf-co-logo", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "buf-co-trey", children: "Trey" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "buf-co-tv", children: [
            "TV",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "buf-co-spark", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "buf-co-sp buf-co-sp1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "buf-co-sp buf-co-sp2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "buf-co-sp buf-co-sp3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "buf-co-sp buf-co-sp4" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "buf-co-divider", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-co-dline l" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-co-dgem" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-co-dline r" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-co-title", children: "Thank You For Waiting" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-co-exclusive", children: "Here's Your Trizzy Exclusive Clip" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "buf-co-enjoy", children: "Enjoy!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "buf-play-btn", onClick: onPlay, "aria-label": "Play video", children: "▶" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "buf-replay-btn", onClick: () => window.location.reload(), children: "↺ Watch Again" })
      ] })
    ] })
  ] });
}
const CSS = `
.buf-root {
  position: fixed; inset: 0; z-index: 10000;
  background: #05070D;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  font-family: 'Raleway', sans-serif;
}

.buf-noise {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
}

.buf-scan {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px);
}

.buf-glow {
  position: absolute; inset: 0; z-index: 0;
  background: radial-gradient(ellipse 70% 55% at 50% 50%, rgba(150,110,8,0.1) 0%, transparent 65%);
  animation: bufBgBreath 4s ease-in-out infinite;
}
@keyframes bufBgBreath { 0%,100%{opacity:.5} 50%{opacity:1} }

.buf-stars { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.buf-star { position: absolute; border-radius: 50%; background: #fff; animation: bufTwinkle ease-in-out infinite; }
@keyframes bufTwinkle { 0%,100%{opacity:.1} 50%{opacity:.7} }

.buf-container {
  position: relative; z-index: 10;
  display: flex; flex-direction: column; align-items: center;
  width: min(480px, 92vw);
}

.buf-logo-wrap {
  display: flex; align-items: center; margin-bottom: 44px;
  animation: bufFadeDown .9s cubic-bezier(.16,1,.3,1) .2s both;
}
@keyframes bufFadeDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }

.buf-logo-trey {
  font-family: 'Cinzel Decorative', cursive; font-size: clamp(28px,6vw,42px); font-weight: 700;
  background: linear-gradient(150deg,#e0e0e0 0%,#fff 20%,#aaa 40%,#f5f5f5 58%,#888 74%,#e8e8e8 88%,#fff 100%);
  background-size: 250% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: bufSFlow 3.5s linear 1s infinite;
  filter: drop-shadow(0 0 16px rgba(255,255,255,0.1));
}

.buf-logo-tv {
  font-family: 'Cinzel Decorative', cursive; font-size: clamp(28px,6vw,42px); font-weight: 700;
  background: linear-gradient(150deg,#a05c04 0%,#f5d050 20%,#fef8b0 36%,#e0980a 52%,#fce97a 68%,#b06408 82%,#f5d050 100%);
  background-size: 250% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: bufGFlow 3s linear 1.2s infinite;
  filter: drop-shadow(0 0 20px rgba(220,170,20,0.5));
  position: relative;
}

.buf-spark { position: absolute; top: -8px; right: -16px; width: 28px; height: 28px; }
.buf-sp { position: absolute; top: 50%; left: 50%; background: #fce45a; border-radius: 1px; }
.buf-sp1 { width: 1.5px; height: 24px; transform: translate(-50%,-50%); animation: bufSpk 2s ease-in-out 1.5s infinite; }
.buf-sp2 { width: 24px; height: 1.5px; transform: translate(-50%,-50%); animation: bufSpk 2s ease-in-out 1.5s infinite; }
.buf-sp3 { width: 1.2px; height: 16px; transform: translate(-50%,-50%) rotate(45deg); animation: bufSpk 2s ease-in-out 1.7s infinite; background: rgba(252,228,90,0.6); }
.buf-sp4 { width: 16px; height: 1.2px; transform: translate(-50%,-50%) rotate(45deg); animation: bufSpk 2s ease-in-out 1.7s infinite; background: rgba(252,228,90,0.6); }
@keyframes bufSpk { 0%,100%{opacity:.4} 50%{opacity:1} }
@keyframes bufSFlow { 0%{background-position:0% center} 100%{background-position:250% center} }
@keyframes bufGFlow { 0%{background-position:0% center} 100%{background-position:250% center} }

.buf-ring-wrap {
  position: relative; width: 160px; height: 160px; margin-bottom: 40px;
  animation: bufFadeIn .8s ease .7s both;
}
@keyframes bufFadeIn { from{opacity:0} to{opacity:1} }

.buf-ring-outer { position: absolute; inset: 0; border-radius: 50%; border: 1px solid rgba(240,192,64,0.08); }
.buf-ring-arc {
  position: absolute; inset: 6px; border-radius: 50%;
  background: conic-gradient(from 0deg,transparent 0%,rgba(240,192,64,0) 50%,rgba(240,192,64,0.4) 75%,rgba(252,224,96,0.9) 90%,#fce060 100%);
  animation: bufSpinArc 1.4s linear infinite;
}
@keyframes bufSpinArc { to { transform: rotate(360deg); } }
.buf-ring-mask { position: absolute; inset: 10px; border-radius: 50%; background: #05070D; }
.buf-ring-svg { position: absolute; inset: 0; transform: rotate(-90deg); }
.buf-ring-track { fill: none; stroke: rgba(255,255,255,0.04); stroke-width: 3; }
.buf-ring-fill {
  fill: none; stroke: url(#bufRingGrad); stroke-width: 3; stroke-linecap: round;
  stroke-dasharray: 408; stroke-dashoffset: 408;
  transition: stroke-dashoffset 0.1s linear;
  filter: url(#bufRingGlow);
}
.buf-ring-inner {
  position: absolute; inset: 20px; border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  background: radial-gradient(ellipse at center, rgba(15,20,35,0.95) 60%, transparent 100%);
}
.buf-pct-num {
  font-family: 'Cinzel', serif; font-size: clamp(28px,6vw,36px); font-weight: 900; line-height: 1;
  background: linear-gradient(155deg,#b8720a,#fce060,#fffacc,#f0c040); background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: bufGFlow 2.5s linear infinite; min-width: 3ch; text-align: center;
}
.buf-pct-sym { font-family: 'Cinzel', serif; font-size: 12px; color: rgba(240,192,64,0.5); letter-spacing: 1px; }

.buf-status-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%;
  animation: bufFadeIn .8s ease 1s both;
}
.buf-status-label {
  font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 5px; text-transform: uppercase;
  color: rgba(240,192,64,0.55); height: 14px; transition: opacity .3s;
}

.buf-bar-track { width: 100%; height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; position: relative; overflow: visible; }
.buf-bar-fill {
  height: 100%; border-radius: 2px;
  background: linear-gradient(90deg,#8a5500,#e8a820,#fce060,#fff8c0,#f0c040); background-size: 200% auto;
  transition: width 0.08s linear; position: relative;
  box-shadow: 0 0 10px rgba(240,192,64,0.4), 0 0 30px rgba(240,192,64,0.15);
  animation: bufBarShimmer 1.5s linear infinite;
}
@keyframes bufBarShimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
.buf-bar-head {
  position: absolute; right: -4px; top: 50%; width: 10px; height: 10px; transform: translateY(-50%);
  background: #fff4a0; border-radius: 50%;
  box-shadow: 0 0 14px 4px rgba(252,224,96,0.7), 0 0 30px rgba(252,224,96,0.3);
  animation: bufHeadPulse 1s ease-in-out infinite;
}
@keyframes bufHeadPulse {
  0%,100%{box-shadow:0 0 14px 4px rgba(252,224,96,0.7),0 0 30px rgba(252,224,96,.3)}
  50%{box-shadow:0 0 20px 6px rgba(252,224,96,0.9),0 0 50px rgba(252,224,96,.4)}
}

.buf-ticks { display: flex; justify-content: space-between; width: 100%; margin-top: 8px; padding: 0 1px; }
.buf-tick { font-family: 'Cinzel', serif; font-size: 8px; letter-spacing: 1px; color: rgba(200,200,200,0.2); transition: color .3s, text-shadow .3s; }
.buf-tick.lit { color: rgba(240,192,64,0.6); text-shadow: 0 0 8px rgba(240,192,64,0.4); }

.buf-segs { display: flex; gap: 6px; margin-top: 18px; }
.buf-seg { width: 28px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.07); transition: background .3s, box-shadow .3s; }
.buf-seg.active { background: #f0c040; box-shadow: 0 0 8px rgba(240,192,64,0.6); }
.buf-seg.done { background: rgba(240,192,64,0.3); }

.buf-flash {
  position: absolute; inset: 0; z-index: 50; pointer-events: none; opacity: 0;
  background: radial-gradient(ellipse 50% 40% at 50% 50%,rgba(255,230,100,0.18),transparent 70%);
}
.buf-flash.pop { animation: bufFlashPop .6s ease forwards; }
@keyframes bufFlashPop { 0%{opacity:0} 20%{opacity:1} 100%{opacity:0} }

.buf-badge {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) scale(0); z-index: 60;
  background: rgba(10,14,24,0.96); border: 1px solid rgba(240,192,64,0.4); border-radius: 12px;
  padding: 14px 28px; font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 4px;
  text-transform: uppercase; color: rgba(240,192,64,0.9); pointer-events: none;
  box-shadow: 0 0 40px rgba(240,192,64,0.15), 0 8px 32px rgba(0,0,0,0.7); white-space: nowrap;
}
.buf-badge.show { animation: bufBadgePop .5s cubic-bezier(.34,1.56,.64,1) forwards, bufBadgeFade .4s ease 1.4s forwards; }
@keyframes bufBadgePop { to { transform: translate(-50%,-50%) scale(1); } }
@keyframes bufBadgeFade { to { opacity: 0; transform: translate(-50%,-60%) scale(0.9); } }

.buf-complete {
  position: absolute; inset: 0; z-index: 40;
  display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 0; padding: 20px;
  background: radial-gradient(ellipse 90% 70% at 50% 50%,rgba(8,11,22,0.99),#05070D 85%);
  opacity: 0; pointer-events: none; transition: opacity .8s ease;
}
.buf-complete.show { opacity: 1; pointer-events: all; }

.buf-co-logo { display: flex; align-items: center; margin-bottom: 32px; opacity: 0; }
.buf-complete.show .buf-co-logo { animation: bufCoItem .8s cubic-bezier(.16,1,.3,1) .2s forwards; }

.buf-co-trey {
  font-family: 'Cinzel Decorative', cursive; font-size: clamp(30px,6vw,46px); font-weight: 700;
  background: linear-gradient(150deg,#e0e0e0 0%,#fff 20%,#aaa 40%,#f5f5f5 58%,#888 74%,#e8e8e8 88%,#fff 100%);
  background-size: 250% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: bufSFlow 3.5s linear 1s infinite;
  filter: drop-shadow(0 0 20px rgba(255,255,255,0.12));
}
.buf-co-tv {
  font-family: 'Cinzel Decorative', cursive; font-size: clamp(30px,6vw,46px); font-weight: 700;
  background: linear-gradient(150deg,#a05c04 0%,#f5d050 20%,#fef8b0 36%,#e0980a 52%,#fce97a 68%,#b06408 82%,#f5d050 100%);
  background-size: 250% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: bufGFlow 3s linear 1.2s infinite;
  filter: drop-shadow(0 0 28px rgba(220,170,20,0.55));
  position: relative;
}
.buf-co-spark { position: absolute; top: -10px; right: -18px; width: 30px; height: 30px; }
.buf-co-sp { position: absolute; top: 50%; left: 50%; background: #fce45a; border-radius: 1px; }
.buf-co-sp1 { width: 1.5px; height: 26px; transform: translate(-50%,-50%); animation: bufSpk 2s ease-in-out 1.5s infinite; }
.buf-co-sp2 { width: 26px; height: 1.5px; transform: translate(-50%,-50%); animation: bufSpk 2s ease-in-out 1.5s infinite; }
.buf-co-sp3 { width: 1.2px; height: 18px; transform: translate(-50%,-50%) rotate(45deg); animation: bufSpk 2s ease-in-out 1.7s infinite; background: rgba(252,228,90,0.6); }
.buf-co-sp4 { width: 18px; height: 1.2px; transform: translate(-50%,-50%) rotate(45deg); animation: bufSpk 2s ease-in-out 1.7s infinite; background: rgba(252,228,90,0.6); }

.buf-co-divider { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; opacity: 0; }
.buf-complete.show .buf-co-divider { animation: bufCoItem .7s ease .45s forwards; }
.buf-co-dline { height: 1px; width: clamp(30px,6vw,60px); }
.buf-co-dline.l { background: linear-gradient(to right,transparent,rgba(240,192,64,0.6)); }
.buf-co-dline.r { background: linear-gradient(to left,transparent,rgba(240,192,64,0.6)); }
.buf-co-dgem { width: 5px; height: 5px; background: #f0c040; transform: rotate(45deg); box-shadow: 0 0 10px rgba(240,192,64,0.9); }

.buf-co-title {
  font-family: 'Cinzel Decorative', cursive; font-size: clamp(22px,5vw,36px); font-weight: 700;
  background: linear-gradient(150deg,#b8720a,#fce060,#fffacc,#f0c040); background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  text-align: center; line-height: 1.2; margin-bottom: 16px; opacity: 0;
}
.buf-complete.show .buf-co-title { animation: bufCoItem .8s cubic-bezier(.16,1,.3,1) .6s forwards, bufGFlow 2.5s linear infinite; }

.buf-co-exclusive {
  font-family: 'Cinzel', serif; font-size: clamp(10px,2vw,13px); letter-spacing: 4px; text-transform: uppercase;
  color: rgba(220,220,220,0.55); text-align: center; margin-bottom: 10px; opacity: 0;
}
.buf-complete.show .buf-co-exclusive { animation: bufCoItem .8s ease .85s forwards; }

.buf-co-enjoy {
  font-family: 'Cinzel Decorative', cursive; font-size: clamp(16px,3.5vw,24px); font-weight: 700; letter-spacing: 3px;
  background: linear-gradient(120deg,#d0d0d0,#fff,#aaa,#fff,#d0d0d0); background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  text-align: center; margin-bottom: 36px; opacity: 0;
}
.buf-complete.show .buf-co-enjoy { animation: bufCoItem .8s ease 1.05s forwards, bufSFlow 4s linear infinite; }

.buf-play-btn {
  display: flex; align-items: center; justify-content: center;
  width: 68px; height: 68px; border-radius: 50%; border: none;
  background: linear-gradient(135deg,#c8860a,#f5d050,#e0980a);
  box-shadow: 0 0 40px rgba(240,192,64,0.4), 0 8px 24px rgba(0,0,0,0.6);
  font-size: 24px; cursor: pointer; transition: all .3s; opacity: 0; margin-bottom: 16px; color: #000;
}
.buf-complete.show .buf-play-btn { animation: bufCoItem .6s cubic-bezier(.34,1.56,.64,1) 1.3s forwards, bufPlayPulse 2s ease-in-out 2s infinite; }
.buf-play-btn:hover { transform: scale(1.1); box-shadow: 0 0 60px rgba(240,192,64,0.6); }
@keyframes bufPlayPulse {
  0%,100%{box-shadow:0 0 40px rgba(240,192,64,0.4),0 8px 24px rgba(0,0,0,0.6)}
  50%{box-shadow:0 0 65px rgba(240,192,64,0.6),0 8px 24px rgba(0,0,0,0.6)}
}

.buf-replay-btn {
  font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
  color: rgba(200,200,200,0.25); background: none; border: none; cursor: pointer; transition: color .3s; opacity: 0;
}
.buf-complete.show .buf-replay-btn { animation: bufCoItem .6s ease 1.6s forwards; }
.buf-replay-btn:hover { color: rgba(240,192,64,0.6); }

@keyframes bufCoItem { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
`;
function VideoPlayer({ src, poster, className, controls = true, fallbackImg, onProgress, onEnded }) {
  const videoRef = reactExports.useRef(null);
  const [buffering, setBuffering] = reactExports.useState(!!src);
  const [dismissed, setDismissed] = reactExports.useState(false);
  function handlePlay() {
    setBuffering(false);
    setDismissed(true);
    videoRef.current?.play();
  }
  if (!src) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: fallbackImg, className, alt: "" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative size-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "video",
      {
        ref: videoRef,
        src,
        poster,
        className,
        controls,
        onWaiting: () => {
          if (dismissed) setBuffering(true);
        },
        onPlaying: () => setBuffering(false),
        onTimeUpdate: (event) => {
          const video = event.currentTarget;
          if (!video.duration || Number.isNaN(video.duration)) return;
          onProgress?.({
            currentTime: video.currentTime,
            duration: video.duration,
            ratio: video.currentTime / video.duration
          });
        },
        onEnded
      }
    ),
    buffering && /* @__PURE__ */ jsxRuntimeExports.jsx(BufferingScreen, { onPlay: handlePlay })
  ] });
}
function WatchPage() {
  const {
    id
  } = Route$17.useParams();
  const {
    user,
    isAdmin
  } = useAuth$1();
  const guide = useGuide();
  const lastProgressWrite = reactExports.useRef(0);
  const store = useSubmissions();
  const s = store.get(id);
  const staticEpisode = episodeById(id);
  reactExports.useEffect(() => {
    if (s || !staticEpisode) return;
    guide.recordProgress({
      episodeId: staticEpisode.id,
      showId: staticEpisode.showId,
      channelId: staticEpisode.channelId,
      progress: Math.max(0.03, guide.progressOf(staticEpisode.id)?.progress ?? 0),
      durationSeconds: staticEpisode.duration * 60
    });
  }, [s?.content_id, staticEpisode?.id]);
  if (!s && staticEpisode) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(StaticWatchPage, { ep: staticEpisode });
  }
  if (!s) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl glass neon-border p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Episode not found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-sm text-primary mt-2 inline-block", children: "Back home" })
    ] }) });
  }
  const isOwner = user?.uid === s.creator_id;
  const visible = s.status === "approved" || s.status === "published" || isOwner || isAdmin;
  if (!visible) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl glass neon-border p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "mx-auto size-8 text-primary mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Episode unavailable" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "This episode is awaiting admin approval." })
    ] }) });
  }
  const related = store.submissions.filter((x) => x.content_id !== s.content_id && (x.status === "approved" || x.status === "published"));
  const moreFromCreator = related.filter((x) => x.creator_id === s.creator_id);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1.6fr,1fr] gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl overflow-hidden glass neon-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative aspect-video bg-black", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VideoPlayer, { src: s.video_url?.startsWith("blob:") ? s.video_url : void 0, poster: s.thumbnail_url, fallbackImg: s.thumbnail_url || posts[0].media, className: "size-full", onProgress: ({
        currentTime,
        duration,
        ratio
      }) => {
        if (Date.now() - lastProgressWrite.current < 1e4 && ratio < 0.92) return;
        lastProgressWrite.current = Date.now();
        guide.recordProgress({
          episodeId: s.content_id,
          showId: s.show_id,
          channelId: s.creator_id,
          progress: ratio,
          progressSeconds: currentTime,
          durationSeconds: duration
        });
      }, onEnded: () => guide.recordProgress({
        episodeId: s.content_id,
        showId: s.show_id,
        channelId: s.creator_id,
        progress: 1,
        completed: true
      }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full border ${STATUS_TONE[s.status]}`, children: STATUS_LABEL[s.status] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10", children: s.quality }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
            s.show_title,
            " · S",
            s.season_number,
            " E",
            s.episode_number
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gradient-gold", children: s.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/channel/$handle", params: {
          handle: s.creator_handle
        }, className: "inline-flex items-center gap-2 hover:opacity-90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.creator_avatar, className: "size-9 rounded-full object-cover", alt: "" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold flex items-center gap-1", children: [
              s.creator_name,
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3 text-primary" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
              "@",
              s.creator_handle,
              " · View channel"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 pt-1", children: [{
          icon: Heart,
          label: "Like"
        }, {
          icon: MessageCircle,
          label: "Comment"
        }, {
          icon: Bookmark,
          label: "Save"
        }, {
          icon: Share2,
          label: "Share"
        }].map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast(b.label), className: "px-3 py-2 rounded-xl glass border border-white/10 text-xs flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(b.icon, { className: "size-3.5" }),
          " ",
          b.label
        ] }, b.label)) }),
        s.short_description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: s.short_description }),
        s.full_description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: s.full_description }),
        s.viewer_context && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl glass border border-white/10 p-3 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-primary mb-1", children: "VIEWER CONTEXT" }),
          s.viewer_context
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: s.tags.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary", children: [
          "#",
          t
        ] }, t)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Rail, { title: "More from this creator", items: moreFromCreator }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Rail, { title: "Related episodes", items: related })
    ] })
  ] }) });
}
function StaticWatchPage({
  ep
}) {
  const guide = useGuide();
  const show = showById(ep.showId);
  const channel = channelById(ep.channelId);
  const saved = guide.has("saved", ep.id);
  const later = guide.has("watchLater", ep.id);
  const progress = guide.progressOf(ep.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1.6fr,1fr] gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl overflow-hidden glass neon-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-video bg-black", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { src: `/api/pluto/player?episode=${encodeURIComponent(ep.id)}`, title: ep.title, allow: "autoplay; fullscreen; picture-in-picture", allowFullScreen: true, className: "absolute inset-0 size-full border-0" }),
        progress && progress.progress > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 inset-x-0 h-1.5 bg-white/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary", style: {
          width: `${Math.min(100, progress.progress * 100)}%`
        } }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          ep.isLive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white", children: "LIVE" }),
          ep.premium && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full border border-primary text-primary", children: "PREMIUM" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
            show?.title,
            " · S",
            ep.season,
            " E",
            ep.number,
            " · ",
            ep.duration,
            "m"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gradient-gold", children: ep.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/channel/$handle", params: {
          handle: channel?.handle ?? "trey"
        }, className: "inline-flex items-center gap-2 hover:opacity-90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: channel?.avatar, className: "size-9 rounded-full object-cover", alt: "" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold flex items-center gap-1", children: [
              channel?.name ?? "Trey TV",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3 text-primary" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
              "@",
              channel?.handle ?? "trey",
              " · View channel"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            guide.markWatched(ep.id);
            toast.success("Marked watched");
          }, className: "px-3 py-2 rounded-xl glass border border-white/10 text-xs flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "size-3.5" }),
            " Mark watched"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            guide.toggle("saved", ep.id);
            toast(saved ? "Removed from saves" : "Saved");
          }, className: "px-3 py-2 rounded-xl glass border border-white/10 text-xs flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "size-3.5" }),
            " ",
            saved ? "Saved" : "Save"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            guide.toggle("watchLater", ep.id);
            toast(later ? "Removed from Watch Later" : "Added to Watch Later");
          }, className: "px-3 py-2 rounded-xl glass border border-white/10 text-xs flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-3.5" }),
            " ",
            later ? "Watch Later" : "Watch Later"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast("Link copied"), className: "px-3 py-2 rounded-xl glass border border-white/10 text-xs flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "size-3.5" }),
            " Share"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: show?.description })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold mb-2", children: "More episodes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: (show?.episodes ?? []).filter((item) => item.id !== ep.id).slice(0, 5).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/watch/$id", params: {
        id: item.id
      }, className: "flex gap-2 hover:bg-white/5 rounded-xl p-1 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative aspect-video w-28 rounded-lg overflow-hidden shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.thumb, className: "absolute inset-0 size-full object-cover", alt: "" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold truncate", children: item.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground truncate", children: [
            "S",
            item.season,
            " E",
            item.number,
            " · ",
            item.duration,
            "m"
          ] })
        ] })
      ] }, item.id)) })
    ] }) })
  ] }) });
}
function Rail({
  title,
  items
}) {
  if (items.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold mb-2", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.slice(0, 5).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/watch/$id", params: {
      id: s.content_id
    }, className: "flex gap-2 hover:bg-white/5 rounded-xl p-1 transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative aspect-video w-28 rounded-lg overflow-hidden shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.thumbnail_url || posts[0].media, className: "absolute inset-0 size-full object-cover", alt: "" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold truncate", children: s.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground truncate", children: [
          "@",
          s.creator_handle,
          " · S",
          s.season_number,
          " E",
          s.episode_number
        ] })
      ] })
    ] }, s.content_id)) })
  ] });
}
export {
  WatchPage as component
};
