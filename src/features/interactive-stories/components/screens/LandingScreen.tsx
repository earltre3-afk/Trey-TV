import React from 'react';
import { ArrowLeft, Play, RotateCcw, Clock, Sparkles, Plus, Layers } from 'lucide-react';
import { IMAGES, CHARACTERS } from '../../lib/storyData';
import { Branch } from '../../lib/storyTypes';
import { CharacterAvatar } from '../CharacterAvatar';

interface Props {
 onBack: () => void;
 onStartNew: () => void;
 onContinue: (b: Branch) => void;
 branches: Branch[];
 onReread?: (b: Branch) => void;
}

export const LandingScreen: React.FC<Props> = ({ onBack, onStartNew, onContinue, branches, onReread }) => {
 const activeBranches = branches.filter(b => !b.isComplete);
 const lastBranch = activeBranches[0];


 return (
 <div className="min-h-screen pb-24">
 {/* Hero */}
 <div className="relative">
 <div className="relative aspect-[4/5] w-full overflow-hidden">
 <img src={IMAGES.twinsCover} alt="Switch Kicks" className="absolute inset-0 h-full w-full object-cover" />
 <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
 <button
 onClick={onBack}
 className="absolute left-4 top-10 rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur-md"
 >
 <ArrowLeft className="h-5 w-5" />
 </button>
 </div>
 <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
 <div className="flex items-center gap-2 text-amber-400">
 <Sparkles className="h-3.5 w-3.5" />
 <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Interactive Story</span>
 </div>
 <h1 className="mt-1 font-display text-5xl font-black uppercase leading-none tracking-tight text-white">
 Switch Kicks
 </h1>
 <p className="mt-3 font-serif text-lg italic text-white/90">
 Two brothers. Two worlds. One crazy day.
 </p>
 </div>
 </div>

 <div className="space-y-6 px-5 pt-6">
 {/* Synopsis */}
 <section>
 <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-violet-400">Synopsis</h2>
 <p className="font-serif text-base leading-relaxed text-white/80">
 Identical twins. Malik is the football star with a draft showcase coming. Micah is the ballet
 dancer with an adjudication for a featured solo. After a recreationally unwise night, one panicked
 favor turns into the longest day of their lives — and every choice you make decides who finds out,
 who falls in love, and who survives the truth.
 </p>
 </section>

 {/* Cast */}
 <section>
 <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-violet-400">The Cast</h2>
 <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
 {CHARACTERS.map((c) => (
 <div key={c.id} className="flex-shrink-0 w-20 text-center">
 <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white/20">
 <CharacterAvatar character={c} faceCrop />
 </div>
 <div className="mt-2 text-xs font-medium text-white/90 leading-tight">{c.firstName}</div>
 <div className="text-[10px] text-white/40 leading-tight">{c.role}</div>
 </div>
 ))}
 </div>
 </section>


 {/* Continue if exists */}
 {lastBranch && (
 <section className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4">
 <div className="flex items-center gap-2 text-violet-300">
 <Clock className="h-4 w-4" />
 <span className="text-xs font-bold uppercase tracking-widest">Last Branch</span>
 </div>
 <div className="mt-2 font-display text-lg font-bold text-white">
 Chapter {lastBranch.chapters.length}
 </div>
 <div className="text-sm text-white/60 line-clamp-2">
 {lastBranch.chapters[lastBranch.chapters.length - 1]?.summary || 'Continue where you left off.'}
 </div>
 <div className="mt-3 flex flex-wrap gap-2">
 <button
 onClick={() => onContinue(lastBranch)}
 className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-violet-500/30"
 >
 <RotateCcw className="h-4 w-4" /> Continue Last Branch
 </button>
 {onReread && lastBranch.chapters.length > 1 && (
 <button
 onClick={() => onReread(lastBranch)}
 className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-bold text-white/90 hover:bg-white/10"
 >
 <Layers className="h-4 w-4" /> Re-read Chapters
 </button>
 )}
 </div>
 </section>
 )}


 {/* Start button */}
 <button
 onClick={onStartNew}
 className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-5 font-display text-lg font-black uppercase tracking-widest text-white shadow-2xl shadow-violet-500/40 transition-transform active:scale-[0.98]"
 >
 <span className="relative z-10 inline-flex items-center gap-3">
 {activeBranches.length > 0 ? <><Plus className="h-5 w-5" /> Start New Branch</> : <><Play className="h-5 w-5 fill-current" /> Start Story</>}
 </span>
 <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
 </button>

 <p className="text-center text-xs text-white/40">
 Every choice changes the story. Up to 5 branches per playthrough.
 </p>
 </div>
 </div>
 );
};

