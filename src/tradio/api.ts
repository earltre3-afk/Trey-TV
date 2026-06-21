import { supabase } from '@/lib/supabase';
import { TradioItem, Track, GRADIENTS } from './mockData';
import {
  ALL_LIVE_STATIONS,
  CURATED_STREAMS,
  DECADES,
  FEATURED_PLAYLISTS,
  GENRES,
  IMAGES,
  LIVE_RADIO,
  MOODS,
  PLAYLIST_DETAIL,
  RELEASES,
  RELATED_ARTISTS,
  TOP_TRACKS,
  ARTIST,
} from '@/data/mockData';

type ApiRow = Record<string, unknown> & {
  id: string;
  title?: string;
  name?: string;
  subtitle?: string;
  artist?: string;
  gradient?: string;
  icon?: TradioItem['icon'];
  label?: string | null;
  stream_url?: string;
  image?: string;
  artwork?: string;
  num?: number;
  duration?: string;
  track_id?: string;
};

export const useSupabaseTradioData =
  import.meta.env.VITE_TRADIO_DATA_SOURCE === 'supabase';

function getReleasedTracksFromStorage(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('tradio.platform.data');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.releasedTracks || [];
  } catch {
    return [];
  }
}

export interface TradioData {
  featuredPlaylists: TradioItem[];
  liveRadioStations: TradioItem[];
  recentlyPlayed: TradioItem[];
  genres: TradioItem[];
  moods: TradioItem[];
  decades: TradioItem[];
  stationList: TradioItem[];
  artistStreams: TradioItem[];
  topTracks: TradioItem[];
  discography: TradioItem[];
  relatedArtists: TradioItem[];
  savedAlbums: TradioItem[];
  albumTracks: Track[];
  // full collections for library filtering / save lookups
  allPlaylists: TradioItem[];
  allAlbums: TradioItem[];
  allArtists: TradioItem[];
  allStations: TradioItem[];
}

const toItem = (r: ApiRow, titleKey: string = 'title'): TradioItem => ({
  id: r.id,
  title: String(r[titleKey] ?? r.title ?? r.name ?? 'Tradio'),
  subtitle: r.subtitle ?? r.artist ?? undefined,
  gradient: r.gradient ?? GRADIENTS.violet,
  icon: (r.icon ?? null) as TradioItem['icon'],
  label: r.label ?? null,
  streamUrl: r.stream_url ?? undefined,
  image: r.image ?? r.artwork ?? undefined,
});

const toTrack = (t: ApiRow, artist = 'Aether Echo'): Track => ({
  id: t.id, num: t.num ?? 0, title: String(t.title ?? 'Untitled'), duration: t.duration ?? '0:00',
  streamUrl: t.stream_url, artist: t.artist ?? artist, gradient: t.gradient ?? GRADIENTS.city,
});

const fromImageItem = (
  item: { id: string; title?: string; name?: string; subtitle?: string; sub?: string; image?: string; tone?: string; big?: string },
  fallbackGradient = GRADIENTS.city,
): TradioItem => ({
  id: item.id,
  title: item.title ?? item.name ?? item.big ?? 'Tradio',
  subtitle: item.subtitle ?? item.sub,
  gradient: fallbackGradient,
  label: item.big ?? null,
  icon: null,
  image: item.image,
});

const playlistTracks: Track[] = PLAYLIST_DETAIL.tracks.map((t) => ({
  id: t.id,
  num: t.n,
  title: t.title,
  duration: t.time,
  streamUrl: t.src,
  artist: t.artist,
  gradient: GRADIENTS.city,
}));

