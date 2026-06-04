import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ScreenWrap, TreyHeader, GlossyButton, GlassCard, NeonRing, catColor, NEON } from '../components/TreyShell';
import { NounType } from '../treynounTypes';
import { getMockNounForCategory, getMockSignalsForNoun, isCorrectGuess } from '../treynounUtils';
import { TEAM_GLOW, TEAM_VIBE } from '../treynounMockData';
import { Lock, Zap, ChevronRight, Swords, Flame, ShieldAlert, Crosshair, User as UserIcon, MapPin, Box, type LucideIcon } from 'lucide-react';

interface Props {
  onFinish: (glow: number, vibe: number) => void;
  onExit: () => void;
}

function newRound() {
  const cats: NounType[] = ['person', 'place', 'thing'];
  const cat = cats[Math.floor(Math.random() * cats.length)];
  const noun = getMockNounForCategory(cat);
  return { cat, noun, signals: getMockSignalsForNoun(noun, cat) };
}

const catIcon: Record<NounType, LucideIcon> = {
  person: UserIcon, place: MapPin, thing: Box,
};

/* ---------------- Team Panel ---------------- */
const TeamPanel: React.FC<{
  name: string; accent: string; score: number; chaos: number; active: boolean; side: 'l' | 'r';
}> = ({ name, accent, score, chaos, active, side }) => (
  <GlassCard
    glow={active ? accent : undefined}
    className={`relative flex-1 p-3 sm:p-4 transition-all duration-300 ${active ? 'scale-[1.02]' : 'opacity-90'}`}
    style={{ borderColor: active ? accent : undefined }}
  >
    {active && (
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest whitespace-nowrap"
        style={{ background: accent, color: '#05050d', boxShadow: `0 0 14px ${accent}` }}>
        ON THE HUNT
      </span>
    )}
    <div className={`flex items-center gap-2 ${side === 'r' ? 'flex-row-reverse text-right' : ''}`}>
      <div className="relative shrink-0">
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-black text-base sm:text-lg"
          style={{ background: `${accent}22`, border: `1.5px solid ${accent}`, color: accent, boxShadow: active ? `0 0 16px ${accent}66` : 'none' }}>
          {name.includes('GLOW') ? 'G' : 'V'}
        </div>
      </div>
      <div className={side === 'r' ? 'text-right' : ''}>
        <div className="text-[10px] sm:text-xs font-black tracking-wider" style={{ color: accent }}>{name}</div>
        <div className="text-2xl sm:text-4xl font-black leading-none tabular-nums">{score}</div>
      </div>
    </div>
    <div className={`mt-2.5 flex items-center gap-1.5 ${side === 'r' ? 'flex-row-reverse' : ''}`}>
      <ShieldAlert className="w-3 h-3 shrink-0" style={{ color: chaos > 66 ? '#FF3D6E' : 'rgba(255,255,255,.4)' }} />
      <div className="flex-1 h-1.5 rounded-full bg-black/60 overflow-hidden border border-white/10">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${chaos}%`, background: 'linear-gradient(90deg,#FFB300,#FF3D6E)', boxShadow: chaos > 0 ? '0 0 8px #FF3D6E88' : 'none' }} />
      </div>
    </div>
  </GlassCard>
);

const TreynounBattleScreen: React.FC<Props> = ({ onFinish, onExit }) => {
  const [roundNo, setRoundNo] = useState(1);
  const [data, setData] = useState(newRound);
  const [revealed, setRevealed] = useState(1);
  const [time, setTime] = useState(60);
  const [glow, setGlow] = useState(0);
  const [vibe, setVibe] = useState(0);
  const [glowChaos, setGlowChaos] = useState(0);
  const [vibeChaos, setVibeChaos] = useState(0);
  const [lockout, setLockout] = useState(0);
  const [stealWindow, setStealWindow] = useState(0);
  const [guess, setGuess] = useState('');
  const [lockedCat, setLockedCat] = useState<NounType | null>(null);
  const [trapUsed, setTrapUsed] = useState(false);
  const elapsed = useRef(0);
  const ended = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        elapsed.current += 1;
        if (elapsed.current >= 30) setRevealed((r) => Math.max(r, 3));
        else if (elapsed.current >= 15) setRevealed((r) => Math.max(r, 2));
        if (t <= 1) { nextRound(false); return 60; }
        return t - 1;
      });
      setLockout((l) => Math.max(0, l - 1));
      setStealWindow((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [roundNo]);

  const nextRound = (glowWon: boolean) => {
    if (ended.current) return;
    if (roundNo >= 3) {
      ended.current = true;
      setTimeout(() => onFinish(glow + (glowWon ? 100 : 0), vibe), 50);
      return;
    }
    setRoundNo((n) => n + 1);
    setData(newRound());
    setRevealed(1);
    setTime(60);
    setLockout(0);
    setStealWindow(0);
    setLockedCat(null);
    setTrapUsed(false);
    elapsed.current = 0;
  };

  const award = (team: 'glow' | 'vibe', pts: number) => {
    if (team === 'glow') setGlow((s) => s + pts); else setVibe((s) => s + pts);
  };

  const handleGuess = (trap = false) => {
    if (lockout > 0) { toast.error('Team Glow locked out!'); return; }
    const g = guess.trim();
    if (!g) return;
    if (isCorrectGuess(g, data.noun)) {
      const base = trap ? Math.round(100 * 1.5) : 100 + (lockedCat === data.cat ? 25 : 0);
      award('glow', base);
      toast.success(`Team Glow scored +${base}!`);
      setGuess('');
      nextRound(false);
    } else {
      setGuess('');
      if (trap) {
        setTrapUsed(true);
        setGlowChaos((c) => Math.min(100, c + 35));
        setLockout(5);
        toast.error('Trap missed! Team Glow locked out 5s.');
      } else {
        setGlowChaos((c) => Math.min(100, c + 15));
        setLockout(3);
        setStealWindow(5);
        toast.error('Wrong! Team Vibe steal window open (5s).');
      }
    }
  };

  const vibeSteal = () => {
    if (stealWindow <= 0) return;
    award('vibe', 75);
    setStealWindow(0);
    toast.success('Team Vibe STOLE it! +75');
    nextRound(false);
  };

  const handleCatLock = (c: NounType) => {
    if (lockedCat) return;
    setLockedCat(c);
    if (c === data.cat) toast.success('Category locked! +25 ready');
    else { setGlowChaos((v) => Math.min(100, v + 15)); toast.error('Wrong category! +15 Chaos'); }
  };

  const cats: NounType[] = ['person', 'place', 'thing'];
  const accent = data.cat ? catColor[data.cat] : NEON.cyan;
  const glowTurn = stealWindow <= 0 && lockout <= 0;

  return (
    <ScreenWrap>
      <TreyHeader />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 pb-10">

          {/* Title row */}
          <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
            <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-fuchsia-400" />
            <h2 className="text-lg sm:text-2xl font-black tracking-wide bg-gradient-to-r from-fuchsia-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              NOUN BATTLE
            </h2>
          </div>

          {/* Scoreboard: teams + center timer */}
          <div className="mt-4 flex items-stretch gap-2 sm:gap-4">
            <TeamPanel name="TEAM GLOW" accent={TEAM_GLOW.accent} score={glow} chaos={glowChaos} active={glowTurn} side="l" />

            <div className="flex flex-col items-center justify-center px-1 sm:px-3 shrink-0">
              <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-white/40 mb-1">ROUND {roundNo}/3</div>
              <NeonRing
                value={time} max={60}
                color={time <= 10 ? '#FF3D6E' : NEON.cyan}
                big={<span className="text-lg sm:text-2xl">{time}</span>}
                sub="SEC"
                size={typeof window !== 'undefined' && window.innerWidth >= 640 ? 92 : 70}
              />
              <div className="hidden sm:flex items-center gap-1 mt-2">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={`w-2 h-2 rounded-full ${n < roundNo ? 'bg-cyan-400' : n === roundNo ? 'bg-fuchsia-400 shadow-[0_0_8px_#FF00E5]' : 'bg-white/15'}`} />
                ))}
              </div>
            </div>

            <TeamPanel name="TEAM VIBE" accent={TEAM_VIBE.accent} score={vibe} chaos={vibeChaos} active={false} side="r" />
          </div>

          {/* Status / steal banner */}
          {stealWindow > 0 ? (
            <GlassCard glow={TEAM_VIBE.accent} className="mt-4 p-3 sm:p-4 flex items-center justify-between gap-3 animate-[trey-pop_.3s_ease]">

              <div className="flex items-center gap-2">
                <Crosshair className="w-5 h-5 animate-pulse" style={{ color: TEAM_VIBE.accent }} />
                <div>
                  <div className="font-black text-sm sm:text-base" style={{ color: TEAM_VIBE.accent }}>STEAL WINDOW</div>
                  <div className="text-[11px] text-white/60">Team Vibe can lock it in — {stealWindow}s</div>
                </div>
              </div>
              <GlossyButton tone="primary" onClick={vibeSteal} className="px-4 sm:px-5 py-2.5 text-sm whitespace-nowrap">
                STEAL +75
              </GlossyButton>
            </GlassCard>
          ) : (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold">
              {lockout > 0 ? (
                <span className="flex items-center gap-1.5 text-red-400">
                  <Lock className="w-4 h-4" /> Team Glow locked out — {lockout}s
                </span>
              ) : (
                <span className="flex items-center gap-1.5" style={{ color: TEAM_GLOW.accent }}>
                  <Flame className="w-4 h-4" /> Team Glow is on the hunt
                </span>
              )}
            </div>
          )}

          {/* Main play area — responsive grid */}
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_1fr] lg:items-start">

            {/* Signals */}
            <div>
              <div className="text-[10px] font-black tracking-widest text-white/40 mb-2 flex items-center gap-1.5">
                NOUN TRAIL
                <span className="px-1.5 py-0.5 rounded-full text-[9px] capitalize" style={{ background: `${accent}22`, color: accent }}>{data.cat}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {data.signals.map((s) => {
                  const open = revealed >= s.id;
                  const Icon = catIcon[data.cat];
                  return (
                    <GlassCard key={s.id} glow={open ? accent : undefined}
                      className={`p-3 sm:min-h-[140px] flex flex-row sm:flex-col gap-3 items-center sm:items-start transition-all ${open ? '' : 'opacity-70'}`}>
                      <div className="w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-black shrink-0"
                        style={{ borderColor: open ? accent : 'rgba(255,255,255,.15)', color: open ? accent : 'rgba(255,255,255,.3)', background: open ? `${accent}1a` : 'transparent' }}>
                        {s.id}
                      </div>
                      {open ? (
                        <div className="flex-1">
                          <div className="text-[10px] text-white/40 font-bold leading-tight">{s.prompt}</div>
                          <div className="text-sm font-bold leading-snug mt-0.5">{s.text}</div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center sm:justify-center gap-2 text-white/30">
                          <Lock className="w-4 h-4" />
                          <span className="text-[11px] font-semibold">{s.id === 2 ? 'unlocks 15s' : 'unlocks 30s'}</span>
                        </div>
                      )}
                      {open && <Icon className="hidden sm:block w-4 h-4 mt-auto" style={{ color: accent, opacity: .5 }} />}
                    </GlassCard>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3">
              {/* Category lock */}
              <div>
                <div className="text-[10px] font-black tracking-widest text-white/40 mb-2">CATEGORY LOCK</div>
                <div className="grid grid-cols-3 gap-2">
                  {cats.map((c) => {
                    const Icon = catIcon[c];
                    const locked = lockedCat === c;
                    return (
                      <button key={c} onClick={() => handleCatLock(c)} disabled={!!lockedCat}
                        className="rounded-2xl border py-2.5 font-bold capitalize text-xs sm:text-sm active:scale-95 disabled:opacity-40 flex flex-col items-center gap-1 transition"
                        style={{ borderColor: catColor[c], color: catColor[c], background: locked ? `${catColor[c]}22` : 'rgba(0,0,0,.3)', boxShadow: locked ? `0 0 16px ${catColor[c]}55` : 'none' }}>
                        <Icon className="w-4 h-4" />
                        {locked ? <span className="flex items-center gap-1"><Lock className="w-3 h-3" />{c}</span> : c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guess input */}
              <div>
                <div className="text-[10px] font-black tracking-widest text-white/40 mb-2">LOCK IN THE NOUN</div>
                <GlassCard glow={glowTurn ? TEAM_GLOW.accent : undefined} className="p-3 flex items-center gap-2">
                  <Crosshair className="w-5 h-5 shrink-0" style={{ color: TEAM_GLOW.accent }} />
                  <input value={guess} onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGuess(false)}
                    placeholder="Team Glow guess..." disabled={lockout > 0}
                    className="w-full bg-transparent text-base sm:text-lg font-bold outline-none placeholder:text-white/25 disabled:opacity-50" />
                </GlassCard>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <GlossyButton onClick={() => handleGuess(false)} disabled={lockout > 0} className="py-3.5 text-base">
                  <Lock className="w-5 h-5" /> LOCK IN
                </GlossyButton>
                <GlossyButton tone="danger" onClick={() => handleGuess(true)} disabled={trapUsed || lockout > 0} className="py-3.5 text-sm">
                  <Zap className="w-4 h-4" /> NOUN TRAP
                </GlossyButton>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button onClick={() => nextRound(false)} className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 transition">
                  Skip round <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={onExit} className="text-xs text-white/40 hover:text-red-400 underline transition">Exit battle</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScreenWrap>
  );
};

export default TreynounBattleScreen;
