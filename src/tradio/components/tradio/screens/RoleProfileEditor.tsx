import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Check,
  CheckCircle,
  AlertCircle,
  Save,
  Globe,
  Lock,
  MapPin,
  Music,
  Radio,
  FileText,
  Volume2,
  Plus,
  ChevronLeft,
  Activity,
  Image as ImageIcon,
} from "lucide-react";
import { GlassCard, PrimaryButton, SecondaryButton } from "../ui";
import { LegalAcceptanceGroup } from "../legal/LegalPrimitives";
import {
  createLegalAcceptanceValues,
  isLegalFlowAccepted,
  LEGAL_ACCEPTANCE_FLOWS,
  recordLegalFlowAcceptance,
  type LegalAcceptanceValues,
} from "../legal/legalAcceptanceConfig";
import type { TradioIdentity } from "../auth/types";
import type { RoleProfileType } from "../auth/roleProfile";
import {
  getCreatorProfileDraft,
  updateCreatorProfileDraftLocal,
  saveCreatorProfileDraft,
  validateCreatorProfileDraft,
  publishCreatorProfileMock,
} from "../auth/creatorProfileDraftService";
import type {
  CreatorProfileSpecificDraft,
  CreatorProfileValidationResult,
} from "../auth/creatorProfileTypes";

const GENRE_OPTIONS = [
  "Soul",
  "Trap",
  "Jazz Rap",
  "R&B",
  "Lo-Fi",
  "Hip Hop",
  "Phonk",
  "Boom Bap",
  "Cloud Rap",
];
const MOOD_OPTIONS = [
  "Chill",
  "Energetic",
  "Focused",
  "Emotional",
  "Hype",
  "Dark",
  "Moody",
  "Uplifting",
];

const SPECIALTY_OPTIONS: Record<RoleProfileType, string[]> = {
  artist: ["Vocalist", "Lyricist", "Songwriter", "Performer", "Recording Artist"],
  producer: [
    "Mixing",
    "Mastering",
    "Sound Design",
    "Sample Maker",
    "Drum Programming",
    "Arrangement",
  ],
  dj: ["Radio Host", "Turntablist", "Club DJ", "Curator", "Live Host", "Mix Engineer"],
};

const SHOW_TYPE_OPTIONS = [
  "Live Request Hour",
  "Late Night Vibe",
  "Weekly Countdown",
  "Artist Spotlight",
  "Producer Beat Clash",
  "Underground Discovery",
];

interface RoleProfileEditorProps {
  role: RoleProfileType;
  identity: TradioIdentity;
  onClose: () => void;
}

