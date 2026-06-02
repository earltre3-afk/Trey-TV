import React, { useState, useMemo, useEffect } from "react";
import {
  Radio,
  Sparkles,
  ChevronRight,
  Lock,
  CheckCircle,
  Send,
  User,
  Shield,
  Users,
  Music,
  Mic2,
  Disc,
  Calendar,
  Flame,
  UploadCloud,
  Layers,
  AlertCircle,
  Megaphone,
  Play,
  RotateCcw,
  Check,
  Plus,
  Globe,
  Settings,
  X,
} from "lucide-react";
import { TopBar, GlassCard, PrimaryButton, SecondaryButton, Chip, Waveform } from "../ui";
import { ACTIVE_USER, IMG, TRACKS, ALL_STATIONS, type RadioShow } from "../data";
import { ShowBuilder } from "./ShowBuilder";
import { LiveShowConsole } from "./LiveShowConsole";
import { AccessGate, PrescriptionRail } from "../auth/components";
import { LegalAcceptanceGroup } from "../legal/LegalPrimitives";
import { generateShowPlan } from "../showPlan";
import { toast } from "sonner";
import { goLive, endLive } from "../tradioLiveService";
import { useTradioLiveRoom } from "../useTradioLiveRoom";
import { useTradioLiveInteraction } from "../useTradioLiveInteraction";
import { useTradioCallers } from "../useTradioCallers";
import {
  createLegalAcceptanceValues,
  isLegalFlowAccepted,
  LEGAL_ACCEPTANCE_FLOWS,
  recordLegalFlowAcceptance,
  type LegalAcceptanceValues,
} from "../legal/legalAcceptanceConfig";

// TypeScript definitions
export type BroadcastRole = "fan" | "artist" | "producer" | "dj" | "admin";
export type BroadcastAccessStatus = "Cleared" | "Pending" | "Invite-Only";

export interface BroadcastShowType {
  id: string;
  title: string;
  description: string;
  allowedRole: string;
  setupTime: string;
  tags: string[];
  icon: React.ReactNode;
}

export interface BroadcastDraft {
  id: string;
  title: string;
  type: string;
  lastEdited: string;
  completion: number;
}

export interface ScheduledBroadcast {
  id: string;
  title?: string;
  dateTime: string;
  station: string;
  type: string;
  host: string;
  status: "scheduled" | "live" | "replay";
}

interface Props {
  onBack: () => void;
  initialTab?: string;
}

const SHOW_TYPES: BroadcastShowType[] = [
  {
    id: "artist-show",
    title: "Artist Radio Show",
    description:
      "Host your own official broadcast lane. Blend tracks, share exclusive commentary, and talk directly to listeners.",
    allowedRole: "Artist / Admin",
    setupTime: "10-15 mins",
    tags: ["Live", "Scheduled", "Replayable"],
    icon: <Mic2 className="h-5 w-5 text-purple-300" />,
  },
  {
    id: "release-premiere",
    title: "Release Premiere Hour",
    description:
      "Coordinate a high-status first-listen drop. Invite fan chats, queue stems, and bundle pre-saves in real-time.",
    allowedRole: "Artist / Admin",
    setupTime: "5-10 mins",
    tags: ["Live Only", "Pinned"],
    icon: <Radio className="h-5 w-5 text-fuchsia-300 animate-pulse" />,
  },
  {
    id: "dj-mix",
    title: "DJ Live Mix",
    description:
      "Stream structured DJ sets, beat blends, and live request blocks with animated interactive VU level feedback.",
    allowedRole: "DJ / Admin",
    setupTime: "15-20 mins",
    tags: ["Live", "Replayable"],
    icon: (
      <Disc className="h-5 w-5 text-cyan-300 animate-spin" style={{ animationDuration: "4s" }} />
    ),
  },
  {
    id: "producer-spotlight",
    title: "Producer Spotlight",
    description:
      "Upload loops or full beats. Invite artists to pitch vocals or save stems in a themed beat showcase session.",
    allowedRole: "Producer / Admin",
    setupTime: "10 mins",
    tags: ["Scheduled", "Replayable"],
    icon: (
      <Sparkles
        className="h-5 w-5 text-purple-300 animate-bounce"
        style={{ animationDuration: "3s" }}
      />
    ),
  },
  {
    id: "fan-request",
    title: "Fan Request Hour",
    description:
      "Unlock crowdsourced radio segments. Fans submit requests and vote on live chat queues dynamically.",
    allowedRole: "DJ / Admin",
    setupTime: "5 mins",
    tags: ["Live Only"],
    icon: <Users className="h-5 w-5 text-cyan-300" />,
  },
  {
    id: "songwars-promo",
    title: "Song Wars Pre-Show",
    description:
      "Set round constraints, introduce competing artists, preview battle tracks, and trigger fan voting.",
    allowedRole: "DJ / Admin / Owner",
    setupTime: "15 mins",
    tags: ["Live Only", "Official Status"],
    icon: <Flame className="h-5 w-5 text-fuchsia-400" />,
  },
];