export function getMockTradioData(): TradioData {
  const featured = FEATURED_PLAYLISTS.map((p, i) => fromImageItem(p, [GRADIENTS.purplePink, GRADIENTS.sunset, GRADIENTS.cyanBlue][i % 3]));
  const stationItems = [
    ...LIVE_RADIO.map((s, i) => fromImageItem(s, [GRADIENTS.red, GRADIENTS.teal, GRADIENTS.navy][i % 3])),
    ...ALL_LIVE_STATIONS.map((s, i) => fromImageItem(s, [GRADIENTS.violet, GRADIENTS.city, GRADIENTS.pinkPurple][i % 3])),
  ];
  const artistItems = [
    { id: 'artist-trey', title: ARTIST, subtitle: 'Official Artist Radio', gradient: GRADIENTS.sunset, image: IMAGES.treyHero },
    ...RELATED_ARTISTS.map((a, i) => ({
      id: a.id,
      title: a.name,
      subtitle: 'Artist',
      gradient: [GRADIENTS.cyanBlue, GRADIENTS.pinkPurple, GRADIENTS.teal][i % 3],
      image: a.image,
    })),
  ];
  const albumItems = RELEASES.map((r, i) => ({
    id: r.id,
    title: r.title,
    subtitle: r.meta,
    gradient: [GRADIENTS.city, GRADIENTS.violet, GRADIENTS.purplePink, GRADIENTS.navy][i % 4],
    image: r.image,
  }));

  return {
    featuredPlaylists: featured,
    liveRadioStations: stationItems.slice(0, 4),
    recentlyPlayed: albumItems.slice(0, 4),
    genres: GENRES.map((g, i) => fromImageItem(g, [GRADIENTS.navy, GRADIENTS.city, GRADIENTS.teal][i % 3])),
    moods: MOODS.map((m, i) => fromImageItem(m, [GRADIENTS.teal, GRADIENTS.sunset, GRADIENTS.violet][i % 3])),
    decades: DECADES.map((d, i) => ({
      id: d.id,
      title: d.title,
      subtitle: 'Decade Mix',
      gradient: [GRADIENTS.red, GRADIENTS.navy, GRADIENTS.sunset][i % 3],
      label: d.big,
      icon: 'text',
    })),
    stationList: stationItems,
    artistStreams: [
      ...CURATED_STREAMS.map((s, i) => fromImageItem(s, [GRADIENTS.cyanBlue, GRADIENTS.violet][i % 2])),
      ...artistItems,
    ],
    topTracks: TOP_TRACKS.map((t, i) => ({
      id: t.id,
      title: t.title,
      subtitle: t.artist,
      gradient: [GRADIENTS.sunset, GRADIENTS.city, GRADIENTS.purplePink][i % 3],
      streamUrl: t.src,
      image: t.image,
    })),
    discography: albumItems,
    relatedArtists: artistItems.slice(1),
    savedAlbums: albumItems.slice(0, 2),
    albumTracks: playlistTracks,
    allPlaylists: featured,
    allAlbums: albumItems,
    allArtists: artistItems,
    allStations: stationItems,
  };
}

export async function fetchTradioData(): Promise<TradioData> {
  if (!useSupabaseTradioData) return getMockTradioData();

  try {
    const [playlists, stations, artists, albums, tracks] = await Promise.all([
      supabase.from('tradio_playlists').select('*').order('sort'),
      supabase.from('tradio_stations').select('*').order('sort'),
      supabase.from('tradio_artists').select('*').order('sort'),
      supabase.from('tradio_albums').select('*').order('sort'),
      supabase.from('tradio_tracks').select('*').order('sort'),
    ]);

    const firstErr = playlists.error || stations.error || artists.error || albums.error || tracks.error;
    if (firstErr) throw firstErr;

    const pl = (playlists.data ?? []) as ApiRow[];
    const st = (stations.data ?? []) as ApiRow[];
    const ar = (artists.data ?? []) as ApiRow[];
    const al = (albums.data ?? []) as ApiRow[];
    const tr = (tracks.data ?? []) as ApiRow[];

    const byCat = (cat: string) => pl.filter((p) => p.category === cat).map((p) => toItem(p));

    return {
      featuredPlaylists: byCat('featured'),
      genres: byCat('genre'),
      moods: byCat('mood'),
      decades: byCat('decade'),
      liveRadioStations: st.filter((s) => s.kind === 'live').map((s) => toItem(s)),
      stationList: st.filter((s) => s.kind === 'station_list').map((s) => toItem(s)),
      artistStreams: ar.filter((a) => a.category === 'stream').map((a) => toItem(a, 'name')),
      relatedArtists: ar.filter((a) => a.category === 'related').map((a) => toItem(a, 'name')),
      recentlyPlayed: al.filter((a) => a.is_recent).map((a) => toItem(a)),
      savedAlbums: al.filter((a) => a.is_saved).map((a) => toItem(a)),
      discography: al.filter((a) => a.is_featured).map((a) => toItem(a)),
      topTracks: al.filter((a) => ['t1', 't2', 't3'].includes(a.id)).map((a) => toItem(a)),
      albumTracks: tr.map((t) => toTrack(t)),
      allPlaylists: pl.map((p) => toItem(p)),
      allAlbums: al.map((a) => toItem(a)),
      allArtists: ar.map((a) => toItem(a, 'name')),
      allStations: st.map((s) => toItem(s)),
    };
  } catch {
    return getMockTradioData();
  }
}

