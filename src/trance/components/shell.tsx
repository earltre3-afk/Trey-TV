// TRANCE — App shell: background, top bar, bottom nav
import React from "react";
import { useNavigate, useLocation } from "../hooks/router-compat";
import { Home, Compass, Zap, Trophy, User, Bell, Plus, Flame } from "lucide-react";
import { cn } from "./primitives";
import { TRANCE_ROUTES } from "../routes/manifest";
import { useAuth } from "../auth/AuthContext";
import { Logo } from "@/components/brand/Logo";

/* TranceDesktopSidebar */
export const TranceDesktopSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { effectiveProfile: me, isAuthed, signIn } = useAuth();

  const items = [
    { icon: Home, label: "Home", path: TRANCE_ROUTES.home },
    { icon: Compass, label: "Explore", path: TRANCE_ROUTES.explore },
    { icon: Zap, label: "Choreographer", path: TRANCE_ROUTES.builder },
    { icon: Trophy, label: "Leaderboard", path: TRANCE_ROUTES.leaderboard("rt001") },
    { icon: User, label: "My Profile", path: TRANCE_ROUTES.profile("u001") },
  ];

  return (
    <aside className="sticky top-6 h-[calc(100vh-3rem)] w-[280px] shrink-0 hidden lg:flex flex-col justify-between rounded-3xl border border-white/10 bg-[#0a0612]/85 backdrop-blur-3xl p-5 shadow-[0_8px_40px_-12px_rgba(217,70,239,0.3)] select-none">
      <div className="space-y-6">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center text-center">
          <button
            onClick={() => navigate(TRANCE_ROUTES.home)}
            className="relative group flex items-center mb-1"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -m-5 rounded-full blur-2xl opacity-60 group-hover:opacity-85 transition-opacity duration-500 bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.55),oklch(0.7_0.25_340_/_0.45),oklch(0.65_0.22_300_/_0.5),oklch(0.82_0.15_215_/_0.45),oklch(0.82_0.16_85_/_0.55))] animate-conic-spin"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 -m-2 rounded-full bg-primary/20 blur-xl animate-glow-pulse"
            />
            <Logo className="h-16 relative z-10 transition-transform duration-500 group-hover:scale-105 active:scale-95" />
          </button>
          <div
            className="font-black text-2xl tracking-[0.1em] bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-400 mt-1"
            style={{ filter: "drop-shadow(0 0 10px rgba(217,70,239,0.3))" }}
          >
            TRANCE
          </div>
          <div className="text-[8px] tracking-[0.35em] text-white/40 mt-0.5">DANCE BY TREY TV</div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {items.map((it) => {
            const active =
              pathname === it.path || (it.path === TRANCE_ROUTES.home && pathname === "/trance");
            return (
              <button
                key={it.label}
                onClick={() => navigate(it.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-300 relative group overflow-hidden",
                  active
                    ? "text-fuchsia-300 bg-gradient-to-r from-fuchsia-500/15 via-purple-500/10 to-transparent border border-fuchsia-500/30"
                    : "text-white/60 hover:text-white/90 hover:bg-white/[0.03] border border-transparent",
                )}
              >
                <it.icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                    active ? "text-fuchsia-400" : "text-white/40 group-hover:text-white/75",
                  )}
                />
                <span className="tracking-wide">{it.label}</span>
                {active && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r bg-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Stats Card / Footer */}
      <div className="space-y-4">
        {/* User Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full grid place-items-center bg-gradient-to-br from-yellow-500/20 to-amber-700/10 border border-yellow-400/30">
              <img
                src={
                  me.avatar ||
                  "https://cdn.builder.io/api/v1/image/assets%2Fde09f3f7574845d786350acb13c952c1%2F1cda4b14c56149b7bf48c746db026821?format=webp&width=800&height=1200"
                }
                className="w-10 h-10 rounded-full object-cover"
                alt="avatar"
              />
              <span className="absolute -bottom-1 -right-1 text-[8px] font-black bg-black px-1.5 py-0.2 rounded border border-yellow-400/40 text-yellow-300">
                Lv. {me.level}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-white truncate uppercase">
                  {isAuthed ? me.displayName : "GUEST MODE"}
                </span>
                {me.verified && (
                  <span className="inline-grid place-items-center rounded-full bg-cyan-400 text-black w-3.5 h-3.5 text-[8px] font-bold">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/50 truncate leading-none mt-0.5">
                {isAuthed ? me.handle : "Dancer"}
              </p>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[8px] text-white/40 mb-1">
              <span>PROGRESS</span>
              <span>{Math.round((me.xp / me.xpToNext) * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500"
                style={{ width: `${(me.xp / me.xpToNext) * 100}%` }}
              />
            </div>
          </div>

          {/* Streak & Energy */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5 text-center">
            <div className="border-r border-white/5">
              <div className="flex items-center justify-center gap-1 text-orange-400">
                <Flame className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-sm font-black text-white">{me.dayStreak}</span>
              </div>
              <p className="text-[8px] text-white/40 uppercase font-bold tracking-wider">STREAK</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-cyan-400">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-sm font-black text-white">{me.tranceEnergy}</span>
              </div>
              <p className="text-[8px] text-white/40 uppercase font-bold tracking-wider">ENERGY</p>
            </div>
          </div>
        </div>

        {/* Brand Signoff */}
        <div className="text-center text-[10px] text-white/30 font-semibold tracking-wider">
          TREY TV © {new Date().getFullYear()}
        </div>
      </div>
    </aside>
  );
};

/* Cinematic background wrapper */
export const TranceShell: React.FC<{
  children: React.ReactNode;
  hideNav?: boolean;
  pad?: boolean;
}> = ({ children, hideNav, pad = true }) => (
  <div className="relative min-h-screen w-full bg-[#05030a] text-white overflow-x-hidden">
    {/* ambient glows */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-fuchsia-600/20 blur-[120px]" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px]" />
    </div>

    <div
      className={cn(
        "relative mx-auto w-full max-w-md md:max-w-2xl lg:max-w-6xl xl:max-w-7xl",
        "lg:flex lg:gap-8 lg:items-start",
        pad && "px-4 pt-4 lg:py-6 lg:px-6",
        !hideNav && "pb-28 lg:pb-6",
      )}
    >
      {/* Sticky Desktop Sidebar Nav */}
      {!hideNav && <TranceDesktopSidebar />}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 w-full">{children}</div>
    </div>

    {!hideNav && <TranceBottomNav />}
  </div>
);

/* TranceTopBar */
export const TranceTopBar: React.FC<{
  title?: React.ReactNode;
  back?: boolean;
  right?: React.ReactNode;
  points?: number;
}> = ({ title, back, right, points }) => {
  const navigate = useNavigate();
  const hasRightContent = !!right;
  return (
    <div
      className={cn(
        "flex items-center justify-between mb-4 lg:mb-6",
        !back && !hasRightContent && "lg:hidden",
      )}
    >
      <div className="flex items-center gap-3">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full border border-white/15 bg-white/5 grid place-items-center hover:bg-white/10 transition-all duration-200"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className="flex items-center">{title}</div>
      </div>
      <div className="flex items-center gap-2">
        {typeof points === "number" && (
          <div className="flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/10 pl-1.5 pr-3 py-1 lg:hidden">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fde09f3f7574845d786350acb13c952c1%2F1cda4b14c56149b7bf48c746db026821?format=webp&width=800&height=1200"
              alt="Trance Logo"
              className="w-9 h-9 rounded-full object-contain"
            />
            <span className="text-sm font-black text-yellow-300">{points.toLocaleString()}</span>
          </div>
        )}
        {right ? (
          right
        ) : (
          <button className="w-10 h-10 rounded-full border border-white/15 bg-white/5 grid place-items-center relative hover:bg-white/10 transition-all duration-200 lg:hidden">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-fuchsia-500" />
          </button>
        )}
      </div>
    </div>
  );
};

/* TRANCE wordmark logo */
export const TranceLogo: React.FC<{ size?: "sm" | "md" | "lg"; sub?: string }> = ({
  size = "md",
  sub = "BY TREY TV",
}) => {
  const s = { sm: "text-xl", md: "text-3xl", lg: "text-5xl" }[size];
  return (
    <div className="text-center leading-none">
      <div
        className={cn(
          "font-black tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-400",
          s,
        )}
        style={{ filter: "drop-shadow(0 0 12px rgba(217,70,239,0.4))" }}
      >
        TRANCE
      </div>
      {sub && <div className="text-[9px] tracking-[0.4em] text-white/40 mt-1">{sub}</div>}
    </div>
  );
};

/* TranceBottomNav */
export const TranceBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = [
    { icon: Home, label: "Home", path: TRANCE_ROUTES.home },
    { icon: Compass, label: "Explore", path: TRANCE_ROUTES.explore },
    { icon: Zap, label: "Train", path: TRANCE_ROUTES.builder, center: true },
    { icon: Trophy, label: "Ranks", path: TRANCE_ROUTES.leaderboard("rt001") },
    { icon: User, label: "Profile", path: TRANCE_ROUTES.profile("u001") },
  ];
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pb-4 z-40 lg:hidden">
      <div className="rounded-3xl border border-white/10 bg-[#0a0612]/90 backdrop-blur-2xl px-2 py-2 flex items-center justify-around shadow-[0_-8px_40px_-12px_rgba(217,70,239,0.3)]">
        {items.map((it) => {
          const active =
            pathname === it.path || (it.path === TRANCE_ROUTES.home && pathname === "/trance");
          if (it.center) {
            return (
              <button
                key={it.label}
                onClick={() => navigate(it.path)}
                className="relative -mt-7 w-14 h-14 rounded-full overflow-hidden border-4 border-[#0a0612] shadow-[0_0_24px_rgba(217,70,239,0.85)] active:scale-95 transition-transform duration-200"
              >
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fde09f3f7574845d786350acb13c952c1%2F1cda4b14c56149b7bf48c746db026821?format=webp&width=800&height=1200"
                  alt="Trance Logo"
                  className="w-full h-full object-cover scale-105 animate-pulse-slow"
                />
              </button>
            );
          }
          return (
            <button
              key={it.label}
              onClick={() => navigate(it.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition",
                active ? "text-fuchsia-400" : "text-white/45 hover:text-white/70",
              )}
            >
              <it.icon className="w-5 h-5" />
              <span className="text-[9px] font-semibold uppercase tracking-wide">{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
