import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Mic, Upload, Link as LinkIcon, ArrowLeft, ArrowRight, Sparkles, Music2, Zap,
  Crown, CheckCircle2, Rocket, Flame, Star, Info, Radio, ListOrdered, Heart, X,
  Music, Eye, Users, Clock, Pin, Send, Check
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth";
import {
  useMusicReview, TIER_META,
  type Tier, type AIInsight,
} from "@/lib/music-review-store";
import { generateMusicReviewInsight } from "@/lib/trey-i/vertex.server";
import { toast } from "sonner";
import neonMic from "@/assets/neon-mic.png";
import hbvCover from "@/assets/hbv-cover.jpg";

export const Route = createFileRoute("/music-review")({
  component: MusicReviewPage,
  head: () => ({
    meta: [
      { title: "Live Music Review · Trey TV" },
      { name: "description", content: "Submit your song for a live music review on Trey TV. Upload MP3, WAV, M4A or share a Google Drive link." },
      { property: "og:title", content: "Live Music Review · Trey TV" },
      { property: "og:description", content: "Submit your song for a live music review on Trey TV." },
    ],
  }),
});

const ACCEPT_EXT = [".mp3", ".wav", ".m4a"];
const ACCEPT_MIME = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a", "audio/m4a"];
const MAX_BYTES = 30 * 1024 * 1024; // 30MB
const DRIVE_RE = /^https?:\/\/(drive|docs)\.google\.com\/.+/i;

const GENRES = ["Hip-Hop", "R&B", "Pop", "Indie", "Rock", "Afrobeats", "Electronic", "Country", "Jazz", "Other"];

const TIERS = [
  { id: "regular", name: "Regular Queue", price: "Free", desc: "Standard FIFO. Get reviewed live.", icon: Crown, color: "gold" },
  { id: "skip", name: "Skip the Line", price: "$5", desc: "Jump ahead of regular submissions.", icon: Zap, color: "pink" },
  { id: "super", name: "Super Skip", price: "$10", desc: "Move ahead of Skip submissions too.", icon: Rocket, color: "blue" },
  { id: "turbo", name: "Turbo Skip", price: "$15", desc: "Top priority. Reviewed first.", icon: Star, color: "pink" },
] as const;

function MusicReviewPage() {
  return (
    <AppShell wide>
      <PageShell>
        <Flow />
      </PageShell>
    </AppShell>
  );
}

/* ------------------------- PAGE SHELL ------------------------- */
function Sparks() {
  const items = Array.from({ length: 8 });
  return (
    <div className="lmr-sparks" aria-hidden>
      {items.map((_, i) => {
        const x = `${(i * 73) % 100}vw`;
        const dx = `${((i * 37) % 80) - 40}px`;
        const dur = `${10 + (i % 7) * 2}s`;
        const delay = `${(i * 0.7) % 8}s`;
        return (
          <span
            key={i}
            style={{
              left: 0,
              ['--x' as string]: x,
              ['--dx' as string]: dx,
              animationDuration: dur,
              animationDelay: delay,
            }}
          />
        );
      })}
    </div>
  );
}

function WaveformBars() {
  const bars = Array.from({ length: 28 });
  const colors = ["var(--color-gold)", "var(--color-pink)", "var(--color-purple)", "var(--color-blue)"];
  return (
    <div className="pointer-events-none fixed left-0 right-0 bottom-[88px] z-[1] flex items-end justify-center gap-[3px] px-4 h-16 opacity-60">
      {bars.map((_, i) => {
        const h = 18 + Math.abs(Math.sin(i * 0.55) + Math.cos(i * 0.31)) * 50;
        const c = colors[i % colors.length];
        return (
          <span
            key={i}
            className="w-[3px] rounded-full"
            style={{
              height: `${h}%`,
              background: `linear-gradient(180deg, ${c}, transparent)`,
              boxShadow: `0 0 8px ${c}`,
            }}
          />
        );
      })}
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen pb-44 overflow-x-hidden">
      <div className="lmr-aurora" aria-hidden />
      <div className="lmr-neon-grid" aria-hidden />
      <Sparks />
      <div className="lmr-scan-shimmer relative z-[2]">{children}</div>
      <WaveformBars />
    </div>
  );
}

/* =========================================================== */
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

