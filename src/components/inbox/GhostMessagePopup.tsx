import { Ghost, Timer, X } from "lucide-react";

interface GhostMessagePopupProps {
  onSelect: (duration: number, label: string) => void;
  onClose: () => void;
}

const GHOST_TIMERS = [
  { label: "30s", seconds: 30, description: "Vanishes in 30 seconds", color: "oklch(0.82 0.15 215)" },
  { label: "5 min", seconds: 300, description: "Fades after 5 minutes", color: "oklch(0.7 0.25 340)" },
  { label: "1 Day", seconds: 86400, description: "Gone in 24 hours", color: "oklch(0.82 0.16 85)" },
];

export function GhostMessagePopup({ onSelect, onClose }: GhostMessagePopupProps) {
  return (
    <div
      className="ghost-popup-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ghost-popup-panel animate-ghost-rise">
        {/* Ambient glow orbs */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 size-32 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.7 0.25 340 / 0.5), transparent 70%)", filter: "blur(24px)" }} />

        {/* Header */}
        <div className="relative flex items-center gap-3 mb-5">
          <div className="ghost-icon-ring">
            <Ghost className="size-5 text-[oklch(0.82_0.16_85)]" style={{ filter: "drop-shadow(0 0 8px oklch(0.82 0.16 85 / 0.9))" }} />
          </div>
          <div className="flex-1">
            <div className="text-xs tracking-[0.3em] text-[oklch(0.82_0.16_85)] font-semibold uppercase">Ghost Message</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Self-destructs if unread</div>
          </div>
          <button onClick={onClose} className="size-7 grid place-items-center rounded-full hover:bg-white/10 transition">
            <X className="size-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Timer options */}
        <div className="space-y-2.5">
          {GHOST_TIMERS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => onSelect(opt.seconds, opt.label)}
              className="ghost-timer-btn w-full group"
              style={{ "--ghost-color": opt.color } as React.CSSProperties}
            >
              <div className="ghost-timer-glow" />
              <div className="relative flex items-center gap-3 p-3.5">
                <div className="ghost-timer-icon-wrap">
                  <Timer className="size-4" style={{ color: opt.color, filter: `drop-shadow(0 0 6px ${opt.color})` }} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold" style={{ color: opt.color, textShadow: `0 0 12px ${opt.color}` }}>
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{opt.description}</div>
                </div>
                <div className="ghost-timer-arrow">›</div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-4 flex items-center justify-center gap-1.5">
          <Ghost className="size-3 text-[oklch(0.7_0.25_340)]" />
          Messages dissolve if unread after the timer
        </p>
      </div>
    </div>
  );
}
