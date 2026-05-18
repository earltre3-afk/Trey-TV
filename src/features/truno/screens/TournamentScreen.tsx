import React, { useEffect, useState } from 'react';
import { Trophy, Users, Clock, ChevronRight, Eye, Loader2 } from 'lucide-react';
import TrunoLogo from '../components/TrunoLogo';
import TrunoCardFan from '../components/TrunoCardFan';
import { TrunoCard as TCard } from '../lib/cards';
import {
  listUpcomingTournaments,
  subscribeTournaments,
  joinTournament,
  formatCountdown,
  TrunoTournamentRow,
} from '../lib/api';

const heroCards: TCard[] = [
  { id: 'c1', color: 'purple', symbol: 'wild_draw_four', value: 4, label: '+4' },
  { id: 'c2', color: 'blue',   symbol: 'number', value: 7, label: '7' },
  { id: 'c3', color: 'black',  symbol: 'wild',           label: 'W' },
  { id: 'c4', color: 'red',    symbol: 'number', value: 2, label: '2' },
  { id: 'c5', color: 'green',  symbol: 'reverse',        label: 'R' },
];

const liveMatches = [
  { p1: 'Trey-1', p2: 'QueenMaya', table: 12, round: 1, watching: 256 },
  { p1: 'Zay',    p2: 'Lena',      table: 7,  round: 1, watching: 189 },
  { p1: 'Maya',   p2: 'Ghost',     table: 3,  round: 1, watching: 143 },
];

