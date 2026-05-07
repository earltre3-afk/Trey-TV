import { X, Home, Search, Users, Zap, Heart, Bookmark, Radio, Crown, BarChart3, Settings, Gem, ChevronRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { currentUser } from "@/lib/mock-data";
import { VerifiedBadge } from "@/components/brand/Badge";

type Item = { icon: typeof Home; label: string; sub: string; to: string; color: string; active?: boolean };

const items: Item[] = [
  { icon: Home, label: "Home", sub: "For You", to: "/", color: "text-primary", active: true },
  { icon: Search, label: "Explore", sub: "Discover Creators & Content", to: "/explore", color: "text-[oklch(0.65_0.22_300)]" },
  { icon: Users, label: "Following", sub: "Creators You Follow", to: "/", color: "text-[oklch(0.65_0.22_300)]" },
  { icon: Zap, label: "Latest", sub: "Fresh Content", to: "/", color: "text-primary" },
  { icon: Heart, label: "Prescribe Me", sub: "Personalized Picks", to: "/prescribe-me", color: "text-[oklch(0.7_0.25_340)]" },
  { icon: Bookmark, label: "Collections", sub: "Your Saved Content", to: "/inbox", color: "text-[oklch(0.65_0.22_300)]" },
  { icon: Radio, label: "Go Live", sub: "Broadcast to the World", to: "/create", color: "text-[oklch(0.7_0.25_340)]" },
];

const creatorItems: Item[] = [
  { icon: Crown, label: "Creator Hub", sub: "Manage Your Brand", to: "/u/$uid", color: "text-primary" },
  { icon: BarChart3, label: "Analytics", sub: "Track Your Growth", to: "/u/$uid", color: "text-[oklch(0.65_0.22_300)]" },
  { icon: Settings, label: "Settings", sub: "Account & Preferences", to: "/u/$uid", color: "text-[oklch(0.82_0.15_215)]" },
];

export function SideMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-[86%] max-w-[360px] glass-strong border-r border-white/10 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ borderTopRightRadius: 32, borderBottomRightRadius: 32 }}
      >
        <div className="h-full flex flex-col overflow-y-auto safe-bottom">
          <div className="flex items-start justify-between p-5">
            <Logo className="h-12" />
            <button onClick={onClose} aria-label="Close" className="size-9 grid place-items-center rounded-full glass">
              <X className="size-5" />
            </button>
          </div>

          <div className="px-3 space-y-1">
            {items.map((i) => (
              <Link
                key={i.label}
                to={i.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition ${i.active ? "bg-primary/10 ring-1 ring-primary/40 glow-gold" : "hover:bg-white/5"}`}
              >
                <div className="size-10 rounded-xl grid place-items-center bg-white/5">
                  <i.icon className={`size-5 ${i.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${i.active ? "text-primary" : "text-foreground"}`}>{i.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{i.sub}</div>
                </div>
                {i.active ? <span className="size-2 rounded-full bg-primary shadow-[0_0_8px_var(--gold)]" /> : <ChevronRight className="size-4 text-muted-foreground" />}
              </Link>
            ))}
          </div>

          <div className="my-4 mx-5 h-px bg-white/10" />

          <div className="px-3 space-y-1">
            {creatorItems.map((i) => (
              <Link
                key={i.label}
                to="/u/$uid"
                params={{ uid: currentUser.uid }}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5"
              >
                <div className="size-10 rounded-xl grid place-items-center bg-white/5">
                  <i.icon className={`size-5 ${i.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{i.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{i.sub}</div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>

          <div className="mx-3 mt-4 p-4 rounded-2xl border border-[oklch(0.65_0.22_300_/_0.4)] bg-[linear-gradient(135deg,oklch(0.25_0.1_300_/_0.6),oklch(0.18_0.05_270_/_0.6))] glow-purple flex items-center gap-3">
            <Gem className="size-7 text-[oklch(0.7_0.25_340)]" />
            <div className="flex-1">
              <div className="text-sm font-bold">Trey TV Premium</div>
              <div className="text-xs text-muted-foreground">Unlock exclusive tools, insights & features.</div>
            </div>
            <button onClick={() => { onClose(); toast.success("Premium coming soon — you're on the list"); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)] hover:bg-[oklch(0.7_0.25_340_/_0.1)]">
              Upgrade
            </button>
          </div>

          <Link
            to="/u/$uid"
            params={{ uid: currentUser.uid }}
            onClick={onClose}
            className="mx-3 my-3 p-3 rounded-2xl glass flex items-center gap-3 hover:bg-white/5"
          >
            <img src={currentUser.avatar} alt="" className="size-12 rounded-full object-cover ring-neon-purple" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{currentUser.name}</div>
              <div className="text-xs text-muted-foreground">@{currentUser.handle}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/40">
                <VerifiedBadge kind="creator" className="!size-3" /> Verified Creator
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </div>
      </aside>
    </>
  );
}
