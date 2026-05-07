import { Radio } from "lucide-react";
import { toast } from "sonner";
import { creators } from "@/lib/mock-data";

const ringClass: Record<string, string> = {
  magenta: "ring-neon-magenta",
  cyan: "ring-neon-cyan",
  purple: "ring-neon-purple",
  gold: "ring-neon-gold",
};

export function CreatorRail() {
  return (
    <div className="flex items-start gap-3 overflow-x-auto no-scrollbar -mx-3 px-3 py-2">
      <div className="flex flex-col items-center gap-1 shrink-0">
        <button onClick={() => toast("Going live — preparing your stream")} className="size-16 rounded-2xl border border-primary/60 grid place-items-center text-primary glow-gold bg-primary/5">
          <Radio className="size-6" />
        </button>
        <span className="text-[11px] text-primary font-semibold">Go Live</span>
      </div>
      {creators.map((c) => (
        <button
          key={c.id}
          onClick={() => toast(`Opening ${c.name}'s channel`)}
          className="flex flex-col items-center gap-1 shrink-0 w-[72px]"
        >
          <div className="relative">
            <img
              src={c.avatar}
              alt={c.name}
              className={`size-16 rounded-full object-cover ${ringClass[c.ring]}`}
              loading="lazy"
            />
            {c.live && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-[oklch(0.65_0.24_15)] text-white shadow-[0_0_10px_oklch(0.65_0.24_15_/_0.8)]">
                LIVE
              </span>
            )}
          </div>
          <span className="text-[11px] text-foreground/90 truncate w-full text-center">{c.name}</span>
        </button>
      ))}
    </div>
  );
}
