import React, { useEffect, useState } from 'react';
import { Zap, Users, Bot, Trophy, Flame, ChevronRight, Crown } from 'lucide-react';
import TrunoLogo from '../components/TrunoLogo';
import TrunoCardFan from '../components/TrunoCardFan';
import { TrunoCard as TCard } from '../lib/cards';
import {
  listOpenPublicRooms,
  subscribeOpenRooms,
  tableLabelFromRoom,
  tableTagFromRoom,
  ruleSummaryFromRoom,
  TrunoRoomRow,
} from '../lib/api';

interface Props {
  onNavigate: (view: string, params?: any) => void;
}

const heroCards: TCard[] = [
  { id: 'hc1', color: 'purple', symbol: 'wild_draw_four', value: 4, label: '+4' },
  { id: 'hc2', color: 'blue',   symbol: 'number', value: 7, label: '7' },
  { id: 'hc3', color: 'black',  symbol: 'wild',           label: 'W' },
  { id: 'hc4', color: 'red',    symbol: 'number', value: 2, label: '2' },
  { id: 'hc5', color: 'green',  symbol: 'reverse',        label: 'R' },
];

const modeButtons = [
  { key: 'quick',   label: 'Quick Play',   sub: 'Jump in now',   Icon: Zap,    border: 'border-fuchsia-500/40', text: 'text-fuchsia-300', glow: 'shadow-[0_0_20px_rgba(255,0,128,0.25)]' },
  { key: 'friends', label: 'Play Friends', sub: 'Invite & play', Icon: Users,  border: 'border-amber-500/40',   text: 'text-amber-300',   glow: 'shadow-[0_0_20px_rgba(255,215,0,0.2)]' },
  { key: 'ai',      label: 'AI Match',     sub: 'Play vs AI',    Icon: Bot,    border: 'border-cyan-500/40',    text: 'text-cyan-300',    glow: 'shadow-[0_0_20px_rgba(0,217,255,0.25)]' },
  { key: 'tourney', label: 'Tournament',   sub: 'Compete & win', Icon: Trophy, border: 'border-pink-500/40',    text: 'text-pink-300',    glow: 'shadow-[0_0_20px_rgba(236,72,153,0.25)]' },
];

const friendChips = [
  { name: 'Lena',   color: 'from-pink-500 to-rose-700' },
  { name: 'Trey-I', color: 'from-fuchsia-500 to-purple-700' },
  { name: 'Zay',    color: 'from-red-500 to-pink-700' },
  { name: 'Maya',   color: 'from-purple-500 to-indigo-700' },
];

const TAG_STYLES: Record<string, string> = {
  HOT:      'bg-orange-500/30 text-orange-300 border-orange-500/50',
  NEW:      'bg-emerald-500/30 text-emerald-300 border-emerald-500/50',
  TRENDING: 'bg-fuchsia-500/30 text-fuchsia-300 border-fuchsia-500/50',
};

