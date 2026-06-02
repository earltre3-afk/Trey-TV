import type {
  Beat,
  DJMix,
  Release,
  ScheduleItem,
  Station,
} from './data';
import type { SongWarBattle } from './songwars/types';
import type { PlaybackItem, PlaybackSource, Track } from '@/tradio/contexts/PlayerContext';

export const trackToPlaybackItem = (
  track: Track,
  source?: Partial<PlaybackSource>
): PlaybackItem => ({
  ...track,
  sourceType: source?.type || track.sourceType || 'song',
  sourceLabel: source?.label || track.sourceLabel || 'Song',
});

export const releaseToPlaybackItem = (release: Release): PlaybackItem => ({
  id: release.id,
  title: release.title,
  artist: release.artist,
  art: release.artwork,
  coverUrl: release.artwork,
  duration: 205,
  sourceType: 'instant_release',
  sourceLabel: 'Release',
});

export const beatToPlaybackItem = (beat: Beat): PlaybackItem => ({
  id: beat.id,
  title: beat.title,
  artist: beat.producerName,
  art: beat.artwork,
  coverUrl: beat.artwork,
  src: beat.previewUrl,
  duration: beat.duration,
  sourceType: 'producer_beat',
  sourceLabel: 'Beat',
  bpm: beat.bpm,
  musicalKey: beat.key,
  mood: beat.mood,
  genre: beat.genre,
  context: {
    beat: {
      beatId: beat.id,
      producerName: beat.producerName,
      bpm: beat.bpm,
      musicalKey: beat.key,
      mood: beat.mood,
      genre: beat.genre,
      licenseLabel: beat.price ? `${beat.price} credits` : 'Available for pitch',
    },
  },
});

export const djMixToPlaybackItem = (mix: DJMix): PlaybackItem => ({
  id: mix.id,
  title: mix.title,
  artist: mix.djName,
  art: mix.artwork,
  coverUrl: mix.artwork,
  duration: mix.duration,
  sourceType: 'dj_mix',
  sourceLabel: 'DJ Mix',
  genre: mix.genre,
});

export const stationToPlaybackSource = (station: Station): PlaybackSource => ({
  id: station.id,
  type: station.owner ? 'artist_station' : 'station',
  label: station.owner ? 'Artist Station' : 'Station',
  title: station.title,
  subtitle: station.owner?.name || station.genre,
  image: station.image,
  isLive: true,
  listenerCount: station.followers,
});

export const scheduleToPlaybackSource = (item: ScheduleItem): PlaybackSource => ({
  id: item.id,
  type: item.type === 'dj-show' ? 'live_show' : item.type === 'replay' ? 'replay' : 'station',
  label: item.type === 'dj-show' ? 'Live Show' : item.type === 'replay' ? 'Replay' : 'Live Radio',
  title: item.title,
  subtitle: item.artist || item.station,
  image: item.image,
  isLive: item.status === 'live',
  listenerCount: item.listeners,
});

export const scheduleToPlaybackItem = (item: ScheduleItem): PlaybackItem => ({
  id: item.id,
  title: item.title,
  artist: item.artist || item.station || 'Tradio Network',
  art: item.image,
  coverUrl: item.image,
  duration: item.status === 'live' ? 0 : 1800,
  station: item.station,
  sourceType: item.type === 'replay' ? 'replay' : item.type === 'dj-show' ? 'live_show' : 'station',
  sourceLabel: item.type === 'replay' ? 'Replay' : item.type === 'dj-show' ? 'Live Show' : 'Live Radio',
  isLive: item.status === 'live',
  context: {
    liveShow: {
      showId: item.id,
      showTitle: item.title,
      hostName: item.artist,
      stationName: item.station,
      listenerCount: item.listeners,
    },
  },
});

export const songWarRoundToPlaybackItem = (
  battle: SongWarBattle,
  corner: 'A' | 'B',
  roundIndex = battle.currentRoundIndex || 0
): PlaybackItem => {
  const round = battle.rounds[roundIndex] || battle.rounds[0];
  const track = corner === 'A' ? round.trackA : round.trackB;
  const artist = corner === 'A' ? battle.artistA : battle.artistB;
  const votingStatus = round.status === 'pending' ? 'playing' : round.status;

  return {
    ...track,
    artist: artist.name,
    duration: round.duration,
    station: artist.station,
    sourceType: 'song_war_round',
    sourceLabel: 'Song War',
    context: {
      songWars: {
        battleId: battle.id,
        battleName: battle.title,
        roundNumber: round.roundNumber,
        artistA: battle.artistA.name,
        artistB: battle.artistB.name,
        activeCorner: corner,
        votingStatus,
      },
    },
  };
};
