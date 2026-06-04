import React from "react";
import {
  ScreenWrap,
  TreyHeader,
  TreyBottomNav,
  GlossyButton,
  GlassCard,
  BrandLogo,
  catColor,
  NEON,
} from "../components/TreyShell";
import { MOCK_PLAYER } from "../treynounMockData";
import { TreynounStats } from "../treynounStorage";
import {
  User,
  Users,
  Radio,
  ChevronRight,
  Trophy,
  Flame,
  Crosshair,
  CalendarDays,
  BadgeCheck,
  Lock,
  type LucideIcon,
} from "lucide-react";

type HomeModeId = "solo" | "pass-noun" | "battle" | "live-room";
type ModeCard = {
  id: HomeModeId | "daily";
  title: string;
  desc: string;
  Icon: LucideIcon;
  color: string;
  soon?: boolean;
};
type CategoryShowcaseCard = { label: string; key: "person" | "place" | "thing"; Icon: LucideIcon };

interface Props {
  stats?: TreynounStats;
  onPlay: () => void;
  onMode: (m: HomeModeId) => void;
  onModeSelect: () => void;
  onLeaderboard: () => void;
  onExit: () => void;
}

const modes: ModeCard[] = [
  {
    id: "solo",
    title: "Noun Chase Solo",
    desc: "Chase the target noun against the clock in 5 intense rounds.",
    Icon: Crosshair,
    color: NEON.cyan,
  },
  {
    id: "pass-noun",
    title: "Pass The Noun",
    desc: "Build a secret trail of signal clues and pass the device.",
    Icon: User,
    color: NEON.gold,
  },
  {
    id: "battle",
    title: "Noun Battle",
    desc: "Race other players in teams! Lock in, steal, and trap nouns.",
    Icon: Users,
    color: NEON.magenta,
  },
  {
    id: "live-room",
    title: "Live Noun Room",
    desc: "Join the party room and guess live alongside the host.",
    Icon: Radio,
    color: NEON.teal,
  },
  {
    id: "daily",
    title: "Daily Noun Drop",
    desc: "One fresh target noun drops every 24 hours. Compete globally.",
    Icon: CalendarDays,
    color: "#A78BFA",
    soon: true,
  },
];

