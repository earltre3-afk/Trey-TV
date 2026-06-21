import {
  PlayerProvider as CorePlayerProvider,
  formatTime,
  usePlayer as useCorePlayer,
  type PlaybackContext,
  type PlaybackItem,
} from "@/tradio/contexts/PlayerContext";

export interface PlayerTrack extends Omit<PlaybackItem, "artist"> {
  artist?: string;
  artwork?: string;
  streamUrl?: string;
  gradient?: string;
  year?: string;
  durationLabel?: string;
}

export interface Track extends PlayerTrack {
  artist: string;
  artwork: string;
  src: string;
}

export type RepeatMode = "off" | "all" | "one";

const toPlaybackItem = (track: PlayerTrack): PlaybackItem => ({
  ...track,
  artist: track.artist ?? "Tradio",
  art: track.artwork ?? track.art ?? track.coverUrl,
  coverUrl: track.artwork ?? track.coverUrl ?? track.art,
  src: track.src ?? track.streamUrl,
});

const toPlayerTrack = (track: PlaybackItem): PlayerTrack => ({
  ...track,
  artist: track.artist ?? "Tradio",
  artwork: track.coverUrl ?? track.art ?? undefined,
  streamUrl: track.src,
});

const repeatFromCore = (mode: PlaybackContext["repeatMode"]): RepeatMode => {
  if (mode === "repeat_one") return "one";
  if (mode === "repeat_all") return "all";
  return "off";
};

const repeatToCore = (mode: RepeatMode): PlaybackContext["repeatMode"] => {
  if (mode === "one") return "repeat_one";
  if (mode === "all") return "repeat_all";
  return "normal";
};

export const PlayerProvider = CorePlayerProvider;

export function usePlayer() {
  const core = useCorePlayer();
  const current = core.currentItem ? toPlayerTrack(core.currentItem) : null;
  const queue = [
    ...(current ? [current] : []),
    ...core.queue.map(toPlayerTrack),
  ];

  const playQueue = (tracks: PlayerTrack[], startIndex = 0) => {
    core.playQueue(tracks.map(toPlaybackItem), startIndex);
  };

  const playTrack = (track: PlayerTrack, tracks?: PlayerTrack[]) => {
    if (tracks?.length) {
      const index = tracks.findIndex((item) => item.id === track.id);
      playQueue(tracks, index >= 0 ? index : 0);
      return;
    }
    core.play(toPlaybackItem(track));
  };

  const setQueue = (tracks: PlayerTrack[]) => {
    core.clearQueue();
    tracks.map(toPlaybackItem).forEach(core.addToQueue);
  };

  const jumpToPos = (position: number) => {
    if (position < 0 || position >= queue.length) return;
    playQueue(queue, position);
  };

  const moveQueueItem = (fromPosition: number, toPosition: number) => {
    if (
      fromPosition < 0 ||
      toPosition < 0 ||
      fromPosition >= queue.length ||
      toPosition >= queue.length ||
      fromPosition === toPosition
    ) {
      return;
    }
    const reordered = [...queue];
    const [moved] = reordered.splice(fromPosition, 1);
    reordered.splice(toPosition, 0, moved);
    const activeId = current?.id;
    const activeIndex = Math.max(0, reordered.findIndex((item) => item.id === activeId));
    playQueue(reordered, activeIndex);
  };

  const cycleRepeat = () => {
    const repeat = repeatFromCore(core.repeatMode);
    core.setRepeatMode(repeatToCore(repeat === "off" ? "all" : repeat === "all" ? "one" : "off"));
  };

  const toggleRepeat = () => {
    const repeat = repeatFromCore(core.repeatMode);
    core.setRepeatMode(repeatToCore(repeat === "off" ? "all" : "off"));
  };

  return {
    ...core,
    current,
    currentTrack: current,
    queue,
    currentPos: current ? 0 : -1,
    playing: core.isPlaying,
    elapsed: core.currentTime,
    shuffle: core.shuffleMode,
    repeat: repeatFromCore(core.repeatMode),
    loading: core.isBuffering,
    playTrack,
    playQueue,
    setQueue,
    jumpToPos,
    moveQueueItem,
    seekRatio: (ratio: number) => core.seekPct(Math.max(0, Math.min(1, ratio)) * 100),
    seekPct: (ratio: number) => core.seekPct(Math.max(0, Math.min(1, ratio)) * 100),
    cycleRepeat,
    toggleRepeat,
  };
}

export { formatTime };
export const fmt = formatTime;
