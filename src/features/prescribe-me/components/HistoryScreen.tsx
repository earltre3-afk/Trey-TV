import React, { useEffect, useMemo, useState } from 'react';
import TreyTVHeader from './TreyTVHeader';
import { LiquidGlassCard, NeonGlassButton } from './LiquidGlass';
import MoodIcon, { MOOD_META } from './MoodIcon';
import { Bookmark, Clock, Heart, Play, MoreVertical, RotateCcw, Share2, Zap, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { CONTENT_LIBRARY, type SavedPrescription } from './data';

type Tab = 'saved' | 'history' | 'favorites';

interface Props {
  prescriptions: SavedPrescription[];
  onBack: () => void;
  onReplay: (p: SavedPrescription) => void;
  onShare: (p: SavedPrescription) => void;
  onToggleFavorite: (id: string) => void;
  onNewPrescription: () => void;
}

const HistoryScreen: React.FC<Props> = ({ prescriptions, onBack, onReplay, onShare, onToggleFavorite, onNewPrescription }) => {
  const [tab, setTab] = useState<Tab>('saved');
  const [index, setIndex] = useState(0);

  const filtered = useMemo(() => prescriptions.filter((p) => {
    if (tab === 'saved') return p.isSaved;
    if (tab === 'favorites') return p.isFavorite;
    return true;
  }), [prescriptions, tab]);

  useEffect(() => { setIndex(0); }, [tab]);
  useEffect(() => {
    if (filtered.length === 0) setIndex(0);
    else if (index > filtered.length - 1) setIndex(filtered.length - 1);
  }, [filtered.length, index]);

  const active = filtered[index];

  return (
    <section className="w-full max-w-md mx-auto h-[100dvh] overflow-hidden px-4 pt-[max(0.25rem,env(safe-area-inset-top))] pb-[max(0.65rem,env(safe-area-inset-bottom))] flex flex-col">
      <div className="relative shrink-0">
        <TreyTVHeader size="sm" />
        <button
          onClick={onBack}
          aria-label="Back"
          className="absolute left-0 top-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/15 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="shrink-0 text-center mb-3">
        <h1
          className="font-serif font-bold text-[clamp(1.9rem,8.5vw,2.85rem)] leading-none"
          style={{
            backgroundImage: 'linear-gradient(90deg,#fcd34d 0%, #f0abfc 50%, #c4b5fd 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          }}
        >
          Your Prescriptions
        </h1>
      </div>

      <div className="shrink-0 mb-3">
        <LiquidGlassCard accent="multi">
          <div className="grid grid-cols-3 p-1.5">
            <TabBtn active={tab === 'saved'} onClick={() => setTab('saved')} icon={<Bookmark className="w-4 h-4" />} label="Saved" />
            <TabBtn active={tab === 'history'} onClick={() => setTab('history')} icon={<Clock className="w-4 h-4" />} label="History" />
            <TabBtn active={tab === 'favorites'} onClick={() => setTab('favorites')} icon={<Heart className="w-4 h-4" />} label="Favorites" />
          </div>
        </LiquidGlassCard>
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-center">
        {!active ? (
          <EmptyState tab={tab} onNewPrescription={onNewPrescription} />
        ) : (
          <PrescriptionCard
            prescription={active}
            position={index + 1}
            total={filtered.length}
            onReplay={() => onReplay(active)}
            onShare={() => onShare(active)}
            onToggleFavorite={() => onToggleFavorite(active.id)}
          />
        )}
      </div>

      <div className="shrink-0 pt-3">
        {active && (
          <div className="flex items-center justify-center gap-1.5 mb-3">
            {filtered.slice(0, 8).map((p, i) => (
              <button
                key={p.id}
                onClick={() => setIndex(i)}
                aria-label={`Open prescription ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 shadow-[0_0_10px_rgba(251,191,36,0.55)]' : 'w-1.5 bg-white/20'}`}
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-[1fr_1fr] gap-2">
          <button
            onClick={() => active ? setIndex((i) => Math.max(0, i - 1)) : onBack()}
            disabled={!!active && index === 0}
            className="py-3 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white/80 hover:text-white text-xs inline-flex items-center justify-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {active && index < filtered.length - 1 ? (
            <NeonGlassButton onClick={() => setIndex((i) => Math.min(filtered.length - 1, i + 1))} className="w-full" ariaLabel="Next prescription">
              <span className="inline-flex items-center gap-2 justify-center">Next <ChevronRight className="w-4 h-4" /></span>
            </NeonGlassButton>
          ) : (
            <NeonGlassButton onClick={onNewPrescription} className="w-full" ariaLabel="Start a new prescription">
              <span className="inline-flex items-center gap-2 justify-center"><Sparkles className="w-4 h-4" /> New</span>
            </NeonGlassButton>
          )}
        </div>
      </div>
    </section>
  );
};

const EmptyState: React.FC<{ tab: Tab; onNewPrescription: () => void }> = ({ tab, onNewPrescription }) => (
  <LiquidGlassCard accent="purple">
    <div className="p-6 text-center">
      <Sparkles className="w-9 h-9 mx-auto text-fuchsia-300 mb-3" />
      <h3 className="font-serif text-2xl text-white">No prescriptions yet</h3>
      <p className="text-white/60 text-sm mt-1">
        {tab === 'favorites' ? 'Star the ones you love to find them here.' : 'Start a new prescription to build your library.'}
      </p>
      <div className="mt-5 inline-block">
        <NeonGlassButton onClick={onNewPrescription}>Start a prescription</NeonGlassButton>
      </div>
    </div>
  </LiquidGlassCard>
);

const PrescriptionCard: React.FC<{
  prescription: SavedPrescription;
  position: number;
  total: number;
  onReplay: () => void;
  onShare: () => void;
  onToggleFavorite: () => void;
}> = ({ prescription: p, position, total, onReplay, onShare, onToggleFavorite }) => {
  const primaryMood = p.answers.moods[0];
  const accent = primaryMood ? (
    primaryMood === 'Happy' ? 'gold' :
    primaryMood === 'Romantic' ? 'pink' :
    primaryMood === 'Reflective' ? 'cyan' :
    primaryMood === 'Motivated' ? 'purple' :
    primaryMood === 'Wild' ? 'magenta' : 'purple'
  ) : 'purple' as const;
  const thumbs = p.recIds.slice(0, 3).map((id) => CONTENT_LIBRARY.find((x) => x.id === id)?.thumbnail).filter(Boolean) as string[];

  return (
    <LiquidGlassCard accent={accent as 'gold'|'pink'|'cyan'|'purple'|'magenta'}>
      <div className="p-4">
        <div className="flex items-center gap-3">
          {primaryMood && (
            <div className="w-14 h-14 rounded-full bg-black/60 border flex items-center justify-center flex-shrink-0"
              style={{ borderColor: MOOD_META[primaryMood].color, boxShadow: `0 0 14px ${MOOD_META[primaryMood].color}aa` }}>
              <MoodIcon mood={primaryMood} size={26} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-white/45 mb-0.5">{position} of {total}</div>
            <h3 className="font-serif text-xl text-white truncate">{p.title}</h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] mt-0.5">
              {p.answers.moods.slice(0, 3).map((m, i) => (
                <React.Fragment key={m}>
                  <span style={{ color: MOOD_META[m].color }}>{m}</span>
                  {i < Math.min(p.answers.moods.length, 3) - 1 && <span className="text-white/30">•</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
          <button
            aria-label={p.isFavorite ? 'Unfavorite' : 'Mark favorite'}
            onClick={onToggleFavorite}
            className="w-8 h-8 rounded-full text-white/60 hover:text-white flex items-center justify-center"
            title={p.isFavorite ? 'Unfavorite' : 'Mark favorite'}
          >
            {p.isFavorite ? <Heart className="w-5 h-5 fill-pink-500 text-pink-500" /> : <MoreVertical className="w-5 h-5" />}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex -space-x-2">
            {thumbs.map((src, i) => (
              <div key={i} className="w-12 h-12 rounded-full border-2 border-black/80 overflow-hidden">
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <button onClick={onReplay} aria-label={`Replay ${p.title}`} className="relative group">
            <span className="absolute -inset-1 rounded-full bg-amber-400/40 blur-md opacity-70 group-hover:opacity-100" />
            <span className="relative w-12 h-12 rounded-full border-2 border-amber-300 bg-black/60 flex items-center justify-center">
              <Play className="w-5 h-5 fill-amber-300 text-amber-300" />
            </span>
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <IconBtn onClick={onReplay} icon={<RotateCcw className="w-4 h-4" />} label="Replay" color="#fbbf24" />
          <IconBtn onClick={onShare} icon={<Share2 className="w-4 h-4" />} label="Share" color="#c084fc" />
          <IconBtn onClick={onToggleFavorite} icon={<Heart className="w-4 h-4" />} label={p.isFavorite ? 'Loved' : 'Favorite'} color="#f472b6" />
        </div>

        <div className="mt-4">
          <LiquidGlassCard accent="orange">
            <div className="p-3 flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-300/20 to-amber-700/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: '0 0 20px rgba(251,191,36,0.4)' }}>
                <Zap className="w-6 h-6 text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-base text-white">Re-dose Your Favorites</div>
                <p className="text-[11px] text-white/65 mt-0.5 truncate">Your vibe. Your recipe. One tap.</p>
              </div>
            </div>
          </LiquidGlassCard>
        </div>

        <div className="mt-3 text-[10px] text-white/40 text-center">
          {new Date(p.createdAt).toLocaleString()}
        </div>
      </div>
    </LiquidGlassCard>
  );
};

const TabBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-full text-xs transition ${
      active ? 'bg-amber-500/20 text-amber-200 border border-amber-300/60 shadow-[0_0_18px_-4px_rgba(251,191,36,0.6)]' : 'text-white/70 hover:text-white border border-transparent'
    }`}
  >
    {icon} {label}
  </button>
);

const IconBtn: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string; color: string }> = ({ onClick, icon, label, color }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
    <span style={{ color, filter: `drop-shadow(0 0 6px ${color}aa)` }}>{icon}</span>
    <span className="text-[10px]" style={{ color }}>{label}</span>
  </button>
);

export default HistoryScreen;