export const RoleProfileEditor: React.FC<RoleProfileEditorProps> = ({
  role,
  identity,
  onClose,
}) => {
  // Fetch initial draft from persistence
  const [draft, setDraft] = useState<CreatorProfileSpecificDraft>(() =>
    getCreatorProfileDraft(role, identity),
  );
  const [validation, setValidation] = useState<CreatorProfileValidationResult>(() =>
    validateCreatorProfileDraft(role, draft),
  );

  // UX Interaction State
  const [activeTab, setActiveTab] = useState<"info" | "sound" | "role">("info");
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState("");
  const [isPublishedSuccess, setIsPublishedSuccess] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [legalValues, setLegalValues] = useState<LegalAcceptanceValues>(() =>
    createLegalAcceptanceValues("creator_profile_publish"),
  );
  const [legalStatus, setLegalStatus] = useState<
    "idle" | "saving" | "saved" | "fallback" | "error"
  >("idle");
  const [legalMessage, setLegalMessage] = useState<string | null>(null);

  // Sync validation when draft state modifies
  useEffect(() => {
    setValidation(validateCreatorProfileDraft(role, draft));
  }, [draft, role]);

  const updateField = (key: string, value: any) => {
    setDraft((prev) => updateCreatorProfileDraftLocal(prev, { [key]: value }));
  };

  const toggleArrayItem = (key: "genres" | "moods" | "specialties" | "showTypes", item: string) => {
    const currentArray = (draft.data as any)[key] || [];
    const isSelected = currentArray.includes(item);
    const updatedArray = isSelected
      ? currentArray.filter((x: string) => x !== item)
      : [...currentArray, item];
    updateField(key, updatedArray);
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    const result = saveCreatorProfileDraft(draft);
    setTimeout(() => {
      setIsSaving(false);
      if (result.success) {
        setSaveToast(true);
        setTimeout(() => setSaveToast(false), 2000);
        // Sync original draft with local persistence update
        setDraft(result.draft!);
      }
    }, 800);
  };

  const legalAccepted = isLegalFlowAccepted("creator_profile_publish", legalValues);

  const handlePublish = async () => {
    if (!validation.canPublish || !legalAccepted || legalStatus === "saving") return;

    setLegalStatus("saving");
    const result = await recordLegalFlowAcceptance("creator_profile_publish", legalValues, {
      referenceId: `${role}:${identity.public_profile_uid ?? identity.user_id}`,
      role,
      publicProfileUid: identity.public_profile_uid,
    });
    setLegalStatus(result.source === "supabase" ? "saved" : "fallback");
    setLegalMessage(
      result.source === "supabase" ? "Creator profile acknowledgement saved." : result.warning,
    );

    setIsPublishing(true);
    const steps = [
      "Validating acoustic sound signature...",
      "Mapping creative blueprint credentials...",
      "Formulating digital broadcast route...",
      "Registering discovery metadata nodes...",
      "Launching brand-new public Rx formula!",
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setPublishStep(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        // Complete published action
        const result = publishCreatorProfileMock(role, identity, draft);
        if (result.success) {
          setIsPublishedSuccess(true);
        }
        setIsPublishing(false);
      }
    }, 700);
  };

  const handleCloseAttempt = () => {
    if (draft.status === "dirty") {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  };

  const roleLabel = role === "artist" ? "Artist" : role === "producer" ? "Producer" : "DJ / Host";

  if (isPublishing) {
    return (
      <div className="fixed inset-0 z-50 bg-[#08060d] flex flex-col items-center justify-center text-center p-6 select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-black to-cyan-950/20" />
        {/* Holographic scanner laser */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-scanner-down pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center max-w-md">
          <div className="relative h-24 w-24 mb-8 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-purple-500 border-b-fuchsia-500 border-l-transparent animate-spin-fast" />
            <span className="absolute inset-[15%] rounded-full border border-b-cyan-400 border-l-purple-500 animate-spin-reverse" />
            <Activity className="h-8 w-8 text-cyan-300 animate-pulse" />
          </div>

          <h2 className="text-xl font-mono font-black uppercase tracking-[0.25em] text-white">
            Synthesizing Profile
          </h2>
          <div className="mt-4 px-6 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 font-mono text-xs animate-pulse min-h-[44px] flex items-center justify-center">
            {publishStep}
          </div>

          <div className="mt-8 w-44 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500 animate-shimmer-sweep w-3/4 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isPublishedSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-[#08060d] flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-black to-cyan-900/10 pointer-events-none" />
        <div className="absolute -top-32 -left-32 h-64 w-64 bg-gradient-to-br from-purple-600/20 to-transparent blur-[80px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 bg-gradient-to-tr from-cyan-500/20 to-transparent blur-[80px] pointer-events-none rounded-full" />

        <GlassCard
          glow
          className="max-w-md w-full p-8 space-y-6 relative border border-white/10 bg-black/80"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-2">
              Profile Published!
            </h2>
            <p className="text-xs text-white/65 max-w-sm leading-relaxed">
              Congratulations! Your official{" "}
              <strong className="text-purple-300 font-semibold">{roleLabel}</strong> blueprint is
              now active, indexed, and available for public discovery.
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#0d0914] p-4 text-left font-mono text-xs text-purple-200/90 space-y-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-white/45 uppercase text-[9px] tracking-widest font-black">
                Role Active
              </span>
              <span className="text-emerald-400 font-bold uppercase text-[9px] tracking-wider">
                LIVE
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/45">Display Name:</span>
              <span className="text-white font-bold">
                {role === "artist"
                  ? draft.data.artistName
                  : role === "producer"
                    ? draft.data.producerName
                    : draft.data.djName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/45">Public URL:</span>
              <span className="text-cyan-300 truncate pl-4">
                /tradio/{role}/{identity.public_profile_uid}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <PrimaryButton className="w-full" onClick={onClose}>
              <Globe className="h-4 w-4" /> Enter Creator Studio
            </PrimaryButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06040a] text-white flex flex-col pb-12 select-none relative">
      {/* Background soft gradients */}
      <div className="absolute top-0 right-0 h-[350px] w-full bg-gradient-to-b from-purple-950/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-[250px] w-full bg-gradient-to-t from-cyan-950/10 to-transparent pointer-events-none" />

      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4 border-b border-white/10 sm:px-6 lg:px-10 relative z-10 bg-black/40 backdrop-blur-xl">
        <button
          onClick={handleCloseAttempt}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/70 hover:text-white hover:border-white/25 active:scale-95 transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div>
          <div className="text-sm font-mono font-black uppercase tracking-[0.2em] text-white">
            Setup {roleLabel} Profile
          </div>
          <div className="text-[10px] text-white/40 text-center mt-0.5">
            Tuning your creative blueprint
          </div>
        </div>
        <div className="w-9 h-9 flex items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse-orb" />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-10 mt-6 grid gap-6 md:grid-cols-3 relative z-10 items-start">
        {/* Editor Form Columns (2/3 width) */}
        <div className="md:col-span-2 space-y-5">
          {/* Tab Selection */}
          <div className="flex rounded-xl bg-white/5 border border-white/10 p-1">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "info"
                  ? "bg-white/10 text-white shadow-md"
                  : "text-white/55 hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> General Info
            </button>
            <button
              onClick={() => setActiveTab("sound")}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "sound"
                  ? "bg-white/10 text-white shadow-md"
                  : "text-white/55 hover:text-white"
              }`}
            >
              <Music className="h-3.5 w-3.5" /> Sound Signatures
            </button>
            <button
              onClick={() => setActiveTab("role")}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "role"
                  ? "bg-white/10 text-white shadow-md"
                  : "text-white/55 hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Parameters
            </button>
          </div>

          <GlassCard className="p-6 space-y-5">
            {/* TAB 1: GENERAL INFO */}
            {activeTab === "info" && (
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-black text-purple-300 uppercase tracking-widest pl-1 border-b border-white/5 pb-2">
                  Profile Credentials
                </h3>

                {/* Creator Name Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                    {roleLabel} Display Name <span className="text-fuchsia-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={
                      role === "artist"
                        ? draft.data.artistName
                        : role === "producer"
                          ? draft.data.producerName
                          : draft.data.djName
                    }
                    onChange={(e) =>
                      updateField(
                        role === "artist"
                          ? "artistName"
                          : role === "producer"
                            ? "producerName"
                            : "djName",
                        e.target.value,
                      )
                    }
                    placeholder={`e.g. ${identity.display_name || "My Stage Name"}`}
                    className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-3 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                  />
                </div>

                {/* Creator Bio Area */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                    Creative Bio <span className="text-fuchsia-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={draft.data.bio || ""}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="Describe your sound, journey, and current blueprint Lane. (Min 10 characters)"
                    className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-3 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono resize-none leading-relaxed"
                  />
                  <div className="text-right text-[9px] font-mono text-white/30">
                    {(draft.data.bio || "").length} chars
                  </div>
                </div>

                {/* Location Inputs (City, Region) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 h-3.5 w-3.5 text-white/30" />
                      <input
                        type="text"
                        value={draft.data.city || ""}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="e.g. Memphis"
                        className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl pl-10 pr-3.5 py-3 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                      Region / State
                    </label>
                    <input
                      type="text"
                      value={draft.data.region || ""}
                      onChange={(e) => updateField("region", e.target.value)}
                      placeholder="e.g. TN"
                      className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-3 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Avatar / Banner links (Mock upload inputs) */}
                <div className="space-y-3.5 border-t border-white/5 pt-4">
                  <h4 className="text-[10px] font-mono font-black text-white/40 uppercase tracking-wider pl-1">
                    Media Visuals
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                        Profile Avatar Image Link
                      </label>
                      <div className="relative">
                        <ImageIcon className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-white/30" />
                        <input
                          type="text"
                          value={draft.data.avatar || ""}
                          onChange={(e) => updateField("avatar", e.target.value)}
                          placeholder="e.g. https://images.com/my-avatar.png"
                          className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                        Profile Banner Image Link
                      </label>
                      <div className="relative">
                        <ImageIcon className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-white/30" />
                        <input
                          type="text"
                          value={draft.data.banner || ""}
                          onChange={(e) => updateField("banner", e.target.value)}
                          placeholder="e.g. https://images.com/my-banner.png"
                          className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spotify-inspired Creator Pick / Artist Pick */}
                <div className="space-y-3.5 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-1.5 pl-1">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    <h4 className="text-[10px] font-mono font-black text-white/40 uppercase tracking-wider">
                      Creator Featured Pick (Spotify-Style Pinned Release)
                    </h4>
                  </div>
                  <p className="text-[10px] text-white/40 pl-1 leading-snug">
                    Pin a track, beat pack, or live show to the top of your profile with a custom
                    short message for your visitors.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                        Pick Type
                      </label>
                      <select
                        value={draft.data.artistPickType || "track"}
                        onChange={(e) => updateField("artistPickType", e.target.value)}
                        className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all font-mono"
                      >
                        <option value="track">Track Release</option>
                        <option value="beat">Beat Pack</option>
                        <option value="show">DJ Show / Broadcast</option>
                        <option value="album">Album / EP</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                        Featured Item Title
                      </label>
                      <input
                        type="text"
                        value={draft.data.artistPickTitle || ""}
                        onChange={(e) => updateField("artistPickTitle", e.target.value)}
                        placeholder="e.g. Midnight Velvet (Slowed & Reverb)"
                        className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                        Custom Creator Message
                      </label>
                      <input
                        type="text"
                        value={draft.data.artistPickMessage || ""}
                        onChange={(e) => updateField("artistPickMessage", e.target.value)}
                        placeholder="e.g. My new late night jam! Check it out!"
                        className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                        Cover Image / GIF URL
                      </label>
                      <input
                        type="text"
                        value={draft.data.artistPickImage || ""}
                        onChange={(e) => updateField("artistPickImage", e.target.value)}
                        placeholder="e.g. URL to static image or animated GIF"
                        className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Handles */}
                <div className="space-y-3.5 border-t border-white/5 pt-4">
                  <h4 className="text-[10px] font-mono font-black text-white/40 uppercase tracking-wider pl-1">
                    Social Handles
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                        Instagram Handle
                      </label>
                      <input
                        type="text"
                        value={draft.data.socialInstagram || ""}
                        onChange={(e) => updateField("socialInstagram", e.target.value)}
                        placeholder="e.g. treytrizzy"
                        className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                        TikTok Handle
                      </label>
                      <input
                        type="text"
                        value={draft.data.socialTiktok || ""}
                        onChange={(e) => updateField("socialTiktok", e.target.value)}
                        placeholder="e.g. trey.trizzy.clips"
                        className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                        YouTube Channel Handle
                      </label>
                      <input
                        type="text"
                        value={draft.data.socialYoutube || ""}
                        onChange={(e) => updateField("socialYoutube", e.target.value)}
                        placeholder="e.g. TreyTrizzyOfficial"
                        className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                        X / Twitter Handle
                      </label>
                      <input
                        type="text"
                        value={draft.data.socialTwitter || ""}
                        onChange={(e) => updateField("socialTwitter", e.target.value)}
                        placeholder="e.g. TreyTrizzy"
                        className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SOUND SIGNATURES */}
            {activeTab === "sound" && (
              <div className="space-y-5">
                <h3 className="text-xs font-mono font-black text-purple-300 uppercase tracking-widest pl-1 border-b border-white/5 pb-2">
                  Acoustic Signatures
                </h3>

                {/* Genres selection */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                    Core Sound Genres{" "}
                    <span className="text-fuchsia-400">* (Select at least one)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENRE_OPTIONS.map((genreOption) => {
                      const isSelected = (draft.data.genres || []).includes(genreOption);
                      return (
                        <button
                          key={genreOption}
                          type="button"
                          onClick={() => toggleArrayItem("genres", genreOption)}
                          className={`px-3 py-2 rounded-xl border text-xs font-bold font-mono transition-all ${
                            isSelected
                              ? "bg-purple-500/20 border-purple-500/55 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                              : "bg-black/40 border-white/5 text-white/50 hover:text-white/80 hover:border-white/10"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "} {genreOption}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mood selection (Producers only) */}
                {role === "producer" && (
                  <div className="space-y-2.5 border-t border-white/5 pt-4">
                    <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                      Acoustic Mood Profile{" "}
                      <span className="text-fuchsia-400">
                        * (At least one mood or specialty required)
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {MOOD_OPTIONS.map((moodOption) => {
                        const isSelected = (draft.data.moods || []).includes(moodOption);
                        return (
                          <button
                            key={moodOption}
                            type="button"
                            onClick={() => toggleArrayItem("moods", moodOption)}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold font-mono transition-all ${
                              isSelected
                                ? "bg-cyan-500/20 border-cyan-500/55 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                                : "bg-black/40 border-white/5 text-white/50 hover:text-white/80 hover:border-white/10"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "} {moodOption}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Specialties (Specific to roles) */}
                <div className="space-y-2.5 border-t border-white/5 pt-4">
                  <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                    Creative Specialties{" "}
                    {role === "producer" && <span className="text-fuchsia-400">*</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTY_OPTIONS[role].map((specOption) => {
                      const isSelected = (draft.data.specialties || []).includes(specOption);
                      return (
                        <button
                          key={specOption}
                          type="button"
                          onClick={() => toggleArrayItem("specialties", specOption)}
                          className={`px-3 py-2 rounded-xl border text-xs font-bold font-mono transition-all ${
                            isSelected
                              ? "bg-fuchsia-500/20 border-fuchsia-500/55 text-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.25)]"
                              : "bg-black/40 border-white/5 text-white/50 hover:text-white/80 hover:border-white/10"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "} {specOption}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ROLE PARAMETERS */}
            {activeTab === "role" && (
              <div className="space-y-5">
                <h3 className="text-xs font-mono font-black text-purple-300 uppercase tracking-widest pl-1 border-b border-white/5 pb-2">
                  Role Blueprint Focus
                </h3>

                {/* ARTIST SPECIFIC FIELDS */}
                {role === "artist" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                        Primary Release Goal
                      </label>
                      <input
                        type="text"
                        value={draft.data.releaseGoal || ""}
                        onChange={(e) => updateField("releaseGoal", e.target.value)}
                        placeholder="e.g. Record and drop an EP in late 2026..."
                        className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-3 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-3.5 border-t border-white/5 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white">Explicit Comfort Levels</h4>
                          <p className="text-[10px] text-white/40 mt-0.5">
                            Let systems know if your creations include explicit lyrics.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateField("explicitComfort", !draft.data.explicitComfort)
                          }
                          className={`w-11 h-6 rounded-full border transition-all flex items-center px-0.5 ${
                            draft.data.explicitComfort
                              ? "bg-purple-500/25 border-purple-500/50 justify-end"
                              : "bg-black/40 border-white/10 justify-start"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full transition-all ${draft.data.explicitComfort ? "bg-purple-300 shadow-[0_0_6px_#c084fc]" : "bg-white/30"}`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3.5">
                        <div>
                          <h4 className="text-xs font-bold text-white">Enable Fan Community</h4>
                          <p className="text-[10px] text-white/40 mt-0.5">
                            Publish a private social room directly on your public feed.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateField("fanCommunityEnabled", !draft.data.fanCommunityEnabled)
                          }
                          className={`w-11 h-6 rounded-full border transition-all flex items-center px-0.5 ${
                            draft.data.fanCommunityEnabled
                              ? "bg-purple-500/25 border-purple-500/50 justify-end"
                              : "bg-black/40 border-white/10 justify-start"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full transition-all ${draft.data.fanCommunityEnabled ? "bg-purple-300 shadow-[0_0_6px_#c084fc]" : "bg-white/30"}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* PRODUCER SPECIFIC FIELDS */}
                {role === "producer" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                        Beat Licensing Default
                      </label>
                      <select
                        value={draft.data.beatLicensingIntent || "non_exclusive"}
                        onChange={(e) => updateField("beatLicensingIntent", e.target.value)}
                        className="w-full bg-black/60 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-3 text-xs text-white outline-none transition-all font-mono"
                      >
                        <option value="non_exclusive">Non-Exclusive Leases Only</option>
                        <option value="exclusive">Exclusive Buyouts Only</option>
                        <option value="open">Open Licensing / Free Leases</option>
                        <option value="not_selling">Not For Sale / Showcasing Only</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 border-t border-white/5 pt-4">
                      <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                        Collaboration Availability
                      </label>
                      <input
                        type="text"
                        value={draft.data.collabAvailability || ""}
                        onChange={(e) => updateField("collabAvailability", e.target.value)}
                        placeholder="e.g. Open to R&B and Soul projects. Contact via DM."
                        className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-3 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* DJ / HOST SPECIFIC FIELDS */}
                {role === "dj" && (
                  <div className="space-y-4">
                    {/* Show Types select */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                        Broadcast Show Concepts{" "}
                        <span className="text-fuchsia-400">* (Select at least one)</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SHOW_TYPE_OPTIONS.map((showType) => {
                          const isSelected = (draft.data.showTypes || []).includes(showType);
                          return (
                            <button
                              key={showType}
                              type="button"
                              onClick={() => toggleArrayItem("showTypes", showType)}
                              className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold font-mono transition-all ${
                                isSelected
                                  ? "bg-purple-500/20 border-purple-500/55 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                                  : "bg-black/40 border-white/5 text-white/50 hover:text-white/80 hover:border-white/10"
                              }`}
                            >
                              {isSelected ? "✓ " : "+ "} {showType}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Broadcast Concept Description */}
                    <div className="space-y-1.5 border-t border-white/5 pt-4">
                      <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                        Signature Show Concept <span className="text-fuchsia-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={draft.data.broadcastConcept || ""}
                        onChange={(e) => updateField("broadcastConcept", e.target.value)}
                        placeholder="e.g. Smooth late night blends and indie artist spotlights..."
                        className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-3 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                          Schedule Goal
                        </label>
                        <input
                          type="text"
                          value={draft.data.scheduleGoal || ""}
                          onChange={(e) => updateField("scheduleGoal", e.target.value)}
                          placeholder="e.g. Every Friday 10 PM"
                          className="w-full bg-black/50 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-white/20 transition-all font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest pl-1 block">
                          Listener Request Rules
                        </label>
                        <select
                          value={draft.data.listenerRequestStyle || "open"}
                          onChange={(e) => updateField("listenerRequestStyle", e.target.value)}
                          className="w-full bg-black/60 border border-white/10 focus:border-purple-400/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all font-mono"
                        >
                          <option value="open">Open / Live requests</option>
                          <option value="vetted">Pre-vetted tracks only</option>
                          <option value="subs_only">Followers / Supporters only</option>
                          <option value="closed">No requests allowed</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-t border-white/5 pt-3.5">
                        <div>
                          <h4 className="text-xs font-bold text-white">Enable Replay Archive</h4>
                          <p className="text-[10px] text-white/40 mt-0.5">
                            Automatically save live mixes into public archives.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateField("replayArchiveEnabled", !draft.data.replayArchiveEnabled)
                          }
                          className={`w-11 h-6 rounded-full border transition-all flex items-center px-0.5 ${
                            draft.data.replayArchiveEnabled
                              ? "bg-purple-500/25 border-purple-500/50 justify-end"
                              : "bg-black/40 border-white/10 justify-start"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full transition-all ${draft.data.replayArchiveEnabled ? "bg-purple-300 shadow-[0_0_6px_#c084fc]" : "bg-white/30"}`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3.5">
                        <div>
                          <h4 className="text-xs font-bold text-white">
                            Broadcast Code of Conduct <span className="text-fuchsia-400">*</span>
                          </h4>
                          <p className="text-[10px] text-white/40 mt-0.5">
                            I agree to follow the platform guidelines and host responsibly.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateField("moderationAgreement", !draft.data.moderationAgreement)
                          }
                          className={`w-11 h-6 rounded-full border transition-all flex items-center px-0.5 ${
                            draft.data.moderationAgreement
                              ? "bg-purple-500/25 border-purple-500/50 justify-end"
                              : "bg-black/40 border-white/10 justify-start"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full transition-all ${draft.data.moderationAgreement ? "bg-purple-300 shadow-[0_0_6px_#c084fc]" : "bg-white/30"}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Action Panel / Validation Status (1/3 width) */}
        <div className="space-y-5">
          {/* Real-time pre-publish checklist panel */}
          <GlassCard glow className="p-5 border border-white/10 bg-black/60 relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-black text-white leading-tight">Draft Quality</h3>
                <p className="text-[10px] text-white/45 mt-0.5">
                  Pre-publish checklist diagnostics
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-mono font-black text-purple-300">
                  {validation.checklist.percentComplete}%
                </span>
                <span className="text-[9px] uppercase tracking-wider text-white/45 block mt-0.5">
                  Ready
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${validation.checklist.percentComplete}%` }}
              />
            </div>

            {/* Checklist diagnostics */}
            <div className="mt-4.5 space-y-2.5">
              <span className="text-[9px] font-mono font-black uppercase tracking-wider text-white/30 block">
                Required Blueprint Fields:
              </span>

              {/* Required list */}
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {validation.checklist.required.map((issue, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-rose-500/10 bg-rose-500/5 p-2.5 text-[11px] leading-relaxed text-rose-200"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-500/25 text-[9px] font-mono">
                      !
                    </span>
                    <p className="flex-1">
                      Missing <span className="font-bold underline">{issue.field}</span>: try{" "}
                      {issue.fixedBy || "entering details"}.
                    </p>
                  </div>
                ))}
                {validation.checklist.required.length === 0 && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-2.5 text-[11px] text-emerald-200">
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    <p className="font-bold">All required specs filled!</p>
                  </div>
                )}
              </div>

              {/* Suggestions / Optional list */}
              {validation.checklist.optional.length > 0 && (
                <div className="space-y-1.5 mt-3.5 pt-3 border-t border-white/5">
                  <span className="text-[9px] font-mono font-black uppercase tracking-wider text-white/30 block">
                    Optional Enhancements:
                  </span>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {validation.checklist.optional.map((issue, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 rounded-xl border border-amber-500/10 bg-amber-500/5 p-2.5 text-[10px] leading-relaxed text-amber-200"
                      >
                        <AlertCircle className="h-3.5 w-3.5 text-amber-300 shrink-0 mt-0.5" />
                        <p className="flex-1">
                          {issue.message}. Fix by {issue.fixedBy || "filling"}.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Save and Publish Actions */}
            <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5">
              <LegalAcceptanceGroup
                config={LEGAL_ACCEPTANCE_FLOWS.creator_profile_publish}
                values={legalValues}
                onChange={setLegalValues}
                status={legalStatus}
                statusMessage={legalMessage}
                compact
              />
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="w-full h-11 rounded-2xl border border-white/10 hover:border-purple-500/35 bg-white/5 hover:bg-white/10 text-white font-mono font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Save className="h-4 w-4 text-purple-300" />
                {isSaving ? "Saving Blueprint..." : "Save Local Draft"}
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={!validation.canPublish || !legalAccepted || legalStatus === "saving"}
                className={`w-full h-11 rounded-2xl font-mono font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                  validation.canPublish && legalAccepted && legalStatus !== "saving"
                    ? "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:scale-[1.01] active:scale-95"
                    : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                <Sparkles className="h-4 w-4" /> Publish Profile
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Real-time saved toast notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-500/30 bg-emerald-950/80 px-4 py-3 backdrop-blur-md flex items-center gap-2.5 text-emerald-100 shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-slide-up-modal font-mono text-xs">
          <CheckCircle className="h-4 w-4 text-emerald-400 animate-pulse" /> Draft saved
          successfully!
        </div>
      )}

      {/* Unsaved changes confirmation modal overlay */}
      {showUnsavedWarning && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm cursor-default"
            onClick={() => setShowUnsavedWarning(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-51 max-w-sm w-full p-6 rounded-3xl border border-white/12 bg-[#0c0a12] shadow-premium text-center space-y-4 animate-scale-up">
            <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white">Discard Changes?</h3>
              <p className="text-xs text-white/55 mt-1.5 leading-relaxed">
                You have unsaved edits in your blueprint session. Leaving now will wipe these
                temporary modifications.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowUnsavedWarning(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 hover:text-white text-xs font-bold font-mono transition-all"
              >
                Go Back
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-rose-500/25 border border-rose-500/35 hover:bg-rose-500/40 text-rose-200 text-xs font-bold font-mono transition-all"
              >
                Discard
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoleProfileEditor;
