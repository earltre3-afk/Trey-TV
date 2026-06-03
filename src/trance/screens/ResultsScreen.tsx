import React from "react";
import { useParams, useNavigate } from "../hooks/router-compat";
import {
  Sparkles,
  Zap,
  XCircle,
  Target,
  CheckCircle2,
  Play,
  ChevronRight,
  Home,
  ArrowUpRight,
  Star,
} from "lucide-react";
import { TranceShell } from "../components/shell";
import { TranceGlassCard, ScoreMeter } from "../components/primitives";
import { IMG } from "../data/devFixtures";
import { TRANCE_ROUTES } from "../routes/manifest";
import { tranceRoutineService, tranceScoringService } from "../services";

const ResultsScreen: React.FC = () => {
  const { routineId, sessionAttemptId } = useParams<{
    routineId: string;
    sessionAttemptId: string;
  }>();
  const navigate = useNavigate();

  const [r, setR] = React.useState<any>(null);
  const [score, setScore] = React.useState<any>(null);
  const [fb, setFb] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const details = await tranceRoutineService.getRoutineDetails(routineId || "rt001");
        const sc = await tranceScoringService.getScoreForAttempt(sessionAttemptId || "att-mock");
        const feedback = await tranceScoringService.computeSessionScore(
          sessionAttemptId || "att-mock",
        );

        if (active) {
          setR(details);
          setScore(sc);
          setFb(feedback);
        }
      } catch (err) {
        console.error("Failed to load attempt results:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [routineId, sessionAttemptId]);

  if (loading || !r || !score || !fb) {
    return (
      <TranceShell hideNav>
        <div className="min-h-screen grid place-items-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-fuchsia-500 border-white/10 animate-spin mx-auto mb-4" />
            <div className="text-xs text-white/50 uppercase tracking-widest">
              Loading Results...
            </div>
          </div>
        </div>
      </TranceShell>
    );
  }

  return (
    <TranceShell hideNav>
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-fuchsia-400/20 mb-4">
        <img
          src={r.cover || IMG.maleA}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          alt=""
        />
        <div className="relative p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-yellow-300 uppercase tracking-widest">
              Session Complete
            </span>
            <TranceGlassCard glow="magenta" className="px-3 py-1.5 text-right">
              <div className="text-[8px] text-white/60 uppercase">Trance Score</div>
              <div className="text-lg font-black text-fuchsia-300">
                {(score.total * 25).toLocaleString()}{" "}
                <span className="text-cyan-300 text-xs">+{Math.round(score.total * 2.5)}↑</span>
              </div>
            </TranceGlassCard>
          </div>
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-purple-400 to-cyan-400">
            AI FEEDBACK
          </h1>
          <p className="text-sm text-white/60 mt-2">
            Keep building, Superstar. You're leveling up.
          </p>
        </div>
      </div>

      {/* Meters */}
      <TranceGlassCard glow="purple" className="p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-fuchsia-300" />
            <h3 className="font-black text-white uppercase text-sm">Overall Performance</h3>
          </div>
          {score.newPB && (
            <span className="text-[10px] font-black text-yellow-300 bg-yellow-500/15 border border-yellow-400/30 px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              New Personal Best!
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ScoreMeter
            value={score.accuracy}
            label="Accuracy"
            color="#a855f7"
            desc="You hit the moves with precision."
          />
          <ScoreMeter
            value={score.timing}
            label="Timing"
            color="#ec4899"
            desc="Great rhythm. Keep tightening."
          />
          <ScoreMeter
            value={score.energy}
            label="Energy"
            color="#2dd4bf"
            desc="High impact! You bring the vibe."
          />
          <ScoreMeter
            value={score.sync}
            label="Sync"
            color="#3b82f6"
            desc="Well connected. Nice control."
          />
        </div>
      </TranceGlassCard>

      {/* AI-assisted camera report */}
      <TranceGlassCard glow="cyan" className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-300" />
            <h3 className="font-black text-white uppercase text-sm">AI-Assisted Feedback</h3>
          </div>
          <span className="text-[9px] text-white/40 uppercase">Coaching, not perfect judgment</span>
        </div>
        {score.aiConfidence != null ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {(
                [
                  ["Camera confidence", `${Math.round((score.aiConfidence || 0) * 100)}%`],
                  ["Tracked frames", `${score.trackedFrameCount ?? 0}`],
                  ["Completed sections", `${score.completedSections ?? 0}`],
                  ["Missed cues", `${score.missedCueCount ?? 0}`],
                ] as [string, string][]
              ).map(([l, v]) => (
                <div
                  key={l}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-center"
                >
                  <div className="text-lg font-black text-white">{v}</div>
                  <div className="text-[8px] text-white/50 uppercase">{l}</div>
                </div>
              ))}
            </div>
            <div
              className={`rounded-xl border p-3 text-xs font-bold flex items-center gap-2 ${
                score.leaderboardEligible
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                  : "border-yellow-400/40 bg-yellow-500/10 text-yellow-300"
              }`}
            >
              {score.leaderboardEligible ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0" />
              )}
              {score.leaderboardEligible
                ? "Performance score submitted to the leaderboard."
                : `Not eligible for leaderboard${
                    score.leaderboardIneligibilityReason
                      ? ` — ${score.leaderboardIneligibilityReason.replace(/_/g, " ")}`
                      : ""
                  }.`}
            </div>
          </>
        ) : (
          <p className="text-xs text-white/60">
            Practice score saved using the standard (non-AI) flow. Enable camera coaching for
            AI-assisted feedback and Performance leaderboard eligibility.
          </p>
        )}
      </TranceGlassCard>

      {/* Pose comparison */}
      <TranceGlassCard glow="cyan" className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-fuchsia-300" />
            <h3 className="font-black text-white uppercase text-sm">Move Check: Chorus Combo 3</h3>
          </div>
          <div className="hidden sm:flex gap-3 text-[10px]">
            <span className="text-purple-300">● Your Pose</span>
            <span className="text-cyan-300">● Target Pose</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["Your Pose", IMG.maleB, "#a855f7"],
              ["Target Pose", r.cover || IMG.maleA, "#22d3ee"],
            ] as [string, string, string][]
          ).map(([label, img, color]) => (
            <div
              key={label}
              className="relative rounded-2xl overflow-hidden border"
              style={{ borderColor: `${color}55` }}
            >
              <img src={img} className="w-full h-44 object-cover" alt={label} />
              <div className="absolute inset-0 bg-black/30" />
              <span
                className="absolute top-2 left-2 text-[9px] font-bold uppercase"
                style={{ color }}
              >
                {label}
              </span>
              {label === "Your Pose" && (
                <div
                  className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-black"
                  style={{ color }}
                >
                  {fb.matchPct}% MATCH
                </div>
              )}
            </div>
          ))}
        </div>
      </TranceGlassCard>

      {/* Strengths / Missed / Focus */}
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <TranceGlassCard className="p-4 border-emerald-400/20">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h4 className="font-black text-emerald-400 uppercase text-xs">Strengths</h4>
          </div>
          {fb.strengths.map((s: string) => (
            <div key={s} className="flex items-center gap-2 text-sm text-white/80 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {s}
            </div>
          ))}
          <div className="text-center text-xs font-bold text-emerald-400 border border-emerald-400/30 rounded-full py-1.5 mt-2">
            Keep that energy!
          </div>
        </TranceGlassCard>
        <TranceGlassCard className="p-4 border-pink-400/20">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4 text-pink-400" />
            <h4 className="font-black text-pink-400 uppercase text-xs">Missed Steps</h4>
          </div>
          {fb.missedSteps.map((m: any) => (
            <div key={m.move} className="flex items-center gap-2 text-sm text-white/80 mb-2">
              <span className="text-pink-400 font-bold text-xs w-8">{m.time}</span>
              {m.move}
            </div>
          ))}
          <div className="text-center text-xs font-bold text-pink-400 border border-pink-400/30 rounded-full py-1.5 mt-2">
            Review to lock it in.
          </div>
        </TranceGlassCard>
        <TranceGlassCard className="p-4 border-cyan-400/20">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-cyan-400" />
            <h4 className="font-black text-cyan-400 uppercase text-xs">Focus Areas</h4>
          </div>
          {fb.focusAreas.map((f: string) => (
            <div key={f} className="flex items-center justify-between text-sm text-white/80 mb-2">
              {f}
              <ArrowUpRight className="w-4 h-4 text-cyan-400" />
            </div>
          ))}
          <div className="text-center text-xs font-bold text-cyan-400 border border-cyan-400/30 rounded-full py-1.5 mt-2">
            Focus. Refine. Elevate.
          </div>
        </TranceGlassCard>
      </div>

      {/* Replay + XP */}
      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <TranceGlassCard glow="purple" className="p-3 flex items-center gap-3">
          <div className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0">
            <img src={r.cover || IMG.maleA} className="w-full h-full object-cover" alt="replay" />
            <button className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-white/20 grid place-items-center">
              <Play className="w-4 h-4 fill-white" />
            </button>
          </div>
          <div className="flex-1">
            <h4 className="font-black text-fuchsia-300 uppercase text-sm">Session Replay</h4>
            <p className="text-[11px] text-white/50">
              Watch your full performance with AI insights.
            </p>
            <button className="text-xs font-bold text-cyan-300 flex items-center gap-1 mt-1">
              View Replay <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </TranceGlassCard>
        <TranceGlassCard glow="gold" className="p-3 flex items-center gap-3">
          <div className="w-14 h-14 rounded-full grid place-items-center bg-gradient-to-br from-yellow-400/30 to-amber-600/20 border-2 border-yellow-400/50">
            <Star className="w-6 h-6 text-yellow-300 fill-yellow-300/40" />
          </div>
          <div className="flex-1">
            <div className="text-xl font-black text-white">
              +{Math.round(score.total * 2.5)}{" "}
              <span className="text-xs text-yellow-300">XP EARNED</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-white/50 mt-1">
              <span>LVL 18</span>
              <span>LVL 19</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
                style={{ width: "80%" }}
              />
            </div>
            <div className="text-[9px] text-white/40 text-center mt-0.5">3,210 / 4,000 XP</div>
          </div>
        </TranceGlassCard>
      </div>

      {/* Actions */}
      <button
        onClick={() => navigate(TRANCE_ROUTES.learn(r.id))}
        className="w-full rounded-2xl py-4 font-black text-lg tracking-[0.2em] text-black bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-400 flex items-center justify-center gap-2 active:scale-95 transition mb-2"
      >
        RETRY ROUTINE <ChevronRight className="w-5 h-5" />
      </button>
      <button
        onClick={() => navigate(TRANCE_ROUTES.home)}
        className="w-full rounded-2xl py-3 font-bold tracking-widest text-yellow-300 border border-yellow-400/30 flex items-center justify-center gap-2"
      >
        BACK TO HOME <Home className="w-4 h-4" />
      </button>
    </TranceShell>
  );
};

export default ResultsScreen;
