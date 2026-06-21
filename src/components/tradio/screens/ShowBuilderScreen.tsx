import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  Cloud,
  Headphones,
  LoaderCircle,
  MessageSquare,
  Mic,
  Music,
  Play,
  Plus,
  Radio,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Volume2,
  WandSparkles,
  Zap,
} from 'lucide-react';
import { checkTradioAiReadiness, type TradioAiReadiness } from '@/lib/trey-i/aiReadiness.server';
import { generateRadioShow } from '@/lib/trey-i/tradioShowBuilder.server';
import {
  type ShowBuilderFormState,
  emptyForm,
  generateShowPlan,
  SEGMENT_LABELS,
  formatDuration,
} from '../services/showPlan';
import type { RadioShow, ShowSegment } from '../services/radioShowTypes';

interface Props {
  onClose: () => void;
}

type WizardStep = 'basics' | 'features' | 'generate' | 'preview';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const DRAFT_STORAGE_KEY = 'tradio.show-builder.drafts';
const STEPS: WizardStep[] = ['basics', 'features', 'generate', 'preview'];
const MOOD_OPTIONS = ['late-night', 'high-energy', 'chill', 'cinematic', 'underground', 'feel-good'];
const TONE_OPTIONS = ['warm, cinematic', 'hype, energetic', 'smooth, conversational', 'raw, underground', 'playful, fun'];
const SOURCE_OPTIONS = ['artist station plus Tradio catalog', 'fan requests only', 'Tradio trending', 'producer beats focus', 'curated by AI'];

const FEATURE_TOGGLES: {
  key: 'includeListenerRequests' | 'includeProducerBeatSpotlight' | 'includeArtistPremiere';
  label: string;
  detail: string;
  icon: React.ElementType;
}[] = [
  {
    key: 'includeListenerRequests',
    label: 'Fan request desk',
    detail: 'Build listener requests and shoutouts into the rundown.',
    icon: Star,
  },
  {
    key: 'includeProducerBeatSpotlight',
    label: 'Producer spotlight',
    detail: 'Reserve a focused block for beats and production notes.',
    icon: Headphones,
  },
  {
    key: 'includeArtistPremiere',
    label: 'Artist premiere',
    detail: 'Create a premium first-listen block with host setup.',
    icon: Sparkles,
  },
];

const SEGMENT_ICONS: Record<ShowSegment['type'], React.ElementType> = {
  intro: Mic,
  'music-block': Music,
  'host-talk': MessageSquare,
  'fan-request': Star,
  'producer-spotlight': Zap,
  'artist-premiere': Play,
  commercial: Volume2,
  poll: BarChart3,
  closing: Radio,
};

function normalizeGeneratedShow(result: Awaited<ReturnType<typeof generateRadioShow>>): RadioShow {
  return {
    ...result,
    status: result.status === 'scheduled' ? 'draft' : result.status,
  } as RadioShow;
}