function Flow() {
  const [step, setStep] = useState<Step>(1);
  const total = 6;
  const next = () => setStep((s) => Math.min(total + 1, s + 1) as Step);
  const back = () => setStep((s) => Math.max(1, s - 1) as Step);
  const go = (s: Step) => setStep(s);

  const [source, setSource] = useState<"file" | "drive">("file");
  const [file, setFile] = useState<File | null>(null);
  const [driveLink, setDriveLink] = useState("");

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("Hip-Hop");
  const [notes, setNotes] = useState("");

  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [generating, setGenerating] = useState(false);

  const [tier, setTier] = useState<Tier>("regular");
  const [paidConfirmed, setPaidConfirmed] = useState(false);

  const { user } = useAuth();
  const { add, positionOf } = useMusicReview();
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [queuePos, setQueuePos] = useState<number>(0);

  const submit = async () => {
    if (!user) {
      try { sessionStorage.setItem("treytv_post_auth_redirect", "/music-review"); } catch {}
      nav({ to: "/signup" });
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    const sub = add({
      userUid: user.uid,
      userName: user.name,
      userEmail: `${user.handle}@trey.tv`,
      title, artist, genre, notes,
      source,
      fileName: file?.name,
      driveLink: source === "drive" ? driveLink.trim() : undefined,
      tier,
      paymentStatus: tier === "regular" ? "none" : "pending",
      aiFirstImpression: insight ?? undefined,
    });
    const pos = positionOf(sub.id);
    setSubmittedId(sub.id);
    setQueuePos(pos);
    toast.success(`You're #${pos} in the live queue`);
    setSubmitting(false);
    go(7);
  };

  return (
    <div className="relative pt-6 max-w-3xl mx-auto">
      {step === 1 && <Landing onStart={() => go(2)} />}
      {step === 2 && (
        <UploadStep
          mode={source} setMode={setSource}
          file={file} setFile={setFile}
          driveLink={driveLink} setDriveLink={setDriveLink}
          onBack={() => go(1)} onNext={() => go(3)}
        />
      )}
      {step === 3 && (
        <SongInfoStep
          title={title} setTitle={setTitle}
          artist={artist} setArtist={setArtist}
          genre={genre} setGenre={setGenre}
          notes={notes} setNotes={setNotes}
          onBack={() => go(2)}
          onNext={async () => {
            setGenerating(true);
            try {
              const res = await generateMusicReviewInsight({ data: { title, artist, genre, notes } });
              setInsight(res);
            } catch (err) {
              console.error("AI generation failed", err);
              // Fallback to avoid breaking flow
              setInsight({
                vibe: "Underground energy",
                strengths: ["Raw potential", "Authentic feel"],
                hook: "Listen for the rhythmic pocket on the hook.",
                hypeScore: 7,
                predictedMood: "Hype",
              });
            }
            setGenerating(false);
            go(4);
          }}
          generating={generating}
        />
      )}
      {step === 4 && (
        <VibeCheckStep
          title={title || "Untitled"} artist={artist || "Unknown"} genre={genre}
          insight={insight}
          onBack={() => go(3)} onNext={() => go(5)}
        />
      )}
      {step === 5 && (
        <TierStep
          tier={tier} setTier={setTier}
          paidConfirmed={paidConfirmed} setPaidConfirmed={setPaidConfirmed}
          onBack={() => go(4)} onNext={() => go(6)}
        />
      )}
      {step === 6 && (
        <ReviewStep
          title={title || "Untitled"} artist={artist || "Unknown"} genre={genre}
          tier={TIERS.find((t) => t.id === tier)!}
          insight={insight}
          onBack={() => go(5)} onSubmit={submit}
          submitting={submitting}
        />
      )}
      {step === 7 && (
        <LiveQueueStep
          title={title || "Untitled"} artist={artist || "Unknown"} genre={genre}
          tier={TIERS.find((t) => t.id === tier)!}
          insight={insight}
          position={queuePos}
          onBack={() => {}}
        />
      )}
    </div>
  );
}

/* ------------------------- STEP BAR ------------------------- */
function StepBar({
  step,
  total,
  label,
  onBack,
}: {
  step: number;
  total: number;
  label: string;
  onBack?: () => void;
}) {
  return (
    <div className="mt-4 mb-8">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="size-9 shrink-0 rounded-full grid place-items-center border border-white/10 bg-white/5 text-foreground hover:bg-white/10 transition"
            aria-label="Back"
          >
            ←
          </button>
        )}
        <div className="flex-1 flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-[3px] flex-1 rounded-full ${
                i < step ? "lmr-step-bar" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
        <span>Step {step} / {total}</span>
        <span>{label}</span>
      </div>
    </div>
  );
}