export interface ArtistDetail {
  artist: TradioItem;
  topTracks: Track[];
  discography: TradioItem[];
  relatedArtists: TradioItem[];
}

export async function fetchArtistById(id: string): Promise<ArtistDetail> {
  if (!useSupabaseTradioData) {
    const data = getMockTradioData();
    const artist = data.allArtists.find((item) => item.id === id) ?? data.allArtists[0];

    const allReleased = getReleasedTracksFromStorage();
    const artistReleased = allReleased.filter((t) => {
      const matchesArtist = t.artistId === id || t.artistName.toLowerCase() === artist.title.toLowerCase();
      if (!matchesArtist) return false;
      if (t.releaseType === 'instant') return true;
      if (t.releaseDate) {
        return new Date(t.releaseDate).getTime() <= Date.now();
      }
      return true;
    });

    const customTracksMapped: Track[] = artistReleased.map((ct, idx) => ({
      id: ct.id,
      num: idx + 1,
      title: ct.title,
      duration: '3:45',
      artist: ct.artistName,
      gradient: GRADIENTS.violet,
      streamUrl: ct.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    }));

    return {
      artist,
      topTracks: [
        ...customTracksMapped,
        ...playlistTracks.slice(0, 5).map((track) => ({ ...track, artist: artist.title })),
      ],
      discography: data.discography,
      relatedArtists: data.relatedArtists.filter((item) => item.id !== artist.id),
    };
  }

  try {
    const [artistRes, artistsRes, albumsRes, tracksRes] = await Promise.all([
    supabase.from('tradio_artists').select('*').eq('id', id).maybeSingle(),
    supabase.from('tradio_artists').select('*').order('sort'),
    supabase.from('tradio_albums').select('*').eq('artist_id', id).order('sort'),
    supabase.from('tradio_tracks').select('*').eq('artist_id', id).order('num'),
    ]);

    const err = artistRes.error || artistsRes.error;
    if (err) throw err;

    const row = artistRes.data as ApiRow | null;
    const allArtists = (artistsRes.data ?? []) as ApiRow[];
    let albumsByArtist = (albumsRes.data ?? []) as ApiRow[];
    let tracksByArtist = (tracksRes.data ?? []) as ApiRow[];

    const artist: TradioItem = row
      ? toItem(row, 'name')
      : { id, title: 'Unknown Artist', gradient: GRADIENTS.violet };
    const name = artist.title;

    // fallbacks if this artist has no rows linked yet
    if (!tracksByArtist.length) {
      const fb = await supabase.from('tradio_tracks').select('*').order('num').limit(5);
      tracksByArtist = (fb.data ?? []) as ApiRow[];
    }
    if (!albumsByArtist.length) {
      const fb = await supabase.from('tradio_albums').select('*').eq('is_featured', true).order('sort');
      albumsByArtist = (fb.data ?? []) as ApiRow[];
    }

    const topTracks = tracksByArtist.slice(0, 5).map((t) => toTrack(t, name));
    const discography = albumsByArtist.map((a) => toItem(a));

    const relatedArtists = allArtists
      .filter((a) => a.id !== id)
      .slice(0, 8)
      .map((a) => toItem(a, 'name'));

    return { artist, topTracks, discography, relatedArtists };
  } catch {
    const data = getMockTradioData();
    const artist = data.allArtists.find((a) => a.id === id) ?? data.allArtists[0];
    return {
      artist,
      topTracks: playlistTracks.slice(0, 5).map((t) => ({ ...t, artist: artist.title })),
      discography: data.discography,
      relatedArtists: data.relatedArtists.filter((a) => a.id !== artist.id),
    };
  }
}

