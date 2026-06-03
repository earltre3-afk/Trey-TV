import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AudioPlayer } from "../shared/AudioPlayer";
import { ChatPanel } from "./ChatPanel";
import { getPublicUrl, useSignedAudioUrl } from "../../lib/audio/upload";
import { Submission } from "../../lib/types";
import { Activity } from "lucide-react";

export const LiveRoom: React.FC = () => {
  const [np, setNp] = useState<Submission | null>(null);
  const [queue, setQueue] = useState<Submission[]>([]);
  const [energy, setEnergy] = useState(60);

  const load = async () => {
    const { data: n } = await supabase
      .from("music_review_submissions")
      .select("*")
      .eq("status", "now_playing")
      .limit(1)
      .maybeSingle();
    setNp(n as Submission | null);
    const { data: q } = await supabase
      .from("music_review_submissions")
      .select("*")
      .in("status", ["in_queue", "ai_prechecked"])
      .order("queue_position", { ascending: true, nullsFirst: false })
      .limit(8);
    setQueue((q || []) as Submission[]);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("live-room")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "music_review_submissions" },
        () => load(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "music_review_comments" },
        () => setEnergy((e) => Math.min(100, e + 4)),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "music_review_reactions" },
        () => setEnergy((e) => Math.min(100, e + 6)),
      )
      .subscribe();
    const decay = setInterval(() => setEnergy((e) => Math.max(20, e - 1)), 3000);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(decay);
    };
  }, []);

  const cover = getPublicUrl("music-review-cover-art", np?.cover_art_storage_path);
  const audio = useSignedAudioUrl("music-review-audio", np?.audio_storage_path);

  return (
    <div className="px-4 pt-4 pb-32 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[#22C55E]/40 bg-[#22C55E]/5">
          <Activity size={14} className="text-[#22C55E]" />
          <span className="text-[#22C55E] text-[10px] font-bold tracking-wider">ROOM ENERGY</span>
          <div className="w-20 h-1.5 rounded-full bg-[#101827] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#22C55E] to-[#FFC857] transition-all"
              style={{ width: `${energy}%` }}
            />
          </div>
        </div>
        <div className="text-[#FFC857] text-[10px] tracking-[3px] font-bold">— LIVE REVIEW —</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <div className="space-y-4">
          {np ? (
            <div className="rounded-3xl border border-[#FFC857]/40 bg-gradient-to-br from-[#0B1426] to-[#08111F] p-4 shadow-[0_0_40px_-15px_rgba(255,200,87,0.5)]">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1 text-[#EF4444] text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" /> LIVE
                </span>
                <span className="text-[#FFC857] text-[10px] font-bold tracking-wider">
                  REVIEWING LIVE
                </span>
              </div>
              <AudioPlayer
                src={audio}
                title={np.song_title}
                artist={np.artist_name}
                coverUrl={cover}
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] p-10 text-center">
              <div className="text-[#94A3B8]">No live review in progress.</div>
              <div className="text-[#64748B] text-xs mt-1">Check back when Trey goes live.</div>
            </div>
          )}

          <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426]/80 p-4">
            <div className="text-[#F8FAFC] font-bold tracking-wide mb-2">UP NEXT</div>
            <div className="space-y-2">
              {queue.slice(0, 5).map((q, i) => (
                <div
                  key={q.id}
                  className="flex items-center gap-3 p-2 rounded-2xl border border-[#1a2942] bg-[#05070D]/40"
                >
                  <div className="w-6 h-6 rounded-full bg-[#101827] text-[#00B7FF] flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#F8FAFC] text-sm font-semibold truncate">
                      {q.song_title}
                    </div>
                    <div className="text-[#94A3B8] text-xs truncate">{q.artist_name}</div>
                  </div>
                </div>
              ))}
              {queue.length === 0 && (
                <div className="text-[#94A3B8] text-sm text-center py-4">Queue is empty.</div>
              )}
            </div>
          </div>
        </div>

        <ChatPanel roomType="live" refId={np?.id || null} />
      </div>
    </div>
  );
};
