import { Plus, Radio, Wand2, CalendarClock, Video, FileText, Mic } from "lucide-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

type WheelItem = {
  icon: typeof Plus;
  label: string;
  to: string;
  color: string;
};

const ITEMS: WheelItem[] = [
  { icon: Radio, label: "Go Live", to: "/go-live", color: "oklch(0.7 0.22 25)" },
  { icon: Video, label: "Clip", to: "/creator-studio/submit", color: "oklch(0.78 0.18 320)" },
  { icon: Wand2, label: "Trey-I", to: "/trey-i", color: "oklch(0.78 0.2 280)" },
  { icon: FileText, label: "Post", to: "/create", color: "oklch(0.82 0.16 85)" },
  { icon: Mic, label: "Audio", to: "/create", color: "oklch(0.78 0.18 200)" },
  { icon: CalendarClock, label: "Schedule", to: "/creator-studio/schedule", color: "oklch(0.78 0.18 150)" },
];

const HOLD_MS = 240;

export function CreateWheel() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const didOpen = useRef(false);
  const pressOrigin = useRef<{ x: number; y: number } | null>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setAnimated(false);
    setTimeout(() => {
      setOpen(false);
      setHovered(null);
      didOpen.current = false;
      pressOrigin.current = null;
    }, 150);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pressOrigin.current = { x: e.clientX, y: e.clientY };
    didOpen.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    holdTimer.current = window.setTimeout(() => {
      didOpen.current = true;
      setOpen(true);
      setTimeout(() => setAnimated(true), 25);
      if (navigator.vibrate) navigator.vibrate(8);
    }, HOLD_MS);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!didOpen.current) return;
    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const rawIndex = target?.closest<HTMLElement>("[data-create-menu-index]")?.dataset.createMenuIndex;
    setHovered(rawIndex ? Number(rawIndex) : null);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (didOpen.current) {
      didOpen.current = false;
      if (hovered !== null) {
        navigate({ to: ITEMS[hovered].to });
        close();
      } else {
        close();
      }
    } else {
      // short tap → default create
      navigate({ to: "/create" });
    }
  };

  const onPointerCancel = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    close();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onScroll = () => close();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
    setAnimated(false);
    setHovered(null);
    didOpen.current = false;
  }, [pathname]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[9998] backdrop-blur-md animate-fade-in"
          style={{ background: "oklch(0 0 0 / 0.55)" }}
          onClick={close}
        />
      )}

      <div className="flex-1 flex justify-center" style={{ overflow: "visible" }}>
        <div className="relative" style={{ marginTop: "-1.75rem" }}>
          {open && (
            <div 
              className="absolute z-[10000] pointer-events-none"
              style={{
                left: "32px", // center of size-16 button (64px / 2 = 32px)
                top: "32px",  // center of size-16 button
                width: 0,
                height: 0,
              }}
            >
              {ITEMS.map((item, i) => {
                const Icon = item.icon;
                const isHover = hovered === i;
                
                // Card fan mathematics
                const radius = animated ? 132 : 0; 
                const startAngle = 165; // degrees (left)
                const endAngle = 15; // degrees (right)
                const angleStep = (startAngle - endAngle) / (ITEMS.length - 1);
                const angleDeg = startAngle - i * angleStep;
                const angleRad = (angleDeg * Math.PI) / 180;
                
                const x = Math.cos(angleRad) * radius;
                const y = Math.sin(angleRad) * radius; // goes upwards
                
                // Tilt the card to point outward/inward like fanning cards in a hand
                const rotation = (90 - angleDeg) * 0.55; 
                
                return (
                  <button
                    key={item.label}
                    type="button"
                    data-create-menu-index={i}
                    onClick={() => {
                      navigate({ to: item.to });
                      close();
                    }}
                    className="absolute pointer-events-auto flex flex-col items-center justify-between rounded-2xl border bg-[#05070D]/90 p-2 text-center transition-all duration-300 ease-out select-none active:scale-95"
                    style={{
                      width: "82px",
                      height: "110px",
                      left: "-41px", // -width / 2 to center
                      top: "-55px",  // -height / 2 to center
                      transform: `translate(${x}px, ${-y}px) rotate(${rotation}deg) scale(${isHover ? 1.15 : 1})`,
                      borderColor: isHover ? item.color : "rgba(255, 255, 255, 0.12)",
                      boxShadow: isHover 
                        ? `0 10px 25px -5px ${item.color}66, 0 0 15px ${item.color}44, inset 0 1px 0 rgba(255,255,255,0.15)`
                        : "0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
                      zIndex: isHover ? 10002 : 10000 + i,
                      backdropFilter: "blur(16px)",
                      willChange: "transform, box-shadow",
                    }}
                  >
                    {/* Top corner suit indicator (mini icon + color dot) */}
                    <div className="w-full flex justify-between items-center px-0.5 text-[8px] text-white/40 font-mono">
                      <Icon className="size-2.5" style={{ color: item.color }} />
                      <span style={{ color: item.color }}>•</span>
                    </div>

                    {/* Central main icon */}
                    <div 
                      className="size-10 rounded-xl flex items-center justify-center transition-transform duration-200"
                      style={{
                        background: `${item.color}15`,
                        color: item.color,
                        border: `1px solid ${item.color}33`,
                        transform: isHover ? "scale(1.1) rotate(5deg)" : "scale(1)",
                        boxShadow: isHover ? `0 0 12px ${item.color}33` : "none"
                      }}
                    >
                      <Icon className="size-5" />
                    </div>

                    {/* Bottom label */}
                    <div className="text-[10px] font-bold text-white tracking-wide truncate w-full">
                      {item.label}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* FAB */}
          <button
            ref={fabRef}
            type="button"
            aria-label="Create — tap to post, hold for options"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              position: "relative",
              zIndex: 10001,
              transform: open ? "rotate(45deg) scale(1.05)" : "rotate(0deg) scale(1)",
              transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1)",
              touchAction: "none",
            }}
            className="size-16 rounded-full grid place-items-center bg-background border-2 border-primary text-primary glow-gold animate-glow-pulse"
          >
            <Plus className="size-7" />
          </button>
        </div>
      </div>
    </>
  );
}
