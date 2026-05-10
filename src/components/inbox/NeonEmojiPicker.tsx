import { useState } from "react";
import { X, Search } from "lucide-react";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const NEON_EMOJI_CATEGORIES = [
  {
    name: "🔥 Hype",
    emojis: ["🔥", "⚡", "💫", "✨", "🌟", "⭐", "🌠", "☄️", "💥", "🎇", "🎆", "🪄", "🎯", "🏆", "👑", "💎", "💯", "🚀", "🛸", "🌈"],
  },
  {
    name: "💜 Vibes",
    emojis: ["💜", "💙", "🩵", "🩷", "❤️‍🔥", "🖤", "🤍", "💛", "🧡", "❤️", "💚", "💗", "💓", "💞", "💝", "💘", "🫀", "🫶", "🤙", "✌️"],
  },
  {
    name: "😈 Mood",
    emojis: ["😈", "👿", "🦾", "💀", "🎭", "🌀", "🔮", "🪬", "🧿", "⚗️", "🔱", "⚜️", "🌙", "🌒", "🌑", "🌚", "🖤", "🕶️", "🧲", "⛓️"],
  },
  {
    name: "🤑 Flex",
    emojis: ["🤑", "💸", "💰", "🪙", "💵", "🏅", "🥇", "🎰", "🎪", "🎠", "🎡", "🎢", "🎭", "🎬", "🎤", "🎧", "🎵", "🎶", "🥂", "🍾"],
  },
  {
    name: "🌊 Chill",
    emojis: ["🌊", "🌸", "🌺", "🌻", "🌹", "🌷", "💐", "🍃", "🍀", "☘️", "🌿", "🎋", "🎍", "🍁", "🍂", "🌾", "🏔️", "🌋", "🏝️", "🌅"],
  },
  {
    name: "🐉 Power",
    emojis: ["🐉", "🦁", "🐺", "🦊", "🦋", "🦚", "🦜", "🦩", "🐯", "🦅", "🦆", "🦋", "🐲", "🔱", "⚔️", "🛡️", "🗡️", "🏹", "🪃", "🧨"],
  },
];

const NEON_COLORS = [
  "oklch(0.82 0.16 85)",   // gold
  "oklch(0.7 0.25 340)",   // magenta
  "oklch(0.65 0.22 300)",  // purple
  "oklch(0.82 0.15 215)",  // cyan
  "oklch(0.78 0.18 150)",  // green
  "oklch(0.65 0.24 15)",   // red-orange
];

export function NeonEmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = search.trim()
    ? NEON_EMOJI_CATEGORIES.flatMap((c) => c.emojis).filter(() => true) // show all on search (emoji search is hard without a lib)
    : NEON_EMOJI_CATEGORIES[activeCategory].emojis;

  return (
    <div className="neon-emoji-picker animate-ghost-rise">
      {/* Ambient scanline */}
      <div className="neon-emoji-scanline" />

      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-white/8">
        <div className="text-xs font-bold tracking-[0.2em] text-gradient-gold uppercase">Neon Emojis</div>
        <button onClick={onClose} className="size-6 grid place-items-center rounded-full hover:bg-white/10">
          <X className="size-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 h-8 px-2.5 rounded-xl glass border border-white/10 focus-within:border-primary/40 transition">
          <Search className="size-3 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emojis…"
            className="flex-1 bg-transparent text-xs focus:outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="flex gap-1 px-3 pb-2 overflow-x-auto no-scrollbar">
          {NEON_EMOJI_CATEGORIES.map((cat, i) => (
            <button
              key={i}
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

      {/* Emoji grid */}
      <div className="neon-emoji-grid px-3 pb-3">
        {filtered.map((emoji, i) => {
          const neonColor = NEON_COLORS[i % NEON_COLORS.length];
          const isHovered = hovered === `${emoji}-${i}`;
          return (
            <button
              key={`${emoji}-${i}`}
              onClick={() => onSelect(emoji)}
              onMouseEnter={() => setHovered(`${emoji}-${i}`)}
              onMouseLeave={() => setHovered(null)}
              className="neon-emoji-btn"
              style={{
                "--neon-color": neonColor,
                filter: isHovered
                  ? `drop-shadow(0 0 10px ${neonColor}) drop-shadow(0 0 20px ${neonColor})`
                  : `drop-shadow(0 0 4px ${neonColor}66)`,
                transform: isHovered ? "scale(1.4) translateY(-4px)" : "scale(1)",
                transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              } as React.CSSProperties}
              aria-label={emoji}
            >
              {emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}
