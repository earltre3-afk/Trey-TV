import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ScreenWrap,
  TreyHeader,
  GlossyButton,
  GlassCard,
  NeonRing,
  Meter,
  catColor,
  NEON,
} from "../components/TreyShell";
import { ChaosEvent, HintType, NounType, TreynounRoundState } from "../treynounTypes";
import { CHAOS_VALUES, calculateChaos } from "../treynounScoring";
import { isCorrectGuess, isCloseGuess, normalizeGuess } from "../treynounUtils";
import {
  Lock,
  Flame,
  Lightbulb,
  Eye,
  Zap,
  Trophy,
  AlertTriangle,
  X,
  LogOut,
  Activity,
  Check,
} from "lucide-react";

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

const cats: NounType[] = ["person", "place", "thing"];

const TreynounChaseScreen: React.FC<Props> = ({
  round: initial,
  roundNumber,
  totalRounds,
  totalScore,
  streak,
  onWin,
  onLose,
  onExit,
}) => {
  const [round, setRound] = useState<TreynounRoundState>(initial);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const endedRef = useRef(false);
  const elapsedRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRound((r) => {
        if (endedRef.current || r.result !== "pending") return r;
        const timeLeft = r.timeLeft - 1;
        elapsedRef.current += 1;
        let revealedSignals = r.revealedSignals;
        if (elapsedRef.current >= 30 && revealedSignals < 3) revealedSignals = 3;
        else if (elapsedRef.current >= 15 && revealedSignals < 2) revealedSignals = 2;
        let events = r.chaosEvents;
        if (timeLeft === 10)
          events = [
            ...events,
            { reason: "Timer low", amount: CHAOS_VALUES.lowTimer, at: Date.now() },
          ];
        const chaos = calculateChaos(events);
        const next = { ...r, timeLeft, revealedSignals, chaosEvents: events, chaos };
        if (timeLeft <= 0) {
          endedRef.current = true;
          const lost = {
            ...next,
            timeLeft: 0,
            result: "lost" as const,
            lossReason: "Time ran out",
          };
          setTimeout(() => onLose(lost, "Time ran out"), 50);
          return lost;
        }
        if (chaos >= 100) {
          endedRef.current = true;
          const lost = { ...next, result: "lost" as const, lossReason: "Chaos Meter filled" };
          setTimeout(() => onLose(lost, "Chaos Meter filled"), 50);
          return lost;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onLose]);

  const addChaos = (
    reason: string,
    amount: number,
    base: TreynounRoundState,
  ): TreynounRoundState => {
    const events: ChaosEvent[] = [...base.chaosEvents, { reason, amount, at: Date.now() }];
    return { ...base, chaosEvents: events, chaos: calculateChaos(events) };
  };
  const finishLose = (r: TreynounRoundState, reason: string) => {
    if (endedRef.current) return;
    endedRef.current = true;
    setTimeout(() => onLose({ ...r, result: "lost", lossReason: reason }, reason), 50);
  };

  const handleCategoryLock = (cat: NounType) => {
    if (round.lockedCategory) return;
    const correct = cat === round.category;
    setRound((r) => {
      let next: TreynounRoundState = { ...r, lockedCategory: cat, categoryLockCorrect: correct };
      if (correct) {
        toast.success("Category Locked! +25 points");
        setFeedback("Getting warmer");
      } else {
        next = addChaos("Wrong category lock", CHAOS_VALUES.wrongCategory, next);
        toast.error("Wrong category! +15 Chaos");
        setFeedback("Chaos rising");
        if (next.chaos >= 100) finishLose(next, "Chaos Meter filled");
      }
      return next;
    });
  };

  const submitGuess = (trap = false) => {
    const g = guess.trim();
    if (!g || endedRef.current) return;
    if (trap && round.trapUsed) {
      toast.error("Noun Trap already used this round.");
      return;
    }
    if (isCorrectGuess(g, round.targetNoun)) {
      endedRef.current = true;
      setRound((r) => {
        const won = {
          ...r,
          result: "won" as const,
          trapUsed: trap || r.trapUsed,
          trapCorrect: trap ? true : r.trapCorrect,
        };
        setTimeout(() => onWin(won), 50);
        return won;
      });
      return;
    }
    setRound((r) => {
      const repeated = r.wrongGuesses.map(normalizeGuess).includes(normalizeGuess(g));
      let next = { ...r, wrongGuesses: [...r.wrongGuesses, g] };
      let fbText = "";
      if (trap) {
        next = { ...next, trapUsed: true, trapCorrect: false };
        next = addChaos("Noun Trap miss", CHAOS_VALUES.trapWrong, next);
        fbText = "Trap missed!";
        toast.error("Trap missed! +35 Chaos");
      } else {
        const amt = repeated ? CHAOS_VALUES.repeatedWrong : CHAOS_VALUES.wrongGuess;
        next = addChaos(repeated ? "Repeated wrong guess" : "Wrong guess", amt, next);
        if (isCloseGuess(g, round.targetNoun)) {
          fbText = "Close!";
          toast("Close! You are hot.");
        } else {
          fbText = repeated
            ? "Chaos rising"
            : Math.abs(g.length - round.targetNoun.length) <= 2
              ? "Getting warmer"
              : "Cold";
          toast.error(repeated ? "Repeated guess! +20 Chaos" : `Wrong! +15 Chaos`);
        }
      }
      setFeedback(fbText);
      if (next.chaos >= 100) finishLose(next, "Chaos Meter filled");
      return next;
    });
    setGuess("");
  };

  const revealNext = () => {
    if (round.revealedSignals >= 3) return;
    setRound((r) => {
      let next = { ...r, revealedSignals: r.revealedSignals + 1, earlyReveals: r.earlyReveals + 1 };
      next = addChaos("Early clue reveal", CHAOS_VALUES.earlyReveal, next);
      toast("Signal revealed early. Clue bonus reduced.");
      setFeedback("Chaos rising");
      if (next.chaos >= 100) finishLose(next, "Chaos Meter filled");
      return next;
    });
  };

  const applyHint = (type: HintType) => {
    if (round.hintsUsed.includes(type)) {
      toast("Hint already used.");
      return;
    }
    setRound((r) => {
      let next = { ...r, hintsUsed: [...r.hintsUsed, type] };
      next = addChaos("Hint used", CHAOS_VALUES.hint, next);
      const t = r.targetNoun;
      if (type === "first-letter") toast(`First letter: ${t[0].toUpperCase()}`);
      else if (type === "letter-count") toast(`Letters: ${t.replace(/ /g, "").length}`);
      else if (type === "remove-category")
        toast(`It's NOT a ${cats.filter((c) => c !== r.category)[0]}.`);
      else toast(`You're getting warmer with the trail...`);
      setFeedback("Chaos rising");
      if (next.chaos >= 100) finishLose(next, "Chaos Meter filled");
      return next;
    });
  };

  const handleClueClick = (sId: number) => {
    if (round.revealedSignals === sId - 1) {
      revealNext();
    } else {
      toast.error("Unlock the signals in order!");
    }
  };

  const getChaosConfig = (val: number) => {
    if (val >= 70) return { color: "#EF4444", label: "DANGER STATE", class: "animate-pulse" };
    if (val >= 40) return { color: "#F59E0B", label: "WARNING GLOW", class: "" };
    return { color: "#22D3EE", label: "CALM GLOW", class: "" };
  };

  const chaosConf = getChaosConfig(round.chaos);
  const col = catColor[round.category];

  return (
    <ScreenWrap>
      <TreyHeader />
      <div className="flex-1 overflow-y-auto trey-scroll px-4 pb-4 trey-rise">
        {/* top rings + title */}
        <div className="flex items-start justify-between mt-4">
          <NeonRing
            value={round.timeLeft}
            max={round.maxTime}
            color={round.timeLeft <= 10 ? "#EF4444" : NEON.cyan}
            label="TIME LEFT"
            big={round.timeLeft}
            sub="SEC"
          />
          <div className="text-center pt-2">
            <h1 className="text-4xl font-black leading-[0.85] tracking-tight">
              <span className="text-white drop-shadow">Chase the</span>
              <br />
              <span className="trey-title text-5xl">Noun</span>
            </h1>
            <div className="mt-2.5 inline-block bg-[#110e29]/50 border border-white/5 rounded-full px-3.5 py-1 text-[11px] font-bold text-white/80">
              Every noun leaves a trail.
            </div>
          </div>
          <NeonRing
            value={totalScore}
            max={Math.max(totalScore, 2000)}
            color={NEON.gold}
            label="SCORE"
            big={<span className="text-base">{totalScore}</span>}
            sub={undefined}
          />
        </div>

        {/* signal cards */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {round.signals.map((s) => {
            const open = round.revealedSignals >= s.id;
            const isClickable = round.revealedSignals === s.id - 1;
            const color = ["#FFB800", "#00F0FF", "#FF00E5"][s.id - 1];

            return (
              <div
                key={s.id}
                onClick={open ? undefined : () => handleClueClick(s.id)}
                className={`relative rounded-3xl border-2 p-3 min-h-[160px] flex flex-col transition-all duration-300 ${!open && isClickable ? "cursor-pointer hover:border-purple-500/50 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]" : ""}`}
                style={{
                  borderColor: open ? color : "rgba(255, 255, 255, 0.08)",
                  background: open
                    ? `linear-gradient(180deg, ${color}20, ${color}05)`
                    : "rgba(5, 5, 13, 0.6)",
                  boxShadow: open
                    ? `0 0 25px ${color}22, inset 0 1px 0 rgba(255,255,255,0.05)`
                    : "none",
                }}
              >
                <div
                  className="w-7 h-7 rounded-xl border-2 flex items-center justify-center text-xs font-black shrink-0 transition-transform duration-300"
                  style={{
                    borderColor: open ? color : "rgba(255,255,255,0.2)",
                    color: open ? color : "rgba(255,255,255,0.4)",
                    background: open ? `${color}15` : "transparent",
                    transform: open ? "scale(1.05)" : "none",
                  }}
                >
                  {s.id}
                </div>

                {open ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center mt-2 animate-[trey-screen-enter_0.35s_ease-out]">
                    <Activity
                      className="w-7 h-7 mb-2"
                      style={{ color, filter: `drop-shadow(0 0 6px ${color})` }}
                    />
                    <div className="text-xs font-bold leading-tight text-white/95 px-1">
                      {s.text}
                    </div>
                    <div className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-widest mt-2">
                      Active
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-white/30 select-none">
                    <Lock
                      className={`w-6 h-6 mb-2 ${isClickable ? "text-purple-400 animate-pulse" : "text-white/20"}`}
                    />
                    <span className="text-[9px] font-black uppercase tracking-wider text-center px-1">
                      {s.id === 2 ? "Signal 2" : "Signal 3"}
                    </span>
                    <span className="text-[8px] opacity-75 text-center mt-0.5">
                      {isClickable ? "Tap to Force (+5 Chaos)" : "Locked"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* round dots */}
        <div className="text-center mt-5 text-xs font-black tracking-wider text-white/45">
          ROUND {roundNumber}/{totalRounds}
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-1.5">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full transition"
              style={{
                background:
                  i + 1 === roundNumber
                    ? NEON.gold
                    : i + 1 < roundNumber
                      ? "#00F0FF"
                      : "rgba(255,255,255,0.15)",
                boxShadow: i + 1 === roundNumber ? `0 0 8px ${NEON.gold}` : "none",
              }}
            />
          ))}
        </div>

        {/* category lock */}
        <div className="mt-5 bg-black/40 border border-white/5 rounded-2xl p-3.5">
          <div className="text-[10px] font-black text-white/45 tracking-widest mb-2 uppercase">
            Category Lock lane (Once per round)
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {cats.map((c) => {
              const isSelected = round.lockedCategory === c;
              const isLocked = !!round.lockedCategory;
              const isCorrect = round.categoryLockCorrect;

              let borderStyle = `1.5px solid ${catColor[c]}`;
              let bgStyle = "transparent";
              let textColor = catColor[c];
              let glowStyle = "none";

              if (isLocked) {
                if (isSelected) {
                  if (isCorrect) {
                    borderStyle = "2px solid #22C55E";
                    bgStyle = "rgba(34, 197, 94, 0.15)";
                    textColor = "#4ADE80";
                    glowStyle = "0 0 15px rgba(34, 197, 94, 0.4)";
                  } else {
                    borderStyle = "2px solid #EF4444";
                    bgStyle = "rgba(239, 68, 68, 0.15)";
                    textColor = "#F87171";
                    glowStyle = "0 0 15px rgba(239, 68, 68, 0.4)";
                  }
                } else {
                  borderStyle = "1px solid rgba(255,255,255,0.03)";
                  bgStyle = "rgba(0,0,0,0.3)";
                  textColor = "rgba(255,255,255,0.15)";
                }
              }

              return (
                <button
                  key={c}
                  onClick={() => handleCategoryLock(c)}
                  disabled={isLocked}
                  className="rounded-2xl py-3 font-extrabold capitalize text-xs transition-all duration-300 active:scale-95 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1.5"
                  style={{
                    border: borderStyle,
                    color: textColor,
                    background: bgStyle,
                    boxShadow: glowStyle,
                  }}
                >
                  {isSelected ? (
                    isCorrect ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-green-400">
                        <Check className="w-3.5 h-3.5" /> SECURED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black text-red-400">
                        <X className="w-3.5 h-3.5" /> MISSED
                      </span>
                    )
                  ) : (
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 opacity-60" /> {c}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* chaos meter */}
        <div className="mt-5 bg-black/40 border border-white/5 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span
              className={`flex items-center gap-1.5 font-black tracking-wider ${chaosConf.class}`}
              style={{ color: chaosConf.color }}
            >
              <AlertTriangle className="w-4 h-4" /> {chaosConf.label}
            </span>
            <span className="font-black text-sm" style={{ color: chaosConf.color }}>
              {round.chaos} / 100
            </span>
          </div>
          <Meter value={round.chaos} color={chaosConf.color} height="h-3" />
        </div>

        {/* guess input */}
        <div className="mt-5">
          <div className="text-[10px] font-black text-white/45 tracking-widest mb-2 uppercase">
            LANE GUESS INPUT
          </div>
          <GlassCard className="p-2.5 flex items-center bg-black/50" glow={NEON.cyan}>
            <input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitGuess(false)}
              placeholder="Type target noun here..."
              className="flex-1 bg-transparent text-xl font-bold outline-none px-3 py-3 placeholder:text-white/20 italic"
            />
            {guess && (
              <button
                onClick={() => setGuess("")}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center mr-1"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            )}
          </GlassCard>
        </div>

        {/* guess feedback tag */}
        {feedback && (
          <div
            className="mt-2 text-center text-xs font-black tracking-wide animate-pulse"
            style={{
              color: feedback === "Close!" || feedback === "Getting warmer" ? "#F59E0B" : "#EF4444",
            }}
          >
            FEEDBACK: {feedback.toUpperCase()}
          </div>
        )}

        {/* lock guess and trap panel */}
        <div className="flex items-stretch gap-3 mt-4">
          <GlossyButton onClick={() => submitGuess(false)} className="flex-1 py-4 text-2xl">
            <Lock className="w-5 h-5 mr-1" /> LOCK IT IN
          </GlossyButton>

          <div className="relative flex-1 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-500 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-300" />
            <button
              onClick={() => submitGuess(true)}
              disabled={round.trapUsed}
              className="relative w-full h-full rounded-full font-black text-white active:scale-95 disabled:opacity-40 flex flex-col items-center justify-center leading-none"
              style={{
                background: "linear-gradient(95deg,#FF3D6E,#FF7A3D)",
                boxShadow: "0 0 18px rgba(255,80,80,.4)",
              }}
            >
              <div className="flex items-center gap-1.5 text-base">
                <Zap className="w-4 h-4 animate-pulse" /> NOUN TRAP x1.5
              </div>
              <span className="text-[8px] font-bold text-white/70 uppercase tracking-widest mt-1">
                Risk multiplier. Miss = +35 Chaos
              </span>
            </button>
          </div>
        </div>

        {/* hints section */}
        <div className="mt-5 bg-black/40 border border-white/5 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="flex items-center gap-1.5 font-black text-teal-400 tracking-wider">
              <Lightbulb className="w-4 h-4" /> AVAILABLE HINTS
            </span>
            <span className="text-[10px] text-white/40 font-bold uppercase">
              Points penalty applies
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => applyHint("first-letter")}
              disabled={round.hintsUsed.includes("first-letter")}
              className="rounded-2xl border border-white/10 bg-black/40 p-3 flex flex-col items-start gap-1 transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed hover:border-teal-500/30 text-left"
            >
              <span className="text-xs font-extrabold text-teal-300">Reveal First Letter</span>
              <span className="text-[9px] text-white/50">
                <strong className="text-red-400 font-extrabold">-15 pts</strong> - +10 Chaos
              </span>
            </button>

            <button
              onClick={() => applyHint("letter-count")}
              disabled={round.hintsUsed.includes("letter-count")}
              className="rounded-2xl border border-white/10 bg-black/40 p-3 flex flex-col items-start gap-1 transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed hover:border-teal-500/30 text-left"
            >
              <span className="text-xs font-extrabold text-teal-300">Letter Count</span>
              <span className="text-[9px] text-white/50">
                <strong className="text-red-400 font-extrabold">-10 pts</strong> - +10 Chaos
              </span>
            </button>

            <button
              onClick={() => applyHint("remove-category")}
              disabled={round.hintsUsed.includes("remove-category")}
              className="rounded-2xl border border-white/10 bg-black/40 p-3 flex flex-col items-start gap-1 transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed hover:border-teal-500/30 text-left"
            >
              <span className="text-xs font-extrabold text-teal-300">Remove Lane</span>
              <span className="text-[9px] text-white/50">
                <strong className="text-red-400 font-extrabold">-20 pts</strong> - +10 Chaos
              </span>
            </button>

            <button
              onClick={() => applyHint("hot-cold")}
              disabled={round.hintsUsed.includes("hot-cold")}
              className="rounded-2xl border border-white/10 bg-black/40 p-3 flex flex-col items-start gap-1 transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed hover:border-teal-500/30 text-left"
            >
              <span className="text-xs font-extrabold text-teal-300">Hot / Cold Trail</span>
              <span className="text-[9px] text-white/50">
                <strong className="text-red-400 font-extrabold">-10 pts</strong> - +10 Chaos
              </span>
            </button>
          </div>
        </div>

        {/* reveal next button */}
        <button
          onClick={revealNext}
          disabled={round.revealedSignals >= 3}
          className="w-full mt-3 rounded-2xl py-3.5 font-bold bg-black/40 border border-white/10 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-1.5 text-xs text-purple-300 hover:border-purple-500/20"
        >
          <Eye className="w-4 h-4" /> Reveal Next Signal Clue (+5 Chaos)
        </button>

        {/* wrong guess history list */}
        {round.wrongGuesses.length > 0 && (
          <div className="mt-4 bg-black/40 border border-white/5 rounded-2xl p-3.5">
            <div className="text-[10px] font-black text-white/45 tracking-widest mb-2 uppercase">
              WRONG GUESS HISTORY
            </div>
            <div className="flex flex-wrap gap-2">
              {round.wrongGuesses.map((w, i) => {
                const isClose = isCloseGuess(w, round.targetNoun);
                const isWarmer = Math.abs(w.length - round.targetNoun.length) <= 2;
                const badgeText = isClose ? "Close!" : isWarmer ? "Warmer" : "Cold";

                return (
                  <span
                    key={i}
                    className={`text-xs px-2.5 py-1.5 rounded-full border flex items-center gap-1.5 line-through ${isClose ? "bg-orange-500/10 text-orange-300 border-orange-500/30" : "bg-red-500/10 text-red-300 border-red-500/20"}`}
                  >
                    <span>{w}</span>
                    <span className="text-[8px] font-black uppercase no-underline opacity-75">
                      ({badgeText})
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* streak bonus chip */}
        {streak > 0 && (
          <div className="flex items-center justify-center gap-2 mt-4 text-sm">
            <Flame className="w-4 h-4 text-orange-400 animate-bounce" />{" "}
            <span className="text-white/70 font-black">Streak Bonus Active</span>
            <span className="trey-glass rounded-full px-3.5 py-0.5 font-black text-yellow-300">
              x{Math.min(streak + 1, 5)}
            </span>
          </div>
        )}

        {/* footer bar */}
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          <button
            onClick={onExit}
            className="rounded-2xl bg-black/40 border border-yellow-500/20 py-2.5 flex flex-col items-center gap-0.5 active:scale-95 text-yellow-300 hover:bg-yellow-500/5"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-bold">EXIT</span>
          </button>
          <div className="rounded-2xl bg-black/40 border border-white/10 py-2.5 flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-bold text-white/40">WIN STREAK</span>
            <span className="flex items-center gap-1 font-black">
              <Flame className="w-4 h-4 text-orange-400" />
              {streak}
            </span>
          </div>
          <button
            onClick={onExit}
            className="rounded-2xl bg-black/40 border border-white/10 py-2.5 flex flex-col items-center gap-0.5 active:scale-95 text-white/60"
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-[10px] font-bold">LEADERBOARD</span>
          </button>
        </div>
      </div>
    </ScreenWrap>
  );
};

export default TreynounChaseScreen;
