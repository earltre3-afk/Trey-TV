import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Flame, Zap, Heart, Volume2, ShieldAlert, X, HelpCircle, Check, Crown } from 'lucide-react';
import { GlassCard, PrimaryButton, SecondaryButton } from '../../ui';
import { IMG } from '../../data';
import type { SongWarArtist, SongWarRound } from '../types';

//  VS EMBLEM 
export const VSEmblem: React.FC<{ active?: boolean; className?: string }> = ({ active = true, className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer rotating dashed ring for high-end feel */}
      <div className="absolute h-28 w-28 rounded-full border border-dashed border-purple-500/30 animate-[spin_25s_linear_infinite]" />

      {/* Background neon clashing rays */}
      <div className={`absolute h-24 w-24 rounded-full bg-gradient-to-tr from-fuchsia-500/20 via-purple-600/30 to-cyan-500/20 blur-xl transition-all duration-1000 ${active ? 'scale-150 animate-pulse' : 'scale-100'}`} />

      {/* Waveform rays behind emblem */}
      {active && (
        <div className="absolute flex h-24 w-36 items-center justify-between opacity-50 pointer-events-none">
          <span className="h-12 w-0.5 rounded-full bg-gradient-to-t from-fuchsia-500 to-transparent animate-[bounce_1.2s_infinite_100ms]" />
          <span className="h-18 w-0.5 rounded-full bg-gradient-to-t from-fuchsia-400 to-transparent animate-[bounce_1.2s_infinite_300ms]" />
          <span className="h-10 w-0.5 rounded-full bg-gradient-to-t from-purple-500 to-transparent animate-[bounce_1.2s_infinite_500ms]" />
          <div className="w-12" /> {/* VS space */}
          <span className="h-10 w-0.5 rounded-full bg-gradient-to-t from-purple-400 to-transparent animate-[bounce_1.2s_infinite_200ms]" />
          <span className="h-18 w-0.5 rounded-full bg-gradient-to-t from-cyan-400 to-transparent animate-[bounce_1.2s_infinite_400ms]" />
          <span className="h-12 w-0.5 rounded-full bg-gradient-to-t from-cyan-300 to-transparent animate-[bounce_1.2s_infinite_600ms]" />
        </div>
      )}

      {/* Main emblem ring */}
      <div className={`relative flex h-20 w-16 items-center justify-center rounded-3xl border bg-gradient-to-b from-black/80 to-[#10061F]/90 shadow-premium transition-transform duration-700 ${
        active
          ? 'border-purple-400/40 shadow-[0_0_40px_rgba(168,85,247,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] scale-110'
          : 'border-white/10'
      }`}>
        <span className="bg-gradient-to-r from-fuchsia-400 via-pink-300 to-cyan-300 bg-clip-text text-2xl font-black italic tracking-widest text-transparent drop-shadow-[0_2px_8px_rgba(168,85,247,0.5)]">
          VS
        </span>
      </div>
    </div>
  );
};

//  ARTIST ENTRANCE SEQUENCE 
interface ArtistEntranceProps {
  artistA: SongWarArtist;
  artistB: SongWarArtist;
  onComplete: () => void;
}

