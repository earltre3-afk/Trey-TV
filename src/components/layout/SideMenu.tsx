import {
  X,
  Home,
  Sparkles,
  Search,
  Users,
  Heart,
  Bookmark,
  Radio,
  Crown,
  BarChart3,
  Settings,
  Gem,
  ChevronRight,
  Pencil,
  Activity,
  ShieldCheck,
  LogIn,
  LogOut,
  Upload,
  CalendarDays,
  Award,
  Dices,
  Music,
  Flame,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Link, useNavigate } from "@tanstack/react-router";

import { currentUser } from "@/lib/mock-data";
import { VerifiedBadge } from "@/components/brand/Badge";
import { useAuth } from "@/lib/auth";
import { useSupabaseSession } from "@/lib/supabase-session";
import { preloadTradioModule } from "@/tradio/preload";

type Item = {
  icon: typeof Home;
  label: string;
  sub: string;
  to: string;
  color: string;
  active?: boolean;
};

const items: Item[] = [
  {
    icon: Home,
    label: "Home",
    sub: "The streaming home",
    to: "/",
    color: "text-primary",
    active: true,
  },
  {
    icon: Sparkles,
    label: "For You",
    sub: "Personalized feed",
    to: "/for-you",
    color: "text-primary",
  },
  {
    icon: Search,
    label: "Discover",
    sub: "Explore creators & content",
    to: "/explore",
    color: "text-[oklch(0.65_0.22_300)]",
  },
  {
    icon: CalendarDays,
    label: "Guide",
    sub: "What's on right now",
    to: "/guide",
    color: "text-[oklch(0.82_0.15_215)]",
  },
  {
    icon: Users,
    label: "Following",
    sub: "Creators You Follow",
    to: "/following",
    color: "text-[oklch(0.65_0.22_300)]",
  },
  {
    icon: Heart,
    label: "Prescribe Me",
    sub: "Personalized picks",
    to: "/prescribe-me",
    color: "text-[oklch(0.7_0.25_340)]",
  },
  {
    icon: Bookmark,
    label: "Collections",
    sub: "Your Saved Content",
    to: "/collections",
    color: "text-[oklch(0.65_0.22_300)]",
  },
  {
    icon: Activity,
    label: "Activity",
    sub: "Your interactions",
    to: "/activity",
    color: "text-[oklch(0.82_0.15_215)]",
  },
  {
    icon: Gem,
    label: "Rewards",
    sub: "Points · Gifts · Perks",
    to: "/rewards",
    color: "text-primary",
  },
  {
    icon: Dices,
    label: "Games",
    sub: "Lounge · Cards · Coming Soon",
    to: "/games",
    color: "text-[#00B7FF]",
  },
  {
    icon: Music,
    label: "Tradio",
    sub: "The Native Music World",
    to: "/tradio",
    color: "text-[#D946EF]",
  },
  {
    icon: Flame,
    label: "Trance",
    sub: "The Dance Universe",
    to: "/trance",
    color: "text-[#00F5FF]",
  },
  {
    icon: Radio,
    label: "Go Live",
    sub: "Broadcast to the World",
    to: "/go-live",
    color: "text-[oklch(0.7_0.25_340)]",
  },
  { icon: Award, label: "Apply", sub: "Become a creator", to: "/apply", color: "text-primary" },
];

const creatorItems: Item[] = [
  {
    icon: Crown,
    label: "Creator Hub",
    sub: "Manage Your Brand",
    to: "/creator-hub",
    color: "text-primary",
  },
  {
    icon: Upload,
    label: "My Submissions",
    sub: "Approval status & feedback",
    to: "/creator-studio/submissions",
    color: "text-[oklch(0.82_0.16_85)]",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    sub: "Track Your Growth",
    to: "/analytics",
    color: "text-[oklch(0.65_0.22_300)]",
  },
  {
    icon: Pencil,
    label: "Edit Profile",
    sub: "Polish your presence",
    to: "/edit-profile",
    color: "text-[oklch(0.7_0.25_340)]",
  },
  {
    icon: Settings,
    label: "Settings",
    sub: "Account & Preferences",
    to: "/settings",
    color: "text-[oklch(0.82_0.15_215)]",
  },
];

