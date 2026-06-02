import React from "react";
import { useParams, useNavigate } from "../hooks/router-compat";
import { Send, Bell, Lock, Globe, Play, ChevronRight, Star } from "lucide-react";
import { TranceShell, TranceTopBar } from "../components/shell";
import {
  TranceGlassCard,
  TranceBadge,
  GradientButton,
  cn,
  VerifiedTick,
} from "../components/primitives";
import { RehearsalAssignmentCard } from "../components/cards";
import { choreographers, routines, assignments } from "../data/devFixtures";
import { ErrorState } from "../components/primitives";
import { TRANCE_ROUTES } from "../routes/manifest";

const tabs = ["Sessions", "Rehearsals", "Studio", "Team", "Notes"];

const ChoreographerScreen: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const c = choreographers.find((x) => x.id === id) || choreographers[0];
  const [tab, setTab] = React.useState("Sessions");
  if (!c)
    return (
      <TranceShell>
        <ErrorState label="Choreographer not found." />
      </TranceShell>
    );

  const fmt = (n: number) =>
    n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${n}`;

  return (
    <TranceShell>
      <TranceTopBar
        back
        right={
          <button className="w-10 h-10 rounded-full border border-white/15 bg-white/5 grid place-items-center">
            ···
          </button>
        }
      />

      {/* Hero */}
      <TranceGlassCard glow="magenta" className="overflow-hidden mb-4">
        <div className="relative h-64">
          <img
            src={c.cover}
            className="absolute inset-0 w-full h-full object-cover"
            alt={c.displayName}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="relative p-4 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 text-yellow-300 text-xs font-black">
              <Star className="w-4 h-4 fill-yellow-300" /> VERIFIED CHOREOGRAPHER
            </div>
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400 uppercase">
                {c.displayName}
              </h1>
              <p className="text-xs text-white/70 max-w-[180px] mt-1">{c.tagline}</p>
              <div className="flex gap-4 mt-3">
                {[
                  ["SESSIONS", c.sessions],
                  ["STUDENTS", fmt(c.students)],
                  ["PLAYS", fmt(c.plays)],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div className="text-lg font-black text-white">{v}</div>
                    <div className="text-[9px] text-white/50">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
            {c.badges.map((b) => (
              <span
                key={b.id}
                className="shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/80"
              >
                {b.name}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <GradientButton className="flex-1">FOLLOW</GradientButton>
            <button className="w-12 rounded-xl border border-white/15 bg-white/5 grid place-items-center">
              <Send className="w-4 h-4" />
            </button>
            <button className="w-12 rounded-xl border border-white/15 bg-white/5 grid place-items-center">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>
      </TranceGlassCard>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1 mb-4 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap",
              tab === t
                ? "bg-gradient-to-r from-fuchsia-500/30 to-purple-500/20 text-white"
                : "text-white/50",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Private Studio */}
      <div className="flex items-center gap-2 mb-2">
        <Lock className="w-4 h-4 text-cyan-300" />
        <h3 className="font-black text-white uppercase text-sm">Private Studio</h3>
      </div>
      <p className="text-[11px] text-white/50 mb-3">
        Your exclusive routines. Practice. Perfect. Perform.
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {routines.slice(0, 3).map((r) => (
          <div
            key={r.id}
            onClick={() => navigate(TRANCE_ROUTES.routine(r.id))}
            className="shrink-0 w-44 relative rounded-2xl overflow-hidden border border-white/10 cursor-pointer"
          >
            <img src={r.cover} className="w-full h-32 object-cover" alt={r.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <Lock className="absolute top-2 right-2 w-4 h-4 text-white/70" />
            <div className="absolute bottom-2 left-2 right-2">
              <h4 className="font-black text-white uppercase text-sm">{r.title}</h4>
              <p className="text-[9px] text-white/60 uppercase">
                {Math.round(r.durationSec / 60)} min · {r.difficulty}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Trend Setter Routines */}
      <div className="flex items-center gap-2 mt-6 mb-2">
        <Globe className="w-4 h-4 text-fuchsia-300" />
        <h3 className="font-black text-white uppercase text-sm">Trend Setter Routines</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {routines.slice(1, 5).map((r) => (
          <div
            key={r.id}
            onClick={() => navigate(TRANCE_ROUTES.routine(r.id))}
            className="shrink-0 w-40 relative rounded-2xl overflow-hidden border border-white/10 cursor-pointer"
          >
            <img src={r.cover} className="w-full h-28 object-cover" alt={r.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <span className="absolute top-2 left-2 text-[8px] font-black bg-fuchsia-500/80 px-2 py-0.5 rounded">
              {r.trendingRank ? "TRENDING" : "NEW"}
            </span>
            <div className="absolute bottom-2 left-2">
              <h4 className="font-black text-white uppercase text-sm">{r.title}</h4>
              <p className="text-[9px] text-cyan-300">{fmt(r.plays)} PLAYS</p>
            </div>
            <button className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/15 grid place-items-center">
              <Play className="w-4 h-4 fill-white" />
            </button>
          </div>
        ))}
      </div>

      {/* Assignments + Show prep */}
      <div className="grid md:grid-cols-2 gap-3 mt-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-black text-cyan-300 uppercase text-sm">Rehearsal Assignments</h3>
            <span className="text-[10px] text-fuchsia-400 font-bold">VIEW ALL</span>
          </div>
          <div className="space-y-2">
            {assignments.map((a) => (
              <RehearsalAssignmentCard key={a.id} a={a} />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-black text-yellow-300 uppercase text-sm">Upcoming Show Prep</h3>
            <span className="text-[10px] text-fuchsia-400 font-bold">VIEW ALL</span>
          </div>
          <TranceGlassCard glow="purple" className="overflow-hidden">
            <div className="relative h-44">
              <img src={routines[0].cover} className="w-full h-full object-cover" alt="show" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-black/30" />
              <div className="absolute inset-0 p-4 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <div className="text-[9px] text-white/60">JUN</div>
                    <div className="text-xl font-black text-white">08</div>
                  </div>
                  <span className="text-[10px] text-cyan-300 font-bold uppercase">
                    Trey TV Live Experience
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
                    BEYOND THE LIMIT
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-white/60">17 DAYS LEFT</span>
                    <GradientButton className="text-[10px] px-3 py-1.5">VIEW PLAN</GradientButton>
                  </div>
                </div>
              </div>
            </div>
          </TranceGlassCard>
        </div>
      </div>
    </TranceShell>
  );
};

export default ChoreographerScreen;
