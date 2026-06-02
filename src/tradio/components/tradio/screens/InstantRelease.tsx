import React, { useState } from "react";
import {
  Upload,
  Music,
  Calendar,
  Zap,
  Image as ImageIcon,
  Radio,
  Globe,
  Send,
  Lock,
  Heart,
  Share2,
  Music2,
  ListMusic,
  Check,
  Sparkles,
} from "lucide-react";
import { TopBar, GlassCard, PrimaryButton, Toggle, PlayCircle, Waveform } from "../ui";
import { IMG } from "../data";
import { AccessGate } from "../auth/components";
import { ContentFeelAnalysisPanel } from "../../content-feel/ContentFeelComponents";
import { useContentFeelAnalysis } from "../../content-feel/useContentFeelAnalysis";
import { LegalAcceptanceGroup } from "../legal/LegalPrimitives";
import { FwdGifPicker } from "@/components/fwd/FwdGifPicker";
import {
  createLegalAcceptanceValues,
  isLegalFlowAccepted,
  LEGAL_ACCEPTANCE_FLOWS,
  recordLegalFlowAcceptance,
  type LegalAcceptanceValues,
} from "../legal/legalAcceptanceConfig";

const Step: React.FC<{
  n: string;
  title: string;
  sub?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ n, title, sub, right, children }) => (
  <div>
    <div className="mb-2 flex items-start justify-between">
      <div>
        <div className="text-sm font-semibold text-white">
          <span className="text-white/50">{n}.</span> {title}
        </div>
        {sub && <div className="text-[11px] text-white/50">{sub}</div>}
      </div>
      {right}
    </div>
    {children}
  </div>
);

type ReleaseDate = "tomorrow" | "now";
type ReleaseScope = "first" | "external";

const DATE_OPTIONS: { k: ReleaseDate; icon: React.ReactNode; title: string; sub: string }[] = [
  {
    k: "tomorrow",
    icon: <Calendar className="h-4 w-4" />,
    title: "Tomorrow",
    sub: "Fri, May 24, 2025",
  },
  { k: "now", icon: <Zap className="h-4 w-4" />, title: "Release Now", sub: "Go live immediately" },
];

const SCOPE_OPTIONS: { k: ReleaseScope; icon: React.ReactNode; title: string; sub: string }[] = [
  {
    k: "first",
    icon: <Radio className="h-4 w-4" />,
    title: "Tradio First",
    sub: "Exclusive on Tradio. Build momentum",
  },
  {
    k: "external",
    icon: <Globe className="h-4 w-4" />,
    title: "External Later",
    sub: "Release on other platforms in the future",
  },
];

