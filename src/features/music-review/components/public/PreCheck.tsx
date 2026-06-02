import React from "react";
import {
  Mic,
  PenTool,
  Sliders,
  Star,
  Zap,
  RotateCw,
  Trophy,
  ChevronRight,
  Brain,
  Edit3,
} from "lucide-react";
import { AIPrecheck } from "../../lib/types";
import { Waveform } from "../shared/Waveform";

interface PreCheckProps {
  submissionId: string;
  precheck: AIPrecheck;
  songTitle: string;
  artistName: string;
  coverUrl?: string;
  onSubmitToTrey: () => void;
  onRevise: () => void;
}

export const PreCheckView: React.FC<PreCheckProps> = ({
  precheck,
  songTitle,
  artistName,
  coverUrl,
  onSubmitToTrey,
  onRevise,
}) => {
  const cats = [
    {
      label: "Vocal Performance",
      icon: <Mic size={16} />,
      value: precheck.categories.vocal_performance,
      color: "#00B7FF",
    },
    {
      label: "Songwriting",
      icon: <PenTool size={16} />,
      value: precheck.categories.songwriting,
      color: "#00B7FF",
    },
    {
      label: "Mix Quality",
      icon: <Sliders size={16} />,
      value: precheck.categories.mix_quality,
      color: "#00B7FF",
    },
    {
      label: "Originality",
      icon: <Star size={16} />,
      value: precheck.categories.originality,
      color: "#00B7FF",
    },
    {
      label: "Hit Potential",
      icon: <Zap size={16} />,
      value: precheck.categories.hit_potential,
      color: "#00B7FF",
    },
    {
      label: "Replay Value",
      icon: <RotateCw size={16} />,
      value: precheck.categories.replay_value,
      color: "#00B7FF",
    },
  ];

  return (
    <div className="px-4 pt-4 pb-32 max-w-3xl mx-auto space-y-4">
      {/* Now Playing card */}
      <div className="rounded-3xl border border-[#1a2942] bg-gradient-to-r from-[#0B1426] to-[#08111F] p-4">
        <div className="text-[#00B7FF] text-[10px] tracking-[3px] font-bold mb-3">NOW PLAYING</div>
        <div className="flex items-center gap-4">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              className="w-20 h-20 rounded-2xl object-cover border border-[#FFC857]/40"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00B7FF]/20 to-[#A855F7]/20 border border-[#1a2942] flex items-center justify-center text-3xl text-[#00B7FF]">
              ♪
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[#F8FAFC] font-black text-xl truncate">{songTitle}</div>
            <div className="text-[#94A3B8] truncate">{artistName}</div>
          </div>
          <Waveform playing bars={20} height={40} className="w-28 hidden sm:flex" />
        </div>
      </div>

      {/* AI PRE-CHECK header */}
      <div className="rounded-3xl border border-[#00B7FF]/40 bg-[#0B1426]/80 p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00B7FF]/10 border border-[#00B7FF]/40 flex items-center justify-center text-[#00B7FF] shadow-[0_0_20px_-5px_rgba(0,183,255,0.5)]">
            <Brain size={22} />
          </div>
          <div className="flex-1">
            <div className="text-[#F8FAFC] font-black text-xl">AI PRE-CHECK</div>
            <div className="text-[#94A3B8] text-xs">
              Honest feedback before you go live. Improve your chances.
            </div>
          </div>
          <div className="text-[10px] text-right">
            <div className="text-[#94A3B8] tracking-wider">POWERED BY</div>
            <div className="text-[#00B7FF] font-bold tracking-wider">TREY AI</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="text-[#00B7FF] text-xs tracking-[3px] font-bold mb-3">
              SCORE BREAKDOWN
            </div>
            <div className="space-y-3">
              {cats.map((c) => (
                <div key={c.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-[#F8FAFC] text-sm">
                      <span
                        className="w-6 h-6 rounded-lg bg-[#101827] border border-[#1a2942] flex items-center justify-center"
                        style={{ color: c.color }}
                      >
                        {c.icon}
                      </span>
                      <span>{c.label}</span>
                    </div>
                    <div className="text-[#F8FAFC] text-sm font-bold">
                      {c.value} <span className="text-[#94A3B8] text-xs">/ 100</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-[#101827] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${c.value}%`,
                        background: "linear-gradient(90deg,#00B7FF,#A855F7)",
                        boxShadow: `0 0 8px ${c.color}80`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(#FFC857 0%, #FFB000 " +
                    precheck.total_score +
                    "%, #101827 " +
                    precheck.total_score +
                    "% 100%)",
                  filter: "blur(0px)",
                  mask: "radial-gradient(circle, transparent 60%, black 62%)",
                  WebkitMask: "radial-gradient(circle, transparent 60%, black 62%)",
                }}
              />
              <div className="text-center relative z-10">
                <div className="text-[#94A3B8] text-[10px] tracking-[3px] font-bold">
                  TOTAL SCORE
                </div>
                <div
                  className="text-6xl font-black text-[#FFC857]"
                  style={{ textShadow: "0 0 25px rgba(255,200,87,0.6)" }}
                >
                  {precheck.total_score}
                </div>
                <div className="text-[#94A3B8] text-xs">/100</div>
              </div>
            </div>
            <div className="mt-3 w-full">
              <div className="text-[#00B7FF] text-xs font-bold tracking-wider">
                CONFIDENCE LEVEL
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-sm font-bold ${precheck.confidence_level === "High" ? "text-[#22C55E]" : precheck.confidence_level === "Medium" ? "text-[#FFC857]" : "text-[#94A3B8]"}`}
                >
                  {precheck.confidence_level}
                </span>
                <div className="flex-1 h-2 rounded-full bg-[#101827] overflow-hidden">
                  <div
                    className="h-full bg-[#22C55E]"
                    style={{ width: `${precheck.confidence_pct}%` }}
                  />
                </div>
                <span className="text-[#94A3B8] text-xs">{precheck.confidence_pct}%</span>
              </div>
            </div>
            <div className="mt-3 w-full rounded-2xl bg-[#05070D]/60 border border-[#1a2942] p-3">
              <div className="text-[#00B7FF] text-[11px] tracking-[2px] font-bold mb-1">
                AI HONEST FEEDBACK
              </div>
              <p className="text-[#F8FAFC] text-sm leading-relaxed">{precheck.summary}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths/Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-3xl border border-[#22C55E]/30 bg-[#22C55E]/5 p-4">
          <div className="text-[#22C55E] text-xs font-bold tracking-wider mb-2">STRENGTHS</div>
          <ul className="space-y-1.5">
            {precheck.strengths.map((s, i) => (
              <li key={i} className="text-[#F8FAFC] text-sm flex gap-2">
                <span className="text-[#22C55E]">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-[#FFC857]/30 bg-[#FFC857]/5 p-4">
          <div className="text-[#FFC857] text-xs font-bold tracking-wider mb-2">IMPROVEMENTS</div>
          <ul className="space-y-1.5">
            {precheck.improvements.map((s, i) => (
              <li key={i} className="text-[#F8FAFC] text-sm flex gap-2">
                <span className="text-[#FFC857]">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendation */}
      <div className="rounded-3xl border border-[#22C55E]/40 bg-gradient-to-r from-[#22C55E]/10 to-transparent p-4 flex items-center gap-3">
        <Trophy size={22} className="text-[#22C55E]" />
        <div className="flex-1">
          <div className="text-[#00B7FF] text-xs tracking-wider font-bold">RECOMMENDATION</div>
          <div className="text-[#22C55E] font-black text-lg">{precheck.recommendation}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={onSubmitToTrey}
          className="flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-[#FFC857] to-[#FFB000] text-[#05070D] font-black tracking-wider shadow-[0_0_30px_-5px_rgba(255,200,87,0.7)]"
        >
          <ChevronRight size={20} /> SUBMIT TO TREY
        </button>
        <button
          onClick={onRevise}
          className="flex items-center justify-center gap-3 px-5 py-4 rounded-2xl border border-[#1a2942] text-[#F8FAFC] font-bold hover:border-[#00B7FF]/60"
        >
          <Edit3 size={18} /> REVISE FIRST
        </button>
      </div>
    </div>
  );
};
