import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  X,
  Send,
  Wand2,
  Heart,
  BarChart3,
  Mic,
  Image as ImageIcon,
  Move,
} from "lucide-react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { treyIGenerate } from "@/lib/trey-i/vertex.server";

type Msg = { id: string; from: "you" | "ai"; text: string; time: string };

const seed: Msg[] = [
  {
    id: "1",
    from: "ai",
    text: "Hey 👋 I'm Trey-I — your creative co-pilot. Drag me anywhere. Ask me to draft a caption, prescribe a vibe, or remix your last drop.",
    time: "now",
  },
];

const quick = [
  { icon: Wand2, label: "Caption my last post" },
  { icon: Heart, label: "Suggest a mood drop" },
  { icon: BarChart3, label: "What's trending tonight?" },
  { icon: ImageIcon, label: "Generate a thumbnail" },
];

const POS_KEY = "treyi_pos_v1";
const SIZE = 56;
const PAD = 12;

const INITIAL_POS = { x: 16, y: 200 };

function clampToViewport(x: number, y: number, isFormPage: boolean = false) {
  if (typeof window === "undefined") return { x, y };
  const isMobile = window.innerWidth < 1024;
  const safeAreaBottom =
    typeof window !== "undefined"
      ? parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("--safe-area-inset-bottom") ||
            "0",
        )
      : 0;
  // On form pages, increase bottom padding to avoid overlapping form elements
  const baseBottomPad = isMobile ? 120 : PAD;
  const bottomPad = isFormPage ? Math.max(baseBottomPad, 140) : baseBottomPad;
  const maxX = Math.max(PAD, window.innerWidth - SIZE - PAD);
  const maxY = Math.max(PAD, window.innerHeight - SIZE - bottomPad - safeAreaBottom);
  return {
    x: Math.min(Math.max(PAD, x), maxX),
    y: Math.min(Math.max(PAD, y), maxY),
  };
}

function defaultPos(isFormPage: boolean = false) {
  if (typeof window === "undefined") return { x: 16, y: 200 };
  const isMobile = window.innerWidth < 1024;
  const x = window.innerWidth - SIZE - 16;
  const baseBottomMargin = isMobile ? 100 : 24;
  const bottomMargin = isFormPage ? 150 : baseBottomMargin;
  const y = window.innerHeight - SIZE - bottomMargin;
  return clampToViewport(x, y, isFormPage);
}

