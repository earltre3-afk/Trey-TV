import React from 'react';
import { Mail, Gift, Trophy, Users, Crown } from 'lucide-react';
import TrunoLogo from '../components/TrunoLogo';

const messages = [
  { type: 'gift',   Icon: Gift,   color: 'text-amber-300',   from: 'TRUNO Pass',     msg: 'Daily login reward: +100 ★ TRUNO Coins',        time: '2m',  unread: true },
  { type: 'invite', Icon: Users,  color: 'text-fuchsia-300', from: 'Zay',            msg: 'Invited you to room TR8N-04X2',                 time: '5m',  unread: true },
  { type: 'tourn',  Icon: Trophy, color: 'text-amber-300',   from: 'Night Cup',      msg: 'Registration confirmed — starts in 1h 28m',     time: '12m', unread: true },
  { type: 'pass',   Icon: Crown,  color: 'text-amber-300',   from: 'Season 1',       msg: 'You leveled up to Level 23! Claim your reward.', time: '1h',  unread: true },
  { type: 'club',   Icon: Users,  color: 'text-cyan-300',    from: 'Creators Table', msg: 'New club event tonight at 10 PM CT',            time: '2h',  unread: true },
  { type: 'gift',   Icon: Gift,   color: 'text-emerald-300', from: 'Streak Bonus',   msg: '7-day streak! +250 ★ unlocked',                 time: '4h',  unread: true },
  { type: 'msg',    Icon: Mail,   color: 'text-purple-300',  from: 'Maya',           msg: 'GG! That was a wild match 🔥',                  time: '6h',  unread: false },
];

const InboxScreen: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="px-3 pb-24 space-y-4">
      <div className="flex flex-col items-center">
        <TrunoLogo size="md" subtitle="Notifications. Invites. Rewards." showParent={false} />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden">
        {messages.map((m, i) => (
          <button
            key={i}
            onClick={() => onNavigate(m.type === 'invite' ? 'room' : m.type === 'tourn' ? 'tournament' : m.type === 'pass' ? 'pass' : 'home')}
            className={`w-full flex items-center gap-3 p-3 text-left hover:bg-zinc-900/60 transition-colors ${i < messages.length - 1 ? 'border-b border-zinc-800/60' : ''} ${m.unread ? 'bg-fuchsia-500/[0.03]' : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
              <m.Icon size={18} className={m.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate">{m.from}</span>
                {m.unread && <span className="w-2 h-2 rounded-full bg-fuchsia-400 flex-shrink-0" />}
              </div>
              <p className="text-[11px] text-zinc-400 truncate">{m.msg}</p>
            </div>
            <span className="text-[10px] text-zinc-500 flex-shrink-0">{m.time}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InboxScreen;
