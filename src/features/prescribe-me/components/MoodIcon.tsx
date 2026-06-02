import React from "react";
import {
  Smile,
  Cloud,
  Heart,
  Zap,
  Flame,
  Leaf,
  Search,
  Target,
  Frown,
  Sparkles,
  Coffee,
} from "lucide-react";

import type { Mood } from "./data";

export const MOOD_META: Record<
  Mood,
  { color: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }
> = {
  Happy: { color: "#fbbf24", icon: Smile },
  Chill: { color: "#22d3ee", icon: Leaf },
  Romantic: { color: "#f472b6", icon: Heart },
  Motivated: { color: "#a855f7", icon: Zap },
  Reflective: { color: "#60a5fa", icon: Cloud },
  Wild: { color: "#f43f5e", icon: Flame },
  Healing: { color: "#34d399", icon: Leaf },
  Curious: { color: "#facc15", icon: Search },
  Focused: { color: "#c084fc", icon: Target },
  Sad: { color: "#818cf8", icon: Frown },
  Inspired: { color: "#fb923c", icon: Sparkles },
  Bored: { color: "#9ca3af", icon: Coffee },
};

const MoodIcon: React.FC<{ mood: Mood; size?: number; className?: string }> = ({
  mood,
  size = 28,
  className = "",
}) => {
  const meta = MOOD_META[mood];
  const Icon = meta.icon;
  return (
    <Icon
      className={className}
      style={{
        width: size,
        height: size,
        color: meta.color,
        filter: `drop-shadow(0 0 8px ${meta.color}aa) drop-shadow(0 0 14px ${meta.color}55)`,
      }}
    />
  );
};

export default MoodIcon;
