import React, { useState } from 'react';
import { ArrowLeft, Send, Zap, Heart, Flame, Shield, Crown, AlertTriangle, Wind, Link2, Swords } from 'lucide-react';
import { Branch, Choice, Tone, RelationshipImpactType } from '../../lib/storyTypes';
import { TONE_COLORS, CHARACTERS, inferAffectedCharacters, getImageMeta } from '../../lib/storyData';
import { CharacterAvatar } from '../CharacterAvatar';

interface Props {
 branch: Branch;
 onBack: () => void;
 onSubmit: (choice: Choice | { label?: string; text: string; tone?: Tone }) => void;
 selectedChoiceIndex?: number;
}

// Icon + accent color per relationship impact dimension
const IMPACT_META: Record<RelationshipImpactType, { Icon: React.ComponentType<{ className?: string }>; ring: string; chip: string; text: string }> = {
 Trust: { Icon: Shield, ring: 'ring-cyan-400/70', chip: 'bg-cyan-500/15 border-cyan-500/40', text: 'text-cyan-300' },
 Tension: { Icon: Flame, ring: 'ring-orange-400/70', chip: 'bg-orange-500/15 border-orange-500/40', text: 'text-orange-300' },
 Loyalty: { Icon: Link2, ring: 'ring-amber-400/70', chip: 'bg-amber-500/15 border-amber-500/40', text: 'text-amber-300' },
 Respect: { Icon: Crown, ring: 'ring-violet-400/70', chip: 'bg-violet-500/15 border-violet-500/40', text: 'text-violet-300' },
 Pressure: { Icon: AlertTriangle, ring: 'ring-red-400/70', chip: 'bg-red-500/15 border-red-500/40', text: 'text-red-300' },
 Distance: { Icon: Wind, ring: 'ring-zinc-300/60', chip: 'bg-zinc-500/15 border-zinc-500/40', text: 'text-zinc-300' },
 Bond: { Icon: Heart, ring: 'ring-pink-400/70', chip: 'bg-pink-500/15 border-pink-500/40', text: 'text-pink-300' },
 Rivalry: { Icon: Swords, ring: 'ring-fuchsia-400/70',chip: 'bg-fuchsia-500/15 border-fuchsia-500/40',text: 'text-fuchsia-300' },
};

const buildAffectedLabel = (chars: typeof CHARACTERS): string => {
 if (chars.length === 0) return 'Affects The Story';
 if (chars.length === 1) return `Affects ${chars[0].firstName}`;
 if (chars.length === 2) return `Affects ${chars[0].firstName} + ${chars[1].firstName}`;
 return `Affects ${chars[0].firstName}, ${chars[1].firstName} +${chars.length - 2}`;
};

