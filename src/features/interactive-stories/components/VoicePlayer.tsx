import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, RotateCcw, Loader2, CircleStop } from 'lucide-react';
import {
  VOICE_PROFILES,
  VoiceCharacterId,
  VOICE_SETTINGS_EVENT,
  loadVoiceSettings,
  saveVoiceSettings,
  playVoiceLine,
  stopVoice,
} from '../lib/voiceLines';
import type { StoryVoiceConfig } from '../lib/storyVoiceTypes';

interface Props {
  /** Canonical character_id, or 'narrator'. */
  characterId: VoiceCharacterId | string;
  voice?: StoryVoiceConfig | null;
  /** The line to speak (also shown as captions). */
  text: string;
  /** Show speaker name + accent bubble. */
  speakerName?: string;
  /** Optional avatar URL for the speaker. */
  avatarUrl?: string;
  /** Called when audio finishes (used for autoplay-advance). */
  onEnded?: () => void;
  /** If true, plays automatically when settings.autoplay is on. */
  autoplayKey?: string;
  /** Stable token that invalidates stale async audio when a scene/beat changes. */
  playbackToken?: string;
  sceneId?: string;
  lineIndex?: number;
  /** Compact inline variant (used inside dialogue bubbles). */
  compact?: boolean;
}

export const VoicePlayer: React.FC<Props> = ({
  characterId,
  voice,
  text,
  speakerName,
  avatarUrl,
  onEnded,
  autoplayKey,
  playbackToken,
  sceneId,
  lineIndex,
  compact,
}) => {
  const [settings, setSettings] = useState(loadVoiceSettings());
  const [loading, setLoading] = useState(false);
  const profile = VOICE_PROFILES[characterId as VoiceCharacterId] || VOICE_PROFILES.narrator;
  const lastAutoplayKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const syncSettings = (event: Event) => {
      const detail = (event as CustomEvent<typeof settings>).detail;
      setSettings(detail || loadVoiceSettings());
    };
    window.addEventListener(VOICE_SETTINGS_EVENT, syncSettings);
    return () => window.removeEventListener(VOICE_SETTINGS_EVENT, syncSettings);
  }, []);

  const play = async () => {
    setLoading(true);
    try {
      await playVoiceLine(characterId, text, {
        muted: settings.muted,
        volume: settings.volume,
        voice,
        onEnded: () => onEnded?.(),
        onError: () => setLoading(false),
        playbackToken,
        sceneId,
        lineIndex,
      });
    } finally {
      setLoading(false);
    }
  };

  // Autoplay when the line changes (driven by autoplayKey).
  useEffect(() => {
    if (!autoplayKey) return;
    if (!settings.autoplay) return;
    if (settings.muted) return;
    if (lastAutoplayKeyRef.current === autoplayKey) return;
    lastAutoplayKeyRef.current = autoplayKey;
    play();
    return () => stopVoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayKey, settings.autoplay, settings.muted]);

  const toggleMute = () => {
    const next = { ...settings, muted: !settings.muted };
    setSettings(next);
    saveVoiceSettings(next);
    if (next.muted) stopVoice();
  };

  const handleButton = (event: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
    event.preventDefault();
    event.stopPropagation();
    action();
  };

  const skip = () => {
    stopVoice();
    setLoading(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(event) => handleButton(event, play)}
          aria-label="Replay voice"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/90 hover:bg-white/20"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
        </button>
        <button
          type="button"
          onClick={(event) => handleButton(event, toggleMute)}
          aria-label={settings.muted ? 'Turn voices on' : 'Turn voices off'}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/15"
        >
          {settings.muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={(event) => handleButton(event, skip)}
          aria-label="Skip voice"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/15"
        >
          <CircleStop className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md">
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={speakerName || profile.display_name}
          className="h-9 w-9 rounded-full object-cover ring-1 ring-white/15"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">
          {speakerName || profile.display_name}
        </div>
        <div className="truncate text-xs text-white/40">{profile.description}</div>
      </div>
      <button
        type="button"
        onClick={(event) => handleButton(event, play)}
        aria-label="Replay voice"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RotateCcw className="h-3.5 w-3.5" />
        )}
      </button>
      <button
        type="button"
        onClick={(event) => handleButton(event, toggleMute)}
        aria-label={settings.muted ? 'Turn voices on' : 'Turn voices off'}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/80 hover:bg-white/15"
      >
        {settings.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={(event) => handleButton(event, skip)}
        aria-label="Skip voice"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/80 hover:bg-white/15"
      >
        <CircleStop className="h-4 w-4" />
      </button>
    </div>
  );
};

/** Toolbar to toggle autoplay + mute globally. */
export const VoiceSettingsToolbar: React.FC = () => {
  const [settings, setSettings] = useState(loadVoiceSettings());

  useEffect(() => {
    const syncSettings = (event: Event) => {
      const detail = (event as CustomEvent<typeof settings>).detail;
      setSettings(detail || loadVoiceSettings());
    };
    window.addEventListener(VOICE_SETTINGS_EVENT, syncSettings);
    return () => window.removeEventListener(VOICE_SETTINGS_EVENT, syncSettings);
  }, []);

  const update = (patch: Partial<typeof settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveVoiceSettings(next);
    if (next.muted) stopVoice();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          update({ autoplay: !settings.autoplay });
        }}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
          settings.autoplay
            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/40'
            : 'border border-white/15 bg-white/5 text-white/70'
        }`}
      >
        Autoplay {settings.autoplay ? 'On' : 'Off'}
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          update({ muted: !settings.muted });
        }}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
          settings.muted
            ? 'bg-red-600/80 text-white'
            : 'border border-white/15 bg-white/5 text-white/70'
        }`}
      >
        {settings.muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
        {settings.muted ? 'Voices Off' : 'Voices On'}
      </button>
      <label className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/70 sm:flex">
        <span>Volume</span>
        <input
          type="range"
          aria-label="Voice volume"
          min={0}
          max={1}
          step={0.05}
          value={settings.volume}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => update({ volume: Number(event.currentTarget.value) })}
          className="h-1 w-20 accent-violet-400"
        />
      </label>
    </div>
  );
};

