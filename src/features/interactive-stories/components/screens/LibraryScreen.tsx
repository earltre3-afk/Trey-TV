import React, { useRef } from 'react';
import { Sparkles, Play, Lock, Trophy, Upload, FileJson, PlusCircle } from 'lucide-react';
import { IMAGES } from '../../lib/storyData';
import { TreyTVLogo } from '../TreyTVLogo';
import { TreyStoryPackage } from '../../lib/treyStoryPackage';

interface Props {
 onOpenStory: () => void;
 onOpenEndings: () => void;
 hasSave: boolean;
 endingsCount: number;
 installedStories?: TreyStoryPackage[];
 onInstallStoryFile?: (file: File) => void;
 onStartInstalledStory?: (storyId: string) => void;
 onCraftStory: () => void;
}

export const LibraryScreen: React.FC<Props> = ({
 onOpenStory,
 onOpenEndings,
 hasSave,
 endingsCount,
 installedStories = [],
 onInstallStoryFile,
 onStartInstalledStory,
 onCraftStory,
}) => {
 const inputRef = useRef<HTMLInputElement>(null);

 return (
 <div className="min-h-screen pb-24">
 {/* Header */}
 <header className="px-5 pt-10 pb-6">
 <div className="flex items-center justify-between">
 <div>
 <div className="flex items-center">
 <TreyTVLogo size={36} glow />
 </div>
 <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white">Library</h1>
 </div>
 <button
 onClick={onOpenEndings}
 className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300"
 >
 <Trophy className="h-3.5 w-3.5" />
 Endings {endingsCount > 0 && <span className="rounded-full bg-amber-500 px-1.5 text-[10px] text-black">{endingsCount}</span>}
 </button>
 </div>
 <p className="mt-1 text-sm text-white/60">Stories you don't just read — you live.</p>
 </header>

 {/* Featured */}
 <div className="px-5">
 <button
 onClick={onOpenStory}
 className="group relative block w-full overflow-hidden rounded-3xl border border-white/10 text-left transition-transform active:scale-[0.98]"
 >
 <div className="relative aspect-[3/4] w-full">
 <img src={IMAGES.twinsCover} alt="Switch Kicks" className="absolute inset-0 h-full w-full object-cover" />
 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
 <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-violet-600/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-500/40">
 <Sparkles className="h-3 w-3" /> Featured
 </div>
 <div className="absolute bottom-0 left-0 right-0 p-6">
 <div className="font-display text-xs uppercase tracking-[0.3em] text-amber-400">An Interactive Story</div>
 <h2 className="mt-1 font-display text-4xl font-black uppercase leading-none tracking-tight text-white drop-shadow-2xl">
 Switch<br />Kicks
 </h2>
 <p className="mt-3 max-w-xs font-serif text-base italic text-white/90">
 Two brothers. Two worlds. One crazy day.
 </p>
 <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-bold text-black shadow-lg transition-transform group-hover:scale-105">
 <Play className="h-4 w-4 fill-current" />
 {hasSave ? 'Continue' : 'Start Story'}
 </div>
 </div>
 </div>
 </button>
 </div>

  {/* Interactive Stories & AI Studio */}
  <div className="mt-8 px-5">
    <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">Interactive Stories</h3>
    <div className="grid grid-cols-1 gap-3">
      {installedStories.map((pkg) => (
        <button
          key={pkg.story.id}
          onClick={() => onStartInstalledStory?.(pkg.story.id)}
          className="group flex gap-3 rounded-2xl border border-amber-400/20 bg-gradient-to-br from-zinc-950 via-black to-amber-950/20 p-3 text-left shadow-lg shadow-amber-500/10 transition-transform active:scale-[0.98]"
        >
          <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white/5">
            {pkg.story.coverImage ? (
              <img src={pkg.story.coverImage} alt={pkg.story.title} className="h-full w-full object-cover" style={{ objectPosition: 'center 35%' }} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/20">
                <PlusCircle className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 py-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
              {pkg.story.genre || 'Interactive Story'}
            </div>
            <div className="mt-1 font-display text-xl font-black text-white">{pkg.story.title}</div>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/55">
              {pkg.story.description || 'A bundled Trey TV interactive story.'}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-200">
              <Play className="h-3 w-3 fill-current" /> Start
            </div>
          </div>
        </button>
      ))}

      {/* Create Your Own Story Card */}
      <button
        onClick={onCraftStory}
        className="group flex gap-3 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-zinc-950 via-black to-cyan-950/20 p-3 text-left shadow-lg shadow-cyan-500/10 transition-transform active:scale-[0.98]"
      >
        <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-cyan-600 via-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md">
          <PlusCircle className="h-9 w-9 text-cyan-100 animate-pulse" />
        </div>
        <div className="min-w-0 flex-1 py-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
            AI Story Studio
          </div>
          <div className="mt-1 font-display text-xl font-black text-white">Create Your Own Story</div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/55">
            Craft your own unique story, define your characters, and let the AI generate a fully custom interactive adventure.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-cyan-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-200">
            <Sparkles className="h-3 w-3 fill-current text-cyan-300" /> Start Crafting
          </div>
        </div>
      </button>
    </div>
  </div>

 {/* Admin story installer */}
 {onInstallStoryFile && (
 <div className="mt-8 px-5">
 <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-black/70 to-fuchsia-500/10 p-4 shadow-lg shadow-violet-500/10">
 <div className="flex items-start gap-3">
 <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/15 text-violet-200">
 <FileJson className="h-5 w-5" />
 </div>
 <div className="min-w-0 flex-1">
 <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-300">Story Installer</div>
 <h3 className="font-display text-xl font-black text-white">Install a .ttstory file</h3>
 <p className="mt-1 text-xs leading-relaxed text-white/55">
 Upload future Trey TV Interactive Story Packages after validation.
 </p>
 </div>
 </div>
 <input
 ref={inputRef}
 type="file"
 accept=".ttstory,application/json"
 className="hidden"
 onChange={(e) => {
 const file = e.target.files?.[0];
 if (file) onInstallStoryFile(file);
 e.currentTarget.value = '';
 }}
 />
 <button
 onClick={() => inputRef.current?.click()}
 className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-400/30 bg-violet-500/20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-violet-100 active:scale-[0.98]"
 >
 <Upload className="h-4 w-4" /> Upload .ttstory Package
 </button>
 </div>
 </div>
 )}

 {/* Coming Soon */}
 <div className="mt-8 px-5">
 <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">Coming Soon</h3>
 <div className="grid grid-cols-2 gap-3">
 {[
 { title: 'After Hours', tag: 'Drama' },
 { title: 'The Understudy', tag: 'Romance' },
 { title: 'Last Set', tag: 'Music' },
 { title: 'Glasshouse', tag: 'Mystery' },
 ].map((s) => (
 <div key={s.title} className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black">
 <div className="absolute inset-0 flex items-center justify-center">
 <Lock className="h-8 w-8 text-white/20" />
 </div>
 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
 <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70">{s.tag}</div>
 <div className="font-display text-sm font-bold text-white/70">{s.title}</div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
};

