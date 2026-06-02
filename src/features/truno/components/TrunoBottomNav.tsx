import React from "react";
import { Home, Gamepad2, Users, Mail, User } from "lucide-react";

export type TrunoTab = "home" | "play" | "clubs" | "inbox" | "profile";

interface Props {
  active: TrunoTab;
  onChange: (tab: TrunoTab) => void;
  inboxCount?: number;
}

const tabs: {
  key: TrunoTab;
  label: string;
  Icon: React.ComponentType<{ size: number; className?: string; strokeWidth?: number }>;
}[] = [
  { key: "home", label: "Home", Icon: Home },
  { key: "play", label: "Play", Icon: Gamepad2 },
  { key: "clubs", label: "Clubs", Icon: Users },
  { key: "inbox", label: "Inbox", Icon: Mail },
  { key: "profile", label: "Profile", Icon: User },
];

const TrunoBottomNav: React.FC<Props> = ({ active, onChange, inboxCount = 6 }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="rounded-3xl bg-black/80 backdrop-blur-2xl border border-zinc-800/80 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] px-2 py-2">
          <div className="flex items-center justify-around">
            {tabs.map(({ key, label, Icon }) => {
              const isActive = active === key;
              const isPlay = key === "play";
              const showBadge = key === "inbox" && inboxCount > 0;
              return (
                <button
                  key={key}
                  onClick={() => onChange(key)}
                  className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all relative"
                >
                  <div
                    className={`relative w-9 h-9 rounded-2xl flex items-center justify-center
                    ${
                      isActive
                        ? isPlay
                          ? "bg-fuchsia-500/20 ring-1 ring-fuchsia-400/50 shadow-[0_0_15px_rgba(255,0,128,0.4)]"
                          : "bg-amber-500/10 ring-1 ring-amber-400/40 shadow-[0_0_12px_rgba(255,215,0,0.3)]"
                        : ""
                    }`}
                  >
                    <Icon
                      size={20}
                      className={
                        isActive
                          ? isPlay
                            ? "text-fuchsia-300"
                            : "text-amber-300"
                          : "text-zinc-400"
                      }
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-amber-400 border border-black text-[9px] font-black text-amber-950 flex items-center justify-center">
                        {inboxCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${isActive ? (isPlay ? "text-fuchsia-300" : "text-amber-300") : "text-zinc-500"}`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrunoBottomNav;
