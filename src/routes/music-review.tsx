import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Mic, Upload, Link as LinkIcon, ArrowLeft, ArrowRight, Sparkles, Music2, Zap,
  Crown, CheckCircle2, Rocket, Flame, Star, Info, Radio, ListOrdered, Heart, X,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth";
import {
  useMusicReview, generateAIInsight, TIER_META,
  type Tier, type AIInsight,
} from "@/lib/music-review-store";
import { toast } from "sonner";
import cashappQR from "@/assets/cashapp-qr.png";

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

function MusicReviewPage() {
  const { user, isGuest } = useAuth();
  const nav = useNavigate();

  // Auth gate — redirect to signup, remember intent
  useEffect(() => {
    if (isGuest) {
      try { sessionStorage.setItem("treytv_post_auth_redirect", "/music-review"); } catch {}
      nav({ to: "/login" });
    }
  }, [isGuest, nav]);

  if (isGuest || !user) return null;
  return (
    <AppShell wide>
      <Flow />
    </AppShell>
  );
}

/* =========================================================== */
function Flow() {
  const [step, setStep] = useState(0);
  const total = 6;
  const next = () => setStep((s) => Math.min(total - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

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

  return (
    <div className="relative pb-24">
      <Backdrop />
      <Header step={step} total={total} />
      <div className="relative">
        {step === 0 && <Welcome onNext={next} />}
        {step === 1 && (
          <UploadStep
            source={source} setSource={setSource}
            file={file} setFile={setFile}
            driveLink={driveLink} setDriveLink={setDriveLink}
            onBack={back} onNext={next}
          />
        )}
        {step === 2 && (
          <InfoStep
            title={title} setTitle={setTitle}
            artist={artist} setArtist={setArtist}
            genre={genre} setGenre={setGenre}
            notes={notes} setNotes={setNotes}
            onBack={back}
            onNext={async () => {
              setGenerating(true);
              await new Promise((r) => setTimeout(r, 1100));
              setInsight(generateAIInsight({ title, artist, genre, notes }));
              setGenerating(false);
              next();
            }}
            generating={generating}
          />
        )}
        {step === 3 && (
          <AIStep insight={insight} onBack={back} onNext={next} title={title} artist={artist} />
        )}
        {step === 4 && (
          <TierStep
            tier={tier} setTier={setTier}
            paidConfirmed={paidConfirmed} setPaidConfirmed={setPaidConfirmed}
            onBack={back} onNext={next}
          />
        )}
        {step === 5 && (
          <ReviewStep
            source={source} file={file} driveLink={driveLink}
            title={title} artist={artist} genre={genre} notes={notes}
            tier={tier} insight={insight}
            onBack={back}
          />
        )}
      </div>
    </div>
  );
}

function Header({ step, total }: { step: number; total: number }) {
  const labels = ["Welcome", "Upload", "Song info", "AI vibe check", "Skip the line", "Review & submit"];
  return (
    <div className="relative z-10 mb-6 flex items-center justify-between gap-3">
      <Link to="/" className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10">
        <ArrowLeft className="size-4" />
      </Link>
      <div className="flex-1 mx-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= step ? "bg-gradient-to-r from-[oklch(0.82_0.16_85)] via-[oklch(0.7_0.25_340)] to-[oklch(0.82_0.15_215)]" : "bg-white/10"}`} />
          ))}
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] tracking-[0.22em] text-muted-foreground">
          <span>STEP {step + 1} / {total}</span>
          <span className="text-foreground/80">{labels[step]}</span>
        </div>
      </div>
      <Link to="/music-review/queue" className="hidden sm:inline-flex items-center gap-1.5 px-3 h-9 rounded-full liquid-glass border border-white/10 text-xs">
        <ListOrdered className="size-3.5" /> Live Queue
      </Link>
    </div>
  );
}

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.35),oklch(0.7_0.25_340_/_0.4),oklch(0.65_0.22_300_/_0.4),oklch(0.82_0.15_215_/_0.35))] blur-3xl opacity-50 animate-conic-spin" />
      <Equalizer />
    </div>
  );
}

