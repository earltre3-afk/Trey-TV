import React from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { useNavigate } from "../hooks/router-compat";
import {
  Plus,
  Bell,
  Zap,
  Users,
  Video,
  Trophy,
  Flame,
  ChevronRight,
  Play,
  Info,
} from "lucide-react";
import { TranceShell, TranceTopBar } from "../components/shell";
import {
  TranceGlassCard,
  TranceGradientTitle,
  TranceStatRing,
  GradientButton,
  cn,
  VerifiedTick,
} from "../components/primitives";
import { ChoreographerCard, TrendingDanceCard, StudioRoomCard } from "../components/cards";
import { choreographers, routines, studios, IMG } from "../data/devFixtures";
import { TRANCE_ROUTES } from "../routes/manifest";
import { useAuth } from "../auth/AuthContext";
import { TranceAccountButton } from "../auth/TranceAccountButton";

const SectionHead: React.FC<{ title: string; onMore?: () => void; gradient?: boolean }> = ({
  title,
  onMore,
  gradient,
}) => (
  <div className="flex items-center justify-between mb-3 mt-6">
    {gradient ? (
      <TranceGradientTitle className="text-lg">{title}</TranceGradientTitle>
    ) : (
      <h3 className="text-lg font-black text-white uppercase tracking-wide">{title}</h3>
    )}
    {onMore && (
      <button
        onClick={onMore}
        className="text-xs font-bold text-fuchsia-400 flex items-center gap-1"
      >
        VIEW ALL <ChevronRight className="w-3 h-3" />
      </button>
    )}
  </div>
);

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { effectiveProfile: me, isAuthed } = useAuth();
  const styles = ["All", "Hip Hop", "Afro", "Heels", "Freestyle", "K-Pop"];
  const [active, setActive] = React.useState("All");

  const quickEntries = [
    {
      icon: Zap,
      label: "Random",
      sub: "Practice",
      color: "text-fuchsia-300 border-fuchsia-400/40",
    },
    { icon: Users, label: "Join", sub: "Room", color: "text-cyan-300 border-cyan-400/40" },
    { icon: Video, label: "Record", sub: "Dance", color: "text-pink-300 border-pink-400/40" },
    {
      icon: Trophy,
      label: "Challenge",
      sub: "Yourself",
      color: "text-yellow-300 border-yellow-400/40",
    },
  ];

  return (
    <TranceShell>
      <TranceTopBar
        title={
          <Link to="/" className="shrink-0 relative group flex items-center">
            <span
              aria-hidden="true"
              className="absolute inset-0 -m-7 rounded-full blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.55),oklch(0.7_0.25_340_/_0.45),oklch(0.65_0.22_300_/_0.5),oklch(0.82_0.15_215_/_0.45),oklch(0.82_0.16_85_/_0.55))] animate-conic-spin"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 -m-3 rounded-full bg-primary/30 blur-xl animate-glow-pulse"
            />
            <Logo className="h-14 md:h-18 lg:h-24 relative z-10 transition-transform duration-500 group-hover:scale-110 group-active:scale-95" />
          </Link>
        }
        points={12450}
        right={<TranceAccountButton />}
      />

      {/* Featured Hero Banner for Desktop (hidden on mobile) */}
      <div className="hidden lg:block relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 mb-6 group aspect-[2.4/1]">
        <img
          src={IMG.r1}
          className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
          alt="featured hero"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05030a] via-[#05030a]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05030a] via-transparent to-[#05030a]/10" />

        <div className="relative h-full flex flex-col justify-center p-8 max-w-lg space-y-4">
          <span className="text-[10px] font-black text-yellow-300 uppercase tracking-[0.3em] bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full w-max">
            CHOREOGRAPHY OF THE WEEK
          </span>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-white uppercase">VIBES ONLY</h1>
            <p className="text-xs text-fuchsia-300">
              Choreography by Trey Songz · Advanced · 124 BPM
            </p>
          </div>
          <p className="text-xs text-white/50 leading-relaxed max-w-sm">
            Transcend into the groove with our premium signature combination. Synchronize your flow,
            unlock double energy points, and claim your crown on the global ranks.
          </p>
          <div className="flex gap-3 pt-2">
            <GradientButton
              onClick={() => navigate(TRANCE_ROUTES.routine("rt001"))}
              className="flex items-center gap-2 text-xs py-2 px-4 shadow-[0_0_15px_rgba(217,70,239,0.5)]"
            >
              <Play className="w-4 h-4 fill-white" /> START TRAINING
            </GradientButton>
            <button
              onClick={() => navigate(TRANCE_ROUTES.leaderboard("rt001"))}
              className="rounded-xl border border-white/25 bg-white/5 hover:bg-white/10 text-xs font-bold px-4 py-2 transition-all"
            >
              VIEW LEADERBOARD
            </button>
          </div>
        </div>
      </div>

      {/* Hero (Mobile only, hidden on desktop to avoid branding duplication) */}
      <div className="text-center mt-2 mb-1 lg:hidden">
        <div
          className="font-black text-5xl tracking-[0.08em] bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-400"
          style={{ filter: "drop-shadow(0 0 18px rgba(217,70,239,0.4))" }}
        >
          TRANCE
        </div>
        <div className="text-[10px] tracking-[0.35em] text-white/40 mt-1">DANCE BY TREY TV</div>
        <div className="text-sm font-bold mt-2 tracking-widest">
          <span className="text-fuchsia-400">TRAIN.</span>{" "}
          <span className="text-purple-300">EXPRESS.</span>{" "}
          <span className="text-cyan-400">TRANSCEND.</span>
        </div>
      </div>

      {/* Status + Energy (Mobile/Tablet only, hidden on desktop since it is fully visible in the sticky left sidebar) */}
      <div className="mt-4 lg:hidden">
        {/* Mobile View: Super streamlined horizontal dashboard */}
        <div className="block md:hidden">
          <TranceGlassCard glow="gold" className="p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              {/* Profile Avatar & Lv */}
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full grid place-items-center bg-gradient-to-br from-yellow-500/20 to-amber-700/10 border-2 border-yellow-400/40 shrink-0">
                  <img
                    src={me.avatar || IMG.logo}
                    className="w-9 h-9 rounded-full object-cover"
                    alt="avatar"
                  />
                  <span className="absolute -bottom-1 -right-1 text-[8px] font-black bg-black px-1.5 py-0.2 rounded border border-yellow-400/50 text-yellow-300">
                    Lv. {me.level}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-black text-white text-xs tracking-wider truncate uppercase">
                      {isAuthed ? me.displayName : "DANCER"}
                    </span>
                    {me.verified && <VerifiedTick className="w-3 h-3" />}
                  </div>
                  <p className="text-[9px] text-white/40 truncate">
                    {isAuthed ? me.handle : "Mode Active"}
                  </p>
                </div>
              </div>

              {/* Stats: Streak & Energy Side-by-Side */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-xl">
                  <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                  <div className="text-right">
                    <div className="text-xs font-black text-white leading-none">
                      {me.dayStreak}d
                    </div>
                    <span className="text-[7px] text-white/40 uppercase font-bold">STREAK</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-xl">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <div className="text-right">
                    <div className="text-xs font-black text-cyan-300 leading-none">
                      {me.tranceEnergy}
                    </div>
                    <span className="text-[7px] text-white/40 uppercase font-bold">ENERGY</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro XP Progress Bar */}
            <div className="border-t border-white/5 pt-2.5">
              <div className="flex justify-between text-[8px] text-white/40 mb-1">
                <span className="uppercase font-bold tracking-wider">XP Progress</span>
                <span className="font-mono">
                  {me.xp.toLocaleString()} / {me.xpToNext.toLocaleString()} XP (
                  {Math.round((me.xp / me.xpToNext) * 100)}%)
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 shadow-[0_0_8px_rgba(217,70,239,0.5)]"
                  style={{ width: `${(me.xp / me.xpToNext) * 100}%` }}
                />
              </div>
            </div>
          </TranceGlassCard>
        </div>

        {/* Tablet View: Standard side-by-side grids */}
        <div className="hidden md:grid md:grid-cols-3 gap-3">
          <TranceGlassCard glow="gold" className="md:col-span-2 p-3 flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-full grid place-items-center bg-gradient-to-br from-yellow-500/30 to-amber-700/20 border-2 border-yellow-400/50">
              <img
                src={me.avatar || IMG.logo}
                className="w-12 h-12 rounded-full object-cover"
                alt="lvl"
              />
              <span className="absolute -bottom-1 text-[9px] font-black bg-black px-1.5 py-0.5 rounded border border-yellow-400/50 text-yellow-300">
                Lv. {me.level}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-black text-white truncate">
                  {isAuthed ? me.displayName.toUpperCase() : "TRANCE MODE"}
                </span>
                {me.verified && <VerifiedTick className="w-3.5 h-3.5" />}
              </div>
              <p className="text-[10px] text-white/50 uppercase truncate">
                {isAuthed ? me.handle : "Dancer · Visionary"}
              </p>
              <div className="h-1.5 rounded-full bg-white/10 mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500"
                  style={{ width: `${(me.xp / me.xpToNext) * 100}%` }}
                />
              </div>
              <p className="text-[9px] text-white/40 mt-1">
                {me.xp.toLocaleString()} / {me.xpToNext.toLocaleString()} XP
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="text-xl font-black text-white">{me.dayStreak}</span>
              </div>
              <p className="text-[8px] text-white/50 uppercase">Day Streak</p>
            </div>
          </TranceGlassCard>
          <TranceGlassCard glow="cyan" className="p-3 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-black text-purple-300 uppercase">Trance Energy</span>
              <Info className="w-3.5 h-3.5 text-white/30" />
            </div>
            <TranceStatRing
              value={me.tranceEnergy}
              max={1000}
              size={92}
              color="#22d3ee"
              big={
                <div className="text-center">
                  <Zap className="w-4 h-4 mx-auto text-cyan-300 mb-0.5" />
                  <div className="text-xl font-black text-white">{me.tranceEnergy}</div>
                  <div className="text-[9px] text-white/40">/1,000</div>
                </div>
              }
            />
            <p className="text-[9px] text-white/50 uppercase mt-1">Dance. Earn. Level up.</p>
          </TranceGlassCard>
        </div>
      </div>

      {/* Style chips */}
      <div className="flex gap-2 overflow-x-auto mt-4 pb-1 no-scrollbar">
        {styles.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap",
              active === s
                ? "bg-gradient-to-r from-fuchsia-500/30 to-purple-500/20 border-fuchsia-400/60 text-white"
                : "border-white/10 bg-white/[0.03] text-white/60",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <SectionHead
        title="Featured Choreographers"
        onMore={() => navigate(TRANCE_ROUTES.choreographer("c001"))}
      />
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {choreographers.map((c) => (
          <ChoreographerCard key={c.id} c={c} />
        ))}
      </div>

      <SectionHead
        title="Trending Dances"
        onMore={() => navigate(TRANCE_ROUTES.explore)}
        gradient
      />
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {routines.slice(1, 6).map((r, i) => (
          <TrendingDanceCard key={r.id} routine={r} rank={i + 1} />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-6">
        <TranceGlassCard glow="purple" className="p-4">
          <SectionHead
            title="Private Rooms"
            onMore={() => navigate(TRANCE_ROUTES.studio("s001"))}
          />
          <div className="space-y-2 -mt-3">
            {studios.map((s) => (
              <StudioRoomCard key={s.id} s={s} />
            ))}
          </div>
        </TranceGlassCard>
        <TranceGlassCard glow="magenta" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-white uppercase">Continue Practice</h3>
            <button
              onClick={() => navigate(TRANCE_ROUTES.learn("rt002"))}
              className="text-xs font-bold text-fuchsia-400"
            >
              VIEW ALL
            </button>
          </div>
          <div className="relative rounded-xl overflow-hidden">
            <img src={routines[1].cover} className="w-full h-28 object-cover" alt="continue" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/20 flex items-center px-4">
              <TranceStatRing
                value={65}
                size={64}
                color="#22d3ee"
                big={<span className="text-lg font-black text-white">65%</span>}
              />
              <div className="ml-3">
                <h4 className="font-black text-white">OUTER BODY</h4>
                <p className="text-[10px] text-white/50">By Trey · Intermediate</p>
              </div>
            </div>
          </div>
          <GradientButton
            onClick={() => navigate(TRANCE_ROUTES.learn("rt002"))}
            className="w-full mt-3 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" /> RESUME PRACTICE
          </GradientButton>
        </TranceGlassCard>
      </div>

      <SectionHead title="Quick Entry" />
      <div className="grid grid-cols-4 gap-2">
        {quickEntries.map((q) => (
          <button
            key={q.label}
            onClick={() => navigate(TRANCE_ROUTES.builder)}
            className={cn(
              "rounded-2xl border bg-white/[0.03] p-3 flex flex-col items-center gap-1.5 active:scale-95 transition",
              q.color,
            )}
          >
            <q.icon className="w-6 h-6" />
            <span className="text-[11px] font-black text-white uppercase leading-none">
              {q.label}
            </span>
            <span className="text-[8px] text-white/50 uppercase">{q.sub}</span>
          </button>
        ))}
      </div>
    </TranceShell>
  );
};

export default HomeScreen;
