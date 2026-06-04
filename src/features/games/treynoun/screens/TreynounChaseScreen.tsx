import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ScreenWrap, TreyHeader, GlossyButton, GlassCard, NeonRing, Meter, catColor, NEON } from '../components/TreyShell';
import { ChaosEvent, HintType, NounType, TreynounRoundState } from '../treynounTypes';
import { CHAOS_VALUES, calculateChaos } from '../treynounScoring';
import { isCorrectGuess, isCloseGuess, normalizeGuess } from '../treynounUtils';
import { Lock, Flame, Lightbulb, Eye, Zap, Trophy, AlertTriangle, X, LogOut, Activity } from 'lucide-react';

interface Props {
  round: TreynounRoundState;
  roundNumber: number;
  totalRounds: number;
  totalScore: number;
  streak: number;
  onWin: (finalRound: TreynounRoundState) => void;
  onLose: (finalRound: TreynounRoundState, reason: string) => void;
  onExit: () => void;
}

const cats: NounType[] = ['person', 'place', 'thing'];

const TreynounChaseScreen: React.FC<Props> = ({ round: initial, roundNumber, totalRounds, totalScore, streak, onWin, onLose, onExit }) => {
  const [round, setRound] = useState<TreynounRoundState>(initial);
  const [guess, setGuess] = useState('');
  const endedRef = useRef(false);
  const elapsedRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRound((r) => {
        if (endedRef.current || r.result !== 'pending') return r;
        const timeLeft = r.timeLeft - 1;
        elapsedRef.current += 1;
        let revealedSignals = r.revealedSignals;
        if (elapsedRef.current >= 30 && revealedSignals < 3) revealedSignals = 3;
        else if (elapsedRef.current >= 15 && revealedSignals < 2) revealedSignals = 2;
        let events = r.chaosEvents;
        if (timeLeft === 10) events = [...events, { reason: 'Timer low', amount: CHAOS_VALUES.lowTimer, at: Date.now() }];
        const chaos = calculateChaos(events);
        const next = { ...r, timeLeft, revealedSignals, chaosEvents: events, chaos };
        if (timeLeft <= 0) {
          endedRef.current = true;
          const lost = { ...next, timeLeft: 0, result: 'lost' as const, lossReason: 'Time ran out' };
          setTimeout(() => onLose(lost, 'Time ran out'), 50);
          return lost;
        }
        if (chaos >= 100) {
          endedRef.current = true;
          const lost = { ...next, result: 'lost' as const, lossReason: 'Chaos Meter filled' };
          setTimeout(() => onLose(lost, 'Chaos Meter filled'), 50);
          return lost;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onLose]);

  const addChaos = (reason: string, amount: number, base: TreynounRoundState): TreynounRoundState => {
    const events: ChaosEvent[] = [...base.chaosEvents, { reason, amount, at: Date.now() }];
    return { ...base, chaosEvents: events, chaos: calculateChaos(events) };
  };
  const finishLose = (r: TreynounRoundState, reason: string) => {
    if (endedRef.current) return;
    endedRef.current = true;
    setTimeout(() => onLose({ ...r, result: 'lost', lossReason: reason }, reason), 50);
  };

  const handleCategoryLock = (cat: NounType) => {
    if (round.lockedCategory) return;
    const correct = cat === round.category;
    setRound((r) => {
      let next: TreynounRoundState = { ...r, lockedCategory: cat, categoryLockCorrect: correct };
      if (correct) toast.success('Category Locked! +25 points');
      else { next = addChaos('Wrong category lock', CHAOS_VALUES.wrongCategory, next); toast.error('Wrong category! +15 Chaos'); if (next.chaos >= 100) finishLose(next, 'Chaos Meter filled'); }
      return next;
    });
  };

  const submitGuess = (trap = false) => {
    const g = guess.trim();
    if (!g || endedRef.current) return;
    if (trap && round.trapUsed) { toast.error('Noun Trap already used this round.'); return; }
    if (isCorrectGuess(g, round.targetNoun)) {
      endedRef.current = true;
      setRound((r) => {
        const won = { ...r, result: 'won' as const, trapUsed: trap || r.trapUsed, trapCorrect: trap ? true : r.trapCorrect };
        setTimeout(() => onWin(won), 50);
        return won;
      });
      return;
    }
    setRound((r) => {
      const repeated = r.wrongGuesses.map(normalizeGuess).includes(normalizeGuess(g));
      let next = { ...r, wrongGuesses: [...r.wrongGuesses, g] };
      if (trap) { next = { ...next, trapUsed: true, trapCorrect: false }; next = addChaos('Noun Trap miss', CHAOS_VALUES.trapWrong, next); toast.error('Trap missed! +35 Chaos'); }
      else {
        const amt = repeated ? CHAOS_VALUES.repeatedWrong : CHAOS_VALUES.wrongGuess;
        next = addChaos(repeated ? 'Repeated wrong guess' : 'Wrong guess', amt, next);
        if (isCloseGuess(g, round.targetNoun)) toast('Close! You are hot.', { icon: '🔥' }); else toast.error(`Wrong! +${amt} Chaos`);
      }
      if (next.chaos >= 100) finishLose(next, 'Chaos Meter filled');
      return next;
    });
    setGuess('');
  };

  const revealNext = () => {
    if (round.revealedSignals >= 3) return;
    setRound((r) => {
      let next = { ...r, revealedSignals: r.revealedSignals + 1, earlyReveals: r.earlyReveals + 1 };
      next = addChaos('Early clue reveal', CHAOS_VALUES.earlyReveal, next);
      toast('Signal revealed early. Clue bonus reduced.');
      if (next.chaos >= 100) finishLose(next, 'Chaos Meter filled');
      return next;
    });
  };

  const applyHint = (type: HintType) => {
    if (round.hintsUsed.includes(type)) { toast('Hint already used.'); return; }
    setRound((r) => {
      let next = { ...r, hintsUsed: [...r.hintsUsed, type] };
      next = addChaos('Hint used', CHAOS_VALUES.hint, next);
      const t = r.targetNoun;
      if (type === 'first-letter') toast(`First letter: ${t[0].toUpperCase()}`);
      else if (type === 'letter-count') toast(`Letters: ${t.replace(/ /g, '').length}`);
      else if (type === 'remove-category') toast(`It's NOT a ${cats.filter((c) => c !== r.category)[0]}.`);
      else toast(`You're getting warmer with the trail...`);
      if (next.chaos >= 100) finishLose(next, 'Chaos Meter filled');
      return next;
    });
  };

  const chaosColor = round.chaos > 70 ? '#EF4444' : round.chaos > 40 ? '#F59E0B' : '#22D3EE';
  const col = catColor[round.category];
  const hintsLeft = 4 - round.hintsUsed.length;

  return (
    <ScreenWrap>
      <TreyHeader />
      <div className="flex-1 overflow-y-auto trey-scroll px-4 pb-4 trey-rise">
        {/* top rings + title */}
        <div className="flex items-start justify-between mt-3">
          <NeonRing value={round.timeLeft} max={round.maxTime} color={round.timeLeft <= 10 ? '#EF4444' : NEON.cyan} label="TIME LEFT" big={round.timeLeft} sub="SEC" />
          <div className="text-center pt-2">
            <h1 className="text-4xl font-black leading-[0.85]">
              <span className="text-white drop-shadow">Guess the</span><br />
              <span className="trey-title text-5xl">Noun</span>
            </h1>
            <div className="mt-2 inline-block trey-glass rounded-full px-3 py-1 text-[11px] font-bold text-white/80">Use the clues. <span className="text-yellow-300">Make your guess!</span></div>
          </div>
          <NeonRing value={totalScore} max={Math.max(totalScore, 2000)} color={NEON.gold} label="SCORE" big={<span className="text-base">{totalScore}</span>} sub={undefined} />
        </div>

        {/* signal cards */}
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          {round.signals.map((s) => {
            const open = round.revealedSignals >= s.id; const c = ['#FFB800', '#19D3FF', '#C77DFF'][s.id - 1];
            return (
              <div key={s.id} className="relative rounded-2xl border-2 p-3 min-h-[150px] flex flex-col"
                style={{ borderColor: open ? c : 'rgba(255,255,255,.1)', background: open ? `linear-gradient(180deg,${c}1f,${c}08)` : 'rgba(0,0,0,.4)', boxShadow: open ? `0 0 18px ${c}40` : 'none' }}>
                <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-black" style={{ borderColor: c, color: c }}>{s.id}</div>
                {open ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center mt-1">
                    <Activity className="w-7 h-7 mb-2 trey-glow" style={{ color: c }} />
                    <div className="text-[12px] font-bold leading-tight text-white">{s.text}</div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-white/30">
                    <Lock className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">Unlocks {s.id === 2 ? '15s' : '30s'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* round dots */}
        <div className="text-center mt-4 text-xs font-black tracking-wider text-white/45">ROUND {roundNumber}/{totalRounds}</div>
        <div className="flex items-center justify-center gap-1.5 mt-1.5">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <span key={i} className="w-2.5 h-2.5 rounded-full transition" style={{ background: i + 1 === roundNumber ? NEON.gold : i + 1 < roundNumber ? '#19D3FF' : 'rgba(255,255,255,.15)', boxShadow: i + 1 === roundNumber ? `0 0 8px ${NEON.gold}` : 'none' }} />
          ))}
        </div>

        {/* category lock */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {cats.map((c) => {
            const locked = round.lockedCategory === c;
            return (
              <button key={c} onClick={() => handleCategoryLock(c)} disabled={!!round.lockedCategory}
                className="rounded-xl border py-2 font-bold capitalize text-xs transition active:scale-95 disabled:opacity-40 flex items-center justify-center gap-1"
                style={{ borderColor: catColor[c], color: catColor[c], background: locked ? `${catColor[c]}26` : 'transparent' }}>
                {locked ? <Lock className="w-3 h-3" /> : null} Lock {c}
              </button>
            );
          })}
        </div>

        {/* chaos meter */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="flex items-center gap-1 font-bold" style={{ color: chaosColor }}><AlertTriangle className="w-3.5 h-3.5" /> CHAOS METER</span>
            <span className="font-black" style={{ color: chaosColor }}>{round.chaos}/100</span>
          </div>
          <Meter value={round.chaos} color={chaosColor} height="h-2.5" />
        </div>

        {/* guess input */}
        <GlassCard className="mt-4 p-2 flex items-center" glow={NEON.cyan}>
          <input value={guess} onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitGuess(false)}
            placeholder="Type your guess..." className="flex-1 bg-transparent text-xl font-bold outline-none px-3 py-3 placeholder:text-white/30 italic" />
          {guess && <button onClick={() => setGuess('')} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center mr-1"><X className="w-4 h-4 text-white/60" /></button>}
        </GlassCard>

        <div className="flex items-stretch gap-2.5 mt-3">
          <GlossyButton onClick={() => submitGuess(false)} className="flex-1 py-4 text-2xl"><Lock className="w-5 h-5" /> GUESS</GlossyButton>
          <button onClick={() => applyHint('first-letter')} className="relative w-20 rounded-2xl bg-teal-500/15 border-2 border-teal-400/50 text-teal-300 flex flex-col items-center justify-center active:scale-95">
            <Lightbulb className="w-6 h-6 trey-glow" />
            <span className="text-[11px] font-black mt-0.5">HINT</span>
            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black border border-yellow-400 text-yellow-300 text-xs font-black flex items-center justify-center">{hintsLeft}</span>
          </button>
        </div>

        {/* trap + reveal + secondary hints */}
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          <button onClick={() => submitGuess(true)} disabled={round.trapUsed}
            className="rounded-full py-3 font-black text-white active:scale-95 disabled:opacity-40 flex items-center justify-center gap-1.5"
            style={{ background: 'linear-gradient(95deg,#FF3D6E,#FF7A3D)', boxShadow: '0 0 18px rgba(255,80,80,.4)' }}>
            <Zap className="w-4 h-4" /> NOUN TRAP x1.5
          </button>
          <button onClick={revealNext} disabled={round.revealedSignals >= 3}
            className="rounded-full py-3 font-bold bg-black/40 border border-white/15 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-1.5 text-sm">
            <Eye className="w-4 h-4 text-purple-400" /> Reveal Next
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
          <button onClick={() => applyHint('letter-count')} className="rounded-lg bg-black/40 border border-white/10 py-1.5 active:scale-95">Letter count</button>
          <button onClick={() => applyHint('remove-category')} className="rounded-lg bg-black/40 border border-white/10 py-1.5 active:scale-95">Remove lane</button>
          <button onClick={() => applyHint('hot-cold')} className="rounded-lg bg-black/40 border border-white/10 py-1.5 active:scale-95">Hot / Cold</button>
        </div>

        {round.wrongGuesses.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {round.wrongGuesses.map((w, i) => <span key={i} className="text-xs bg-red-500/15 text-red-300 border border-red-500/30 rounded-full px-2 py-0.5 line-through">{w}</span>)}
          </div>
        )}

        {/* streak bonus chip */}
        {streak > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3 text-sm">
            <Flame className="w-4 h-4 text-orange-400" /> <span className="text-white/70 font-bold">Streak Bonus</span>
            <span className="trey-glass rounded-full px-3 py-0.5 font-black text-yellow-300">x{Math.min(streak + 1, 5)}</span>
          </div>
        )}

        {/* footer bar */}
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          <button onClick={onExit} className="rounded-2xl bg-black/40 border border-yellow-500/40 py-2.5 flex flex-col items-center gap-0.5 active:scale-95">
            <LogOut className="w-5 h-5 text-yellow-400" /><span className="text-[10px] font-bold text-yellow-300">EXIT</span>
          </button>
          <div className="rounded-2xl bg-black/40 border border-white/10 py-2.5 flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-bold text-white/40">WIN STREAK</span>
            <span className="flex items-center gap-1 font-black"><Flame className="w-4 h-4 text-orange-400" />{streak}</span>
          </div>
          <button onClick={onExit} className="rounded-2xl bg-black/40 border border-white/10 py-2.5 flex flex-col items-center gap-0.5 active:scale-95">
            <Trophy className="w-5 h-5 text-yellow-400" /><span className="text-[10px] font-bold text-white/60">LEADERBOARD</span>
          </button>
        </div>
      </div>
    </ScreenWrap>
  );
};

export default TreynounChaseScreen;
