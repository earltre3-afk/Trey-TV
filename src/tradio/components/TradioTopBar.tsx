import React from 'react';
import { Bell, Search } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="relative w-11 h-11 rounded-full grid place-items-center" style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}>
      <span className="text-white font-extrabold text-xl">T</span>
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex items-end gap-[2px] h-4">
        {[6, 10, 14, 8].map((h, i) => (
          <div key={i} style={{ height: h }} className="w-[2px] bg-fuchsia-400 rounded-full" />
        ))}
      </div>
    </div>
    <span className="text-white font-bold text-[clamp(20px,2vw,32px)] tracking-tight">Tradio</span>
  </div>
);

interface Props {
  tabs: string[];
  active: string;
  onTab: (t: string) => void;
  search?: boolean;
}

const TradioTopBar: React.FC<Props> = ({ tabs, active, onTab, search }) => {
  return (
    <header className="flex items-center justify-between py-3">
      <Logo />
      {search ? (
        <div className="flex-1 max-w-xl mx-8">
          <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-full px-5 py-2.5 backdrop-blur">
            <Search className="w-5 h-5 text-white/60" />
            <input
              placeholder="Search Artists, Songs, Radios..."
              className="bg-transparent outline-none text-white placeholder:text-white/50 text-[clamp(14px,1.1vw,18px)] w-full"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1 bg-white/10 border border-white/10 rounded-full p-1 backdrop-blur max-w-[58vw] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => onTab(t)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-[clamp(13px,1vw,18px)] font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                active === t ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4">
        <button className="w-11 h-11 rounded-full grid place-items-center hover:bg-white/10 transition">
          <Bell className="w-6 h-6 text-white/80" />
        </button>
        <div className="w-11 h-11 rounded-full ring-2 ring-white/20 overflow-hidden" style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }} />
      </div>
    </header>
  );
};

export default TradioTopBar;
