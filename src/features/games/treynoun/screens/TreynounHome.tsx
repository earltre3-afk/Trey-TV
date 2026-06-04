import React from 'react';
import { ScreenWrap, TreyHeader, TreyBottomNav, GlossyButton, GlassCard, BrandLogo, catColor, NEON } from '../components/TreyShell';
import { MOCK_PLAYER } from '../treynounMockData';
import { TreynounStats } from '../treynounStorage';
import { User, Users, Radio, ChevronRight, Trophy, Flame, Crosshair, CalendarDays, BadgeCheck, Lock, type LucideIcon } from 'lucide-react';

type HomeModeId = 'solo' | 'pass-noun' | 'battle' | 'live-room';
type ModeCard = { id: HomeModeId | 'daily'; title: string; desc: string; Icon: LucideIcon; color: string; soon?: boolean };
type CategoryShowcaseCard = { label: string; key: 'person' | 'place' | 'thing'; Icon: LucideIcon };

interface Props {
  stats?: TreynounStats;
  onPlay: () => void;
  onMode: (m: HomeModeId) => void;
  onModeSelect: () => void;
  onLeaderboard: () => void;
  onExit: () => void;
}

const modes: ModeCard[] = [
  { id: 'solo', title: 'Noun Chase Solo', desc: 'Chase nouns against the clock.', Icon: Crosshair, color: NEON.cyan },
  { id: 'pass-noun', title: 'Pass The Noun', desc: 'Build a secret trail for friends.', Icon: User, color: NEON.gold },
  { id: 'battle', title: 'Noun Battle', desc: 'Two teams race, steal & trap.', Icon: Users, color: NEON.magenta },
  { id: 'live-room', title: 'Live Noun Room', desc: 'Guess live with the host.', Icon: Radio, color: NEON.teal },
  { id: 'daily', title: 'Daily Noun Drop', desc: 'A fresh noun every day.', Icon: CalendarDays, color: '#A78BFA', soon: true },
];

const TreynounHome: React.FC<Props> = ({ stats, onPlay, onMode, onModeSelect, onLeaderboard, onExit }) => {
  const hotTrail = stats ? stats.bestHotTrail : MOCK_PLAYER.hotTrail;
  const rank = stats ? stats.rank : MOCK_PLAYER.rank;
  const nounScore = stats ? stats.totalNounScore : 0;

  return (
    <ScreenWrap>
      <TreyHeader />
      <div className="flex-1 overflow-y-auto trey-scroll px-4 pb-6 trey-rise">
        <div className="text-center mt-4">
          <BrandLogo size="text-7xl" className="trey-float inline-block" />
          <p className="mt-2 text-sm text-white/55 italic">"Every noun leaves a trail."</p>
        </div>

        {/* category showcase */}
        <div className="flex gap-3 mt-5">
          {([
            { label: 'PERSON', key: 'person', Icon: User },
            { label: 'PLACE', key: 'place', Icon: Radio },
            { label: 'THING', key: 'thing', Icon: Crosshair },
          ] satisfies CategoryShowcaseCard[]).map(({ label, key, Icon }) => (
            <div key={key} className="relative flex-1 aspect-[3/4] rounded-3xl border-2 flex flex-col items-center justify-center p-2 overflow-hidden"
              style={{ borderColor: catColor[key], background: `linear-gradient(180deg,${catColor[key]}28,${catColor[key]}08)`, boxShadow: `0 0 22px ${catColor[key]}33` }}>
              <Icon className="w-9 h-9 trey-glow" style={{ color: catColor[key] }} />
              <span className="font-black text-xs mt-3 tracking-wide" style={{ color: catColor[key] }}>{label}</span>
            </div>
          ))}
        </div>

        <GlossyButton onClick={onPlay} className="w-full py-5 text-2xl mt-5">
          START NOUN CHASE <ChevronRight className="w-6 h-6" />
        </GlossyButton>

        {/* modes */}
        <div className="mt-5 space-y-2.5">
          <div className="text-xs font-black text-white/40 tracking-wider">GAME MODES</div>
          {modes.map(({ id, title, desc, Icon, color, soon }) => (
            <GlassCard key={id} glow={soon ? undefined : color} onClick={soon ? undefined : () => (id === 'solo' ? onPlay() : onMode(id as HomeModeId))}
              className={`p-3.5 flex items-center gap-3 ${soon ? 'opacity-70' : ''}`}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 trey-glow" style={{ color, border: `1.5px solid ${color}`, background: `${color}1a` }}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-black text-sm flex items-center gap-2">{title}{soon && <span className="text-[9px] bg-white/10 border border-white/15 rounded-full px-2 py-0.5 text-white/60">COMING SOON</span>}</div>
                <div className="text-[11px] text-white/45">{desc}</div>
              </div>
              {soon ? <Lock className="w-4 h-4 text-white/30" /> : <ChevronRight className="w-5 h-5 text-white/35" />}
            </GlassCard>
          ))}
        </div>

        {/* player card */}
        <GlassCard className="mt-5 p-3 flex items-center gap-3" glow={NEON.gold}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-700 flex items-center justify-center font-black text-black text-lg shrink-0">TL</div>
          <div className="flex-1">
            <div className="font-black flex items-center gap-1.5">{MOCK_PLAYER.name} <BadgeCheck className="w-4 h-4 text-cyan-400" /></div>
            <div className="text-[11px] text-cyan-400">{MOCK_PLAYER.title}</div>
            <div className="text-[10px] text-white/45">Noun Score: <b className="text-yellow-300">{nounScore.toLocaleString()}</b></div>
          </div>
          <div className="text-center px-1">
            <div className="text-[9px] text-yellow-400 font-bold">HOT TRAIL</div>
            <div className="flex items-center gap-1 justify-center"><Flame className="w-4 h-4 text-orange-400" /><span className="font-black">{hotTrail}</span></div>
          </div>
          <button onClick={onLeaderboard} className="text-center px-1 active:scale-95"><Trophy className="w-5 h-5 text-yellow-400 mx-auto" /><div className="text-[11px] font-bold">#{rank}</div></button>
        </GlassCard>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button onClick={onModeSelect} className="rounded-2xl bg-black/40 border border-white/10 py-3 text-sm font-bold active:scale-95">How To Play</button>
          <button onClick={onLeaderboard} className="rounded-2xl bg-black/40 border border-yellow-500/30 py-3 text-sm font-bold text-yellow-300 active:scale-95">Leaderboard</button>
        </div>
        <button onClick={onExit} className="w-full mt-4 text-xs text-white/35 underline">Back to Trey TV Games</button>
      </div>
      <TreyBottomNav active="home" onHome={onExit} />
    </ScreenWrap>
  );
};

export default TreynounHome;
