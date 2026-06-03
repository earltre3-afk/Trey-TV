import React from "react";
import { useParams } from "../hooks/router-compat";
import {
  Lock,
  Play,
  Calendar,
  Users,
  Folder,
  Settings,
  Library,
  Clock,
  MapPin,
  Mic,
} from "lucide-react";
import { TranceShell, TranceTopBar, TranceLogo } from "../components/shell";
import { TranceGlassCard, GradientButton, cn, EmptyState } from "../components/primitives";
import { studios, routines, IMG } from "../data/devFixtures";

const tabs = [
  { label: "Library", icon: Library },
  { label: "Schedule", icon: Calendar },
  { label: "Members", icon: Users },
  { label: "Files", icon: Folder },
  { label: "Settings", icon: Settings },
];

const folders = [
  { name: "Routine A", color: "from-fuchsia-600/40", items: 7, letter: "A" },
  { name: "Finale", color: "from-purple-600/40", items: 6, letter: "F" },
  { name: "Warm-Up", color: "from-cyan-600/40", items: 4, letter: "W" },
  { name: "Casting Rehearsal", color: "from-yellow-600/40", items: 5, letter: "C" },
];

const assetTypes = ["Rehearsal Video", "Counts", "Formation Notes", "Mirror Practice"];

const StudioScreen: React.FC = () => {
  const { id } = useParams();
  const s = studios.find((x) => x.id === id) || studios[0];
  const [tab, setTab] = React.useState("Library");

  return (
    <TranceShell>
      <TranceTopBar
        title={<TranceLogo size="sm" />}
        right={
          <TranceGlassCard glow="purple" className="px-3 py-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 grid place-items-center">
              <span className="text-xs font-black">T</span>
            </div>
            <div>
              <div className="text-[11px] font-black text-white">{s.name.toUpperCase()}</div>
              <div className="text-[8px] text-fuchsia-300 flex items-center gap-1">
                PRIVATE STUDIO <Lock className="w-2.5 h-2.5" />
              </div>
            </div>
          </TranceGlassCard>
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-16 h-16 rounded-full grid place-items-center bg-gradient-to-br from-purple-600/40 to-fuchsia-600/30 border-2 border-fuchsia-400/40">
          <img src={IMG.logo} className="w-12 h-12 rounded-full object-cover" alt="studio" />
        </div>
        <div>
          <div className="text-[10px] text-yellow-300 font-black uppercase">Studio</div>
          <h1 className="text-3xl font-black text-white uppercase leading-none">
            Private Training
          </h1>
          <p className="text-xs text-white/50">Your space. Your team. Your tempo.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1 mb-4 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.label}
            onClick={() => setTab(t.label)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap",
              tab === t.label
                ? "bg-gradient-to-r from-fuchsia-500/30 to-purple-500/20 text-white"
                : "text-white/50",
            )}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "Library" ? (
        <>
          {/* Upcoming performance */}
          <TranceGlassCard glow="magenta" className="overflow-hidden mb-4">
            <div className="relative h-40">
              <img src={routines[2].cover} className="w-full h-full object-cover" alt="show" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 p-4 flex flex-col justify-center">
                <span className="text-[10px] text-fuchsia-300 font-bold uppercase">
                  Upcoming Performance
                </span>
                <h3 className="text-2xl font-black text-white uppercase">
                  Elevate: The Experience
                </h3>
                <div className="flex gap-3 text-[10px] text-white/70 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    JUN 28
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    7:30PM
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Truno Arena
                  </span>
                </div>
                <GradientButton variant="gold" className="mt-3 self-start text-xs px-4 py-2">
                  VIEW SHOW PLAN
                </GradientButton>
              </div>
            </div>
          </TranceGlassCard>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-fuchsia-300" />
              <h3 className="font-black text-white uppercase">Training Library</h3>
            </div>
            <span className="text-[10px] text-yellow-300 font-bold flex items-center gap-1">
              TEAM-ONLY <Lock className="w-3 h-3" />
            </span>
          </div>

          {/* Folders grid */}
          <div className="space-y-3">
            {folders.map((f) => (
              <div key={f.name} className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div
                  className={cn(
                    "rounded-2xl border border-white/10 bg-gradient-to-b to-transparent p-3 flex flex-col justify-between",
                    f.color,
                  )}
                >
                  <div className="text-3xl font-black text-white/90">{f.letter}</div>
                  <div>
                    <div className="font-black text-white uppercase text-sm">{f.name}</div>
                    <div className="text-[10px] text-fuchsia-300 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      PRIVATE · {f.items} ITEMS
                    </div>
                  </div>
                </div>
                {assetTypes.map((a, i) => (
                  <div
                    key={a}
                    className="relative rounded-2xl overflow-hidden border border-white/10 h-24"
                  >
                    <img
                      src={[IMG.r1, IMG.r2, IMG.r3, IMG.r4][i]}
                      className="w-full h-full object-cover opacity-80"
                      alt={a}
                    />
                    <div className="absolute inset-0 bg-black/50" />
                    <Lock className="absolute top-2 right-2 w-3 h-3 text-white/70" />
                    <span className="absolute top-2 left-2 text-[8px] font-bold text-white/80 uppercase">
                      {a}
                    </span>
                    {a === "Rehearsal Video" || a === "Mirror Practice" ? (
                      <button className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-white/20 grid place-items-center">
                        <Play className="w-4 h-4 fill-white" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Teacher comment */}
          <TranceGlassCard glow="purple" className="p-4 mt-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400/60">
              <img src={IMG.maleB} className="w-full h-full object-cover" alt="trey" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-fuchsia-300 font-bold uppercase">
                From your choreographer
              </div>
              <p className="text-xs text-white/70">
                Great work this week, Elevate. Your precision is sharper and your energy is next
                level. — Trey
              </p>
            </div>
            <button className="w-10 h-10 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 grid place-items-center">
              <Mic className="w-4 h-4 text-fuchsia-300" />
            </button>
          </TranceGlassCard>
        </>
      ) : (
        <EmptyState
          title={`No ${tab.toLowerCase()} yet`}
          message={`This studio's ${tab.toLowerCase()} will appear here once your team adds content.`}
          icon={<Folder className="w-7 h-7" />}
        />
      )}
    </TranceShell>
  );
};

export default StudioScreen;
