import React from "react";
import { useParams, useNavigate } from "../hooks/router-compat";
import { TRANCE_ROUTES } from "../routes/manifest";
import {
  Globe,
  MapPin,
  Building2,
  Users,
  Clock,
  ChevronRight,
  Crown,
  BarChart3,
  Trophy,
  Play,
} from "lucide-react";
import { TranceShell, TranceTopBar, TranceLogo } from "../components/shell";
import { TranceGlassCard, GradientButton, cn, EmptyState } from "../components/primitives";
import { LeaderboardRow } from "../components/cards";
import { leaderboard as fixtureLeaderboard, routines, IMG } from "../data/devFixtures";
import { tranceRoutineService, tranceLeaderboardService } from "../services";
import { shouldUseFixtures } from "../services/config";

const tabs = [
  { label: "Global", icon: Globe },
  { label: "Local", icon: MapPin },
  { label: "Studio", icon: Building2 },
  { label: "Friends", icon: Users },
];

const LeaderboardScreen: React.FC = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState("Global");

  const [r, setR] = React.useState<any>(null);
  const [entries, setEntries] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    if (shouldUseFixtures()) {
      setR(routines.find((x) => x.id === routineId) || routines[0]);
      setEntries(tab === "Friends" ? [] : fixtureLeaderboard);
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const routineData = await tranceRoutineService.getRoutineDetails(routineId || "rt001");
        const divisionMapped =
          tab === "Local"
            ? "Local"
            : tab === "Studio"
              ? "Studio"
              : tab === "Friends"
                ? "Friends"
                : "Global";
        const entriesData = await tranceLeaderboardService.getLeaderboard(
          routineId || "rt001",
          divisionMapped as any,
        );
        if (active) {
          setR(routineData);
          setEntries(entriesData);
        }
      } catch (err) {
        console.error("Failed to load leaderboard data:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [routineId, tab]);

  if (loading || !r) {
    return (
      <TranceShell>
        <div className="min-h-screen grid place-items-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-fuchsia-500 border-white/10 animate-spin mx-auto mb-4" />
            <div className="text-xs text-white/50 uppercase tracking-widest">
              Loading Leaderboard...
            </div>
          </div>
        </div>
      </TranceShell>
    );
  }

  const topScoreEntry = entries[0] || (shouldUseFixtures() ? fixtureLeaderboard[0] : null);

  return (
    <TranceShell>
      <TranceTopBar back title={<TranceLogo size="sm" sub="TREY TV" />} points={12450} />

      {/* Routine banner */}
      <TranceGlassCard glow="magenta" className="overflow-hidden mb-4">
        <div className="relative h-32">
          <img
            src={r.cover}
            className="absolute inset-0 w-full h-full object-cover"
            alt={r.title}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="relative p-4 flex items-center justify-between h-full">
            <div>
              <span className="text-[9px] font-bold bg-fuchsia-500/30 border border-fuchsia-400/40 px-2 py-0.5 rounded-full uppercase">
                Routine
              </span>
              <h2 className="text-2xl font-black text-white uppercase mt-1">{r.title}</h2>
              <p className="text-[11px] text-white/60">Choreography by {r.choreographerName}</p>
              <div className="flex gap-3 text-[10px] text-white/60 mt-1">
                <span>♪ {r.bpm} BPM</span>
                <span>
                  {Math.floor(r.durationSec / 60)}:{String(r.durationSec % 60).padStart(2, "0")}
                </span>
                <span>{r.formation}</span>
              </div>
            </div>
            <button
              onClick={() => navigate(TRANCE_ROUTES.learn(r.id))}
              className="w-14 h-14 rounded-full bg-white/15 backdrop-blur grid place-items-center border border-white/30"
            >
              <Play className="w-6 h-6 fill-white" />
            </button>
          </div>
        </div>
      </TranceGlassCard>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1 mb-3">
        {tabs.map((t) => (
          <button
            key={t.label}
            onClick={() => setTab(t.label)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs font-bold",
              tab === t.label
                ? "bg-gradient-to-r from-fuchsia-500/40 to-purple-500/30 text-white"
                : "text-white/50",
            )}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Reset countdown */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[11px] text-white/60">
          <span className="uppercase font-bold">Resets in</span>
          <span className="flex items-center gap-1 text-yellow-300 font-black">
            <Clock className="w-3.5 h-3.5" />
            3D : 14H : 27M
          </span>
        </div>
        <button className="text-[11px] font-bold text-white/70 border border-white/15 rounded-lg px-3 py-1.5 flex items-center gap-1">
          This Week <ChevronRight className="w-3 h-3 rotate-90" />
        </button>
      </div>

      {/* Ranked list */}
      {entries.length === 0 ? (
        <EmptyState
          title="No ranks available"
          message="Complete routine sessions to rank up and challenge other trancers."
          icon={<Users className="w-7 h-7" />}
        />
      ) : (
        <div className="space-y-2 mb-4">
          {entries.map((e, index) => (
            <LeaderboardRow key={e.user?.id || index} e={{ ...e, rank: index + 1 }} />
          ))}
        </div>
      )}

      {/* Top performance + weekly winners */}
      {topScoreEntry && (
        <div className="grid md:grid-cols-2 gap-3 mt-6">
          <TranceGlassCard glow="purple" className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-yellow-300" />
              <div>
                <h3 className="font-black text-white uppercase text-sm">Top Performance</h3>
                <span className="text-[10px] text-white/50">This Week</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400">
                <img
                  src={topScoreEntry.user.avatar || IMG.maleA}
                  className="w-full h-full object-cover"
                  alt="top"
                />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] font-black bg-fuchsia-600 px-1.5 rounded">
                  SSS
                </span>
              </div>
              <div>
                <div className="font-black text-yellow-300 uppercase">
                  {topScoreEntry.user.displayName}
                </div>
                <div className="text-xl font-black text-white">
                  {topScoreEntry.score.toLocaleString()}
                </div>
                <span className="text-[9px] font-bold text-yellow-300 border border-yellow-400/40 rounded-full px-2">
                  CURRENT LEADER!
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center mb-3">
              {[
                ["Perfect", 678],
                ["Great", 24],
                ["Good", 3],
                ["Miss", 0],
              ].map(([l, v]) => (
                <div key={l}>
                  <div className="text-sm font-black text-white">{v}</div>
                  <div className="text-[8px] text-white/50 uppercase">{l}</div>
                </div>
              ))}
            </div>
            <GradientButton
              onClick={() => navigate(TRANCE_ROUTES.learn(r.id))}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-sm"
            >
              <Play className="w-4 h-4" />
              Dance Now
            </GradientButton>
          </TranceGlassCard>

          <TranceGlassCard glow="cyan" className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-cyan-300" />
              <div>
                <h3 className="font-black text-white uppercase text-sm">Weekly Winners</h3>
                <span className="text-[10px] text-white/50">Top 3 Win Rewards</span>
              </div>
            </div>
            {(
              [
                ["1ST PLACE", "5,000", "TRUNO Hoodie", "text-yellow-300"],
                ["2ND PLACE", "3,000", "TRUNO Cap", "text-white/70"],
                ["3RD PLACE", "2,000", "TRUNO Tee", "text-orange-400"],
              ] as const
            ).map(([place, pts, item, color]) => (
              <div
                key={place}
                className="flex items-center gap-2 p-2 rounded-xl border border-white/10 bg-white/[0.03] mb-2"
              >
                <span className={cn("font-black w-6", color)}>{place[0]}</span>
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-white">{place}</div>
                </div>
                <span className="text-xs font-black text-yellow-300">{pts}</span>
                <span className="text-[9px] text-white/50">{item}</span>
              </div>
            ))}
            <div className="text-center text-xs font-bold text-cyan-300 mt-2">
              WIN BIG. REPRESENT TREY TV.
            </div>
          </TranceGlassCard>
        </div>
      )}
    </TranceShell>
  );
};

export default LeaderboardScreen;
