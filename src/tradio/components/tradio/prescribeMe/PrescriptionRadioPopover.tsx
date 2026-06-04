import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, Activity, Info, Radio, Compass } from "lucide-react";
import type { TradioMode, Prescription, UserAnswers, DailyUsageState } from "./prescribeMeTypes";
import {
  getDailyUsageState,
  executeNewPrescription,
  refineCurrentPrescription,
  debugResetDailyLimit,
} from "./prescribeMeService";
import { PrescribeMeQuestionFlow } from "./PrescribeMeQuestionFlow";
import { PrescriptionResultCard } from "./PrescriptionResultCard";
import { usePlayer } from "@/tradio/contexts/PlayerContext";
import { IMG, TRACKS } from "../data";
import { PolicyLinkInline } from "../legal/LegalPrimitives";

interface PrescriptionRadioPopoverProps {
  onClose: () => void;
  currentMode?: TradioMode;
  currentRoleLabel?: string;
  onOpenForge?: () => void;
  onOpenPlayer?: () => void;
  onSetScreen?: (key: string) => void;
}

export const PrescriptionRadioPopover: React.FC<PrescriptionRadioPopoverProps> = ({
  onClose,
  currentMode = "fan",
  currentRoleLabel = "Listener",
  onOpenForge,
  onOpenPlayer,
  onSetScreen,
}) => {
  const { playStation } = usePlayer();
  const userId = "local-tradio-user-id"; // standard local session key

  // Core popout States
  const [dailyUsage, setDailyUsage] = useState<DailyUsageState>(() => getDailyUsageState(userId));
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);

  const [flowState, setFlowState] = useState<"welcome" | "questions" | "synthesizing" | "result">(
    "welcome",
  );
  const [activeAnswers, setActiveAnswers] = useState<UserAnswers | null>(null);

  // Synthesizing Loading state
  const [synthStep, setSynthStep] = useState("");
  const synthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Parent/Child conceptual signals state
  const [sources, setSources] = useState({
    useTradioSignals: true,
    useTreyTVSignals: false, // conceptual parent bridge
  });

  // Load daily limits and pre-recover last prescription into session if desired
  useEffect(() => {
    setDailyUsage(getDailyUsageState(userId));
  }, [flowState]);

  useEffect(() => {
    return () => {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleStartFlow = () => {
    if (dailyUsage.prescriptionsLeftToday <= 0) return;
    if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    setSynthStep("");
    setActivePrescription(null);
    setFlowState("questions");
  };

  const handleQuestionComplete = (answers: UserAnswers) => {
    if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    setActiveAnswers(answers);
    setFlowState("synthesizing");

    const steps = [
      "Decoding behavioral intent answers...",
      "Tuning psychological energy signals...",
      "Deconstructing molecular sound frequencies...",
      "Syncing with active Tradio mode permissions...",
      "Formulating custom Rx music prescription!",
    ];

    setSynthStep(steps[0]);
    let currentStep = 1;
    synthIntervalRef.current = setInterval(() => {
      if (currentStep < steps.length) {
        setSynthStep(steps[currentStep]);
        currentStep++;
      } else {
        if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
        synthIntervalRef.current = null;

        // Execute prescription deduction and generation
        const res = executeNewPrescription(userId, currentMode, answers);
        if (res.success && res.prescription) {
          setActivePrescription(res.prescription);
          setDailyUsage({
            prescriptionsLeftToday: res.leftCount,
            lastPrescription: res.prescription,
            savedPrescriptions: [],
          });
          setFlowState("result");
        } else {
          setDailyUsage(getDailyUsageState(userId));
          setFlowState("welcome");
        }
      }
    }, 360);
  };

  const handleViewLastPrescription = () => {
    if (dailyUsage.lastPrescription) {
      setActivePrescription(dailyUsage.lastPrescription);
      setFlowState("result");
    }
  };

  const handleRefine = (refinementId: string) => {
    if (!activeAnswers) return;
    const refinedRx = refineCurrentPrescription(userId, currentMode, activeAnswers, refinementId);
    setActivePrescription(refinedRx);
  };

  const handleCtaRouteAction = () => {
    if (!activePrescription) return;

    if (activePrescription.ctaType === "start_radio") {
      // Symmetrical launch sequence for Prescription Radio
      playStation(
        {
          id: "ai-radio-for-you-live-signal",
          type: "station",
          label: "Prescription Radio",
          title: activePrescription.title,
          subtitle: "Synthesized Live Formula",
          image: IMG.aiSphere,
          isLive: true,
          listenerCount: 18400,
        },
        [
          {
            ...TRACKS.aiRadio,
            title: activePrescription.title,
            station: "Prescription Radio",
            sourceType: "station",
            sourceLabel: "Prescription Radio",
            isLive: true,
          },
          TRACKS.midnightVelvet,
          TRACKS.fallingForYou,
          TRACKS.sixAmThoughts,
        ],
      );
      onOpenPlayer?.();
      onClose();
    } else if (activePrescription.ctaType === "open_forge") {
      if (onOpenForge) onOpenForge();
      else onSetScreen?.("build");
      onClose();
    } else {
      // Route to destination screen keys
      if (onSetScreen) {
        const dest = activePrescription.destination;
        if (dest === "artistHub" || dest === "release") {
          onSetScreen("artistHub");
        } else if (dest === "producerHub" || dest === "build") {
          onSetScreen("producerHub");
        } else if (dest === "djStudio" || dest === "showBuilder") {
          onSetScreen("djStudio");
        } else {
          onSetScreen(dest);
        }
      }
      onClose();
    }
  };

  const handleDebugReset = () => {
    if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    synthIntervalRef.current = null;
    const fresh = debugResetDailyLimit(userId);
    setDailyUsage(fresh);
    setActivePrescription(null);
    setSynthStep("");
    setFlowState("welcome");
  };

  return (
    <>
      {/* Premium Backdrop Blur Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-sm animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* Luxury Integrated Pop-out Cabinet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tradio Prescribe Me"
        className="fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-[101] flex max-h-[min(86dvh,720px)] flex-col gap-3 overflow-y-auto overscroll-contain rounded-[24px] border-[0.5px] border-white/15 bg-gradient-to-b from-[#0e0e1a]/92 via-[#08060d]/94 to-[#040409]/98 p-3.5 text-left shadow-[0_30px_70px_rgba(0,0,0,0.95),0_0_55px_rgba(168,85,247,0.25),inset_0_1.5px_2.5px_rgba(255,255,255,0.2)] backdrop-blur-3xl scrollbar-none luxury-grain animate-emerge-from-button sm:inset-x-auto sm:right-6 sm:bottom-[calc(10.75rem_+_env(safe-area-inset-bottom))] sm:w-[420px] sm:max-w-[420px] sm:rounded-[32px] sm:p-5 sm:max-h-[calc(100dvh_-_12rem_-_env(safe-area-inset-bottom))] sm:animate-slide-up-modal lg:bottom-6 lg:max-h-[calc(100dvh_-_3rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Tradio Prescribe Me"
          className="sticky right-0 top-0 z-20 ml-auto flex h-10 w-fit shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-black/70 px-3 text-[10px] font-black uppercase tracking-wider text-white/80 shadow-[0_12px_28px_rgba(0,0,0,0.45)] backdrop-blur-xl transition active:scale-95 sm:hidden"
        >
          <X className="h-4 w-4" />
          Close
        </button>

        {/* Triangular Anchor Tail pointing to bottom nav center orb */}
        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b border-white/12 bg-[#05050a]/92 backdrop-blur-3xl z-[-1] pointer-events-none sm:hidden" />
        {/* Diagonal Shimmer Scan Lines */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -skew-x-12 translate-x-[-150%] animate-shimmer-sweep pointer-events-none" />

        {/* POP-OUT STAGES */}

        {/* 1. SYNTHESIZING GENERATOR LOADER */}
        {flowState === "synthesizing" && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="relative h-20 w-20 mb-6 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-purple-500 border-b-fuchsia-500 border-l-transparent animate-spin-fast" />
              <span className="absolute inset-[15%] rounded-full border border-b-cyan-400 border-l-purple-500 animate-spin-reverse" />
              <Activity className="h-6 w-6 text-cyan-300 animate-pulse" />
            </div>
            <h3 className="text-sm font-mono font-black tracking-[0.25em] text-white uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
              Formulating Route
            </h3>
            <div className="mt-3.5 text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-5 py-2 animate-pulse min-h-[32px] flex items-center justify-center">
              {synthStep}
            </div>
            {/* Progress bar line */}
            <div className="mt-6 w-36 h-[3px] bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500 animate-shimmer-sweep w-2/3 rounded-full" />
            </div>
          </div>
        )}

        {/* 2. LIVE QUESTION FLOW GRID */}
        {flowState === "questions" && (
          <PrescribeMeQuestionFlow
            onComplete={handleQuestionComplete}
            onCancel={() => setFlowState("welcome")}
          />
        )}

        {/* 3. FINAL PRESCRIPTION ROUTE RESULTS */}
        {flowState === "result" && activePrescription && (
          <>
            {/* Result Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-full overflow-hidden bg-purple-500/10 border border-purple-500/25 flex items-center justify-center">
                  <span className="absolute inset-0 bg-purple-500/20 blur-md" />
                  <Radio className="h-4 w-4 text-purple-300 animate-pulse-orb" />
                </div>
                <div>
                  <h2 className="text-xs font-mono font-black uppercase tracking-[0.2em] text-white">
                    Prescribe Me
                  </h2>
                  <span className="text-[8px] font-mono text-white/40 block mt-0.5">
                    {currentRoleLabel} Mode active
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close Tradio Prescribe Me"
                className="h-8 w-8 rounded-full bg-white/5 border border-white/12 hover:border-white/25 text-white/50 hover:text-white transition-all flex items-center justify-center active:scale-90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <PrescriptionResultCard
              prescription={activePrescription}
              mode={currentMode}
              onRefine={handleRefine}
              onCtaClick={handleCtaRouteAction}
              onOpenForge={onOpenForge}
              onRestart={() => setFlowState("questions")}
              dailyCount={dailyUsage.prescriptionsLeftToday}
            />
          </>
        )}

        {/* 4. WELCOME / EXCEEDED DAILY LIMIT LANDING */}
        {flowState === "welcome" && (
          <>
            {/* Header Block */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-full overflow-hidden bg-purple-500/10 border border-purple-500/25 flex items-center justify-center">
                  <span className="absolute inset-0 bg-purple-500/20 blur-md animate-pulse" />
                  <Radio className="h-4 w-4 text-purple-300 animate-pulse-orb" />
                </div>
                <div>
                  <h2 className="text-xs font-mono font-black uppercase tracking-[0.2em] text-white">
                    Prescribe Me
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[8px] font-mono font-extrabold uppercase bg-purple-500/15 border border-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded-md">
                      {currentRoleLabel} Mode
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close Tradio Prescribe Me"
                className="h-8 w-8 rounded-full bg-white/5 border border-white/12 hover:border-white/25 text-white/50 hover:text-white transition-all flex items-center justify-center active:scale-90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Parent/Child Relationship Explanation banner */}
            <div className="relative rounded-2xl border border-purple-500/10 bg-purple-950/10 p-2.5 sm:p-3.5 space-y-1.5 sm:space-y-2">
              <div className="flex items-start gap-2">
                <div className="h-4 w-4 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0 mt-0.5">
                  <Info className="h-3 w-3 text-purple-300" />
                </div>
                <div className="text-[9.5px] sm:text-[10px] leading-snug sm:leading-relaxed text-purple-200/70">
                  <strong className="text-purple-100 font-bold font-mono">
                    Universe Route Me Bridge:
                  </strong>{" "}
                  <br />
                  <span className="text-white/45">Trey TV Prescribe Me</span> routes the whole
                  creative universe. <br />
                  <span className="text-purple-300 font-semibold">Tradio Prescribe Me</span> routes
                  the music/sound side.
                </div>
              </div>

              {/* Conceptual Toggles */}
              <div className="border-t border-white/5 pt-2 sm:pt-2.5 space-y-1 sm:space-y-1.5">
                <button
                  onClick={() =>
                    setSources((prev) => ({ ...prev, useTradioSignals: !prev.useTradioSignals }))
                  }
                  className="w-full flex items-center justify-between text-left text-[9px] font-mono font-medium text-white/60 hover:text-white transition-colors"
                >
                  <span>Use Tradio music signals</span>
                  <div
                    className={`w-7 h-4 rounded-full border transition-all flex items-center px-0.5 ${
                      sources.useTradioSignals
                        ? "bg-purple-500/25 border-purple-500/50 justify-end"
                        : "bg-black/40 border-white/10 justify-start"
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-all ${sources.useTradioSignals ? "bg-purple-300 shadow-[0_0_6px_#c084fc]" : "bg-white/30"}`}
                    />
                  </div>
                </button>

                <button
                  onClick={() =>
                    setSources((prev) => ({ ...prev, useTreyTVSignals: !prev.useTreyTVSignals }))
                  }
                  className="w-full flex items-center justify-between text-left text-[9px] font-mono font-medium text-white/60 hover:text-white transition-colors"
                >
                  <span>Use Trey TV universe signals (Conceptual)</span>
                  <div
                    className={`w-7 h-4 rounded-full border transition-all flex items-center px-0.5 ${
                      sources.useTreyTVSignals
                        ? "bg-cyan-500/25 border-cyan-500/50 justify-end"
                        : "bg-black/40 border-white/10 justify-start"
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-all ${sources.useTreyTVSignals ? "bg-cyan-300 shadow-[0_0_6px_#22d3ee]" : "bg-white/30"}`}
                    />
                  </div>
                </button>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-1.5 border-t border-white/5 pt-2 sm:pt-2.5">
                <PolicyLinkInline target="prescribe-me">
                  AI / Prescribe Me Explanation
                </PolicyLinkInline>
                <PolicyLinkInline target="privacy-choices">Privacy Choices</PolicyLinkInline>
              </div>
            </div>

            {/* Daily limit counters display */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-3 sm:p-4 text-center space-y-2 sm:space-y-3">
              {dailyUsage.prescriptionsLeftToday > 0 ? (
                <>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] sm:text-xs font-bold text-white font-mono">
                      {dailyUsage.prescriptionsLeftToday}{" "}
                      {dailyUsage.prescriptionsLeftToday === 1 ? "prescription" : "prescriptions"}{" "}
                      left today
                    </span>
                  </div>
                  <p className="text-[10.5px] sm:text-[11px] text-white/50 leading-normal sm:leading-relaxed max-w-sm mx-auto">
                    Start a guided, question-based AI diagnosis flow to map your psychological need,
                    emotional energy, and desired shift to the perfect content route.
                  </p>

                  <button
                    onClick={handleStartFlow}
                    className="w-full h-9 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 text-white font-mono font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 mt-1 sm:mt-2"
                  >
                    <Sparkles className="h-4 w-4" /> Start AI Routing Flow
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                    <span className="text-[11px] sm:text-xs font-bold text-white font-mono uppercase">
                      Daily Limit Exceeded
                    </span>
                  </div>
                  <p className="text-[10.5px] sm:text-[11px] text-white/50 leading-normal sm:leading-relaxed max-w-sm mx-auto">
                    You've used both of today's sound prescriptions. Come back tomorrow for a new
                    diagnosis! Your limit ensures prescriptions remain highly valuable and focused.
                  </p>

                  <div className="pt-1.5 sm:pt-2">
                    <button
                      disabled
                      className="w-full h-9 sm:h-11 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-white/30 font-mono font-black text-[10px] sm:text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Locked For Today
                    </button>
                  </div>
                </>
              )}

              {/* Recover Last Prescription button if available */}
              {dailyUsage.lastPrescription && (
                <button
                  onClick={handleViewLastPrescription}
                  className="w-full h-9 sm:h-10 rounded-xl border border-white/10 hover:border-purple-500/30 bg-white/5 hover:bg-white/10 text-purple-200 hover:text-white font-bold text-[9px] sm:text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <Compass className="h-3.5 w-3.5 text-purple-400" />
                  View Today's Active Prescription
                </button>
              )}
            </div>

            {/* Debug reset (Bottom mini bar) */}
            <div className="flex justify-between items-center text-[8px] font-mono text-white/20 pl-1">
              <span>TRADIO CLIENT Rx ENGINE</span>
              <button
                onClick={handleDebugReset}
                className="hover:text-purple-400/80 underline uppercase tracking-wider"
              >
                Debug Reset Limits
              </button>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          className="sticky bottom-0 z-20 mt-1 h-11 w-full shrink-0 rounded-2xl border border-white/12 bg-white/[0.06] text-xs font-black uppercase tracking-widest text-white/75 backdrop-blur-xl transition active:scale-[0.99] sm:hidden"
        >
          Close Prescribe Me
        </button>
      </div>
    </>
  );
};
export default PrescriptionRadioPopover;