const TournamentScreen: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
  const [tab, setTab] = useState('bracket');
  const [tournaments, setTournaments] = useState<TrunoTournamentRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const rows = await listUpcomingTournaments(10);
      if (!cancelled) {
        setTournaments(rows);
        if (!selectedId && rows.length > 0) setSelectedId(rows[0].id);
        setLoading(false);
      }
    };
    load();
    const unsub = subscribeTournaments(load);
    return () => { cancelled = true; unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => {}, 1000);
    return () => clearInterval(id);
  }, []);

  const selected = tournaments.find(t => t.id === selectedId) || tournaments[0] || null;

  const handleJoin = async () => {
    if (!selected) return;
    setJoining(true);
    setJoinMsg(null);
    const res = await joinTournament(selected.id);
    setJoining(false);
    setJoinMsg(res.ok ? 'Registered! See you at the table.' : (res.error || 'Could not register.'));
    setTimeout(() => setJoinMsg(null), 4000);
  };

  return (
    <div className="px-3 pb-32 space-y-4">
      <div className="flex flex-col items-center">
        <TrunoLogo size="sm" showParent={false} />
        <h1 className="mt-2 text-4xl md:text-5xl font-black text-center" style={{
          background: 'linear-gradient(180deg, #FFD700, #FF6B00 60%, #FF0080)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.5))',
          fontFamily: '"Arial Black"',
        }}>{selected?.title?.toUpperCase() || 'NIGHT CUP'}</h1>
        <p className="text-xs text-zinc-300 mt-1">{selected?.description || 'Compete. Connect. Conquer.'}</p>
        <div className="mt-4 w-full max-w-md">
          <TrunoCardFan cards={heroCards} size="sm" />
        </div>
      </div>

      {tournaments.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3">
          {tournaments.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap
                ${selectedId === t.id ? 'border-amber-400 bg-amber-500/10 text-amber-300' : 'border-zinc-800 bg-zinc-950/60 text-zinc-400'}`}
            >
              {t.title}
              <span className="ml-1.5 text-[9px] opacity-70">· {t.status}</span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 flex items-center justify-center">
          <Loader2 className="animate-spin text-fuchsia-400" />
        </div>
      ) : selected ? (
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-3">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
              <Trophy size={11} /> PRIZE POOL
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-amber-400 text-lg">★</span>
              <span className="text-xl font-black text-amber-300">{selected.prize_pool.toLocaleString()}</span>
            </div>
            <span className="text-[9px] text-zinc-500">TRUNO COINS</span>
          </div>
          <div className="flex flex-col items-center border-x border-zinc-800">
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold">
              <Users size={11} /> PLAYERS
            </div>
            <span className="text-xl font-black text-white mt-1">{selected.registered_players.toLocaleString()}</span>
            <span className="text-[9px] text-zinc-500">Registered · max {selected.max_players}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold">
              <Clock size={11} /> STARTS IN
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-black text-amber-300 tabular-nums">{formatCountdown(selected.starts_at)}</span>
            </div>
            <span className="text-[9px] text-zinc-500">HRS MIN SEC</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-6 text-center">
          <p className="text-sm text-zinc-400">No tournaments are scheduled right now.</p>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden">
        <div className="grid grid-cols-4 border-b border-zinc-800">
          {['BRACKET', 'LIVE', 'RULES', 'PRIZES'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t.toLowerCase())}
              className={`py-3 text-xs font-black tracking-wider ${tab === t.toLowerCase() ? 'text-amber-300 border-b-2 border-amber-400' : 'text-zinc-500'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-4">
          <h3 className="text-[10px] text-zinc-400 font-bold tracking-wider mb-3">TOP BRACKET</h3>
          <div className="grid grid-cols-3 gap-3 items-center">
            <div className="space-y-2">
              {['Trey-1', 'QueenMaya', 'Zay', 'Lena'].map((n, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-zinc-900 border border-purple-500/30">
                  <div className={`relative w-6 h-6 rounded-full bg-gradient-to-br ${['from-fuchsia-500 to-purple-700', 'from-purple-500 to-indigo-700', 'from-pink-500 to-red-700', 'from-rose-500 to-pink-700'][i]}`}>
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] font-bold text-white">{n}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center gap-3 relative">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 font-bold">Round 1</span>
              <div className="w-full h-8 rounded-lg border border-zinc-700 bg-zinc-900/50" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 opacity-50 blur-md absolute" />
              <div className="w-full h-8 rounded-lg border border-zinc-700 bg-zinc-900/50" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-zinc-400 font-bold">Quarter Finals</span>
              <div className="w-16 h-20 flex items-center justify-center">
                <Trophy size={50} className="text-amber-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
              </div>
              <span className="text-[10px] text-amber-300 font-bold">CHAMPION</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-zinc-300">LIVE MATCHES</h3>
          <button className="text-xs text-zinc-400 flex items-center">See all <ChevronRight size={12} /></button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {liveMatches.map((m, i) => (
            <div key={i} className="rounded-xl border border-fuchsia-500/30 bg-zinc-950/80 p-2">
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-500/50">LIVE</span>
              <div className="flex items-center justify-around mt-2">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 ring-1 ring-fuchsia-500/50" />
                  <span className="text-[9px] font-bold text-white mt-1">{m.p1}</span>
                </div>
                <span className="text-[10px] font-black text-zinc-500">VS</span>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-700 ring-1 ring-purple-500/50" />
                  <span className="text-[9px] font-bold text-white mt-1">{m.p2}</span>
                </div>
              </div>
              <div className="mt-2 text-[9px] text-zinc-500 text-center">Table {m.table} • Round {m.round}</div>
              <div className="text-[9px] text-zinc-400 flex items-center justify-center gap-1 mt-0.5">
                <Eye size={9} /> {m.watching} watching
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <>
          <div className="grid grid-cols-3 gap-2 items-stretch">
            <div className="rounded-xl border border-amber-500/30 bg-zinc-950/80 p-3 flex flex-col items-center justify-center">
              <span className="text-[10px] text-amber-400 font-bold">ENTRY FEE</span>
              <span className="text-amber-400 text-base">★</span>
              <span className="text-lg font-black text-amber-300">{selected.entry_fee}</span>
              <span className="text-[9px] text-zinc-500">TRUNO COINS</span>
            </div>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="relative rounded-xl font-black py-3 px-2 overflow-hidden disabled:opacity-60"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 blur-md opacity-60" />
              <div className="relative flex items-center justify-center gap-2 text-amber-950">
                <span className="text-sm">{joining ? 'JOINING…' : 'JOIN TOURNAMENT'}</span>
                {!joining && <ChevronRight size={16} />}
              </div>
            </button>
            <div className="rounded-xl border border-emerald-500/30 bg-zinc-950/80 p-3 flex flex-col items-center justify-center">
              <span className="text-[10px] text-zinc-400 font-bold">WINNER TAKES</span>
              <div className="flex items-center gap-1">
                <span className="text-amber-400 text-base">★</span>
                <span className="text-lg font-black text-amber-300">+{Math.floor(selected.prize_pool * 0.1).toLocaleString()}</span>
              </div>
              <span className="text-[9px] text-zinc-500 text-center">Top prize (est.)</span>
            </div>
          </div>
          {joinMsg && (
            <div className={`text-center text-xs px-3 py-2 rounded-xl border ${joinMsg.startsWith('Registered') ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-pink-500/40 bg-pink-500/10 text-pink-300'}`}>
              {joinMsg}
            </div>
          )}
        </>
      )}

      <div className="h-4" onClick={() => onNavigate('home')} />
    </div>
  );
};

export default TournamentScreen;
