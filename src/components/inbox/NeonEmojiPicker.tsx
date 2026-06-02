import { useState } from "react";
import { X, Search } from "lucide-react";
import { Tremoji } from "./Tremoji";
import { TREMOJI_CATEGORIES } from "./tremoji-data";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function NeonEmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  const query = search.trim().toLowerCase();
  const filtered = query
    ? TREMOJI_CATEGORIES.flatMap((c) => c.emojis).filter(
        (item) => item.emoji.includes(query) || item.label.toLowerCase().includes(query),
      )
    : TREMOJI_CATEGORIES[activeCategory].emojis;

  return (
    <div className="neon-emoji-picker animate-ghost-rise">
      <div className="neon-emoji-scanline" />

      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-white/8">
        <div className="text-xs font-bold tracking-[0.2em] text-gradient-gold uppercase">
          Tremojis
        </div>
        <button
          onClick={onClose}
          className="size-6 grid place-items-center rounded-full hover:bg-white/10"
        >
          <X className="size-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="flex items-center gap-2 h-8 px-2.5 rounded-xl glass border border-white/10 focus-within:border-primary/40 transition">
          <Search className="size-3 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emojis..."
            className="flex-1 bg-transparent text-xs focus:outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {!query && (
        <div className="flex gap-1 px-3 pb-2 overflow-x-auto no-scrollbar">
          {TREMOJI_CATEGORIES.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(i)}
              className={`shrink-0 h-7 px-2.5 rounded-full text-[10px] whitespace-nowrap transition tilt-press ${
                activeCategory === i
                  ? "bg-primary/20 text-primary border border-primary/50 glow-gold"
                  : "glass border border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="neon-emoji-grid px-3 pb-3">
        {filtered.map((item, i) => (
          <button
            key={item.emoji}
            onClick={() => onSelect(item.emoji)}
            onMouseEnter={() => setHovered(`${item.emoji}-${i}`)}
            onMouseLeave={() => setHovered(null)}
            className="tremoji-btn p-1"
            aria-label={item.label}
          >
            <Tremoji
              emoji={item.emoji}
              label={item.label}
              size={hovered === `${item.emoji}-${i}` ? 44 : 38}
              static
            />
          </button>
        ))}
      </div>
    </div>
  );
}
