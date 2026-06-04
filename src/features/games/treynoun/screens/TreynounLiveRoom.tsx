import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ScreenWrap, TreyHeader, GlossyButton, GlassCard, NeonRing, NEON } from '../components/TreyShell';
import { LIVE_CHAT_SEED, LIVE_GUESS_POOL } from '../treynounMockData';
import { Flame, ThumbsUp, Heart, Laugh, Hand, Send, Smile, BadgeCheck, ChevronLeft, Lightbulb } from 'lucide-react';

interface Props { onExit: () => void; }
interface LiveRoomMessage { id: number; name: string; avatar: string; text: string; age?: number; host?: boolean; }
type ReactionKey = 'fire' | 'thumb' | 'heart' | 'clap' | 'laugh';

const TreynounLiveRoom: React.FC<Props> = ({ onExit }) => {
  const [messages, setMessages] = useState<LiveRoomMessage[]>(LIVE_CHAT_SEED.map((m, i) => ({ ...m, id: i }))); 
  const [input, setInput] = useState('');
  const [time, setTime] = useState(32);
  const [won, setWon] = useState(false);
  const [reactions, setReactions] = useState({ fire: 56, thumb: 38, heart: 22, clap: 8, laugh: 4 });
  const [viewers] = useState(1238);
  const feedRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(100);

  useEffect(() => {
    const t = setInterval(() => setTime((x) => (x > 0 ? x - 1 : 0)), 1000);
    const c = setInterval(() => {
      const names = ['QueenLexi', 'JayFresh', 'GameChanger', 'NovaQueen'];
      const name = names[Math.floor(Math.random() * names.length)];
      const word = LIVE_GUESS_POOL[Math.floor(Math.random() * LIVE_GUESS_POOL.length)];
      setMessages((m) => [...m, { id: idRef.current++, name, avatar: name.slice(0, 2).toUpperCase(), text: word.toUpperCase() + '?', age: 20 }]);
    }, 3500);
    return () => { clearInterval(t); clearInterval(c); };
  }, []);
  useEffect(() => { feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  const submit = () => {
    const g = input.trim(); if (!g) return;
    setMessages((m) => [...m, { id: idRef.current++, name: 'TreyLegend', avatar: 'TL', text: g, age: 0, host: true }]);
    if (g.toLowerCase().includes('bowl') && !won) { setWon(true); toast.success('Correct! You won the live round!'); }
    else if (!won) toast('Guess submitted to the room!');
    setInput('');
  };
  const react = (key: ReactionKey) => { setReactions((r) => ({ ...r, [key]: r[key] + 1 })); toast('You reacted!'); };
  const totalReacts = Object.values(reactions).reduce((a, b) => a + b, 0);
  const reactConf: readonly [ReactionKey, typeof Flame, string][] = [['fire', Flame, '#F97316'], ['thumb', ThumbsUp, '#3B82F6'], ['heart', Heart, '#EF4444'], ['clap', Hand, '#A78BFA'], ['laugh', Laugh, '#FBBF24']] as const;
  const avatarGrad = (n: string) => {
    const g = ['from-fuchsia-500 to-purple-600', 'from-cyan-500 to-blue-600', 'from-amber-500 to-orange-600', 'from-pink-500 to-rose-600'];
    return g[n.charCodeAt(0) % g.length];
  };

  return (
    <ScreenWrap>
      <TreyHeader />
      <div className="flex-1 flex flex-col px-4 pb-4 overflow-hidden trey-rise">
        <div className="flex items-center justify-between mt-3">
          <button onClick={onExit} className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="font-black text-lg tracking-wide"><span className="text-fuchsia-400">LIVE</span> ROOM GUESSING</h1>
          <div className="flex items-center gap-1.5 trey-glass rounded-full px-2.5 py-1 text-xs"><Flame className="w-3 h-3 text-white/40" /><span className="font-bold">{viewers.toLocaleString()}</span><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><span className="text-green-400 font-bold">LIVE</span></div>
        </div>

        {/* host card */}
        <GlassCard className="mt-3 p-3 flex items-center gap-3" glow={NEON.purple}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-700 flex items-center justify-center font-black text-black text-lg shrink-0">TL</div>
          <div className="flex-1">
            <div className="font-black flex items-center gap-1.5 text-lg">TreyLegend <BadgeCheck className="w-4 h-4 text-cyan-400" /></div>
            <div className="text-xs text-cyan-400">Rookie Noun</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-yellow-400 font-bold tracking-wider">WIN STREAK</div>
            <div className="flex items-center gap-1 justify-end"><Flame className="w-5 h-5 text-orange-400" /><span className="text-2xl font-black">7</span></div>
          </div>
        </GlassCard>

        {/* current noun */}
        <div className="mt-3 flex items-stretch gap-2.5">
          <div className="w-16 trey-glass rounded-2xl flex items-center justify-center"><Lightbulb className="w-8 h-8 text-yellow-400 trey-glow" /></div>
          <GlassCard className="flex-1 p-3 text-center" glow={NEON.cyan}>
            <div className="text-[10px] text-cyan-300 font-bold tracking-wider">CURRENT NOUN</div>
            <div className="text-lg font-black mt-1 leading-tight">Something you find in the kitchen</div>
            <div className="mt-2 tracking-[0.35em] text-yellow-400 font-black text-sm">_ _ _ _ _ _ _ _ _ _</div>
          </GlassCard>
          <NeonRing value={time} max={45} color={NEON.cyan} label="TIME" big={time} sub="SEC" size={72} />
        </div>

        {/* reactions */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 trey-scroll">
          <div className="trey-glass rounded-2xl px-3 py-1.5 shrink-0 text-center"><div className="font-black text-sm">{totalReacts}</div><div className="text-[8px] text-white/40 font-bold">REACTIONS</div></div>
          {reactConf.map(([key, Icon, color]) => (
            <button key={key} onClick={() => react(key)} className="flex items-center gap-1.5 trey-glass rounded-full px-3 py-2 shrink-0 active:scale-90">
              <Icon className="w-4 h-4" style={{ color }} /><span className="text-xs font-bold">{reactions[key]}</span>
            </button>
          ))}
        </div>

        {/* feed */}
        <div ref={feedRef} className="mt-3 flex-1 overflow-y-auto trey-scroll trey-glass rounded-2xl p-2.5 space-y-2 min-h-[120px]">
          {messages.map((m) => (
            <div key={m.id} className={`flex items-start gap-2.5 rounded-2xl p-2 ${m.host ? 'border border-yellow-500/40 bg-yellow-500/10' : ''}`}>
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGrad(m.name)} flex items-center justify-center text-[10px] font-black shrink-0`}>{m.avatar}</div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-bold ${m.host ? 'text-yellow-300' : 'text-fuchsia-300'}`}>{m.name}</span>
                {m.host ? <span className="ml-1.5 text-[8px] bg-purple-500/50 px-1.5 py-0.5 rounded-full font-bold">HOST</span> : <span className="ml-1.5 text-[9px] text-white/30 bg-white/5 px-1.5 rounded-full">{m.age ?? 20}</span>}
                <div className="text-sm font-semibold truncate">{m.text}</div>
              </div>
              {!m.host && <Heart className="w-4 h-4 text-white/15 shrink-0 mt-1" />}
            </div>
          ))}
        </div>

        {/* input */}
        <div className="mt-3 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Type your guess here..." className="flex-1 bg-black/50 border border-white/15 rounded-full px-4 py-3 text-sm outline-none focus:border-cyan-400" />
          <GlossyButton onClick={submit} className="px-6">SUBMIT <Send className="w-4 h-4" /></GlossyButton>
        </div>
        <div className="flex items-center gap-3 my-2"><span className="flex-1 h-px bg-white/10" /><span className="text-[10px] font-bold text-white/30">OR</span><span className="flex-1 h-px bg-white/10" /></div>
        <button onClick={() => react('laugh')} className="w-full rounded-full border-2 border-purple-500/50 bg-purple-500/10 py-3 font-black flex items-center justify-center gap-2 active:scale-95 text-purple-200"><Smile className="w-5 h-5" /> REACT</button>
      </div>
    </ScreenWrap>
  );
};

export default TreynounLiveRoom;
