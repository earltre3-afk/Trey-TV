import React, { useState } from "react";
import { ChevronLeft, Rocket, CalendarClock, Play, Trash2, Disc3, Music, Radio } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useReleases, statusOf, type Release } from "@/tradio/lib/releases";

interface Props {
  onClose: () => void;
}

type Mode = "now" | "schedule";

export default function ReleaseScreen({ onClose }: Props) {
  const { releases, live, scheduled, add, remove } = useReleases();
  const { playTrack } = usePlayer() as any;

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [artwork, setArtwork] = useState("");
  const [src, setSrc] = useState("");
  const [mode, setMode] = useState<Mode>("now");
  const [when, setWhen] = useState(""); // datetime-local value
  const [flash, setFlash] = useState<string | null>(null);

  const canSubmit = title.trim().length > 0 && (mode === "now" || !!when);

  const submit = () => {
    if (!canSubmit) return;
    const releaseAt = mode === "schedule" && when ? new Date(when).getTime() : Date.now();
    add({ title, artist, artwork, src, releaseAt, origin: "tradio" });
    setFlash(mode === "now" ? `“${title.trim()}” is live on Tradio.` : `“${title.trim()}” scheduled.`);
    setTitle(""); setArtist(""); setArtwork(""); setSrc(""); setWhen(""); setMode("now");
    setTimeout(() => setFlash(null), 3500);
  };

  const playRelease = (r: Release) => {
    try { playTrack?.({ id: r.id, title: r.title, artist: r.artist, artwork: r.artwork, src: r.src }); } catch { /* */ }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-6">
      {/* header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button onClick={onClose} className="text-white/80 active:opacity-60" aria-label="Back">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="min-w-0">
          <h1 className="text-white font-black text-xl leading-none">Release Music</h1>
          <p className="text-white/45 text-xs mt-0.5">Drop a track to the Tradio catalog</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-amber-400/12 border border-amber-400/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
          <Radio className="w-3.5 h-3.5" /> Tradio
        </span>
      </div>

      {flash && (
        <div className="mx-5 mb-2 rounded-xl border border-emerald-400/30 bg-emerald-400/12 px-3 py-2 text-sm font-semibold text-emerald-200">
          {flash}
        </div>
      )}

      {/* create form */}
      <section className="px-5 pt-2">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 space-y-3">
          <Field label="Track title" required>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midnight Drive"
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-amber-400/50" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Artist">
              <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Your artist name"
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-amber-400/50" />
            </Field>
            <Field label="Artwork URL">
              <input value={artwork} onChange={(e) => setArtwork(e.target.value)} placeholder="https://…"
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-amber-400/50" />
            </Field>
          </div>
          <Field label="Audio URL">
            <input value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://…/track.mp3 (from the Studio export)"
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-amber-400/50" />
          </Field>

          {/* release timing */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <ModeBtn active={mode === "now"} onClick={() => setMode("now")} icon={Rocket} label="Release now" sub="Instant" />
            <ModeBtn active={mode === "schedule"} onClick={() => setMode("schedule")} icon={CalendarClock} label="Schedule" sub="Pick a time" />
          </div>
          {mode === "schedule" && (
            <Field label="Release date & time" required>
              <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-amber-400/50" />
            </Field>
          )}

          <button
            onClick={submit}
            disabled={!canSubmit}
            className="w-full mt-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-black bg-gradient-to-r from-amber-300 to-amber-500 disabled:opacity-40 disabled:grayscale active:scale-[0.99] transition"
          >
            {mode === "now" ? <Rocket className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
            {mode === "now" ? "Release to Tradio" : "Schedule release"}
          </button>
        </div>
      </section>

      {/* your releases */}
      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/38">Your releases</p>
          <span className="text-[11px] font-bold text-white/45">
            {live.length} live · {scheduled.length} scheduled
          </span>
        </div>

        {releases.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-10 text-center">
            <Disc3 className="w-8 h-8 mx-auto text-white/25" />
            <p className="mt-3 text-sm font-semibold text-white/55">No releases yet</p>
            <p className="text-xs text-white/35">Release a track above — it lands here and in the Tradio catalog.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {releases.map((r) => {
              const st = statusOf(r);
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-2.5">
                  <img src={r.artwork} alt={r.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{r.title}</p>
                    <p className="truncate text-xs text-white/45">{r.artist}</p>
                    <div className="mt-1">
                      {st === "live" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-black text-white">
                          <span className="size-1.5 rounded-full bg-white animate-pulse" /> LIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[9px] font-black text-amber-200">
                          <CalendarClock className="w-3 h-3" /> {new Date(r.releaseAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </div>
                  {st === "live" && (
                    <button onClick={() => playRelease(r)} aria-label="Play"
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 active:scale-90 transition">
                      <Play className="w-4 h-4 text-black translate-x-[1px]" fill="currentColor" />
                    </button>
                  )}
                  <button onClick={() => remove(r.id)} aria-label="Delete release"
                    className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 text-white/50 active:scale-90 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-white/35">
          <Music className="w-3.5 h-3.5" /> Tip: export a track from the Tradio Studio, paste its URL above, and release it.
        </p>
      </section>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-white/40">
        {label}{required && <span className="text-amber-400"> *</span>}
      </span>
      {children}
    </label>
  );
}

function ModeBtn({ active, onClick, icon: Icon, label, sub }: { active: boolean; onClick: () => void; icon: any; label: string; sub: string }) {
  return (
    <button onClick={onClick} type="button"
      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.98] ${
        active ? "border-amber-400/60 bg-amber-400/10" : "border-white/[0.08] bg-white/[0.03]"
      }`}>
      <span className={`grid size-9 place-items-center rounded-lg ${active ? "bg-amber-400/20 text-amber-200" : "bg-black/30 text-white/70"}`}>
        <Icon className="w-[18px] h-[18px]" />
      </span>
      <span className="min-w-0">
        <span className={`block text-sm font-black ${active ? "text-white" : "text-white/80"}`}>{label}</span>
        <span className="block text-[11px] font-semibold text-white/40">{sub}</span>
      </span>
    </button>
  );
}
