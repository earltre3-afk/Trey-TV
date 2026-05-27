import React, { useState } from 'react';
import { TreyLogo } from '../components/Logo';
import { GlassPanel, RemoteHints, FocusButton } from '../components/Primitives';
import { Spade, Crown, ChevronDown, ArrowLeft, Settings as SettingsIcon, Send, Users } from 'lucide-react';
import { profile, IMG } from '../mockData';
import { useTV } from '../TVContext';

const hand = [
  { rank: '2', suit: '♠', red: false },
  { rank: '4', suit: '♠', red: false },
  { rank: '5', suit: '♠', red: false },
  { rank: '7', suit: '♠', red: false },
  { rank: '9', suit: '♠', red: false },
  { rank: 'J', suit: '♠', red: false },
  { rank: 'Q', suit: '♥', red: true },
  { rank: 'K', suit: '♥', red: true },
  { rank: 'A', suit: '♠', red: false },
];

const chat = [
  { u: 'KiGotGame', m: "Let's run it up! 💪" },
  { u: 'Duke Dennis', m: 'Lock in, family.' },
  { u: 'Agent 00', m: 'I got this hand on lock 🔒' },
  { u: 'Trey Trizzy', m: "Y'all already know how we coming." },
  { u: 'Fan4Life', m: 'Treyyy TV spades different! 🔥' },
  { u: 'CardShark22', m: 'That 2X multiplier crazy!' },
  { u: 'KiGotGame', m: 'Bags on bags on bags 💰' },
];

