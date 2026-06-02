import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Mic,
  PenTool,
  Sliders,
  Star,
  Zap,
  RotateCw,
  Trophy,
  Award,
  BarChart3,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Waveform } from "../shared/Waveform";

interface ResultsProps {
  reviewId: string;
  onProfile: () => void;
}

const cat = (label: string, value: number, icon: React.ReactNode, color: string) => (
  <div className="rounded-2xl border border-[#1a2942] bg-[#0B1426] p-3 text-center">
    <div
      className="mx-auto w-9 h-9 rounded-xl flex items-center justify-center"
      style={{ background: `${color}15`, color }}
    >
      {icon}
    </div>
    <div className="text-[#94A3B8] text-[10px] tracking-wider mt-2">{label.toUpperCase()}</div>
    <div className="text-3xl font-black mt-0.5" style={{ color }}>
      {value}
    </div>
    <div className="text-[#64748B] text-[10px]">/100</div>
  </div>
);

export const Results: React.FC<ResultsProps> = ({ reviewId, onProfile }) => {
  const [r, setR] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("music_review_scores")
        .select("*")
        .eq("id", reviewId)
        .maybeSingle();
      setR(data);
    })();
  }, [reviewId]);

  if (!r) return <div className="text-center text-[#94A3B8] py-20">Loading review…</div>;

  return (
    <div className="px-4 pt-4 pb-32 max-w-3xl mx-auto space-y-4">
      <div className="relative overflow-hidden rounded-3xl border border-[#1a2942] bg-gradient-to-br from-[#0B1426] via-[#0a1830] to-[#08111F] p-6">
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
          <Waveform playing bars={40} height={120} />
        </div>
        <div className="relative">
          <div className="text-[#FFC857] text-[11px] tracking-[5px] font-bold">
            R E V I E W &nbsp; C O M P L E T E
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-[#F8FAFC] mt-1 leading-none">
            GREAT WORK!
          </h1>
          <p className="text-[#94A3B8] mt-3 max-w-md text-sm">
            Your music was heard. Your talent stood out.
            <br />
            Here's your Live Review results.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] p-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <div className="text-[#FFC857] text-[11px] tracking-[3px] font-bold">REVIEWED SONG</div>
            <div className="text-2xl font-black text-[#F8FAFC] mt-1">{r.song_title}</div>
            <div className="text-[#00B7FF] flex items-center gap-1 mt-0.5">
              {r.artist_name} <CheckCircle2 size={14} />
            </div>
            <div className="mt-3 inline-block px-3 py-1.5 rounded-2xl border border-[#1a2942] text-[#94A3B8] text-[10px] tracking-wider">
              REVIEW DATE: {new Date(r.created_at).toLocaleDateString().toUpperCase()}
            </div>
          </div>
          <div className="text-center md:text-right md:border-l md:border-[#1a2942] md:pl-6">
            <div className="text-[#94A3B8] text-[10px] tracking-[3px] font-bold">OVERALL SCORE</div>
            <div
              className="text-7xl font-black leading-none"
              style={{
                background: "linear-gradient(135deg,#00B7FF,#A855F7)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {r.overall_score}
            </div>
            <div className="text-[#94A3B8] text-[10px] tracking-[2px]">OUT OF 100</div>
            <div className="text-[#FFC857] text-lg mt-1">★ ★ ★ ★ ★</div>
          </div>
        </div>
      </div>

      <div className="text-center text-[#00B7FF] text-[11px] tracking-[6px] font-bold pt-2">
        — A I &nbsp; S C O R E &nbsp; B R E A K D O W N —
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {cat("Vocals", r.vocals_score, <Mic size={16} />, "#00B7FF")}
        {cat("Lyrics", r.lyrics_score, <PenTool size={16} />, "#A855F7")}
        {cat("Mix", r.mix_score, <Sliders size={16} />, "#FFC857")}
        {cat("Originality", r.originality_score, <Star size={16} />, "#00B7FF")}
        {cat("Hit Potential", r.hit_potential_score, <Zap size={16} />, "#A855F7")}
        {cat("Marketability", r.marketability_score, <BarChart3 size={16} />, "#FFC857")}
      </div>

      <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] p-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
        <div>
          <div className="text-[#FFC857] text-[11px] tracking-[3px] font-bold">REVIEW SUMMARY</div>
          <p className="text-[#F8FAFC] mt-2 leading-relaxed">{r.written_summary}</p>
        </div>
        <div className="hidden md:flex w-24 h-24 rounded-full bg-gradient-to-br from-[#A855F7]/30 to-[#00B7FF]/30 items-center justify-center">
          <Trophy size={36} className="text-[#A855F7]" />
        </div>
      </div>

      {r.strengths_json?.length || r.improvements_json?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {r.strengths_json?.length ? (
            <div className="rounded-3xl border border-[#22C55E]/30 bg-[#22C55E]/5 p-4">
              <div className="text-[#22C55E] text-xs font-bold tracking-wider mb-2">STRENGTHS</div>
              <ul className="space-y-1.5">
                {r.strengths_json.map((s: string, i: number) => (
                  <li key={i} className="text-[#F8FAFC] text-sm flex gap-2">
                    <span className="text-[#22C55E]">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {r.improvements_json?.length ? (
            <div className="rounded-3xl border border-[#FFC857]/30 bg-[#FFC857]/5 p-4">
              <div className="text-[#FFC857] text-xs font-bold tracking-wider mb-2">
                IMPROVEMENTS
              </div>
              <ul className="space-y-1.5">
                {r.improvements_json.map((s: string, i: number) => (
                  <li key={i} className="text-[#F8FAFC] text-sm flex gap-2">
                    <span className="text-[#FFC857]">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#00B7FF] bg-[#0B1426] p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#00B7FF] text-[#05070D] flex items-center justify-center font-black">
          <CheckCircle2 />
        </div>
        <div className="flex-1">
          <div className="text-[#00B7FF] text-[11px] tracking-[2px] font-bold">
            YOUR SCORE HAS BEEN ADDED TO YOUR PROFILE
          </div>
          <div className="text-[#94A3B8] text-sm">Find it anytime under Music Review Scores.</div>
        </div>
        <Award className="text-[#00B7FF]" />
      </div>

      <button
        onClick={onProfile}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-[#FFC857] text-[#FFC857] font-black tracking-widest"
      >
        VIEW FULL REVIEW PROFILE <ChevronRight size={18} />
      </button>

      <div className="text-center text-xs text-[#64748B] pt-2">
        <div className="text-[#FFC857] italic text-lg">Trey</div>
        <div className="text-[#00B7FF] tracking-wider mt-1">KEEP BUILDING. WE'RE WATCHING.</div>
        <div className="text-[#94A3B8] mt-1">— TREY TV LIVE REVIEW TEAM</div>
      </div>
    </div>
  );
};
