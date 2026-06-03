import React from "react";
import { useParams, useNavigate, useLocation } from "../hooks/router-compat";
import { LogOut, Pause, Play, RotateCcw, Crosshair } from "lucide-react";
import { TranceShell } from "../components/shell";
import { cn } from "../components/primitives";
import { PoseCameraCanvas } from "../components/PoseCameraCanvas";
import { IMG } from "../data/devFixtures";
import { tranceRoutineService, tranceSessionService, tranceScoringService } from "../services";
import { TRANCE_ROUTES } from "../routes/manifest";
import { useTranceIdentity } from "../hooks/useTranceIdentity";
import { useTrancePoseSession } from "../hooks/useTrancePoseSession";
import { evaluateLeaderboardEligibility } from "../utils/leaderboardEligibility";
import { shouldUseFixtures } from "../services/config";
import type { PoseComparisonTarget, PoseConfidenceReport } from "../types";

const clockToMs = (clock: string): number => {
  const [m, s] = (clock || "0:0").split(":").map((n) => parseInt(n, 10) || 0);
  return (m * 60 + s) * 1000;
};

const LearnModeScreen: React.FC = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { identity, loading: authLoading } = useTranceIdentity();

  const mode = React.useMemo(() => {
    if (location.pathname.includes("/practice")) return "Practice" as const;
    if (location.pathname.includes("/performance")) return "Performance" as const;
    return "Learn" as const;
  }, [location.pathname]);

  const pose = useTrancePoseSession(mode);

  const [r, setR] = React.useState<any>(null);
  const [attempt, setAttempt] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [finishing, setFinishing] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    async function init() {
      try {
        const details = await tranceRoutineService.getRoutineDetails(routineId || "rt001");
        if (active && details) setR(details);
      } catch (err) {
        console.error("Failed to load routine details:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    init();
    return () => {
      active = false;
    };
  }, [routineId]);

  React.useEffect(() => {
    let active = true;
    const userId = identity?.authUserId;
    if (authLoading || !userId || !r?.id) return;
    async function startAttempt() {
      try {
        const att = await tranceSessionService.createSessionAttempt(r.id, userId as string, mode);
        if (active) setAttempt(att);
      } catch (err) {
        console.error("Failed to create session attempt:", err);
      }
    }
    startAttempt();
    return () => {
      active = false;
    };
  }, [authLoading, identity, r, mode]);

  // Build comparison targets from the routine's existing cue data.
  const targets = React.useMemo<PoseComparisonTarget[]>(() => {
    if (!r) return [];
    const out: PoseComparisonTarget[] = [];
    (r.directionCues || []).forEach((c: any) =>
      out.push({ timestampMs: clockToMs(c.timestamp), direction: c.direction, label: c.facing }),
    );
    (r.moveHints || []).forEach((h: any) =>
      out.push({ timestampMs: clockToMs(h.timestamp), label: h.label }),
    );
    return out.sort((a, b) => a.timestampMs - b.timestampMs);
  }, [r]);

  const totalSections = (r?.countSections?.length as number) || 1;

  const usedAi =
    pose.aiEnabled &&
    pose.confidence != null &&
    (pose.status === "tracking" || pose.status === "paused" || pose.status === "stopped");

  const handleComplete = async () => {
    if (finishing) return;
    setFinishing(true);
    try {
      const summary = usedAi
        ? pose.buildSummary({
            targets,
            totalSections,
            completedSections: totalSections,
            completionPct: 100,
            mode,
          })
        : null;
      pose.stop();

      if (shouldUseFixtures()) {
        navigate(TRANCE_ROUTES.results(r.id, attempt?.id || "att-mock"));
        return;
      }
      if (!attempt?.id || !identity?.authUserId) {
        navigate(TRANCE_ROUTES.home);
        return;
      }

      if (summary) {
        const confidence: PoseConfidenceReport = {
          bodyConfidence: summary.confidence,
          visibleRatio: summary.cameraQuality.fullBodyInFrame ? 0.8 : 0.4,
          trackedFrameCount: summary.trackedFrameCount,
          totalFrameCount: summary.totalFrameCount,
          peopleDetected: summary.cameraQuality.peopleDetected,
          lightingOk: summary.cameraQuality.lightingOk,
          fullBodyInFrame: summary.cameraQuality.fullBodyInFrame,
        };
        const eligibility = evaluateLeaderboardEligibility({
          mode,
          aiEnabled: true,
          trackingFailed: false,
          confidence,
          completionPct: summary.completionPct,
          trackedFrameCount: summary.trackedFrameCount,
        });
        await tranceScoringService.submitAiAssistedSessionScore({
          sessionAttemptId: attempt.id,
          routineId: r.id,
          profileId: identity.authUserId,
          summary,
          leaderboardEligibility: eligibility,
          mode,
        });
        navigate(TRANCE_ROUTES.results(r.id, attempt.id));
        return;
      }

      // Non-AI controlled fallback (camera off/unavailable). Practice is lenient.
      const base = mode === "Practice" ? 88 : 92;
      await tranceScoringService.submitSessionScore(identity.authUserId, r.id, attempt.id, mode, {
        accuracy: base + 2,
        timing: base - 2,
        energy: base,
        sync: base + 2,
        total: base,
        rank: base >= 90 ? "S" : "A",
      });
      navigate(TRANCE_ROUTES.results(r.id, attempt.id));
    } catch (err) {
      console.error("Failed to complete session:", err);
      navigate(TRANCE_ROUTES.home);
    } finally {
      setFinishing(false);
    }
  };

  if (loading || authLoading || !r) {
    return (
      <TranceShell hideNav>
        <div className="min-h-screen grid place-items-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-fuchsia-500 border-white/10 animate-spin mx-auto mb-4" />
            <div className="text-xs text-white/50 uppercase tracking-widest">Loading Routine...</div>
          </div>
        </div>
      </TranceShell>
    );
  }

  const sections = ["INTRO", "VERSE 1", "PRE CHORUS"];
  const nextHint = (r.moveHints || [])[0];
  const modeLabel = `${mode} Mode`;

  return (
    <TranceShell hideNav pad={false}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-cyan-300" />
          <div>
            <div className="text-[9px] text-white/50 uppercase">Dance Session</div>
            <div className="text-xs font-black text-cyan-300 uppercase">{modeLabel}</div>
          </div>
        </div>
        <div className="font-black text-2xl tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
          TRANCE
        </div>
        <div className="text-right">
          <div className="text-[9px] text-yellow-300 uppercase">Live Preview</div>
          <div className="text-lg font-black text-yellow-300">
            {pose.liveScorePreview != null ? `${pose.liveScorePreview}%` : "—"}
          </div>
        </div>
      </div>

      {/* Progress timeline */}
      <div className="mx-4 mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <div className="flex items-center gap-3 mb-2">
          <img src={r.cover || IMG.r4} className="w-9 h-9 rounded-lg object-cover" alt="" />
          <div className="flex-1">
            <div className="text-sm font-black text-white uppercase">{r.title}</div>
            <div className="text-[10px] text-white/50">
              {r.choreographerName} <span className="text-fuchsia-300">{r.difficulty}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-cyan-300 uppercase font-bold">AI-assisted</div>
            <div className="text-[8px] text-white/40 uppercase">coaching, not judgment</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-[9px] font-bold text-white/50 uppercase mb-1">
          {sections.map((s, i) => (
            <span key={s} className={i === 1 ? "text-white" : ""}>
              {s}
            </span>
          ))}
        </div>
        <div className="relative h-1.5 rounded-full bg-white/10">
          <div
            className="absolute h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500"
            style={{ width: "45%" }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white"
            style={{ left: "45%" }}
          />
        </div>
      </div>

      {/* Camera / pose canvas */}
      <div className="relative mx-4 mt-3">
        <PoseCameraCanvas pose={pose} className="min-h-[360px] lg:min-h-[60vh]" />
        {/* Next move guide (choreography cue, not AI judgment) */}
        {nextHint && (
          <div className="absolute bottom-3 right-3 w-32 rounded-2xl border border-fuchsia-400/40 bg-black/60 backdrop-blur p-3 text-center pointer-events-none">
            <div className="text-[9px] font-black text-purple-300 uppercase mb-1">Next Move</div>
            <div className="text-[11px] font-bold text-white uppercase">{nextHint.label}</div>
            <div className="text-[9px] text-white/50 mt-0.5">{nextHint.timestamp}</div>
          </div>
        )}
      </div>

      {/* Beat countdown + next moves */}
      <div className="mx-4 mt-3 rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/5 p-3 flex items-center gap-3">
        <div className="text-center">
          <div className="text-[9px] font-black text-fuchsia-300 uppercase">Next Move In</div>
          <div className="text-3xl font-black text-white leading-none">3</div>
          <div className="text-[9px] text-fuchsia-300 uppercase">Beats</div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(r.countSections || []).slice(0, 4).map((c: any, n: number) => (
            <div
              key={c.id || n}
              className={cn(
                "shrink-0 w-16 rounded-xl border p-1 text-center",
                n === 1 ? "border-cyan-400/60 bg-cyan-500/10" : "border-white/10 bg-white/[0.03]",
              )}
            >
              <div className="text-[10px] font-bold text-white truncate">{c.label}</div>
              <div className="text-[9px] text-white/50">{c.counts}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Beat waveform */}
      <div className="mx-4 mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 flex items-center gap-3">
        <div className="text-center shrink-0">
          <div className="text-[8px] text-white/50 uppercase">Beat</div>
          <div className="text-xl font-black text-white">{r.bpm}</div>
          <div className="text-[8px] text-white/50 uppercase">BPM</div>
        </div>
        <div className="flex-1 flex items-center gap-0.5 h-10 overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-full"
              style={{
                height: `${20 + Math.abs(Math.sin(i / 3)) * 70}%`,
                background:
                  i < 32 ? "linear-gradient(to top,#d946ef,#22d3ee)" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mx-4 mt-3 mb-6 flex items-center justify-between gap-2">
        <button
          onClick={() => {
            pose.stop();
            navigate(-1);
          }}
          className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] py-3 flex flex-col items-center gap-1 text-white/70"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] uppercase">Exit</span>
        </button>
        <button
          onClick={() => (pose.status === "paused" ? pose.resume() : pose.pause())}
          disabled={pose.status !== "tracking" && pose.status !== "paused"}
          className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] py-3 flex flex-col items-center gap-1 text-white/70 disabled:opacity-30"
        >
          {pose.status === "paused" ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          <span className="text-[9px] uppercase">{pose.status === "paused" ? "Resume" : "Pause"}</span>
        </button>
        <button
          onClick={handleComplete}
          disabled={finishing}
          aria-label="Finish session"
          className="w-16 h-16 rounded-full grid place-items-center bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-500 border-2 border-white/20 shadow-[0_0_24px_-2px_rgba(217,70,239,0.7)] disabled:opacity-60"
        >
          {finishing ? (
            <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <span className="text-white font-black text-xl">✓</span>
          )}
        </button>
        <button
          onClick={() => {
            pose.reset();
          }}
          className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] py-3 flex flex-col items-center gap-1 text-white/70"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-[9px] uppercase">Reset</span>
        </button>
        <button
          onClick={() => void pose.start()}
          disabled={pose.status === "tracking" || !pose.aiEnabled}
          className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] py-3 flex flex-col items-center gap-1 text-white/70 disabled:opacity-30"
        >
          <Crosshair className="w-5 h-5" />
          <span className="text-[9px] uppercase">Camera</span>
        </button>
      </div>
    </TranceShell>
  );
};

export default LearnModeScreen;
