import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import aiBallCutout from "@/tradio/assets/ai-ball.png";
import {
  Home, Compass, CalendarDays, Inbox, Sparkles, Heart, Gem, Bell, Search,
  Crown, BarChart3, Settings, Bookmark, Radio, Users, ChevronDown, LogIn, LogOut, Award,
  Music,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth";
import { useSupabaseSession } from "@/lib/supabase-session";
import { currentUser } from "@/lib/mock-data";
import { useNotifications } from "@/lib/notifications-store";
import { NotificationsPopover } from "./NotificationsPopover";
import { CreatorGoldNavButton } from "@/components/creator/CreatorGoldNavButton";

type NavLink = { to: string; icon?: typeof Home; label: string; badge?: number };

const guestLinks: readonly NavLink[] = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/explore", icon: Compass, label: "Discover" },
  { to: "/guide", icon: CalendarDays, label: "Guide" },
  { to: "/games", label: "Games" },
  // Tradio requires a signed-in Trey TV account — hidden for guests.
];

const signedInLinks: readonly NavLink[] = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/for-you", icon: Sparkles, label: "For You" },
  { to: "/explore", icon: Compass, label: "Discover" },
  { to: "/guide", icon: CalendarDays, label: "Guide" },
  { to: "/prescribe-me", icon: Heart, label: "Prescribe" },
  { to: "/games", label: "Games" },
  { to: "/tradio", icon: Music, label: "Tradio" },
  { to: "/trance", icon: Award, label: "Trance" },
  { to: "/inbox", icon: Inbox, label: "Inbox" },
];

const moreLinks: readonly NavLink[] = [
  { to: "/rewards", icon: Gem, label: "Rewards" },
  { to: "/creator-hub", icon: Crown, label: "Creator Hub" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/collections", icon: Bookmark, label: "Saved" },
  { to: "/go-live", icon: Radio, label: "Go Live" },
  { to: "/following", icon: Users, label: "Following" },
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/apply", icon: Award, label: "Apply" },
];

export function DesktopTopNav() {
  const { isGuest, user, signOut } = useAuth();
  const { signOutSupabase } = useSupabaseSession();
  const { pathname } = useLocation();
  const nav = useNavigate();

  const handleSignOut = async () => {
    signOut();
    await signOutSupabase();
    nav({ to: "/login" });
  };
  const [notifOpen, setNotifOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));
  const links = isGuest ? guestLinks : signedInLinks;
  const profileUid = user?.uid ?? currentUser.uid;
  const profileAvatar = user?.avatar ?? currentUser.avatar;

  return (
    <header className="hidden lg:block sticky top-0 z-40 w-full glass-strong border-b border-white/5">
      <div className="relative mx-auto max-w-[1400px] 2xl:max-w-[1600px] px-6 xl:px-10 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="relative shrink-0 group" aria-label="Trey TV home">
          <span
            aria-hidden
            className="absolute inset-0 -m-2 rounded-full blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500 bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.55),oklch(0.7_0.25_340_/_0.45),oklch(0.65_0.22_300_/_0.5),oklch(0.82_0.15_215_/_0.45),oklch(0.82_0.16_85_/_0.55))] animate-conic-spin"
          />
          <Logo className="relative h-12 transition-transform duration-300 group-hover:scale-105" />
        </Link>

        {/* Primary nav */}
        <nav className="flex items-center gap-1 flex-1 min-w-0">
          {links.map((l) => {
            const active = isActive(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                preload="intent"
                className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition ${
                  active
                    ? "text-foreground font-semibold bg-white/5 ring-1 ring-white/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {l.to === "/tradio" ? (
                  <span className="relative size-4 inline-flex items-center justify-center shrink-0">
                    <span className="absolute inset-0 rounded-full bg-purple-500/25 blur-[2px] animate-pulse" />
                    <img
                      src={aiBallCutout}
                      alt=""
                      className="relative size-4 object-contain [filter:drop-shadow(0_0_3px_rgba(176,38,255,0.6))]"
                      style={{ animation: "spin 25s linear infinite" }}
                    />
                  </span>
                ) : l.to === "/trance" ? (
                  <span className="relative size-4 inline-flex items-center justify-center shrink-0">
                    <span className="absolute inset-0 rounded-full bg-cyan-500/25 blur-[2px] animate-pulse" />
                    <span className="relative size-2.5 rounded-full bg-cyan-400 [filter:drop-shadow(0_0_4px_rgba(34,211,238,0.8))]" />
                  </span>
                ) : (
                  l.icon && (() => { const Icon = l.icon; return <Icon className="size-4" />; })()
                )}
                {l.to === "/tradio" ? (
                  <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(168,85,247,0.25)] font-bold">
                    {l.label}
                  </span>
                ) : l.to === "/trance" ? (
                  <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(6,182,212,0.25)] font-bold">
                    {l.label}
                  </span>
                ) : (
                  <span>{l.label}</span>
                )}
                {l.label === "Inbox" && !isGuest ? (
                  <span className="ml-0.5 size-4 grid place-items-center rounded-full bg-[oklch(0.65_0.22_300)] text-[10px] font-bold text-white">
                    8
                  </span>
                ) : null}
                {active && (
                  <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.82_0.16_85_/_0.9)]" />
                )}
              </Link>
            );
          })}

          {!isGuest && (
            <div className="relative">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition ${
                  moreOpen ? "bg-white/5 text-foreground" : ""
                }`}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
              >
                More <ChevronDown className={`size-3.5 transition ${moreOpen ? "rotate-180" : ""}`} />
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                  <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl glass-strong border border-white/10 p-2 shadow-[0_30px_80px_-20px_oklch(0_0_0_/_0.8)] z-50 animate-rise">
                    {moreLinks.map((l) => {
                      const Icon = l.icon ?? Sparkles;
                      return (
                        <Link
                          key={l.to}
                          to={l.to}
                          preload="intent"
                          onClick={() => setMoreOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
                        >
                          <Icon className="size-4" />
                          {l.label}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2 shrink-0">
          {!isGuest && (
            <>
              <CreatorGoldNavButton compact />
            </>
          )}
          <button
            onClick={() => nav({ to: "/explore" })}
            aria-label="Search"
            className="size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition"
          >
            <Search className="size-5" />
          </button>
          {!isGuest && (
            <button
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifications"
              className="relative size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition"
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[oklch(0.65_0.22_300)] text-[10px] font-bold grid place-items-center text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          )}

          {isGuest ? (
            <>
              <Link
                to="/login"
                preload="intent"
                className="px-3 py-2 rounded-xl text-sm font-semibold liquid-glass border border-white/15 hover:bg-white/5 transition"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                preload="intent"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold hover-scale"
              >
                <LogIn className="size-4" /> Sign up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Link
                to="/u/$uid"
                params={{ uid: profileUid }}
                preload="intent"
                className="relative size-10 rounded-full conic-ring shrink-0"
                aria-label="Profile"
              >
                <img src={profileAvatar || undefined} alt="" className="size-full rounded-full object-cover" loading="lazy" />
              </Link>
              <button
                onClick={() => void handleSignOut()}
                aria-label="Sign out"
                title="Sign out"
                className="size-9 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          )}
        </div>

        <NotificationsPopover open={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>
    </header>
  );
}
