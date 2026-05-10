import { Plus, Radio, Wand2, CalendarClock, Video, FileText, Mic } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
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

const RADIUS = 96; // px
const HOLD_MS = 240;

export function CreateWheel() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const holdTimer = useRef<number | null>(null);
  const didOpen = useRef(false);
  const pressOrigin = useRef<{ x: number; y: number } | null>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    setHovered(null);
    didOpen.current = false;
    pressOrigin.current = null;
  };

  const pickIndexFromPoint = (clientX: number, clientY: number) => {
    if (!fabRef.current) return null;
    const r = fabRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < 28) return null;
    // angle: 0 = right, going CCW because we draw with -sin
    let ang = Math.atan2(-dy, dx); // -PI..PI
    // Top of wheel is angle = PI/2. We position items starting from top going clockwise.
    // Map angle to index. Item i sits at angle = PI/2 - (i / n) * 2PI
    const n = ITEMS.length;
    let idx = Math.round(((Math.PI / 2 - ang) / (2 * Math.PI)) * n);
    idx = ((idx % n) + n) % n;
    return idx;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pressOrigin.current = { x: e.clientX, y: e.clientY };
    didOpen.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    holdTimer.current = window.setTimeout(() => {
      didOpen.current = true;
      setOpen(true);
      if (navigator.vibrate) navigator.vibrate(8);
    }, HOLD_MS);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!didOpen.current) return;
    const idx = pickIndexFromPoint(e.clientX, e.clientY);
    setHovered(idx);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (didOpen.current) {
      const idx = pickIndexFromPoint(e.clientX, e.clientY);
      if (idx != null) {
        const item = ITEMS[idx];
        navigate({ to: item.to });
      }
      close();
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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[9998] backdrop-blur-md animate-fade-in"
          style={{ background: "oklch(0 0 0 / 0.55)" }}
          onClick={close}
        />
      )}

      <div className="flex-1 flex justify-center" style={{ overflow: "visible" }}>
        <div className="relative" style={{ marginTop: "-1.75rem" }}>
          {/* Radial items */}
          {open &&
            ITEMS.map((item, i) => {
              const angle = Math.PI / 2 - (i / ITEMS.length) * Math.PI * 2;
              const x = Math.cos(angle) * RADIUS;
              const y = -Math.sin(angle) * RADIUS;
              const Icon = item.icon;
              const isHover = hovered === i;
              return (
                <div
                  key={item.label}
                  className="absolute pointer-events-none animate-scale-in"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${isHover ? 1.18 : 1})`,
                    transition: "transform 160ms cubic-bezier(0.34,1.56,0.64,1)",
                    animationDelay: `${i * 30}ms`,
                    animationFillMode: "backwards",
                    zIndex: 10000,
                  }}
                >
                  <div
                    className="size-14 rounded-full grid place-items-center glass-strong border"
                    style={{
                      borderColor: isHover ? item.color : "oklch(1 0 0 / 0.15)",
                      boxShadow: isHover
                        ? `0 0 24px ${item.color}, 0 0 0 2px ${item.color}`
                        : "0 8px 24px oklch(0 0 0 / 0.5)",
                      color: item.color,
                    }}
                  >
                    <Icon className="size-6" />
                  </div>
                  <div
                    className="absolute left-1/2 -translate-x-1/2 mt-1.5 text-[10px] font-semibold whitespace-nowrap px-1.5 py-0.5 rounded-md"
                    style={{
                      top: "100%",
                      color: isHover ? item.color : "oklch(1 0 0 / 0.85)",
                      background: "oklch(0 0 0 / 0.55)",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              );
            })}

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
