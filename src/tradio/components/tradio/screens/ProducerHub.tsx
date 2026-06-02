import React, { useState } from "react";
import {
  Activity,
  ArrowRight,
  Disc3,
  Handshake,
  Package,
  Radio,
  Send,
  Upload,
  Users,
  Sparkles,
  Volume2,
} from "lucide-react";
import {
  TopBar,
  GlassCard,
  PrimaryButton,
  SecondaryButton,
  Chip,
  BeatCard,
  SegmentedTabs,
  VerifiedBadge,
} from "../ui";
import {
  ARTIST_MATCH_SUGGESTIONS,
  BEAT_PACKS,
  BEATS,
  COLLABORATION_REQUESTS,
  DJ_OPPORTUNITIES,
  PRODUCERS,
} from "../data";
import { usePlayer } from "@/tradio/contexts/PlayerContext";
import { beatToPlaybackItem } from "../playbackAdapters";
import { AccessGate } from "../auth/components";
import { ContentFeelAnalysisPanel } from "../../content-feel/ContentFeelComponents";
import { useContentFeelAnalysis } from "../../content-feel/useContentFeelAnalysis";
import { LegalAcceptanceGroup } from "../legal/LegalPrimitives";
import {
  createLegalAcceptanceValues,
  isLegalFlowAccepted,
  LEGAL_ACCEPTANCE_FLOWS,
  recordLegalFlowAcceptance,
  type LegalAcceptanceValues,
} from "../legal/legalAcceptanceConfig";

type ProducerHubTab = "beats" | "packs" | "collabs" | "matches";

