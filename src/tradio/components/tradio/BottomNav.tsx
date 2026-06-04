import React from "react";
import { Home, Library, Radio, Search, User } from "lucide-react";
import { usePlayer } from "@/tradio/contexts/PlayerContext";
import { useTradioIdentity } from "./auth/useTradioIdentity";
import { hasAnyRole } from "./auth/roleUtils";
import aiBallCutout from "@/tradio/assets/ai-ball.png";
import type { TradioMode } from "./prescribeMe/prescribeMeTypes";

export type TabKey = "home" | "stations" | "search" | "library" | "studio" | "profile";

const StudioIcon = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-end gap-[2px] ${className}`}>
    {[40, 80, 100, 60, 90, 50].map((h, i) => (
      <span key={i} className="w-[2px] rounded-full bg-current" style={{ height: `${h}%` }} />
    ))}
  </div>
);

const TABS: { key: TabKey; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { key: "home", label: "Home", Icon: ({ className }) => <Home className={className} /> },
  { key: "stations", label: "Stations", Icon: ({ className }) => <Radio className={className} /> },
  { key: "search", label: "Search", Icon: ({ className }) => <Search className={className} /> },
  { key: "studio", label: "Studio", Icon: StudioIcon },
  { key: "library", label: "Library", Icon: ({ className }) => <Library className={className} /> },
  { key: "profile", label: "My Profile", Icon: ({ className }) => <User className={className} /> },
];

export const BottomNav: React.FC<{
  active: TabKey;
  onChange: (t: TabKey) => void;
  onOpenForge?: () => void;
  onOpenPlayer?: () => void;
  onOpenPrescription?: () => void;
  onOpenScreens?: () => void;
  onSetScreen?: (key: string) => void;
  currentMode?: TradioMode;
  currentRoleLabel?: string;
}> = ({ active, onChange, onOpenPrescription }) => {
  const { currentTrack, currentSource, isPlaying } = usePlayer();
  const { identity } = useTradioIdentity();

  const hasProfileAccess = hasAnyRole(identity, ["artist", "producer", "dj", "admin", "owner"]);
  const leftTabs = TABS.filter((t) => t.key === "home" || t.key === "stations");
  const rightTabs = TABS.filter(
    (t) => t.key === "search" || (hasProfileAccess ? t.key === "studio" : t.key === "library"),
  );

  const renderTabButton = ({ key, label, Icon }: (typeof TABS)[number]) => {
    const isActive = active === key;
    return (
      <button
        key={key}
        onClick={() => onChange(key)}
        className="relative flex flex-1 flex-col items-center gap-1.5 py-2 transition-all duration-300 group active:scale-95"
      >
        {isActive && (
          <span className="absolute -top-3 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-400 via-purple-500 to-cyan-400 shadow-[0_0_20px_rgba(176,38,255,0.8)] animate-pulse" />
        )}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
            isActive
              ? "bg-gradient-to-br from-purple-500/25 to-purple-500/5 border border-purple-500/25 shadow-[0_4px_15px_rgba(168,85,247,0.22)]"
              : "group-hover:bg-white/5"
          }`}
        >
          <Icon
            className={`h-5 w-5 transition-transform duration-300 ${
              isActive
                ? "text-purple-300 scale-105"
                : "text-white/60 group-hover:text-white/80 group-hover:scale-110"
            }`}
          />
        </div>
        <span
          className={`text-[10px] font-medium transition-colors duration-300 ${
            isActive ? "text-purple-300 font-bold" : "text-white/55 group-hover:text-white/75"
          }`}
        >
          {label}
        </span>
      </button>
    );
  };

  const isAiPlaying =
    isPlaying &&
    (currentSource?.id === "ai-radio-for-you-live-signal" ||
      currentTrack?.id === "ai-radio" ||
      currentTrack?.id === "ai-radio-for-you-live-signal");

  return (
    <div className="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 relative">
      <div className="relative flex items-end justify-between rounded-3xl border-[0.5px] border-white/12 bg-gradient-to-b from-[#0e0e1a]/85 via-[#08070d]/90 to-[#040409]/95 backdrop-blur-[34px] px-2 py-3 shadow-[0_30px_70px_rgba(0,0,0,0.9),inset_0_1.5px_2px_rgba(255,255,255,0.14),inset_0_-1px_12px_rgba(0,0,0,0.6)] sm:px-3 sm:py-3.5">
        {leftTabs.map(renderTabButton)}

        <button
          type="button"
          onClick={onOpenPrescription}
          aria-label="Open Tradio Prescribe Me"
          className="group relative flex flex-1 flex-col items-center gap-1.5 py-2 select-none transition-all duration-300 active:scale-95"
        >
          <div className="relative flex h-10 w-10 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-purple-500/25 blur-lg animate-pulse-orb-slow" />
            {isAiPlaying && (
              <span className="absolute inset-0 rounded-full border border-cyan-300/40 animate-wave-expand animate-pulse-orb z-0" />
            )}
            <div className="relative z-10 h-10 w-10">
              <img
                src={aiBallCutout}
                alt=""
                className={`h-full w-full object-contain pointer-events-none [filter:drop-shadow(0_0_8px_rgba(176,38,255,0.55))] transition-transform duration-700 ${
                  isAiPlaying
                    ? "animate-orb-spin"
                    : "animate-slow-spin group-hover:scale-110 group-hover:animate-orb-spin"
                }`}
              />
            </div>
          </div>
          <span className="text-[10px] font-medium text-purple-300 transition-colors group-hover:text-white">
            Prescription Radio
          </span>
        </button>

        {rightTabs.map(renderTabButton)}
      </div>
    </div>
  );
};

export default BottomNav;
