import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Check,
  Compass,
  Gamepad2,
  Layers3,
  Play,
  Radio,
  RefreshCw,
  Route,
  Sparkles,
  Tv,
  WandSparkles,
  Zap,
} from 'lucide-react';
import { PRESCRIBE_ME_PRIVACY_NOTICE } from '@/tradio/lib/content-feel/contentFeelPrivacyRules';
import {
  ARTIST_ROUTE_LABEL,
  QUIET_ROUTE_SUGGESTIONS,
  ROUTE_ME_QUESTIONS,
  ROUTE_ME_SURFACES,
  TRADIO_CHILD_RELATIONSHIP_COPY,
  generateMockRouteResult,
} from './routeMeData';
import {
  debugResetRouteMeDailyUsage,
  getRouteMeDailyUsage,
  recordRoutePrescription,
  saveRouteAgain,
} from './routeMeStorage';
import type {
  PrescribeMeAnswer,
  PrescribeMeDailyUsage,
  PrescribeMeFlowStatus,
  PrescribeMeQuestion,
  PrescribeMeRouteResult,
  RouteMePlatformLane,
} from './routeMeTypes';

interface RouteMePageProps {
  onBack?: () => void;
}

const laneIcons: Record<RouteMePlatformLane, React.FC<{ className?: string }>> = {
  trey_tv: Tv,
  tradio: Radio,
  fwd: Zap,
  storybook: Layers3,
  games: Gamepad2,
  trance: Sparkles,
  all: Compass,
};

const laneLabel = (lane: RouteMePlatformLane) =>
  lane === 'trey_tv' ? 'Trey TV' : lane === 'fwd' ? 'FWD' : lane === 'all' ? 'Any lane' : lane.charAt(0).toUpperCase() + lane.slice(1);

const PrescribeMeDailyLimitBadge: React.FC<{ usage: PrescribeMeDailyUsage }> = ({ usage }) => {
  const copy =
    usage.remaining === 0
      ? 'No prescriptions left today'
      : `${usage.remaining} ${usage.remaining === 1 ? 'prescription' : 'prescriptions'} left today`;
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
      <span className={`h-2 w-2 rounded-full ${usage.remaining > 0 ? 'bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]' : 'bg-rose-300'}`} />
      {copy}
    </div>
  );
};

const PrescribeMeProgress: React.FC<{ currentIndex: number; total: number }> = ({ currentIndex, total }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
      <span>Question {Math.min(currentIndex + 1, total)} of {total}</span>
      <span>{Math.round((currentIndex / total) * 100)}%</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-300 transition-all duration-500"
        style={{ width: `${Math.max(8, ((currentIndex + 1) / total) * 100)}%` }}
      />
    </div>
  </div>
);

const PrescribeMeQuestionCard: React.FC<{
  question: PrescribeMeQuestion;
  selected?: string;
  onAnswer: (answer: PrescribeMeAnswer) => void;
}> = ({ question, selected, onAnswer }) => (
  <section className="rounded-[28px] border border-white/10 bg-black/25 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl sm:p-6">
    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200/70">Prescribe Me</p>
    <h2 className="mt-2 text-2xl font-black tracking-tight text-white">{question.prompt}</h2>
    <div className="mt-5 flex flex-wrap gap-2.5">
      {question.answers.map((answer) => (
        <button
          key={answer.key}
          onClick={() => onAnswer({ questionKey: question.key, answerKey: answer.key, label: answer.label })}
          className={`rounded-full border px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
            selected === answer.key
              ? 'border-cyan-300/70 bg-cyan-300/15 text-white shadow-[0_0_22px_rgba(34,211,238,0.24)]'
              : 'border-white/10 bg-white/[0.04] text-white/72 hover:border-white/25 hover:bg-white/[0.08]'
          }`}
        >
          {answer.label}
        </button>
      ))}
    </div>
  </section>
);

