import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PlayerTrack } from '@/tradio/PlayerContext';

export type SavedKind = 'track' | 'album' | 'artist' | 'station' | 'playlist';

export interface SavedRecord {
  item_id: string;
  kind: SavedKind;
}

export interface SavedPlaylist {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  ownerId?: string;
  visibility?: 'private' | 'unlisted' | 'public';
  tracks?: PlayerTrack[];
  createdAt?: string;
}

export interface CreatePlaylistInput {
  title: string;
  subtitle?: string;
  image?: string;
  visibility?: 'private' | 'unlisted' | 'public';
  tracks?: PlayerTrack[];
}

interface PersistedSavedState {
  records: SavedRecord[];
  savedTracks: PlayerTrack[];
  savedPlaylists: SavedPlaylist[];
  createdPlaylists: SavedPlaylist[];
  recentlyPlayed: PlayerTrack[];
}

interface SavedState {
  records: SavedRecord[];
  ids: string[];
  version: number;
  savedTracks: PlayerTrack[];
  savedPlaylists: SavedPlaylist[];
  createdPlaylists: SavedPlaylist[];
  recentlyPlayed: PlayerTrack[];
  has: (id: string) => boolean;
  byKind: (kind: SavedKind) => string[];
  toggle: (id: string, kind: SavedKind) => void;
  isTrackSaved: (id: string) => boolean;
  isPlaylistSaved: (id: string) => boolean;
  toggleTrack: (track: PlayerTrack) => void;
  togglePlaylist: (playlist: SavedPlaylist) => void;
  createPlaylist: (input: CreatePlaylistInput) => SavedPlaylist;
  addTrackToPlaylist: (playlistId: string, track: PlayerTrack) => void;
  recordRecentlyPlayed: (track: PlayerTrack) => void;
}

const STORAGE_KEY = 'tradio.platform.saved';
const Ctx = createContext<SavedState | undefined>(undefined);

const EMPTY_STATE: PersistedSavedState = {
  records: [],
  savedTracks: [],
  savedPlaylists: [],
  createdPlaylists: [],
  recentlyPlayed: [],
};

function readPersisted(): PersistedSavedState {
  if (typeof window === 'undefined') return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    return { ...EMPTY_STATE, ...(JSON.parse(raw) as PersistedSavedState) };
  } catch {
    return EMPTY_STATE;
  }
}