export const ArtistEntrance: React.FC<ArtistEntranceProps> = ({ artistA, artistB, onComplete }) => {
  const [step, setStep] = useState<'slide' | 'reveal' | 'countdown3' | 'countdown2' | 'countdown1' | 'ready' | 'done'>('slide');
  const [countdown, setCountdown] = useState<string>('3');

  useEffect(() => {
    // Sequence timing
    const timers = [
      setTimeout(() => setStep('reveal'), 1800),
      setTimeout(() => { setStep('countdown3'); setCountdown('3'); }, 3000),
      setTimeout(() => { setStep('countdown2'); setCountdown('2'); }, 4000),
      setTimeout(() => { setStep('countdown1'); setCountdown('1'); }, 5000),
      setTimeout(() => { setStep('ready'); setCountdown('ROUND 1'); }, 6000),
      setTimeout(() => { setStep('done'); onComplete(); }, 7500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (step === 'done') return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050508]/95 p-6 backdrop-blur-xl transition-all duration-500">
      {/* Stage lights background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-fuchsia-600/20 blur-[150px] animate-pulse" />
        <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-cyan-600/20 blur-[150px] animate-pulse" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-4xl text-center">
        {/* Entrance Stage */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          
          {/* Artist A Panel */}
          <div className={`flex flex-col items-center rounded-3xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-950/20 to-transparent p-8 backdrop-blur-2xl transition-all duration-1000 transform ${
            step === 'slide' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
          }`}>
            <div className="relative">
              <img src={artistA.avatar} alt={artistA.name} className="h-40 w-40 rounded-full border-4 border-fuchsia-500 object-cover shadow-[0_0_40px_rgba(244,63,94,0.4)]" />
              {artistA.verified && (
                <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-500 text-white border-2 border-[#050508]">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </div>
            <div className="mt-5">
              <span className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs font-bold tracking-wider text-fuchsia-300 uppercase">Artist Participant</span>
              <h2 className="mt-2 text-3xl font-black text-white tracking-tight">{artistA.name}</h2>
              <p className="mt-1 text-sm text-white/50">{artistA.station}</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/60 bg-white/5 px-4 py-2 rounded-2xl">
                <span>{(artistA.followers / 1000).toFixed(1)}K Followers</span>
              </div>
            </div>
          </div>

          {/* Artist B Panel */}
          <div className={`flex flex-col items-center rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-transparent p-8 backdrop-blur-2xl transition-all duration-1000 transform ${
            step === 'slide' ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
          }`}>
            <div className="relative">
              <img src={artistB.avatar} alt={artistB.name} className="h-40 w-40 rounded-full border-4 border-cyan-500 object-cover shadow-[0_0_40px_rgba(6,182,212,0.4)]" />
              {artistB.verified && (
                <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-white border-2 border-[#050508]">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </div>
            <div className="mt-5">
              <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-bold tracking-wider text-cyan-300 uppercase">Artist Participant</span>
              <h2 className="mt-2 text-3xl font-black text-white tracking-tight">{artistB.name}</h2>
              <p className="mt-1 text-sm text-white/50">{artistB.station}</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/60 bg-white/5 px-4 py-2 rounded-2xl">
                <span>{(artistB.followers / 1000).toFixed(1)}K Followers</span>
              </div>
            </div>
          </div>

        </div>

        {/* VS Emblem & Countdown Overlays */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {step === 'reveal' && (
            <div className="animate-pulse flex flex-col items-center">
              <VSEmblem active className="scale-[1.8]" />
              <div className="mt-6 bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-2xl font-black tracking-[0.2em] text-transparent uppercase">
                Ready for Battle
              </div>
            </div>
          )}

          {['countdown3', 'countdown2', 'countdown1', 'ready'].includes(step) && (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-[ping_1s_infinite] text-7xl font-extrabold italic bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                {countdown}
              </div>
              <div className="mt-4 text-xs font-medium uppercase tracking-[0.25em] text-white/40">
                {step === 'ready' ? 'Let\'s go!' : 'Launching session'}
              </div>
            </div>
          )}
        </div>

        {/* Intro Banner */}
        <div className={`mt-12 text-center transition-all duration-1000 ${step !== 'slide' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-5 py-2.5 backdrop-blur-xl text-purple-200 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-purple-300 animate-spin" /> Entering the battle stage...
          </div>
        </div>

      </div>
    </div>
  );
};

//  VOTE METER 
interface VoteMeterProps {
  votesA: number;
  votesB: number;
  labelA: string;
  labelB: string;
  hasVoted?: boolean;
  userVote?: 'A' | 'B' | null;
}

export const VoteMeter: React.FC<VoteMeterProps> = ({ votesA, votesB, labelA, labelB, hasVoted = false, userVote }) => {
  const total = votesA + votesB;
  const pctA = total > 0 ? Math.round((votesA / total) * 100) : 50;
  const pctB = total > 0 ? Math.round((votesB / total) * 100) : 50;

  return (
    <div className="w-full rounded-3xl bg-black/65 border-[0.5px] border-white/10 p-6 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_20px_40px_rgba(0,0,0,0.6)]">
      <div className="flex justify-between items-center mb-4">
        <div className="text-left w-[40%]">
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" /> {labelA}
          </div>
          <div className="text-3xl font-black bg-gradient-to-r from-pink-400 to-fuchsia-300 bg-clip-text text-transparent mt-1 leading-none">{hasVoted ? `${pctA}%` : '??%'}</div>
          {userVote === 'A' && <span className="inline-block text-[8px] bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider mt-1.5 shadow-[0_0_10px_rgba(244,63,94,0.15)]">Your Choice</span>}
        </div>

        <div className="text-center bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-2 flex flex-col justify-center shadow-inner">
          <div className="text-[8px] text-white/30 uppercase tracking-[0.25em] font-black">LEDGER TALLIES</div>
          <div className="text-sm font-black text-purple-200 mt-1">{hasVoted ? total.toLocaleString() : 'LOCKED'}</div>
        </div>

        <div className="text-right w-[40%]">
          <div className="flex items-center gap-2 justify-end text-[10px] uppercase font-bold tracking-widest text-white/40">
            {labelB} <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          </div>
          <div className="text-3xl font-black bg-gradient-to-r from-cyan-300 to-teal-200 bg-clip-text text-transparent mt-1 leading-none">{hasVoted ? `${pctB}%` : '??%'}</div>
          {userVote === 'B' && <span className="inline-block text-[8px] bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider mt-1.5 shadow-[0_0_10px_rgba(6,182,212,0.15)]">Your Choice</span>}
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-5 w-full overflow-hidden rounded-full bg-black/60 border border-white/10 p-[2px] shadow-inner">
        {hasVoted ? (
          <div className="flex h-full w-full rounded-full overflow-hidden">
            <div
              style={{ width: `${pctA}%` }}
              className="h-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 transition-all duration-1000 ease-out shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] relative"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px] opacity-10 animate-pulse" />
            </div>
            <div
              style={{ width: `${pctB}%` }}
              className="h-full bg-gradient-to-r from-purple-600 via-cyan-500 to-teal-400 transition-all duration-1000 ease-out shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] relative"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px] opacity-10 animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-fuchsia-500/5 via-purple-500/10 to-cyan-500/5 animate-pulse flex items-center justify-center">
            <span className="text-[9px] text-purple-300/40 uppercase tracking-[0.25em] font-black animate-pulse">CAST VOTE TO UNLOCK REALTIME DISPLAY</span>
          </div>
        )}
      </div>
    </div>
  );
};

//  CROWD ENERGY METER 
export const CrowdEnergyMeter: React.FC<{ energy?: number; className?: string }> = ({ energy = 78, className = '' }) => {
  const bars = 18;
  const activeBarsCount = Math.round((energy / 100) * bars);

  return (
    <div className={`rounded-2xl bg-black/40 border border-white/5 p-4 backdrop-blur-md ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-fuchsia-400 animate-pulse" />
          <span className="text-[10px] text-white/50 uppercase tracking-wider font-extrabold">Crowd Energy</span>
        </div>
        <span className="text-xs font-bold text-fuchsia-300 bg-fuchsia-500/10 px-2 py-0.5 rounded-full">{energy}%</span>
      </div>

      {/* Visual Equalizer Equalizer-Style Energy representation */}
      <div className="flex items-end justify-between h-8 gap-0.5">
        {Array.from({ length: bars }).map((_, i) => {
          const isActive = i < activeBarsCount;
          // Gradient colors from left to right
          let colorClass = 'bg-white/10';
          if (isActive) {
            if (i < bars / 3) colorClass = 'bg-gradient-to-t from-cyan-500 to-purple-400 shadow-[0_0_5px_rgba(6,182,212,0.4)]';
            else if (i < (2 * bars) / 3) colorClass = 'bg-gradient-to-t from-purple-400 to-fuchsia-500 shadow-[0_0_5px_rgba(176,38,255,0.4)]';
            else colorClass = 'bg-gradient-to-t from-fuchsia-500 to-pink-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
          }

          // Varied height factors for visual flavor
          const heightPercent = [30, 45, 60, 75, 90, 80, 70, 55, 40, 60, 75, 90, 95, 80, 65, 50, 40, 30][i];

          return (
            <div 
              key={i} 
              style={{ height: `${isActive ? heightPercent : 15}%` }} 
              className={`w-full rounded-sm transition-all duration-500 ${colorClass}`} 
            />
          );
        })}
      </div>
    </div>
  );
};

//  EMOJI TRAY 
const EMOJI_LIST = [
  { emoji: '\uD83D\uDD25', label: 'fire', color: 'from-pink-500 to-amber-500' },
  { emoji: '\uD83D\uDC51', label: 'crown', color: 'from-amber-400 to-yellow-600' },
  { emoji: '\u26A1', label: 'lightning', color: 'from-blue-400 to-cyan-300' },
  { emoji: '\uD83D\uDC96', label: 'heart', color: 'from-red-500 to-pink-400' },
  { emoji: '\uD83D\uDD0A', label: 'speaker', color: 'from-purple-500 to-pink-500' },
  { emoji: '\uD83E\uDD81', label: 'roar', color: 'from-amber-500 to-orange-500' },
];

interface EmojiTrayProps {
  onSelect: (emoji: string, type: 'fire' | 'crown' | 'lightning' | 'heart' | 'speaker' | 'roar') => void;
  disabled?: boolean;
}

export const EmojiTray: React.FC<EmojiTrayProps> = ({ onSelect, disabled = false }) => {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/8 p-2 overflow-x-auto no-scrollbar">
      {EMOJI_LIST.map((item) => (
        <button
          key={item.label}
          disabled={disabled}
          onClick={() => onSelect(item.emoji, item.label as 'fire' | 'crown' | 'lightning' | 'heart' | 'speaker' | 'roar')}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/8 to-white/3 border border-white/5 text-lg transition-all duration-200 hover:scale-110 hover:border-white/20 active:scale-90 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={`${item.label} reaction`}
          aria-label={`${item.label} reaction`}
        >
          {item.emoji}
        </button>
      ))}
    </div>
  );
};

//  ANIMATED REACTION TRAY 
interface AnimatedReactionTrayProps {
  floatingReactions: { id: number; emoji: string; x: number; y: number }[];
}

export const AnimatedReactionTray: React.FC<AnimatedReactionTrayProps> = ({ floatingReactions }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {floatingReactions.map((react) => (
        <div
          key={react.id}
          style={{ 
            left: `${react.x}%`, 
            bottom: `${react.y}%`,
            transition: 'bottom 4s linear, opacity 4s ease-out'
          }}
          className="absolute text-3xl select-none animate-[reactionFloat_4s_forwards] pointer-events-none drop-shadow-[0_0_10px_rgba(176,38,255,0.8)]"
        >
          {react.emoji}
        </div>
      ))}
    </div>
  );
};

//  GIF PICKER PLACEHOLDER 
interface GIFPickerPlaceholderProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

export const GIFPickerPlaceholder: React.FC<GIFPickerPlaceholderProps> = ({ onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'FWD' | 'Trending' | 'Tradio'>('FWD');

  const categories = ['FWD', 'Trending', 'Tradio'];

  const mockGIFs = [
    { id: 'gif-1', term: 'FWD', name: 'Trey DJing Live', url: IMG.treyTrizzy, desc: 'Trey on the CDJs' },
    { id: 'gif-2', term: 'FWD', name: 'Bass Drop Shake', url: IMG.aiSphere, desc: 'Subwoofer vibrating' },
    { id: 'gif-3', term: 'Trending', name: 'Crowd Roar Glow', url: IMG.midnightVelvet, desc: 'Neon concert' },
    { id: 'gif-4', term: 'Trending', name: 'Winner Flame Burst', url: IMG.neonHeartbreak, desc: 'Fire sparks' },
    { id: 'gif-5', term: 'Tradio', name: 'Spinning Gold Plate', url: IMG.lateNightSoul, desc: 'Rotating premium vinyl' },
    { id: 'gif-6', term: 'Tradio', name: 'Equalizer Clashing', url: IMG.instantDrop, desc: 'Digital waveforms' },
  ];

  const filteredGIFs = mockGIFs.filter(g => {
    const matchesTab = g.term === activeTab;
    if (search) {
      return g.name.toLowerCase().includes(search.toLowerCase());
    }
    return matchesTab;
  });

  return (
    <div className="absolute bottom-[4.5rem] right-0 z-30 w-72 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0F0A18]/95 to-[#050308]/98 p-4 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">Tradio GIF Picker (Concept)</h4>
        <button onClick={onClose} className="rounded-full bg-white/5 p-1 text-white/60 hover:bg-white/10">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <input
        type="text"
        placeholder="Search Giphy..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none"
      />

      {/* Tabs */}
      {!search && (
        <div className="flex gap-1.5 my-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat as 'FWD' | 'Trending' | 'Tradio')}
              className={`rounded-full px-3 py-1 text-[10px] font-bold transition-all ${
                activeTab === cat 
                  ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(176,38,255,0.4)]' 
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto mt-2 no-scrollbar">
        {filteredGIFs.map((gif) => (
          <button
            key={gif.id}
            onClick={() => onSelect(gif.url)}
            className="group relative h-20 w-full overflow-hidden rounded-xl border border-white/5 hover:border-purple-400/40"
          >
            <img src={gif.url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
              <span className="text-[9px] font-bold text-white truncate">{gif.name}</span>
              <span className="text-[7px] text-purple-300 bg-purple-500/20 px-1 py-0.2 rounded self-start mt-0.5 font-bold uppercase tracking-widest">GIF</span>
            </div>
          </button>
        ))}
        {filteredGIFs.length === 0 && (
          <div className="col-span-2 text-center text-[10px] text-white/40 py-8">
            No mock GIFs found
          </div>
        )}
      </div>
    </div>
  );
};

//  ROUND BREAKDOWN 
interface RoundBreakdownProps {
  rounds: SongWarRound[];
  artistAName: string;
  artistBName: string;
}

export const RoundBreakdown: React.FC<RoundBreakdownProps> = ({ rounds, artistAName, artistBName }) => {
  const playedRounds = rounds.filter((r) => r.status === 'completed');

  return (
    <div className="space-y-3">
      <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Round Breakdown</div>
      {playedRounds.map((round) => {
        const isAWinner = round.winner === 'A';
        const isBWinner = round.winner === 'B';
        const total = round.votesA + round.votesB;
        const pctA = total > 0 ? Math.round((round.votesA / total) * 100) : 50;
        const pctB = total > 0 ? Math.round((round.votesB / total) * 100) : 50;

        return (
          <div key={round.roundNumber} className="relative rounded-2xl border border-white/5 bg-black/20 p-4">
            <div className="flex justify-between items-center text-xs">
              <div className="font-extrabold text-purple-300">ROUND {round.roundNumber}</div>
              <div className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/40">
                {(total / 1000).toFixed(1)}K Total Votes
              </div>
            </div>

            {/* Song Versus Matchup */}
            <div className="grid grid-cols-2 gap-4 mt-2 border-t border-white/5 pt-2">
              <div className={`min-w-0 ${isAWinner ? 'text-fuchsia-300 font-bold' : 'text-white/60'}`}>
                <div className="text-[10px] leading-tight truncate">{round.trackA.title}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="text-xs font-black">{pctA}%</div>
                  {isAWinner && <Crown className="h-3 w-3 text-amber-400" />}
                </div>
              </div>

              <div className={`min-w-0 text-right ${isBWinner ? 'text-cyan-300 font-bold' : 'text-white/60'}`}>
                <div className="text-[10px] leading-tight truncate">{round.trackB.title}</div>
                <div className="flex items-center gap-1.5 justify-end mt-1">
                  {isBWinner && <Crown className="h-3 w-3 text-amber-400" />}
                  <div className="text-xs font-black">{pctB}%</div>
                </div>
              </div>
            </div>

            {/* Progress Track visual */}
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3 flex">
              <div style={{ width: `${pctA}%` }} className={`h-full ${isAWinner ? 'bg-fuchsia-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-white/20'}`} />
              <div style={{ width: `${pctB}%` }} className={`h-full ${isBWinner ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-white/20'}`} />
            </div>
          </div>
        );
      })}

      {playedRounds.length === 0 && (
        <div className="text-center py-6 border border-dashed border-white/8 rounded-2xl text-xs text-white/40">
          No rounds completed yet
        </div>
      )}
    </div>
  );
};

//  WINNER REVEAL 
interface WinnerRevealProps {
  winner: SongWarArtist;
  score: string;
  prize: string;
  winningSong: string;
  onClose: () => void;
}

export const WinnerReveal: React.FC<WinnerRevealProps> = ({ winner, score, prize, winningSong, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07030C]/98 p-6 backdrop-blur-3xl">
      {/* Heavy fireworks background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-fuchsia-600/35 blur-[180px] animate-pulse" />
        <div className="absolute -right-1/4 bottom-1/4 h-[600px] w-[600px] rounded-full bg-cyan-600/25 blur-[180px] animate-pulse" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-[150px]" />
      </div>

      <div className="relative max-w-lg w-full text-center scale-95 animate-[zoomIn_0.6s_ease-out_forwards]">
        {/* Crown & Lights */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-yellow-500/25 blur-xl animate-ping" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 border border-amber-300/40 shadow-[0_0_50px_rgba(234,179,8,0.8)]">
              <Trophy className="h-10 w-10 text-white animate-bounce" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-transparent tracking-tight">
          BATTLE CHAMPION
        </h1>
        <p className="text-white/50 text-sm mt-1 uppercase tracking-[0.2em]">Song Wars Session Winner</p>

        {/* Winner Main Card */}
        <GlassCard glow className="mt-8 overflow-hidden border-yellow-500/20 bg-gradient-to-br from-[#1C1405] via-[#0E071A] to-[#0A0A0F]">
          <div className="p-8">
            <div className="relative inline-block">
              <img 
                src={winner.avatar} 
                alt="" 
                className="h-44 w-44 rounded-full border-4 border-yellow-500 object-cover shadow-[0_0_40px_rgba(234,179,8,0.5)] mx-auto" 
              />
              <span className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg border-2 border-[#0A0A0F]">
                <Crown className="h-5 w-5" />
              </span>
            </div>

            <h2 className="mt-6 text-3xl font-black text-white tracking-tight">{winner.name}</h2>
            <p className="mt-1 text-xs font-bold text-yellow-300 uppercase tracking-widest">{winner.station}</p>

            {/* Score Pill */}
            <div className="mt-6 inline-flex flex-col items-center justify-center rounded-3xl bg-white/5 border border-white/10 px-6 py-3">
              <span className="text-[10px] text-white/40 uppercase tracking-widest">Final Score</span>
              <span className="text-2xl font-black text-white">{score}</span>
            </div>

            {/* Winner Details */}
            <div className="mt-6 space-y-3 text-left border-t border-white/5 pt-5">
              <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                <span className="text-xs text-white/50">Winning Song Highlight</span>
                <span className="text-xs font-bold text-white max-w-[200px] truncate">{winningSong}</span>
              </div>
              <div className="flex justify-between items-center bg-yellow-500/5 p-3 rounded-2xl border border-yellow-500/10">
                <span className="text-xs text-yellow-200/60">Prize Awarded</span>
                <span className="text-xs font-extrabold text-yellow-300 truncate max-w-[200px]">{prize}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Action Button */}
        <div className="mt-8 flex flex-col gap-3">
          <PrimaryButton onClick={onClose} className="w-full">
            Proceed to Results
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

//  EXIT BATTLE MODAL 
interface ExitBattleModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExitBattleModal: React.FC<ExitBattleModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-gradient-to-b from-[#1C0D26] to-[#0A0A0F] p-6 shadow-premium animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-center text-white">Leaving so soon?</h3>
        <p className="mt-2 text-center text-xs text-white/60 leading-relaxed">
          The battle session is currently live! If you exit, you will miss out on the round-by-round voting and real-time chat with the community.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <SecondaryButton onClick={onCancel} className="py-2.5 text-xs">
            Keep Watching
          </SecondaryButton>
          <button 
            onClick={onConfirm} 
            className="rounded-full bg-fuchsia-500 py-2.5 text-xs font-semibold text-white transition-all hover:bg-fuchsia-600 active:scale-95 shadow-[0_10px_20px_rgba(244,63,94,0.3)]"
          >
            Exit Battle
          </button>
        </div>
      </div>
    </div>
  );
};
