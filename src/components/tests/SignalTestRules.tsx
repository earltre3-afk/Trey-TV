import React from 'react';
import { ArrowRight, Info, Keyboard, List, Lock } from 'lucide-react';
import TreyTVLogo from './TreyTVLogo';

interface Props {
  onContinue: () => void;
}

const SignalTestRules: React.FC<Props> = ({ onContinue }) => {
  const rules = [
    {
      n: 1,
      icon: List,
      title: 'THREE',
      sub: 'ANSWER CHOICES',
      body: 'Each question includes three possible answers.',
      tint: 'text-cyan-300',
    },
    {
      n: 2,
      icon: Keyboard,
      title: 'ONE',
      sub: 'CUSTOM RESPONSE BOX',
      body: 'Type your own move if none of the answers fit.',
      tint: 'text-cyan-300',
    },
    {
      n: 3,
      icon: Lock,
      title: 'ONE',
      sub: 'LOCKED CHOICE PER SCENE',
      body: 'Once you lock it in, you cannot change your answer.',
      tint: 'text-violet-300',
    },
  ];

  return (
    <div className="signal-test-above-mobile-nav w-full bg-[#06030f] text-white relative overflow-x-hidden overflow-y-auto flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="pointer-events-none absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-cyan-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full bg-violet-700/25 blur-[120px]" />

      <div className="relative w-full max-w-3xl">
        <div className="flex justify-center mb-4">
          <TreyTVLogo size="md" />
        </div>
        <p className="text-center text-xs tracking-[0.3em] text-cyan-300/80">— THE SIGNAL TEST —</p>

        <h1 className="text-center mt-4 mb-5 text-3xl font-extrabold tracking-tight bg-gradient-to-b from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(165,243,252,0.25)] sm:mt-6 sm:mb-8 sm:text-4xl md:text-5xl">
          HOW IT WORKS
        </h1>

        <div className="space-y-3 sm:space-y-4">
          {rules.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.n} className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-cyan-400/40 via-violet-500/20 to-fuchsia-500/30">
                <div className="rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/5 px-4 py-4 flex items-center gap-3 sm:px-5 sm:py-5 sm:gap-4">
                  <div className="text-2xl font-bold text-cyan-300/80 w-7 text-center sm:text-3xl sm:w-8">{r.n}</div>
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center sm:w-14 sm:h-14">
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${r.tint}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className={`text-xl font-bold sm:text-2xl ${r.tint}`}>{r.title}</span>
                      <span className="text-xs font-semibold text-white sm:text-sm">{r.sub}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 sm:text-sm">{r.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-white/[0.03] backdrop-blur px-5 py-4 flex items-center gap-3">
          <Info className="w-5 h-5 text-cyan-300 shrink-0" />
          <p className="text-sm text-slate-300">
            You can choose an answer <span className="italic text-cyan-300">or</span> type your own —{' '}
            <span className="text-cyan-300 font-semibold">but not both.</span>
          </p>
        </div>

        <button
          onClick={onContinue}
          className="group relative w-full mt-6 rounded-2xl py-4 px-5 font-semibold text-white overflow-hidden active:scale-[0.98] transition sm:mt-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 blur-md opacity-70 group-hover:opacity-100 transition" />
          <span className="relative flex items-center justify-center gap-3">
            I Got It
            <ArrowRight className="w-5 h-5" />
          </span>
        </button>
      </div>
    </div>
  );
};

export default SignalTestRules;
