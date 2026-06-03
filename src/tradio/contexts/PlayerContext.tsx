import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { requestMediaCast, stopMediaCast } from "@/lib/cast/media-cast";

export type PlaybackSourceType =
  | "song"
  | "station"
  | "artist_station"
  | "instant_release"
  | "producer_beat"
  | "dj_mix"
  | "live_show"
  | "song_war_round"
  | "replay";

export type PlaybackMode = "normal" | "repeat_one" | "repeat_all";
export type PlaybackStatus =
  | "idle"
  | "buffering"
  | "playing"
  | "paused"
  | "ended"
  | "error"
  | "unavailable";

export interface StationPlaybackContext {
  stationId?: string;
  stationName: string;
  ownerName?: string;
  listenerCount?: number;
  isArtistOwned?: boolean;
}

export interface SongWarsPlaybackContext {
  battleId: string;
  battleName: string;
  roundNumber: number;
  artistA: string;
  artistB: string;
  activeCorner?: "A" | "B";
  votingStatus?: "playing" | "voting" | "completed";
}

export interface LiveShowPlaybackContext {
  showId?: string;
  showTitle: string;
  hostName?: string;
  stationName?: string;
  listenerCount?: number;
  elapsedLabel?: string;
}

export interface BeatPlaybackContext {
  beatId: string;
  producerName: string;
  bpm: number;
  musicalKey: string;
  mood: string[];
  genre: string;
  licenseLabel?: string;
}

export interface PlaybackSource {
  id: string;
  type: PlaybackSourceType;
  label: string;
  title?: string;
  subtitle?: string;
  image?: string | null;
  isLive?: boolean;
  listenerCount?: number;
}

export interface PlaybackItem {
  id: string;
  title: string;
  artist: string;
  art?: string | null;
  coverUrl?: string | null;
  src?: string;
  duration?: number;
  station?: string;
  sourceType?: PlaybackSourceType;
  sourceLabel?: string;
  isLive?: boolean;
  unavailable?: boolean;
  error?: string;
  bpm?: number;
  musicalKey?: string;
  mood?: string[];
  genre?: string;
  context?: {
    station?: StationPlaybackContext;
    songWars?: SongWarsPlaybackContext;
    liveShow?: LiveShowPlaybackContext;
    beat?: BeatPlaybackContext;
  };
}

export interface Track extends PlaybackItem {
  art: string;
  src: string;
}

export interface PlaybackQueue {
  id: string;
  label: string;
  source?: PlaybackSource;
  items: PlaybackItem[];
}

export interface PlaybackSession {
  id: string;
  status: PlaybackStatus;
  mode: PlaybackMode;
  source: PlaybackSource | null;
  currentItem: PlaybackItem | null;
  queue: PlaybackQueue;
  history: PlaybackItem[];
  startedAt?: number;
}

export interface PlaybackContext {
  session: PlaybackSession;
  currentItem: PlaybackItem | null;
  currentTrack: PlaybackItem | null;
  currentSource: PlaybackSource | null;
  playbackQueue: PlaybackQueue;
  queue: PlaybackItem[];
  upNext: PlaybackItem | null;
  history: PlaybackItem[];
  isPlaying: boolean;
  isBuffering: boolean;
  isLive: boolean;
  status: PlaybackStatus;
  progress: number;
  currentTime: number;
  duration: number;
  repeatMode: PlaybackMode;
  shuffleMode: boolean;
  volume: number;
  muted: boolean;
  liked: Set<string>;
  saved: Set<string>;
  playItem: (item: PlaybackItem, options?: PlayOptions) => void;
  playStation: (source: PlaybackSource, items?: PlaybackItem[]) => void;
  playQueue: (items: PlaybackItem[], startIndex?: number, source?: PlaybackSource) => void;
  play: (track: PlaybackItem, queue?: PlaybackItem[], source?: PlaybackSource) => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  prev: () => void;
  seek: (timeSec: number) => void;
  seekPct: (pct: number) => void;
  toggleLike: (id?: string) => void;
  toggleSave: (id?: string) => void;
  addToQueue: (item: PlaybackItem) => void;
  playNext: (item: PlaybackItem) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  enqueue: (track: PlaybackItem) => void;
  setPlaybackSource: (source: PlaybackSource | null) => void;
  setRepeatMode: (mode: PlaybackMode) => void;
  toggleShuffle: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  isCasting: boolean;
  activeCastDevice: string | null;
  startCast: (deviceId?: string) => void | Promise<void>;
  stopCast: () => void | Promise<void>;
}