/* ------------------------- STEP 1: LANDING ------------------------- */
function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="mt-5">
      <div className="relative overflow-hidden rounded-[28px] lmr-glass-card lmr-neon-trace p-6 pb-8">
        <img
          src={neonMic}
          alt=""
          className="pointer-events-none absolute -right-10 -top-4 w-56 opacity-90 lmr-float-y lmr-neon-pulse"
          loading="eager"
        />
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-[11px] tracking-[0.18em] uppercase">
          <span className="size-2 rounded-full bg-[oklch(0.65_0.25_25)] shadow-[0_0_10px_oklch(0.65_0.25_25)]" />
          Live on TikTok
        </div>
        <h1 className="mt-5 text-[44px] leading-[0.95] font-extrabold font-display">
          Live Music<br />
          <span className="text-[oklch(0.86_0.17_92)]">Review.</span>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-[85%]">
          Submit your track. Get reviewed live on TikTok by Trey. Walk away with a written review delivered to your inbox.
        </p>

        <div className="mt-6 space-y-3 relative z-10">
          <FeatureCard glow="gold" icon={<Upload className="size-6 text-[oklch(0.86_0.17_92)]" />} title="Submit" sub="MP3, WAV, M4A or Drive link." />
          <FeatureCard glow="pink" icon={<Sparkle />} title="AI vibe check" sub="First impression in seconds." />
          <FeatureCard glow="blue" icon={<Crown className="size-6 text-[oklch(0.86_0.17_92)]" />} title="Live review" sub="Reviewed live on TikTok by Trey." />
        </div>

        <button onClick={onStart} className="lmr-btn-gold relative z-10 mt-7 w-full h-14 rounded-full font-bold text-base inline-flex items-center justify-center gap-2">
          Start submission <ArrowRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

const Sparkle = () => (
  <svg viewBox="0 0 24 24" className="size-6 text-[oklch(0.86_0.17_92)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" />
    <path d="M19 16l.7 1.8L21 18.5l-1.3.7L19 21l-.7-1.8L17 18.5l1.3-.7z" />
  </svg>
);

function FeatureCard({ icon, title, sub, glow }: { icon: React.ReactNode; title: string; sub: string; glow: "gold" | "pink" | "blue" }) {
  const glowClass = glow === "gold" ? "lmr-glow-gold" : glow === "pink" ? "lmr-glow-pink" : "lmr-glow-blue";
  return (
    <div className={`rounded-2xl p-4 flex items-center gap-4 bg-black/20 ${glowClass}`}>
      <div className="size-14 shrink-0 rounded-full grid place-items-center border border-white/10 bg-black/30">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-bold text-base">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </div>
      <ArrowRight className="size-4 text-muted-foreground" />
    </div>
  );
}

/* ------------------------- STEP 2: UPLOAD ------------------------- */
function UploadStep({
  mode, setMode,
  file, setFile,
  driveLink, setDriveLink,
  onBack, onNext
}: {
  mode: "file" | "drive"; setMode: (m: "file" | "drive") => void;
  file: File | null; setFile: (f: File | null) => void;
  driveLink: string; setDriveLink: (s: string) => void;
  onBack: () => void; onNext: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const validate = (f: File): string | null => {
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf("."));
    if (!ACCEPT_EXT.includes(ext) && !ACCEPT_MIME.includes(f.type)) return "Only MP3, WAV, or M4A files are accepted.";
    if (f.size > MAX_BYTES) return "File is too large (30MB max).";
    return null;
  };

  const onPick = (f: File | null) => {
    if (!f) return;
    const err = validate(f);
    if (err) { toast.error(err); return; }
    setFile(f);
  };

  const canContinue = mode === "file" ? !!file : DRIVE_RE.test(driveLink.trim());

  return (
    <div>
      <StepBar step={1} total={6} label="Upload" onBack={onBack} />
      <h1 className="mt-6 text-[40px] leading-[1] font-extrabold font-display">
        Drop <span className="text-[oklch(0.86_0.17_92)]">your track</span>
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">MP3, WAV, M4A — or share a Google Drive link.</p>

      <div className="mt-6 space-y-3">
        <button
          onClick={() => setMode("file")}
          className={`w-full p-4 rounded-2xl flex items-center gap-4 ${mode === "file" ? "lmr-glow-gold bg-black/40" : "border border-white/10 bg-black/20"}`}
        >
          <div className={`size-12 rounded-full grid place-items-center ${mode === "file" ? "bg-[oklch(0.86_0.17_92)] text-black" : "bg-white/5 text-muted-foreground"}`}>
            <Upload className="size-5" />
          </div>
          <div className="text-left">
            <div className="font-bold">Upload file</div>
            <div className="text-xs text-muted-foreground">Up to 30MB</div>
          </div>
        </button>
        <button
          onClick={() => setMode("drive")}
          className={`w-full p-4 rounded-2xl flex items-center gap-4 ${mode === "drive" ? "lmr-glow-blue bg-black/40" : "border border-white/10 bg-black/20"}`}
        >
          <div className={`size-12 rounded-full grid place-items-center border border-white/10 ${mode === "drive" ? "bg-[oklch(0.7_0.18_240)] text-white" : "bg-white/5 text-muted-foreground"}`}>
            <LinkIcon className="size-5" />
          </div>
          <div className="text-left">
            <div className="font-bold">Google Drive link</div>
            <div className="text-xs text-muted-foreground">Public/shareable URL</div>
          </div>
        </button>
      </div>

      {mode === "file" ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); onPick(e.dataTransfer.files?.[0] ?? null); }}
          onClick={() => inputRef.current?.click()}
          className={`mt-5 rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${drag ? "border-[oklch(0.86_0.17_92)] bg-[oklch(0.86_0.17_92)]/5" : "border-[oklch(0.72_0.25_350)]/50 bg-black/20 hover:border-white/30"}`}
        >
          <input ref={inputRef} type="file" accept=".mp3,.wav,.m4a,audio/*" hidden onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
          <div className="mx-auto size-16 rounded-full grid place-items-center border border-white/10 bg-black/30">
            <Music className="size-7 text-[oklch(0.86_0.17_92)]" />
          </div>
          {file ? (
            <>
              <div className="mt-4 text-base font-bold">{file.name}</div>
              <div className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-3 text-xs text-[oklch(0.86_0.17_92)] hover:underline">Choose a different file</button>
            </>
          ) : (
            <>
              <p className="mt-4 font-semibold">Tap to choose · or drag a file in</p>
              <p className="mt-1 text-xs text-muted-foreground">.mp3 · .wav · .m4a</p>
            </>
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-3xl lmr-glass-card border border-white/10 p-5">
          <label className="block">
            <div className="text-[10px] tracking-[0.22em] text-muted-foreground mb-1 uppercase">Google Drive Link</div>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 h-12 focus-within:border-[oklch(0.86_0.17_92)]/50">
              <LinkIcon className="size-4 text-muted-foreground" />
              <input
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                className="flex-1 bg-transparent text-sm focus:outline-none text-foreground"
              />
            </div>
          </label>
          <div className="mt-3 text-[11px] text-muted-foreground">Make sure the link is set to "Anyone with the link can view".</div>
        </div>
      )}

      <NavRow onBack={onBack} onNext={onNext} nextLabel="Continue" disabled={!canContinue} />
    </div>
  );
}