export interface PlaylistDetail {
  playlist: TradioItem;
  tracks: Track[];
}

function durToSec(d?: string): number {
  if (!d) return 0;
  const [m, s] = d.split(':').map((n) => parseInt(n, 10) || 0);
  return m * 60 + s;
}

export async function fetchPlaylistTracks(playlistId: string): Promise<PlaylistDetail> {
  if (!useSupabaseTradioData) {
    const data = getMockTradioData();
    const playlist = data.allPlaylists.find((item) => item.id === playlistId) ?? data.allPlaylists[0] ?? {
      id: playlistId,
      title: PLAYLIST_DETAIL.title,
      subtitle: PLAYLIST_DETAIL.artist,
      gradient: GRADIENTS.city,
    };
    return { playlist, tracks: playlistTracks };
  }

  try {
    const [plRes, joinRes, tracksRes] = await Promise.all([
    supabase.from('tradio_playlists').select('*').eq('id', playlistId).maybeSingle(),
    supabase.from('tradio_playlist_tracks').select('*').eq('playlist_id', playlistId).order('position'),
    supabase.from('tradio_tracks').select('*'),
    ]);
    if (plRes.error) throw plRes.error;

    const row = plRes.data;
    const playlist: TradioItem = row
      ? toItem(row)
      : { id: playlistId, title: 'Playlist', gradient: GRADIENTS.violet };

    const trackMap = new Map(((tracksRes.data ?? []) as ApiRow[]).map((t) => [t.id, t]));
    const ordered = ((joinRes.data ?? []) as ApiRow[])
      .map((j) => (j.track_id ? trackMap.get(j.track_id) : undefined))
      .filter((t): t is ApiRow => Boolean(t));

    const tracks = ordered.map((t) => toTrack(t, playlist.subtitle ?? 'Tradio'));
    return { playlist, tracks };
  } catch {
    const data = getMockTradioData();
    const playlist = data.allPlaylists.find((p) => p.id === playlistId) ?? data.allPlaylists[0] ?? {
      id: playlistId,
      title: PLAYLIST_DETAIL.title,
      subtitle: PLAYLIST_DETAIL.artist,
      gradient: GRADIENTS.city,
    };
    return { playlist, tracks: playlistTracks };
  }
}

export const totalDurationSec = (tracks: Track[]) =>
  tracks.reduce((sum, t) => sum + durToSec(t.duration), 0);


export interface SearchResults {
  artists: TradioItem[];
  albums: TradioItem[];
  stations: TradioItem[];
}

export async function fetchTradioSearch(q: string): Promise<SearchResults> {
  if (!useSupabaseTradioData) {
    const data = getMockTradioData();
    const query = q.trim().toLowerCase();
    const match = (item: TradioItem) =>
      item.title.toLowerCase().includes(query) || (item.subtitle ?? '').toLowerCase().includes(query);
    return {
      artists: data.allArtists.filter(match),
      albums: data.allAlbums.filter(match),
      stations: data.allStations.filter(match),
    };
  }

  try {
    const like = `%${q}%`;
    const [artists, albums, stations] = await Promise.all([
      supabase.from('tradio_artists').select('*').or(`name.ilike.${like},subtitle.ilike.${like}`).limit(12),
      supabase.from('tradio_albums').select('*').or(`title.ilike.${like},artist.ilike.${like}`).limit(12),
      supabase.from('tradio_stations').select('*').or(`title.ilike.${like},subtitle.ilike.${like}`).limit(12),
    ]);
    return {
      artists: ((artists.data ?? []) as ApiRow[]).map((a) => toItem(a, 'name')),
      albums: ((albums.data ?? []) as ApiRow[]).map((a) => toItem(a)),
      stations: ((stations.data ?? []) as ApiRow[]).map((s) => toItem(s)),
    };
  } catch {
    const data = getMockTradioData();
    const query = q.trim().toLowerCase();
    const match = (item: TradioItem) =>
      item.title.toLowerCase().includes(query) || (item.subtitle ?? '').toLowerCase().includes(query);
    return {
      artists: data.allArtists.filter(match),
      albums: data.allAlbums.filter(match),
      stations: data.allStations.filter(match),
    };
  }
}
