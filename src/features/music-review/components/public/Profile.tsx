import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Crown,
  Mic,
  PenTool,
  Sliders,
  Star,
  ChevronRight,
  Trophy,
  Zap,
  Flame,
  Gem,
} from "lucide-react";
import { useTreyAuth } from "../../hooks/useTreyAuth";
import { Waveform } from "../shared/Waveform";

interface ProfileProps {
  onSubmit: () => void;
  onResults: (id: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onSubmit, onResults }) => {
  const { user } = useTreyAuth();
  const [scores, setScores] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("music_review_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setScores(data || []);
    })();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center text-[#94A3B8] py-20">
        Sign in to see your Music Review Scores.
      </div>
    );
  }

  const totals = scores.length;
  const avg = totals ? scores.reduce((s, x) => s + x.overall_score, 0) / totals / 20 : 0;
  const cat = (k: string) =>
    totals ? scores.reduce((s, x) => s + (x[k] || 0), 0) / totals / 20 : 0;
  const best = scores.reduce(
    (b: any, x) => (!b || x.overall_score > b.overall_score ? x : b),
    null,
  );

  return (
    <div className="px-4 pt-4 pb-32 max-w-3xl mx-auto space-y-4">
      {/* Profile header */}
      <div className="rounded-3xl border border-[#FFC857]/40 bg-gradient-to-br from-[#0B1426] to-[#08111F] p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full border-2 border-[#FFC857] bg-[#0B1426] flex items-center justify-center text-[#FFC857] text-2xl font-black">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[#F8FAFC] font-black text-xl truncate">{user.name}</div>
          <div className="text-[#00B7FF] text-xs">
            @{user.name.toLowerCase().replace(/\s+/g, "")}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <div>
              <span className="text-[#F8FAFC] font-bold">{totals}</span>{" "}
              <span className="text-[#94A3B8]">REVIEWS</span>
            </div>
            {best && (
              <div>
                <span className="text-[#FFC857] font-bold">{best.overall_score}</span>{" "}
                <span className="text-[#94A3B8]">BEST</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Music Review Scores */}
      <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4">
        <div className="text-[#F8FAFC] font-black tracking-wide">MUSIC REVIEW SCORES</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div className="rounded-2xl border border-[#1a2942] bg-[#05070D]/40 p-4">
            <div className="text-[#94A3B8] text-[10px] tracking-[3px] font-bold">
              AVERAGE REVIEW SCORE
            </div>
            <div
              className="text-6xl font-black text-[#00B7FF] mt-1 leading-none"
              style={{ textShadow: "0 0 20px rgba(0,183,255,0.5)" }}
            >
              {avg.toFixed(2)}
            </div>
            <div className="text-[#FFC857] text-lg mt-1">★ ★ ★ ★ ★</div>
            {avg >= 4 && (
              <div className="mt-2 flex items-center gap-2 text-[#A855F7] text-sm">
                <Crown size={16} /> Elite Artist{" "}
                <span className="text-[#94A3B8] text-xs">Top 12%</span>
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-[#1a2942] bg-[#05070D]/40 p-4">
            <div className="text-[#94A3B8] text-[10px] tracking-[3px] font-bold">SCORE TREND</div>
            <Waveform playing={false} bars={24} height={80} className="mt-2" />
            <div className="text-[#00B7FF] text-xs mt-1 text-right">{avg.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Category averages */}
      <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4">
        <div className="text-[#F8FAFC] font-black tracking-wide">CATEGORY AVERAGES</div>
        <div className="mt-3 space-y-2.5">
          {[
            {
              label: "SONGWRITING",
              key: "lyrics_score",
              icon: <PenTool size={14} />,
              color: "#FFC857",
            },
            {
              label: "VOCAL DELIVERY",
              key: "vocals_score",
              icon: <Mic size={14} />,
              color: "#00B7FF",
            },
            {
              label: "MIX / PRODUCTION",
              key: "mix_score",
              icon: <Sliders size={14} />,
              color: "#00B7FF",
            },
            {
              label: "HIT POTENTIAL",
              key: "hit_potential_score",
              icon: <Zap size={14} />,
              color: "#FFC857",
            },
          ].map((c) => {
            const v = cat(c.key);
            return (
              <div key={c.key}>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <div className="flex items-center gap-2 text-[#F8FAFC]">
                    <span
                      className="w-6 h-6 rounded-lg border border-[#1a2942] bg-[#101827] flex items-center justify-center"
                      style={{ color: c.color }}
                    >
                      {c.icon}
                    </span>
                    {c.label}
                  </div>
                  <span className="font-bold" style={{ color: c.color }}>
                    {v.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#101827] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(v / 5) * 100}%`,
                      background: c.color,
                      boxShadow: `0 0 8px ${c.color}80`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent reviews */}
      <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4">
        <div className="flex items-center justify-between">
          <div className="text-[#F8FAFC] font-black tracking-wide">RECENT REVIEWS</div>
          <button onClick={onSubmit} className="text-[#00B7FF] text-xs font-bold">
            SUBMIT NEW
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {scores.length === 0 && (
            <div className="text-[#94A3B8] text-sm py-6 text-center">
              No reviews yet. Submit your first song.
            </div>
          )}
          {scores.map((s) => (
            <button
              key={s.id}
              onClick={() => onResults(s.id)}
              className="w-full flex items-center gap-3 p-2 rounded-2xl border border-[#1a2942] bg-[#05070D]/40 hover:border-[#00B7FF]/60 transition text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B7FF]/20 to-[#A855F7]/20 border border-[#1a2942] flex items-center justify-center text-[#00B7FF]">
                ♪
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[#F8FAFC] font-semibold truncate">{s.song_title}</div>
                <div className="text-[#94A3B8] text-xs">
                  {new Date(s.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-[#FFC857] font-black flex items-center gap-1">
                {(s.overall_score / 20).toFixed(1)} <Star size={12} fill="currentColor" />
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={onSubmit}
          className="w-full mt-3 py-2.5 rounded-2xl border border-[#00B7FF]/40 text-[#00B7FF] text-sm font-bold tracking-wider"
        >
          SUBMIT NEW SONG
        </button>
      </div>

      {/* Future perks */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: <Zap size={20} />, label: "VIP PASS", sub: "Lock in your VIP queue spot" },
          { icon: <Flame size={20} />, label: "HOT SEAT", sub: "Guaranteed live review" },
          { icon: <Gem size={20} />, label: "FEATURED ARTIST", sub: "Get seen by the community" },
        ].map((p) => (
          <div
            key={p.label}
            className="rounded-2xl border border-[#A855F7]/30 bg-[#A855F7]/5 p-3 text-center"
          >
            <div className="mx-auto w-9 h-9 rounded-xl bg-[#A855F7]/15 border border-[#A855F7]/40 text-[#A855F7] flex items-center justify-center">
              {p.icon}
            </div>
            <div className="text-[#A855F7] text-[10px] tracking-wider font-bold mt-2">
              {p.label}
            </div>
            <div className="text-[#94A3B8] text-[10px] mt-1 leading-tight">{p.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
