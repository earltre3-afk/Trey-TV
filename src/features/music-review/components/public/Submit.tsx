import React, { useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Brain,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTreyAuth } from "../../hooks/useTreyAuth";
import { uploadFile, validateAudio, MAX_AUDIO_MB } from "../../lib/audio/upload";
import { AIPrecheck } from "../../lib/types";

interface SubmitProps {
  onPrecheckReady: (submissionId: string, precheck: AIPrecheck) => void;
}

const GENRES = [
  "Hip-Hop",
  "R&B",
  "Pop",
  "Trap",
  "Afrobeats",
  "Drill",
  "Soul",
  "Rock",
  "EDM",
  "Country",
  "Other",
];
const MOODS = [
  "Hype",
  "Smooth",
  "Emotional",
  "Dark",
  "Uplifting",
  "Romantic",
  "Aggressive",
  "Chill",
];

export const Submit: React.FC<SubmitProps> = ({ onPrecheckReady }) => {
  const { user } = useTreyAuth();
  const [form, setForm] = useState({
    song_title: "",
    artist_name: user?.name || "",
    genre: "",
    mood: "",
    explicit: false,
    note: "",
    rights: false,
    terms: false,
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "uploading" | "analyzing">("idle");

  if (!user) {
    return (
      <div className="px-4 py-10 max-w-md mx-auto text-center">
        <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] p-8">
          <div className="text-[#FFC857] text-sm tracking-[3px] mb-2">SIGN IN REQUIRED</div>
          <h2 className="text-2xl font-black text-[#F8FAFC]">Sign in to submit your song</h2>
          <p className="text-[#94A3B8] text-sm mt-3">
            Your account email is used for your live review report.
          </p>
        </div>
      </div>
    );
  }

  const onAudioPick = (f: File | undefined) => {
    if (!f) return;
    const err = validateAudio(f);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setAudioFile(f);
  };

  const submit = async () => {
    setError(null);
    if (!form.song_title.trim()) return setError("Song title is required.");
    if (!form.artist_name.trim()) return setError("Artist name is required.");
    if (!audioFile) return setError("Please upload an audio file.");
    if (!form.rights) return setError("Please confirm you have rights to submit.");
    if (!form.terms) return setError("Please agree to the review terms.");

    setStage("uploading");
    try {
      const audio = await uploadFile("music-review-audio", audioFile, user.id);
      let cover: any = null;
      if (coverFile) {
        cover = await uploadFile("music-review-cover-art", coverFile, user.id);
      }

      const { data: sub, error: insErr } = await supabase
        .from("music_review_submissions")
        .insert({
          user_id: user.id,
          user_email: user.email,
          song_title: form.song_title.trim(),
          artist_name: form.artist_name.trim(),
          genre: form.genre || null,
          mood: form.mood || null,
          explicit: form.explicit,
          note_to_reviewer: form.note || null,
          audio_storage_path: audio.path,
          cover_art_storage_path: cover?.path || null,
          audio_duration: audio.duration,
          file_size: audio.size,
          status: "pending",
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insErr || !sub) throw insErr || new Error("Failed to save submission");

      setStage("analyzing");
      const { data: ai } = await supabase.functions.invoke("music-review-ai-precheck", {
        body: {
          songTitle: form.song_title,
          artistName: form.artist_name,
          genre: form.genre,
          mood: form.mood,
          note: form.note,
        },
      });

      if (!ai?.precheck) {
        setError("AI Pre-Check failed. You can still continue.");
        setStage("idle");
        return;
      }

      await supabase
        .from("music_review_submissions")
        .update({
          ai_precheck_score: ai.precheck.total_score,
          ai_precheck_json: ai.precheck,
          status: "ai_prechecked",
        })
        .eq("id", sub.id);

      onPrecheckReady(sub.id, ai.precheck);
    } catch (e: any) {
      // Handle specific bucket errors gracefully
      const errorMessage = e.message || "Submission failed";
      if (errorMessage.includes("Bucket not found") || errorMessage.includes("bucket")) {
        setError("Upload storage is being configured. Please try again shortly.");
        console.error("[Trey TV Music Review] Storage bucket error:", errorMessage);
      } else {
        setError(errorMessage);
      }
      setStage("idle");
    }
  };

  return (
    <div
      className="px-4 pt-4 pb-40 md:pb-32 max-w-2xl mx-auto space-y-4"
      style={{ paddingBottom: `calc(max(2.5rem, env(safe-area-inset-bottom)) + 120px)` }}
    >
      <div className="text-center">
        <div className="text-[#FFC857] text-[11px] tracking-[5px] font-bold">STEP 1 OF 3</div>
        <h1 className="text-3xl font-black text-[#F8FAFC] mt-1">Submit Your Song</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Real review. Real score. Real exposure.</p>
      </div>

      <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426]/80 p-4 md:p-5 space-y-4 backdrop-blur-xl">
        {/* Audio upload */}
        <div>
          <label className="text-[#00B7FF] text-[11px] tracking-[3px] font-bold">
            AUDIO FILE *
          </label>
          <label
            className={`mt-2 flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed ${audioFile ? "border-[#22C55E]/60 bg-[#22C55E]/5" : "border-[#1a2942] bg-[#05070D]/40"} cursor-pointer hover:border-[#00B7FF]/60 transition`}
          >
            <input
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.aac"
              className="hidden"
              onChange={(e) => onAudioPick(e.target.files?.[0])}
            />
            <div className="w-12 h-12 rounded-2xl bg-[#0B1426] border border-[#1a2942] flex items-center justify-center text-[#00B7FF] shrink-0">
              {audioFile ? (
                <CheckCircle2 size={22} className="text-[#22C55E]" />
              ) : (
                <Upload size={22} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#F8FAFC] font-bold truncate">
                {audioFile ? audioFile.name : "Tap to upload song"}
              </div>
              <div className="text-[#94A3B8] text-xs">
                MP3, WAV, M4A, AAC — max {MAX_AUDIO_MB}MB
              </div>
            </div>
          </label>
        </div>

        {/* Title / Artist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[#00B7FF] text-[11px] tracking-[3px] font-bold">
              SONG TITLE *
            </label>
            <input
              value={form.song_title}
              onChange={(e) => setForm({ ...form, song_title: e.target.value })}
              className="mt-2 w-full px-4 py-3 rounded-2xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] focus:border-[#00B7FF] outline-none text-base"
              placeholder="e.g. Rising Dreams"
            />
          </div>
          <div>
            <label className="text-[#00B7FF] text-[11px] tracking-[3px] font-bold">
              ARTIST NAME *
            </label>
            <input
              value={form.artist_name}
              onChange={(e) => setForm({ ...form, artist_name: e.target.value })}
              className="mt-2 w-full px-4 py-3 rounded-2xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] focus:border-[#00B7FF] outline-none text-base"
            />
          </div>
        </div>

        {/* Cover art */}
        <div>
          <label className="text-[#00B7FF] text-[11px] tracking-[3px] font-bold">
            COVER ART (OPTIONAL)
          </label>
          <label className="mt-2 flex items-center gap-3 p-3 rounded-2xl border border-[#1a2942] bg-[#05070D]/40 cursor-pointer hover:border-[#00B7FF]/60 transition">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            />
            {coverFile ? (
              <img
                src={URL.createObjectURL(coverFile)}
                className="w-12 h-12 rounded-xl object-cover border border-[#1a2942] shrink-0"
                alt=""
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#0B1426] border border-[#1a2942] flex items-center justify-center text-[#94A3B8] shrink-0">
                <ImageIcon size={20} />
              </div>
            )}
            <div className="flex-1 min-w-0 text-[#94A3B8] text-sm truncate">
              {coverFile ? coverFile.name : "Upload cover art"}
            </div>
          </label>
        </div>

        {/* Genre / Mood */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[#00B7FF] text-[11px] tracking-[3px] font-bold">GENRE</label>
            <select
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
              className="mt-2 w-full px-4 py-3 rounded-2xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] focus:border-[#00B7FF] outline-none text-base"
            >
              <option value="">Select</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[#00B7FF] text-[11px] tracking-[3px] font-bold">
              MOOD / VIBE
            </label>
            <select
              value={form.mood}
              onChange={(e) => setForm({ ...form, mood: e.target.value })}
              className="mt-2 w-full px-4 py-3 rounded-2xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] focus:border-[#00B7FF] outline-none text-base"
            >
              <option value="">Select</option>
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Note to reviewer */}
        <div>
          <label className="text-[#00B7FF] text-[11px] tracking-[3px] font-bold">
            NOTES TO REVIEWER (OPTIONAL)
          </label>
          <textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            rows={3}
            className="mt-2 w-full px-4 py-3 rounded-2xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] focus:border-[#00B7FF] outline-none resize-none text-base"
            placeholder="Tell Trey what to listen for..."
          />
        </div>

        {/* Toggles */}
        <label className="flex items-center justify-between p-3 rounded-2xl border border-[#1a2942] bg-[#05070D]/40">
          <div>
            <div className="text-[#F8FAFC] font-semibold text-sm">Explicit content</div>
            <div className="text-[#94A3B8] text-xs">Mark if song contains explicit language</div>
          </div>
          <input
            type="checkbox"
            checked={form.explicit}
            onChange={(e) => setForm({ ...form, explicit: e.target.checked })}
            className="w-5 h-5 accent-[#00B7FF]"
          />
        </label>

        <label className="flex items-start gap-3 p-3 rounded-2xl border border-[#1a2942] cursor-pointer hover:bg-[#05070D]/40 transition">
          <input
            type="checkbox"
            checked={form.rights}
            onChange={(e) => setForm({ ...form, rights: e.target.checked })}
            className="mt-1 w-4 h-4 accent-[#00B7FF] shrink-0"
          />
          <span className="text-[#94A3B8] text-xs leading-relaxed">
            I confirm I own or have rights to submit this song for review. *
          </span>
        </label>
        <label className="flex items-start gap-3 p-3 rounded-2xl border border-[#1a2942] cursor-pointer hover:bg-[#05070D]/40 transition">
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(e) => setForm({ ...form, terms: e.target.checked })}
            className="mt-1 w-4 h-4 accent-[#00B7FF] shrink-0"
          />
          <span className="text-[#94A3B8] text-xs leading-relaxed">
            I agree to the Trey TV Live Review terms. *
          </span>
        </label>

        {error && (
          <div className="flex items-start gap-3 p-3 md:p-4 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={submit}
          disabled={stage !== "idle"}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FFC857] to-[#FFB000] text-[#05070D] font-black tracking-wider shadow-[0_0_25px_-5px_rgba(255,200,87,0.7)] disabled:opacity-60 flex items-center justify-center gap-2 text-base hover:shadow-[0_0_35px_-5px_rgba(255,200,87,0.9)] transition"
        >
          {stage === "uploading" && (
            <>
              <Loader2 className="animate-spin" size={18} /> UPLOADING...
            </>
          )}
          {stage === "analyzing" && (
            <>
              <Brain className="animate-pulse" size={18} /> RUNNING AI PRE-CHECK...
            </>
          )}
          {stage === "idle" && (
            <>
              RUN AI PRE-CHECK <ChevronRight size={18} />
            </>
          )}
        </button>
        <p className="text-[10px] text-[#64748B] text-center">
          AI pre-check is a quality estimate. Trey's live review is the official score.
        </p>
      </div>
    </div>
  );
};
