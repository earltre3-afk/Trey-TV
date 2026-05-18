import React, { useState } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, Lock, Clock, MapPin, Sparkles, Layers } from 'lucide-react';
import { Branch, ChapterRecord, Tone } from '../../lib/storyTypes';
import { TONE_COLORS, CHARACTERS, getImageMeta } from '../../lib/storyData';
import { CharacterAvatar } from '../CharacterAvatar';


const ArchiveImage: React.FC<{ image?: string; alt: string }> = ({ image, alt }) => {
 const meta = getImageMeta(image);
 return (
 <img
 src={image}
 alt={alt}
 className={`absolute inset-0 h-full w-full ${meta.fit === 'contain' ? 'object-contain bg-zinc-950' : 'object-cover'}`}
 style={{ objectPosition: meta.position }}
 draggable={false}
 />
 );
};

// Detect every character mentioned in a chunk of free text. Order preserved.
const detectCharacters = (text: string) => {
 if (!text) return [];
 const lower = text.toLowerCase();
 const found: typeof CHARACTERS = [];
 CHARACTERS.forEach((c) => {
 const tokens = [c.firstName, c.name].filter(Boolean);
 if (tokens.some((t) => lower.includes(t.toLowerCase())) && !found.includes(c)) {
 found.push(c);
 }
 });
 return found.slice(0, 5);
};


interface Props {
 branch: Branch;
 onBack: () => void;
 onJumpToCurrent: () => void;
}

