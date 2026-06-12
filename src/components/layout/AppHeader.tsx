import { Menu, Search, Bell, LogIn } from "lucide-react";
import { useState } from "react";
import aiBallCutout from "@/tradio/assets/ai-ball.png";
import { Logo } from "@/components/brand/Logo";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { currentUser } from "@/lib/mock-data";
import { NotificationsPopover } from "./NotificationsPopover";
import { CreatorGoldNavButton } from "@/components/creator/CreatorGoldNavButton";
import { useNotifications } from "@/lib/notifications-store";
import { useAuth } from "@/lib/auth";

const tabs = [
  { id: "watch-now", label: "Watch Now" },
  { id: "for-you", label: "For You" },
  { id: "discover", label: "Discover" },
  { id: "guide", label: "Guide" },
  { id: "prescribe", label: "Prescribe Me" },
  { id: "rewards", label: "Rewards" },
  { id: "games", label: "Games" },
  { id: "tradio", label: "Tradio" },
  { id: "trance", label: "Trance" },
] as const;

export function AppHeader({
  activeTab = "for-you",
  onTabChange,
  onMenuClick,
}: {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onMenuClick?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { isGuest, user } = useAuth();
  const profileUid = user?.uid ?? currentUser.uid;
  const profileAvatar = user?.avatar ?? currentUser.avatar;

  // Keep Tradio public and instant; Trance remains signed-in only.
  const visibleTabs = isGuest ? tabs.filter((t) => t.id !== "trance") : tabs;
  const computed =
    location.pathname === "/"
      ? "watch-now"
      : location.pathname.startsWith("/for-you")
        ? "for-you"
        : location.pathname.startsWith("/explore")
          ? "discover"
          : location.pathname.startsWith("/guide")
            ? "guide"
            : location.pathname.startsWith("/prescribe-me")
              ? "prescribe"
              : location.pathname.startsWith("/rewards")
                ? "rewards"
                : location.pathname.startsWith("/games")
                  ? "games"
                  : location.pathname.startsWith("/tradio")
                    ? "tradio"
                    : location.pathname.startsWith("/trance")
                      ? "trance"
                      : activeTab;

  return (
    <header className="sticky top-0 z-30 w-full glass-strong border-b border-white/5">
      <div className="relative flex items-center justify-between px-2 sm:px-4 pt-3 pb-2">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition"
        >
          <Menu className="size-5" />
        </button>

        <Link to="/" className="shrink-0 relative group" aria-label="Trey TV home">
          {/* Aurora glow halo */}
          <span
            aria-hidden
            className="absolute inset-0 -m-3 rounded-full blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.55),oklch(0.7_0.25_340_/_0.45),oklch(0.65_0.22_300_/_0.5),oklch(0.82_0.15_215_/_0.45),oklch(0.82_0.16_85_/_0.55))] animate-conic-spin"
          />
          {/* Inner soft glow */}
          <span
            aria-hidden
            className="absolute inset-0 -m-1 rounded-full bg-primary/30 blur-xl animate-glow-pulse"
          />
          <Logo className="relative h-20 transition-transform duration-500 group-hover:scale-110 group-active:scale-95 drop-shadow-[0_0_24px_oklch(0.82_0.16_85_/_0.7)]" />
        </Link>

        <div className="flex items-center gap-2">
          <CreatorGoldNavButton compact />
          <button
            onClick={() => navigate({ to: "/explore" })}
            aria-label="Search"
            className="size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition"
          >
            <Search className="size-5" />
          </button>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="relative size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition"
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[oklch(0.65_0.22_300)] text-[10px] font-bold grid place-items-center text-white shadow-[0_0_10px_oklch(0.65_0.22_300_/_0.8)]">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          {isGuest ? (
            <Link
              to="/login"
              aria-label="Sign in"
              className="size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition"
            >
              <LogIn className="size-5" />
            </Link>
          ) : (
            <Link
              to="/u/$uid"
              params={{ uid: profileUid }}
              className="relative size-10 rounded-full conic-ring shrink-0"
              aria-label="Profile"
            >
              <img
                src={profileAvatar || undefined}
                alt="profile"
                className="size-full rounded-full object-cover"
                loading="lazy"
              />
            </Link>
          )}
        </div>
        <NotificationsPopover open={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>

      <nav
        className="flex items-center gap-1 px-1 sm:px-2 pb-2 overflow-x-auto no-scrollbar"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {visibleTabs.map((t) => {
          const active = computed === t.id;
          const handleClick = () => {
            if (t.id === "watch-now") navigate({ to: "/" });
            if (t.id === "for-you") navigate({ to: "/for-you" });
            if (t.id === "discover") navigate({ to: "/explore" });
            if (t.id === "guide") navigate({ to: "/guide" });
            if (t.id === "prescribe") navigate({ to: "/prescribe-me" });
            if (t.id === "rewards") navigate({ to: "/rewards" });
            if (t.id === "games") navigate({ to: "/games" });
            if (t.id === "tradio") navigate({ to: "/tradio" });
            if (t.id === "trance") navigate({ to: "/trance" });
            onTabChange?.(t.id);
          };
          const tabClassName = `relative px-3 py-2 text-sm whitespace-nowrap transition inline-flex items-center gap-1.5 ${
            active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
          }`;
          if (t.id === "tradio") {
            return (
              <button
                key={t.id}
                onClick={handleClick}
                className={tabClassName}
              >
                <span className="relative size-3.5 inline-flex items-center justify-center shrink-0">
                  <span className="absolute inset-0 rounded-full bg-purple-500/25 blur-[1px] animate-pulse" />
                  <img
                    src={aiBallCutout}
                    alt=""
                    className="relative size-3.5 object-contain [filter:drop-shadow(0_0_2px_rgba(176,38,255,0.6))]"
                    style={{ animation: "spin 25s linear infinite" }}
                  />
                </span>
                <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(168,85,247,0.25)] font-bold">
                  {t.label}
                </span>
                {active && (
                  <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.82_0.16_85_/_0.9)]" />
                )}
              </button>
            );
          }
          return (
            <button
              key={t.id}
              onClick={handleClick}
              className={tabClassName}
            >
              {t.id === "trance" ? (
                <>
                  <span className="relative size-3.5 inline-flex items-center justify-center shrink-0">
                    <span className="absolute inset-0 rounded-full bg-cyan-500/25 blur-[1px] animate-pulse" />
                    <span className="relative size-2 rounded-full bg-cyan-400 [filter:drop-shadow(0_0_4px_rgba(34,211,238,0.8))]" />
                  </span>
                  <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(6,182,212,0.25)] font-bold">
                    {t.label}
                  </span>
                </>
              ) : (
                <span>{t.label}</span>
              )}
              {active && (
                <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.82_0.16_85_/_0.9)]" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
