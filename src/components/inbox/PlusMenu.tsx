import { Ghost, Image as ImageIcon, Sparkles, X } from "lucide-react";

interface PlusMenuProps {
  onGhostMessage: () => void;
  onPhoto: () => void;
  onFwd: () => void;
  onClose: () => void;
}

const MENU_ITEMS = [
  {
    id: "ghost",
    label: "Ghost Message",
    description: "Self-destructs if unread",
    icon: Ghost,
    gradient: "linear-gradient(135deg, oklch(0.86 0.17 90), oklch(0.7 0.18 60))",
    glow: "oklch(0.82 0.16 85 / 0.7)",
    textColor: "oklch(0.86 0.17 90)",
    isGold: true,
  },
  {
    id: "fwd",
    label: "FWD",
    description: "GIFs & reactions",
    icon: Sparkles,
    gradient: "linear-gradient(135deg, oklch(0.78 0.18 150), oklch(0.82 0.15 215))",
    glow: "oklch(0.78 0.18 150 / 0.5)",
    textColor: "oklch(0.78 0.18 150)",
    isGold: false,
  },
  {
    id: "photo",
    label: "Photo / Video",
    description: "Share media from your device",
    icon: ImageIcon,
    gradient: "linear-gradient(135deg, oklch(0.82 0.15 215), oklch(0.65 0.22 300))",
    glow: "oklch(0.82 0.15 215 / 0.5)",
    textColor: "oklch(0.82 0.15 215)",
    isGold: false,
  },
];

export function PlusMenu({ onGhostMessage, onPhoto, onFwd, onClose }: PlusMenuProps) {
  const handleAction = (id: string) => {
    if (id === "ghost") onGhostMessage();
    else if (id === "fwd") onFwd();
    else if (id === "photo") onPhoto();
    onClose();
  };

  return (
    <div
      className="plus-menu-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="plus-menu-panel animate-ghost-rise">
        {/* Ambient orb */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 size-24 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.7 0.22 300 / 0.4), transparent 70%)", filter: "blur(20px)" }}
        />

        <div className="relative flex items-center justify-between mb-4">
          <div className="text-xs tracking-[0.3em] text-muted-foreground uppercase font-semibold">Message Options</div>
          <button onClick={onClose} className="size-7 grid place-items-center rounded-full hover:bg-white/10 transition">
            <X className="size-3.5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-2.5">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleAction(item.id)}
                className="plus-menu-item w-full group relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(ellipse at left, ${item.glow}, transparent 60%)` }}
                />
                <div className="relative flex items-center gap-3.5 px-4 py-3.5">
                  <div
                    className="size-10 rounded-2xl grid place-items-center shrink-0"
                    style={{
                      background: item.gradient,
                      boxShadow: `0 0 20px ${item.glow}, inset 0 1px 0 oklch(1 0 0 / 0.3)`,
                    }}
                  >
                    <Icon className="size-5 text-white" style={{ filter: "drop-shadow(0 1px 2px oklch(0 0 0 / 0.3))" }} />
                  </div>
                  <div className="flex-1 text-left">
                    <div
                      className="text-sm font-bold"
                      style={
                        item.isGold
                          ? {
                              background: "linear-gradient(135deg, oklch(0.86 0.17 90), oklch(0.7 0.25 340))",
                              WebkitBackgroundClip: "text",
                              backgroundClip: "text",
                              color: "transparent",
                              filter: "drop-shadow(0 0 8px oklch(0.82 0.16 85 / 0.5))",
                            }
                          : { color: item.textColor }
                      }
                    >
                      {item.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{item.description}</div>
                  </div>
                  <div
                    className="text-lg opacity-50 group-hover:opacity-100 transition group-hover:translate-x-0.5"
                    style={{ color: item.textColor, transition: "all 0.2s ease" }}
                  >
                    ›
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