interface PlayOptions {
  source?: PlaybackSource;
  queue?: PlaybackItem[];
  isLive?: boolean;
}

const DEFAULT_SOURCE: PlaybackSource = {
  id: "tradio-library",
  type: "song",
  label: "Song",
  title: "Tradio Library",
};

const buildSourceForItem = (item: PlaybackItem, override?: PlaybackSource): PlaybackSource => {
  if (override) return override;
  const type = item.sourceType || (item.isLive ? "live_show" : "song");
  const labels: Record<PlaybackSourceType, string> = {
    song: "Song",
    station: "Station",
    artist_station: "Artist Station",
    instant_release: "Release",
    producer_beat: "Beat",
    dj_mix: "DJ Mix",
    live_show: "Live Show",
    song_war_round: "Song War",
    replay: "Replay",
  };

  return {
    id: `${type}-${item.station || item.id}`,
    type,
    label: item.sourceLabel || labels[type],
    title:
      item.station ||
      item.context?.liveShow?.showTitle ||
      item.context?.songWars?.battleName ||
      item.title,
    subtitle: item.artist,
    image: item.coverUrl || item.art,
    isLive: Boolean(
      item.isLive || type === "station" || type === "artist_station" || type === "live_show",
    ),
    listenerCount: item.context?.station?.listenerCount || item.context?.liveShow?.listenerCount,
  };
};

const normalizePlaybackItem = (item: PlaybackItem): PlaybackItem => ({
  ...item,
  art: item.coverUrl || item.art || null,
  sourceType: item.sourceType || (item.isLive ? "live_show" : "song"),
  sourceLabel: item.sourceLabel || DEFAULT_SOURCE.label,
  duration: item.isLive ? 0 : item.duration || 210,
});

const createQueue = (items: PlaybackItem[], source?: PlaybackSource): PlaybackQueue => ({
  id: `queue-${source?.id || "tradio"}-${Date.now()}`,
  label: source?.label ? `${source.label} Queue` : "Tradio Queue",
  source,
  items: items.map(normalizePlaybackItem),
});

