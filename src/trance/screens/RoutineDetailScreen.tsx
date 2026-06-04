import React from "react";
import { useParams, useNavigate } from "../hooks/router-compat";
import { Play, Bookmark, Clock, Crown, Star, Trophy, Activity, ChevronRight } from "lucide-react";
import { TranceShell, TranceTopBar, TranceLogo } from "../components/shell";
import { TranceGlassCard, cn, VerifiedTick } from "../components/primitives";
import { SessionModeCard, CountStructureCard } from "../components/cards";
import {
  routines as fixtureRoutines,
  leaderboard as fixtureLeaderboard,
  IMG,
} from "../data/devFixtures";
import { TRANCE_ROUTES } from "../routes/manifest";
import { tranceRoutineService, tranceLeaderboardService } from "../services";
import { shouldUseFixtures } from "../services/config";

const RoutineDetailScreen: React.FC = () => {
  const { routineId } = useParams<{ routineId: string }>();
  const id = routineId;
  const navigate = useNavigate();

  const [r, setR] = React.useState<any>(null);
  const [dbLeaderboard, setDbLeaderboard] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    if (shouldUseFixtures()) {
      const routineObj = fixtureRoutines.find((x) => x.id === id) || fixtureRoutines[0];
      setR(routineObj);
      setDbLeaderboard(fixtureLeaderboard);
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const details = await tranceRoutineService.getRoutineDetails(id || "rt001");
        const board = await tranceLeaderboardService.getLeaderboard(id || "rt001");
        if (active) {
          setR(details);
          setDbLeaderboard(board);
        }
      } catch (err) {
        console.error("Failed to load routine details:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading || !r) {
    return (
      <TranceShell>
        <div className="min-h-screen grid place-items-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-fuchsia-500 border-white/10 animate-spin mx-auto mb-4" />
            <div className="text-xs text-white/50 uppercase tracking-widest">
              Loading Routine Details...
            </div>
          </div>
        </div>
      </TranceShell>
    );
  }

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const breakdown =
    r.countSections && r.countSections.length
      ? r.countSections
      : [
          { id: "d1", index: 1, label: "Intro Groove", counts: "8 Counts" },
          { id: "d2", index: 2, label: "Chest Pop & Roll", counts: "8 Counts" },
          { id: "d3", index: 3, label: "Traveling Footwork", counts: "16 Counts" },
          { id: "d4", index: 4, label: "Hit & Freeze", counts: "8 Counts" },
        ];

  return (
    <TranceShell>
      <TranceTopBar
        back
        title={<TranceLogo size="sm" sub="POWERED BY TREY TV" />}
        right={
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-white/15 bg-white/5 grid place-items-center">
              <Bookmark className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-full border border-white/15 bg-white/5 grid place-items-center">
              ···
            </button>
          </div>
        }
      />

      {/* Stage + info: 2-column hero on desktop */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-6 lg:items-start mb-4 lg:mb-6">
      <div>
      {/* Video preview */}
      <TranceGlassCard glow="magenta" className="overflow-hidden mb-4 lg:mb-0">
        <div className="relative aspect-video">
          <img
            src={r.cover}
            className="absolute inset-0 w-full h-full object-cover"
            alt={r.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="text-[9px] font-bold bg-black/60 px-2 py-1 rounded-full border border-white/20 uppercase">
              Choreographer
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="font-black text-yellow-300 italic text-lg">
                {r.choreographerName}
              </span>
              {r.choreographerVerified && <VerifiedTick className="w-3.5 h-3.5" />}
            </div>
          </div>
          <button
            onClick={() => navigate(TRANCE_ROUTES.learn(r.id))}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur grid place-items-center border border-white/30"
          >
            <Play className="w-6 h-6 fill-white" />
          </button>
          <div className="absolute bottom-3 left-3 text-[10px] text-white/70 bg-black/50 px-2 py-1 rounded">
            0:00 / {fmtTime(r.durationSec)}
          </div>
        </div>
      </TranceGlassCard>
      </div>

      <div className="space-y-4">
      {/* Title + difficulty */}
      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <h1 className="text-4xl font-black uppercase bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-400">
            {r.title}
          </h1>
          <p className="text-[11px] text-white/50 uppercase tracking-wide">{r.tagline}</p>
        </div>
        <TranceGlassCard glow="gold" className="px-4 py-2 text-center shrink-0">
          <div className="text-[8px] text-white/60 uppercase">Difficulty</div>
          <div className="text-yellow-300 font-black text-sm">{r.difficulty}</div>
          <div className="flex gap-0.5 justify-center mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-2.5 h-2.5",
                  i < (r.difficulty === "Advanced" ? 4 : 3)
                    ? "text-yellow-300 fill-yellow-300"
                    : "text-white/20",
                )}
              />
            ))}
          </div>
        </TranceGlassCard>
      </div>

      {/* Meta */}
      <TranceGlassCard className="p-3 grid grid-cols-3 divide-x divide-white/10 mb-4">
        {(
          [
            [Clock, "DURATION", fmtTime(r.durationSec)],
            [Activity, "TEMPO", `${r.bpm} BPM`],
            [Crown, "STYLE", r.style],
          ] as [any, string, string][]
        ).map(([Icon, l, v], i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Icon className="w-4 h-4 text-fuchsia-300" />
            <span className="text-[8px] text-white/50 uppercase">{l}</span>
            <span className="text-sm font-black text-white">{v}</span>
          </div>
        ))}
      </TranceGlassCard>

      {/* Move tags */}
      {r.tags && r.tags.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-fuchsia-300" />
            <span className="text-xs font-black text-white uppercase">Move Tags</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {r.tags.map((t: string) => (
              <span
                key={t}
                className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/5 text-fuchsia-200 uppercase"
              >
                {t}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Mode CTAs */}
      <div className="flex gap-2 mb-6">
        <SessionModeCard
          mode="Learn"
          subtitle="Follow along step-by-step"
          onClick={() => navigate(TRANCE_ROUTES.learn(r.id))}
        />
        <SessionModeCard
          mode="Practice"
          subtitle="Drill. Refine. Perfect."
          onClick={() => navigate(TRANCE_ROUTES.practice(r.id))}
        />
        <SessionModeCard
          mode="Performance"
          subtitle="Show out. Get scored."
          onClick={() => navigate(TRANCE_ROUTES.performance(r.id))}
        />
      </div>
      </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 lg:gap-4">
        <TranceGlassCard glow="purple" className="p-4">
          <h3 className="font-black text-white uppercase mb-3">Move Breakdown</h3>
          <div className="space-y-2">
            {breakdown.slice(0, 4).map((b: any, i: number) => (
              <div key={b.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/30 border border-purple-400/40 grid place-items-center text-xs font-black text-purple-200">
                  {i + 1}
                </span>
                <img
                  src={[IMG.r1, IMG.r2, IMG.r3, IMG.r4][i] || IMG.r1}
                  className="w-10 h-10 rounded-lg object-cover"
                  alt=""
                />
                <div className="flex-1">
                  <div className="text-sm font-bold text-white uppercase">{b.label}</div>
                  <div className="text-[10px] text-white/50">{b.counts}</div>
                </div>
                <button className="w-7 h-7 rounded-full bg-fuchsia-500/20 grid place-items-center">
                  <Play className="w-3 h-3 fill-fuchsia-300 text-fuchsia-300" />
                </button>
              </div>
            ))}
          </div>
        </TranceGlassCard>

        <TranceGlassCard glow="cyan" className="p-4">
          <h3 className="font-black text-white uppercase mb-3">8-Count Structure</h3>
          <CountStructureCard
            sections={
              r.countSections && r.countSections.length
                ? r.countSections
                : breakdown.map((b: any, i: number) => ({
                    ...b,
                    counts: `${i * 8 + 1}-${i * 8 + 8}`,
                  }))
            }
            bpm={r.bpm}
          />
        </TranceGlassCard>
      </div>

      {/* Leaderboard preview */}
      <div className="flex items-center justify-between mt-6 mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-300" />
          <h3 className="font-black text-white uppercase">Leaderboard Preview</h3>
        </div>
        <button
          onClick={() => navigate(TRANCE_ROUTES.leaderboard(r.id))}
          className="text-xs font-bold text-fuchsia-400 flex items-center gap-1"
        >
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-3 sm:overflow-visible">
        {dbLeaderboard.slice(0, 4).map((e) => (
          <div
            key={e.rank}
            className={cn(
              "shrink-0 w-44 sm:w-full flex items-center gap-2 p-2 rounded-xl border",
              e.rank === 1
                ? "border-yellow-400/50 bg-yellow-500/10"
                : "border-white/10 bg-white/[0.03]",
            )}
          >
            <span className={cn("font-black", e.rank === 1 ? "text-yellow-300" : "text-white/50")}>
              {e.rank}
            </span>
            <img
              src={e.user.avatar || IMG.maleA}
              className="w-9 h-9 rounded-full object-cover border border-white/20"
              alt={e.user.displayName}
            />
            <div className="min-w-0">
              <div className="text-xs font-black text-white uppercase truncate">
                {e.user.displayName}
              </div>
              <div className="text-[10px] text-cyan-300">{(e.score / 1000).toFixed(1)}K</div>
            </div>
          </div>
        ))}
        {dbLeaderboard.length === 0 && (
          <p className="text-xs text-white/40 py-4 px-2">No scores submitted yet. Be the first!</p>
        )}
      </div>

      <button
        onClick={() => navigate(TRANCE_ROUTES.learn(r.id))}
        className="w-full mt-6 rounded-2xl py-4 font-black text-lg tracking-[0.3em] text-white bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 border border-fuchsia-400/50 shadow-[0_0_30px_-6px_rgba(217,70,239,0.7)] active:scale-95 transition"
      >
        &gt;&gt;&gt;&nbsp;&nbsp;LET'S DANCE&nbsp;&nbsp;&lt;&lt;&lt;
      </button>
    </TranceShell>
  );
};

export default RoutineDetailScreen;
