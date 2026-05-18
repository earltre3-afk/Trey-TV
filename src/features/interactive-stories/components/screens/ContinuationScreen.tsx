import React, { useEffect, useState } from 'react';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { StateDelta } from '../../lib/storyTypes';
import { getImageMeta } from '../../lib/storyData';

interface Props {
 chapterTitle: string;
 prose: string;
 delta: StateDelta;
 image?: string;
 imageFit?: 'cover' | 'contain';
 imagePosition?: string;
 onContinue: () => void;
}

const METER_LABELS: Record<string, string> = {
 trust_ari: 'Ari Trust',
 trust_dante: 'Dante Trust',
 trust_malik_to_micah: 'Malik → Micah',
 trust_micah_to_malik: 'Micah → Malik',
 suspicion_mom: 'Mom Suspicion',
 suspicion_coach: 'Coach Risk',
 suspicion_valentina: 'Valentina',
 risk_level: 'Risk Level',
};

export const ContinuationScreen: React.FC<Props> = ({ chapterTitle, prose, delta, image, imageFit, imagePosition, onContinue }) => {
 const [visibleChars, setVisibleChars] = useState(0);
 const [showDeltas, setShowDeltas] = useState(false);

 useEffect(() => {
 const totalLen = prose.length;
 const duration = Math.min(8000, Math.max(2500, totalLen * 8));
 const startTime = Date.now();
 const tick = () => {
 const elapsed = Date.now() - startTime;
 const ratio = Math.min(1, elapsed / duration);
 setVisibleChars(Math.floor(totalLen * ratio));
 if (ratio < 1) requestAnimationFrame(tick);
 else setTimeout(() => setShowDeltas(true), 300);
 };
 requestAnimationFrame(tick);
 }, [prose]);

 const visibleProse = prose.slice(0, visibleChars);
 const paragraphs = visibleProse.split(/\n\n+/);

 const nonZeroDeltas = Object.entries(delta).filter(([, v]) => v && v !== 0);

 // Face-safe framing for the new chapter image — driven by SCENE_IMAGE_MAP.
 const imgMeta = getImageMeta(image);
 const resolvedFit = imageFit || imgMeta.fit;
 const resolvedPosition = imagePosition || imgMeta.position;
 const heroFitClass = resolvedFit === 'contain' ? 'object-contain bg-zinc-950' : 'object-cover';

 return (
 <div className="min-h-screen pb-24">
 {image && (
 <div className="relative aspect-[4/3] min-h-[260px] w-full overflow-hidden bg-zinc-950 sm:aspect-[16/9]">
 <img
 src={image}
 alt={chapterTitle}
 className={`absolute inset-0 h-full w-full ${heroFitClass}`}
 style={{ objectPosition: resolvedPosition }}
 />
 <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
 <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
 <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">New Chapter</div>
 <h1 className="font-display text-3xl font-black leading-tight tracking-tight text-white">
 {chapterTitle}
 </h1>
 </div>
 </div>
 )}


 <article className="prose-story mx-auto max-w-2xl px-6 pt-6">
 {paragraphs.map((p, i) => (
 <p key={i} className="mb-5 font-serif text-[17px] leading-[1.75] text-white/85">
 {p}
 {i === paragraphs.length - 1 && visibleChars < prose.length && (
 <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-violet-400 align-middle" />
 )}
 </p>
 ))}
 </article>

 {showDeltas && nonZeroDeltas.length > 0 && (
 <div className="mx-5 mt-4 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-4">
 <div className="mb-2 text-xs font-bold uppercase tracking-widest text-violet-300">State Updates</div>
 <div className="flex flex-wrap gap-2">
 {nonZeroDeltas.map(([k, v]) => {
 const val = v as number;
 const positive = val > 0;
 return (
 <div
 key={k}
 className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
 positive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
 }`}
 style={{ animation: 'pop-in 0.4s ease-out' }}
 >
 {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
 {METER_LABELS[k] || k}
 <span>{positive ? '+' : ''}{val}</span>
 </div>
 );
 })}
 </div>
 </div>
 )}

 {showDeltas && (
 <div className="px-5 pt-6">
 <button
 onClick={onContinue}
 className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4 font-display text-base font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-500/30"
 >
 Continue <ChevronRight className="h-5 w-5" />
 </button>
 </div>
 )}
 </div>
 );
};

