import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ChevronRight, ChevronDown, ChevronUp, Activity, Layers, SkipForward, Play,
} from 'lucide-react';
import { Branch } from '../../lib/storyTypes';
import { MeterBar } from '../MeterBar';
import { VoicePlayer, VoiceSettingsToolbar } from '../VoicePlayer';
import { CHARACTERS, CHARACTER_PHOTO_MAP, getImageMeta } from '../../lib/storyData';
import { VoiceCharacterId, toVoiceId, stopVoice, loadVoiceSettings } from '../../lib/voiceLines';


interface Props {
  branch: Branch;
  onBack: () => void;
  onContinue: () => void;
  onOpenStatus: () => void;
  onReread?: () => void;
}

type Beat =
  | { kind: 'narration'; text: string; speakerId: 'narrator' }
  | { kind: 'dialogue'; text: string; speakerId: VoiceCharacterId; speakerName: string; avatar: string };

/** Parse a chapter's prose into beats (narration + character dialogue). */
function parseBeats(prose: string): Beat[] {
  const paragraphs = prose.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const beats: Beat[] = [];

  // We'll detect "Speaker said," patterns and quoted text. If a paragraph
  // begins with a quoted line, we attempt to attribute it; otherwise we treat
  // the whole paragraph as narration but split out the embedded dialogue.
  let lastSpeaker: { id: VoiceCharacterId; name: string; avatar: string } | null = null;

  const findSpeakerInText = (text: string) => {
    const lower = text.toLowerCase();
    for (const c of CHARACTERS) {
      const re = new RegExp(`\\b${c.firstName}\\b`, 'i');
      if (re.test(text) || lower.includes(c.name.toLowerCase())) {
        const map = CHARACTER_PHOTO_MAP[c.mapKey];
        return {
          id: toVoiceId(c.id),
          name: c.firstName,
          avatar: map?.image || c.image,
        };
      }
    }
    return null;
  };

  for (const p of paragraphs) {
    // Pull out quoted runs.
    const quoteRegex = /"([^"]+)"/g;
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    let hadQuote = false;
    while ((m = quoteRegex.exec(p)) !== null) {
      hadQuote = true;
      const before = p.slice(lastIndex, m.index).trim();
      const quoted = m[1].trim();
      const after = p.slice(m.index + m[0].length, m.index + m[0].length + 60); // attribution lookahead

      if (before && !/^[,;.\s]+$/.test(before)) {
        // Look for speaker tag in the "before" segment first, then "after".
        const spk = findSpeakerInText(before) || findSpeakerInText(after);
        if (spk) lastSpeaker = spk;
        beats.push({ kind: 'narration', text: before, speakerId: 'narrator' });
      } else {
        const spk = findSpeakerInText(after);
        if (spk) lastSpeaker = spk;
      }

      const spk = lastSpeaker;
      if (spk) {
        beats.push({
          kind: 'dialogue',
          text: quoted,
          speakerId: spk.id,
          speakerName: spk.name,
          avatar: spk.avatar,
        });
      } else {
        // Unattributed dialogue â†’ narrator reads it.
        beats.push({ kind: 'narration', text: `"${quoted}"`, speakerId: 'narrator' });
      }
      lastIndex = m.index + m[0].length;
    }
    const tail = p.slice(lastIndex).trim();
    if (!hadQuote) {
      beats.push({ kind: 'narration', text: p, speakerId: 'narrator' });
    } else if (tail && !/^[,;.\s]+$/.test(tail)) {
      beats.push({ kind: 'narration', text: tail, speakerId: 'narrator' });
    }
  }

  return beats;
}

