import { Image as ImageIcon, Wand2, Globe, ChevronDown, Plus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { currentUser } from "@/lib/mock-data";

const tags = [
  { label: "Music", color: "cyan" },
  { label: "Comedy", color: "cyan" },
  { label: "Motivation", color: "purple" },
  { label: "Fashion", color: "gold" },
  { label: "Gaming", color: "magenta" },
];

const ringMap: Record<string, string> = {
  cyan: "border-[oklch(0.82_0.15_215)] text-[oklch(0.82_0.15_215)]",
  purple: "border-[oklch(0.65_0.22_300)] text-[oklch(0.65_0.22_300)]",
  gold: "border-primary text-primary",
  magenta: "border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)]",
};

export function Composer() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleTag = (t: string) =>
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  return (
    <div className="rounded-3xl p-4 glass border border-primary/20 shadow-[0_0_30px_-10px_oklch(0.82_0.16_85_/_0.4)] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_80%_-20%,oklch(0.7_0.25_340_/_0.4),transparent_60%)]" />
      <button onClick={() => navigate({ to: "/create" })} className="relative flex items-center gap-3 w-full text-left">
        <img src={currentUser.avatar} alt="" className="size-11 rounded-full object-cover ring-neon-purple shrink-0" />
        <p className="text-muted-foreground text-sm flex-1">What's on your mind, {currentUser.name}?</p>
      </button>

      <div className="relative mt-3 flex items-center gap-2 flex-wrap">
        <button onClick={() => navigate({ to: "/create" })} className="px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5">
          <ImageIcon className="size-4" /> Image
        </button>
        <button onClick={() => toast("Trey-I tools coming soon")} className="px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5">
          <Wand2 className="size-4 text-primary" /> Trey-I Tools
        </button>
        <button onClick={() => toast("Audience: Everyone")} className="px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5">
          <Globe className="size-4" /> Everyone <ChevronDown className="size-3" />
        </button>
        <button onClick={() => navigate({ to: "/create" })} className="ml-auto px-4 py-2 rounded-xl text-sm font-semibold border border-primary text-primary glow-gold hover:bg-primary/10">
          Post
        </button>
      </div>

      <div className="relative mt-4">
        <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-2">RECOMMENDATION TAGS</div>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => {
            const isSel = selected.includes(t.label);
            return (
              <button
                key={t.label}
                onClick={() => toggleTag(t.label)}
                className={`px-3 py-1 rounded-full text-xs border ${ringMap[t.color]} ${isSel ? "bg-white/10" : "bg-transparent hover:bg-white/5"}`}
              >
                {t.label}
              </button>
            );
          })}
          <button onClick={() => toast("Add custom tag")} className="size-7 grid place-items-center rounded-full border border-white/15 text-muted-foreground hover:bg-white/5">
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
