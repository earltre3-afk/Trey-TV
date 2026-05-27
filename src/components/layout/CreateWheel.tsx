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
    close();
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
              className="fixed left-1/2 z-[10000] w-[min(92vw,380px)] -translate-x-1/2 rounded-[28px] border border-white/15 bg-[#05070D]/95 p-3 shadow-[0_24px_80px_-24px_oklch(0.65_0.22_300_/_0.9)] backdrop-blur-2xl animate-scale-in"
              style={{ bottom: "calc(5.75rem + env(safe-area-inset-bottom))" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.26em] text-muted-foreground">Create</div>
              <div className="grid grid-cols-2 gap-2">
                {ITEMS.map((item, i) => {
                  const Icon = item.icon;
                  const isHover = hovered === i;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      data-create-menu-index={i}
                      onClick={() => {
                        navigate({ to: item.to });
                        close();
                      }}
                      className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 text-left active:scale-[0.98]"
                      style={{ boxShadow: isHover ? `0 0 20px ${item.color}55` : undefined }}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl" style={{ background: `${item.color}22`, color: item.color, border: `1px solid ${item.color}66` }}>
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 text-sm font-bold text-white">{item.label}</span>
                    </button>
                  );
                })}
              </div>
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
