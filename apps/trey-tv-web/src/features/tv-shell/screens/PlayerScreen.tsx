import React from "react";
import { TreyLogo } from "../components/Logo";
import { Pause, Rewind, Subtitles, SkipForward, Plus, ArrowLeft } from "lucide-react";
import { IMG } from "../mockData";
import { useTV } from "../TVContext";

export const PlayerScreen: React.FC = () => {
  const { back } = useTV();
  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      <img src={IMG(0)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />

      {/* Top bar */}
      <div className="relative z-10 flex items-start justify-between p-8">
        <button
          onClick={back}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-fuchsia-400 focus:shadow-[0_0_22px_rgba(255,43,214,0.6)]"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <TreyLogo size="sm" />
        <div className="w-[100px]" />
      </div>

      {/* Center play */}
      <div className="relative z-10 flex flex-col items-center justify-center mt-16">
        <button className="relative w-32 h-32 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 outline-none focus:scale-110 focus:shadow-[0_0_60px_rgba(255,43,214,0.8)] transition-all flex items-center justify-center">
          <Pause className="w-14 h-14 fill-white text-white" />
        </button>
        <div className="mt-8 flex items-center gap-3">
          {[Rewind, SkipForward, Subtitles, Plus].map((Icon, i) => (
            <button
              key={i}
              className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center outline-none focus:border-fuchsia-400 focus:shadow-[0_0_24px_rgba(255,43,214,0.6)] focus:scale-110 transition-all"
            >
              <Icon className="w-6 h-6" />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom info + progress */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-10 flex items-end gap-10">
        <div className="flex-1">
          <div className="text-fuchsia-300 text-sm font-bold tracking-widest">
            LIFE OF A CREATOR
          </div>
          <div className="text-3xl font-black mt-1">S3 E1 — The Come Up</div>
          <p className="text-white/70 text-sm mt-2 max-w-xl">
            Trey takes us inside his studio for a raw look at the grind behind the spotlight.
          </p>

          <div className="mt-5">
            <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-[38%] bg-gradient-to-r from-fuchsia-400 to-purple-500 rounded-full" />
              <div className="absolute left-[38%] -top-1.5 w-4 h-4 rounded-full bg-white shadow-[0_0_18px_rgba(255,43,214,0.9)]" />
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-2 font-mono">
              <span>18:24</span>
              <span>48:12</span>
            </div>
          </div>
        </div>

        {/* Up next card */}
        <div className="w-[300px] rounded-2xl border border-fuchsia-500/30 bg-black/60 backdrop-blur-md overflow-hidden">
          <div className="text-xs text-white/60 px-4 pt-3">UP NEXT</div>
          <div className="flex gap-3 p-3">
            <img src={IMG(1)} alt="" className="w-24 h-16 rounded-md object-cover" />
            <div>
              <div className="font-bold text-sm">Mindset Over Everything</div>
              <div className="text-xs text-white/55">S3 E2 · 51m</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
