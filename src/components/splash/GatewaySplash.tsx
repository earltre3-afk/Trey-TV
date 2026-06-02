import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

const GATEWAY_KEY = "treytv_gateway_v1";

interface Props {
  active: boolean;
  onDone: () => void;
}

export function GatewaySplash({ active, onDone }: Props) {
  const { isGuest } = useAuth();
  const nav = useNavigate();
  const [show, setShow] = useState(true);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    if (!isGuest) {
      setShow(false);
      onDone();
      return;
    }
    if (sessionStorage.getItem(GATEWAY_KEY)) {
      setShow(false);
      onDone();
    }
  }, [isGuest]);

  function dismiss(cb?: () => void) {
    sessionStorage.setItem(GATEWAY_KEY, "1");
    setDismissing(true);
    setTimeout(() => {
      setShow(false);
      cb?.();
      onDone();
    }, 600);
  }

  if (!show) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className={`gtw-root${active ? " gtw-active" : ""}${dismissing ? " gtw-out" : ""}`}>
        <div className="gtw-bg" />
        <div className="gtw-scan" aria-hidden="true" />
        <div className="gtw-flare" aria-hidden="true" />
        <div className="gtw-bottom-glow" aria-hidden="true" />

        <div className="gtw-screen">
          {/* Logo */}
          <div className="gtw-logo-wrap">
            <svg className="gtw-frame-svg" viewBox="0 0 460 220" aria-hidden="true">
              <defs>
                <linearGradient id="gtwFg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c8860a" stopOpacity={0.9} />
                  <stop offset="35%" stopColor="#fce97a" stopOpacity={1} />
                  <stop offset="65%" stopColor="#c8780a" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#f0c040" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <rect
                className="gtw-frame-path"
                x="20"
                y="16"
                width="420"
                height="188"
                rx="18"
                ry="18"
                transform="skewX(-6)"
              />
            </svg>

            <div className="gtw-logo-row">
              <span className="gtw-trey">Trey</span>
              <span className="gtw-tv">
                TV
                <span className="gtw-sparkle-wrap" aria-hidden="true">
                  <span className="gtw-sp-r1" />
                  <span className="gtw-sp-r2" />
                </span>
              </span>
            </div>

            <div className="gtw-tagline">Premium Entertainment</div>
          </div>

          <div className="gtw-divider" />

          <div className="gtw-cta-group">
            <button className="gtw-btn-watch" onClick={() => dismiss()}>
              <span className="gtw-play-icon" aria-hidden="true" />
              Watch Now
            </button>
            <button className="gtw-btn-signin" onClick={() => dismiss(() => nav({ to: "/login" }))}>
              Sign In &nbsp;/&nbsp; Create Account
            </button>
          </div>
        </div>

        <div className="gtw-bottom-strap">
          {["About", "Privacy", "Terms", "Help"].map((label) => (
            <button key={label} className="gtw-strap-link" onClick={() => dismiss()}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

const CSS = `
/* ── Root overlay ─────────────────────────────────────────── */
.gtw-root {
  position: fixed; inset: 0; z-index: 10050;
  background: #000;
  overflow: hidden;
  transition: opacity 0.6s ease;
}
.gtw-out { opacity: 0 !important; pointer-events: none; }

/* ── Background ──────────────────────────────────────────── */
.gtw-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 70% 50% at 50% 40%, rgba(30,20,5,1) 0%, #000 100%);
}
.gtw-scan {
  position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px
  );
}

/* ── Flares (always animate) ──────────────────────────────── */
.gtw-flare {
  position: absolute; top: -120px; left: 50%; transform: translateX(-50%);
  width: 700px; height: 300px; pointer-events: none;
  background: radial-gradient(ellipse at center, rgba(220,160,20,0.18) 0%, transparent 70%);
  animation: gtwFlarePulse 4s ease-in-out infinite;
}
.gtw-bottom-glow {
  position: absolute; bottom: -100px; left: 50%; transform: translateX(-50%);
  width: 600px; height: 200px; pointer-events: none;
  background: radial-gradient(ellipse at center, rgba(180,130,20,0.12) 0%, transparent 70%);
  animation: gtwFlarePulse 5s ease-in-out 1s infinite;
}
@keyframes gtwFlarePulse {
  0%,100% { opacity:.6; transform:translateX(-50%) scaleX(1); }
  50%     { opacity:1;  transform:translateX(-50%) scaleX(1.1); }
}

/* ── Screen layout ──────────────────────────────────────── */
.gtw-screen {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}

/* ── Logo block ─────────────────────────────────────────── */
.gtw-logo-wrap {
  position: relative;
  display: flex; flex-direction: column; align-items: center;
  opacity: 0;
}
.gtw-root.gtw-active .gtw-logo-wrap {
  animation: gtwLogoIn 1.4s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes gtwLogoIn {
  0%   { opacity:0; transform:translateY(-30px) scale(0.92); }
  100% { opacity:1; transform:translateY(0) scale(1); }
}

/* Frame SVG */
.gtw-frame-svg {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 460px; height: 220px; pointer-events: none;
}
.gtw-frame-path {
  fill: none; stroke: url(#gtwFg); stroke-width: 1.2;
  stroke-dasharray: 1300; stroke-dashoffset: 1300;
}
.gtw-root.gtw-active .gtw-frame-path {
  animation: gtwDrawFrame 1.8s ease-out 0.4s forwards;
}
@keyframes gtwDrawFrame { to { stroke-dashoffset: 0; } }

/* Logo text */
.gtw-logo-row {
  display: flex; align-items: baseline; gap: 4px;
  position: relative; z-index: 2;
}
.gtw-trey {
  font-family: 'Cinzel Decorative', cursive;
  font-size: clamp(64px,9vw,96px); font-weight: 700;
  background: linear-gradient(160deg,#e0e0e0 0%,#fff 18%,#aaa 38%,#fff 54%,#909090 72%,#d0d0d0 88%,#fff 100%);
  background-size: 220% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 2px 10px rgba(200,200,200,0.25));
}
.gtw-tv {
  font-family: 'Cinzel Decorative', cursive;
  font-size: clamp(64px,9vw,96px); font-weight: 700;
  background: linear-gradient(160deg,#c8820a 0%,#fce97a 22%,#e8a820 42%,#fff5a0 60%,#c8780a 78%,#f0c040 100%);
  background-size: 220% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 2px 14px rgba(220,160,20,0.45));
  position: relative;
}
.gtw-root.gtw-active .gtw-trey { animation: gtwSilverFlow 4s linear 1.8s infinite; }
.gtw-root.gtw-active .gtw-tv   { animation: gtwGoldFlow   3s linear 2s   infinite; }
@keyframes gtwSilverFlow { 0%{background-position:0% center} 100%{background-position:220% center} }
@keyframes gtwGoldFlow   { 0%{background-position:0% center} 100%{background-position:220% center} }

/* Sparkle */
.gtw-sparkle-wrap {
  position: absolute; top: -4px; right: -24px;
  width: 30px; height: 30px;
}
.gtw-sparkle-wrap::before {
  content: ''; position: absolute; top: 50%; left: 50%;
  width: 2px; height: 30px;
  background: linear-gradient(to bottom, transparent, #fde86e, transparent);
  transform: translate(-50%,-50%);
}
.gtw-sparkle-wrap::after {
  content: ''; position: absolute; top: 50%; left: 50%;
  width: 30px; height: 2px;
  background: linear-gradient(to right, transparent, #fde86e, transparent);
  transform: translate(-50%,-50%);
}
.gtw-sp-r1 {
  position: absolute; top: 50%; left: 50%;
  width: 1.5px; height: 22px;
  transform: translate(-50%,-50%) rotate(45deg);
  background: linear-gradient(to bottom, transparent, #fde86e, transparent);
}
.gtw-sp-r2 {
  position: absolute; top: 50%; left: 50%;
  width: 22px; height: 1.5px;
  transform: translate(-50%,-50%) rotate(45deg);
  background: linear-gradient(to right, transparent, #fde86e, transparent);
}
.gtw-root.gtw-active .gtw-sparkle-wrap {
  animation: gtwSparkle 2s ease-in-out 2.4s infinite;
}
@keyframes gtwSparkle {
  0%,100% { opacity:0; transform:scale(0.4) rotate(0deg); }
  40%,60% { opacity:1; transform:scale(1)   rotate(20deg); }
}

/* Tagline */
.gtw-tagline {
  font-family: 'Raleway', sans-serif;
  font-size: clamp(11px,1.6vw,14px); font-weight: 300;
  letter-spacing: 6px; text-transform: uppercase;
  color: rgba(200,165,80,0.65); margin-top: 14px; opacity: 0;
}
.gtw-root.gtw-active .gtw-tagline { animation: gtwFadeUpIn 1s ease 1.6s both; }

/* Divider */
.gtw-divider {
  width: 1px; height: 60px;
  background: linear-gradient(to bottom, transparent, rgba(180,140,50,0.5), transparent);
  margin: 36px 0 32px; opacity: 0;
}
.gtw-root.gtw-active .gtw-divider { animation: gtwFadeUpIn 1s ease 1.9s both; }

/* CTA group */
.gtw-cta-group {
  display: flex; flex-direction: column; align-items: center; gap: 18px; opacity: 0;
}
.gtw-root.gtw-active .gtw-cta-group { animation: gtwFadeUpIn 1s ease 2.1s both; }

/* Watch Now */
.gtw-btn-watch {
  position: relative;
  display: flex; align-items: center; justify-content: center; gap: 14px;
  padding: 0 44px; height: 62px; min-width: 260px;
  border: none; border-radius: 4px; cursor: pointer;
  font-family: 'Cinzel', serif; font-size: 15px; font-weight: 700;
  letter-spacing: 3px; text-transform: uppercase; color: #0a0a0a;
  background: linear-gradient(135deg,#c8820a 0%,#fce97a 35%,#e8a820 60%,#f5c440 100%);
  background-size: 200% auto; overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 30px rgba(220,160,20,0.4), 0 0 60px rgba(220,160,20,0.15);
}
.gtw-btn-watch::before {
  content: '';
  position: absolute; top: 0; bottom: 0; left: -100%; width: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
}
.gtw-root.gtw-active .gtw-btn-watch::before {
  animation: gtwShineBtn 3s ease 3s infinite;
}
@keyframes gtwShineBtn {
  0%      { left: -100%; }
  40%,100%{ left: 150%; }
}
.gtw-btn-watch:hover {
  transform: scale(1.03);
  box-shadow: 0 6px 40px rgba(220,160,20,0.6), 0 0 80px rgba(220,160,20,0.25);
}
.gtw-btn-watch:active { transform: scale(0.98); }

.gtw-play-icon {
  display: inline-block; flex-shrink: 0;
  width: 0; height: 0;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 13px solid rgba(0,0,0,0.7);
}

/* Sign In */
.gtw-btn-signin {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 14px 44px; min-width: 260px;
  border: 1px solid rgba(200,165,80,0.35); border-radius: 4px; cursor: pointer;
  font-family: 'Cinzel', serif; font-size: 13px; font-weight: 600;
  letter-spacing: 3px; text-transform: uppercase;
  color: rgba(220,185,90,0.85); background: rgba(255,255,255,0.03);
  transition: all 0.25s ease; backdrop-filter: blur(4px);
}
.gtw-btn-signin:hover {
  background: rgba(220,160,20,0.08); border-color: rgba(200,165,80,0.7);
  color: #fce97a; box-shadow: 0 0 20px rgba(220,160,20,0.15);
}
.gtw-btn-signin:active { transform: scale(0.98); }

/* Bottom strap */
.gtw-bottom-strap {
  position: absolute; bottom: 36px; left: 0; right: 0;
  display: flex; justify-content: center; gap: 40px; opacity: 0;
}
.gtw-root.gtw-active .gtw-bottom-strap { animation: gtwFadeUpIn 1s ease 2.6s both; }
.gtw-strap-link {
  font-family: 'Raleway', sans-serif;
  font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
  color: rgba(140,120,70,0.5);
  background: none; border: none; cursor: pointer; transition: color 0.2s ease;
}
.gtw-strap-link:hover { color: rgba(220,180,80,0.8); }

@keyframes gtwFadeUpIn {
  from { opacity:0; transform:translateY(10px); }
  to   { opacity:1; transform:translateY(0); }
}
`;