const PrescribeMeQuestionFlow: React.FC<{
  onComplete: (answers: PrescribeMeAnswer[]) => void;
  onCancel: () => void;
}> = ({ onComplete, onCancel }) => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<PrescribeMeAnswer[]>([]);
  const question = ROUTE_ME_QUESTIONS[index];
  const selected = answers.find((answer) => answer.questionKey === question.key)?.answerKey;

  const handleAnswer = (answer: PrescribeMeAnswer) => {
    const nextAnswers = [...answers.filter((item) => item.questionKey !== answer.questionKey), answer];
    setAnswers(nextAnswers);
    if (index === ROUTE_ME_QUESTIONS.length - 1) {
      onComplete(nextAnswers);
      return;
    }
    setIndex((current) => current + 1);
  };

  return (
    <div className="space-y-4">
      <PrescribeMeProgress currentIndex={index} total={ROUTE_ME_QUESTIONS.length} />
      <PrescribeMeQuestionCard question={question} selected={selected} onAnswer={handleAnswer} />
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-xs font-bold uppercase tracking-[0.16em] text-white/45 hover:text-white">
          Cancel
        </button>
        <button
          disabled={index === 0}
          onClick={() => setIndex((current) => Math.max(0, current - 1))}
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/70 disabled:opacity-30"
        >
          Back
        </button>
      </div>
    </div>
  );
};