export const ChapterArchiveScreen: React.FC<Props> = ({ branch, onBack, onJumpToCurrent }) => {
 const [selected, setSelected] = useState<ChapterRecord | null>(null);

 if (selected) {
 return <ChapterReader chapter={selected} branch={branch} onBack={() => setSelected(null)} onJumpToCurrent={onJumpToCurrent} />;
 }

 const chapters = branch.chapters;
 const currentNumber = chapters[chapters.length - 1]?.number || 1;

 return (
 <div className="min-h-screen pb-32">
 {/* Header */}
 <header className="sticky top-0 z-20 border-b border-white/5 bg-black/70 px-5 pb-4 pt-10 backdrop-blur-xl">
 <div className="flex items-center justify-between">
 <button
 onClick={onBack}
 className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/80"
 >
 <ArrowLeft className="h-3.5 w-3.5" /> Back
 </button>
 <button
 onClick={onJumpToCurrent}
 className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-violet-500/30"
 >
 Continue Story →
 </button>
 </div>
 <div className="mt-4 flex items-center gap-2 text-violet-300">
 <Layers className="h-4 w-4" />
 <span className="text-[11px] font-bold uppercase tracking-[0.25em]">Re-read Chapters</span>
 </div>
 <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-white">Your Story Path</h1>
 <p className="mt-1 text-xs text-white/50">
 {chapters.length} chapter{chapters.length === 1 ? '' : 's'} on this branch • {branch.isComplete ? 'Complete' : 'In Progress'}
 </p>
 </header>

 {/* Timeline */}
 <div className="px-5 pt-5">
 <div className="relative">
 {/* Vertical line */}
 <div className="absolute bottom-2 left-[18px] top-2 w-px bg-gradient-to-b from-violet-500/50 via-violet-500/20 to-transparent" />

 <div className="space-y-3">
 {chapters.map((c, i) => {
 const isCurrent = c.number === currentNumber && !branch.isComplete;
 const tone = c.toneTag || c.choiceMade?.tone;
 const toneStyle = tone ? TONE_COLORS[tone] : null;

 return (
 <button
 key={c.number}
 onClick={() => setSelected(c)}
 className="group relative block w-full text-left"
 >
 {/* Node */}
 <div
 className={`absolute left-0 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-black ${
 isCurrent
 ? 'border-violet-400 bg-violet-600 text-white shadow-lg shadow-violet-500/50'
 : 'border-emerald-500/60 bg-emerald-600/30 text-emerald-200'
 }`}
 >
 {c.number}
 </div>

 {/* Card */}
 <div className="ml-12 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-md transition-all group-active:scale-[0.99] group-hover:border-violet-500/30">
 <div className="flex gap-3">
 {c.image && (
 <div className="relative h-24 w-24 shrink-0 overflow-hidden sm:h-28 sm:w-28">
 <ArchiveImage image={c.image} alt={c.title} />
 <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-950/80" />
 </div>
 )}
 <div className="flex-1 py-3 pr-3">
 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
 Chapter {c.number}
 {isCurrent && (
 <span className="rounded-full bg-violet-500/30 px-2 py-0.5 text-[9px] text-violet-200">
 Current
 </span>
 )}
 {tone && toneStyle && (
 <span className={`rounded-full border px-2 py-0.5 text-[9px] ${toneStyle.bg} ${toneStyle.border} ${toneStyle.text}`}>
 {tone}
 </span>
 )}
 </div>
 <h3 className="mt-1 font-display text-base font-bold leading-tight text-white">
 {c.title.replace(/^Chapter \d+\s*[—-]\s*/, '')}
 </h3>
 {c.summary && (
 <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-white/55">
 {c.summary}
 </p>
 )}
 {(() => {
 const cast = detectCharacters(`${c.summary || ''} ${c.title || ''}`);
 if (cast.length === 0) return null;
 return (
 <div className="mt-2 flex items-center gap-1.5">
 <div className="flex -space-x-1.5">
 {cast.map((ch) => (
 <div
 key={ch.id}
 className="h-5 w-5 overflow-hidden rounded-full border border-zinc-950 ring-1 ring-white/10"
 title={ch.name}
 >
 <CharacterAvatar character={ch} faceCrop />
 </div>
 ))}
 </div>
 <span className="text-[10px] text-white/40">
 {cast.map((ch) => ch.firstName).join(' · ')}
 </span>
 </div>
 );
 })()}
 {c.choiceMade && (
 <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/40">
 <MapPin className="h-3 w-3" />
 <span className="line-clamp-1">
 Choice: {c.choiceMade.text}
 </span>
 </div>
 )}
 </div>
 <div className="flex items-center pr-3 text-white/30">
 <ChevronRight className="h-4 w-4" />
 </div>
 </div>
 </div>
 </button>
 );
 })}


 {/* Locked next chapter teaser */}
 {!branch.isComplete && (
 <div className="relative">
 <div className="absolute left-0 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/15 bg-zinc-900 text-white/30">
 <Lock className="h-3.5 w-3.5" />
 </div>
 <div className="ml-12 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4">
 <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">
 Chapter {currentNumber + 1}
 </div>
 <div className="mt-0.5 font-display text-sm text-white/40">
 Yet to be written…
 </div>
 <button
 onClick={onJumpToCurrent}
 className="mt-2 text-xs font-bold text-violet-400 hover:text-violet-300"
 >
 Continue the story →
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
};

const ChapterReader: React.FC<{
 chapter: ChapterRecord;
 branch: Branch;
 onBack: () => void;
 onJumpToCurrent: () => void;
}> = ({ chapter, branch, onBack, onJumpToCurrent }) => {
 const paragraphs = chapter.prose.split(/\n\n+/);
 const tone = chapter.toneTag || chapter.choiceMade?.tone;
 const toneStyle = tone ? TONE_COLORS[tone] : null;

 return (
 <div className="min-h-screen pb-24">
 {chapter.image && (
 <div className="relative aspect-[4/3] min-h-[260px] w-full overflow-hidden bg-zinc-950 sm:aspect-[16/9]">
 <ArchiveImage image={chapter.image} alt={chapter.title} />
 <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
 <button
 onClick={onBack}
 className="absolute left-4 top-10 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-2 text-xs font-bold text-white backdrop-blur-md"
 >
 <ArrowLeft className="h-3.5 w-3.5" /> Chapter List
 </button>
 <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">
 <BookOpen className="h-3 w-3" /> Chapter {chapter.number} • Re-reading
 </div>
 <h1 className="mt-1 font-display text-3xl font-black leading-tight tracking-tight text-white drop-shadow-2xl">
 {chapter.title.replace(/^Chapter \d+\s*[—-]\s*/, '')}
 </h1>
 {tone && toneStyle && (
 <span className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${toneStyle.bg} ${toneStyle.border} ${toneStyle.text}`}>
 {tone}
 </span>
 )}
 </div>
 </div>
 )}

 {chapter.choiceMade && chapter.number > 1 && (
 <div className="mx-5 mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
 <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-300">
 <Sparkles className="h-3 w-3" /> The choice that led here
 </div>
 <p className="mt-1 font-serif text-sm italic text-white/80">"{chapter.choiceMade.text}"</p>
 </div>
 )}

 <article className="mx-auto max-w-2xl px-6 pt-6">
 {paragraphs.map((p, i) => (
 <p key={i} className="mb-5 font-serif text-[17px] leading-[1.75] text-white/85">
 {p}
 </p>
 ))}
 </article>

 <div className="mx-5 mt-6 flex flex-col gap-2.5">
 <button
 onClick={onBack}
 className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3.5 text-sm font-bold text-white"
 >
 <Layers className="h-4 w-4" /> Back to Chapter List
 </button>
 <button
 onClick={onJumpToCurrent}
 className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-500/30"
 >
 <Clock className="h-4 w-4" /> Continue Current Story
 </button>
 </div>
 </div>
 );
};

