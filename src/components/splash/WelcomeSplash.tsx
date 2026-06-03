import { useEffect, useState } from "react";

const STORAGE_KEY = "treytv_splash_v1";

const RAY_STYLES: React.CSSProperties[] = [
  { transform: "rotate(-40deg)" },
  { transform: "rotate(-25deg)", width: "1px", opacity: 0.6 },
  { transform: "rotate(-12deg)" },
  {
    transform: "rotate(0deg)",
    width: "3px",
    background: "linear-gradient(to bottom, rgba(255,210,60,0.22), transparent 50%)",
  },
  { transform: "rotate(12deg)" },
  { transform: "rotate(25deg)", width: "1px", opacity: 0.6 },
  { transform: "rotate(40deg)" },
];

interface Props {
  onDone: () => void;
}

export function WelcomeSplash({ onDone }: Props) {
  const [show, setShow] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen) {
      setShow(false);
      onDone();
    } else {
      setAnimate(true);
    }
  }, []);

  function handleNext() {
    setDismissing(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "1");
      setShow(false);
      onDone();
    }, 700);
  }

  if (!show) return null;

  return (
    <>
      <style>{CSS}</style>
      <div
        className={`spl-root${animate ? " spl-animate" : ""}${dismissing ? " spl-out" : ""}`}
        role="dialog"
        aria-label="Welcome to Trey TV"
      >
        <div className="spl-scan" aria-hidden="true" />
        <div className="spl-bg" aria-hidden="true" />

        <div className="spl-rays" aria-hidden="true">
          {RAY_STYLES.map((style, i) => (
            <div key={i} className="spl-ray" style={style} />
          ))}
        </div>

        <div className="spl-stage">
          <div className="spl-welcome-wrap">
            <div className="spl-welcome-text">Welcome to</div>
          </div>

          <div className="spl-divider">
            <div className="spl-div-line" />
            <div className="spl-div-diamond" />
            <div className="spl-div-line spl-right" />
          </div>

          <div className="spl-logo-row">
            <span className="spl-logo-trey">Trey</span>
            <span className="spl-logo-tv">
              TV
              <span className="spl-sparkles" aria-hidden="true">
                <span className="spl-sp spl-sp1" />
                <span className="spl-sp spl-sp2" />
                <span className="spl-sp spl-sp3" />
                <span className="spl-sp spl-sp4" />
              </span>
            </span>
          </div>

          <div className="spl-tagline-wrap">
            <div className="spl-tagline">Your world. Your channel.</div>
          </div>

          <div className="spl-gold-bar-wrap">
            <div className="spl-gold-bar" />
            <div className="spl-bar-dot" aria-hidden="true" />
          </div>
        </div>

        <button className="spl-next" onClick={handleNext}>
          Next →
        </button>
      </div>
    </>
  );
}

