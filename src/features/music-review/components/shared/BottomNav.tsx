import React from "react";
import { Music, User, Mic, BarChart3, ShoppingBag } from "lucide-react";

interface BottomNavProps {
  active: "review" | "profile" | "submit" | "leaderboard" | "shop";
  onNavigate: (key: BottomNavProps["active"]) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ active, onNavigate }) => {
  const item = (key: BottomNavProps["active"], icon: React.ReactNode, label: string) => {
    const isActive = active === key;
    return (
      <button
        onClick={() => onNavigate(key)}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 ${isActive ? "text-[#00B7FF]" : "text-[#64748B]"}`}
      >
        <div className={isActive ? "drop-shadow-[0_0_8px_rgba(0,183,255,0.6)]" : ""}>{icon}</div>
        <span className="text-[10px] tracking-wider">{label}</span>
      </button>
    );
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-[#05070D]/95 backdrop-blur-xl border-t border-[#1a2942]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-5xl mx-auto flex items-end px-2 pt-2 pb-2 relative">
        {item("review", <Music size={20} />, "REVIEW")}
        {item("profile", <User size={20} />, "MY PROFILE")}
        <div className="w-20 flex justify-center">
          <button
            onClick={() => onNavigate("submit")}
            className="w-16 h-16 -mt-6 rounded-full bg-[#0B1426] border-2 border-[#00B7FF] flex flex-col items-center justify-center text-[#00B7FF] shadow-[0_0_30px_-3px_rgba(0,183,255,0.7)]"
            aria-label="Submit"
          >
            <Mic size={20} />
            <span className="text-[9px] mt-0.5 tracking-wider">SUBMIT</span>
          </button>
        </div>
        {item("leaderboard", <BarChart3 size={20} />, "LEADERBOARD")}
        {item("shop", <ShoppingBag size={20} />, "SHOP")}
      </div>
    </nav>
  );
};
