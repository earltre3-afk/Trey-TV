import React, { useEffect, useState } from "react";
import { Sparkles, Crown } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

interface Props {
  onReveal: () => void;
}

const SignalRevealScreen: React.FC<Props> = ({ onReveal }) => {
  const [pct, setPct] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setPct((p) => {
        if (p >= 100) {
          clearInterval(id);
          setReady(true);
          return 100;
        }
        return p + 2;
      });
    }, 50);
    return () => clearInterval(id);
  }, []);

  const orbitIcons = ["◇", "☾", "♡", "✦", "⚗", "❧", "◉", "⟡"];

  return (
    <div className="signal-test-above-mobile-nav w-full bg-[#06030f] text-white relative overflow-x-hidden overflow-y-auto flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-violet-700/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-cyan-700/20 blur-[120px]" />

      <div className="relative w-full max-w-2xl">
        <div className="flex justify-center mb-3">
          <Logo className="h-16 w-16" />
        </div>
        <p className="text-center text-xs tracking-[0.3em] text-cyan-300/80 mb-4">
          — THE SIGNAL TEST —
        </p>

        <h1 className="text-center text-3xl font-bold bg-gradient-to-b from-white via-cyan-100 to-violet-200 bg-clip-text text-transparent sm:text-4xl md:text-5xl">
          Reading Your Signal…
        </h1>

        <p className="text-center text-slate-400 mt-4 leading-relaxed">
          Checking your instincts.
          <br />
          Reading your patterns.
          <br />
          Finding your <span className="text-amber-300">title.</span>
        </p>

        {/* orbiting badges */}
        <div className="relative mx-auto mt-6 w-56 h-56 sm:mt-8 sm:w-72 sm:h-72">
          <div className="absolute inset-0 rounded-full border border-violet-400/20 animate-[spin_18s_linear_infinite]" />
          <div className="absolute inset-4 rounded-full border border-cyan-400/20 animate-[spin_14s_linear_infinite_reverse]" />
          <div className="absolute inset-8 rounded-full border border-fuchsia-400/20" />
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-violet-500/20 via-fuchsia-500/10 to-transparent blur-2xl" />

          {orbitIcons.map((s, i) => {
            const angle = (i / orbitIcons.length) * Math.PI * 2;
            const r = 112;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            const colors = [
              "text-cyan-300",
              "text-fuchsia-300",
              "text-amber-300",
              "text-violet-300",
            ];
            return (
              <div
                key={i}
                className={`absolute top-1/2 left-1/2 w-8 h-8 -mt-4 -ml-4 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-base sm:w-10 sm:h-10 sm:-mt-5 sm:-ml-5 sm:text-lg ${colors[i % colors.length]} shadow-[0_0_15px_rgba(168,85,247,0.4)]`}
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                {s}
              </div>
            );
          })}

          {/* center crown */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-black border border-amber-400/40 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.5)] sm:w-24 sm:h-24">
            <Crown className="w-8 h-8 text-amber-300 sm:w-10 sm:h-10" />
          </div>
        </div>

        {/* progress */}
        <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-white/[0.03] backdrop-blur px-5 py-4">
          <div className="flex items-center justify-between text-[10px] tracking-[0.2em] text-slate-400 mb-2">
            <span>SCAN PROGRESS</span>
            <span className="text-cyan-300">{pct}%</span>
            <span>CALIBRATING SIGNAL</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-center mt-2 text-[10px] tracking-[0.2em] text-slate-500">
            — TUNING INTO YOUR FREQUENCY —
          </p>
        </div>

        {/* result found */}
        <div
          className={`mt-5 rounded-2xl p-[1.5px] transition-all duration-700 ${
            ready
              ? "bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-500 opacity-100 translate-y-0"
              : "opacity-30 translate-y-2 bg-white/10"
          }`}
        >
          <div className="rounded-2xl bg-[#0a0518]/90 backdrop-blur-xl border border-white/5 px-5 py-5 text-center">
            <p className="text-[11px] tracking-[0.3em] text-amber-300">— NATURAL ABILITY —</p>
            <p className="text-4xl font-bold bg-gradient-to-b from-amber-200 to-amber-400 bg-clip-text text-transparent mt-1">
              FOUND
            </p>
            <button
              onClick={onReveal}
              disabled={!ready}
              className={`group relative w-full mt-4 rounded-full py-3.5 px-5 font-bold tracking-wider overflow-hidden transition ${
                ready ? "active:scale-[0.98]" : "opacity-40 cursor-not-allowed"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />
              {ready && (
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 blur-md opacity-70" />
              )}
              <span className="relative flex items-center justify-center gap-3 text-white">
                <Sparkles className="w-5 h-5" />
                REVEAL MY ABILITY
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalRevealScreen;
