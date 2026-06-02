import React from "react";
import {
  GitBranch,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  Shield,
  Flame,
  Link2,
  Crown,
  AlertTriangle,
  Wind,
  Heart,
  Swords,
} from "lucide-react";
import { Branch, RelationshipImpactType } from "../../lib/storyTypes";
import { TONE_COLORS, CHARACTERS_BY_ID } from "../../lib/storyData";
import { pickCastFromBranch, pickDominantImpactFromBranch } from "../../lib/posterCanvas";
import { CharacterAvatar } from "../CharacterAvatar";

interface Props {
  branches: Branch[];
  activeBranchId: string | null;
  onOpenBranch: (b: Branch) => void;
  onNewBranch: () => void;
  onDelete: (id: string) => void;
}

// Compact glass-card variant of the impact meta used on choice cards
const IMPACT_META: Record<
  RelationshipImpactType,
  {
    Icon: React.ComponentType<{ className?: string }>;
    chip: string;
    text: string;
    ring: string;
    glow: string;
  }
> = {
  Trust: {
    Icon: Shield,
    chip: "bg-cyan-500/15 border-cyan-500/40",
    text: "text-cyan-300",
    ring: "ring-cyan-400/60",
    glow: "shadow-cyan-500/20",
  },
  Tension: {
    Icon: Flame,
    chip: "bg-orange-500/15 border-orange-500/40",
    text: "text-orange-300",
    ring: "ring-orange-400/60",
    glow: "shadow-orange-500/20",
  },
  Loyalty: {
    Icon: Link2,
    chip: "bg-amber-500/15 border-amber-500/40",
    text: "text-amber-300",
    ring: "ring-amber-400/60",
    glow: "shadow-amber-500/20",
  },
  Respect: {
    Icon: Crown,
    chip: "bg-violet-500/15 border-violet-500/40",
    text: "text-violet-300",
    ring: "ring-violet-400/60",
    glow: "shadow-violet-500/20",
  },
  Pressure: {
    Icon: AlertTriangle,
    chip: "bg-red-500/15 border-red-500/40",
    text: "text-red-300",
    ring: "ring-red-400/60",
    glow: "shadow-red-500/20",
  },
  Distance: {
    Icon: Wind,
    chip: "bg-zinc-500/15 border-zinc-500/40",
    text: "text-zinc-300",
    ring: "ring-zinc-300/60",
    glow: "shadow-zinc-500/20",
  },
  Bond: {
    Icon: Heart,
    chip: "bg-pink-500/15 border-pink-500/40",
    text: "text-pink-300",
    ring: "ring-pink-400/60",
    glow: "shadow-pink-500/20",
  },
  Rivalry: {
    Icon: Swords,
    chip: "bg-fuchsia-500/15 border-fuchsia-500/40",
    text: "text-fuchsia-300",
    ring: "ring-fuchsia-400/60",
    glow: "shadow-fuchsia-500/20",
  },
};

// Human-readable "flavor" label for the dominant impact, shown under the chip
const IMPACT_FLAVOR: Record<RelationshipImpactType, string> = {
  Trust: "Trust Rising",
  Tension: "Tension Building",
  Loyalty: "Loyalty Tested",
  Respect: "Respect Gained",
  Pressure: "Pressure Rising",
  Distance: "Distance Growing",
  Bond: "Bond Strengthened",
  Rivalry: "Rivalry Heating Up",
};