function NavRow({ onBack, onNext, nextLabel, disabled }: { onBack: () => void; onNext: () => void; nextLabel: string; disabled?: boolean }) {
  return (
    <div className="mt-7 flex items-center gap-4">
      <button onClick={onBack} className="px-7 h-12 rounded-full border border-white/10 bg-black/40 font-medium hover:bg-black/60 transition">Back</button>
      <button
        onClick={onNext}
        disabled={disabled}
        className="lmr-btn-gold flex-1 h-12 rounded-full font-bold inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:shadow-none"
      >
        {nextLabel} <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

/* ------------------------- STEP 3: SONG INFO ------------------------- */
function SongInfoStep(props: {
  title: string; setTitle: (s: string) => void;
  artist: string; setArtist: (s: string) => void;
  genre: string; setGenre: (s: string) => void;
  notes: string; setNotes: (s: string) => void;
  onBack: () => void; onNext: () => void;
  generating: boolean;
}) {
  const { title, setTitle, artist, setArtist, genre, setGenre, notes, setNotes, onBack, onNext, generating } = props;
  const ready = title.trim() && artist.trim() && genre;
  return (
    <div>
      <StepBar step={2} total={6} label="Song info" onBack={onBack} />
      <h1 className="mt-6 text-[36px] leading-[1] font-extrabold font-display">Tell us about it</h1>
      <p className="mt-2 text-sm text-muted-foreground">The more we know, the sharper the review.</p>

      <InputField label="Song title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midnight Bloom" className="lmr-input" />
      </InputField>
      <InputField label="Artist name">
        <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Your stage name" className="lmr-input" />
      </InputField>
      <InputField label="Genre">
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => {
            const active = genre === g;
            return (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`px-4 h-10 rounded-full text-sm font-medium border ${active ? "lmr-glow-gold text-[oklch(0.86_0.17_92)] bg-black/40" : "border-white/10 text-foreground bg-black/20"}`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </InputField>
      <InputField label="Vibe notes (optional)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 400))}
          placeholder="Anything we should know? Inspiration, mood, what to listen for..."
          rows={4}
          className="lmr-input resize-none"
        />
        <div className="mt-1 text-right text-xs text-muted-foreground">{notes.length} / 400</div>
      </InputField>

      <NavRow onBack={onBack} onNext={onNext} nextLabel={generating ? "Analyzing..." : "Run AI vibe check"} disabled={!ready || generating} />
      <style>{`
        .lmr-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 14px 16px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .lmr-input::placeholder { color: rgba(255, 255, 255, 0.4); }
        .lmr-input:focus { border-color: oklch(0.86 0.17 92); box-shadow: 0 0 0 3px oklch(0.86 0.17 92 / 0.15); }
      `}</style>
    </div>
  );
}

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2">{label}</div>
      {children}
    </div>
  );
}

/* ------------------------- STEP 4: VIBE CHECK ------------------------- */
function VibeCheckStep({ title, artist, genre, insight, onBack, onNext }: { title: string; artist: string; genre: string; insight: AIInsight | null; onBack: () => void; onNext: () => void }) {
  if (!insight) return null;
  return (
    <div>
      <StepBar step={3} total={6} label="AI vibe check" onBack={onBack} />
      <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-[11px] tracking-[0.18em] uppercase">
        <span className="size-2 rounded-full bg-[oklch(0.78_0.18_150)] shadow-[0_0_10px_oklch(0.78_0.18_150)]" />
        AI Vibe Check
      </div>
      <h1 className="mt-4 text-[36px] leading-[1.05] font-extrabold font-display">
        Your <span className="text-[oklch(0.86_0.17_92)]">vibe</span> check is in
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">A quick first impression before you choose your queue.</p>

      <div className="mt-5 lmr-glass-card lmr-neon-trace rounded-2xl p-4">
        <div className="flex gap-4">
          <img src={hbvCover} alt="" className="size-20 rounded-xl object-cover lmr-glow-pink" loading="lazy" />
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold truncate">{title}</div>
            <div className="text-sm text-muted-foreground">{artist} · {genre}</div>
            <div className="text-xs text-muted-foreground mt-0.5">File: Upload</div>
            <div className="mt-2 flex items-center gap-2 text-[oklch(0.86_0.17_92)]">
              <button className="size-7 rounded-full bg-[oklch(0.86_0.17_92)]/20 grid place-items-center">▶</button>
              <Wave />
              <span className="text-xs">0:30</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl lmr-glow-gold p-5 bg-black/30">
          <div className="flex items-center gap-4">
            <div className="relative size-24 shrink-0 rounded-full grid place-items-center bg-background border border-[oklch(0.86_0.17_92)]/40 shadow-[0_0_40px_oklch(0.86_0.17_92/0.45)_inset,0_0_30px_oklch(0.86_0.17_92/0.4)]">
              <span className="text-2xl font-extrabold text-[oklch(0.86_0.17_92)] leading-none">{insight.hypeScore}<span className="text-base">/10</span></span>
            </div>
            <div className="flex-1 flex items-start gap-2">
              <Zap className="size-6 text-[oklch(0.86_0.17_92)] mt-0.5 shrink-0" />
              <div className="text-2xl font-extrabold text-[oklch(0.86_0.17_92)] leading-tight">{insight.vibe}</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <Chip icon={<Zap className="size-4 text-[oklch(0.86_0.17_92)]" />} title="Mood" value={insight.predictedMood} />
            <Chip icon={<Music className="size-4 text-[oklch(0.72_0.25_350)]" />} title="Hook" value="Catchy" />
            <Chip icon={<Users className="size-4 text-[oklch(0.78_0.18_150)]" />} title="Potential" value="Live-friendly" />
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-2 text-[oklch(0.65_0.25_300)] text-[11px] tracking-[0.2em] uppercase font-bold">
              <Sparkle /> Strengths
            </div>
            <p className="mt-2 text-sm text-foreground/90 leading-relaxed">
              {insight.strengths.join(" · ")}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[oklch(0.78_0.18_150)]/40 bg-[oklch(0.78_0.18_150)]/10 text-xs text-[oklch(0.78_0.18_150)]">
          <CheckCircle2 className="size-4" /> Saved to review
        </div>
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextLabel="Choose queue tier" />
    </div>
  );
}

const Wave = () => (
  <div className="flex-1 flex items-center gap-[2px] h-5">
    {Array.from({ length: 32 }).map((_, i) => (
      <span
        key={i}
        className="w-[2px] bg-[oklch(0.86_0.17_92)]/70 rounded-full"
        style={{ height: `${20 + Math.abs(Math.sin(i * 0.7)) * 70}%` }}
      />
    ))}
  </div>
);

function Chip({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-1.5">{icon}<span className="text-xs text-muted-foreground">{title}</span></div>
      <div className="mt-1 font-semibold text-sm truncate" title={value}>{value}</div>
    </div>
  );
}

/* ------------------------- STEP 5: QUEUE TIER ------------------------- */
const TIER_AMOUNTS: Record<string, number> = { regular: 0, skip: 5, super: 10, turbo: 15 };
const CASHTAG = "OfficialTreyTrizzy";

function CashAppPayment({ amount, tierName }: { amount: number; tierName: string }) {
  const cashUrl = `https://cash.app/$${CASHTAG}/${amount}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=12&data=${encodeURIComponent(cashUrl)}`;
  return (
    <div className="mt-5 lmr-glass-card lmr-neon-trace rounded-[28px] p-6 step-enter">
      <div className="mx-auto w-fit">
        <div className="relative rounded-[28px] bg-[#0a0a0a] p-4 border border-white/10 shadow-[0_0_60px_oklch(0.65_0.25_300/0.35),inset_0_0_30px_oklch(0.65_0.25_300/0.25)]">
          <div className="rounded-2xl bg-white p-4 shadow-[0_0_40px_oklch(0.78_0.16_220/0.55)]">
            <img src={qrSrc} alt={`Cash App QR for $${amount} to $${CASHTAG}`} className="block size-56 object-contain" />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <div className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground">Payment</div>
        <div className="mt-1 text-3xl font-extrabold">${amount.toFixed(2)} via Cash App</div>
        <div className="mt-2 text-base">Send to <span className="font-mono text-[oklch(0.78_0.18_150)]">${`$${CASHTAG}`}</span></div>
        <p className="mt-3 text-sm text-muted-foreground">
          Note: Include your <span className="text-foreground font-semibold">artist name</span> + song title in the Cash App memo so we can match it.
        </p>
      </div>
      <a
        href={`https://cash.app/$${CASHTAG}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 text-[oklch(0.86_0.17_92)] font-bold"
      >
        Open in Cash App <ArrowRight className="size-4" />
      </a>
      <div className="sr-only">{tierName}</div>
    </div>
  );
}

function TierStep({ tier, setTier, paidConfirmed, setPaidConfirmed, onBack, onNext }: { tier: string; setTier: (s: any) => void; paidConfirmed: boolean; setPaidConfirmed: (b: boolean) => void; onBack: () => void; onNext: () => void }) {
  const amount = TIER_AMOUNTS[tier] ?? 0;
  const selected = TIERS.find((t) => t.id === tier)!;
  const requiresPayment = amount > 0;

  return (
    <div>
      <StepBar step={4} total={6} label="Queue tier" onBack={onBack} />
      <h1 className="mt-6 text-[36px] leading-[1] font-extrabold font-display">
        Choose <span className="text-[oklch(0.86_0.17_92)]">your</span> queue
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Pick how fast you want your track reviewed live.</p>

      <div className="mt-6 space-y-3">
        {TIERS.map((t) => {
          const active = tier === t.id;
          const glow =
            t.color === "gold" ? "lmr-glow-gold" :
            t.color === "pink" ? "lmr-glow-pink" :
            "lmr-glow-blue";
          const iconColor = t.color === "gold" ? "text-[oklch(0.86_0.17_92)]" : t.color === "pink" ? "text-[oklch(0.72_0.25_350)]" : "text-[oklch(0.7_0.18_240)]";
          const priceColor = t.id === "regular" ? "text-[oklch(0.86_0.17_92)]" : t.color === "pink" ? "text-[oklch(0.72_0.25_350)]" : "text-[oklch(0.7_0.18_240)]";
          return (
            <button
              key={t.id}
              onClick={() => { setTier(t.id); setPaidConfirmed(false); }}
              className={`w-full text-left rounded-2xl p-4 flex items-center gap-4 bg-black/20 ${active ? glow : "border border-white/10"}`}
            >
              <div className={`size-14 rounded-full grid place-items-center bg-black/40 border border-white/10`}>
                <t.icon className={`size-6 ${iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="font-bold">{t.name}</div>
                <div className={`text-xl font-extrabold ${priceColor}`}>{t.price}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
              </div>
              {active && (
                <div className="size-8 rounded-full grid place-items-center border-2 border-[oklch(0.86_0.17_92)] text-[oklch(0.86_0.17_92)] shadow-[0_0_15px_oklch(0.86_0.17_92/0.5)]">
                  <Check className="size-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {requiresPayment && (
        <div key={tier}>
          <CashAppPayment amount={amount} tierName={selected.name} />
          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={paidConfirmed}
              onChange={(e) => setPaidConfirmed(e.target.checked)}
              className="mt-0.5 size-5 accent-[oklch(0.86_0.17_92)]"
            />
            <span className="text-sm">
              I sent <span className="font-bold">${amount.toFixed(2)}</span> via Cash App to <span className="font-mono text-[oklch(0.78_0.18_150)]">${`$${CASHTAG}`}</span>.
            </span>
          </label>
        </div>
      )}

      <NavRow onBack={onBack} onNext={onNext} nextLabel={requiresPayment ? "Next: Review" : "Review & submit"} disabled={requiresPayment && !paidConfirmed} />
    </div>
  );
}

/* ------------------------- STEP 6: REVIEW ------------------------- */
function ReviewStep({ title, artist, genre, tier, insight, onBack, onSubmit, submitting }: { title: string; artist: string; genre: string; tier: typeof TIERS[number]; insight: AIInsight | null; onBack: () => void; onSubmit: () => void; submitting: boolean }) {
  const Icon = tier.icon;
  return (
    <div>
      <StepBar step={5} total={6} label="Review & submit" onBack={onBack} />
      <h1 className="mt-6 text-[40px] leading-[1] font-extrabold font-display">Looks good?</h1>
      <p className="mt-2 text-sm text-muted-foreground">Review your submission and lock it in.</p>

      <div className="mt-5 lmr-glass-card lmr-neon-trace rounded-2xl p-5">
        <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Your track</div>
        <div className="mt-3 flex gap-4">
          <img src={hbvCover} alt="" className="size-24 rounded-xl object-cover lmr-glow-pink" loading="lazy" />
          <div>
            <div className="text-2xl font-extrabold">{title}</div>
            <div className="text-sm text-muted-foreground">{artist} · {genre}</div>
            <div className="text-sm text-muted-foreground mt-1">File Uploaded / Linked</div>
          </div>
        </div>
      </div>

      <div className="mt-4 lmr-glass-card lmr-neon-trace rounded-2xl p-5">
        <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Queue tier</div>
        <div className="mt-3 flex items-center gap-3">
          <div className="size-12 rounded-full grid place-items-center bg-black/40 border border-white/10">
            <Icon className="size-5 text-[oklch(0.86_0.17_92)]" />
          </div>
          <div>
            <div className="font-bold">{tier.name}</div>
            <div className="text-sm text-muted-foreground">{tier.price}</div>
          </div>
        </div>
        {insight && (
          <div className="mt-4 rounded-xl bg-black/30 border border-white/10 p-3">
            <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">AI first impression</div>
            <div className="mt-1 font-semibold">{insight.vibe} · {insight.hypeScore}/10</div>
          </div>
        )}
      </div>

      <button onClick={onBack} className="mt-5 w-full h-12 rounded-full border border-white/10 bg-black/40 font-medium hover:bg-black/60 transition">Back</button>
      <div className="mt-5 relative">
        <div className="absolute -inset-3 rounded-full bg-[oklch(0.86_0.17_92)]/30 blur-2xl pointer-events-none" />
        <button onClick={onSubmit} disabled={submitting} className="lmr-btn-gold relative w-full h-16 rounded-full font-extrabold text-lg inline-flex items-center justify-center gap-3 disabled:opacity-60">
          <Radio className="size-5" /> {submitting ? "Submitting..." : "Submit to live queue"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------- STEP 7: LIVE QUEUE ------------------------- */
function LiveQueueStep({ title, artist, genre, tier, insight, position, onBack }: { title: string; artist: string; genre: string; tier: typeof TIERS[number]; insight: AIInsight | null; position: number; onBack: () => void }) {
  const Icon = tier.icon;
  const [msg, setMsg] = useState("");
  return (
    <div className="pb-12">
      <StepBar step={6} total={6} label="Review submitted" onBack={onBack} />

      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 text-[11px] tracking-[0.18em] uppercase">
            <span className="size-2 rounded-full bg-[oklch(0.65_0.25_25)] shadow-[0_0_10px_oklch(0.65_0.25_25)] animate-pulse" /> Live
          </div>
          <h1 className="mt-3 text-[32px] leading-[1.05] font-extrabold font-display">
            You're <span className="text-[oklch(0.86_0.17_92)]">live</span> in the queue
          </h1>
        </div>
        <div className="px-3 py-2 rounded-xl border border-white/10 bg-black/30 text-right">
          <div className="flex items-center gap-1.5 text-[oklch(0.78_0.18_150)] text-xs"><Eye className="size-3.5" /> Watching live</div>
          <div className="text-xs text-muted-foreground mt-0.5">● 312</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Trey's team will review your track live. Stay in the room & vibe with the community.</p>

      <div className="mt-5 lmr-glass-card lmr-neon-trace rounded-2xl p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Your submission</div>
            <div className="mt-2 flex gap-3">
              <img src={hbvCover} alt="" className="size-16 rounded-lg object-cover lmr-glow-pink" loading="lazy" />
              <div className="min-w-0">
                <div className="font-bold truncate">{title}</div>
                <div className="text-xs text-muted-foreground">{artist} · {genre}</div>
              </div>
            </div>
          </div>
          <div className="text-center relative">
            <div className="text-[10px] tracking-[0.2em] uppercase text-[oklch(0.86_0.17_92)]">Your position</div>
            <div className="relative mt-2 mx-auto w-fit">
              <div className="absolute inset-0 -m-2 rounded-full bg-[oklch(0.86_0.17_92)]/25 blur-2xl" />
              <div className="relative text-7xl font-black text-[oklch(0.86_0.17_92)] leading-none drop-shadow-[0_0_30px_oklch(0.86_0.17_92/0.8)]">#{position}</div>
              <div className="mt-1 mx-auto h-2 w-24 rounded-full bg-gradient-to-r from-transparent via-[oklch(0.86_0.17_92)] to-transparent blur-[2px]" />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="size-7 rounded-full grid place-items-center border border-white/10"><Icon className="size-3.5 text-[oklch(0.86_0.17_92)]" /></div>
            <div>
              <div className="text-[10px] tracking-[0.18em] uppercase">Queue tier</div>
              <div className="font-bold text-foreground">{tier.name}</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5"><Users className="size-3.5 text-muted-foreground" /> {position - 1} people ahead of you</div>
            <div className="flex items-center gap-1.5"><Clock className="size-3.5 text-muted-foreground" /> Estimated wait: {position * 3} min</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="grid grid-cols-3 items-start gap-1 text-center relative">
            <span className="absolute top-[58px] left-[18%] right-[55%] border-t border-dashed border-white/20" />
            <span className="absolute top-[58px] left-[55%] right-[18%] border-t border-dashed border-white/20" />
            <QueueSlot label="Up now" name="@prodbykai" track='"Late Nights"' grad="from-amber-400 to-rose-500" />
            <QueueSlot label="Up next" name="@soulgrv" track='"Better Days"' grad="from-blue-400 to-purple-500" />
            <div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-[oklch(0.86_0.17_92)]">You</div>
              <div className="mt-1 mx-auto size-12 rounded-full grid place-items-center border-2 border-[oklch(0.86_0.17_92)] text-[oklch(0.86_0.17_92)] font-extrabold text-xs lmr-glow-gold bg-black">#{position}</div>
              <div className="text-xs font-bold mt-1 truncate">{title}</div>
              <div className="text-[10px] text-muted-foreground truncate">{artist} · {genre}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 lmr-glass-card lmr-neon-trace rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="size-2 rounded-full bg-[oklch(0.78_0.18_150)] shadow-[0_0_10px_oklch(0.78_0.18_150)]" />
            <span className="text-[11px] tracking-[0.18em] uppercase font-bold">Live Chat Room</span>
            <span className="text-xs text-muted-foreground">· 320 in the room</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-[oklch(0.65_0.25_300)]/40 bg-[oklch(0.65_0.25_300)]/10 text-xs text-[oklch(0.65_0.25_300)]">
            <Pin className="size-3" /> Pinned
          </div>
        </div>

        <div className="mt-3 space-y-3 text-sm">
          <ChatMsg color="bg-[oklch(0.7_0.18_240)]" letter="W" name="WaveCheck ⚡" time="2m" body="You got this! 🔥" />
          <ChatMsg color="bg-[oklch(0.65_0.25_300)]" letter="R" name="RnbVibes" time="2m" body="Who's up next?" />
          <ChatMsg color="bg-[oklch(0.72_0.25_350)]" letter="M" name="MelodicMind" time="1m" body="This queue moving fast 🚀" />
          <ChatMsg color="bg-[oklch(0.65_0.25_300)]" letter="P" name="ProlificJay" time="1m" body="Can't wait for Trey to hear this 🙌" />
          <div className="flex gap-2">
            <div className="size-8 rounded-full grid place-items-center bg-black/40 border border-white/10 shrink-0">
              <Radio className="size-3.5 text-[oklch(0.86_0.17_92)]" />
            </div>
            <div>
              <div className="text-xs"><span className="font-bold tracking-wider text-foreground">SYSTEM</span> <span className="text-muted-foreground">just now</span></div>
              <div className="text-sm">Trey is now reviewing <span className="text-[oklch(0.7_0.18_240)]">@prodbykai</span>'s track live.</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 pl-4 pr-1.5 py-1.5">
          <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Send a message..." className="flex-1 bg-transparent outline-none text-sm text-foreground" />
          <button className="size-9 rounded-full grid place-items-center border border-[oklch(0.86_0.17_92)]/50 text-[oklch(0.86_0.17_92)]">
            <Send className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <Pill icon={<Sparkles className="size-3.5" />}>AI vibe check saved</Pill>
        <Pill icon={<Radio className="size-3.5" />} highlight>View live review</Pill>
        <Pill icon={<Zap className="size-3.5" />}>{insight ? `${insight.hypeScore}/10` : "Ready"}</Pill>
      </div>
    </div>
  );
}

function QueueSlot({ label, name, track, grad }: { label: string; name: string; track: string; grad: string }) {
  return (
    <div className="relative">
      <div className="text-[10px] tracking-[0.2em] uppercase text-[oklch(0.86_0.17_92)]/80">{label}</div>
      <div className={`mt-1 mx-auto size-12 rounded-full bg-gradient-to-br ${grad} border border-white/10 shadow-[0_0_15px_oklch(0.65_0.25_300/0.4)]`} />
      <div className="text-xs font-bold mt-1 truncate">{name}</div>
      <div className="text-[10px] text-muted-foreground truncate">{track}</div>
    </div>
  );
}

function ChatMsg({ color, letter, name, time, body }: { color: string; letter: string; name: string; time: string; body: string }) {
  return (
    <div className="flex gap-2">
      <div className={`size-8 rounded-full grid place-items-center text-xs font-bold text-white ${color} shrink-0`}>{letter}</div>
      <div className="min-w-0">
        <div className="text-xs"><span className="font-bold text-foreground">{name}</span> <span className="text-muted-foreground">· {time}</span></div>
        <div className="text-sm">{body}</div>
      </div>
    </div>
  );
}

function Pill({ children, icon, highlight }: { children: React.ReactNode; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-full border px-3 py-2 flex items-center justify-center gap-1.5 text-center ${highlight ? "border-[oklch(0.86_0.17_92)]/60 text-[oklch(0.86_0.17_92)] lmr-glow-gold" : "border-white/10 bg-black/20 text-muted-foreground"}`}>
      {icon}<span className="truncate">{children}</span>
    </div>
  );
}
