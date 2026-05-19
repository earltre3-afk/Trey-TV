import React from 'react';
import { Home, Bell, ArrowLeft, Plus } from 'lucide-react';

interface Props {
  onHome?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  coins?: number;
  notifications?: number;
}

const TrunoHeader: React.FC<Props> = ({ onHome, onBack, showBack, coins = 3250, notifications = 3 }) => {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2">
      <div className="flex items-center gap-2">
        {showBack ? (
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center backdrop-blur-xl hover:bg-zinc-800/80">
            <ArrowLeft size={18} className="text-zinc-300" />
          </button>
        ) : (
          <button onClick={onHome} className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center backdrop-blur-xl hover:bg-zinc-800/80">
            <Home size={18} className="text-zinc-300" />
          </button>
        )}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-amber-950/60 to-amber-900/40 border border-amber-500/30">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center text-[10px] font-black text-amber-950">★</div>
          <span className="text-sm font-bold text-amber-200">{coins.toLocaleString()}</span>
          <button className="w-4 h-4 rounded-full bg-amber-500/30 flex items-center justify-center hover:bg-amber-500/50">
            <Plus size={10} className="text-amber-200" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex items-baseline gap-0.5">
          <span className="text-lg italic font-light text-white" style={{ fontFamily: 'cursive' }}>Trey</span>
          <span className="text-lg italic font-extrabold bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text text-transparent">TV</span>
          <span className="text-amber-400 text-[10px]">✦</span>
        </div>
        <span className="text-[9px] tracking-[0.25em] text-purple-300/80 font-semibold">ORIGINAL GAME</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center backdrop-blur-xl hover:bg-zinc-800/80">
          <Bell size={18} className="text-zinc-300" />
          {notifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-black" />
          )}
        </button>
        <button className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-fuchsia-500/60 relative">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Trey-1"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black" />
        </button>
      </div>
    </div>
  );
};

export default TrunoHeader;