const PrescribeMeResultCard: React.FC<{
  result: PrescribeMeRouteResult;
  canRefine: boolean;
  onSave: () => void;
  onStartOver: () => void;
}> = ({ result, canRefine, onSave, onStartOver }) => {
  const Icon = laneIcons[result.platformLane];
  return (
    <section className="overflow-hidden rounded-[30px] border border-cyan-300/20 bg-gradient-to-br from-white/[0.1] via-white/[0.035] to-cyan-500/[0.04] shadow-[0_22px_70px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-3xl">
      <div className="relative min-h-[220px] p-5 sm:p-6">
        {result.imageUrl && <img src={result.imageUrl} alt="" className="absolute inset-y-0 right-0 h-full w-1/2 object-cover opacity-35" />}
        <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/55 to-transparent" />
        <div className="relative max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Icon className="h-3.5 w-3.5" /> {laneLabel(result.platformLane)}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-bold uppercase text-white/65">
              {result.confidence} confidence
            </span>
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">{result.title}</h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/72">{result.summary}</p>
          <p className="mt-4 max-w-lg rounded-2xl border border-white/10 bg-black/25 p-3 text-xs leading-relaxed text-white/66">
            {result.reason.headline} {result.reason.detail}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {result.reason.contentFeelHints.map((hint) => (
              <span key={hint} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-bold text-white/60">
                {hint}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-[0.1em] text-white shadow-[0_0_28px_rgba(168,85,247,0.35)]">
              <Play className="h-4 w-4 fill-white" /> {result.primaryCta}
            </button>
            <button
              onClick={onStartOver}
              disabled={!canRefine}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white/78 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RefreshCw className="h-4 w-4" /> {canRefine ? result.secondaryCta : 'No Refines Today'}
            </button>
            <button onClick={onSave} className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[0.08] px-5 py-3 text-sm font-bold text-cyan-100">
              <Bookmark className="h-4 w-4" /> Save Route
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const PrescribeMeSavedRoutes: React.FC<{
  usage: PrescribeMeDailyUsage;
  onView: (result: PrescribeMeRouteResult) => void;
}> = ({ usage, onView }) => (
  <section className="space-y-3">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-black text-white">Saved and recent routes</h2>
      <span className="text-xs font-bold text-white/45">Today</span>
    </div>
    {usage.savedRoutes.length === 0 ? (
      <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5 text-sm text-white/55">No saved routes yet today.</div>
    ) : (
      <div className="grid gap-3 md:grid-cols-2">
        {usage.savedRoutes.map((route) => (
          <button
            key={route.id}
            onClick={() => onView(route.result)}
            className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4 text-left transition hover:border-cyan-300/30 hover:bg-white/[0.07]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-black text-white">{route.result.title}</span>
              <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] font-bold uppercase text-white/45">{laneLabel(route.result.platformLane)}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/55">{route.result.reason.headline}</p>
          </button>
        ))}
      </div>
    )}
  </section>
);

const RouteMePlatformSection: React.FC<{ onPickLane: (lane: RouteMePlatformLane) => void }> = ({ onPickLane }) => (
  <section className="space-y-4">
    <div>
      <h2 className="text-lg font-black text-white">Universe lanes</h2>
      <p className="mt-1 text-sm text-white/52">Every lane can become a route, but only the explicit question flow spends a daily prescription.</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {ROUTE_ME_SURFACES.map((surface) => {
        const Icon = laneIcons[surface.id];
        return (
          <button
            key={surface.id}
            onClick={() => onPickLane(surface.id)}
            className="group rounded-[26px] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition duration-300 hover:border-white/25 hover:bg-white/[0.08]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${surface.accent} text-black shadow-[0_0_24px_rgba(255,255,255,0.08)]`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">{surface.eyebrow}</span>
            </div>
            <h3 className="mt-4 text-base font-black text-white">{surface.label}</h3>
            <p className="mt-2 min-h-[48px] text-xs leading-relaxed text-white/55">{surface.summary}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {surface.examples.map((example) => (
                <span key={example} className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-bold text-white/50">
                  {example}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  </section>
);

const QuietRouteSuggestionRail: React.FC = () => (
  <section className="space-y-4">
    <div>
      <h2 className="text-lg font-black text-white">Quiet routes for your current lane</h2>
      <p className="mt-1 text-sm text-white/52">Mock Content Feel suggestions. These do not count against the daily Prescribe Me limit.</p>
    </div>
    <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {QUIET_ROUTE_SUGGESTIONS.map((suggestion) => {
        const Icon = laneIcons[suggestion.lane];
        return (
          <article key={suggestion.id} className="w-[280px] shrink-0 rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200/70">
              <Icon className="h-4 w-4" /> {laneLabel(suggestion.lane)}
            </div>
            <h3 className="mt-3 text-base font-black text-white">{suggestion.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-white/55">{suggestion.summary}</p>
            <p className="mt-3 text-[11px] leading-relaxed text-white/45">{suggestion.reason}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {suggestion.feelTags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] font-bold text-white/45">{tag}</span>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  </section>
);

const RouteMeUniverseMap: React.FC = () => (
  <div className="rounded-[30px] border border-white/10 bg-black/20 p-5">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-black text-white">Route Me map</h2>
        <p className="mt-1 max-w-2xl text-sm text-white/52">
          Parent Route Me connects Trey TV, Tradio, FWD, Storybook, Games, future Trance, creator rooms, live events, and Song Wars.
        </p>
      </div>
      <div className="rounded-full border border-purple-300/20 bg-purple-300/10 px-3 py-2 text-xs font-bold text-purple-100">
        Parent prototype
      </div>
    </div>
    <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {ROUTE_ME_SURFACES.map((surface, index) => (
        <div key={surface.id} className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">0{index + 1}</span>
          <div className="mt-2 text-sm font-black text-white">{surface.label}</div>
        </div>
      ))}
    </div>
  </div>
);

export const RouteMePage: React.FC<RouteMePageProps> = ({ onBack }) => {
  const [usage, setUsage] = useState<PrescribeMeDailyUsage>(() => getRouteMeDailyUsage());
  const [status, setStatus] = useState<PrescribeMeFlowStatus>(usage.remaining > 0 ? 'idle' : 'limit_reached');
  const [activeResult, setActiveResult] = useState<PrescribeMeRouteResult | null>(usage.savedRoutes[0]?.result ?? null);

  const resultIntro = useMemo(() => {
    if (usage.remaining === 0) return 'View today\'s saved prescriptions, or explore quiet routes without spending a prescription.';
    return 'Answer five short questions and get one premium universe route.';
  }, [usage.remaining]);

  const startFlow = () => {
    if (usage.remaining <= 0) {
      setStatus('limit_reached');
      return;
    }
    setStatus('in_progress');
    setActiveResult(null);
  };

  const completeFlow = (answers: PrescribeMeAnswer[]) => {
    const result = generateMockRouteResult(answers);
    const nextUsage = recordRoutePrescription(result);
    setUsage(nextUsage);
    setActiveResult(result);
    setStatus('complete');
  };

  const handlePickLane = (lane: RouteMePlatformLane) => {
    if (usage.remaining <= 0) {
      setStatus('limit_reached');
      return;
    }
    const laneKey = lane === 'all' ? 'any' : lane;
    completeFlow([
      { questionKey: 'current_need', answerKey: 'discover', label: 'Discover something' },
      { questionKey: 'current_energy', answerKey: 'focused', label: 'Focused' },
      { questionKey: 'desired_shift', answerKey: 'match_my_mood', label: 'Match my mood' },
      { questionKey: 'platform_lane', answerKey: laneKey, label: laneLabel(lane) },
      { questionKey: 'content_type_preference', answerKey: lane === 'tradio' ? 'station' : 'video', label: lane === 'tradio' ? 'Station' : 'Video' },
    ]);
  };

  return (
    <div className="relative min-h-full overflow-hidden pb-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(217,70,239,0.18),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_42%)]" />
      <div className="relative space-y-8 px-4 pt-[max(2rem,env(safe-area-inset-top))] sm:px-6 lg:px-10">
        <header className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onBack}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/78 backdrop-blur-xl"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <PrescribeMeDailyLimitBadge usage={usage} />
          </div>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Route className="h-3.5 w-3.5" /> Universe routing system
            </div>
            <h1 className="mt-4 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">Route Me</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/68 sm:text-lg">
              Let Trey TV route the universe around what you need right now.
            </p>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.025] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-3xl sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-fuchsia-200/70">
                  <WandSparkles className="h-4 w-4" /> Prescribe Me
                </div>
                <h2 className="mt-2 text-2xl font-black text-white">Question-first route prescription</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/58">{resultIntro}</p>
              </div>
              <PrescribeMeDailyLimitBadge usage={usage} />
            </div>

            <div className="mt-6">
              {status === 'in_progress' ? (
                <PrescribeMeQuestionFlow onComplete={completeFlow} onCancel={() => setStatus(usage.remaining > 0 ? 'idle' : 'limit_reached')} />
              ) : activeResult ? (
                <div className="space-y-3">
                  {usage.remaining === 0 && (
                    <div className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.08] px-4 py-3 text-sm font-semibold text-rose-50">
                      No prescriptions left today. You can view and save today's routes, but a new question flow is locked until tomorrow.
                    </div>
                  )}
                  <PrescribeMeResultCard
                    result={activeResult}
                    canRefine={usage.remaining > 0}
                    onSave={() => setUsage(saveRouteAgain(activeResult))}
                    onStartOver={startFlow}
                  />
                </div>
              ) : (
                <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                  {usage.remaining > 0 ? (
                    <>
                      <p className="text-sm leading-relaxed text-white/60">
                        Prescribe Me asks first, then routes. It uses only this session's answers and mock Content Feel profiles in this pass.
                      </p>
                      <button
                        onClick={startFlow}
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-6 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_0_28px_rgba(168,85,247,0.35)]"
                      >
                        <Sparkles className="h-4 w-4" /> Start Question Flow
                      </button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm leading-relaxed text-white/62">
                        No prescriptions left today. You can still view saved results and quiet routes.
                      </p>
                      {usage.savedRoutes[0] && (
                        <button
                          onClick={() => {
                            setActiveResult(usage.savedRoutes[0].result);
                            setStatus('viewing_saved');
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[0.08] px-5 py-3 text-sm font-bold text-cyan-100"
                        >
                          <Compass className="h-4 w-4" /> View Today&apos;s Prescription
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="max-w-2xl text-[11px] leading-relaxed text-white/42">{PRESCRIBE_ME_PRIVACY_NOTICE}</p>
              <button
                onClick={() => {
                  const reset = debugResetRouteMeDailyUsage();
                  setUsage(reset);
                  setActiveResult(null);
                  setStatus('idle');
                }}
                className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/28 hover:text-white/60"
              >
                Debug reset local limit
              </button>
            </div>
          </div>

          <aside className="space-y-4 rounded-[32px] border border-white/10 bg-black/20 p-5 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-300/10">
                <Radio className="h-5 w-5 text-purple-200" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Tradio child lane</h2>
                <p className="text-xs text-white/48">Parent to child relationship</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/58">{TRADIO_CHILD_RELATIONSHIP_COPY}</p>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Check className="h-4 w-4 text-emerald-300" /> Tradio route example
              </div>
              <p className="mt-2 text-xs leading-relaxed text-white/52">
                Choosing Tradio can route to a station, {ARTIST_ROUTE_LABEL} artist station, track, Song Wars battle, show, beat, or DJ mix.
              </p>
            </div>
          </aside>
        </section>

        <RouteMeUniverseMap />
        <RouteMePlatformSection onPickLane={handlePickLane} />
        <QuietRouteSuggestionRail />
        <PrescribeMeSavedRoutes
          usage={usage}
          onView={(result) => {
            setActiveResult(result);
            setStatus('viewing_saved');
          }}
        />
      </div>
    </div>
  );
};

export default RouteMePage;