export const ReadingScreen: React.FC<Props> = ({
  branch, onBack, onContinue, onOpenStatus, onReread,
}) => {
  const chapter = branch.chapters[branch.chapters.length - 1];
  const [railOpen, setRailOpen] = useState(false);

  const beats = useMemo(() => parseBeats(chapter.prose), [chapter.prose]);
  const [revealCount, setRevealCount] = useState(1);
  const visibleBeats = beats.slice(0, revealCount);
  const isComplete = revealCount >= beats.length;
  const currentBeat = beats[revealCount - 1];

  // Reset on chapter change
  useEffect(() => {
    setRevealCount(1);
    stopVoice();
    return () => stopVoice();
  }, [chapter.number]);

  const settings = loadVoiceSettings();
  const playbackSceneId = chapter.sceneId || `chapter_${chapter.number}`;
  const currentLineIndex = Math.max(0, revealCount - 1);
  const playbackToken = `${branch.id}:${playbackSceneId}:${currentLineIndex}`;

  const advance = () => {
    stopVoice();
    if (!isComplete) setRevealCount((n) => Math.min(beats.length, n + 1));
  };

  const skipAll = () => {
    stopVoice();
    setRevealCount(beats.length);
  };

  // Resolve face-safe framing for the chapter's hero image. Falls back to
  // "center 35%" cover, which keeps faces visible on the typical character
  // composition (faces in the upper-middle of the frame).
  const imgMeta = getImageMeta(chapter.image);
  const imageFit = chapter.imageFit || imgMeta.fit;
  const imagePosition = chapter.imagePosition || imgMeta.position;
  const heroFitClass = imageFit === 'contain' ? 'object-contain bg-zinc-950' : 'object-cover';

  return (
    <div className="min-h-screen pb-32">
      {/* Hero image â€” face-safe framing driven by SCENE_IMAGE_MAP metadata. */}
      {chapter.image && (
        <div className="relative aspect-[4/3] min-h-[260px] w-full overflow-hidden bg-zinc-950 sm:aspect-[16/9]">
          <img
            src={chapter.image}
            alt={chapter.title}
            className={`absolute inset-0 h-full w-full ${heroFitClass}`}
            style={{ objectPosition: imagePosition }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
          <button
            onClick={onBack}
            className="absolute left-4 top-10 rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={onOpenStatus}
            className="absolute right-4 top-10 rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur-md"
          >
            <Activity className="h-5 w-5" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">
              Chapter {chapter.number}
            </div>
            <h1 className="font-display text-3xl font-black leading-tight tracking-tight text-white">
              {chapter.title.replace(/^Chapter \d+\s*[â€”-]\s*/, '')}
            </h1>
          </div>
        </div>
      )}


      {/* Cinematic playback toolbar */}
      <div className="mx-5 mt-4 flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur">
        <VoiceSettingsToolbar />
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50">
          <span>{Math.min(revealCount, beats.length)}/{beats.length}</span>
          <button
            onClick={skipAll}
            className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-white/70"
          >
            <SkipForward className="h-3 w-3" /> Skip
          </button>
        </div>
      </div>

      {/* Collapsible meter rail */}
      <button
        onClick={() => setRailOpen((o) => !o)}
        className="mx-5 mt-3 flex w-[calc(100%-2.5rem)] items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80"
      >
        <span className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-violet-400" />
          Relationships & Risk
        </span>
        {railOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {railOpen && (
        <div className="mx-5 mt-2 space-y-2.5 rounded-xl border border-white/10 bg-black/40 p-4">
          <MeterBar label="Trust â€” Ari" value={branch.meters.trust_ari} color="pink" compact />
          <MeterBar label="Trust â€” Dante" value={branch.meters.trust_dante} color="violet" compact />
          <MeterBar label="Mom Suspicion" value={branch.meters.suspicion_mom} color="amber" compact />
          <MeterBar label="Coach Risk" value={branch.meters.suspicion_coach} color="amber" compact />
          <MeterBar label="Risk Level" value={branch.meters.risk_level} color="red" compact />
        </div>
      )}

      {/* Cinematic dialogue stream */}
      <div
        onClick={advance}
        className="mx-auto mt-4 max-w-2xl cursor-pointer select-none px-5"
        role="button"
        aria-label="Tap to advance"
      >
        <div className="space-y-3">
          {visibleBeats.map((b, i) => {
            const isLatest = i === visibleBeats.length - 1;
            if (b.kind === 'narration') {
              return (
                <div
                  key={i}
                  className={`rounded-2xl px-2 py-1 ${isLatest ? 'animate-in fade-in' : ''}`}
                >
                  <p className="font-serif text-[17px] leading-[1.75] text-white/85">{b.text}</p>
                  {isLatest && (
                    <div className="mt-2">
                      <VoicePlayer
                        characterId="narrator"
                        text={b.text}
                        compact
                        autoplayKey={settings.autoplay ? `${branch.id}-${playbackSceneId}-${i}` : undefined}
                        playbackToken={playbackToken}
                        sceneId={playbackSceneId}
                        lineIndex={i}
                        onEnded={() => settings.autoplay && advance()}
                      />
                    </div>
                  )}
                </div>
              );
            }
            // Dialogue bubble
            return (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md ${
                  isLatest ? 'ring-1 ring-violet-500/50 shadow-lg shadow-violet-500/10' : ''
                }`}
              >
                <img
                  src={b.avatar}
                  alt={b.speakerName}
                  className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-white/20"
                  style={{ objectPosition: 'center 25%' }}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-display text-sm font-bold text-white">{b.speakerName}</div>
                    <div className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-white/60">
                      Voice Line
                    </div>
                  </div>
                  <p className="mt-1 font-serif text-[16px] italic leading-snug text-white/95">
                    "{b.text}"
                  </p>
                  {isLatest && (
                    <div className="mt-2">
                      <VoicePlayer
                        characterId={b.speakerId}
                        text={b.text}
                        speakerName={b.speakerName}
                        avatarUrl={b.avatar}
                        compact
                        autoplayKey={settings.autoplay ? `${branch.id}-${playbackSceneId}-${i}` : undefined}
                        playbackToken={playbackToken}
                        sceneId={playbackSceneId}
                        lineIndex={i}
                        onEnded={() => settings.autoplay && advance()}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!isComplete && (
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
            <Play className="h-3 w-3 fill-current" /> Tap to advance
          </div>
        )}
      </div>

      {/* Continue */}
      {isComplete && (
        <div className="space-y-2.5 px-5 pt-6">
          <button
            onClick={onContinue}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4 font-display text-base font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-500/30 transition-transform active:scale-[0.98]"
          >
            Continue
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          {onReread && branch.chapters.length > 1 && (
            <button
              onClick={onReread}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/80 transition-colors hover:bg-white/10"
            >
              <Layers className="h-3.5 w-3.5" /> Re-read Chapters
            </button>
          )}
          <div className="mt-3 text-center text-xs text-white/40">
            Chapter {chapter.number} â€¢ {branch.chapters.length} chapter{branch.chapters.length === 1 ? '' : 's'} played â€¢{' '}
            {branch.isComplete ? 'Branch Complete' : 'Branch In Progress'}
          </div>
        </div>
      )}
    </div>
  );
};