const INITIAL_DRAFTS: BroadcastDraft[] = [
  {
    id: "dr-1",
    title: "Late Night Chill with Jordan",
    type: "Artist Radio Show",
    lastEdited: "2 hours ago",
    completion: 75,
  },
  {
    id: "dr-2",
    title: "6AM Thoughts Premiere Block",
    type: "Release Premiere",
    lastEdited: "Yesterday",
    completion: 40,
  },
];

const INITIAL_SCHEDULED: ScheduledBroadcast[] = [
  {
    id: "sch-1",
    dateTime: "Tonight at 9:00 PM",
    station: "Trey Trizzy Radio",
    type: "Artist Radio Show",
    host: "Trey Trizzy",
    status: "scheduled",
  },
  {
    id: "sch-2",
    dateTime: "Tomorrow at 4:00 PM",
    station: "After Dark R&B",
    type: "DJ Live Mix",
    host: "Mila Rain",
    status: "scheduled",
  },
  {
    id: "sch-3",
    dateTime: "Live Now",
    station: "Trey TV Main Layer",
    type: "Song Wars Pre-Show",
    host: "Jordan Host",
    status: "live",
  },
];

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400/40";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="space-y-2">
    <span className="block text-[10px] font-black uppercase tracking-widest text-white/45">
      {label}
    </span>
    {children}
  </label>
);

