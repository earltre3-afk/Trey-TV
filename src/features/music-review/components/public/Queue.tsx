import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Zap, Flame, Gem, BarChart3, Clock } from "lucide-react";
import { Submission } from "../../lib/types";
import { getPublicUrl } from "../../lib/audio/upload";

interface QueueProps {
  onLive: () => void;
  highlightUserId?: string;
}

const tierBadge = (tier: string | null | undefined, paid: boolean) => {
  if (!paid || !tier) return null;
  const map: Record<string, any> = {
    quick: { icon: <Zap size={12} />, color: "#FFC857", label: "QUICK" },
    hot: { icon: <Flame size={12} />, color: "#A855F7", label: "HOT" },
    front: { icon: <Gem size={12} />, color: "#00B7FF", label: "FRONT" },
  };
  const m = map[tier];
  if (!m) return null;
  return (
    <span
      className="px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1"
      style={{ background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}40` }}
    >
      {m.icon} {m.label}
    </span>
  );
};

export const Queue: React.FC<QueueProps> = ({ onLive, highlightUserId }) => {
  const [items, setItems] = useState<Submission[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Submission | null>(null);

  const load = async () => {
    const { data: np } = await supabase
      .from("music_review_submissions")
      .select("*")
      .eq("status", "now_playing")
      .limit(1)
      .maybeSingle();
    setNowPlaying(np as Submission | null);
    const { data } = await supabase
      .from("music_review_submissions")
      .select("*")
      .in("status", ["in_queue", "ai_prechecked", "under_review"])
      .order("queue_position", { ascending: true, nullsFirst: false })
      .limit(50);
    setItems((data || []) as Submission[]);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("queue-public")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "music_review_submissions" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  return (
    <div className="px-4 pt-4 pb-32 max-w-3xl mx-auto space-y-4">
      <div className="text-center">
        <div className="text-[#FFC857] text-[10px] tracking-[4px] font-bold">— LIVE QUEUE —</div>
        <h1 className="text-3xl font-black text-[#F8FAFC] mt-1">Up Next & Estimated Wait</h1>
      </div>

      {nowPlaying && (
        <button
          onClick={onLive}
          className="w-full text-left rounded-3xl border-2 border-[#FFC857]/60 bg-gradient-to-r from-[#FFC857]/10 to-transparent p-4 shadow-[0_0_25px_-8px_rgba(255,200,87,0.6)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#0B1426] border border-[#FFC857]/40 flex items-center justify-center text-[#FFC857]">
              <BarChart3 size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#FFC857] text-[10px] tracking-[3px] font-bold">
                NOW PLAYING — LIVE REVIEW
              </div>
              <div className="text-[#F8FAFC] font-bold text-lg truncate">
                {nowPlaying.song_title}
              </div>
              <div className="text-[#00B7FF] text-xs truncate">{nowPlaying.artist_name}</div>
            </div>
            <span className="flex items-center gap-1 text-[#EF4444] text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" /> LIVE
            </span>
          </div>
        </button>
      )}

      <div className="space-y-2">
        {items.map((s, i) => {
          const isMe = highlightUserId && s.user_id === highlightUserId;
          const cover = getPublicUrl("music-review-cover-art", s.cover_art_storage_path);
          return (
            <div
              key={s.id}
              className={`flex items-center gap-3 rounded-2xl border bg-[#0B1426]/80 p-3 ${isMe ? "border-[#00B7FF] shadow-[0_0_20px_-5px_rgba(0,183,255,0.6)]" : "border-[#1a2942]"}`}
            >
              <div className="w-7 h-7 rounded-full bg-[#101827] border border-[#1a2942] flex items-center justify-center text-[#00B7FF] text-xs font-bold">
                {i + 2}
              </div>
              {cover ? (
                <img
                  src={cover}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-[#1a2942]"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#101827] border border-[#1a2942] flex items-center justify-center text-[#00B7FF]">
                  ♪
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[#F8FAFC] font-semibold truncate">{s.song_title}</div>
                <div className="text-[#94A3B8] text-xs truncate">{s.artist_name}</div>
              </div>
              <div className="flex items-center gap-2">
                {tierBadge(s.priority_tier, !!s.priority_paid)}
                {isMe && <span className="text-[10px] text-[#00B7FF] font-bold">YOU</span>}
                <span className="flex items-center gap-1 text-[#94A3B8] text-xs">
                  <Clock size={10} /> ~{Math.max(2, (i + 1) * 4)} min
                </span>
              </div>
            </div>
          );
        })}
        {items.length === 0 && !nowPlaying && (
          <div className="text-center py-10 text-[#94A3B8]">
            Queue is empty. Submit your song to be first.
          </div>
        )}
      </div>
    </div>
  );
};
