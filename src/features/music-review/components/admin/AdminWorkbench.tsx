import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Save, Send, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { AudioPlayer } from "../shared/AudioPlayer";
import { getPublicUrl, useSignedAudioUrl } from "../../lib/audio/upload";
import { completeMusicReview, sendMusicReviewEmail } from "../../lib/adminApi";

interface AdminWorkbenchProps {
  submissionId: string;
  onDone: () => void;
}

const CATS = [
  { key: "vocals_score", label: "VOCALS" },
  { key: "lyrics_score", label: "LYRICS / SONGWRITING" },
  { key: "mix_score", label: "MIX / PRODUCTION" },
  { key: "originality_score", label: "ORIGINALITY" },
  { key: "hit_potential_score", label: "HIT POTENTIAL" },
  { key: "replay_value_score", label: "REPLAY VALUE" },
  { key: "marketability_score", label: "MARKETABILITY" },
];

export const AdminWorkbench: React.FC<AdminWorkbenchProps> = ({ submissionId, onDone }) => {
  const [sub, setSub] = useState<any>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    vocals_score: 85,
    lyrics_score: 85,
    mix_score: 85,
    originality_score: 85,
    hit_potential_score: 85,
    replay_value_score: 85,
    marketability_score: 85,
  });
  const [summary, setSummary] = useState("");
  const [strengths, setStrengths] = useState<string>("");
  const [improvements, setImprovements] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  const [emailHtml, setEmailHtml] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [savedReview, setSavedReview] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("music_review_submissions")
        .select("*")
        .eq("id", submissionId)
        .maybeSingle();
      setSub(data);
      if (data?.admin_notes) setAdminNotes(data.admin_notes);
      if (data?.ai_precheck_json) {
        const p = data.ai_precheck_json;
        setSummary(p.summary || "");
        setStrengths((p.strengths || []).join("\n"));
        setImprovements((p.improvements || []).join("\n"));
      }
    })();
  }, [submissionId]);

  const overall = Math.round(
    Object.values(scores).reduce((s, x) => s + x, 0) / Object.values(scores).length,
  );
  const audio = useSignedAudioUrl("music-review-audio", sub?.audio_storage_path);
  const cover = getPublicUrl("music-review-cover-art", sub?.cover_art_storage_path);

  if (!sub) return <div className="text-center text-[#94A3B8] py-10">Loading...</div>;

  const saveDraft = async () => {
    await supabase
      .from("music_review_submissions")
      .update({ admin_notes: adminNotes, status: "under_review" })
      .eq("id", submissionId);
    setStatus("Draft saved");
  };

  const finalize = async (publish: boolean) => {
    const review = await completeMusicReview({
      submissionId,
      userId: sub.user_id,
      scores: scores as any,
      written_summary: summary,
      strengths: strengths.split("\n").filter(Boolean),
      improvements: improvements.split("\n").filter(Boolean),
      publish,
    });
    setSavedReview(review);
    setStatus(`Review saved (${overall}/100)${publish ? " • Published to profile" : ""}`);
  };

  const sendEmail = async () => {
    if (!savedReview) return;
    const res = await sendMusicReviewEmail(savedReview.id);
    setEmailHtml("html" in res ? (res as any).html || null : null);
    setStatus(`Email ${"status" in res ? (res as any).status : "not sent"}`);
  };

  return (
    <div className="px-4 pt-4 pb-32 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4">
            <div className="text-[#FFC857] text-[10px] tracking-wider font-bold">REVIEWING</div>
            <div className="text-2xl font-black text-[#F8FAFC]">{sub.song_title}</div>
            <div className="text-[#00B7FF] text-sm">{sub.artist_name}</div>
            <div className="text-[#94A3B8] text-xs mt-1">
              Genre: {sub.genre || "—"} • Mood: {sub.mood || "—"} • AI Pre-Check:{" "}
              {sub.ai_precheck_score ?? "—"}/100
            </div>
            {sub.note_to_reviewer && (
              <div className="mt-2 text-sm text-[#94A3B8] bg-[#05070D]/60 rounded-2xl p-2 border border-[#1a2942]">
                Note: {sub.note_to_reviewer}
              </div>
            )}
          </div>
          <AudioPlayer
            src={audio}
            title={sub.song_title}
            artist={sub.artist_name}
            coverUrl={cover}
          />
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
            placeholder="Private admin notes…"
            className="w-full px-3 py-2 rounded-2xl bg-[#0B1426] border border-[#1a2942] text-[#F8FAFC] outline-none focus:border-[#00B7FF]"
          />
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4">
            <div className="text-[#F8FAFC] font-bold tracking-wide mb-3">SCORE THE TRACK</div>
            {CATS.map((c) => (
              <div key={c.key} className="mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8] tracking-wider font-bold">{c.label}</span>
                  <span className="text-[#FFC857] font-black">{scores[c.key]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scores[c.key]}
                  onChange={(e) => setScores({ ...scores, [c.key]: parseInt(e.target.value) })}
                  className="w-full accent-[#00B7FF]"
                />
              </div>
            ))}
            <div className="rounded-2xl border border-[#FFC857]/40 bg-[#FFC857]/5 p-3 text-center mt-2">
              <div className="text-[#FFC857] text-[10px] tracking-wider font-bold">
                OVERALL SCORE
              </div>
              <div className="text-5xl font-black text-[#FFC857]">{overall}</div>
            </div>
          </div>

          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            placeholder="Written summary (will appear in email & profile)"
            className="w-full px-3 py-2 rounded-2xl bg-[#0B1426] border border-[#1a2942] text-[#F8FAFC] outline-none focus:border-[#00B7FF]"
          />
          <textarea
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            rows={3}
            placeholder="Strengths (one per line)"
            className="w-full px-3 py-2 rounded-2xl bg-[#0B1426] border border-[#22C55E]/30 text-[#F8FAFC] outline-none focus:border-[#22C55E]"
          />
          <textarea
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            rows={3}
            placeholder="Improvements (one per line)"
            className="w-full px-3 py-2 rounded-2xl bg-[#0B1426] border border-[#FFC857]/30 text-[#F8FAFC] outline-none focus:border-[#FFC857]"
          />

          {status && (
            <div className="rounded-2xl border border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E] text-sm p-2.5 flex items-center gap-2">
              <CheckCircle2 size={14} /> {status}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={saveDraft}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#1a2942] text-[#94A3B8] hover:border-[#00B7FF]/60"
            >
              <Save size={14} /> SAVE DRAFT
            </button>
            <button
              onClick={() => finalize(true)}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#FFC857] to-[#FFB000] text-[#05070D] font-black"
            >
              <CheckCircle2 size={14} /> COMPLETE + PUBLISH
            </button>
            <button
              onClick={() => finalize(false)}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#A855F7]/40 text-[#A855F7]"
            >
              <Eye size={14} /> COMPLETE PRIVATE
            </button>
            <button
              onClick={sendEmail}
              disabled={!savedReview}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#00B7FF] text-[#05070D] font-black disabled:opacity-40"
            >
              <Send size={14} /> SEND EMAIL
            </button>
          </div>

          <button
            onClick={onDone}
            className="w-full py-2 rounded-2xl border border-[#1a2942] text-[#94A3B8] text-sm"
          >
            ← Back to Queue
          </button>
        </div>
      </div>

      {emailHtml && (
        <div className="mt-6">
          <div className="text-[#94A3B8] text-xs tracking-wider mb-2">EMAIL PREVIEW</div>
          <iframe
            srcDoc={emailHtml}
            className="w-full h-[800px] rounded-3xl border border-[#1a2942] bg-white"
            title="Email preview"
          />
        </div>
      )}
    </div>
  );
};
