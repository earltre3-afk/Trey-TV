import React, { useState } from 'react';
import { Lock, UserPlus, Copy, Bot, ChevronRight, Send, LogOut, Crown, GripVertical } from 'lucide-react';
import TrunoLogo from '../components/TrunoLogo';
import { useCurrentUser } from '@/hooks/use-current-user';

interface Props {
  onNavigate: (view: string, params?: any) => void;
}

const players = [
  { name: 'Trey-1', sub: '(You)', status: 'Host',    color: 'from-fuchsia-500 to-purple-700', isHost: true },
  { name: 'Zay',                  status: 'Ready',   color: 'from-pink-500 to-red-700' },
  { name: 'Maya',                 status: 'Ready',   color: 'from-purple-500 to-indigo-700' },
  { name: 'Lena',                 status: 'Invited', color: 'from-rose-500 to-pink-700' },
];

const chatMessages = [
  { who: 'Trey-1', msg: "Let's run it 🔥" },
  { who: 'Zay', msg: 'Ready when you are!' },
  { who: 'Maya', msg: 'Yesss! 💜' },
  { who: 'Lena', msg: "Let's goooo 😎" },
  { who: 'Trey-1', msg: 'Wild rules tonight 👀' },
];

const RoomScreen: React.FC<Props> = ({ onNavigate }) => {
  const currentUser = useCurrentUser();
  const [rules, setRules] = useState({ classic: true, action: true, wild: true, team: false });
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard?.writeText('TR8N-04X2');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="px-3 pb-32 space-y-4">
      <div className="flex flex-col items-center">
        <TrunoLogo size="md" subtitle="Match colors. Play action. Own the table." showParent={false} />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-amber-400" />
            <span className="text-xs font-bold text-amber-300 tracking-wider">PRIVATE ROOM</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-300">Room is open</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="text-center">
            <span className="text-[10px] font-bold text-zinc-500 tracking-widest">ROOM CODE</span>
            <h2 className="text-4xl md:text-5xl font-black my-2 tracking-tight" style={{
              background: 'linear-gradient(90deg, #FF0080, #9D4EDD, #00D9FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 12px rgba(157,78,221,0.5))',
            }}>TR8N-04X2</h2>
            <p className="text-[11px] text-zinc-500 mb-3">Share this code to invite friends</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-fuchsia-500/50 bg-fuchsia-500/5 text-fuchsia-300 text-xs font-bold hover:bg-fuchsia-500/10">
                <UserPlus size={14} /> Invite Friends
              </button>
              <button onClick={copyCode} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-amber-500/50 bg-amber-500/5 text-amber-300 text-xs font-bold hover:bg-amber-500/10">
                <Copy size={14} /> {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-300">6 / 8 <span className="text-zinc-500 font-normal">PLAYERS</span></span>
              <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-cyan-500/40 text-cyan-300 text-[10px] font-bold">
                <Bot size={12} /> AI Fill
              </button>
            </div>
            <div className="space-y-1.5">
              {players.map((p, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-zinc-900/60">
                  {p.isHost && currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="Host" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-[10px] font-black text-white`}>{p.isHost ? (currentUser.name?.[0] || p.name[0]) : p.name[0]}</div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${p.isHost ? 'text-fuchsia-300' : 'text-white'}`}>{p.isHost ? currentUser.name || p.name : p.name}</span>
                      {p.sub && <span className="text-[10px] text-purple-300">{p.sub}</span>}
                      {p.isHost && <Crown size={11} className="text-amber-400" />}
                    </div>
                    <span className={`text-[10px] ${p.status === 'Ready' ? 'text-emerald-400' : p.status === 'Invited' ? 'text-amber-400' : 'text-fuchsia-400'}`}>{p.status}</span>
                  </div>
                  <GripVertical size={12} className="text-zinc-600" />
                </div>
              ))}
              {[0, 1].map(i => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-dashed border-zinc-800">
                  <div className="w-7 h-7 rounded-full border border-dashed border-zinc-700" />
                  <span className="text-xs text-zinc-500">Open Seat</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
          <div className="relative aspect-square">
            <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(157,78,221,0.2), transparent 70%)' }} />
            <div className="absolute inset-8 rounded-full border border-purple-500/30" />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="Host" className="w-10 h-10 rounded-full object-cover ring-2 ring-fuchsia-500/50" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 ring-2 ring-fuchsia-500/50" />
              )}
              <span className="text-[9px] font-bold text-fuchsia-300 mt-1">{currentUser.name || 'Host'}</span>
              <span className="text-[8px] text-amber-300">Host</span>
            </div>
            <div className="absolute top-1/2 left-2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-red-700 ring-2 ring-emerald-500/40" />
              <span className="text-[9px] font-bold text-white mt-1">Zay</span>
              <span className="text-[8px] text-emerald-400">Ready</span>
            </div>
            <div className="absolute top-1/2 right-2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-700 ring-2 ring-emerald-500/40" />
              <span className="text-[9px] font-bold text-white mt-1">Maya</span>
              <span className="text-[8px] text-emerald-400">Ready</span>
            </div>
            <div className="absolute bottom-12 left-1/4 flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-pink-700 opacity-60" />
              <span className="text-[9px] font-bold text-white mt-1">Lena</span>
              <span className="text-[8px] text-amber-400">Invited</span>
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              <div className="w-8 h-8 rounded-full border border-dashed border-zinc-600 flex items-center justify-center text-zinc-500 text-xs">+</div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-16 rounded-xl bg-gradient-to-br from-zinc-900 to-black border-2 border-fuchsia-500/40 shadow-[0_0_20px_rgba(157,78,221,0.6)] flex items-center justify-center">
                <span className="text-xl">🌀</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 flex flex-col">
          <h3 className="text-sm font-bold text-white mb-2">TABLE CHAT</h3>
          <div className="flex-1 space-y-2 mb-2 max-h-56 overflow-y-auto">
            {chatMessages.map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 flex-shrink-0 text-[10px] font-black text-white flex items-center justify-center">{m.who[0]}</div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-fuchsia-300">{m.who}</span>
                  <p className="text-xs text-zinc-200">{m.msg}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            {['🔥', '💜', '💯', '😂'].map((e, i) => (
              <button key={i} className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sm hover:bg-zinc-800">{e}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input placeholder="Say something..." className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none" />
            <button className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
              <Send size={12} className="text-fuchsia-300" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
          <h3 className="text-sm font-bold text-white mb-3">GAME RULES</h3>
          <div className="space-y-2">
            {[
              { k: 'classic', label: 'Classic Mode',  sub: 'Match colors & numbers' },
              { k: 'action',  label: 'Action Heavy',  sub: 'More actions. More chaos.' },
              { k: 'wild',    label: 'Wild Rules',    sub: 'Extra wild. Extra fun.' },
              { k: 'team',    label: 'Team Play',     sub: '2v2 - Squad up!' },
            ].map(r => (
              <button
                key={r.k}
                onClick={() => setRules({ ...rules, [r.k]: !rules[r.k as keyof typeof rules] })}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-left"
              >
                <div>
                  <div className="text-xs font-bold text-white">{r.label}</div>
                  <div className="text-[10px] text-zinc-500">{r.sub}</div>
                </div>
                <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${rules[r.k as keyof typeof rules] ? 'bg-fuchsia-500' : 'bg-zinc-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${rules[r.k as keyof typeof rules] ? 'translate-x-4' : ''}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
          <h3 className="text-sm font-bold text-white mb-3">MATCH SETTINGS</h3>
          <div className="space-y-2">
            {[
              { label: 'Draw Limit', value: '+2' },
              { label: 'Round Time', value: '60s' },
              { label: 'Score Limit', value: '500' },
            ].map((s, i) => (
              <button key={i} className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-xs text-zinc-300">{s.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{s.value}</span>
                  <ChevronRight size={14} className="text-zinc-500" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => onNavigate('home')} className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-pink-500/50 text-pink-300 font-bold text-sm">
          <LogOut size={14} /> Leave Room
        </button>
        <button onClick={() => onNavigate('match')} className="relative py-3 rounded-2xl font-black overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600" />
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 blur-md opacity-70" />
          <div className="relative">
            <div className="text-white text-base">Start Match</div>
            <div className="text-[9px] text-fuchsia-100">Everyone must be ready</div>
          </div>
        </button>
        <button className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-emerald-500/50 text-emerald-300 font-bold text-xs">
          <Bot size={14} /> <div className="text-left"><div>AI Fill</div><div className="text-[9px] text-emerald-200/70 font-normal">Fill empty seats</div></div>
        </button>
      </div>
    </div>
  );
};

export default RoomScreen;