function Equalizer() {
  return (
    <div className="absolute bottom-0 inset-x-0 h-40 flex items-end justify-center gap-1 opacity-30">
      {Array.from({ length: 48 }).map((_, i) => (
        <span
          key={i}
          className="w-1.5 rounded-t bg-gradient-to-t from-[oklch(0.82_0.16_85)] via-[oklch(0.7_0.25_340)] to-[oklch(0.82_0.15_215)]"
          style={{
            height: `${20 + (Math.sin(i * 0.7) + 1) * 40}%`,
            animation: `glow-pulse ${1.6 + (i % 7) * 0.18}s ease-in-out ${i * 0.04}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- Steps ---------------- */
function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-6 items-start">
      <div className="rounded-[28px] liquid-glass neon-border p-6 lg:p-10 shimmer-sweep">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/15 text-[10px] tracking-[0.22em]">
          <span className="size-1.5 rounded-full bg-[oklch(0.65_0.24_15)] animate-glow-pulse" /> LIVE ON TIKTOK
        </div>
        <h1 className="font-display mt-4 text-4xl sm:text-5xl xl:text-6xl font-black leading-[0.95] bg-gradient-to-br from-white via-white/80 to-white/60 bg-clip-text text-transparent drop-shadow-[0_4px_30px_oklch(0.7_0.25_340/0.35)]">
          Live Music<br/>Review.
        </h1>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-lg">
          Submit your track. Get reviewed live on TikTok by Trey. Walk away with a written review delivered to your inbox.
        </p>
        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          {[
            { icon: Upload, t: "Submit", b: "MP3, WAV, M4A or Drive link." },
            { icon: Sparkles, t: "AI vibe check", b: "First impression in seconds." },
            { icon: Crown, t: "Live review", b: "Reviewed live on TikTok by Trey." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl liquid-glass border border-white/10 p-4">
              <div className="size-9 rounded-xl bg-primary/15 text-primary grid place-items-center"><c.icon className="size-4" /></div>
              <div className="mt-3 text-sm font-bold">{c.t}</div>
              <div className="text-[11px] text-muted-foreground">{c.b}</div>
            </div>
          ))}
        </div>
        <button onClick={onNext} className="mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold glow-gold tilt-press">
          Start submission <ArrowRight className="size-4" />
        </button>
      </div>

      <aside className="rounded-[28px] liquid-glass neon-border p-5 lg:p-6">
        <div className="text-[10px] tracking-[0.22em] text-muted-foreground">HOW IT WORKS</div>
        <ol className="mt-3 space-y-3 text-sm">
          {[
            "Upload your song or drop a Google Drive link.",
            "Tell us about it — title, artist, genre, vibe notes.",
            "Get an instant AI first-impression while you wait.",
            "Optional: Skip the line with Cash App tiers.",
            "Tune into the live show. Your review hits your inbox after.",
          ].map((s, i) => (
            <li key={i} className="flex gap-3">
              <div className="mt-0.5 size-5 shrink-0 rounded-full grid place-items-center text-[10px] font-black bg-primary/20 text-primary">{i + 1}</div>
              <span className="text-foreground/90">{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-5 rounded-2xl bg-[oklch(0.7_0.25_340/0.08)] border border-[oklch(0.7_0.25_340/0.3)] p-3 text-[11px] text-muted-foreground">
          <Info className="inline size-3 -mt-0.5 mr-1 text-[oklch(0.7_0.25_340)]" />
          Files capped at 30MB. Only MP3, WAV, M4A or a public Google Drive link.
        </div>
      </aside>
    </div>
  );
}

function UploadStep({ source, setSource, file, setFile, driveLink, setDriveLink, onBack, onNext }: {
  source: "file" | "drive"; setSource: (s: "file" | "drive") => void;
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

  const canContinue = source === "file" ? !!file : DRIVE_RE.test(driveLink.trim());

  return (
    <StepShell title="Drop your track" subtitle="MP3, WAV, M4A — or share a Google Drive link.">
      <div className="grid sm:grid-cols-2 gap-2 mb-5">
        <ToggleCard active={source === "file"} onClick={() => setSource("file")} icon={Upload} label="Upload file" sub="Up to 30MB" />
        <ToggleCard active={source === "drive"} onClick={() => setSource("drive")} icon={LinkIcon} label="Google Drive link" sub="Public/shareable URL" />
      </div>

      {source === "file" ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); onPick(e.dataTransfer.files?.[0] ?? null); }}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition-all ${drag ? "border-primary bg-primary/5" : "border-white/15 hover:border-white/30"}`}
        >
          <input ref={inputRef} type="file" accept=".mp3,.wav,.m4a,audio/*" hidden onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
          <div className="mx-auto size-14 rounded-2xl bg-primary/15 text-primary grid place-items-center"><Music2 className="size-6" /></div>
          {file ? (
            <>
              <div className="mt-4 text-base font-bold">{file.name}</div>
              <div className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-3 text-xs text-primary hover:underline">Choose a different file</button>
            </>
          ) : (
            <>
              <div className="mt-4 text-base font-bold">Tap to choose · or drag a file in</div>
              <div className="text-xs text-muted-foreground mt-1">.mp3 · .wav · .m4a</div>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-3xl liquid-glass border border-white/10 p-5">
          <label className="block">
            <div className="text-[10px] tracking-[0.22em] text-muted-foreground mb-1">GOOGLE DRIVE LINK</div>
            <div className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 h-12 focus-within:border-primary/50">
              <LinkIcon className="size-4 text-muted-foreground" />
              <input
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </label>
          <div className="mt-3 text-[11px] text-muted-foreground">Make sure the link is set to "Anyone with the link can view".</div>
        </div>
      )}

      <Footer onBack={onBack} onNext={onNext} disabled={!canContinue} />
    </StepShell>
  );
}

function InfoStep(props: {
  title: string; setTitle: (s: string) => void;
  artist: string; setArtist: (s: string) => void;
  genre: string; setGenre: (s: string) => void;
  notes: string; setNotes: (s: string) => void;
  onBack: () => void; onNext: () => void;
  generating: boolean;
}) {
  const { title, setTitle, artist, setArtist, genre, setGenre, notes, setNotes, onBack, onNext, generating } = props;
  const ok = title.trim().length > 0 && artist.trim().length > 0;
  const genres = ["Hip-Hop", "R&B", "Pop", "Indie", "Rock", "Afrobeats", "Electronic", "Country", "Jazz", "Other"];
  return (
    <StepShell title="Tell us about it" subtitle="The more we know, the sharper the review.">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Song title" value={title} onChange={setTitle} placeholder="e.g. Midnight Bloom" />
        <Field label="Artist name" value={artist} onChange={setArtist} placeholder="Your stage name" />
      </div>
      <div className="mt-3">
        <div className="text-[10px] tracking-[0.22em] text-muted-foreground mb-1">GENRE</div>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <button key={g} onClick={() => setGenre(g)} className={`px-3 py-1.5 rounded-full text-xs border transition ${genre === g ? "border-primary text-primary bg-primary/10" : "border-white/10 hover:border-white/30"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <div className="text-[10px] tracking-[0.22em] text-muted-foreground mb-1">VIBE NOTES (OPTIONAL)</div>
        <textarea
          value={notes} onChange={(e) => setNotes(e.target.value)}
          rows={4} maxLength={400}
          placeholder="Anything we should know? Inspiration, mood, what to listen for…"
          className="w-full rounded-xl glass border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none"
        />
        <div className="text-[10px] text-muted-foreground text-right mt-1">{notes.length} / 400</div>
      </div>
      <Footer onBack={onBack} onNext={onNext} disabled={!ok || generating} nextLabel={generating ? "Analyzing…" : "Run AI vibe check"} />
    </StepShell>
  );
}

function AIStep({ insight, onBack, onNext, title, artist }: { insight: AIInsight | null; onBack: () => void; onNext: () => void; title: string; artist: string }) {
  if (!insight) return null;
  return (
    <StepShell title="Trey-I first impression" subtitle="A pre-listen vibe read. Not the real review — that comes live.">
      <div className="rounded-3xl liquid-glass neon-border p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 size-64 rounded-full bg-[oklch(0.7_0.25_340/0.15)] blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-[oklch(0.82_0.15_215/0.15)] blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-muted-foreground">
            <Sparkles className="size-3 text-[oklch(0.82_0.15_215)]" /> AI VIBE READ · {title.toUpperCase()} — {artist.toUpperCase()}
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black bg-gradient-to-r from-[oklch(0.82_0.16_85)] via-[oklch(0.7_0.25_340)] to-[oklch(0.82_0.15_215)] bg-clip-text text-transparent">
            {insight.vibe}
          </div>
          <div className="mt-5 grid sm:grid-cols-3 gap-3">
            <Stat label="Hype score" value={`${insight.hypeScore}/10`} icon={Flame} />
            <Stat label="Predicted mood" value={insight.predictedMood} icon={Heart} />
            <Stat label="Strengths" value={insight.strengths.join(" · ")} icon={Star} />
          </div>
          <div className="mt-5 rounded-2xl glass border border-white/10 p-4">
            <div className="text-[10px] tracking-[0.22em] text-muted-foreground">LISTEN FOR</div>
            <div className="mt-1 text-sm">{insight.hook}</div>
          </div>
        </div>
      </div>
      <Footer onBack={onBack} onNext={onNext} nextLabel="Next: Skip the line" />
    </StepShell>
  );
}

function TierStep({ tier, setTier, paidConfirmed, setPaidConfirmed, onBack, onNext }: {
  tier: Tier; setTier: (t: Tier) => void;
  paidConfirmed: boolean; setPaidConfirmed: (b: boolean) => void;
  onBack: () => void; onNext: () => void;
}) {
  const tiers: { id: Tier; title: string; price: string; desc: string; icon: typeof Rocket; ring: string; gradient: string }[] = [
    { id: "regular", title: "Regular Queue", price: "Free", desc: "Standard FIFO. Get reviewed live.", icon: Music2, ring: "border-white/15", gradient: "from-white/10 to-white/5" },
    { id: "skip",    title: "Skip the Line", price: "$5",   desc: "Jump ahead of regular submissions.", icon: Zap, ring: "border-[oklch(0.82_0.15_215/0.5)]", gradient: "from-[oklch(0.82_0.15_215/0.2)] to-transparent" },
    { id: "super",   title: "Super Skip",    price: "$10",  desc: "Move ahead of Skip submissions too.", icon: Rocket, ring: "border-[oklch(0.7_0.25_340/0.5)]", gradient: "from-[oklch(0.7_0.25_340/0.2)] to-transparent" },
    { id: "turbo",   title: "Turbo Skip",    price: "$15",  desc: "Top priority. Reviewed first.", icon: Crown, ring: "border-primary/60", gradient: "from-primary/20 to-transparent" },
  ];
  const isPaid = tier !== "regular";
  const meta = TIER_META[tier];

  return (
    <StepShell title="Skip the line?" subtitle="Optional. Pay via Cash App and get bumped up the queue.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tiers.map((t) => {
          const active = tier === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setTier(t.id); setPaidConfirmed(false); }}
              className={`relative text-left rounded-3xl p-5 border-2 transition-all overflow-hidden ${active ? `${t.ring} bg-gradient-to-br ${t.gradient}` : "border-white/10 hover:border-white/25"}`}
            >
              {active && <span className="absolute top-3 right-3 size-5 rounded-full bg-primary text-primary-foreground grid place-items-center"><CheckCircle2 className="size-3.5" /></span>}
              <div className="size-10 rounded-xl bg-white/5 grid place-items-center mb-3"><t.icon className="size-5" /></div>
              <div className="text-base font-bold">{t.title}</div>
              <div className="mt-1 text-2xl font-black">{t.price}</div>
              <div className="mt-2 text-[11px] text-muted-foreground">{t.desc}</div>
            </button>
          );
        })}
      </div>

      {isPaid && (
        <div className="mt-5 rounded-3xl liquid-glass neon-border p-5 lg:p-6 grid lg:grid-cols-[auto_1fr] gap-6 items-center">
          <div className="rounded-3xl bg-black p-4 ring-1 ring-white/10 mx-auto">
            <img src={cashappQR} alt="Cash App QR — $OfficialTreyTrizzy" className="size-48 sm:size-56 object-contain rounded-xl" />
          </div>
          <div>
            <div className="text-[10px] tracking-[0.22em] text-muted-foreground">PAYMENT</div>
            <div className="mt-1 text-2xl font-black">${meta.price}.00 via Cash App</div>
            <div className="mt-1 text-sm">Send to <span className="font-mono text-[oklch(0.78_0.18_150)]">$OfficialTreyTrizzy</span></div>
            <div className="mt-3 text-[12px] text-muted-foreground">Note: Include your <b>artist name</b> + song title in the Cash App memo so we can match it.</div>
            <label className="mt-4 flex items-start gap-2 cursor-pointer rounded-xl bg-white/5 border border-white/10 p-3 text-sm">
              <input type="checkbox" checked={paidConfirmed} onChange={(e) => setPaidConfirmed(e.target.checked)} className="mt-0.5 accent-primary" />
              <span>I sent <b>${meta.price}.00</b> via Cash App to <span className="font-mono">$OfficialTreyTrizzy</span>.</span>
            </label>
            <a href="https://cash.app/$OfficialTreyTrizzy" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs text-primary hover:underline">
              Open in Cash App <ArrowRight className="size-3" />
            </a>
          </div>
        </div>
      )}

      <Footer onBack={onBack} onNext={onNext} disabled={isPaid && !paidConfirmed} nextLabel="Next: Review" />
    </StepShell>
  );
}

function ReviewStep({ source, file, driveLink, title, artist, genre, notes, tier, insight, onBack }: {
  source: "file" | "drive"; file: File | null; driveLink: string;
  title: string; artist: string; genre: string; notes: string;
  tier: Tier; insight: AIInsight | null; onBack: () => void;
}) {
  const { user } = useAuth();
  const { add, positionOf } = useMusicReview();
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const meta = TIER_META[tier];

  const submit = async () => {
    if (!user) return;
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
    toast.success(`You're #${pos} in the live queue`);
    nav({ to: "/music-review/queue", search: { mine: sub.id } as any });
    setSubmitting(false);
  };

  return (
    <StepShell title="Looks good?" subtitle="Review your submission and lock it in.">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-3xl liquid-glass neon-border p-5">
          <div className="text-[10px] tracking-[0.22em] text-muted-foreground">YOUR TRACK</div>
          <div className="mt-2 text-2xl font-black">{title || "Untitled"}</div>
          <div className="text-sm text-muted-foreground">{artist} · {genre}</div>
          <div className="mt-3 text-xs">
            {source === "file" ? <>File: <span className="font-mono">{file?.name}</span></> : <>Drive: <a href={driveLink} target="_blank" rel="noreferrer" className="text-primary underline truncate">{driveLink}</a></>}
          </div>
          {notes && <div className="mt-3 text-sm text-foreground/80 italic">"{notes}"</div>}
        </div>
        <div className={`rounded-3xl p-5 border ${meta.ring === "border-white/15" ? "border-white/15 liquid-glass" : "liquid-glass " + meta.ring}`}>
          <div className="text-[10px] tracking-[0.22em] text-muted-foreground">QUEUE TIER</div>
          <div className={`mt-1 text-2xl font-black ${meta.color}`}>{meta.label}</div>
          <div className="text-sm text-muted-foreground">{meta.price === 0 ? "Free" : `$${meta.price}.00 · Cash App`}</div>
          {insight && (
            <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-3">
              <div className="text-[10px] tracking-[0.22em] text-muted-foreground">AI FIRST IMPRESSION</div>
              <div className="mt-1 text-sm font-semibold">{insight.vibe} · {insight.hypeScore}/10</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button onClick={onBack} className="px-4 h-11 rounded-xl liquid-glass border border-white/10 text-sm font-semibold">Back</button>
        <button
          onClick={submit}
          disabled={submitting}
          className="px-6 h-12 rounded-2xl bg-primary text-primary-foreground font-black glow-gold tilt-press inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Radio className="size-4" /> {submitting ? "Submitting…" : "Submit to live queue"}
        </button>
      </div>
    </StepShell>
  );
}

/* ---------------- Primitives ---------------- */
function StepShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="relative animate-rise">
      <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Footer({ onBack, onNext, disabled, nextLabel = "Continue" }: { onBack: () => void; onNext: () => void; disabled?: boolean; nextLabel?: string }) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <button onClick={onBack} className="px-4 h-11 rounded-xl liquid-glass border border-white/10 text-sm font-semibold">Back</button>
      <button onClick={onNext} disabled={disabled} className="px-5 h-11 rounded-xl bg-primary text-primary-foreground font-bold glow-gold tilt-press inline-flex items-center gap-1.5 disabled:opacity-50">
        {nextLabel} <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (s: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-[0.22em] text-muted-foreground mb-1">{label.toUpperCase()}</div>
      <div className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 h-11 focus-within:border-primary/50">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1 bg-transparent text-sm focus:outline-none" />
      </div>
    </label>
  );
}

function ToggleCard({ active, onClick, icon: Icon, label, sub }: { active: boolean; onClick: () => void; icon: typeof Upload; label: string; sub: string }) {
  return (
    <button onClick={onClick} className={`text-left p-4 rounded-2xl border-2 transition flex items-center gap-3 ${active ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/25"}`}>
      <div className={`size-10 rounded-xl grid place-items-center ${active ? "bg-primary text-primary-foreground" : "bg-white/5"}`}><Icon className="size-5" /></div>
      <div>
        <div className="text-sm font-bold">{label}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
    </button>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Flame }) {
  return (
    <div className="rounded-2xl glass border border-white/10 p-3">
      <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-muted-foreground"><Icon className="size-3" /> {label}</div>
      <div className="mt-1 text-base font-bold">{value}</div>
    </div>
  );
}