function uniqueRecords(records: SavedRecord[]): SavedRecord[] {
  const seen = new Set<string>();
  return records.filter((r) => {
    const key = `${r.kind}:${r.item_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function withoutRecord(records: SavedRecord[], id: string, kind?: SavedKind): SavedRecord[] {
  return records.filter((r) => !(r.item_id === id && (!kind || r.kind === kind)));
}

function upsertRecord(records: SavedRecord[], id: string, kind: SavedKind): SavedRecord[] {
  return uniqueRecords([...records, { item_id: id, kind }]);
}

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedSavedState>(() => readPersisted());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* local persistence is best-effort */
    }
    setVersion((v) => v + 1);
  }, [state]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setState(readPersisted());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const has = useCallback((id: string) => state.records.some((r) => r.item_id === id), [state.records]);

  const byKind = useCallback(
    (kind: SavedKind) => state.records.filter((r) => r.kind === kind).map((r) => r.item_id),
    [state.records],
  );

  const toggle = useCallback((id: string, kind: SavedKind) => {
    setState((prev) => {
      const exists = prev.records.some((r) => r.item_id === id && r.kind === kind);
      return {
        ...prev,
        records: exists ? withoutRecord(prev.records, id, kind) : upsertRecord(prev.records, id, kind),
      };
    });
  }, []);

  const toggleTrack = useCallback((track: PlayerTrack) => {
    setState((prev) => {
      const exists = prev.savedTracks.some((t) => t.id === track.id);
      return {
        ...prev,
        savedTracks: exists ? prev.savedTracks.filter((t) => t.id !== track.id) : [track, ...prev.savedTracks],
        records: exists ? withoutRecord(prev.records, track.id, 'track') : upsertRecord(prev.records, track.id, 'track'),
      };
    });
  }, []);

  const togglePlaylist = useCallback((playlist: SavedPlaylist) => {
    setState((prev) => {
      const exists = prev.savedPlaylists.some((p) => p.id === playlist.id);
      return {
        ...prev,
        savedPlaylists: exists
          ? prev.savedPlaylists.filter((p) => p.id !== playlist.id)
          : [{ visibility: 'private', ...playlist }, ...prev.savedPlaylists],
        records: exists
          ? withoutRecord(prev.records, playlist.id, 'playlist')
          : upsertRecord(prev.records, playlist.id, 'playlist'),
      };
    });
  }, []);

  const createPlaylist = useCallback((input: CreatePlaylistInput): SavedPlaylist => {
    const playlist: SavedPlaylist = {
      id: `created-${Date.now()}`,
      title: input.title.trim() || 'Untitled Playlist',
      subtitle: input.subtitle ?? 'Created on Tradio',
      image: input.image,
      ownerId: 'current-user',
      visibility: input.visibility ?? 'private',
      tracks: input.tracks ?? [],
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      createdPlaylists: [playlist, ...prev.createdPlaylists],
      savedPlaylists: [playlist, ...prev.savedPlaylists.filter((p) => p.id !== playlist.id)],
      records: upsertRecord(prev.records, playlist.id, 'playlist'),
    }));
    return playlist;
  }, []);

  const addTrackToPlaylist = useCallback((playlistId: string, track: PlayerTrack) => {
    const add = (playlist: SavedPlaylist) => {
      const tracks = playlist.tracks ?? [];
      if (tracks.some((t) => t.id === track.id)) return playlist;
      return { ...playlist, tracks: [...tracks, track] };
    };
    setState((prev) => ({
      ...prev,
      createdPlaylists: prev.createdPlaylists.map((p) => (p.id === playlistId ? add(p) : p)),
      savedPlaylists: prev.savedPlaylists.map((p) => (p.id === playlistId ? add(p) : p)),
    }));
  }, []);

  const recordRecentlyPlayed = useCallback((track: PlayerTrack) => {
    setState((prev) => {
      const latest = prev.recentlyPlayed[0];
      if (
        latest?.id === track.id &&
        latest.title === track.title &&
        latest.artist === track.artist
      ) {
        return prev;
      }
      return {
        ...prev,
        recentlyPlayed: [track, ...prev.recentlyPlayed.filter((t) => t.id !== track.id)].slice(0, 24),
      };
    });
  }, []);

  const value = useMemo<SavedState>(() => {
    const playlistMap = new Map<string, SavedPlaylist>();
    [...state.createdPlaylists, ...state.savedPlaylists].forEach((p) => playlistMap.set(p.id, p));
    const mergedPlaylists = Array.from(playlistMap.values());
    return {
      ...state,
      savedPlaylists: mergedPlaylists,
      ids: state.records.map((r) => r.item_id),
      version,
      has,
      byKind,
      toggle,
      isTrackSaved: (id: string) => state.savedTracks.some((t) => t.id === id) || state.records.some((r) => r.item_id === id && r.kind === 'track'),
      isPlaylistSaved: (id: string) => mergedPlaylists.some((p) => p.id === id) || state.records.some((r) => r.item_id === id && r.kind === 'playlist'),
      toggleTrack,
      togglePlaylist,
      createPlaylist,
      addTrackToPlaylist,
      recordRecentlyPlayed,
    };
  }, [addTrackToPlaylist, byKind, createPlaylist, has, recordRecentlyPlayed, state, toggle, togglePlaylist, toggleTrack, version]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSaved(): SavedState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSaved must be used within SavedProvider');
  return ctx;
}

export async function loadSaved(_userId?: string): Promise<SavedRecord[]> {
  return readPersisted().records;
}

export async function mergeDeviceIntoUser(_userId?: string): Promise<void> {
  return Promise.resolve();
}

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'dev_anon';
  const key = 'tradio_device_id';
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = `dev_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    window.localStorage.setItem(key, id);
  }
  return id;
}