export const ProducerHub: React.FC<{
  onOpenBroadcastStudio?: (initialTab?: string) => void;
  onViewPublicProfile?: () => void;
  onEditProfile?: () => void;
}> = ({ onOpenBroadcastStudio, onViewPublicProfile, onEditProfile }) => {
  const [tab, setTab] = useState<ProducerHubTab>("beats");
  const currentProducer = PRODUCERS[0];
  const featuredBeat = BEATS.find((beat) => beat.producerId === PRODUCERS[0].id) ?? BEATS[0];
  const beatContentFeel = useContentFeelAnalysis({
    contentId: `draft-beat-${featuredBeat?.id ?? "new"}`,
    contentType: "producer_beat",
    sourcePlatform: "tradio",
    title: featuredBeat?.title ?? "Untitled Beat",
    description: `Beat • ${featuredBeat?.bpm ?? "—"} BPM • ${featuredBeat?.key ?? ""}`,
    creatorTags: featuredBeat?.mood ?? [],
    hints: { bpm: featuredBeat?.bpm, key: featuredBeat?.key },
  });
  const producerBeats = BEATS.filter((beat) => beat.producerId === currentProducer.id);
  const { playItem, addToQueue } = usePlayer();
  const [legalValues, setLegalValues] = useState<LegalAcceptanceValues>(() =>
    createLegalAcceptanceValues("producer_beat_publish"),
  );
  const [legalStatus, setLegalStatus] = useState<
    "idle" | "saving" | "saved" | "fallback" | "error"
  >("idle");
  const [legalMessage, setLegalMessage] = useState<string | null>(null);
  const legalAccepted = isLegalFlowAccepted("producer_beat_publish", legalValues);

  const handleBeatLegalAction = async (action: string) => {
    if (!legalAccepted || legalStatus === "saving") return;
    setLegalStatus("saving");
    const result = await recordLegalFlowAcceptance("producer_beat_publish", legalValues, {
      action,
      referenceId: producerBeats[0]?.id ?? "mock-producer-beat",
      producerId: currentProducer.id,
      producerName: currentProducer.name,
    });
    setLegalStatus(result.source === "supabase" ? "saved" : "fallback");
    setLegalMessage(
      result.source === "supabase" ? "Beat rights confirmation saved." : result.warning,
    );
  };

  return (
    <AccessGate
      capability="upload-beat"
      title="Producer access required"
      message="Switch to Producer Mode or request producer access to upload beats, manage packs, pitch artists, and reach DJs."
      ctaType="producer"
    >
      <div className="space-y-8 pb-4 lg:space-y-10">
        <TopBar title="Producer Hub" />

        {(onEditProfile || onViewPublicProfile) && (
          <div className="flex flex-wrap gap-2 px-4 sm:px-6 lg:px-10">
            {onEditProfile && (
              <SecondaryButton className="px-4 py-2.5 text-[11px]" onClick={onEditProfile}>
                Edit Producer Profile
              </SecondaryButton>
            )}
            {onViewPublicProfile && (
              <SecondaryButton className="px-4 py-2.5 text-[11px]" onClick={onViewPublicProfile}>
                View Public Producer Profile
              </SecondaryButton>
            )}
          </div>
        )}

        <div className="px-4 sm:px-6 lg:px-10">
          <GlassCard glow className="overflow-hidden p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4">
                <img
                  src={currentProducer.avatar}
                  alt={currentProducer.name}
                  className="h-24 w-24 rounded-2xl border border-white/15 object-cover"
                />
                <div className="min-w-0">
                  <Chip label="Producer Hub" selected icon={<Disc3 className="h-3.5 w-3.5" />} />
                  <div className="mt-3 flex items-center gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-white">
                      {currentProducer.name}
                    </h1>
                    {currentProducer.verified && <VerifiedBadge />}
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                    {currentProducer.bio}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {currentProducer.specialties.map((tag) => (
                      <Chip key={tag} label={tag} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 lg:w-[360px]">
                {[
                  ["Beats", currentProducer.beatCount],
                  ["Followers", `${(currentProducer.followers / 1000).toFixed(0)}K`],
                  ["Collabs", currentProducer.collaborations],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-center"
                  >
                    <div className="text-[11px] text-white/50">{label}</div>
                    <div className="mt-1 text-xl font-bold text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <PrimaryButton
                disabled={!legalAccepted || legalStatus === "saving"}
                onClick={() => handleBeatLegalAction("upload_beat")}
                className={legalAccepted ? "" : "pointer-events-none opacity-40"}
              >
                <Upload className="h-4 w-4" /> Upload Beat
              </PrimaryButton>
              <SecondaryButton
                disabled={!legalAccepted || legalStatus === "saving"}
                onClick={() => handleBeatLegalAction("pitch_to_artist")}
                className={legalAccepted ? "" : "pointer-events-none opacity-40"}
              >
                <Send className="h-4 w-4" /> Pitch Beat to Artist
              </SecondaryButton>
              <SecondaryButton
                disabled={!legalAccepted || legalStatus === "saving"}
                onClick={() => handleBeatLegalAction("send_to_dj_mix")}
                className={legalAccepted ? "" : "pointer-events-none opacity-40"}
              >
                <Radio className="h-4 w-4" /> Send to DJ Mix
              </SecondaryButton>
              <SecondaryButton>
                <Activity className="h-4 w-4" /> Create Producer Station
              </SecondaryButton>
            </div>
          </GlassCard>
        </div>

        <div className="px-4 sm:px-6 lg:px-10">
          <LegalAcceptanceGroup
            config={LEGAL_ACCEPTANCE_FLOWS.producer_beat_publish}
            values={legalValues}
            onChange={setLegalValues}
            status={legalStatus}
            statusMessage={legalMessage}
          />
        </div>

        <div className="px-4 sm:px-6 lg:px-10 grid grid-cols-2 gap-3">
          <SecondaryButton
            onClick={() => onOpenBroadcastStudio?.("builder")}
            className="py-3 text-xs font-bold"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-300" /> Create Producer Spotlight
          </SecondaryButton>
          <SecondaryButton
            onClick={() => onOpenBroadcastStudio?.("builder")}
            className="py-3 text-xs font-bold"
          >
            <Volume2 className="h-3.5 w-3.5 text-cyan-300" /> Submit Beats To A Show
          </SecondaryButton>
        </div>

        <div className="px-4 sm:px-6 lg:px-10">
          <SegmentedTabs
            tabs={[
              { id: "beats", label: "Beat Catalog", count: producerBeats.length },
              { id: "packs", label: "Beat Packs", count: BEAT_PACKS.length },
              { id: "collabs", label: "Collabs", count: COLLABORATION_REQUESTS.length },
              { id: "matches", label: "Matches", count: ARTIST_MATCH_SUGGESTIONS.length },
            ]}
            activeTab={tab}
            onTabChange={(next) => setTab(next as ProducerHubTab)}
          />
        </div>

        {tab === "beats" && (
          <div className="px-4 sm:px-6 lg:px-10">
            <ContentFeelAnalysisPanel
              profile={beatContentFeel.profile}
              status={beatContentFeel.status}
              onRun={beatContentFeel.run}
            />
          </div>
        )}

        {tab === "beats" && (
          <div className="grid gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-10">
            {BEATS.map((beat) => (
              <BeatCard
                key={beat.id}
                title={beat.title}
                producerName={beat.producerName}
                producerAvatar={beat.producerAvatar}
                artwork={beat.artwork}
                bpm={beat.bpm}
                musicalKey={beat.key}
                mood={beat.mood}
                plays={beat.plays}
                onClick={() =>
                  playItem(beatToPlaybackItem(beat), {
                    source: {
                      id: `producer-${beat.producerId}`,
                      type: "producer_beat",
                      label: "Beat",
                      title: `${beat.producerName} Beat Catalog`,
                      subtitle: `${beat.bpm} BPM - ${beat.key}`,
                      image: beat.artwork,
                    },
                  })
                }
              />
            ))}
          </div>
        )}

        {tab === "packs" && (
          <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
            {BEAT_PACKS.map((pack) => (
              <GlassCard key={pack.id} className="p-4">
                <div className="flex gap-3">
                  <img src={pack.artwork} alt="" className="h-24 w-24 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-base font-bold text-white">{pack.title}</div>
                        <div className="mt-1 text-xs text-white/50">
                          {pack.beatCount} beats - {pack.theme}
                        </div>
                      </div>
                      <Package className="h-5 w-5 text-purple-300" />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-white/70">{pack.description}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-white/50">
                        {pack.downloads.toLocaleString()} downloads
                      </span>
                      <button className="font-semibold text-cyan-300">Manage Pack</button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {tab === "collabs" && (
          <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-10">
            <div className="space-y-3">
              {COLLABORATION_REQUESTS.map((request) => (
                <GlassCard key={request.id} className="p-4">
                  <div className="flex gap-3">
                    <img
                      src={request.from.avatar}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-white">{request.from.name}</div>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase text-white/60">
                          {request.status}
                        </span>
                      </div>
                      <div className="text-xs capitalize text-purple-300">
                        {request.type} request
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-white/70">
                        {request.message}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <SecondaryButton className="px-3 py-2 text-xs">
                          <Handshake className="h-3.5 w-3.5" /> Accept
                        </SecondaryButton>
                        <SecondaryButton className="px-3 py-2 text-xs">
                          <Send className="h-3.5 w-3.5" /> Send Beat Pack
                        </SecondaryButton>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
            <GlassCard className="p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Radio className="h-4 w-4 text-cyan-300" /> DJ Mix Opportunities
              </div>
              <div className="space-y-2">
                {DJ_OPPORTUNITIES.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] p-3"
                  >
                    <div className="text-sm font-semibold text-white">{opportunity.show}</div>
                    <div className="text-xs text-white/50">
                      {opportunity.dj} - {opportunity.station}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <button
                        onClick={() => addToQueue(beatToPlaybackItem(BEATS[0]))}
                        className="text-cyan-300 hover:text-white"
                      >
                        {opportunity.need}
                      </button>
                      <span className="text-white/50">
                        {(opportunity.audience / 1000).toFixed(1)}K est.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {tab === "matches" && (
          <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-3 lg:px-10">
            {ARTIST_MATCH_SUGGESTIONS.map((match) => (
              <GlassCard key={match.id} className="p-4">
                <div className="flex items-center gap-3">
                  <img src={match.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white">{match.artist}</div>
                    <div className="text-xs text-cyan-300">{match.match}% match</div>
                  </div>
                  <Users className="h-5 w-5 text-purple-300" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{match.reason}</p>
                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-sm font-semibold text-purple-100">
                  Pitch Beat <ArrowRight className="h-4 w-4" />
                </button>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </AccessGate>
  );
};

export default ProducerHub;