export const BroadcastStudioGateway: React.FC<Props> = ({ onBack, initialTab }) => {
  // Inside the AccessGate the user is cleared; default to artist tooling.
  const role = "artist" as BroadcastRole;
  const [accessStatus, setAccessStatus] = useState<BroadcastAccessStatus>("Cleared");
  const [applied, setSavedApplied] = useState(false);
  const [activeLiveShow, setActiveLiveShow] = useState<RadioShow | null>(null);
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const live = useTradioLiveRoom({
    active: Boolean(liveSessionId),
    role: "host",
    sessionId: liveSessionId,
  });
  const interaction = useTradioLiveInteraction({ sessionId: liveSessionId });
  const callers = useTradioCallers({ sessionId: liveSessionId });

  // Stepper show builder flow states
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isBuildingShow, setIsBuildingShow] = useState(false);

  // Guided flow fields
  const [selectedShowType, setSelectedShowType] = useState<string>("artist-show");
  const [showName, setShowName] = useState("");
  const [showTagline, setShowTagline] = useState("");
  const [showHost, setShowHost] = useState("Trey Trizzy");
  const [showStation, setShowStation] = useState("station-trey-trizzy");
  const [showMood, setShowMood] = useState("late-night");
  const [showGenre, setShowGenre] = useState("R&B / Trap Soul");
  const [showAudience, setShowAudience] = useState("fans of premieres and discovery");
  const [showArt, setShowArt] = useState(IMG.aiSphere);

  // Structures List
  const [seqSegments, setSeqSegments] = useState<string[]>([
    "intro",
    "music-block",
    "host-talk",
    "outro",
  ]);
  // Selected Music
  const [addedMusic, setAddedMusic] = useState<string[]>(["Midnight Velvet", "6AM Thoughts"]);
  // Selected Interactions
  const [addedInteractions, setAddedInteractions] = useState<string[]>([
    "Live Chat",
    "Emoji Reactions",
  ]);
  // Selected Schedule / Publish options
  const [scheduleOpt, setScheduleOpt] = useState<string>("live");

  // Application inputs
  const [applyRole, setApplyRole] = useState<"Artist" | "Producer" | "DJ" | "Host">("Artist");
  const [applyMotivation, setApplyMotivation] = useState("");
  const [applyLink, setApplyLink] = useState("");
  const [broadcastLegalValues, setBroadcastLegalValues] = useState<LegalAcceptanceValues>(() =>
    createLegalAcceptanceValues("dj_broadcast_schedule"),
  );
  const [broadcastLegalStatus, setBroadcastLegalStatus] = useState<
    "idle" | "saving" | "saved" | "fallback" | "error"
  >("idle");
  const [broadcastLegalMessage, setBroadcastLegalMessage] = useState<string | null>(null);
  const [accessLegalValues, setAccessLegalValues] = useState<LegalAcceptanceValues>(() =>
    createLegalAcceptanceValues("role_access_request"),
  );
  const [accessLegalStatus, setAccessLegalStatus] = useState<
    "idle" | "saving" | "saved" | "fallback" | "error"
  >("idle");
  const [accessLegalMessage, setAccessLegalMessage] = useState<string | null>(null);
  const broadcastLegalAccepted = isLegalFlowAccepted("dj_broadcast_schedule", broadcastLegalValues);
  const accessLegalAccepted = isLegalFlowAccepted("role_access_request", accessLegalValues);

  // Drafts & Schedules list
  const [drafts, setDrafts] = useState<BroadcastDraft[]>(INITIAL_DRAFTS);
  const [scheduled, setScheduled] = useState<ScheduledBroadcast[]>(INITIAL_SCHEDULED);

  // Open the builder when deep-linked into it (incl. the 'golive' shortcut,
  // which lands on the builder with GO LIVE ready since ShowBuilder always
  // seeds a default plan).
  useEffect(() => {
    if (initialTab === "builder" || initialTab === "golive") {
      setIsBuildingShow(true);
    }
  }, [initialTab]);

  // Stepper Steps list
  const steps = [
    { title: "Show Type", desc: "Select programming" },
    { title: "Identity", desc: "Set cover & mood" },
    { title: "Structure", desc: "Sequence blocks" },
    { title: "Add Music", desc: "Queue tracks & stems" },
    { title: "Interaction", desc: "Enable fan toolkits" },
    { title: "Schedule", desc: "Go live or book" },
    { title: "Rundown", desc: "Readiness checklist" },
  ];

  // Helper arrays for Stepper selections
  const availableSegments = [
    {
      id: "intro",
      label: "Opening Intro Script",
      duration: 180,
      icon: <Mic2 className="h-4 w-4" />,
    },
    {
      id: "music-block",
      label: "Premium Music Block",
      duration: 480,
      icon: <Music className="h-4 w-4" />,
    },
    {
      id: "host-talk",
      label: "Host Commentary Talk",
      duration: 120,
      icon: <Mic2 className="h-4 w-4" />,
    },
    {
      id: "producer-spotlight",
      label: "Producer Spotlight Show",
      duration: 240,
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      id: "artist-premiere",
      label: "Artist Premiere Hour",
      duration: 300,
      icon: <Radio className="h-4 w-4" />,
    },
    {
      id: "fan-request",
      label: "Fan Request Segment",
      duration: 360,
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "commercial",
      label: "Ad/Commercial Break",
      duration: 60,
      icon: <Megaphone className="h-4 w-4" />,
    },
    {
      id: "outro",
      label: "Closing Message Outro",
      duration: 180,
      icon: <Calendar className="h-4 w-4" />,
    },
  ];

  const availableMusic = [
    "Midnight Velvet",
    "6AM Thoughts",
    "Persuasion",
    "City Lights",
    "After Hours",
    "Neon Heartbreak",
    "Producer Beat #1",
    "Memphis Drum Loop",
  ];
  const availableInteractions = [
    "Live Chat",
    "Fan Audio Requests",
    "Live Audience Polls",
    "Real-time Emoji Reactions",
    "GIF Chat via Giphy",
    "Top Fan Spotlight",
    "Tracklist Voting",
  ];

  const toggleSelection = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string,
  ) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessLegalAccepted || accessLegalStatus === "saving") return;
    setAccessLegalStatus("saving");
    const result = await recordLegalFlowAcceptance("role_access_request", accessLegalValues, {
      requestType: "broadcast",
      applyRole,
      applyLink,
    });
    setAccessLegalStatus(result.source === "supabase" ? "saved" : "fallback");
    setAccessLegalMessage(
      result.source === "supabase" ? "Access acknowledgement saved." : result.warning,
    );
    setSavedApplied(true);
    setAccessStatus("Pending");
  };

  const handleCreateNewShow = () => {
    setIsBuildingShow(true);
    setCurrentStep(0);
    setShowName("");
    setShowTagline("");
  };

  const handleCompleteShowBuild = async () => {
    if (!broadcastLegalAccepted || broadcastLegalStatus === "saving") return;
    setBroadcastLegalStatus("saving");
    const result = await recordLegalFlowAcceptance("dj_broadcast_schedule", broadcastLegalValues, {
      referenceId: showName || "mock-broadcast-show",
      showName,
      showHost,
      showStation,
      scheduleOpt,
      selectedShowType,
    });
    setBroadcastLegalStatus(result.source === "supabase" ? "saved" : "fallback");
    setBroadcastLegalMessage(
      result.source === "supabase" ? "Broadcast acknowledgement saved." : result.warning,
    );

    // Generate scheduled broadcast or template
    const newBroadcast: ScheduledBroadcast = {
      id: `sch-added-${Date.now()}`,
      dateTime: scheduleOpt === "live" ? "Live Now" : "Scheduled: Jun 12 at 8PM",
      station: ALL_STATIONS.find((s) => s.id === showStation)?.title || "My Station",
      type: SHOW_TYPES.find((t) => t.id === selectedShowType)?.title || "Artist Radio Show",
      host: showHost,
      status: scheduleOpt === "live" ? "live" : "scheduled",
    };

    setScheduled([newBroadcast, ...scheduled]);
    setIsBuildingShow(false);
  };

  return (
    <AccessGate
      capability="create-broadcast"
      title="Broadcast access required"
      message="Apply for Broadcast Access or switch to a cleared Artist, Producer, DJ, or Admin mode to build premium Tradio shows."
      ctaType="broadcast"
    >
      <div className="space-y-8 pb-12 lg:space-y-10">
        <div className="px-4 sm:px-6 lg:px-10 pt-[max(2rem,env(safe-area-inset-top))]">
          <PrescriptionRail
            title="Prescribe show segments"
            subtitle="Mock broadcast prescriptions can later recommend show segments, music blocks, and fan interaction pacing."
          />
        </div>

        <TopBar title="Tradio Broadcast Suite" showBack onBack={onBack} />

        {activeLiveShow ? (
          <LiveShowConsole
            show={activeLiveShow}
            live={live}
            interaction={interaction}
            callers={callers.calls}
            sessionId={liveSessionId}
            onEndLive={async () => {
              if (liveSessionId)
                await endLive({
                  sessionId: liveSessionId,
                  showId: activeLiveShow.id ?? null,
                  peakListeners: live.listenerCount,
                });
              live.leave();
              setLiveSessionId(null);
              setActiveLiveShow(null);
              setIsBuildingShow(false);
            }}
          />
        ) : isBuildingShow ? (
          <ShowBuilder
            onGoLive={async (show) => {
              const { session, error } = await goLive({
                showId: show.id ?? null,
                title: show.title,
                hostName: show.djName ?? "Host",
              });
              if (error || !session) {
                toast.error(error ?? "Could not go live.");
                return;
              }
              setLiveSessionId(session.id);
              setActiveLiveShow(show);
              toast.success(`Broadcasting LIVE with "${show.title}"!`);
            }}
            onBack={() => setIsBuildingShow(false)}
          />
        ) : (
          /* BROADCAST GATEWAY SCREEN */
          <div className="px-4 sm:px-6 lg:px-10 space-y-8">
            {/* 1. Premium Hero Section */}
            <GlassCard
              glow
              className="relative rounded-[2.5rem] border-[0.5px] border-purple-500/15 bg-gradient-to-br from-[#1A0C2B]/55 via-[#060412]/80 to-black/95 p-8 md:p-12 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
            >
              <div className="absolute top-0 right-0 h-96 w-96 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-72 w-72 bg-cyan-600/10 blur-[110px] rounded-full pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:35px_30px] opacity-25 pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/40 bg-purple-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)] mb-4">
                    <Shield className="h-3.5 w-3.5" /> Invite-Only Broadcast Access
                  </span>
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                    Tradio{" "}
                    <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      Broadcast Suite
                    </span>
                  </h1>
                  <p className="mt-4 text-sm md:text-base text-white/60 leading-relaxed font-medium">
                    "You are not just creating a post. You are programming a music experience." Step
                    into our private, high-status broadcast gateway and control room.
                  </p>

                  {/* Dynamically Render CTA based on active access status */}
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {accessStatus === "Cleared" ? (
                      <>
                        <button
                          onClick={handleCreateNewShow}
                          className="rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-500 text-white px-6 py-3 text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-[0_0_20px_rgba(176,38,255,0.5)]"
                        >
                          Build A Show
                        </button>
                        <button
                          onClick={() => {
                            setSelectedShowType("release-premiere");
                            handleCreateNewShow();
                          }}
                          className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold text-white/80 hover:bg-white/10 active:scale-95 transition-all"
                        >
                          Schedule Premiere
                        </button>
                      </>
                    ) : accessStatus === "Pending" ? (
                      <div className="rounded-2xl border border-yellow-400/35 bg-yellow-500/10 px-4 py-3 text-xs font-semibold text-yellow-300 animate-pulse">
                        Broadcast Clearance Pending Approval
                      </div>
                    ) : (
                      <a
                        href="#apply-upgrade"
                        className="rounded-full bg-purple-500/15 border border-purple-500/35 hover:bg-purple-500/25 text-purple-200 px-6 py-3 text-xs font-black uppercase tracking-widest active:scale-95 transition-all text-center"
                      >
                        Apply For Access
                      </a>
                    )}
                  </div>
                </div>

                {/* 2. Access Card Detail */}
                <GlassCard className="w-full lg:w-[320px] p-5 border-white/10 bg-black/40 backdrop-blur-2xl relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_15px_30px_rgba(0,0,0,0.5)] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={ACTIVE_USER.avatar}
                        alt=""
                        className="h-10 w-10 rounded-xl object-cover border border-white/15"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{ACTIVE_USER.name}</div>
                        <div className="text-[10px] text-white/50">{ACTIVE_USER.modeLabel}</div>
                      </div>
                    </div>
                    {role !== "fan" && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40">Access Level:</span>
                      <span className="font-mono font-bold text-purple-300 uppercase tracking-widest">
                        {role.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40">Status:</span>
                      <span
                        className={`font-semibold rounded-full px-2 py-0.5 text-[9px] font-mono tracking-wider ${
                          accessStatus === "Cleared"
                            ? "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20"
                            : "bg-yellow-400/10 text-yellow-300 border border-yellow-400/20"
                        }`}
                      >
                        {accessStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40">Host Rights:</span>
                      <span className="text-white/80 font-bold">
                        {role === "fan" ? "Guest Only" : "Official Tradio Host"}
                      </span>
                    </div>
                  </div>

                  {role !== "fan" && (
                    <div className="text-[10px] bg-cyan-400/10 border border-cyan-400/20 p-2 rounded-xl text-cyan-200 leading-snug">
                      <span className="font-bold">Cleared Categories:</span>{" "}
                      {role === "artist"
                        ? "Shows, Premieres, Listening Parties"
                        : role === "producer"
                          ? "Spotlights, Beat Battles"
                          : "Mixes, Replays, Request Hours"}
                    </div>
                  )}
                </GlassCard>
              </div>
            </GlassCard>

            {/* 3. Show Type Selector */}
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">Programming Options</h3>
                <p className="text-xs text-white/50">
                  Each type has customized segment structures, timers, and widget presets.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {SHOW_TYPES.map((t) => {
                  const isLocked =
                    role === "fan" ||
                    (role === "artist" && t.id === "dj-mix") ||
                    (role === "producer" && t.id === "release-premiere");
                  return (
                    <GlassCard
                      key={t.id}
                      className={`p-4 flex flex-col justify-between hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.02] transition-all duration-300 relative group/card ${isLocked ? "opacity-50" : ""}`}
                    >
                      {isLocked && (
                        <div className="absolute top-2 right-2 flex items-center justify-center h-6 w-6 rounded-full bg-black/60 border border-white/10 text-white/50">
                          <Lock className="h-3 w-3" />
                        </div>
                      )}

                      <div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                          {t.icon}
                        </div>
                        <h4 className="mt-4 font-bold text-white text-base">{t.title}</h4>
                        <p className="mt-1 text-xs text-white/60 leading-relaxed min-h-[48px]">
                          {t.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono font-bold text-purple-300">
                        <span>{t.setupTime}</span>
                        <span className="rounded-full bg-white/[0.04] border border-white/5 px-2 py-0.5 text-white/45">
                          {t.allowedRole}
                        </span>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>

            {/* 4. AI Show Builder Card (Dual Layout) */}
            <GlassCard
              glow
              className="p-5 border border-cyan-500/10 bg-gradient-to-r from-[#0C1A2D]/40 to-transparent"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10">
                    <Sparkles className="h-6 w-6 text-cyan-300 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                      Build With Tradio AI <Chip label="Premium" selected />
                    </h4>
                    <p className="text-xs text-white/60 mt-1 max-w-xl leading-relaxed">
                      Let Tradio's generative music engine organize your segment timeline, compile
                      recommended music tracks based on your mood, and write a ready-to-read AI
                      speech teleprompter.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsBuildingShow(true);
                  }}
                  disabled={role === "fan"}
                  className="rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:brightness-110 text-white font-bold px-6 py-2.5 text-xs uppercase tracking-widest active:scale-95 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] whitespace-nowrap disabled:opacity-30 disabled:pointer-events-none"
                >
                  Start AI Show Plan
                </button>
              </div>
            </GlassCard>

            {/* 5. Existing Drafts & 6. Scheduled Shows (Side by side) */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Drafts Block */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white/45 uppercase tracking-widest font-mono">
                    My Active Drafts
                  </h3>
                  {role !== "fan" && (
                    <button
                      onClick={handleCreateNewShow}
                      className="text-xs text-purple-300 font-bold hover:text-white transition-all flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> New Show
                    </button>
                  )}
                </div>
                <div className="space-y-2.5">
                  {drafts.map((d) => (
                    <GlassCard
                      key={d.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:border-white/10 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">{d.title}</div>
                        <div className="text-[10px] text-white/45 mt-0.5">
                          {d.type} • Edited {d.lastEdited}
                        </div>

                        {/* Percent progress bar */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500"
                              style={{ width: `${d.completion}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-purple-300 font-bold">
                            {d.completion}%
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const matchedType =
                            d.type === "Artist Radio Show" ? "artist-show" : "release-premiere";
                          setSelectedShowType(matchedType);
                          setShowName(d.title);
                          setIsBuildingShow(true);
                        }}
                        disabled={role === "fan"}
                        className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-500/10 disabled:opacity-20"
                      >
                        Continue
                      </button>
                    </GlassCard>
                  ))}
                </div>
              </div>

              {/* Scheduled Block */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-white/45 uppercase tracking-widest font-mono">
                  My Upcoming Schedule
                </h3>
                <div className="space-y-2.5">
                  {scheduled.map((s) => (
                    <GlassCard key={s.id} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-white text-sm truncate">
                            {s.title || s.type}
                          </div>
                          {s.status === "live" && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-red-400">
                              Live
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/45 mt-0.5">
                          {s.dateTime} • {s.station}
                        </div>
                        <div className="text-[10px] text-cyan-300 font-bold mt-1.5">
                          Host: @{s.host}
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          const showFromTemplate = generateShowPlan({
                            showName: s.title || s.type,
                            showLength: 60,
                            showMood: "late-night",
                            targetAudience: "broad audience",
                            hostTone: "cinematic",
                            musicSource: "artist station plus Tradio catalog",
                            selectedStation: "station-trey-trizzy",
                            commercialBreaks: 2,
                            fanInteractionStyle: "balanced",
                            includeProducerBeatSpotlight: true,
                            includeArtistPremiere: true,
                            includeListenerRequests: true,
                            saveAs: "live show",
                          });
                          const { session } = await goLive({
                            showId: null,
                            title: showFromTemplate.title,
                            hostName: showFromTemplate.djName ?? "Host",
                          });
                          if (session) setLiveSessionId(session.id);
                          setActiveLiveShow(showFromTemplate);
                          toast.success(`Connected to scheduled live broadcast desk!`);
                        }}
                        className="rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-1.5 text-xs font-semibold text-white/70 hover:text-white"
                      >
                        Manage
                      </button>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </div>

            {/* 7. Broadcast Access Upgrade Application (Hidden for Admin/DJ/Cleared roles to avoid clutter) */}
            {role === "fan" && (
              <div id="apply-upgrade" className="pt-4 scroll-mt-24">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white">Unlock Broadcast Suite</h3>
                  <p className="text-xs text-white/50">
                    Apply for cleared broadcast rights inside the Trey TV music universe.
                  </p>
                </div>
                <GlassCard className="p-5 border-white/10 bg-black/30">
                  {applied ? (
                    <div className="py-8 text-center space-y-3">
                      <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto animate-pulse" />
                      <h4 className="text-base font-black text-white">
                        Cleared Application Submitted
                      </h4>
                      <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
                        Your request is currently being prioritized by station directors. Watch your
                        notifications tab for official host credentials.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitApplication} className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Choose Broadcast Role">
                          <select
                            className={inputClass}
                            value={applyRole}
                            onChange={(e) =>
                              setApplyRole(e.target.value as "Artist" | "Producer" | "DJ" | "Host")
                            }
                          >
                            <option value="Artist">Verified Artist</option>
                            <option value="Producer">Verified Producer</option>
                            <option value="DJ">Verified DJ / Remix Master</option>
                            <option value="Host">Tradio Guest Host</option>
                          </select>
                        </Field>
                        <Field label="Station / Artist Profile Link">
                          <input
                            className={inputClass}
                            value={applyLink}
                            onChange={(e) => setApplyLink(e.target.value)}
                            placeholder="e.g. tradio.fm/station/jordan"
                            required
                          />
                        </Field>
                      </div>
                      <Field label="Why do you want to host on Tradio?">
                        <textarea
                          className={`${inputClass} h-24 resize-none`}
                          value={applyMotivation}
                          onChange={(e) => setApplyMotivation(e.target.value)}
                          placeholder="Explain your show concept, genre focus, and release lineup plans..."
                          required
                        />
                      </Field>
                      <LegalAcceptanceGroup
                        config={LEGAL_ACCEPTANCE_FLOWS.role_access_request}
                        values={accessLegalValues}
                        onChange={setAccessLegalValues}
                        status={accessLegalStatus}
                        statusMessage={accessLegalMessage}
                        compact
                      />
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={!accessLegalAccepted || accessLegalStatus === "saving"}
                          className={`rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.3)] ${
                            accessLegalAccepted
                              ? "bg-purple-500 hover:bg-purple-600 text-white"
                              : "border border-white/10 bg-white/5 text-white/25"
                          }`}
                        >
                          Submit Broadcast Request
                        </button>
                      </div>
                    </form>
                  )}
                </GlassCard>
              </div>
            )}
          </div>
        )}
      </div>
    </AccessGate>
  );
};

export default BroadcastStudioGateway;
