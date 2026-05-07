import { useEffect, useRef } from "react";
import { Heart, MessageCircle, UserPlus, Zap, Sparkles, Radio, CheckCheck, X, Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { creators } from "@/lib/mock-data";
import { toast } from "sonner";

type N = {
  id: string;
  kind: "like" | "comment" | "follow" | "live" | "trey" | "boost";
  who?: typeof creators[number];
  text: string;
  time: string;
  unread?: boolean;
  to?: string;
};

const items: N[] = [
  { id: "n1", kind: "live", who: creators[0], text: "is live now — 'Studio Sessions Vol. 4'", time: "now", unread: true, to: "/explore" },
  { id: "n2", kind: "trey", text: "Trey-I prescribed 6 fresh picks based on your mood", time: "2m", unread: true, to: "/prescribe-me" },
  { id: "n3", kind: "like", who: creators[1], text: "and 312 others liked your post", time: "12m", unread: true },
  { id: "n4", kind: "comment", who: creators[2], text: 'commented: "this is fire 🔥"', time: "44m", unread: true, to: "/inbox" },
  { id: "n5", kind: "follow", who: creators[3], text: "started following you", time: "1h" },
  { id: "n6", kind: "boost", text: "Your post hit 10K views — boost unlocked", time: "3h", to: "/analytics" },
  { id: "n7", kind: "comment", who: creators[4], text: "tagged you in a reply", time: "5h", to: "/inbox" },
  { id: "n8", kind: "follow", who: creators[0], text: "shared your show with their audience", time: "1d" },
];

const iconFor = (k: N["kind"]) => ({
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  live: Radio,
  trey: Sparkles,
  boost: Zap,
}[k]);

const tintFor = (k: N["kind"]) => ({
  like: "text-[oklch(0.7_0.25_340)] bg-[oklch(0.7_0.25_340_/_0.12)]",
  comment: "text-[oklch(0.82_0.15_215)] bg-[oklch(0.82_0.15_215_/_0.12)]",
  follow: "text-primary bg-primary/15",
  live: "text-[oklch(0.7_0.25_340)] bg-[oklch(0.7_0.25_340_/_0.15)]",
  trey: "text-[oklch(0.65_0.22_300)] bg-[oklch(0.65_0.22_300_/_0.15)]",
  boost: "text-primary bg-primary/15",
}[k]);

export function NotificationsPopover({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;
  const unread = items.filter((i) => i.unread).length;

  return (
    <div
      ref={ref}
      className="absolute right-2 top-[calc(100%+6px)] z-50 w-[min(94vw,380px)] origin-top-right animate-rise"
    >
      <div className="rounded-3xl glass-strong border border-white/10 shadow-[0_20px_60px_-20px_oklch(0_0_0_/_0.8)] overflow-hidden">
        {/* aurora trim */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,oklch(0.82_0.16_85_/_0.7),oklch(0.7_0.25_340_/_0.6),oklch(0.65_0.22_300_/_0.6),transparent)]" />
        <div aria-hidden className="absolute -top-16 -right-10 size-40 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-16 -left-10 size-40 rounded-full bg-[oklch(0.7_0.25_340_/_0.15)] blur-3xl pointer-events-none" />

        <header className="relative flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="size-8 grid place-items-center rounded-xl bg-primary/15 text-primary glow-gold">
              <Bell className="size-4" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Notifications</div>
              <div className="text-[10px] text-muted-foreground">{unread} new updates</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="size-8 grid place-items-center rounded-full glass hover:bg-white/5">
            <X className="size-4" />
          </button>
        </header>

        <div className="px-3 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {["All", "Mentions", "Likes", "Follows", "Live"].map((c, i) => (
            <button
              key={c}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] border transition ${
                i === 0
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-white/10 text-muted-foreground hover:bg-white/5"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="max-h-[58vh] overflow-y-auto">
          {items.map((n, idx) => {
            const Icon = iconFor(n.kind);
            const Body = (
              <div
                style={{ animationDelay: `${idx * 35}ms` }}
                className={`group relative flex items-start gap-3 px-3 py-2.5 mx-2 my-1 rounded-2xl animate-rise transition cursor-pointer ${
                  n.unread ? "bg-white/[0.03] hover:bg-white/[0.06]" : "hover:bg-white/[0.04]"
                }`}
              >
                {n.unread && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-0.5 rounded-r bg-primary shadow-[0_0_8px_var(--gold)]" />
                )}

                <div className="relative shrink-0">
                  {n.who ? (
                    <img src={n.who.avatar} alt="" className="size-10 rounded-full object-cover ring-1 ring-white/10" />
                  ) : (
                    <div className={`size-10 rounded-full grid place-items-center ${tintFor(n.kind)}`}>
                      <Icon className="size-5" />
                    </div>
                  )}
                  {n.who && (
                    <div className={`absolute -bottom-0.5 -right-0.5 size-5 rounded-full grid place-items-center ring-2 ring-background ${tintFor(n.kind)}`}>
                      <Icon className="size-3" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs leading-snug">
                    {n.who && <span className="font-semibold">{n.who.name} </span>}
                    <span className={n.unread ? "text-foreground" : "text-muted-foreground"}>{n.text}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{n.time}</span>
                    {n.kind === "follow" && (
                      <button onClick={(e) => { e.preventDefault(); toast.success("Following back"); }} className="px-2 py-0.5 rounded-full border border-primary/40 text-primary hover:bg-primary/10">
                        Follow back
                      </button>
                    )}
                    {n.kind === "live" && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[oklch(0.7_0.25_340_/_0.2)] text-[oklch(0.7_0.25_340)] font-semibold uppercase tracking-wider">
                        Live
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
            return n.to ? (
              <Link key={n.id} to={n.to} onClick={onClose} className="block">
                {Body}
              </Link>
            ) : (
              <div key={n.id} onClick={onClose}>{Body}</div>
            );
          })}
        </div>

        <footer className="relative flex items-center justify-between px-3 py-2 border-t border-white/5 bg-white/[0.02]">
          <button
            onClick={() => toast.success("All caught up")}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <CheckCheck className="size-3.5" /> Mark all as read
          </button>
          <Link to="/inbox" onClick={onClose} className="text-[11px] font-semibold text-primary hover:underline">
            Open Inbox →
          </Link>
        </footer>
      </div>
    </div>
  );
}