export const SpadesScreen: React.FC = () => {
  const [sel, setSel] = useState(8);
  const { back } = useTV();
  return (
    <div className="relative min-h-screen w-full bg-[#05050A] text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/3 w-[800px] h-[800px] rounded-full bg-purple-700/15 blur-[160px]" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-6">
          <TreyLogo size="sm" />
          <button onClick={back} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-fuchsia-400"><ArrowLeft className="w-4 h-4" /></button>
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-900/30 to-purple-900/30">
            <Spade className="w-6 h-6 text-fuchsia-400" />
            <div>
              <div className="text-2xl font-black tracking-widest">SPADES</div>
              <div className="text-[10px] tracking-[0.3em] font-bold text-fuchsia-300">LIVE  ·  MATCH</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <FocusButton variant="ghost">LEAVE TABLE</FocusButton>
          <div className="text-sm text-white/70">Room: <span className="text-white font-bold">Trey's Table 🔒</span></div>
          <div className="text-sm text-white/70">Stake: <span className="text-amber-300 font-bold">250</span></div>
          <SettingsIcon className="w-5 h-5 text-white/60" />
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-white/10 bg-white/5">
            <img src={profile.avatar} className="w-9 h-9 rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-1 text-sm font-bold">{profile.name} <Crown className="w-3.5 h-3.5 text-amber-300" /></div>
              <div className="text-[9px] font-black bg-gradient-to-r from-fuchsia-600 to-purple-700 px-1.5 rounded inline-block">PREMIUM</div>
            </div>
            <ChevronDown className="w-4 h-4 text-white/60" />
          </div>
        </div>
      </header>

      <div className="relative z-10 grid grid-cols-[200px_1fr_320px] gap-5 px-8 pb-6">
        {/* Left: scores */}
        <div className="space-y-4">
          <GlassPanel className="p-5 text-center">
            <div className="text-xs tracking-widest text-white/60">TEAM US</div>
            <div className="text-5xl font-black bg-gradient-to-b from-fuchsia-300 to-purple-500 bg-clip-text text-transparent">500</div>
            <div className="mt-3 flex justify-between text-xs"><span className="text-white/60">BAGS</span><span className="font-bold">5/5</span></div>
            <div className="mt-1 flex justify-between text-xs"><span className="text-white/60">ROUND</span><span className="font-bold">3/10</span></div>
          </GlassPanel>
          <GlassPanel className="p-5 text-center">
            <div className="text-xs tracking-widest text-white/60">TEAM THEM</div>
            <div className="text-5xl font-black text-amber-300">250</div>
            <div className="mt-3 flex justify-between text-xs"><span className="text-white/60">BAGS</span><span className="font-bold">2/5</span></div>
          </GlassPanel>
          <GlassPanel className="p-5 text-center">
            <div className="text-[10px] tracking-widest text-fuchsia-300 font-bold">TREY TV EXCLUSIVE</div>
            <div className="mt-2 text-3xl font-black bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent italic">2X SPADES</div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-[10px] text-white/60">ACTIVE<br />MULTIPLIER</div>
              <div className="text-3xl font-black text-amber-300">2X</div>
            </div>
          </GlassPanel>
        </div>

        {/* Center: table */}
        <div className="relative flex flex-col items-center">
          <div className="relative w-full max-w-[700px] h-[480px] rounded-[50%] border-2 border-fuchsia-500/30 bg-gradient-to-br from-purple-900/30 to-fuchsia-900/20 shadow-[0_0_60px_rgba(168,85,247,0.25)_inset]">
            {/* Logo center */}
            <div className="absolute inset-0 flex items-center justify-center opacity-50"><TreyLogo size="md" /></div>

            {/* Player top */}
            <PlayerSeat name="KiGotGame" img={IMG(5)} bags="3/5" bid="3" pos="top" />
            <PlayerSeat name="Duke Dennis" img={IMG(3)} bags="2/5" bid="2" pos="left" />
            <PlayerSeat name="Agent 00" img={IMG(4)} bags="1/5" bid="1" pos="right" />
            <PlayerSeat name={profile.name} img={profile.avatar} bags="3/5" bid="3" pos="bottom" you />

            {/* Center cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid grid-cols-3 gap-2 w-[200px]">
              <div /><MiniCard rank="A" suit="♠" /><div />
              <MiniCard rank="K" suit="♠" /><div /><MiniCard rank="Q" suit="♠" />
              <div /><MiniCard rank="10" suit="♠" /><div />
            </div>
          </div>

          {/* Hand of cards */}
          <div className="mt-6 flex items-end justify-center gap-1.5">
            {hand.map((c, i) => {
              const isSel = i === sel;
              return (
                <button
                  key={i}
                  onClick={() => setSel(i)}
                  className={
                    'relative w-[64px] h-[92px] rounded-lg bg-white text-black border-2 outline-none transition-all flex items-start justify-start p-1.5 ' +
                    (isSel
                      ? '-translate-y-6 border-fuchsia-400 shadow-[0_0_30px_rgba(255,43,214,0.9)] scale-110'
                      : 'border-white/30 hover:-translate-y-1 focus:border-fuchsia-400 focus:-translate-y-3 focus:shadow-[0_0_24px_rgba(255,43,214,0.6)]')
                  }
                >
                  <div className={'flex flex-col items-center text-sm font-black ' + (c.red ? 'text-red-600' : 'text-black')}>
                    <span>{c.rank}</span>
                    <span className="text-base leading-none">{c.suit}</span>
                  </div>
                  {isSel && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-fuchsia-400 text-xl">▼</span>}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-6 grid grid-cols-4 gap-3 w-full max-w-[640px]">
            <FocusButton variant="primary" autoFocus>PLAY CARD</FocusButton>
            <FocusButton variant="outline">BID</FocusButton>
            <FocusButton variant="outline">HINT</FocusButton>
            <FocusButton variant="outline">MENU</FocusButton>
          </div>

          {/* Remote hints */}
          <div className="mt-5"><RemoteHints /></div>
        </div>

        {/* Right: chat + viewers + tournament */}
        <div className="space-y-4">
          <GlassPanel className="p-4">
            <div className="flex border-b border-white/10 mb-3">
              <div className="px-3 py-2 text-xs font-bold border-b-2 border-fuchsia-400 text-fuchsia-300">LIVE CHAT</div>
              <div className="px-3 py-2 text-xs font-bold text-white/50">GAME INFO</div>
            </div>
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2">
              {chat.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-fuchsia-300">{c.u}</div>
                    <div className="text-white/80">{c.m}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
              <input placeholder="Say something..." className="flex-1 bg-transparent outline-none text-sm" />
              <button className="px-3 py-1 rounded-md bg-fuchsia-600 text-xs font-bold flex items-center gap-1"><Send className="w-3 h-3" /> SEND</button>
            </div>
          </GlassPanel>

          <GlassPanel className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold tracking-widest">VIEWERS</div>
              <div className="flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> 12.4K</div>
            </div>
            <div className="flex -space-x-2">
              {[0,1,2,3,4].map((i) => (
                <img key={i} src={IMG(i)} className="w-9 h-9 rounded-full border-2 border-[#05050A] object-cover" />
              ))}
              <div className="w-9 h-9 rounded-full bg-fuchsia-600 border-2 border-[#05050A] flex items-center justify-center text-[10px] font-black">+12K</div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-4 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-7xl opacity-10">♠</div>
            <div className="text-3xl font-black italic bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent">SPADES</div>
            <div className="text-xs font-bold tracking-widest text-white/70">TOURNAMENT</div>
            <div className="mt-3 text-amber-300 font-black text-2xl">$10,000 <span className="text-xs text-white/60">PRIZE POOL</span></div>
            <div className="text-xs text-white/60 mt-1">SATURDAY 8PM EST</div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};

const PlayerSeat: React.FC<{ name: string; img: string; bags: string; bid: string; pos: 'top' | 'bottom' | 'left' | 'right'; you?: boolean }> = ({ name, img, bags, bid, pos, you }) => {
  const posCls = {
    top: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col',
    bottom: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex-col',
    left: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 flex-col',
    right: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex-col',
  }[pos];
  return (
    <div className={`absolute ${posCls} flex items-center gap-1`}>
      <img src={img} className="w-14 h-14 rounded-full border-2 border-fuchsia-400/60 object-cover" />
      <div className="text-center">
        <div className="text-xs font-bold flex items-center gap-1 justify-center">{name} {you && <span className="px-1.5 rounded bg-fuchsia-600 text-[9px]">You</span>}</div>
        <div className="flex gap-1 justify-center text-[10px]">
          <span className="px-1.5 rounded bg-white/10 border border-white/15">{bags}</span>
          <span className="px-1.5 rounded bg-white/10 border border-white/15">BID: {bid}</span>
        </div>
      </div>
    </div>
  );
};

const MiniCard: React.FC<{ rank: string; suit: string }> = ({ rank, suit }) => (
  <div className="w-12 h-16 rounded-md bg-white text-black flex flex-col items-center justify-center font-black shadow-lg">
    <span className="text-sm">{rank}</span>
    <span className="text-lg leading-none">{suit}</span>
  </div>
);
