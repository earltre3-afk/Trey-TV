import React from 'react';
import { ScreenWrap, TreyHeader, TreyBottomNav } from '../components/TreyShell';
import { GameMode } from '../treynounTypes';
import { User, Users, Radio, Smartphone, CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  onPick: (m: GameMode) => void;
  onBack: () => void;
  onExit: () => void;
}

const modes = [
  { id: 'solo', title: 'Noun Chase Solo', desc: 'Chase nouns against the clock. Clear 5 rounds.', icon: User, color: '#3B82F6', live: true },
  { id: 'pass-noun', title: 'Pass The Noun', desc: 'Build a secret noun trail and hand the device to friends.', icon: Smartphone, color: '#8B5CF6', live: true },
  { id: 'battle', title: 'Noun Battle', desc: 'Two teams race, steal, and trap nouns.', icon: Users, color: '#FF00E5', live: true },
  { id: 'live-room', title: 'Live Noun Room', desc: 'Fans guess live with the host.', icon: Radio, color: '#2DD4BF', live: true },
  { id: 'daily', title: 'Daily Noun Drop', desc: 'A fresh noun every day.', icon: CalendarClock, color: '#FFB800', live: false },
] as const;

const TreynounModeSelect: React.FC<Props> = ({ onPick, onBack, onExit }) => (
  <ScreenWrap>
    <TreyHeader />
    <div className="flex-1 overflow-y-auto px-4 pb-6">
      <div className="flex items-center gap-3 mt-4 mb-5">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center active:scale-95">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-black">Choose Your Chase</h1>
      </div>

      <div className="space-y-3">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => m.live && onPick(m.id as GameMode)}
              disabled={!m.live}
              className="w-full rounded-2xl border p-4 flex items-center gap-4 text-left transition active:scale-[0.98] disabled:opacity-60"
              style={{ borderColor: `${m.color}55`, background: `linear-gradient(135deg, ${m.color}1A, transparent)` }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${m.color}22`, border: `1px solid ${m.color}` }}>
                <Icon className="w-6 h-6" style={{ color: m.color }} />
              </div>
              <div className="flex-1">
                <div className="font-extrabold flex items-center gap-2">
                  {m.title}
                  {!m.live && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">COMING SOON</span>}
                </div>
                <div className="text-xs text-white/50 mt-0.5">{m.desc}</div>
              </div>
              {m.live && <ChevronRight className="w-5 h-5 text-white/40" />}
            </button>
          );
        })}
      </div>
    </div>
    <TreyBottomNav active="home" onHome={onExit} />
  </ScreenWrap>
);

export default TreynounModeSelect;
