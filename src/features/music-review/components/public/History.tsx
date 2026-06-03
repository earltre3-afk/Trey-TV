import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTreyAuth } from "../../hooks/useTreyAuth";
import { Music, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "#94A3B8", icon: <Clock size={12} /> },
  ai_prechecked: { label: "AI Pre-Checked", color: "#A855F7", icon: <CheckCircle2 size={12} /> },
  in_queue: { label: "In Queue", color: "#00B7FF", icon: <Clock size={12} /> },
  now_playing: { label: "Now Playing", color: "#FFC857", icon: <Music size={12} /> },
  under_review: { label: "Under Review", color: "#FFC857", icon: <Music size={12} /> },
  review_complete: { label: "Review Complete", color: "#22C55E", icon: <CheckCircle2 size={12} /> },
  needs_revision: { label: "Needs Revision", color: "#FFC857", icon: <AlertCircle size={12} /> },
  rejected: { label: "Removed", color: "#EF4444", icon: <AlertCircle size={12} /> },
};

export const History: React.FC<{ onResults: (reviewId: string) => void }> = ({ onResults }) => {
  const { user } = useTreyAuth();
  const [subs, setSubs] = useState<any[]>([]);
  const [scoresMap, setScoresMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("music_review_submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setSubs(data || []);
      const { data: scores } = await supabase
        .from("music_review_scores")
        .select("id, submission_id")
        .eq("user_id", user.id);
      const map: Record<string, string> = {};
      (scores || []).forEach((s: any) => {
        map[s.submission_id] = s.id;
      });
      setScoresMap(map);
    })();
  }, [user]);

  if (!user)
    return <div className="text-center text-[#94A3B8] py-20">Sign in to see your submissions.</div>;

  return (
    <div className="px-4 pt-4 pb-32 max-w-3xl mx-auto space-y-3">
      <div className="text-center mb-2">
        <div className="text-[#FFC857] text-[10px] tracking-[4px] font-bold">
          — SUBMISSION HISTORY —
        </div>
        <h1 className="text-3xl font-black text-[#F8FAFC] mt-1">Your Submissions</h1>
      </div>
      {subs.length === 0 && (
        <div className="text-center text-[#94A3B8] py-10">No submissions yet.</div>
      )}
      {subs.map((s) => {
        const st = STATUS_MAP[s.status] || STATUS_MAP.pending;
        const reviewId = scoresMap[s.id];
        return (
          <div
            key={s.id}
            className="rounded-2xl border border-[#1a2942] bg-[#0B1426] p-3 flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00B7FF]/20 to-[#A855F7]/20 border border-[#1a2942] flex items-center justify-center text-[#00B7FF]">
              ♪
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#F8FAFC] font-semibold truncate">{s.song_title}</div>
              <div className="text-[#94A3B8] text-xs truncate">
                {s.artist_name} • {new Date(s.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1"
                style={{
                  background: `${st.color}15`,
                  color: st.color,
                  border: `1px solid ${st.color}40`,
                }}
              >
                {st.icon} {st.label}
              </span>
              {reviewId && (
                <button
                  onClick={() => onResults(reviewId)}
                  className="text-[#00B7FF] text-[10px] font-bold"
                >
                  VIEW SCORE
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
