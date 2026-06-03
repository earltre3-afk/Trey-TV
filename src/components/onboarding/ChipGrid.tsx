import { Check } from "lucide-react";

export type Chip = { id: string; label: string; emoji?: string };

export function ChipGrid({
  chips,
  selected,
  onToggle,
  tone = "gold",
}: {
  chips: Chip[];
  selected: string[];
  onToggle: (id: string) => void;
  tone?: "gold" | "magenta" | "cyan";
}) {
  const ring =
    tone === "magenta"
      ? "ring-neon-magenta"
      : tone === "cyan"
        ? "ring-neon-cyan"
        : "ring-neon-gold";

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => {
        const active = selected.includes(c.id);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onToggle(c.id)}
            className={`group relative inline-flex items-center gap-1.5 px-3.5 h-10 rounded-full text-sm font-medium tilt-press transition
              ${
                active
                  ? `bg-primary/15 text-foreground ${ring} border-transparent`
                  : "liquid-glass border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/25"
              }`}
          >
            {c.emoji && <span className="text-base leading-none">{c.emoji}</span>}
            <span>{c.label}</span>
            {active && <Check className="size-3.5 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}
