import React, { useEffect, useMemo, useState } from 'react';
import TreyTVHeader from './TreyTVHeader';
import { LiquidGlassCard, NeonGlassButton } from './LiquidGlass';
import MoodIcon, { MOOD_META } from './MoodIcon';
import {
  Heart, Zap, Play, Share2, Bookmark, RotateCcw, Sliders, Crown, ChevronRight,
  ChevronLeft, ThumbsUp, ThumbsDown, Sparkles, Minus, History, ListVideo, Tv,
} from 'lucide-react';
import type { ScoredItem, PrescriptionAnswers, Mood } from './data';

interface Props {
  answers: PrescriptionAnswers;
  scored: ScoredItem[];
  prescriptionTitle: string;
  onTryAgain: () => void;
  onAdjustMood: () => void;
  onSave: () => void;
  onShare: () => void;
  onOpenHistory: () => void;
  onGoWatch: () => void;
  isSaved: boolean;
  explanation?: string;
}

type ResultPage = 'top' | 'recommended' | 'more' | 'actions';

const ResultsScreen: React.FC<Props> = ({
  answers, scored, prescriptionTitle,
  onTryAgain, onAdjustMood, onSave, onShare, onOpenHistory, onGoWatch, isSaved,
  explanation,
}) => {
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const top = scored[0];
  const secondary = scored.slice(1, 4);
  const moreRest = scored.slice(4, 7);

  const pages: ResultPage[] = useMemo(() => {
    const base: ResultPage[] = ['top'];
    if (secondary.length > 0) base.push('recommended');
    if (moreRest.length > 0) base.push('more');
    base.push('actions');
    return base;
  }, [secondary.length, moreRest.length]);

  useEffect(() => {
    if (page > pages.length - 1) setPage(pages.length - 1);
  }, [page, pages.length]);

  const activePage = pages[page];
  const setFb = (id: string, v: string) => setFeedback((p) => ({ ...p, [id]: v }));
  const pickMoods: Mood[] = answers.moods.length > 0 ? answers.moods : (['Reflective', 'Happy', 'Motivated'] as Mood[]);
  const attribFor = (i: number): Mood => pickMoods[i % pickMoods.length];
  const avgMatch = Math.round(scored.slice(0, 5).reduce((s, x) => s + x.score, 0) / Math.max(1, Math.min(5, scored.length)));

  return (
    <section className="w-full max-w-md mx-auto h-[100dvh] overflow-hidden px-4 pt-[max(0.25rem,env(safe-area-inset-top))] pb-[max(0.65rem,env(safe-area-inset-bottom))] flex flex-col">
      <div className="shrink-0"><TreyTVHeader size="sm" /></div>

      <div className="shrink-0 text-center mb-2">
        <h1
          className="font-serif font-bold text-[clamp(1.9rem,8.5vw,2.9rem)] leading-none"
          style={{
            backgroundImage: 'linear-gradient(90deg,#fcd34d 0%, #f0abfc 50%, #c4b5fd 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          }}
        >
          Your Prescription
        </h1>
        <p className="text-white/65 text-[11px] mt-1 truncate px-6">{prescriptionTitle}</p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-center">
        {activePage === 'top' && top && (
          <TopPickCard top={top} feedback={feedback[top.id]} setFeedback={(v) => setFb(top.id, v)} explanation={explanation} />
        )}

        {activePage === 'recommended' && (
          <PagedPickList title="More matches" subtitle="Because of the mood recipe you picked." items={secondary} attribFor={attribFor} startIndex={0} />
        )}

        {activePage === 'more' && (
          <PagedPickList title="Deep cuts" subtitle="Extra options without making the page scroll." items={moreRest} attribFor={attribFor} startIndex={3} />
        )}

        {activePage === 'actions' && (
          <ActionsPage
            avgMatch={avgMatch}
            isSaved={isSaved}
            onSave={onSave}
            onShare={onShare}
            onTryAgain={onTryAgain}
            onAdjustMood={onAdjustMood}
            onOpenHistory={onOpenHistory}
          />
        )}
      </div>

      <div className="shrink-0 pt-3">
        <div className="flex items-center justify-center gap-1.5 mb-3">
          {pages.map((p, i) => (
            <button
              key={p + i}
              onClick={() => setPage(i)}
              aria-label={`Go to result page ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === page ? 'w-8 bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 shadow-[0_0_10px_rgba(251,191,36,0.55)]' : 'w-1.5 bg-white/20'}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-[1fr_1.5fr] gap-2">
          <button
            onClick={() => page === 0 ? onAdjustMood() : setPage((p) => Math.max(0, p - 1))}
            className="py-3 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs inline-flex items-center justify-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> {page === 0 ? 'Adjust' : 'Back'}
          </button>
          {page < pages.length - 1 ? (
            <NeonGlassButton onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))} className="w-full" ariaLabel="Next results page">
              <span className="inline-flex items-center gap-2 justify-center">Continue <ChevronRight className="w-4 h-4" /></span>
            </NeonGlassButton>
          ) : (
            <NeonGlassButton onClick={onGoWatch} className="w-full" ariaLabel="Watch my prescription">
              <span className="inline-flex items-center gap-2 justify-center"><Tv className="w-4 h-4" /> Watch Now</span>
            </NeonGlassButton>
          )}
        </div>
      </div>
    </section>
  );
};

const TopPickCard: React.FC<{
  top: ScoredItem;
  feedback?: string;
  setFeedback: (value: string) => void;
  explanation?: string;
}> = ({ top, feedback, setFeedback, explanation }) => (
  <LiquidGlassCard accent="multi">
    <div className="p-3.5">
      <div className="flex gap-3">
        <div className="relative w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
          <img src={top.thumbnail} alt={top.title} className="w-full h-full object-cover" />
          <button
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition"
            aria-label={`Play ${top.title}`}
            onClick={() => window.alert(`Now playing: ${top.title}`)}
          >
            <span className="w-10 h-10 rounded-full bg-black/60 border border-white/30 flex items-center justify-center backdrop-blur">
              <Play className="w-4 h-4 text-white fill-white" />
            </span>
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-400/60 bg-amber-500/10 text-amber-300 text-[10px] font-semibold tracking-wider uppercase">
            <Crown className="w-3 h-3" /> Top Pick
          </div>
          <h3
            className="font-serif text-xl mt-1.5 leading-tight line-clamp-2"
            style={{
              backgroundImage: 'linear-gradient(90deg,#f472b6,#c084fc)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}
          >
            {top.title}
          </h3>
          <p className="text-white/75 text-xs mt-1 leading-snug line-clamp-3">{top.description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        <MatchBar icon={<Heart className="w-3.5 h-3.5 text-pink-400" />} label="Mood Match" value={top.moodMatch} color="from-pink-500 to-rose-500" />
        <MatchBar icon={<Zap className="w-3.5 h-3.5 text-purple-400" />} label="Energy Match" value={top.energyMatch} color="from-purple-500 to-fuchsia-500" />
      </div>

      {explanation ? (
        <div className="mt-3.5 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-300/20 text-amber-300 text-[11px] leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold mb-1 tracking-wider text-[9px] uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            Trey-I AI Reading
          </div>
          <p className="text-white/95 font-medium italic">"{explanation}"</p>
        </div>
      ) : (
        <p className="text-white/60 text-[11px] mt-3 italic line-clamp-2">{top.reason}</p>
      )}

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        <FbButton active={feedback === 'perfect'} onClick={() => setFeedback('perfect')} icon={<ThumbsUp className="w-3.5 h-3.5" />} label="Perfect" />
        <FbButton active={feedback === 'not-my-vibe'} onClick={() => setFeedback('not-my-vibe')} icon={<ThumbsDown className="w-3.5 h-3.5" />} label="Not me" />
        <FbButton active={feedback === 'more-like'} onClick={() => setFeedback('more-like')} icon={<Sparkles className="w-3.5 h-3.5" />} label="More" />
        <FbButton active={feedback === 'less-like'} onClick={() => setFeedback('less-like')} icon={<Minus className="w-3.5 h-3.5" />} label="Less" />
      </div>
    </div>
  </LiquidGlassCard>
);

const PagedPickList: React.FC<{
  title: string;
  subtitle: string;
  items: ScoredItem[];
  attribFor: (index: number) => Mood;
  startIndex: number;
}> = ({ title, subtitle, items, attribFor, startIndex }) => (
  <div>
    <div className="text-center mb-3">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-300/40 bg-cyan-400/10 text-cyan-200 text-[10px] uppercase tracking-[0.2em]">
        <ListVideo className="w-3 h-3" /> No-scroll picks
      </div>
      <h2 className="font-serif text-2xl text-white mt-2">{title}</h2>
      <p className="text-white/60 text-xs mt-1">{subtitle}</p>
    </div>
    <div className="space-y-2.5">
      {items.map((it, i) => {
        const mood = attribFor(startIndex + i);
        const color = MOOD_META[mood].color;
        return (
          <LiquidGlassCard key={it.id} accent="cyan" onClick={() => window.alert(`Now playing: ${it.title}`)}>
            <div className="px-2.5 py-2.5 flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                <img src={it.thumbnail} alt={it.title} className="w-full h-full object-cover" />
              </div>
              <div
                className="w-10 h-10 rounded-full bg-black/60 border flex items-center justify-center flex-shrink-0"
                style={{ borderColor: color, boxShadow: `0 0 14px ${color}88` }}
              >
                <MoodIcon mood={mood} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-serif text-lg leading-tight truncate"
                  style={{
                    backgroundImage: `linear-gradient(90deg,#f0abfc,${color})`,
                    WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                  }}
                >
                  {it.title}
                </div>
                <div className="text-[11px] text-white/70 truncate">
                  Because you picked <span style={{ color }} className="font-semibold">{mood}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/50 flex-shrink-0" />
            </div>
          </LiquidGlassCard>
        );
      })}
    </div>
  </div>
);

const ActionsPage: React.FC<{
  avgMatch: number;
  isSaved: boolean;
  onSave: () => void;
  onShare: () => void;
  onTryAgain: () => void;
  onAdjustMood: () => void;
  onOpenHistory: () => void;
}> = ({ avgMatch, isSaved, onSave, onShare, onTryAgain, onAdjustMood, onOpenHistory }) => (
  <LiquidGlassCard accent="orange">
    <div className="p-5 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/15 border border-amber-300/50 flex items-center justify-center"
        style={{ boxShadow: '0 0 24px rgba(251,191,36,0.45)' }}>
        <Sparkles className="w-7 h-7 text-amber-300" />
      </div>
      <h2 className="font-serif text-2xl text-white mt-3">Prescription ready</h2>
      <p className="text-white/65 text-sm mt-1">Average match score: <span className="text-cyan-300 font-semibold">{avgMatch}%</span></p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          onClick={onSave}
          aria-label={isSaved ? 'Unsave prescription' : 'Save prescription'}
          className={`py-3 rounded-2xl border flex flex-col items-center justify-center gap-1 text-xs transition ${
            isSaved ? 'bg-amber-400/20 border-amber-300 text-amber-300' : 'bg-white/5 border-white/15 text-white/80 hover:text-white'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-amber-300' : ''}`} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <button onClick={onShare} className="py-3 rounded-2xl border border-fuchsia-400/40 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-200 text-xs flex flex-col items-center justify-center gap-1">
          <Share2 className="w-5 h-5" /> Share
        </button>
        <button onClick={onTryAgain} className="py-3 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs flex flex-col items-center justify-center gap-1">
          <RotateCcw className="w-5 h-5" /> Try Again
        </button>
        <button onClick={onAdjustMood} className="py-3 rounded-2xl border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 text-xs flex flex-col items-center justify-center gap-1">
          <Sliders className="w-5 h-5" /> Adjust Mood
        </button>
      </div>

      <button onClick={onOpenHistory} className="mt-4 text-sm text-white/70 hover:text-white inline-flex items-center gap-2">
        <History className="w-4 h-4" /> View saved prescriptions
      </button>
    </div>
  </LiquidGlassCard>
);

const MatchBar: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => (
  <div>
    <div className="flex items-center justify-between text-[11px] mb-1">
      <span className="inline-flex items-center gap-1.5 text-white/80">{icon}{label}</span>
      <span className="font-semibold text-white">{value}%</span>
    </div>
    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${value}%`, boxShadow: '0 0 10px rgba(236,72,153,0.5)' }} />
    </div>
  </div>
);

const FbButton: React.FC<{ active?: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={`text-[10px] py-1.5 rounded-full border flex items-center justify-center gap-1 transition ${
      active ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200' : 'bg-white/5 border-white/15 text-white/70 hover:text-white'
    }`}
  >
    {icon} {label}
  </button>
);

export default ResultsScreen;