const TreynounHome: React.FC<Props> = ({
  stats,
  onPlay,
  onMode,
  onModeSelect,
  onLeaderboard,
  onExit,
}) => {
  const hotTrail = stats ? stats.bestHotTrail : MOCK_PLAYER.hotTrail;
  const rank = stats ? stats.rank : MOCK_PLAYER.rank;
  const nounScore = stats ? stats.totalNounScore : 0;

  return (
    <ScreenWrap>
      <TreyHeader />
      <div className="flex-1 overflow-y-auto trey-scroll px-4 pb-6 trey-rise">
        {/* Hero & Title Treatment */}
        <div className="text-center mt-6 relative py-4 px-2 rounded-3xl overflow-hidden bg-gradient-to-b from-[#110e29]/40 to-transparent border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          <BrandLogo
            size="text-7xl"
            className="trey-float inline-block drop-shadow-[0_0_35px_rgba(150,90,255,0.3)]"
          />
          <p className="mt-3 text-xs tracking-widest text-cyan-400 font-extrabold uppercase">
            Trey TV Original Game
          </p>
          <p className="mt-1 text-sm text-white/60 italic font-medium">
            "Every noun leaves a trail. Can you crack the signals?"
          </p>
        </div>

        {/* Category Lanes Showcase */}
        <div className="flex gap-3 mt-6">
          {(
            [
              { label: "PERSON", key: "person", Icon: User },
              { label: "PLACE", key: "place", Icon: Radio },
              { label: "THING", key: "thing", Icon: Crosshair },
            ] satisfies CategoryShowcaseCard[]
          ).map(({ label, key, Icon }) => (
            <div
              key={key}
              className="relative flex-1 aspect-[3/4] rounded-3xl border-2 flex flex-col items-center justify-center p-2 overflow-hidden hover:scale-105 transition-all duration-300"
              style={{
                borderColor: catColor[key],
                background: `linear-gradient(180deg,${catColor[key]}22,${catColor[key]}04)`,
                boxShadow: `0 0 20px ${catColor[key]}22`,
              }}
            >
              <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-full animate-[shimmer_6s_infinite]" />
              <Icon
                className="w-10 h-10 trey-glow"
                style={{ color: catColor[key], filter: `drop-shadow(0 0 8px ${catColor[key]})` }}
              />
              <span
                className="font-black text-xs mt-3 tracking-wider"
                style={{ color: catColor[key] }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Hero CTA Button */}
        <div className="mt-6 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full blur opacity-50 group-hover:opacity-75 transition duration-300" />
          <GlossyButton onClick={onPlay} className="w-full py-5 text-2xl relative">
            CHASE THE NOUN <ChevronRight className="w-7 h-7 ml-1 animate-pulse" />
          </GlossyButton>
        </div>

        {/* Game Modes Section */}
        <div className="mt-8 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-white/50 tracking-widest">
              SELECT GAME MODE
            </span>
            <span className="text-[10px] text-cyan-400 font-extrabold uppercase">
              Local & Party
            </span>
          </div>

          {modes.map(({ id, title, desc, Icon, color, soon }) => (
            <GlassCard
              key={id}
              glow={soon ? undefined : color}
              onClick={
                soon ? undefined : () => (id === "solo" ? onPlay() : onMode(id as HomeModeId))
              }
              className={`p-4 flex items-center gap-4 transition-all duration-300 hover:translate-x-1.5 hover:scale-[1.01] ${soon ? "opacity-55" : "hover:border-white/15"}`}
              style={soon ? { border: "1px solid rgba(255,255,255,0.04)" } : undefined}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 trey-glow transition-all duration-300"
                style={{
                  color,
                  border: `2px solid ${color}`,
                  background: `${color}15`,
                  boxShadow: soon ? "none" : `0 0 12px ${color}33`,
                }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-black text-base flex items-center gap-2 text-white">
                  {title}
                  {soon && (
                    <span className="text-[8px] bg-purple-900/40 text-purple-300 border border-purple-500/30 rounded-full px-2 py-0.5 font-bold tracking-wider uppercase">
                      Soon
                    </span>
                  )}
                  {id === "battle" && (
                    <span className="text-[8px] bg-red-950/40 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5 font-bold tracking-wider uppercase animate-pulse">
                      Hot
                    </span>
                  )}
                  {id === "live-room" && (
                    <span className="text-[8px] bg-teal-950/40 text-teal-400 border border-teal-500/30 rounded-full px-2 py-0.5 font-bold tracking-wider uppercase">
                      Live
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/50 leading-snug mt-0.5 truncate">{desc}</div>
              </div>
              {soon ? (
                <Lock className="w-4 h-4 text-white/30 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-white/40 shrink-0 group-hover:text-white transition-colors" />
              )}
            </GlassCard>
          ))}
        </div>

        {/* Player Profile Stat Card */}
        <GlassCard
          className="mt-8 p-4 flex items-center gap-4 border border-yellow-500/25 bg-gradient-to-r from-yellow-500/5 to-transparent"
          glow={NEON.gold}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-700 flex items-center justify-center font-black text-black text-xl shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            TL
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-base flex items-center gap-1.5 text-white">
              {MOCK_PLAYER.name}
              <BadgeCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            </div>
            <div className="text-xs font-bold text-cyan-400">{MOCK_PLAYER.title}</div>
            <div className="text-xs text-white/60 mt-1 flex items-center gap-1.5">
              <span>Noun Score:</span>
              <strong className="text-yellow-300 font-extrabold">
                {nounScore.toLocaleString()}
              </strong>
            </div>
          </div>
          <div className="text-center px-2 border-l border-white/10 shrink-0">
            <div className="text-[9px] text-yellow-400 font-black tracking-wider">HOT TRAIL</div>
            <div className="flex items-center gap-1 justify-center mt-1">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500/30 animate-pulse" />
              <span className="font-black text-lg text-white">{hotTrail}</span>
            </div>
          </div>
          <button
            onClick={onLeaderboard}
            className="text-center px-2 border-l border-white/10 shrink-0 active:scale-95 group transition-transform"
          >
            <Trophy className="w-5 h-5 text-yellow-400 mx-auto group-hover:scale-110 transition-transform" />
            <div className="text-[11px] font-black text-white mt-1">#{rank}</div>
          </button>
        </GlassCard>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={onModeSelect}
            className="rounded-2xl bg-black/40 border border-white/10 py-3.5 text-sm font-black text-white/80 hover:text-white hover:border-white/20 transition active:scale-95"
          >
            How To Play
          </button>
          <button
            onClick={onLeaderboard}
            className="rounded-2xl bg-black/40 border border-yellow-500/20 py-3.5 text-sm font-black text-yellow-300 hover:border-yellow-500/40 hover:bg-yellow-500/5 transition active:scale-95"
          >
            Leaderboard
          </button>
        </div>

        <button
          onClick={onExit}
          className="w-full mt-6 text-xs text-white/40 hover:text-white/60 transition underline"
        >
          Back to Trey TV Games
        </button>
      </div>
      <TreyBottomNav active="home" onHome={onExit} />
    </ScreenWrap>
  );
};

export default TreynounHome;
