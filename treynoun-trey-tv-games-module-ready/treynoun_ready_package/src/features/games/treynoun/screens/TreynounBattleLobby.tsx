import React from 'react';
import { toast } from 'sonner';
import { ScreenWrap, TreyHeader, TreyBottomNav, NeonButton } from '../components/TreyShell';
import { TEAM_GLOW, TEAM_VIBE } from '../treynounMockData';
import { TreynounTeam } from '../treynounTypes';
import { Copy, Crown, Check, Clock, Flag, BarChart3, Zap, ChevronLeft } from 'lucide-react';

interface Props {
  onStart: () => void;
  onBack: () => void;
  onExit: () => void;
}

const TeamCol: React.FC<{ team: TreynounTeam }> = ({ team }) => (
  <div className="flex-1 rounded-2xl border p-3" style={{ borderColor: `${team.accent}66`, background: `${team.accent}10` }}>
    <div className="flex items-center justify-between mb-3">
      <span className="font-extrabold text-sm" style={{ color: team.accent }}>{team.name.toUpperCase()}</span>
      <span className="text-xs text-white/40">{team.players.filter((p) => p.ready).length}/4</span>
    </div>
    <div className="space-y-2">
      {team.players.map((p) => (
        <div key={p.id} className="flex items-center gap-2 bg-black/30 rounded-xl p-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black" style={{ background: p.ready ? team.accent : '#374151', color: p.ready ? '#000' : '#9CA3AF' }}>{p.avatar}</div>
          <span className="text-xs font-bold flex-1 truncate">{p.name}</span>
          {p.isHost && <Crown className="w-4 h-4 text-yellow-400" />}
          {p.ready && !p.isHost && <Check className="w-4 h-4 text-green-400" />}
          {!p.ready && <button onClick={() => toast.success('Joined the team!')} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">Join</button>}
        </div>
      ))}
    </div>
  </div>
);

const TreynounBattleLobby: React.FC<Props> = ({ onStart, onBack, onExit }) => (
  <ScreenWrap>
    <TreyHeader />
    <div className="flex-1 overflow-y-auto px-4 pb-6">
      <div className="flex items-center gap-3 mt-4 mb-2">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center active:scale-95"><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Multiplayer Battle</h1>
      </div>

      <button
        onClick={() => { navigator.clipboard?.writeText('7R3YNOUN'); toast.success('Room code copied!'); }}
        className="w-full rounded-full border border-yellow-500/40 bg-yellow-500/10 py-3 flex items-center justify-center gap-2 mb-4 active:scale-95"
      >
        <span className="text-white/60">Room Code:</span>
        <span className="font-black text-yellow-300 tracking-widest">7R3YNOUN</span>
        <Copy className="w-4 h-4 text-yellow-400" />
      </button>

      <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3 mb-4 flex items-center gap-3">
        <Zap className="w-7 h-7 text-yellow-400" />
        <div>
          <div className="font-bold">Race to guess the noun first!</div>
          <div className="text-xs text-white/50">Two teams. One word. Steal, trap, and score.</div>
        </div>
      </div>

      <div className="flex gap-3">
        <TeamCol team={TEAM_GLOW} />
        <TeamCol team={TEAM_VIBE} />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="rounded-xl bg-black/40 border border-white/10 p-2 text-center"><Clock className="w-4 h-4 mx-auto text-cyan-400" /><div className="text-[10px] text-white/40 mt-1">ROUND TIME</div><div className="font-black text-sm">60s</div></div>
        <div className="rounded-xl bg-black/40 border border-white/10 p-2 text-center"><Flag className="w-4 h-4 mx-auto text-fuchsia-400" /><div className="text-[10px] text-white/40 mt-1">ROUNDS</div><div className="font-black text-sm">3</div></div>
        <div className="rounded-xl bg-black/40 border border-white/10 p-2 text-center"><BarChart3 className="w-4 h-4 mx-auto text-yellow-400" /><div className="text-[10px] text-white/40 mt-1">DIFFICULTY</div><div className="font-black text-sm">Normal</div></div>
      </div>
      <div className="flex justify-center gap-4 mt-2 text-xs text-white/50">
        <span>Steals: <span className="text-green-400 font-bold">On</span></span>
        <span>Noun Trap: <span className="text-green-400 font-bold">On</span></span>
      </div>

      <NeonButton onClick={onStart} className="w-full py-5 text-xl mt-4">
        <span className="flex items-center justify-center gap-2">START MATCH <Zap className="w-5 h-5" /></span>
      </NeonButton>
      <p className="text-center text-xs text-green-400 mt-2">All set! Waiting for host...</p>
    </div>
    <TreyBottomNav active="home" onHome={onExit} />
  </ScreenWrap>
);

export default TreynounBattleLobby;