export const BranchMapScreen: React.FC<Props> = ({
  branches,
  activeBranchId,
  onOpenBranch,
  onNewBranch,
  onDelete,
}) => {
  return (
    <div className="min-h-screen px-5 pt-10 pb-24">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-violet-400">
          <GitBranch className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-[0.25em]">Your Paths</span>
        </div>
        <h1 className="mt-1 font-display text-4xl font-black text-white">Branches</h1>
        <p className="mt-1 text-sm text-white/60">
          Each branch is a different version of the story.
        </p>
      </header>

      <button
        onClick={onNewBranch}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-400/40 bg-violet-500/5 py-4 font-bold text-violet-300 hover:bg-violet-500/10"
      >
        <Plus className="h-5 w-5" /> Start New Branch
      </button>

      {branches.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <GitBranch className="mx-auto mb-3 h-10 w-10 text-white/30" />
          <p className="text-white/60">
            No branches yet. Start the story to create your first one.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {branches.map((b, idx) => {
            const isActive = b.id === activeBranchId;

            // Top 3 cast IDs for this specific branch + dominant impact dimension
            const cast = pickCastFromBranch(b, 3).slice(0, 3);
            const dominantImpact = pickDominantImpactFromBranch(b);
            const impactMeta = dominantImpact ? IMPACT_META[dominantImpact] : null;
            const avatarRing = impactMeta?.ring ?? "ring-violet-400/40";
            const tileGlow = impactMeta?.glow ?? "";

            // Build a human "Malik · Ari · Coach" caption
            const castNames = cast
              .map((id) => CHARACTERS_BY_ID[id]?.firstName)
              .filter(Boolean)
              .join(" · ");

            return (
              <div
                key={b.id}
                className={`relative rounded-2xl border ${
                  isActive
                    ? "border-violet-400/50 shadow-lg shadow-violet-500/20"
                    : "border-white/10"
                } bg-gradient-to-br from-zinc-900/80 to-black p-4 ${tileGlow ? `shadow-lg ${tileGlow}` : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                        Branch {branches.length - idx}
                      </span>
                      {isActive && (
                        <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-violet-300">
                          Active
                        </span>
                      )}
                      {b.isComplete && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> Complete
                        </span>
                      )}
                    </div>
                    <div className="mt-1 truncate font-display text-lg font-bold text-white">
                      {b.ending?.name || `Chapter ${b.chapters.length}`}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this branch?")) onDelete(b.id);
                    }}
                    className="rounded-full p-2 text-white/40 hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Delete branch"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Top 3 cast faces + dominant impact chip — the at-a-glance branch identity */}
                {(cast.length > 0 || impactMeta) && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md">
                    <div className="flex min-w-0 items-center gap-3">
                      {cast.length > 0 && (
                        <div className="flex -space-x-2">
                          {cast.map((id) => {
                            const ch = CHARACTERS_BY_ID[id];
                            if (!ch) return null;
                            return (
                              <div
                                key={id}
                                className={`h-9 w-9 overflow-hidden rounded-full border-2 border-zinc-950 ring-2 ${avatarRing} shadow-md`}
                                title={ch.name}
                              >
                                <CharacterAvatar character={ch} faceCrop />
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                          Starring
                        </div>
                        <div className="truncate text-xs font-semibold text-white/85">
                          {castNames || "—"}
                        </div>
                      </div>
                    </div>

                    {impactMeta && dominantImpact && (
                      <div className="flex flex-shrink-0 flex-col items-end gap-1">
                        <div
                          className={`inline-flex items-center gap-1 rounded-full border ${impactMeta.chip} px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${impactMeta.text}`}
                        >
                          <impactMeta.Icon className="h-2.5 w-2.5" />
                          {dominantImpact}
                        </div>
                        <div
                          className={`text-[9px] font-semibold uppercase tracking-wider opacity-80 ${impactMeta.text}`}
                        >
                          {IMPACT_FLAVOR[dominantImpact]}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Vertical node tree */}
                <div className="my-4 space-y-2">
                  {b.chapters.map((ch, i) => {
                    const isLast = i === b.chapters.length - 1;
                    const tone = ch.toneTag ? TONE_COLORS[ch.toneTag] : null;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className="relative flex flex-col items-center">
                          <div
                            className={`h-4 w-4 rounded-full border-2 ${
                              isLast && !b.isComplete
                                ? "border-violet-400 bg-violet-500 shadow-lg shadow-violet-500/60 animate-pulse"
                                : tone
                                  ? `${tone.border} ${tone.bg}`
                                  : "border-emerald-400 bg-emerald-500"
                            }`}
                          />
                          {i < b.chapters.length - 1 && (
                            <div className="my-1 h-6 w-0.5 bg-white/15" />
                          )}
                        </div>
                        <div className="flex-1 -mt-1">
                          <div className="text-sm font-medium text-white/90 line-clamp-1">
                            Ch {ch.number} • {ch.title.replace(/^Chapter \d+\s*[—-]\s*/, "")}
                          </div>
                          {ch.toneTag && (
                            <span
                              className={`mt-0.5 inline-block rounded-full ${tone!.bg} px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${tone!.text}`}
                            >
                              {ch.toneTag}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {!b.isComplete && (
                    <div className="flex items-center gap-3 opacity-40">
                      <div className="h-4 w-4 rounded-full border-2 border-dashed border-white/30" />
                      <div className="text-sm italic text-white/40">Unwritten…</div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onOpenBranch(b)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-bold text-white hover:bg-white/15"
                >
                  <Play className="h-4 w-4" />
                  {b.isComplete ? "View Ending" : "Continue Branch"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