export function SideMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, isGuest, isCreator, isAdmin, signOut } = useAuth();
  const { signOutSupabase } = useSupabaseSession();
  const nav = useNavigate();
  const profile = user ?? currentUser;

  const handleSignOut = async () => {
    signOut();
    await signOutSupabase();
    onClose();
    nav({ to: "/login" });
  };
  const visibleCreatorItems = isCreator
    ? creatorItems
    : creatorItems.filter((i) => i.label === "Edit Profile" || i.label === "Settings");
  // Keep Tradio public and instant; Trance remains signed-in only.
  const visibleItems = isGuest ? items.filter((i) => i.to !== "/trance") : items;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ position: "fixed" }}
      />
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-[88vw] max-w-[380px] liquid-glass border-r border-white/10 transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ position: "fixed", borderTopRightRadius: 28, borderBottomRightRadius: 28 }}
      >
        <div
          className="h-full flex flex-col overflow-y-auto"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            // Leave room for the floating bottom dock (lg:hidden) so the last
            // cards never sit behind it on mobile.
            paddingBottom: "calc(env(safe-area-inset-bottom) + 7rem)",
          }}
        >
          <div className="flex items-start justify-between p-5">
            <Logo className="h-12" />
            <button
              onClick={onClose}
              aria-label="Close"
              className="size-9 grid place-items-center rounded-full glass"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="px-3 space-y-1">
            {visibleItems.map((i, idx) => (
              <Link
                key={i.label}
                to={i.to}
                preload={i.to === "/tradio" ? "intent" : undefined}
                onClick={() => {
                  if (i.to === "/tradio") void preloadTradioModule();
                  onClose();
                }}
                onPointerEnter={i.to === "/tradio" ? () => void preloadTradioModule() : undefined}
                onFocus={i.to === "/tradio" ? () => void preloadTradioModule() : undefined}
                onTouchStart={i.to === "/tradio" ? () => void preloadTradioModule() : undefined}
                style={{ animationDelay: `${idx * 50}ms` }}
                className={`group flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 hover:translate-x-1 ${open ? "animate-rise" : ""} ${i.active ? "bg-primary/10 ring-1 ring-primary/40 glow-gold" : "hover:bg-white/5"}`}
              >
                <div
                  className={`size-10 rounded-xl grid place-items-center bg-white/5 transition-transform group-hover:scale-110 ${i.active ? "shadow-[0_0_18px_oklch(0.82_0.16_85_/_0.5)]" : ""}`}
                >
                  <i.icon className={`size-5 ${i.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-semibold ${i.active ? "text-primary" : "text-foreground"}`}
                  >
                    {i.label}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{i.sub}</div>
                </div>
                {i.active ? (
                  <span className="size-2 rounded-full bg-primary shadow-[0_0_8px_var(--gold)] animate-glow-pulse" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                )}
              </Link>
            ))}
          </div>

          <div className="my-4 mx-5 h-px bg-white/10" />

          <div className="px-3 space-y-1">
            {visibleCreatorItems.map((i, idx) => (
              <Link
                key={i.label}
                to={i.to}
                onClick={onClose}
                style={{ animationDelay: `${(idx + items.length) * 50}ms` }}
                className={`group flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 hover:translate-x-1 transition-all duration-300 ${open ? "animate-rise" : ""}`}
              >
                <div className="size-10 rounded-xl grid place-items-center bg-white/5 transition-transform group-hover:scale-110">
                  <i.icon className={`size-5 ${i.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{i.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{i.sub}</div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={onClose}
                className="group flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 transition"
              >
                <div className="size-10 rounded-xl grid place-items-center bg-[oklch(0.7_0.25_340_/_0.15)] text-[oklch(0.7_0.25_340)]">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">Admin Console</div>
                  <div className="text-xs text-muted-foreground">Moderation & site ops</div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            )}
          </div>

          <div className="mx-3 mt-4 p-4 rounded-2xl border border-[oklch(0.65_0.22_300_/_0.4)] bg-[linear-gradient(135deg,oklch(0.25_0.1_300_/_0.6),oklch(0.18_0.05_270_/_0.6))] glow-purple flex items-center gap-3">
            <Gem className="size-7 text-[oklch(0.7_0.25_340)]" />
            <div className="flex-1">
              <div className="text-sm font-bold">Trey TV Premium</div>
              <div className="text-xs text-muted-foreground">
                Unlock exclusive tools, insights & features.
              </div>
            </div>
            <Link
              to="/premium"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)] hover:bg-[oklch(0.7_0.25_340_/_0.1)]"
            >
              Upgrade
            </Link>
          </div>

          {isGuest ? (
            <div className="mx-3 my-3 p-4 rounded-2xl liquid-glass neon-border space-y-2">
              <div className="text-sm font-bold">Guest mode</div>
              <div className="text-xs text-muted-foreground">
                Sign up to react, save, follow and earn rewards.
              </div>
              <div className="flex gap-2">
                <Link
                  to="/signup"
                  onClick={onClose}
                  className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground glow-gold"
                >
                  Sign up
                </Link>
                <Link
                  to="/login"
                  onClick={onClose}
                  className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-bold liquid-glass border border-white/15 inline-flex items-center justify-center gap-1"
                >
                  <LogIn className="size-3" /> Log in
                </Link>
              </div>
            </div>
          ) : (
            <Link
              to="/u/$uid"
              params={{ uid: profile.uid }}
              onClick={onClose}
              className="mx-3 my-3 p-3 rounded-2xl liquid-glass neon-border flex items-center gap-3 hover:bg-white/5 liquid-hover"
            >
              <div className="relative size-12 rounded-full conic-ring shrink-0">
                <img src={profile.avatar} alt="" className="size-12 rounded-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{profile.name}</div>
                <div className="text-xs text-muted-foreground">@{profile.handle}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/40">
                  <VerifiedBadge kind="creator" className="!size-3" />{" "}
                  {isAdmin ? "Admin" : isCreator ? "Verified Creator" : "Member"}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void handleSignOut();
                }}
                className="size-8 grid place-items-center rounded-lg hover:bg-white/5 text-muted-foreground"
                title="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
