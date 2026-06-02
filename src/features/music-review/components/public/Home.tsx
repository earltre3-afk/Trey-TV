import React, { useEffect, useState } from "react";
import {
  Cloud,
  ChevronRight,
  Brain,
  Users,
  Mic,
  Trophy,
  Zap,
  Flame,
  Gem,
  Crown,
  BarChart3,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Waveform } from "../shared/Waveform";
import { getPublicUrl } from "../../lib/audio/upload";

interface HomeProps {
  onSubmit: () => void;
  onOpenMic: () => void;
  onQueue: () => void;
  onLive: () => void;
  onProfile: () => void;
  onSkipLine: () => void;
}

export const Home: React.FC<HomeProps> = ({
  onSubmit,
  onOpenMic,
  onQueue,
  onLive,
  onProfile,
  onSkipLine,
}) => {
  const [nowPlaying, setNowPlaying] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: np } = await supabase
        .from("music_review_submissions")
        .select("*")
        .eq("status", "now_playing")
        .limit(1)
        .maybeSingle();
      setNowPlaying(np);
      const { data: q } = await supabase
        .from("music_review_submissions")
        .select("*")
        .in("status", ["in_queue", "ai_prechecked"])
        .order("queue_position", { ascending: true, nullsFirst: false })
        .limit(4);
      setQueue(q || []);
    };
    load();
    const i = setInterval(load, 8000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="px-4 pt-4 pb-32 max-w-5xl mx-auto space-y-5">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-[#1a2942] bg-gradient-to-br from-[#0B1426] via-[#0a1830] to-[#08111F] p-5 md:p-8 shadow-[0_0_60px_-15px_rgba(0,183,255,0.5)]">
        <div className="absolute -right-10 top-0 w-60 h-60 opacity-30 pointer-events-none">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(0,183,255,0.5), transparent 70%)",
              filter: "blur(20px)",
            }}
          />
        </div>
        <div className="relative">
          <h1 className="text-4xl md:text-6xl font-black leading-[0.95] text-[#F8FAFC]">
            LIVE MUSIC
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #00B7FF 0%, #A855F7 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              REVIEW
            </span>
          </h1>
          <p className="mt-3 text-[#94A3B8] text-sm md:text-base max-w-md leading-relaxed">
            Real feedback. Live on air.
            <br />
            Get heard. Get scored. Get seen.
          </p>
          <div className="mt-5 flex flex-col md:flex-row gap-3">
            <button
              onClick={onSubmit}
              className="group relative flex items-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-[#FFC857] to-[#FFB000] text-[#05070D] font-black tracking-wide shadow-[0_0_30px_-5px_rgba(255,200,87,0.7)] hover:scale-[1.02] active:scale-100 transition"
            >
              <div className="w-10 h-10 rounded-full bg-[#05070D] flex items-center justify-center">
                <Cloud size={18} className="text-[#FFC857]" />
              </div>
              <div className="text-left">
                <div className="text-base">SUBMIT YOUR SONG</div>
                <div className="text-[10px] font-normal opacity-80">Start Your Review</div>
              </div>
              <ChevronRight size={20} />
            </button>
            <button
              onClick={onOpenMic}
              className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-[#00B7FF]/60 bg-[#0B1426]/80 text-[#00B7FF] font-bold tracking-wide hover:bg-[#00B7FF]/10 transition"
            >
              <Mic size={18} />
              OPEN MIC ROOM
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* NOW PLAYING MINI */}
      <button
        onClick={onLive}
        className="w-full text-left rounded-3xl border border-[#FFC857]/40 bg-gradient-to-r from-[#0B1426] to-[#101827] p-4 hover:border-[#FFC857] transition shadow-[0_0_25px_-10px_rgba(255,200,87,0.5)]"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFC857]/30 to-[#00B7FF]/20 flex items-center justify-center border border-[#FFC857]/40">
            <BarChart3 size={20} className="text-[#FFC857]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[#FFC857] text-[10px] tracking-[3px] font-bold">NOW PLAYING</div>
            {nowPlaying ? (
              <>
                <div className="text-[#F8FAFC] font-bold truncate">{nowPlaying.song_title}</div>
                <div className="text-[#00B7FF] text-xs truncate">by {nowPlaying.artist_name}</div>
              </>
            ) : (
              <div className="text-[#94A3B8] text-sm">No live review right now — be first.</div>
            )}
          </div>
          <Waveform playing={!!nowPlaying} bars={14} height={32} className="w-20" />
        </div>
      </button>

      {/* HOW IT WORKS */}
      <section className="rounded-3xl border border-[#1a2942] bg-[#0B1426]/60 p-5 backdrop-blur-xl">
        <div className="text-[#00B7FF] text-[11px] tracking-[6px] text-center mb-4 font-bold">
          • HOW IT WORKS •
        </div>
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {[
            {
              n: 1,
              icon: <Brain size={20} />,
              title: "AI PRE-CHECK",
              sub: "Quality, vocals & content",
              color: "#00B7FF",
            },
            {
              n: 2,
              icon: <Users size={20} />,
              title: "JOIN THE QUEUE",
              sub: "Enter live queue",
              color: "#00B7FF",
            },
            {
              n: 3,
              icon: <Mic size={20} />,
              title: "LIVE REVIEW",
              sub: "Trey reviews it live",
              color: "#FFC857",
            },
            {
              n: 4,
              icon: <Trophy size={20} />,
              title: "SCORE POSTED",
              sub: "Saved to your profile",
              color: "#00B7FF",
            },
          ].map((s) => (
            <div key={s.n} className="flex flex-col items-center text-center">
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center border-2"
                  style={{
                    borderColor: s.color,
                    color: s.color,
                    boxShadow: `0 0 18px -5px ${s.color}`,
                  }}
                >
                  {s.icon}
                </div>
                <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#0B1426] border border-[#1a2942] text-[10px] flex items-center justify-center text-[#00B7FF] font-bold">
                  {s.n}
                </div>
              </div>
              <div className="mt-2 text-[10px] md:text-xs font-bold text-[#F8FAFC] tracking-wide">
                {s.title}
              </div>
              <div className="text-[9px] md:text-[10px] text-[#94A3B8] mt-1 hidden md:block">
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE QUEUE + SKIP-THE-LINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onQueue}
          className="text-left rounded-3xl border border-[#1a2942] bg-[#0B1426]/80 p-4 hover:border-[#00B7FF]/60 transition"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-[#F8FAFC] font-bold tracking-wide">LIVE QUEUE</div>
            <span className="flex items-center gap-1.5 text-[#EF4444] text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" /> LIVE
            </span>
          </div>
          {nowPlaying && (
            <div className="rounded-2xl border border-[#FFC857]/60 p-2 mb-2 bg-[#0a1a2b]">
              <div className="text-[#FFC857] text-[9px] tracking-[2px] font-bold">NOW PLAYING</div>
              <div className="text-[#F8FAFC] font-semibold text-sm">{nowPlaying.song_title}</div>
              <div className="text-[#00B7FF] text-xs">{nowPlaying.artist_name}</div>
            </div>
          )}
          {queue.length === 0 && !nowPlaying && (
            <div className="text-[#94A3B8] text-xs py-4 text-center">
              Queue is empty. Submit to be first.
            </div>
          )}
          <div className="space-y-1.5">
            {queue.slice(0, 4).map((q, i) => (
              <div key={q.id} className="flex items-center gap-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-[#101827] flex items-center justify-center text-[#00B7FF] text-xs font-bold">
                  {i + 2}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#F8FAFC] text-sm truncate">{q.song_title}</div>
                  <div className="text-[#94A3B8] text-xs truncate">{q.artist_name}</div>
                </div>
                <div className="text-[#00B7FF] text-[10px] font-bold">
                  {i === 0 ? "UP NEXT" : "IN QUEUE"}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-1 text-[#00B7FF] text-xs font-bold border-t border-[#1a2942] pt-2">
            VIEW FULL QUEUE <ChevronRight size={14} />
          </div>
        </button>

        <button
          onClick={onSkipLine}
          className="text-left rounded-3xl border border-[#FFC857]/40 bg-gradient-to-br from-[#0B1426] to-[#101827] p-4 hover:border-[#FFC857] transition"
        >
          <div className="flex items-center gap-2 mb-3">
            <Crown size={20} className="text-[#FFC857]" />
            <div>
              <div className="text-[#FFC857] font-bold tracking-wide">SKIP THE LINE</div>
              <div className="text-[#94A3B8] text-xs">Get heard faster. Bigger impact.</div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              {
                icon: <Zap size={16} />,
                label: "QUICK PASS",
                sub: "Top of the queue",
                price: "$5",
                color: "#FFC857",
              },
              {
                icon: <Flame size={16} />,
                label: "HOT SEAT",
                sub: "Next up, guaranteed",
                price: "$10",
                color: "#A855F7",
              },
              {
                icon: <Gem size={16} />,
                label: "FRONT OF LINE",
                sub: "Priority + promo boost",
                price: "$15",
                color: "#00B7FF",
              },
            ].map((t) => (
              <div
                key={t.label}
                className="flex items-center gap-3 p-2.5 rounded-2xl border border-[#1a2942] bg-[#05070D]/40"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${t.color}20`,
                    color: t.color,
                    border: `1px solid ${t.color}40`,
                  }}
                >
                  {t.icon}
                </div>
                <div className="flex-1">
                  <div className="text-[#F8FAFC] font-bold text-sm" style={{ color: t.color }}>
                    {t.label}
                  </div>
                  <div className="text-[#94A3B8] text-[10px]">{t.sub}</div>
                </div>
                <div className="text-[#F8FAFC] font-black">{t.price}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-[#FFC857] text-[#FFC857] font-bold text-sm">
            <Crown size={14} /> UPGRADE NOW
          </div>
        </button>
      </div>

      {/* SCORES TEASER */}
      <button
        onClick={onProfile}
        className="w-full text-left rounded-3xl border border-[#1a2942] bg-gradient-to-r from-[#0B1426] to-[#08111F] p-4 flex items-center gap-4 hover:border-[#A855F7]/60 transition"
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#A855F7,#00B7FF)" }}
        >
          <Trophy size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[#F8FAFC] font-bold">BUILD YOUR LEGACY.</div>
          <div className="text-[#94A3B8] text-xs">
            Climb the leaderboard, earn badges, become the next Featured Artist.
          </div>
        </div>
        <ChevronRight className="text-[#94A3B8]" size={20} />
      </button>
    </div>
  );
};
