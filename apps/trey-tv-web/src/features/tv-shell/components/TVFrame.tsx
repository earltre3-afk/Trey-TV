import React from "react";
import { useTV, Screen } from "../TVContext";
import { TreyLogo } from "./Logo";
import { profile } from "../mockData";
import {
  Home,
  Radio,
  Gamepad2,
  Clapperboard,
  Music2,
  Star,
  Search,
  Crown,
  ChevronDown,
  Users,
  FolderKanban,
} from "lucide-react";

const topNav: { id: Screen; label: string }[] = [
  { id: "home", label: "Watch Now" },
  { id: "guide", label: "Guide" },
  { id: "games", label: "Games" },
  { id: "profile", label: "My Profile" },
  { id: "settings", label: "Settings" },
];

const rail = [
  { id: "home", label: "Home", Icon: Home },
  { id: "guide", label: "Live TV", Icon: Radio },
  { id: "games", label: "Games", Icon: Gamepad2 },
  { id: "browse", label: "Browse", Icon: Clapperboard },
  { id: "music", label: "Music", Icon: Music2 },
  { id: "my-list", label: "My List", Icon: Star },
  { id: "search", label: "Search", Icon: Search },
  { id: "watch-parties", label: "Parties", Icon: Users },
  { id: "source-hub", label: "Sources", Icon: FolderKanban },
] satisfies { id: Screen; label: string; Icon: React.ComponentType<{ className?: string }> }[];

export const TVFrame: React.FC<{
  children: React.ReactNode;
  showRail?: boolean;
  showTopNav?: boolean;
  activeRail?: string;
}> = ({ children, showRail = true, showTopNav = true, activeRail = "Home" }) => {
  const { screen, navigate } = useTV();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#05050A] text-white">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-fuchsia-700/20 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-purple-700/20 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[400px] rounded-full bg-cyan-500/5 blur-[160px]" />
      </div>

      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-10 pt-6 pb-4">
        <div className="flex items-center gap-10">
          <TreyLogo size="lg" className="!h-28" />
        </div>

        {showTopNav && (
          <nav className="flex items-center gap-2">
            {topNav.map((t) => {
              const active = screen === t.id || (t.id === "home" && screen === "detail");
              return (
                <button
                  key={t.label}
                  onClick={() => navigate(t.id)}
                  className={
                    "px-7 py-3 rounded-full text-lg font-semibold transition-all outline-none " +
                    "focus:scale-[1.05] focus:ring-2 focus:ring-fuchsia-400 " +
                    (active
                      ? "bg-gradient-to-br from-fuchsia-600/30 to-purple-700/30 border border-fuchsia-400/60 text-white shadow-[0_0_28px_rgba(255,43,214,0.45)]"
                      : "text-white/75 hover:text-white border border-transparent")
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {/* Native device sign-in: only shown inside the TV app (bridge present) */}
          {typeof window !== "undefined" &&
            (window as unknown as { TreyTvNative?: { signIn?: () => void } }).TreyTvNative
              ?.signIn && (
              <button
                onClick={() => navigate("activate")}
                className="px-6 py-3 rounded-full text-lg font-semibold text-white border border-fuchsia-400/60 bg-gradient-to-br from-fuchsia-600/30 to-purple-700/30 shadow-[0_0_20px_rgba(255,43,214,0.35)] outline-none transition-all focus:scale-[1.05] focus:ring-2 focus:ring-fuchsia-400"
              >
                Sign In
              </button>
            )}
          {/* User badge */}
          <button
            onClick={() => navigate("profile")}
            className="flex items-center gap-3 px-3 py-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md outline-none focus:border-fuchsia-400 focus:shadow-[0_0_24px_rgba(255,43,214,0.5)] transition-all"
          >
            <img
              src={profile.avatar}
              alt=""
              className="w-12 h-12 rounded-full object-cover border-2 border-fuchsia-400/60"
            />
            <div className="text-left pr-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold">{profile.name}</span>
                <Crown className="w-4 h-4 text-amber-300" />
              </div>
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white">
                PREMIUM
              </span>
            </div>
            <ChevronDown className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </header>

      {/* Body with left rail */}
      <div className="relative z-10 flex">
        {showRail && (
          <aside className="w-28 shrink-0 pl-10 pr-2 pt-2">
            <nav className="flex flex-col items-stretch gap-1">
              {rail.map((r) => {
                const active = activeRail === r.label;
                return (
                  <button
                    key={r.label}
                    onClick={() => navigate(r.id)}
                    className={
                      "flex flex-col items-center justify-center gap-1 py-3 rounded-2xl outline-none transition-all " +
                      "focus:scale-[1.07] focus:ring-2 focus:ring-fuchsia-400 " +
                      (active
                        ? "bg-gradient-to-br from-fuchsia-600/25 to-purple-700/25 border border-fuchsia-400/60 shadow-[0_0_22px_rgba(255,43,214,0.45)]"
                        : "border border-transparent text-white/65 hover:text-white")
                    }
                  >
                    <r.Icon className="w-6 h-6" />
                    <span className="text-[11px] font-semibold tracking-wide">{r.label}</span>
                  </button>
                );
              })}
              {/* Premium */}
              <button
                aria-label="Premium"
                onClick={() => navigate("premium")}
                className="mt-3 flex flex-col items-center justify-center gap-1 py-4 rounded-2xl border border-amber-400/60 bg-gradient-to-br from-amber-400/15 to-yellow-700/10 shadow-[0_0_20px_rgba(248,200,75,0.35)] outline-none focus:scale-[1.07] focus:shadow-[0_0_32px_rgba(248,200,75,0.7)]"
              >
                <Crown className="w-6 h-6 text-amber-300" />
                <span className="text-[11px] font-bold tracking-wider text-amber-300">PREMIUM</span>
              </button>
            </nav>
          </aside>
        )}

        <main className="flex-1 min-w-0 px-8 pb-12">{children}</main>
      </div>
    </div>
  );
};
