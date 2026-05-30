import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import TreyTVLogo from './TreyTVLogo';

interface Props {
  onStart: () => void;
}

const SignalTestIntro: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="signal-test-above-mobile-nav w-full bg-[#06030f] text-white relative overflow-x-hidden overflow-y-auto flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="pointer-events-none absolute -top-32 left-1/4 w-[480px] h-[480px] rounded-full bg-violet-700/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 w-[480px] h-[480px] rounded-full bg-cyan-700/20 blur-[120px]" />

      <div className="relative w-full max-w-2xl">
        <div className="flex justify-center mb-6">
          <TreyTVLogo size="md" />
        </div>

        {/* scanning ring */}
        <div className="relative h-36 sm:h-44 flex items-center justify-center mb-2">
          <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-violet-400/30 animate-[spin_8s_linear_infinite]" />
          <div className="absolute w-[7.5rem] h-[7.5rem] sm:w-36 sm:h-36 rounded-full border border-cyan-400/30 animate-[spin_6s_linear_infinite_reverse]" />
          <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-amber-400/30" />
          <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 blur-2xl" />
          <svg viewBox="0 0 100 30" className="relative w-32 h-12 text-cyan-300">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              points="0,15 8,15 12,5 16,25 20,8 25,22 30,15 40,15 44,7 48,23 52,15 60,15 64,4 68,26 72,15 80,15 84,10 88,20 92,15 100,15"
              className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            />
          </svg>
          <p className="absolute bottom-2 text-[10px] tracking-[0.3em] text-cyan-300/80">SCANNING YOUR SIGNAL</p>
        </div>

        <div className="relative rounded-[28px] p-[1.5px] bg-gradient-to-b from-violet-500/60 via-fuchsia-500/30 to-cyan-500/40">
          <div className="rounded-[26px] bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl px-5 py-6 border border-white/5 sm:px-7 sm:py-9">
            <h1 className="text-center text-3xl font-bold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent sm:text-4xl">
              The Signal Test
            </h1>
            <div className="my-4 flex items-center justify-center gap-2 text-fuchsia-400">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-fuchsia-400/60" />
              <span className="text-xs">◆</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-fuchsia-400/60" />
            </div>

            <div className="text-slate-300 space-y-3 text-center leading-relaxed sm:space-y-4">
              <p className="text-base sm:text-lg">Life is about to throw you scenes.</p>
              <div className="space-y-1 text-sm sm:text-base">
                <p>Some are funny.</p>
                <p>Some are messy.</p>
                <p>Some are dramatic.</p>
                <p>Some are scary.</p>
                <p>Some are too real.</p>
              </div>
              <p className="text-white font-medium pt-2">Choose what you would actually do.</p>
              <div className="space-y-1 text-sm text-slate-400">
                <p>No perfect answers.</p>
                <p>No wrong answers.</p>
                <p>No fake deep stuff.</p>
              </div>
              <p className="pt-2">
                Your reactions reveal your{' '}
                <span className="bg-gradient-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-transparent font-semibold">
                  Natural Ability.
                </span>
              </p>
            </div>

            <button
              onClick={onStart}
              className="group relative w-full mt-6 rounded-2xl py-4 px-5 font-semibold text-white overflow-hidden active:scale-[0.98] transition sm:mt-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 blur-md opacity-70 group-hover:opacity-100 transition" />
              <span className="relative flex items-center justify-center gap-3">
                <Sparkles className="w-5 h-5" />
                Start My Signal Test
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalTestIntro;