const Ctx = createContext<PlaybackContext | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const bufferTimer = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasRealMediaRef = useRef(false);
  const [currentItem, setCurrentItem] = useState<PlaybackItem | null>(null);
  const [currentSource, setCurrentSource] = useState<PlaybackSource | null>(null);
  const [playbackQueue, setPlaybackQueue] = useState<PlaybackQueue>(() => createQueue([]));
  const [history, setHistory] = useState<PlaybackItem[]>([]);
  const [status, setStatus] = useState<PlaybackStatus>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const currentTimeRef = useRef<number>(0);
  const lastPushedTimeRef = useRef<number>(0);
  const [duration, setDuration] = useState(0);
  const [repeatMode, setRepeatMode] = useState<PlaybackMode>("normal");
  const [shuffleMode, setShuffleMode] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [activeCastDevice, setActiveCastDevice] = useState<string | null>(null);

  const isCasting = activeCastDevice !== null;

  const startCast = useCallback(
    async (deviceId = "browser-cast") => {
      if (!currentItem?.src) return;
      await requestMediaCast({
        src: currentItem.src,
        title: currentItem.title,
        subtitle: currentItem.artist || currentSource?.title,
        poster: currentItem.coverUrl || currentItem.art,
        kind: "audio",
        currentTime,
        mediaElement: audioRef.current,
      });
      setActiveCastDevice(deviceId);
    },
    [currentItem, currentSource, currentTime],
  );

  const stopCast = useCallback(async () => {
    await stopMediaCast();
    setActiveCastDevice(null);
  }, []);

  const isBuffering = status === "buffering";
  const isPlaying = status === "playing";
  const isLive = Boolean(currentSource?.isLive || currentItem?.isLive);
  const queue = playbackQueue.items;
  const upNext = queue[0] || null;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const beginPlayback = useCallback(
    (item: PlaybackItem, source?: PlaybackSource, nextItems?: PlaybackItem[]) => {
      const normalized = normalizePlaybackItem(item);
      const resolvedSource = buildSourceForItem(normalized, source);

      if (bufferTimer.current) window.clearTimeout(bufferTimer.current);

      setCurrentItem((previous) => {
        if (previous && previous.id !== normalized.id) {
          setHistory((h) => [previous, ...h].slice(0, 50));
        }
        return normalized;
      });
      setCurrentSource(resolvedSource);
      setCurrentTime(0);
      currentTimeRef.current = 0;
      lastPushedTimeRef.current = 0;
      setDuration(normalized.isLive || resolvedSource.isLive ? 0 : normalized.duration || 210);
      if (nextItems) setPlaybackQueue(createQueue(nextItems, resolvedSource));
      setStatus(normalized.unavailable ? "unavailable" : "buffering");

      if (!normalized.unavailable && !normalized.src) {
        bufferTimer.current = window.setTimeout(() => {
          setStatus("playing");
        }, 250);
      }
    },
    [],
  );

  const playItem = useCallback(
    (item: PlaybackItem, options?: PlayOptions) => {
      beginPlayback(
        { ...item, isLive: options?.isLive ?? item.isLive },
        options?.source,
        options?.queue,
      );
    },
    [beginPlayback],
  );

  const play = useCallback(
    (track: PlaybackItem, newQueue?: PlaybackItem[], source?: PlaybackSource) => {
      playItem(track, { queue: newQueue, source });
    },
    [playItem],
  );

  const playQueue = useCallback(
    (items: PlaybackItem[], startIndex = 0, source?: PlaybackSource) => {
      if (!items.length) return;
      const start = normalizePlaybackItem(items[startIndex] || items[0]);
      const rest = items.slice(startIndex + 1).map(normalizePlaybackItem);
      const resolvedSource = buildSourceForItem(start, source);
      beginPlayback(start, resolvedSource, rest);
    },
    [beginPlayback],
  );

  const playStation = useCallback(
    (source: PlaybackSource, items: PlaybackItem[] = []) => {
      const stationItems = items.length
        ? items
        : [
            {
              id: `${source.id}-live-signal`,
              title: source.title || "Live Station Signal",
              artist: source.subtitle || source.label,
              art: source.image,
              station: source.title,
              sourceType: source.type,
              sourceLabel: source.label,
              isLive: true,
            },
          ];
      playQueue(
        stationItems.map((item) => ({ ...item, isLive: source.isLive ?? true })),
        0,
        { ...source, isLive: true },
      );
    },
    [playQueue],
  );

  const pause = useCallback(() => {
    if (!currentItem) return;
    setStatus("paused");
  }, [currentItem]);

  const resume = useCallback(() => {
    if (!currentItem || currentItem.unavailable) return;
    setStatus("playing");
  }, [currentItem]);

  const toggle = useCallback(() => {
    if (!currentItem) return;
    setStatus((value) => (value === "playing" ? "paused" : "playing"));
  }, [currentItem]);

  const next = useCallback(() => {
    setPlaybackQueue((existing) => {
      if (existing.items.length === 0) {
        if (repeatMode === "repeat_one" && currentItem)
          beginPlayback(currentItem, currentSource || undefined);
        else setStatus(currentItem ? "ended" : "idle");
        return existing;
      }

      const nextIndex = shuffleMode ? Math.floor(Math.random() * existing.items.length) : 0;
      const nextItem = existing.items[nextIndex];
      const rest = existing.items.filter((_, index) => index !== nextIndex);
      beginPlayback(nextItem, existing.source || currentSource || undefined, rest);
      return { ...existing, items: rest };
    });
  }, [beginPlayback, currentItem, currentSource, repeatMode, shuffleMode]);

  const previous = useCallback(() => {
    if (currentTime > 3) {
      setCurrentTime(0);
      return;
    }

    setHistory((existing) => {
      if (!existing.length) {
        setCurrentTime(0);
        return existing;
      }
      const [previousItem, ...rest] = existing;
      if (currentItem) setPlaybackQueue((q) => ({ ...q, items: [currentItem, ...q.items] }));
      beginPlayback(previousItem, currentSource || undefined);
      return rest;
    });
  }, [beginPlayback, currentItem, currentSource, currentTime]);

  const seek = useCallback(
    (timeSec: number) => {
      if (isLive) return;
      const target = Math.max(0, Math.min(timeSec, duration || timeSec));
      const audio = audioRef.current;
      if (audio && currentItem?.src) {
        audio.currentTime = target;
      }
      currentTimeRef.current = target;
      lastPushedTimeRef.current = target;
      setCurrentTime(target);
    },
    [currentItem?.src, duration, isLive],
  );

  const seekPct = useCallback(
    (pct: number) => {
      if (isLive || duration <= 0) return;
      seek((Math.max(0, Math.min(100, pct)) / 100) * duration);
    },
    [duration, isLive, seek],
  );

  const toggleLike = useCallback(
    (id?: string) => {
      const target = id || currentItem?.id;
      if (!target) return;
      setLiked((prev) => {
        const nextSet = new Set(prev);
        if (nextSet.has(target)) nextSet.delete(target);
        else nextSet.add(target);
        return nextSet;
      });
    },
    [currentItem],
  );

  const toggleSave = useCallback(
    (id?: string) => {
      const target = id || currentItem?.id;
      if (!target) return;
      setSaved((prev) => {
        const nextSet = new Set(prev);
        if (nextSet.has(target)) nextSet.delete(target);
        else nextSet.add(target);
        return nextSet;
      });
    },
    [currentItem],
  );

  const addToQueue = useCallback((item: PlaybackItem) => {
    setPlaybackQueue((existing) => ({
      ...existing,
      items: [...existing.items, normalizePlaybackItem(item)],
    }));
  }, []);

  const playNext = useCallback((item: PlaybackItem) => {
    setPlaybackQueue((existing) => ({
      ...existing,
      items: [normalizePlaybackItem(item), ...existing.items],
    }));
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setPlaybackQueue((existing) => ({
      ...existing,
      items: existing.items.filter((item) => item.id !== id),
    }));
  }, []);

  const clearQueue = useCallback(() => {
    setPlaybackQueue((existing) => ({ ...existing, items: [] }));
  }, []);

  const setPlaybackSource = useCallback((source: PlaybackSource | null) => {
    setCurrentSource(source);
    setPlaybackQueue((existing) => ({ ...existing, source: source || undefined }));
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(Math.max(0, Math.min(1, value)));
  }, []);

  const toggleMute = useCallback(() => setMuted((value) => !value), []);
  const toggleShuffle = useCallback(() => setShuffleMode((value) => !value), []);

  useEffect(() => {
    const audio = audioRef.current;
    hasRealMediaRef.current = Boolean(currentItem?.src);
    if (!audio) return;

    if (!currentItem?.src) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      return;
    }

    if (audio.src !== new URL(currentItem.src, window.location.href).toString()) {
      audio.src = currentItem.src;
      audio.currentTime = 0;
      audio.load();
    }
  }, [currentItem?.id, currentItem?.src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
    audio.muted = muted;
  }, [muted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentItem?.src) return;

    if (status === "playing" || status === "buffering") {
      audio.play().catch((error) => {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          setStatus("paused");
          return;
        }
        setStatus("error");
      });
    } else if (
      status === "paused" ||
      status === "idle" ||
      status === "ended" ||
      status === "unavailable" ||
      status === "error"
    ) {
      audio.pause();
    }
  }, [currentItem?.src, status]);

  const nextRef = useRef(next);
  const isLiveRef = useRef(isLive);
  const durationRef = useRef(duration);

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  useEffect(() => {
    isLiveRef.current = isLive;
  }, [isLive]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // Sync currentTime state to refs to handle external updates/seeks
  useEffect(() => {
    currentTimeRef.current = currentTime;
    lastPushedTimeRef.current = currentTime;
  }, [currentTime]);

  // Track playhead with a ref and push updates to React state
  useEffect(() => {
    if (status !== "playing") return;
    if (hasRealMediaRef.current) return;
    const timer = window.setInterval(() => {
      const currentIsLive = isLiveRef.current;
      const currentDuration = durationRef.current;
      const newTime = (function (prev: number) {
        if (currentIsLive || currentDuration <= 0) return prev + 1;
        if (prev + 1 >= currentDuration) {
          // schedule next track change
          window.setTimeout(() => nextRef.current(), 0);
          return currentDuration;
        }
        return prev + 1;
      })(currentTimeRef.current);

      currentTimeRef.current = newTime;
      lastPushedTimeRef.current = newTime;
      setCurrentTime(newTime);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(
    () => () => {
      if (bufferTimer.current) window.clearTimeout(bufferTimer.current);
    },
    [],
  );

  const session = useMemo<PlaybackSession>(
    () => ({
      id: currentItem ? `session-${currentItem.id}` : "session-idle",
      status,
      mode: repeatMode,
      source: currentSource,
      currentItem,
      queue: playbackQueue,
      history,
      startedAt: currentItem ? Date.now() : undefined,
    }),
    [currentItem, currentSource, history, playbackQueue, repeatMode, status],
  );

  // Memoize provider value to avoid recreating the object on every render
  const value = useMemo<PlaybackContext>(
    () => ({
      session,
      currentItem,
      currentTrack: currentItem,
      currentSource,
      playbackQueue,
      queue,
      upNext,
      history,
      isPlaying,
      isBuffering,
      isLive,
      status,
      progress,
      currentTime,
      duration,
      repeatMode,
      shuffleMode,
      volume,
      muted,
      liked,
      saved,
      isCasting,
      activeCastDevice,
      startCast,
      stopCast,
      playItem,
      playStation,
      playQueue,
      play,
      pause,
      resume,
      toggle,
      next,
      previous,
      prev: previous,
      seek,
      seekPct,
      toggleLike,
      toggleSave,
      addToQueue,
      playNext,
      removeFromQueue,
      clearQueue,
      enqueue: addToQueue,
      setPlaybackSource,
      setRepeatMode,
      toggleShuffle,
      setVolume,
      toggleMute,
    }),
    [
      session,
      currentItem,
      currentSource,
      playbackQueue,
      queue,
      upNext,
      history,
      isPlaying,
      isBuffering,
      isLive,
      status,
      progress,
      currentTime,
      duration,
      repeatMode,
      shuffleMode,
      volume,
      muted,
      liked,
      saved,
      isCasting,
      activeCastDevice,
      startCast,
      stopCast,
      playItem,
      playStation,
      playQueue,
      play,
      pause,
      resume,
      toggle,
      next,
      previous,
      seek,
      seekPct,
      toggleLike,
      toggleSave,
      addToQueue,
      playNext,
      removeFromQueue,
      clearQueue,
      setPlaybackSource,
      setRepeatMode,
      toggleShuffle,
      setVolume,
      toggleMute,
    ],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(event) => {
          const nextDuration = event.currentTarget.duration;
          if (Number.isFinite(nextDuration)) setDuration(nextDuration);
        }}
        onCanPlay={() => {
          if (status === "buffering") setStatus("playing");
        }}
        onPlaying={() => setStatus("playing")}
        onPause={() => {
          if (status === "playing") setStatus("paused");
        }}
        onWaiting={() => {
          if (status === "playing") setStatus("buffering");
        }}
        onTimeUpdate={(event) => {
          const audio = event.currentTarget;
          setCurrentTime(audio.currentTime);
          if (Number.isFinite(audio.duration)) setDuration(audio.duration);
        }}
        onEnded={() => nextRef.current()}
        onError={() => {
          if (currentItem?.src) setStatus("error");
        }}
      />
    </Ctx.Provider>
  );
};

export const usePlayer = (): PlaybackContext => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};

export const formatTime = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};
