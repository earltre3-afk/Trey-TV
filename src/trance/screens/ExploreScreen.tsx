import React from "react";
import { useNavigate } from "../hooks/router-compat";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Flame,
  Bookmark,
  Users,
  ChevronRight,
} from "lucide-react";
import { TranceShell, TranceTopBar } from "../components/shell";
import { TranceGlassCard, cn } from "../components/primitives";
import { TranceRoutineCard } from "../components/cards";
import { routines, styleCategories, choreographers, IMG } from "../data/devFixtures";
import { TRANCE_ROUTES } from "../routes/manifest";

const ExploreScreen: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");
  const filters = [
    { label: "Style", val: "All Styles" },
    { label: "Difficulty", val: "All Levels" },
    { label: "Energy", val: "All Energy" },
    { label: "Studio", val: "All Studios" },
  ];
  const filtered = routines.filter(
    (r) =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.choreographerName.toLowerCase().includes(query.toLowerCase()) ||
      r.style.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <TranceShell>
      <TranceTopBar
        title={
          <div className="font-black text-yellow-300 text-xs tracking-widest">8 DAY STREAK</div>
        }
        right={
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-fuchsia-400">
            <img src={IMG.maleA} className="w-full h-full object-cover" alt="me" />
          </div>
        }
      />
      <h1 className="font-black text-5xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-400">
        EXPLORE
      </h1>
      <p className="text-xs text-white/50 uppercase tracking-wide mb-4">
        Find your flow. Level up your dance.
      </p>

      {/* Search */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <Search className="w-4 h-4 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search routines, styles, instructors..."
            className="bg-transparent text-sm text-white placeholder:text-white/40 outline-none flex-1"
          />
        </div>
        <button className="w-12 rounded-xl border border-white/10 bg-white/[0.04] grid place-items-center">
          <SlidersHorizontal className="w-4 h-4 text-fuchsia-300" />
        </button>
      </div>

      {/* Filter chips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
        {filters.map((f) => (
          <button
            key={f.label}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
          >
            <div className="text-left">
              <div className="text-[9px] text-fuchsia-400 font-bold uppercase">{f.label}</div>
              <div className="text-xs text-white">{f.val}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-white/40" />
          </button>
        ))}
      </div>

      {/* Trending Routines */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-white uppercase">
          {query ? "Results" : "Trending Routines"}
        </h3>
        <button className="text-xs font-bold text-fuchsia-400 flex items-center gap-1">
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-white/40 py-8">No routines match “{query}”.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 lg:gap-4">
          {filtered.map((r, i) => (
            <TranceRoutineCard key={r.id} routine={r} rank={query ? undefined : i + 1} wide />
          ))}
        </div>
      )}

      {/* Browse by Style */}
      <h3 className="font-black text-white uppercase mt-6 mb-3">Browse by Style</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {styleCategories.map((s) => (
          <button
            key={s.style}
            onClick={() => navigate(TRANCE_ROUTES.explore)}
            className="w-full"
          >
            <div className="relative h-32 rounded-2xl overflow-hidden border border-white/10">
              <img src={s.img} className="w-full h-full object-cover" alt={s.style} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-2 left-2">
                <div className="font-black text-white text-sm">{s.style}</div>
                <div className="text-[10px] text-cyan-300">{s.count} Routines</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Beginner Friendly */}
      <h3 className="font-black text-white uppercase mt-6 mb-3">Beginner Friendly</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar lg:grid lg:grid-cols-3 xl:grid-cols-5 lg:gap-4 lg:overflow-visible">
        <TranceGlassCard
          glow="cyan"
          className="shrink-0 w-40 lg:w-full p-4 flex flex-col justify-center"
          onClick={() => {}}
        >
          <div className="font-black text-white">NEW TO DANCE?</div>
          <div className="text-cyan-300 font-black text-sm mb-2">START HERE</div>
          <div className="text-[10px] text-white/50">5 Routines</div>
        </TranceGlassCard>
        {routines.slice(2, 6).map((r) => (
          <div
            key={r.id}
            onClick={() => navigate(TRANCE_ROUTES.routine(r.id))}
            className="shrink-0 w-36 lg:w-full cursor-pointer"
          >
            <div className="relative h-28 rounded-xl overflow-hidden border border-white/10">
              <img src={r.cover} className="w-full h-full object-cover" alt={r.title} />
              <span className="absolute top-2 left-2 text-[9px] font-black bg-emerald-500/80 px-2 py-0.5 rounded">
                EASY
              </span>
            </div>
            <h5 className="text-sm font-bold text-white mt-1.5 truncate">{r.title}</h5>
            <div className="flex items-center gap-2 text-[10px] text-white/50">
              <span className="flex items-center gap-0.5">
                <Bookmark className="w-3 h-3" />
                {(r.saves / 1000).toFixed(1)}K
              </span>
              <span className="flex items-center gap-0.5">
                <Users className="w-3 h-3" />
                {(r.students / 1000).toFixed(1)}K
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Instructor Picks */}
      <h3 className="font-black text-white uppercase mt-6 mb-3">Instructor Picks</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 lg:gap-4 lg:overflow-visible">
        {choreographers.map((c) => (
          <TranceGlassCard
            key={c.id}
            glow="gold"
            onClick={() => navigate(TRANCE_ROUTES.choreographer(c.id))}
            className="shrink-0 w-52 lg:w-full p-3 flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400/60">
              <img src={c.avatar} className="w-full h-full object-cover" alt={c.displayName} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-black text-white text-sm uppercase truncate">
                  {c.displayName}
                </span>
                <span className="text-[8px] font-black text-yellow-300 bg-yellow-500/15 px-1.5 py-0.5 rounded">
                  PICK
                </span>
              </div>
              <div className="flex gap-3 text-[10px] text-white/50 mt-1">
                <span>{c.sessions} Routines</span>
                <span>{(c.students / 1000).toFixed(0)}K Students</span>
              </div>
            </div>
          </TranceGlassCard>
        ))}
      </div>
    </TranceShell>
  );
};

export default ExploreScreen;