export default function ShowBuilderScreen({ onClose }: Props) {
  const [step, setStep] = useState<WizardStep>('basics');
  const [form, setForm] = useState<ShowBuilderFormState>(emptyForm);
  const [show, setShow] = useState<RadioShow | null>(null);
  const [expandedSeg, setExpandedSeg] = useState<string | null>(null);
  const [readiness, setReadiness] = useState<TradioAiReadiness | null>(null);
  const [isCheckingAi, setIsCheckingAi] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const update = <K extends keyof ShowBuilderFormState>(key: K, val: ShowBuilderFormState[K]) =>
    setForm((current) => ({ ...current, [key]: val }));

  const runReadinessCheck = useCallback(async () => {
    setIsCheckingAi(true);
    try {
      const result = await checkTradioAiReadiness({ data: { probe: true } });
      setReadiness(result);
      return result;
    } catch {
      const unavailable: TradioAiReadiness = {
        provider: 'gemini',
        authMode: 'missing',
        configured: false,
        projectConfigured: false,
        location: null,
        model: 'gemini-2.5-flash',
        status: 'unavailable',
        live: false,
        checkedAt: new Date().toISOString(),
        message: 'The Tradio server health check could not be reached.',
      };
      setReadiness(unavailable);
      return unavailable;
    } finally {
      setIsCheckingAi(false);
    }
  }, []);

  useEffect(() => {
    void runReadinessCheck();
  }, [runReadinessCheck]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setSaveState('idle');

    try {
      const health = await runReadinessCheck();
      if (!health.live) {
        setGenerationError(`${health.message} A production-safe local rundown was created instead.`);
        setShow(generateShowPlan(form));
        setStep('preview');
        return;
      }

      const result = await generateRadioShow({ data: { form } });
      if (result.id !== 'ai-generated-show') {
        setGenerationError(
          'Gemini could not return a complete structured rundown. A production-safe local draft was created instead.',
        );
      }
      setShow(normalizeGeneratedShow(result));
      setStep('preview');
    } catch {
      setGenerationError('Gemini generation was interrupted. A local draft was created so your work was not lost.');
      setShow(generateShowPlan(form));
      setStep('preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const removeSeg = (id: string) => {
    if (!show) return;
    setShow({ ...show, segments: show.segments.filter((segment) => segment.id !== id) });
    setSaveState('idle');
  };

  const addTransition = () => {
    if (!show) return;
    const segment: ShowSegment = {
      id: `manual-${Date.now()}`,
      type: 'host-talk',
      title: 'Host Transition',
      duration: 60,
      description: 'A custom host break ready for scripting.',
      hostNotes: 'Bridge the previous music block into the next feature.',
      aiGenerated: false,
    };
    setShow({ ...show, segments: [...show.segments, segment] });
    setExpandedSeg(segment.id);
    setSaveState('idle');
  };

  const handleSave = () => {
    if (!show) return;
    setSaveState('saving');
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const drafts = Array.isArray(existing) ? existing : [];
      const savedDraft = {
        ...show,
        id: show.id === 'ai-generated-show' ? `show-${Date.now()}` : show.id,
        status: 'draft' as const,
        savedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify([savedDraft, ...drafts.filter((draft) => draft?.id !== savedDraft.id)].slice(0, 25)),
      );
      setShow(savedDraft);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  const totalTime = show
    ? show.segments.reduce((sum, segment) => sum + segment.duration, 0)
    : 0;

  const goBack = () => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex <= 0) onClose();
    else setStep(STEPS[currentIndex - 1]);
  };

  return (
    <div className="relative flex-1 min-h-0 overflow-y-auto bg-[#05040a] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -right-20 h-80 w-80 rounded-full bg-violet-600/20 blur-[110px]" />
        <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-amber-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl pb-8">
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#05040a]/90 px-5 pb-4 pt-3 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              aria-label="Go back"
              className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white transition active:scale-95"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black tracking-[0.3em] text-amber-300/75">TRADIO STUDIO</p>
              <h1 className="truncate text-lg font-black tracking-tight">AI Radio Show Builder</h1>
            </div>
            <AiStatusPill readiness={readiness} checking={isCheckingAi} />
          </div>

          <div className="mt-4 grid grid-cols-4 gap-1.5">
            {STEPS.map((item, index) => (
              <div
                key={item}
                className={`h-1 rounded-full transition-all duration-500 ${
                  STEPS.indexOf(step) >= index
                    ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-violet-400 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </header>

        {step === 'basics' && (
          <section className="space-y-6 px-5 pt-6 animate-tradio-fade-in">
            <BuilderHero
              eyebrow="Step 1 of 4"
              title="Build the identity of the show."
              description="Give the program director enough direction to shape the pacing, voice, and atmosphere."
            />

            <PremiumPanel>
              <FieldLabel>Show title</FieldLabel>
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-base font-bold text-white outline-none transition placeholder:text-white/25 focus:border-amber-300/50 focus:ring-4 focus:ring-amber-300/5"
                placeholder="Midnight Network Session"
                value={form.showName}
                onChange={(event) => update('showName', event.target.value)}
              />
            </PremiumPanel>

            <PremiumPanel>
              <FieldLabel>Target runtime</FieldLabel>
              <div className="grid grid-cols-5 gap-2">
                {[30, 60, 90, 120, 180].map((minutes) => (
                  <ChoiceButton
                    key={minutes}
                    active={form.showLength === minutes}
                    onClick={() => update('showLength', minutes)}
                  >
                    {minutes}
                  </ChoiceButton>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-white/35">Minutes of planned broadcast time</p>
            </PremiumPanel>

            <PremiumPanel>
              <FieldLabel>Show mood</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map((mood) => (
                  <PillButton
                    key={mood}
                    active={form.showMood === mood}
                    onClick={() => update('showMood', mood)}
                  >
                    {mood}
                  </PillButton>
                ))}
              </div>
            </PremiumPanel>

            <PremiumPanel>
              <FieldLabel>Host delivery</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((tone) => (
                  <PillButton
                    key={tone}
                    active={form.hostTone === tone}
                    onClick={() => update('hostTone', tone)}
                  >
                    {tone}
                  </PillButton>
                ))}
              </div>
            </PremiumPanel>

            <PrimaryButton onClick={() => setStep('features')}>
              Shape the format
              <Sparkles className="size-4" />
            </PrimaryButton>
          </section>
        )}

        {step === 'features' && (
          <section className="space-y-6 px-5 pt-6 animate-tradio-fade-in">
            <BuilderHero
              eyebrow="Step 2 of 4"
              title="Program the room."
              description="Choose where the music comes from and which live-radio moments the rundown must include."
            />

            <PremiumPanel>
              <FieldLabel>Music source</FieldLabel>
              <div className="space-y-2">
                {SOURCE_OPTIONS.map((source) => (
                  <button
                    type="button"
                    key={source}
                    onClick={() => update('musicSource', source)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                      form.musicSource === source
                        ? 'border-amber-300/45 bg-amber-300/10 text-amber-100'
                        : 'border-white/8 bg-black/25 text-white/55'
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </PremiumPanel>

            <PremiumPanel>
              <FieldLabel>Commercial windows</FieldLabel>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map((count) => (
                  <ChoiceButton
                    key={count}
                    active={form.commercialBreaks === count}
                    onClick={() => update('commercialBreaks', count)}
                  >
                    {count}
                  </ChoiceButton>
                ))}
              </div>
            </PremiumPanel>

            <div className="space-y-3">
              {FEATURE_TOGGLES.map(({ key, label, detail, icon: Icon }) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => update(key, !form[key])}
                  className={`flex w-full items-center gap-4 rounded-3xl border p-4 text-left transition ${
                    form[key]
                      ? 'border-violet-400/35 bg-violet-400/10 shadow-[0_18px_45px_-30px_rgba(167,139,250,0.8)]'
                      : 'border-white/8 bg-white/[0.035]'
                  }`}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/30">
                    <Icon className={`size-5 ${form[key] ? 'text-amber-300' : 'text-white/45'}`} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black">{label}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-white/40">{detail}</span>
                  </span>
                  <span
                    className={`grid size-6 place-items-center rounded-full border ${
                      form[key] ? 'border-amber-300 bg-amber-300 text-black' : 'border-white/20'
                    }`}
                  >
                    {form[key] && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                </button>
              ))}
            </div>

            <PrimaryButton onClick={() => setStep('generate')}>
              Open program director
              <WandSparkles className="size-4" />
            </PrimaryButton>
          </section>
        )}

        {step === 'generate' && (
          <section className="space-y-6 px-5 pt-6 animate-tradio-fade-in">
            <BuilderHero
              eyebrow="Step 3 of 4"
              title="Your program director is standing by."
              description="Tradio will verify the production AI connection, then create timing, host copy, transitions, features, and music blocks."
            />

            <AiReadinessCard
              readiness={readiness}
              checking={isCheckingAi}
              onRetry={() => void runReadinessCheck()}
            />

            <PremiumPanel>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <p className="text-xs font-black tracking-[0.2em] text-white/35">PRODUCTION BRIEF</p>
                  <p className="mt-1 text-lg font-black">{form.showName || 'Midnight Network Session'}</p>
                </div>
                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-right">
                  <p className="text-lg font-black text-amber-200">{form.showLength}</p>
                  <p className="text-[9px] font-black tracking-widest text-amber-200/55">MINUTES</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <SummaryTile label="Mood" value={form.showMood} />
                <SummaryTile label="Host" value={form.hostTone} />
                <SummaryTile label="Music" value={form.musicSource} />
                <SummaryTile label="Ad windows" value={String(form.commercialBreaks)} />
              </div>
            </PremiumPanel>

            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={isGenerating}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-3xl bg-gradient-to-r from-amber-300 via-yellow-400 to-violet-400 px-5 py-5 font-black text-black shadow-[0_22px_60px_-25px_rgba(251,191,36,0.9)] transition active:scale-[0.985] disabled:opacity-65"
            >
              <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-[120%]" />
              {isGenerating ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <WandSparkles className="size-5" />
              )}
              {isGenerating ? 'Building broadcast rundown...' : 'Generate production rundown'}
            </button>
          </section>
        )}

        {step === 'preview' && show && (
          <section className="space-y-5 px-5 pt-6 animate-tradio-fade-in">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(124,58,237,0.2),rgba(7,7,13,0.96)_48%,rgba(245,158,11,0.1))] p-5 shadow-[0_30px_80px_-45px_rgba(139,92,246,0.9)]">
              <div className="flex items-start gap-4">
                <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-amber-300/25 bg-amber-300/10">
                  <Radio className="size-7 text-amber-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black tracking-[0.25em] text-violet-200/55">MASTER RUNDOWN</p>
                  <h2 className="mt-1 text-2xl font-black leading-tight">{show.title}</h2>
                  <p className="mt-2 text-sm text-white/45">
                    {show.segments.length} segments / {formatDuration(totalTime)} programmed
                  </p>
                </div>
              </div>
            </div>

            {generationError && (
              <div className="flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/8 p-4 text-xs leading-relaxed text-amber-100/75">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" />
                {generationError}
              </div>
            )}

            <div className="space-y-3">
              {show.segments.map((segment, index) => {
                const Icon = SEGMENT_ICONS[segment.type] || Radio;
                const expanded = expandedSeg === segment.id;
                return (
                  <article
                    key={segment.id}
                    className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] backdrop-blur-xl"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedSeg(expanded ? null : segment.id)}
                      className="flex w-full items-center gap-3 p-4 text-left"
                    >
                      <span className="w-6 text-center text-[10px] font-black text-white/25">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-violet-300/15 bg-violet-400/10">
                        <Icon className="size-5 text-amber-300" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black">{segment.title}</span>
                        <span className="mt-0.5 block text-[11px] text-white/40">
                          {SEGMENT_LABELS[segment.type]} / {formatDuration(segment.duration)}
                        </span>
                      </span>
                      {expanded ? (
                        <ChevronUp className="size-4 text-white/35" />
                      ) : (
                        <ChevronDown className="size-4 text-white/35" />
                      )}
                    </button>

                    {expanded && (
                      <div className="space-y-3 border-t border-white/[0.06] px-4 pb-4 pt-3">
                        {segment.description && (
                          <p className="text-xs leading-relaxed text-white/55">{segment.description}</p>
                        )}
                        {segment.hostNotes && (
                          <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-3">
                            <p className="text-[9px] font-black tracking-[0.2em] text-amber-200/60">HOST CUE</p>
                            <p className="mt-1 text-xs leading-relaxed text-white/65">{segment.hostNotes}</p>
                          </div>
                        )}
                        {segment.script && (
                          <div className="rounded-2xl border border-violet-300/15 bg-violet-400/[0.06] p-3">
                            <p className="text-[9px] font-black tracking-[0.2em] text-violet-200/60">SCRIPT</p>
                            <p className="mt-1 text-xs leading-relaxed text-white/70">{segment.script}</p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeSeg(segment.id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-rose-300/70 transition hover:text-rose-300"
                        >
                          <Trash2 className="size-3.5" />
                          Remove segment
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              onClick={addTransition}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.025] py-3 text-sm font-bold text-white/55"
            >
              <Plus className="size-4" />
              Add host transition
            </button>

            <div className="space-y-3 pt-2">
              <PrimaryButton onClick={handleSave} disabled={saveState === 'saving'}>
                {saveState === 'saving' ? (
                  <LoaderCircle className="size-5 animate-spin" />
                ) : saveState === 'saved' ? (
                  <Check className="size-5" />
                ) : (
                  <Save className="size-5" />
                )}
                {saveState === 'saved' ? 'Draft saved to Tradio' : 'Save production draft'}
              </PrimaryButton>
              {saveState === 'error' && (
                <p className="text-center text-xs text-rose-300">This device blocked draft storage.</p>
              )}
              <button
                type="button"
                onClick={() => {
                  setShow(null);
                  setGenerationError(null);
                  setSaveState('idle');
                  setStep('basics');
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.035] py-3.5 text-sm font-bold text-white/65 transition active:scale-[0.985]"
              >
                Start a new show
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function AiStatusPill({
  readiness,
  checking,
}: {
  readiness: TradioAiReadiness | null;
  checking: boolean;
}) {
  const ready = readiness?.live;
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-black tracking-wider ${
        checking
          ? 'border-white/10 bg-white/[0.04] text-white/45'
          : ready
            ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-200'
            : 'border-amber-300/20 bg-amber-300/8 text-amber-200'
      }`}
    >
      {checking ? (
        <LoaderCircle className="size-3 animate-spin" />
      ) : ready ? (
        <ShieldCheck className="size-3" />
      ) : (
        <AlertTriangle className="size-3" />
      )}
      {checking ? 'CHECKING' : ready ? 'AI LIVE' : 'SAFE MODE'}
    </div>
  );
}

function AiReadinessCard({
  readiness,
  checking,
  onRetry,
}: {
  readiness: TradioAiReadiness | null;
  checking: boolean;
  onRetry: () => void;
}) {
  const ready = readiness?.live;
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(124,58,237,0.16),rgba(9,9,17,0.96))] p-5">
      <div className="flex items-start gap-4">
        <div
          className={`grid size-12 shrink-0 place-items-center rounded-2xl border ${
            ready
              ? 'border-emerald-300/25 bg-emerald-300/10'
              : 'border-amber-300/20 bg-amber-300/8'
          }`}
        >
          {checking ? (
            <LoaderCircle className="size-5 animate-spin text-violet-200" />
          ) : ready ? (
            <Cloud className="size-5 text-emerald-200" />
          ) : (
            <ShieldCheck className="size-5 text-amber-200" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black tracking-[0.25em] text-white/35">AI SYSTEM</p>
          <h3 className="mt-1 text-base font-black">
            {checking ? 'Running live production check' : ready ? 'Gemini production link verified' : 'Local safety mode is active'}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-white/45">
            {checking
              ? 'Testing the server-side provider without exposing credentials to the browser.'
              : readiness?.message || 'Waiting for the Tradio server.'}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <SummaryTile label="Provider" value={readiness?.provider || 'Gemini'} />
        <SummaryTile label="Auth" value={readiness?.authMode || 'Checking'} />
        <SummaryTile label="Model" value={readiness?.model || 'Gemini 2.5'} />
      </div>
      {!checking && !ready && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-xs font-black text-white/65"
        >
          Run live check again
        </button>
      )}
    </div>
  );
}

function BuilderHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300/65">{eyebrow}</p>
      <h2 className="mt-2 max-w-xl text-3xl font-black leading-[1.05] tracking-tight">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/45">{description}</p>
    </div>
  );
}

function PremiumPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.035] p-4 shadow-[0_20px_60px_-45px_rgba(139,92,246,0.8)] backdrop-blur-xl">
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
      {children}
    </p>
  );
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border py-3 text-sm font-black transition ${
        active
          ? 'border-amber-300/50 bg-amber-300/12 text-amber-100 shadow-[0_10px_24px_-18px_rgba(251,191,36,0.9)]'
          : 'border-white/8 bg-black/25 text-white/45'
      }`}
    >
      {children}
    </button>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2.5 text-xs font-bold transition ${
        active
          ? 'border-violet-300/40 bg-violet-400/15 text-violet-100'
          : 'border-white/8 bg-black/20 text-white/45'
      }`}
    >
      {children}
    </button>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.06] bg-black/20 p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/25">{label}</p>
      <p className="mt-1 truncate text-xs font-bold capitalize text-white/75">{value}</p>
    </div>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 px-5 py-4 font-black text-black shadow-[0_18px_45px_-24px_rgba(251,191,36,0.85)] transition active:scale-[0.985] disabled:opacity-60"
    >
      {children}
    </button>
  );
}
