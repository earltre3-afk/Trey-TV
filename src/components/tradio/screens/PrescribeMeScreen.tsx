import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Sparkles,
  Radio,
  ListMusic,
  Users,
  Play,
  RotateCcw,
  Swords,
  ChevronRight,
  Share2,
  RefreshCw,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { useSongWars } from '../../../contexts/SongWarsContext';
import { shareReference } from '../../../lib/share';
import {
  PRESCRIBE_ME_QUESTIONS,
  REFINEMENT_OPTIONS,
  getDailyUsageState,
  executeNewPrescription,
  resetDailyLimit,
  type UserAnswers,
  type Prescription,
  type RefinementOption,
} from '../services/prescribeMeService';

interface Props {
  onClose: () => void;
  onPlayPrescription: (answers: UserAnswers, title: string) => void;
  onOpenBattle: (warId: string) => void;
}

export default function PrescribeMeScreen({ onClose, onPlayPrescription, onOpenBattle }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<UserAnswers>>({});
  const [result, setResult] = useState<Prescription | null>(null);
  const [usageState, setUsageState] = useState(getDailyUsageState());
  const [activeRefinement, setActiveRefinement] = useState<string | null>(null);

  const { matchVibeBattle } = useSongWars();

  const total = PRESCRIBE_ME_QUESTIONS.length;
  const q = PRESCRIBE_ME_QUESTIONS[step];

  // Sync state on mount
  useEffect(() => {
    setUsageState(getDailyUsageState());
  }, []);

  const select = (value: string) => {
    if (!q) return;
    const next = { ...answers, [q.category]: value };
    setAnswers(next);
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      // Execute the prescription check
      const res = executeNewPrescription(next as UserAnswers);
      if (res.success && res.prescription) {
        setResult(res.prescription);
        setUsageState(getDailyUsageState());
      } else {
        // Fallback or limit hit alert (should be handled by screen block if started with 0)
        alert('Daily limit reached!');
      }
    }
  };

  const back = () => {
    if (result) {
      setResult(null);
      setActiveRefinement(null);
      return;
    }
    if (step > 0) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setResult(null);
    setActiveRefinement(null);
    setUsageState(getDailyUsageState());
  };

  const handleResetLimit = () => {
    resetDailyLimit();
    setUsageState(getDailyUsageState());
  };

  const applyRefinement = (refId: string) => {
    setActiveRefinement(refId);
  };

  // Vibe matcher helper for the Song Wars bridge
  const getVibeForAnswers = (ans: Partial<UserAnswers>) => {
    if (
      ans.currentNeed === 'feel_understood' ||
      ans.currentNeed === 'process' ||
      ans.emotionalState === 'heavy' ||
      ans.emotionalState === 'lonely'
    ) {
      return 'Heal me';
    }
    return 'Confident';
  };

  const matchedBattle = result ? matchVibeBattle(getVibeForAnswers(answers)) : undefined;

  // Determine gradient tone based on prescription route
  const getGradientForRoute = (routeType: string) => {
    switch (routeType) {
      case 'Station':
        return 'from-amber-600/40 via-yellow-700/30 to-black';
      case 'Playlist':
        return 'from-slate-600/40 via-slate-800/30 to-black';
      default:
        return 'from-amber-500/35 via-orange-600/25 to-black';
    }
  };

  // Modify title / description if refinement is active
  const displayTitle = result
    ? activeRefinement
      ? `${result.title} [Refined]`
      : result.title
    : '';

  const displayDescription = result
    ? activeRefinement
      ? `${result.description} (Adjusted for: ${
          REFINEMENT_OPTIONS.find((r) => r.id === activeRefinement)?.label.toLowerCase() || ''
        })`
      : result.description
    : '';

  const isLimitHit = usageState.prescriptionsLeftToday <= 0 && !result;

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <button
            onClick={back}
            className="w-9 h-9 rounded-full bg-white/[0.06] border border-amber-400/20 flex items-center justify-center text-white active:scale-95 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="tradio-chrome font-bold tracking-wide text-sm">PRESCRIBE ME</span>
          </div>
        </div>

        <div className="text-[11px] font-bold text-amber-400/60 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
          {usageState.prescriptionsLeftToday} left today
        </div>
      </div>

      {isLimitHit ? (
        // Limit Hit State
        <div className="flex-1 px-5 py-12 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/40 flex items-center justify-center mb-6 animate-pulse">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-white text-xl font-black mb-3">Daily Limit Reached</h2>
          <p className="text-white/60 text-sm max-w-xs mb-8">
            You have used your 2 daily personalized AI prescriptions. Limits reset every 24 hours to keep the network load balanced.
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={handleResetLimit}
              className="w-full py-3.5 rounded-2xl tradio-gold-gradient text-black font-black flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-amber-500/25"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Limits (Demo Mode)
            </button>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white/80 font-bold active:scale-[0.98] transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      ) : !result ? (
        // Wizard Form State
        <div className="flex-1 px-5 pb-8 flex flex-col">
          <div className="flex gap-1.5 mb-7 mt-4">
            {PRESCRIBE_ME_QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i <= step ? 'tradio-gold-gradient' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <p className="text-amber-400/70 text-xs font-semibold tracking-widest mb-2">
            STEP {step + 1} OF {total}
          </p>
          <h2 className="text-white text-2xl font-black leading-tight mb-7">{q?.text}</h2>

          <div className="grid grid-cols-2 gap-3 min-h-0 overflow-y-auto pr-1">
            {q?.options.map((o) => {
              const active = answers[q.category] === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => select(o.value)}
                  className={`relative py-4 px-3 rounded-2xl border text-xs font-bold transition active:scale-[0.97] overflow-hidden text-left flex flex-col justify-between min-h-[80px] ${
                    active
                      ? 'border-amber-400/60 text-amber-100 bg-amber-500/10'
                      : 'bg-white/[0.04] border-white/10 text-white/80 hover:border-amber-400/40'
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 bg-gradient-to-br from-amber-500/25 to-transparent" />
                  )}
                  <span className="relative z-10">{o.label}</span>
                  <span className="text-[10px] text-white/30 self-end">Select</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // Result Prescription Display
        <div className="flex-1 px-5 pb-10 pt-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <p className="text-amber-400/70 text-xs font-semibold tracking-widest">
              YOUR PERSONALIZED PRESCRIPTION
            </p>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
              {result.confidenceLabel}
            </span>
          </div>

          {/* Hero prescription card */}
          <div className="relative rounded-[28px] overflow-hidden border border-amber-400/40 p-6 mb-6">
            <div className={`absolute inset-0 bg-gradient-to-br ${getGradientForRoute(result.routeType)}`} />
            <div className="absolute -top-12 -right-10 w-44 h-44 rounded-full bg-amber-400/30 blur-3xl" />
            <div className="absolute -bottom-10 -left-8 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl" />

            {/* Faux animated waveform */}
            <div className="absolute bottom-0 left-0 right-0 h-14 flex items-end gap-1 px-5 opacity-30">
              {Array.from({ length: 28 }).map((_, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-full bg-amber-300 animate-pulse"
                  style={{
                    height: `${20 + ((i * 37) % 80)}%`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-black/40 border border-amber-400/40 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </span>
                <span className="tradio-chrome text-[11px] font-bold tracking-[0.2em]">
                  PRESCRIBED BY TRADIO AI
                </span>
              </div>
              <h2 className="text-white text-2xl font-black leading-tight mb-1">{displayTitle}</h2>
              <span className="inline-block text-amber-200/90 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/30 border border-amber-400/30 mb-3">
                Route: {result.routeType}
              </span>
              <p className="text-white/75 text-sm mb-4 leading-snug">{displayDescription}</p>
              <p className="text-amber-400/60 text-xs italic mb-6">{result.reason}</p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onPlayPrescription(answers as UserAnswers, result.title)}
                  className="flex-1 tradio-gold-gradient text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-amber-500/30"
                >
                  <Play className="w-5 h-5 animate-pulse" fill="currentColor" />
                  {result.primaryCtaLabel}
                </button>
                <button
                  onClick={() =>
                    shareReference(
                      `Tradio AI prescribed me "${result.title}"\n${result.description}\nMatch score: ${result.confidenceLabel}`,
                      'Prescription details copied'
                    )
                  }
                  className="w-14 h-[52px] rounded-2xl bg-black/30 border border-amber-400/40 flex items-center justify-center text-amber-200 active:scale-95 transition"
                  aria-label="Share prescription"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Refinements Panel */}
          <div className="tradio-glass rounded-2xl p-4 border border-white/[0.08] mb-6">
            <h3 className="text-white font-bold text-xs tracking-wider mb-3 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              FINE-TUNE PRESCRIPTION
            </h3>
            <div className="flex flex-wrap gap-2">
              {REFINEMENT_OPTIONS.map((opt) => {
                const isCurrent = activeRefinement === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => applyRefinement(opt.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
                      isCurrent
                        ? 'border-amber-400 bg-amber-400/20 text-white font-semibold'
                        : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-amber-400/30'
                    }`}
                  >
                    {isCurrent && <Check className="w-3 h-3 text-amber-400" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vibe Battle Bridge */}
          {matchedBattle && (
            <button
              onClick={() => onOpenBattle(matchedBattle.id)}
              className="w-full relative rounded-2xl overflow-hidden border border-cyan-400/30 p-4 text-left active:scale-[0.99] transition mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0b1224] via-slate-950 to-black" />
              <div className="absolute -top-8 right-0 w-28 h-28 rounded-full bg-cyan-500/20 blur-2xl" />
              <div className="relative flex items-center gap-3 z-10">
                <span className="w-11 h-11 rounded-xl bg-black/50 border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-[0_0_18px_-4px_rgba(34,211,238,0.6)]">
                  <Swords className="w-5 h-5 text-cyan-300" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-cyan-300/80 text-[10px] font-bold tracking-widest">
                    SONG WARS BATTLE MATCH
                  </p>
                  <p className="text-white font-bold text-sm truncate">{matchedBattle.title}</p>
                  <p className="text-white/45 text-[11px] truncate">
                    {matchedBattle.left.name} vs {matchedBattle.right.name}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 shrink-0" />
              </div>
            </button>
          )}

          <div className="space-y-3">
            <ResultRow icon={Radio} label="Personalized Hub" value={`Trey TV ${result.routeType} Flow`} />
            <ResultRow icon={ListMusic} label="Playback Target" value={result.destination === 'live' ? 'Live Stream Feed' : 'Curated Beats'} />
          </div>

          <button
            onClick={restart}
            className="w-full mt-6 py-3.5 rounded-2xl border border-white/10 bg-white/[0.04] text-white/80 font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <RotateCcw className="w-4 h-4" />
            Request New Prescription
          </button>
        </div>
      )}
    </div>
  );
}

function ResultRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 tradio-glass rounded-2xl p-3.5 border border-white/[0.05]">
      <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-amber-400" />
      </div>
      <div className="min-w-0">
        <p className="text-white/45 text-[11px] font-semibold tracking-wide">{label}</p>
        <p className="text-white font-bold text-sm truncate">{value}</p>
      </div>
    </div>
  );
}
