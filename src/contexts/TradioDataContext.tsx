import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LIVE_RADIO } from "@/data/mockData";

export interface LiveRadioRoom {
  id: string;
  stationId: string;
  title: string;
  listenerCount: number;
  isLive: boolean;
  activeRequestId?: string;
}

export interface SongRequest {
  id: string;
  userId: string;
  stationId: string;
  trackTitle: string;
  artistName?: string;
  note?: string;
  status: "queued" | "approved" | "playing" | "played" | "declined";
  createdAt: string;
}

export interface TvCastSession {
  deviceId: string;
  deviceName: string;
  status: "connected" | "disconnected";
  currentItemId?: string;
  updatedAt: string;
}

export interface ReleasedTrack {
  id: string;
  artistId: string;
  artistName: string;
  title: string;
  description: string;
  releaseType: "instant" | "scheduled";
  releaseDate?: string;
  createdAt: string;
  moods: string[];
  energy: string[];
  vibeDescription: string;
  audioUrl?: string;
}

export type TradioRole = 'fan' | 'artist' | 'producer' | 'dj' | 'admin';

export interface DjRadioShow {
  name: string;
  description: string;
  vibe: string;
  slot: string;
  artwork?: string;
}

export interface ProducerBeat {
  id: string;
  producerId: string;
  producerName: string;
  title: string;
  bpm: number;
  keySig: string;
  basicPrice: number;
  premiumPrice: number;
  exclusivePrice: number;
  audioUrl?: string;
  createdAt: string;
}

export interface CustomPlaylist {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  tracks: any[];
  createdAt: string;
}

interface PersistedTradioData {
  liveRadioRooms: LiveRadioRoom[];
  songRequests: SongRequest[];
  tvCastSession: TvCastSession | null;
  releasedTracks: ReleasedTrack[];
  grantedRoles: Record<string, TradioRole>;
  playlists: CustomPlaylist[];
  djRadioShows: Record<string, DjRadioShow>;
  producerBeats: ProducerBeat[];
}

interface TradioDataState extends PersistedTradioData {
  submitSongRequest: (
    input: Omit<SongRequest, "id" | "status" | "createdAt">,
  ) => SongRequest;
  updateSongRequest: (requestId: string, status: SongRequest["status"]) => void;
  updateLiveRoom: (roomId: string, patch: Partial<LiveRadioRoom>) => void;
  setTvCastSession: (session: TvCastSession | null) => void;
  releaseTrack: (track: Omit<ReleasedTrack, "id" | "createdAt">) => ReleasedTrack;
  grantRole: (username: string, role: TradioRole) => void;
  createPlaylist: (title: string, description: string, tracks: any[]) => CustomPlaylist;
  savePlaylist: (playlist: CustomPlaylist) => void;
  updateDjRadioShow: (username: string, show: DjRadioShow) => void;
  addProducerBeat: (beat: Omit<ProducerBeat, 'id' | 'createdAt'>) => ProducerBeat;
}

const STORAGE_KEY = "tradio.platform.data";
const Context = createContext<TradioDataState | null>(null);

const DEFAULT_STATE: PersistedTradioData = {
  liveRadioRooms: LIVE_RADIO.map((station, index) => ({
    id: `room-${station.id}`,
    stationId: station.id,
    title: station.title,
    listenerCount: 180 + index * 73,
    isLive: true,
  })),
  songRequests: [],
  tvCastSession: null,
  releasedTracks: [],
  grantedRoles: {},
  playlists: [],
  djRadioShows: {},
  producerBeats: [],
};

function readState(): PersistedTradioData {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      releasedTracks: parsed.releasedTracks || [],
      grantedRoles: parsed.grantedRoles || {},
      playlists: parsed.playlists || [],
      djRadioShows: parsed.djRadioShows || {},
      producerBeats: parsed.producerBeats || [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function TradioDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedTradioData>(() => readState());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* local persistence is the mock adapter until Supabase is enabled */
    }
  }, [state]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setState(readState());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const submitSongRequest = useCallback(
    (input: Omit<SongRequest, "id" | "status" | "createdAt">) => {
      const request: SongRequest = {
        ...input,
        id: `request-${Date.now()}`,
        status: "queued",
        createdAt: new Date().toISOString(),
      };
      setState((current) => ({
        ...current,
        songRequests: [request, ...current.songRequests],
      }));
      return request;
    },
    [],
  );

  const updateSongRequest = useCallback(
    (requestId: string, status: SongRequest["status"]) => {
      setState((current) => ({
        ...current,
        songRequests: current.songRequests.map((request) =>
          request.id === requestId ? { ...request, status } : request,
        ),
      }));
    },
    [],
  );

  const updateLiveRoom = useCallback(
    (roomId: string, patch: Partial<LiveRadioRoom>) => {
      setState((current) => ({
        ...current,
        liveRadioRooms: current.liveRadioRooms.map((room) =>
          room.id === roomId ? { ...room, ...patch } : room,
        ),
      }));
    },
    [],
  );

  const setTvCastSession = useCallback((tvCastSession: TvCastSession | null) => {
    setState((current) => ({ ...current, tvCastSession }));
  }, []);

  const releaseTrack = useCallback(
    (input: Omit<ReleasedTrack, "id" | "createdAt">) => {
      const track: ReleasedTrack = {
        ...input,
        id: `track-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setState((current) => ({
        ...current,
        releasedTracks: [track, ...(current.releasedTracks || [])],
      }));
      return track;
    },
    [],
  );

  const grantRole = useCallback((username: string, role: TradioRole) => {
    setState((current) => ({
      ...current,
      grantedRoles: { ...current.grantedRoles, [username]: role },
    }));
  }, []);

  const createPlaylist = useCallback((title: string, description: string, tracks: any[]) => {
    const playlist: CustomPlaylist = {
      id: `custom-pl-${Date.now()}`,
      title,
      description,
      creatorName: 'Jordan R.',
      tracks,
      createdAt: new Date().toISOString(),
    };
    setState((current) => ({
      ...current,
      playlists: [playlist, ...(current.playlists || [])],
    }));
    return playlist;
  }, []);

  const savePlaylist = useCallback((playlist: CustomPlaylist) => {
    setState((current) => ({
      ...current,
      playlists: (current.playlists || []).map((p) => p.id === playlist.id ? playlist : p),
    }));
  }, []);

  const updateDjRadioShow = useCallback((username: string, show: DjRadioShow) => {
    setState((current) => ({
      ...current,
      djRadioShows: { ...current.djRadioShows, [username]: show },
    }));
  }, []);

  const addProducerBeat = useCallback((beatInput: Omit<ProducerBeat, 'id' | 'createdAt'>) => {
    const beat: ProducerBeat = {
      ...beatInput,
      id: `beat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState((current) => ({
      ...current,
      producerBeats: [beat, ...(current.producerBeats || [])],
    }));
    return beat;
  }, []);

  const value = useMemo<TradioDataState>(
    () => ({
      ...state,
      submitSongRequest,
      updateSongRequest,
      updateLiveRoom,
      setTvCastSession,
      releaseTrack,
      grantRole,
      createPlaylist,
      savePlaylist,
      updateDjRadioShow,
      addProducerBeat,
    }),
    [
      setTvCastSession,
      state,
      submitSongRequest,
      updateLiveRoom,
      updateSongRequest,
      releaseTrack,
      grantRole,
      createPlaylist,
      savePlaylist,
      updateDjRadioShow,
      addProducerBeat,
    ],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useTradioDataState(): TradioDataState {
  const value = useContext(Context);
  if (!value) throw new Error("useTradioDataState must be used within TradioDataProvider");
  return value;
}
