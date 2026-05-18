import React, { useState } from 'react';
import { Trophy, Lock, Share2, Sparkles } from 'lucide-react';
import { Ending } from '../../lib/storyTypes';
import { IMAGES } from '../../lib/storyData';
import { TreyTVLogo } from '../TreyTVLogo';


interface Props {
 endings: Ending[];
}

const LOCKED_HINTS = [
 { label: 'The Truth Costs Everything', hint: 'Confess to everyone before noon.' },
 { label: 'Brothers Above All', hint: 'Choose loyalty over the showcase.' },
 { label: 'A Quiet Reveal', hint: 'Let only one person know.' },
 { label: 'The Adjudication Twist', hint: 'Dance for Micah and mean it.' },
 { label: 'Coach Sees Through You', hint: 'Get caught at practice.' },
 { label: 'Mom Always Knew', hint: 'Come home before the sun sets.' },
];

export const EndingsScreen: React.FC<Props> = ({ endings }) => {
 const [tab, setTab] = useState<'completed' | 'locked'>(endings.length > 0 ? 'completed' : 'locked');
 const [openEnding, setOpenEnding] = useState<Ending | null>(null);

 return (
 <div className="min-h-screen px-5 pt-10 pb-24">
 <header className="mb-4">
 <div className="flex items-center gap-2 text-amber-400">
 <Trophy className="h-4 w-4" />
 <span className="text-xs font-bold uppercase tracking-[0.25em]">Collection</span>
 </div>
 <h1 className="mt-1 font-display text-4xl font-black text-white">Endings</h1>
 </header>

 <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
 <button
 onClick={() => setTab('completed')}
 className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${
 tab === 'completed' ? 'bg-violet-600 text-white' : 'text-white/60'
 }`}
 >
 Completed ({endings.length})
 </button>
 <button
 onClick={() => setTab('locked')}
 className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${
 tab === 'locked' ? 'bg-violet-600 text-white' : 'text-white/60'
 }`}
 >
 Locked
 </button>
 </div>

 {tab === 'completed' ? (
 endings.length === 0 ? (
 <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
 <Sparkles className="mx-auto mb-3 h-10 w-10 text-white/30" />
 <p className="text-white/60">Finish a branch to unlock your first ending poster.</p>
 </div>
 ) : (
 <div className="grid grid-cols-2 gap-3">
 {endings.map((e, i) => (
 <button
 key={i}
 onClick={() => setOpenEnding(e)}
 className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-amber-500/30 text-left"
 >
 <img src={IMAGES.twinsCover} alt={e.name} className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
 <div className="absolute top-3 left-3 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-black">
 Unlocked
 </div>
 <div className="absolute bottom-0 left-0 right-0 p-3">
 <div className="font-display text-base font-black leading-tight text-white">{e.name}</div>
 <div className="mt-1 text-[11px] italic text-white/70 line-clamp-2">{e.tagline}</div>
 </div>
 </button>
 ))}
 </div>
 )
 ) : (
 <div className="grid grid-cols-2 gap-3">
 {LOCKED_HINTS.map((h, i) => (
 <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black">
 <div className="absolute inset-0 flex items-center justify-center">
 <Lock className="h-10 w-10 text-white/15" />
 </div>
 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
 <div className="font-display text-sm font-bold text-white/40">???</div>
 <div className="mt-0.5 text-[11px] italic text-white/30 line-clamp-2">Hint: {h.hint}</div>
 </div>
 </div>
 ))}
 </div>
 )}

 {openEnding && (
 <EndingPoster ending={openEnding} onClose={() => setOpenEnding(null)} />
 )}
 </div>
 );
};

const EndingPoster: React.FC<{ ending: Ending; onClose: () => void }> = ({ ending, onClose }) => {
 const handleShare = async () => {
 const text = `I just unlocked "${ending.name}" on Switch Kicks — ${ending.tagline}`;
 if (navigator.share) {
 try { await navigator.share({ title: 'Switch Kicks', text }); } catch {}
 } else {
 try { await navigator.clipboard.writeText(text); alert('Copied to clipboard!'); } catch {}
 }
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
 <div
 className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-amber-500/40 bg-black shadow-2xl shadow-amber-500/20"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="relative aspect-[9/16] w-full">
 <img src={IMAGES.twinsCover} alt={ending.name} className="absolute inset-0 h-full w-full object-cover" />
 <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black" />
 <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
 <div className="rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black">
 New Ending Unlocked
 </div>
 </div>
 <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
 <div className="text-xs font-bold uppercase tracking-[0.4em] text-amber-400">Switch Kicks</div>
 <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none tracking-tight text-white">
 {ending.name}
 </h2>
 <p className="mt-4 font-serif text-base italic leading-snug text-white/90">{ending.tagline}</p>
 <div className="mt-5 flex items-center justify-center">
 <TreyTVLogo size={24} />
 </div>
 <div className="mt-1 text-[10px] uppercase tracking-widest text-white/40">An Interactive Story</div>
 </div>

 </div>
 <div className="flex gap-2 bg-zinc-950 p-3">
 <button onClick={onClose} className="flex-1 rounded-xl bg-white/10 py-2.5 text-sm font-bold text-white hover:bg-white/15">
 Close
 </button>
 <button onClick={handleShare} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-black hover:bg-amber-400">
 <Share2 className="h-4 w-4" /> Share
 </button>
 </div>
 </div>
 </div>
 );
};

export { EndingPoster };