const CSS = `
/* ── Root overlay ───────────────────────────────────────────── */
.spl-root {
  position: fixed; inset: 0; z-index: 10100;
  background: #060606;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  font-family: 'Cinzel', serif;
  transition: opacity 0.7s ease;
}
.spl-out { opacity: 0 !important; pointer-events: none; }

/* ── Scan lines (always visible) ──────────────────────────── */
.spl-scan {
  position: absolute; inset: 0; z-index: 100; pointer-events: none;
  background: repeating-linear-gradient(
    0deg, transparent, transparent 3px,
    rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px
  );
}

/* ── Background glow (always animates) ──────────────────── */
.spl-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 50%, rgba(160,110,10,0.12) 0%, transparent 65%),
    radial-gradient(ellipse 40% 30% at 30% 70%, rgba(80,80,100,0.08) 0%, transparent 60%),
    #060606;
  animation: splBgBreath 4s ease-in-out infinite;
}
@keyframes splBgBreath { 0%,100%{opacity:.7} 50%{opacity:1} }

/* ── Rays ───────────────────────────────────────────────── */
.spl-rays {
  position: absolute; inset: 0; pointer-events: none;
  display: flex; justify-content: center;
  opacity: 0;
}
.spl-ray {
  position: absolute; top: 0; left: 50%;
  width: 2px; height: 100vh;
  transform-origin: top center;
  background: linear-gradient(to bottom, rgba(220,170,30,0.18), transparent 60%);
}

/* ── Stage ──────────────────────────────────────────────── */
.spl-stage {
  position: relative; z-index: 10;
  display: flex; flex-direction: column; align-items: center;
}

/* ── Content — invisible until .spl-animate fires them ── */
.spl-welcome-wrap { overflow: hidden; margin-bottom: 8px; opacity: 0; }
.spl-welcome-text {
  font-family: 'Cinzel', serif;
  font-size: clamp(13px,2.2vw,18px); font-weight: 600;
  letter-spacing: 10px; text-transform: uppercase;
  color: rgba(210,180,80,0.85); text-align: center;
}

.spl-divider { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; opacity: 0; }
.spl-div-line {
  height: 1px; width: clamp(40px,8vw,80px);
  background: linear-gradient(to right, transparent, rgba(200,150,30,0.7));
}
.spl-div-line.spl-right { background: linear-gradient(to left, transparent, rgba(200,150,30,0.7)); }
.spl-div-diamond {
  width: 6px; height: 6px; background: #f0c040;
  transform: rotate(45deg); box-shadow: 0 0 8px rgba(240,192,64,0.8);
}

.spl-logo-row { display: flex; align-items: center; position: relative; opacity: 0; }
.spl-logo-trey {
  font-family: 'Cinzel Decorative', cursive;
  font-size: clamp(58px,10vw,96px); font-weight: 700; letter-spacing: -2px;
  background: linear-gradient(150deg,#d0d0d0 0%,#ffffff 18%,#a8a8a8 35%,#f5f5f5 50%,#888 65%,#e0e0e0 80%,#ffffff 100%);
  background-size: 250% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 0 20px rgba(200,200,200,0.2));
}
.spl-logo-tv {
  font-family: 'Cinzel Decorative', cursive;
  font-size: clamp(58px,10vw,96px); font-weight: 700;
  background: linear-gradient(150deg,#b8720a 0%,#fce060 22%,#e0980a 42%,#fff0a0 58%,#c07808 75%,#f5d040 100%);
  background-size: 250% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 0 24px rgba(220,170,30,0.55));
  position: relative;
}

.spl-sparkles {
  position: absolute; top: -14px; right: -22px;
  width: 38px; height: 38px; opacity: 0;
}
.spl-sp {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%); background: #fce45a; border-radius: 1px;
}
.spl-sp1 { width: 2px;   height: 32px; }
.spl-sp2 { width: 32px;  height: 2px; }
.spl-sp3 { width: 1.5px; height: 22px; transform: translate(-50%,-50%) rotate(45deg); background: rgba(252,228,90,0.7); }
.spl-sp4 { width: 22px;  height: 1.5px;transform: translate(-50%,-50%) rotate(45deg); background: rgba(252,228,90,0.7); }

.spl-tagline-wrap { margin-top: 22px; overflow: hidden; opacity: 0; }
.spl-tagline {
  font-family: 'Cinzel', serif;
  font-size: clamp(10px,1.6vw,13px); letter-spacing: 7px; text-transform: uppercase;
  color: rgba(200,170,70,0.6); text-align: center;
}

.spl-gold-bar-wrap {
  margin-top: 36px; width: clamp(200px,35vw,340px); height: 2px;
  background: rgba(255,255,255,0.06); border-radius: 2px; overflow: visible; position: relative;
  opacity: 0;
}
.spl-gold-bar {
  height: 100%; width: 0; border-radius: 2px;
  background: linear-gradient(90deg,#8a5500,#f5d060,#fffacc,#f0c040,#8a5500); background-size: 300% auto;
  box-shadow: 0 0 10px rgba(240,192,64,0.5), 0 0 30px rgba(240,192,64,0.2);
}
.spl-bar-dot {
  position: absolute; right: 0; top: 50%;
  width: 8px; height: 8px; transform: translate(50%,-50%);
  background: #fce060; border-radius: 50%;
  box-shadow: 0 0 12px 4px rgba(252,224,96,0.7);
  opacity: 0;
}

.spl-next {
  position: fixed; bottom: 28px; right: 28px;
  background: rgba(240,192,64,0.12); border: 1px solid rgba(240,192,64,0.35);
  color: rgba(240,192,64,0.8);
  font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
  padding: 10px 20px; cursor: pointer; border-radius: 2px; transition: all 0.3s;
  opacity: 0;
}
.spl-next:hover { background: rgba(240,192,64,0.22); color: #fce060; box-shadow: 0 0 20px rgba(240,192,64,0.2); }


/* ── Animations — only fire after .spl-animate is added ── */

.spl-root.spl-animate .spl-rays {
  animation: splRaysReveal 1.5s ease 2.2s forwards;
}
@keyframes splRaysReveal { to { opacity: 1; } }

.spl-root.spl-animate .spl-welcome-wrap {
  animation: splFadeSlideDown 0.9s cubic-bezier(0.16,1,0.3,1) 0.4s forwards;
}
@keyframes splFadeSlideDown { from{opacity:0;transform:translateY(-30px)} to{opacity:1;transform:translateY(0)} }

.spl-root.spl-animate .spl-divider {
  animation: splFadeIn 0.8s ease 1s forwards;
}

.spl-root.spl-animate .spl-logo-row {
  animation: splLogoBurst 1.1s cubic-bezier(0.16,1,0.3,1) 1.1s forwards;
}
@keyframes splLogoBurst {
  0%   { opacity:0; transform:scale(0.6); filter:blur(12px); }
  60%  { filter:blur(0); }
  100% { opacity:1; transform:scale(1); filter:blur(0); }
}

.spl-root.spl-animate .spl-logo-trey {
  animation: splSilverFlow 3s linear 2.2s infinite;
}
.spl-root.spl-animate .spl-logo-tv {
  animation: splGoldFlow 2.5s linear 2.2s infinite;
}
@keyframes splSilverFlow { 0%{background-position:0% center} 100%{background-position:250% center} }
@keyframes splGoldFlow   { 0%{background-position:0% center} 100%{background-position:250% center} }

.spl-root.spl-animate .spl-sparkles {
  animation: splFadeIn 0.5s ease 2.2s forwards;
}
.spl-root.spl-animate .spl-sp1 { animation: splSpPulse 2s ease-in-out 2.2s infinite; }
.spl-root.spl-animate .spl-sp2 { animation: splSpPulse 2s ease-in-out 2.2s infinite; }
.spl-root.spl-animate .spl-sp3 { animation: splSpPulse 2s ease-in-out 2.4s infinite; }
.spl-root.spl-animate .spl-sp4 { animation: splSpPulse 2s ease-in-out 2.4s infinite; }
@keyframes splSpPulse {
  0%,100% { opacity:.5; transform:translate(-50%,-50%) scaleY(0.7); }
  50%     { opacity:1;  transform:translate(-50%,-50%) scaleY(1); }
}

.spl-root.spl-animate .spl-tagline-wrap {
  animation: splFadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 2s forwards;
}
@keyframes splFadeSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

.spl-root.spl-animate .spl-gold-bar-wrap {
  animation: splFadeIn 0.5s ease 2.4s forwards;
}
.spl-root.spl-animate .spl-gold-bar {
  animation: splBarGrow 1.2s cubic-bezier(0.4,0,0.2,1) 2.5s forwards,
             splBarShimmer 2s linear 3.7s infinite;
}
@keyframes splBarGrow    { from{width:0} to{width:100%} }
@keyframes splBarShimmer { 0%{background-position:0% center} 100%{background-position:300% center} }

.spl-root.spl-animate .spl-bar-dot {
  animation: splFadeIn 0.3s ease 3.6s forwards;
}

.spl-root.spl-animate .spl-next {
  animation: splFadeIn 1s ease 4s forwards;
}

@keyframes splFadeIn { to { opacity: 1; } }
`;
