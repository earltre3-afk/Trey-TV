import { useEffect, useRef, useState } from "react";

interface Props {
  onPlay: () => void;
}

const CIRCUMFERENCE = 2 * Math.PI * 65; // ≈ 408.4
const SEG_COUNT = 10;
const STALL_ZONES: [number, number][] = [
  [28, 32],
  [58, 63],
  [88, 92],
];

const STATUS_MESSAGES: [number, string][] = [
  [0, "Connecting to TreyTV…"],
  [10, "Authenticating stream…"],
  [22, "Loading channel data…"],
  [35, "Fetching video source…"],
  [48, "Buffering content…"],
  [60, "Optimizing quality…"],
  [72, "Almost there…"],
  [85, "Finalizing stream…"],
  [94, "Launching player…"],
  [99, "Starting now…"],
];

const MILESTONES: Record<number, string> = {
  25: "25% Loaded",
  50: "Halfway There",
  75: "75% Buffered",
  100: "Stream Ready",
};

function nextPct(cur: number): number {
  for (const [lo, hi] of STALL_ZONES) {
    if (cur >= lo && cur < hi) return cur + (Math.random() < 0.3 ? 1 : 0);
  }
  return Math.min(cur + 1 + Math.floor(Math.random() * 2), 100);
}

type Star = { id: number; left: string; top: string; size: number; dur: string; delay: string };

export function BufferingScreen({ onPlay }: Props) {
  const [stars, setStars] = useState<Star[]>([]);
  const [pct, setPct] = useState(0);
  const [statusMsg, setStatusMsg] = useState(STATUS_MESSAGES[0][1]);
  const [flash, setFlash] = useState<{ key: number; text: string } | null>(null);
  const [complete, setComplete] = useState(false);
  const pctRef = useRef(0);
  const triggered = useRef(new Set<number>());

  useEffect(() => {
    setStars(
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 0.4 + Math.random() * 1.4,
        dur: `${2 + Math.random() * 4}s`,
        delay: `${Math.random() * 5}s`,
      })),
    );
  }, []);

  useEffect(() => {
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

      for (const key of [25, 50, 75, 100] as const) {
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

  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  return (
    <>
      <style>{CSS}</style>
      <div className="buf-root">
        <div className="buf-noise" />
        <div className="buf-scan" />
        <div className="buf-glow" />

        <div className="buf-stars" aria-hidden="true">
          {stars.map((s) => (
            <div
              key={s.id}
              className="buf-star"
              style={{
                left: s.left,
                top: s.top,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animationDuration: s.dur,
                animationDelay: s.delay,
              }}
            />
          ))}
        </div>

        <div className="buf-container">
          <div className="buf-logo-wrap">
            <span className="buf-logo-trey">Trey</span>
            <span className="buf-logo-tv">
              TV
              <span className="buf-spark">
                <span className="buf-sp buf-sp1" />
                <span className="buf-sp buf-sp2" />
                <span className="buf-sp buf-sp3" />
                <span className="buf-sp buf-sp4" />
              </span>
            </span>
          </div>

          <div className="buf-ring-wrap">
            <div className="buf-ring-outer" />
            <div className="buf-ring-arc" />
            <div className="buf-ring-mask" />
            <svg className="buf-ring-svg" viewBox="0 0 160 160" aria-hidden="true">
              <defs>
                <linearGradient id="bufRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c8860a" />
                  <stop offset="40%" stopColor="#fce060" />
                  <stop offset="70%" stopColor="#fff4a0" />
                  <stop offset="100%" stopColor="#f0c040" />
                </linearGradient>
                <filter id="bufRingGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle className="buf-ring-track" cx="80" cy="80" r="65" />
              <circle
                className="buf-ring-fill"
                cx="80"
                cy="80"
                r="65"
                style={{ strokeDashoffset: offset }}
              />
            </svg>
            <div className="buf-ring-inner">
              <span className="buf-pct-num">{pct}</span>
              <span className="buf-pct-sym">%</span>
            </div>
          </div>

          <div className="buf-status-wrap">
            <div className="buf-status-label">{statusMsg}</div>
            <div className="buf-bar-track">
              <div className="buf-bar-fill" style={{ width: `${pct}%` }}>
                <div className="buf-bar-head" />
              </div>
            </div>
            <div className="buf-ticks">
              {[0, 25, 50, 75, 100].map((v) => (
                <span key={v} className={`buf-tick${pct >= v ? " lit" : ""}`}>
                  {v}
                </span>
              ))}
            </div>
            <div className="buf-segs">
              {Array.from({ length: SEG_COUNT }, (_, i) => {
                const threshold = (i + 1) * 10;
                const cls = pct >= threshold ? "done" : pct >= threshold - 10 ? "active" : "";
                return <div key={i} className={`buf-seg${cls ? ` ${cls}` : ""}`} />;
              })}
            </div>
          </div>
        </div>

        {flash && (
          <>
            <div key={`f-${flash.key}`} className="buf-flash pop" />
            <div key={`b-${flash.key}`} className="buf-badge show">
              ✦ {flash.text} ✦
            </div>
          </>
        )}

        <div className={`buf-complete${complete ? " show" : ""}`}>
          <div className="buf-co-logo">
            <span className="buf-co-trey">Trey</span>
            <span className="buf-co-tv">
              TV
              <span className="buf-co-spark">
                <span className="buf-co-sp buf-co-sp1" />
                <span className="buf-co-sp buf-co-sp2" />
                <span className="buf-co-sp buf-co-sp3" />
                <span className="buf-co-sp buf-co-sp4" />
              </span>
            </span>
          </div>
          <div className="buf-co-divider">
            <div className="buf-co-dline l" />
            <div className="buf-co-dgem" />
            <div className="buf-co-dline r" />
          </div>
          <div className="buf-co-title">Thank You For Waiting</div>
          <div className="buf-co-exclusive">Here's Your Trizzy Exclusive Clip</div>
          <div className="buf-co-enjoy">Enjoy!</div>
          <button className="buf-play-btn" onClick={onPlay} aria-label="Play video">
            ▶
          </button>
          <button className="buf-replay-btn" onClick={() => window.location.reload()}>
            ↺ Watch Again
          </button>
        </div>
      </div>
    </>
  );
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