export const StopPointScreen: React.FC<Props> = ({ branch, onBack, onSubmit, selectedChoiceIndex = -1 }) => {
 const stop = branch.pendingStopPoint;
 const [custom, setCustom] = useState('');
 const lastChapter = branch.chapters[branch.chapters.length - 1];
 const bgImage = lastChapter?.image;
 const bgMeta = getImageMeta(bgImage);

 if (!stop) return null;

 const submitCustom = () => {
 if (!custom.trim()) return;
 onSubmit({ text: custom.trim() });
 setCustom('');
 };

 return (
 <div className="relative min-h-screen pb-24">
 {/* Background scene */}
 {bgImage && (
 <div className="fixed inset-0 -z-10">
 <img
 src={bgImage}
 alt=""
 className={`h-full w-full ${bgMeta.fit === 'contain' ? 'object-contain bg-zinc-950' : 'object-cover'}`}
 style={{ objectPosition: bgMeta.position }}
 />
 <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
 </div>
 )}

 <header className="flex items-center justify-between px-5 pt-10 pb-4">
 <button
 onClick={onBack}
 className="rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur-md"
 >
 <ArrowLeft className="h-5 w-5" />
 </button>
 <div className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
 Critical Stop Point
 </div>
 <div className="w-10" />
 </header>

 <div className="px-5">
 <div className="mb-2 flex items-center gap-2 text-violet-400">
 <Zap className="h-5 w-5 animate-pulse" />
 <span className="text-xs font-bold uppercase tracking-widest">Decide</span>
 </div>
 <h1 className="font-display text-3xl font-black uppercase leading-tight tracking-tight text-white">
 What Happens Next?
 </h1>
 <p className="mt-2 text-sm italic text-white/70">{stop.prompt}</p>
 <p className="mt-1 text-xs text-white/40">This choice changes the day.</p>

 {(() => {
 const lower = `${stop.prompt} ${stop.choices.map((c) => c.text).join(' ')}`.toLowerCase();
 const cast = CHARACTERS.filter((c) =>
 new RegExp(`\\b${c.firstName}\\b`, 'i').test(lower) ||
 new RegExp(`\\b${c.name}\\b`, 'i').test(lower)
 ).slice(0, 5);
 if (cast.length === 0) return null;
 return (
 <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 p-2.5 backdrop-blur-md">
 <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">In Scene</span>
 <div className="flex -space-x-2">
 {cast.map((ch) => (
 <div key={ch.id} className="h-7 w-7 overflow-hidden rounded-full border-2 border-zinc-950 ring-1 ring-violet-500/30">
 <CharacterAvatar character={ch} faceCrop />
 </div>
 ))}
 </div>
 <span className="text-[11px] text-white/60">{cast.map((c) => c.firstName).join(' · ')}</span>
 </div>
 );
 })()}

 <div className="mt-6 space-y-3">
 {stop.choices.map((c: Choice, index: number) => {
 const tone = TONE_COLORS[c.tone] || TONE_COLORS.Bold;
 const affected = inferAffectedCharacters(c, stop.prompt).slice(0, 3);
 const impact = c.relationshipImpactType;
 const impactMeta = impact ? IMPACT_META[impact] : null;
 const Ring = impactMeta?.ring || 'ring-violet-400/60';
 const affectedLabel = buildAffectedLabel(affected);

 return (
 <button
 key={c.label}
 onClick={() => onSubmit(c)}
 className={`group relative w-full overflow-hidden rounded-2xl border-2 ${tone.border} bg-black/60 p-4 text-left backdrop-blur-md transition-all hover:shadow-xl hover:${tone.glow} active:scale-[0.98] ${selectedChoiceIndex === index ? 'ring-4 ring-amber-300/80 shadow-[0_0_28px_rgba(251,191,36,0.45)]' : ''}`}
 >
 <div className="flex items-start gap-3">
 <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${tone.bg} font-display text-lg font-black ${tone.text}`}>
 {c.label}
 </div>
 <div className="flex-1 min-w-0">
 <div className="font-medium text-white leading-snug">{c.text}</div>

 <div className="mt-2 flex flex-wrap items-center gap-2">
 <div className={`inline-block rounded-full ${tone.bg} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${tone.text}`}>
 {c.tone}
 </div>
 {impactMeta && (
 <div className={`inline-flex items-center gap-1 rounded-full border ${impactMeta.chip} px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${impactMeta.text}`}>
 <impactMeta.Icon className="h-2.5 w-2.5" />
 {impact}
 </div>
 )}
 </div>
 </div>

 {/* Character faces — neon-ringed circular avatars */}
 {affected.length > 0 && (
 <div className="flex flex-shrink-0 flex-col items-end gap-1">
 <div className="flex -space-x-2">
 {affected.map((ch) => (
 <div
 key={ch.id}
 className={`h-10 w-10 overflow-hidden rounded-full border-2 border-zinc-950 ring-2 ${Ring} shadow-lg`}
 >
 <CharacterAvatar character={ch} faceCrop />
 </div>
 ))}
 </div>
 <div className="max-w-[7.5rem] text-right text-[9px] font-bold uppercase leading-tight tracking-wider text-white/70">
 {affectedLabel}
 </div>
 </div>
 )}
 </div>
 </button>
 );
 })}
 </div>


 <div className="mt-6">
 <div className="mb-2 text-xs font-bold uppercase tracking-widest text-white/50">Or type your own…</div>
 <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-black/60 p-2 backdrop-blur-md focus-within:border-violet-500">
 <input
 type="text"
 value={custom}
 onChange={(e) => setCustom(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && submitCustom()}
 placeholder="Micah grabs Malik's jacket and..."
 className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
 />
 <button
 onClick={submitCustom}
 disabled={!custom.trim()}
 className="rounded-xl bg-violet-600 p-2.5 text-white shadow-lg shadow-violet-500/40 disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none"
 >
 <Send className="h-4 w-4" />
 </button>
 </div>
 </div>
 </div>
 </div>
 );
};

