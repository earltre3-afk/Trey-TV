import React, { useEffect, useState } from "react";
import { ArrowRight, Activity } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

interface Props {
  onContinue: () => void;
}

const SignalPulseCheckpoint: React.FC<Props> = ({ onContinue }) => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const target = 63;
    let n = 0;
    const id = setInterval(() => {
      n += 2;
      setPct(Math.min(target, n));
      if (n >= target) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="signal-test-above-mobile-nav w-full bg-[#06030f] text-white relative overflow-x-hidden overflow-y-auto flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-cyan-700/20 blur-[120px]" />

      <div className="relative w-full max-w-2xl">
        <div className="flex justify-center mb-4">
          <Logo className="h-16 w-16" />
        </div>

        <h1 className="text-center text-3xl font-bold bg-gradient-to-r from-amber-200 via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent mb-4 sm:text-4xl sm:mb-6 md:text-5xl">
          Signal Forming…
        </h1>

        <div className="relative rounded-[28px] p-[1.5px] bg-gradient-to-b from-amber-400/40 via-fuchsia-500/30 to-cyan-500/40">
          <div className="rounded-[26px] bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/5 px-5 py-6 sm:px-7 sm:py-10">
            <div className="relative mx-auto w-44 h-44 flex items-center justify-center sm:w-56 sm:h-56">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="3"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#g1)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * 283} 283`}
                  className="drop-shadow-[0_0_8px_rgba(217,70,239,0.7)] transition-all duration-100"
                />
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="50%" stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-b from-white to-slate-200 bg-clip-text text-transparent sm:text-5xl">
                  {pct}%
                </div>
                <div className="text-[11px] tracking-[0.3em] text-slate-400 mt-1">
                  SIGNAL STRENGTH
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 my-4 sm:my-6">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-fuchsia-400/60" />
              <div className="w-9 h-9 rounded-full border border-fuchsia-400/40 flex items-center justify-center">
                <Activity className="w-4 h-4 text-fuchsia-300" />
              </div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-fuchsia-400/60" />
            </div>

            <p className="text-center text-slate-300 leading-relaxed">
              Your choices are starting to show a pattern. So far, your strongest reactions are
              coming from how you handle{" "}
              <span className="text-amber-300 font-semibold">pressure</span>,{" "}
              <span className="text-fuchsia-300 font-semibold">people</span>,{" "}
              <span className="text-violet-300 font-semibold">emotion</span>, and{" "}
              <span className="text-cyan-300 font-semibold">change</span>.
            </p>

            <p className="text-center mt-4">
              <span className="text-amber-300 font-bold">Keep going.</span>
              <br />
              <span className="text-slate-300">Your title is not locked yet.</span>
            </p>

            <button
              onClick={onContinue}
              className="group relative w-full mt-6 rounded-full py-4 px-5 font-bold text-white overflow-hidden active:scale-[0.98] transition sm:mt-7"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-500 blur-md opacity-70 group-hover:opacity-100 transition" />
              <span className="relative flex items-center justify-center gap-3">
                Continue
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalPulseCheckpoint;