const HomeScreen: React.FC<Props> = ({ onNavigate }) => {
  const [tables, setTables] = useState<TrunoRoomRow[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const rows = await listOpenPublicRooms(12);
      if (!cancelled) {
        setTables(rows);
        setLoadingTables(false);
      }
    };
    load();
    const unsubscribe = subscribeOpenRooms(load);
    return () => { cancelled = true; unsubscribe(); };
  }, []);

  const handleMode = (key: string) => {
    if (key === 'quick' || key === 'ai') onNavigate('match');
    else if (key === 'friends') onNavigate('room');
    else if (key === 'tourney') onNavigate('tournament');
  };

  return (
    <div className="px-4 pb-24 space-y-6">
      <div className="flex flex-col items-center pt-2">
        <TrunoLogo size="lg" subtitle="Match colors. Play action. Own the table." showParent={false} />
        <div className="mt-4 relative w-full max-w-md">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-72 rounded-full" style={{
              background: 'radial-gradient(circle, rgba(157,78,221,0.25) 0%, rgba(0,217,255,0.1) 40%, transparent 70%)'
            }} />
          </div>
          <TrunoCardFan cards={heroCards} size="md" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {modeButtons.map(({ key, label, sub, Icon, border, text, glow }) => (
          <button
            key={key}
            onClick={() => handleMode(key)}
            className={`relative rounded-2xl border ${border} bg-zinc-950/60 backdrop-blur-xl p-4 ${glow} hover:scale-[1.02] transition-all flex flex-col items-center gap-1.5`}
          >
            <Icon size={26} className={text} strokeWidth={2} />
            <span className={`font-bold text-base ${text}`}>{label}</span>
            <span className="text-[11px] text-zinc-500">{sub}</span>
          </button>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-wider">TONIGHT'S TABLES</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" /> Live Now
            </span>
          </div>
          <button className="text-xs text-zinc-400 flex items-center gap-1 hover:text-white">See all <ChevronRight size={14} /></button>
        </div>

        {loadingTables ? (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {[0,1,2,3].map(i => (
              <div key={i} className="flex-shrink-0 w-44 h-44 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 animate-pulse" />
            ))}
          </div>
        ) : tables.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-6 text-center">
            <p className="text-sm text-zinc-400">No open tables right now.</p>
            <button
              onClick={() => onNavigate('room')}
              className="mt-3 text-xs font-bold text-fuchsia-300 px-4 py-2 rounded-full border border-fuchsia-500/40 hover:bg-fuchsia-500/10"
            >
              Host a Table
            </button>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
            {tables.map((t, i) => {
              const tag = tableTagFromRoom(t);
              const label = tableLabelFromRoom(t);
              const mode = ruleSummaryFromRoom(t);
              return (
                <button
                  key={t.id}
                  onClick={() => onNavigate('match', { roomId: t.id })}
                  className="flex-shrink-0 w-44 snap-start rounded-2xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl overflow-hidden text-left hover:border-purple-500/50 transition-all"
                >
                  <div className="relative h-24 bg-gradient-to-br from-purple-900 via-fuchsia-900 to-blue-950">
                    <div className="absolute inset-0" style={{
                      background: i % 2 === 0
                        ? 'radial-gradient(circle at 30% 50%, rgba(255,0,128,0.35), transparent 70%)'
                        : 'radial-gradient(circle at 70% 50%, rgba(0,217,255,0.3), transparent 70%)'
                    }} />
                    {tag && (
                      <span className={`absolute top-2 right-2 text-[9px] font-black px-2 py-0.5 rounded-full border ${TAG_STYLES[tag] || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                        {tag === 'HOT' && '🔥 '}{tag}
                      </span>
                    )}
                    <span className="absolute bottom-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      {t.current_players}/{t.max_players}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-white text-sm mb-0.5 truncate">{label}</h3>
                    <p className="text-[11px] text-zinc-500 mb-2">{mode} • {t.max_players} Players</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                        <Users size={11} /> {t.current_players}
                      </div>
                      <span className="text-[11px] font-bold text-fuchsia-300 px-3 py-1 rounded-full border border-fuchsia-500/40 hover:bg-fuchsia-500/10">
                        Join
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl p-3">
          <h3 className="text-[11px] font-bold text-zinc-400 tracking-wider mb-2">FRIENDS ONLINE</h3>
          <div className="flex items-center gap-1">
            {friendChips.map((f, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${f.color} ring-1 ring-white/20 relative`}>
                  <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
                </div>
                <span className="text-[9px] text-zinc-400 mt-1">{f.name}</span>
              </div>
            ))}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <span className="text-[10px] font-bold text-zinc-300">+8</span>
              </div>
              <span className="text-[9px] text-zinc-400 mt-1">More</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/50 to-zinc-950/70 backdrop-blur-xl p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[11px] font-bold text-amber-300 tracking-wider mb-1">DAILY STREAK 🔥</h3>
              <div className="flex items-baseline gap-1">
                <Flame size={20} className="text-orange-400 fill-orange-400" />
                <span className="text-2xl font-black text-white">7</span>
                <span className="text-xs text-zinc-400">DAYS</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">Keep it going!</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-sm">🎁</div>
              <span className="text-[10px] text-amber-300 font-bold mt-1">+250</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onNavigate('pass')}
        className="w-full rounded-2xl border border-amber-500/40 bg-gradient-to-r from-purple-950/70 via-fuchsia-950/70 to-amber-950/50 backdrop-blur-xl p-4 hover:scale-[1.01] transition-all flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <Crown size={28} className="text-amber-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-amber-300">TRUNO PASS</span>
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">SEASON 1</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Unlock exclusive cards, themes,<br/>and epic rewards.</p>
          </div>
        </div>
        <span className="text-xs font-bold text-white px-4 py-2 rounded-xl border border-fuchsia-500/50 hover:bg-fuchsia-500/10">View Pass</span>
      </button>
    </div>
  );
};

export default HomeScreen;