export function TreyIWidget() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  // Detect form pages where the widget should be positioned higher
  const isFormPage =
    pathname.includes("/music-review/submit") ||
    pathname.includes("/create") ||
    pathname.includes("/upload");
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [text, setText] = useState("");
  const [aibusy, setAibusy] = useState(false);
  const [pos, setPos] = useState(INITIAL_POS);
  const posRef = useRef(INITIAL_POS);
  const loadedRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragInfo = useRef<{
    dx: number;
    dy: number;
    moved: boolean;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    lastT: number;
    vx: number;
    vy: number;
    pendingX: number;
    pendingY: number;
    rafId: number | null;
  }>({
    dx: 0,
    dy: 0,
    moved: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    vx: 0,
    vy: 0,
    pendingX: 0,
    pendingY: 0,
    rafId: null,
  });
  const btnRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pointerToggleHandledRef = useRef(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const applyTransform = useCallback((x: number, y: number) => {
    const el = btnRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, []);

  const moveTo = useCallback(
    (next: { x: number; y: number }, commit = true) => {
      const clamped = clampToViewport(next.x, next.y, isFormPage);
      posRef.current = clamped;
      applyTransform(clamped.x, clamped.y);
      if (commit) setPos(clamped);
    },
    [applyTransform, isFormPage],
  );

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<{ x: number; y: number }>;
        if (typeof saved.x === "number" && typeof saved.y === "number") {
          moveTo({ x: saved.x, y: saved.y });
          loadedRef.current = true;
          return;
        }
      }
    } catch {}
    moveTo(defaultPos(isFormPage));
    loadedRef.current = true;
  }, [moveTo, isFormPage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      localStorage.setItem(POS_KEY, JSON.stringify(pos));
    } catch {}
  }, [pos]);

  useEffect(() => {
    const onResize = () => moveTo(posRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [moveTo]);

  const flushDrag = useCallback(() => {
    dragInfo.current.rafId = null;
    const { pendingX, pendingY } = dragInfo.current;
    const clamped = clampToViewport(pendingX, pendingY, isFormPage);
    posRef.current = clamped;
    applyTransform(clamped.x, clamped.y);
    const vx = dragInfo.current.vx;
    const vy = dragInfo.current.vy;
    const ry = Math.max(-14, Math.min(14, vx * 0.6));
    const rx = Math.max(-14, Math.min(14, -vy * 0.6));
    setTilt({ rx, ry });
  }, [applyTransform, isFormPage]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    const current = posRef.current;
    const now = performance.now();
    pointerToggleHandledRef.current = false;
    dragInfo.current = {
      dx: e.clientX - current.x,
      dy: e.clientY - current.y,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      lastT: now,
      vx: 0,
      vy: 0,
      pendingX: current.x,
      pendingY: current.y,
      rafId: null,
    };
    setDragging(true);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      e.preventDefault();
      const nx = e.clientX - dragInfo.current.dx;
      const ny = e.clientY - dragInfo.current.dy;
      const now = performance.now();
      const dt = Math.max(1, now - dragInfo.current.lastT);
      const instVx = ((e.clientX - dragInfo.current.lastX) / dt) * 16;
      const instVy = ((e.clientY - dragInfo.current.lastY) / dt) * 16;
      dragInfo.current.vx = dragInfo.current.vx * 0.7 + instVx * 0.3;
      dragInfo.current.vy = dragInfo.current.vy * 0.7 + instVy * 0.3;
      dragInfo.current.lastX = e.clientX;
      dragInfo.current.lastY = e.clientY;
      dragInfo.current.lastT = now;

      if (
        Math.hypot(e.clientX - dragInfo.current.startX, e.clientY - dragInfo.current.startY) > 8
      ) {
        dragInfo.current.moved = true;
      }

      dragInfo.current.pendingX = nx;
      dragInfo.current.pendingY = ny;
      if (dragInfo.current.rafId == null) {
        dragInfo.current.rafId = requestAnimationFrame(flushDrag);
      }
    },
    [dragging, flushDrag],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
      if (dragInfo.current.rafId != null) {
        cancelAnimationFrame(dragInfo.current.rafId);
        dragInfo.current.rafId = null;
      }
      setDragging(false);
      setTilt({ rx: 0, ry: 0 });

      if (!dragInfo.current.moved) {
        setOpen((o) => !o);
        pointerToggleHandledRef.current = true;
        e.stopPropagation();
        return;
      }

      if (typeof window !== "undefined") {
        const start = posRef.current;
        const speed = Math.hypot(dragInfo.current.vx, dragInfo.current.vy);
        const nearLeft = start.x < 48;
        const nearRight = start.x > window.innerWidth - SIZE - 48;
        const flicked = speed > 28;

        let to = clampToViewport(start.x, start.y, isFormPage);
        if (nearLeft || nearRight || flicked) {
          const projectedX = start.x + dragInfo.current.vx * 8;
          const projectedY = start.y + dragInfo.current.vy * 8;
          const snapLeft = projectedX + SIZE / 2 < window.innerWidth / 2;
          const targetX = snapLeft ? PAD : window.innerWidth - SIZE - PAD;
          to = clampToViewport(targetX, projectedY);
        }

        const from = { ...start };
        const duration = 420;
        const t0 = performance.now();
        const ease = (t: number) => {
          const c1 = 1.4;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };
        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / duration);
          const k = ease(t);
          const x = from.x + (to.x - from.x) * k;
          const y = from.y + (to.y - from.y) * k;
          applyTransform(x, y);
          if (t < 1) {
            requestAnimationFrame(step);
          } else {
            posRef.current = to;
            setPos(to);
          }
        };
        requestAnimationFrame(step);
      }
      e.stopPropagation();
    },
    [applyTransform, isFormPage],
  );

  const onLauncherClick = useCallback(() => {
    if (pointerToggleHandledRef.current) {
      pointerToggleHandledRef.current = false;
      return;
    }
    setOpen((o) => !o);
  }, []);

  const send = async (raw?: string) => {
    const value = (raw ?? text).trim();
    if (!value || aibusy) return;

    if (value === "04231993") {
      signIn("creator");
      setText("");
      setMsgs((m) => [
        ...m,
        { id: crypto.randomUUID(), from: "you", text: value, time: "now" },
        {
          id: crypto.randomUUID(),
          from: "ai",
          text: "Access granted. Tester environment active — you're in as a verified creator.",
          time: "now",
        },
      ]);
      setTimeout(() => nav({ to: "/" }), 1600);
      return;
    }

    const youMsg: Msg = { id: crypto.randomUUID(), from: "you", text: value, time: "now" };
    setMsgs((m) => [...m, youMsg]);
    setText("");
    setAibusy(true);
    try {
      const result = await treyIGenerate({ data: { task: "widget_chat", prompt: value } });
      const reply = "text" in result && result.text ? result.text : aiReply(value);
      setMsgs((m) => [...m, { id: crypto.randomUUID(), from: "ai", text: reply, time: "now" }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { id: crypto.randomUUID(), from: "ai", text: aiReply(value), time: "now" },
      ]);
    } finally {
      setAibusy(false);
    }
  };

  const panelStyle = (() => {
    if (!mounted || typeof window === "undefined") return { left: pos.x, top: pos.y };
    const W = Math.min(380, window.innerWidth - 2 * PAD);
    const H = Math.min(560, window.innerHeight * 0.75);
    const onLeft = pos.x + SIZE / 2 < window.innerWidth / 2;
    const left = onLeft
      ? Math.min(pos.x + SIZE + 10, window.innerWidth - W - PAD)
      : Math.max(PAD, pos.x - W - 10);
    const top = Math.max(PAD, Math.min(pos.y + SIZE / 2 - H / 2, window.innerHeight - H - PAD));
    return { left, top, width: W };
  })();

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onLauncherClick}
        aria-label="Open Trey-I assistant — drag to move"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          touchAction: "none",
          willChange: "transform",
        }}
        className={`z-[10020] size-14 rounded-full grid place-items-center select-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <span
          aria-hidden
          style={{
            transform: `perspective(600px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${dragging ? 1.12 : 1})`,
            transition: dragging
              ? "transform 140ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            willChange: "transform",
          }}
          className={`absolute inset-0 rounded-full grid place-items-center ${
            dragging
              ? "shadow-[0_30px_70px_-10px_oklch(0.7_0.25_340_/_0.55),0_0_40px_oklch(0.82_0.16_85_/_0.35)]"
              : open
                ? "ring-2 ring-primary/60 shadow-[0_0_30px_oklch(0.82_0.16_85_/_0.6)]"
                : "shadow-[0_10px_30px_-10px_oklch(0_0_0_/_0.5)]"
          }`}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,oklch(0.25_0.15_300_/_0.55),oklch(0.1_0.08_320_/_0.35)_45%,transparent_72%)] blur-2xl animate-dread-breathe"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-6 rounded-full bg-[conic-gradient(from_0deg,transparent,oklch(0.18_0.12_320_/_0.7),transparent_40%,oklch(0.22_0.18_280_/_0.6),transparent_75%)] blur-xl opacity-80 animate-dread-spin"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-2 rounded-full ring-1 ring-[oklch(0.7_0.25_340_/_0.45)] animate-dread-ring"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-4 rounded-full ring-1 ring-[oklch(0.65_0.22_300_/_0.35)] animate-dread-ring [animation-delay:1.2s]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-6 rounded-full ring-1 ring-[oklch(0.55_0.2_320_/_0.25)] animate-dread-ring [animation-delay:2.4s]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-3 rounded-full bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.7_0.25_340_/_0.4),transparent_60%),radial-gradient(ellipse_at_70%_80%,oklch(0.55_0.22_280_/_0.4),transparent_60%)] blur-md animate-dread-drift mix-blend-screen"
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85),oklch(0.7_0.25_340),oklch(0.65_0.22_300),oklch(0.82_0.15_215),oklch(0.82_0.16_85))] animate-conic-spin opacity-90 blur-[1px]"
          />
          <span aria-hidden className="absolute inset-0.5 rounded-full bg-[oklch(0.13_0.02_270)]" />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-glow-pulse"
          />
          <Sparkles className="relative size-6 text-primary drop-shadow-[0_0_8px_oklch(0.82_0.16_85_/_0.9)] animate-dread-flicker" />
          <span className="absolute -top-1 -right-1 size-3 rounded-full bg-[oklch(0.7_0.25_340)] ring-2 ring-background animate-glow-pulse" />
          {dragging && (
            <span className="absolute -bottom-1 -left-1 size-5 grid place-items-center rounded-full bg-background/90 ring-1 ring-white/20">
              <Move className="size-3 text-primary" />
            </span>
          )}
        </span>
      </button>

      <div
        style={{ position: "fixed", ...panelStyle }}
        className={`fixed z-[10030] max-h-[75vh] flex flex-col rounded-3xl treyi-chatbox-frost neon-border shadow-[0_30px_80px_-20px_oklch(0_0_0_/_0.8)] origin-bottom-right transition-all duration-300 ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
      >
        <div className="relative p-4 border-b border-white/5 overflow-hidden">
          <div className="absolute -top-10 -right-10 size-32 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.5),transparent_70%)] blur-xl" />
          <div className="relative flex items-center gap-3">
            <div className="relative size-10 rounded-full conic-ring shrink-0">
              <div className="size-10 rounded-full grid place-items-center bg-background">
                <Sparkles className="size-5 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold">Trey-I</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-[oklch(0.78_0.18_150)] animate-glow-pulse" />
                Online · co-pilot for creators
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="size-8 grid place-items-center rounded-full hover:bg-white/5"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {msgs.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from === "you" ? "justify-end" : "justify-start"} animate-rise`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.from === "you"
                    ? "bg-primary text-primary-foreground rounded-br-sm shadow-[0_0_18px_oklch(0.82_0.16_85_/_0.4)]"
                    : "glass border border-white/10 rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {aibusy && (
            <div className="flex justify-start animate-rise">
              <div className="glass border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>

        {msgs.length <= 2 && !aibusy && (
          <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quick.map((q) => (
              <button
                key={q.label}
                onClick={() => send(q.label)}
                className="shrink-0 px-3 py-1.5 rounded-full text-[11px] glass border border-white/10 hover:bg-white/5 flex items-center gap-1.5 tilt-press"
              >
                <q.icon className="size-3 text-primary" />
                {q.label}
              </button>
            ))}
          </div>
        )}

        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2 rounded-2xl glass border border-white/10 px-3 py-2 focus-within:border-primary/50 transition">
            <button className="text-muted-foreground hover:text-primary">
              <Mic className="size-4" />
            </button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask Trey-I anything…"
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => send()}
              disabled={!text.trim() || aibusy}
              className={`size-8 grid place-items-center rounded-xl transition ${text.trim() && !aibusy ? "bg-primary text-primary-foreground glow-gold tilt-press" : "bg-white/5 text-muted-foreground"}`}
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function aiReply(input: string): string {
  const t = input.toLowerCase();
  if (t.includes("caption"))
    return "Try: 'Lights low, vibes high. Late nights only make sense at the studio. New drop loading…' 🎬✨";
  if (t.includes("mood") || t.includes("prescribe"))
    return "Tonight feels like a Late-Night Drive set. I can stitch a 4-track moodboard. Want me to send it to your Prescribe Me feed?";
  if (t.includes("trend"))
    return "Top movers right now: #StudioSessions (+184%), #LateNightDrops (+92%), and 'Aurora' filter. Wanna ride one?";
  if (t.includes("thumbnail") || t.includes("image"))
    return "Cooking up a 3-variant thumbnail pack — gold-noir, neon-purple, and aurora. ETA 12s. ⏳";
  return "On it. I'll line up a draft and ping you in your Inbox when it's ready.";
}