export const InstantReleaseScreen: React.FC = () => {
  const [explicit, setExplicit] = useState(false);
  const [premiere, setPremiere] = useState(true);
  const [notify, setNotify] = useState(true);
  const [date, setDate] = useState<ReleaseDate>("tomorrow");
  const [scope, setScope] = useState<ReleaseScope>("first");
  const [coverSource, setCoverSource] = useState<"upload" | "fwd">("upload");
  const [fwdCoverGif, setFwdCoverGif] = useState<any>(null);
  const [showFwdPicker, setShowFwdPicker] = useState(false);
  const [legalValues, setLegalValues] = useState<LegalAcceptanceValues>(() =>
    createLegalAcceptanceValues("instant_release_submit"),
  );
  const [legalStatus, setLegalStatus] = useState<
    "idle" | "saving" | "saved" | "fallback" | "error"
  >("idle");
  const [legalMessage, setLegalMessage] = useState<string | null>(null);
  const legalAccepted = isLegalFlowAccepted("instant_release_submit", legalValues);

  const contentFeel = useContentFeelAnalysis({
    contentId: "draft-instant-release-falling-for-you",
    contentType: "music_track",
    sourcePlatform: "tradio",
    title: "Falling For You",
    description: "R&B / Soul release for Tradio",
    creatorTags: ["rnb", "soul", "late night"],
    explicit,
  });

  const handleSubmitRelease = async () => {
    if (!legalAccepted || legalStatus === "saving") return;
    setLegalStatus("saving");
    const result = await recordLegalFlowAcceptance("instant_release_submit", legalValues, {
      referenceId: "mock-instant-release-falling-for-you",
      title: "Falling For You",
      artist: "Mila Rain",
      explicit,
      premiere,
      notify,
      releaseDate: date,
      distributionScope: scope,
    });
    setLegalStatus(result.source === "supabase" ? "saved" : "fallback");
    setLegalMessage(result.source === "supabase" ? "Rights confirmation saved." : result.warning);
  };

  return (
    <AccessGate
      capability="release-music"
      title="Artist access required"
      message="Switch to Artist Mode or request artist access before publishing or scheduling Tradio-native releases."
      ctaType="artist"
    >
      <div className="space-y-8 pb-4 lg:space-y-10">
        <TopBar />
        <div className="px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Instant Release</h1>
            <Waveform className="h-5 w-8" bars={6} />
          </div>
          <p className="mt-1 text-sm text-white/60">
            Publish your music directly to Tradio in minutes.
          </p>
        </div>

        <div className="space-y-3 px-4 sm:px-6 lg:px-10">
          <GlassCard className="space-y-5 p-4">
            <Step
              n="1"
              title="Upload Your Track"
              sub="WAV, MP3, or FLAC up to 500MB"
              right={
                <button className="inline-flex items-center gap-1.5 rounded-xl border border-purple-400/40 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-200">
                  <Upload className="h-4 w-4" /> Upload Audio
                </button>
              }
            >
              <div className="mt-1 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/15">
                  <Music className="h-5 w-5 text-purple-300" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">Falling For You.wav</div>
                  <div className="text-[11px] text-white/55">3:24 • 44.1kHz</div>
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            </Step>

            <Step n="2" title="Track Title">
              <div className="mt-1 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <input
                  defaultValue="Falling For You"
                  className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                />
                <span className="text-[11px] text-white/40">14/100</span>
              </div>
            </Step>

            <Step n="3" title="Artist Name">
              <div className="mt-1 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <input
                  defaultValue="Mila Rain"
                  className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                />
                <span className="text-[11px] text-white/40">9/100</span>
              </div>
            </Step>

            <Step n="4" title="Release Date" sub="Choose when your song goes live">
              <div className="mt-1 grid grid-cols-2 gap-2">
                {DATE_OPTIONS.map((o) => {
                  const sel = date === o.k;
                  return (
                    <button
                      key={o.k}
                      onClick={() => setDate(o.k)}
                      className={`flex items-start gap-2 rounded-xl border p-3 text-left transition ${
                        sel
                          ? "border-purple-400/60 bg-purple-500/10"
                          : "border-white/10 bg-white/[0.03]"
                      }`}
                    >
                      <span className={sel ? "text-purple-300" : "text-white/60"}>{o.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-white">{o.title}</div>
                        <div className="text-[11px] text-white/55">{o.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Step>

            <Step
              n="5"
              title="Cover Art / Moving Loops"
              sub="Choose a static photo or select an animated loop from FWD"
              right={
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCoverSource("upload")}
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition ${
                      coverSource === "upload"
                        ? "border-purple-400 bg-purple-500/10 text-purple-200"
                        : "border-white/10 bg-white/[0.03] text-white/55"
                    }`}
                  >
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCoverSource("fwd");
                      setShowFwdPicker(true);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition flex items-center gap-1 ${
                      coverSource === "fwd"
                        ? "border-purple-400 bg-purple-500/10 text-purple-200"
                        : "border-white/10 bg-white/[0.03] text-white/55"
                    }`}
                  >
                    <Sparkles className="h-3 w-3 text-fuchsia-400" /> FWD Loop
                  </button>
                </div>
              }
            >
              <div className="mt-1 flex items-center gap-3">
                <img
                  src={coverSource === "fwd" && fwdCoverGif ? fwdCoverGif.url : IMG.flowers}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover border border-white/10"
                />
                <div className="flex-1">
                  {coverSource === "fwd" && fwdCoverGif ? (
                    <div>
                      <div className="text-xs font-semibold text-white">
                        FWD Animated Loop Selected
                      </div>
                      <div className="text-[10px] text-fuchsia-300 font-mono">
                        ID: {fwdCoverGif.gif_id}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-semibold text-white">album-cover-photo.jpg</div>
                      <div className="text-[10px] text-white/50">Static JPG • 1400x1400</div>
                    </div>
                  )}
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            </Step>

            {[
              {
                n: "6",
                title: "Explicit Content",
                sub: "Contains explicit lyrics",
                val: explicit,
                set: setExplicit,
              },
              {
                n: "7",
                title: "Station Premiere",
                sub: "Feature on Tradio AI Radio & editorial",
                val: premiere,
                set: setPremiere,
              },
              {
                n: "8",
                title: "Fan Notifications",
                sub: "Notify followers when it goes live",
                val: notify,
                set: setNotify,
              },
            ].map((row) => (
              <div key={row.n} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">
                    <span className="text-white/50">{row.n}.</span> {row.title}
                  </div>
                  <div className="text-[11px] text-white/55">{row.sub}</div>
                </div>
                <Toggle on={row.val} onChange={row.set} />
              </div>
            ))}

            <Step n="9" title="Distribution Scope" sub="Choose how you want to release">
              <div className="mt-1 grid grid-cols-2 gap-2">
                {SCOPE_OPTIONS.map((o) => {
                  const sel = scope === o.k;
                  return (
                    <button
                      key={o.k}
                      onClick={() => setScope(o.k)}
                      className={`flex items-start gap-2 rounded-xl border p-3 text-left transition ${
                        sel
                          ? "border-purple-400/60 bg-purple-500/10"
                          : "border-white/10 bg-white/[0.03]"
                      }`}
                    >
                      <span className={sel ? "text-purple-300" : "text-white/60"}>{o.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-white">{o.title}</div>
                        <div className="text-[10px] leading-tight text-white/55">{o.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Step>

            <ContentFeelAnalysisPanel
              profile={contentFeel.profile}
              status={contentFeel.status}
              onRun={contentFeel.run}
            />

            <LegalAcceptanceGroup
              config={LEGAL_ACCEPTANCE_FLOWS.instant_release_submit}
              values={legalValues}
              onChange={setLegalValues}
              status={legalStatus}
              statusMessage={legalMessage}
            />

            <PrimaryButton
              onClick={handleSubmitRelease}
              disabled={!legalAccepted || legalStatus === "saving"}
              className={`mt-2 w-full py-4 text-base ${legalAccepted ? "" : "pointer-events-none opacity-40"}`}
            >
              Publish / Schedule <Send className="h-4 w-4" />
            </PrimaryButton>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/45">
              <Lock className="h-3 w-3" />
              Your track will be secure and private until published.
            </div>
          </GlassCard>

          {/* Preview card */}
          <GlassCard glow className="p-4">
            <div className="text-base font-semibold text-white">Preview on Your Station</div>
            <div className="text-[11px] text-white/55">This is how your release will appear</div>
            <GlassCard className="mt-3 overflow-hidden p-3">
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                PREMIERE
              </span>
              <img
                src={coverSource === "fwd" && fwdCoverGif ? fwdCoverGif.url : IMG.flowers}
                alt=""
                className="mx-auto mt-3 h-40 w-40 rounded-xl object-cover"
              />
              <div className="mt-3 text-center">
                <div className="text-base font-bold text-white">Falling For You</div>
                <div className="flex items-center justify-center gap-1 text-sm text-white/70">
                  Mila Rain <span className="text-purple-300">✓</span>
                </div>
                <div className="mx-auto mt-2 inline-block rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/65">
                  Premieres May 24, 2025
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <PlayCircle size={42} gradient />
                  <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
                    <Music2 className="h-4 w-4" />
                  </button>
                </div>
                <Waveform
                  className="mx-auto mt-3 h-5 w-40"
                  bars={32}
                  color="from-cyan-300 to-fuchsia-400"
                />
                <div className="mt-2 text-[11px] text-white/55">R&B • Soul • 3:24</div>
              </div>
            </GlassCard>
            <GlassCard className="mt-3 space-y-2 p-3.5 text-xs text-white/75">
              {[
                {
                  icon: <Radio className="h-3.5 w-3.5 text-purple-300" />,
                  t: "Releases to your artist station",
                },
                {
                  icon: <Music className="h-3.5 w-3.5 text-purple-300" />,
                  t: "Available on Tradio AI Radio",
                },
                {
                  icon: <Heart className="h-3.5 w-3.5 text-purple-300" />,
                  t: "Fans can listen, like & share",
                },
                {
                  icon: <ListMusic className="h-3.5 w-3.5 text-purple-300" />,
                  t: "Leaderboard & charts eligible",
                },
              ].map((r) => (
                <div key={r.t} className="flex items-center gap-2">
                  {r.icon}
                  {r.t}
                </div>
              ))}
            </GlassCard>
            <GlassCard className="mt-3 overflow-hidden p-3.5">
              <div className="text-[11px] font-bold tracking-wider text-fuchsia-300">PRO TIP</div>
              <p className="mt-1 text-xs text-white/75">
                Enable <span className="font-semibold text-white">Station Premiere</span> to
                increase your reach and get featured on Tradio AI Radio.
              </p>
            </GlassCard>
          </GlassCard>
        </div>
      </div>

      {showFwdPicker && (
        <FwdGifPicker
          open={showFwdPicker}
          onSelect={(gif) => {
            setFwdCoverGif(gif);
            setCoverSource("fwd");
            setShowFwdPicker(false);
          }}
          onClose={() => setShowFwdPicker(false)}
        />
      )}
    </AccessGate>
  );
};

export default InstantReleaseScreen;
