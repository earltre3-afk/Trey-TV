import { useCallback, useEffect, useState } from 'react';
import {
  fetchTradioData,
  getMockTradioData,
  TradioData,
  useSupabaseTradioData,
} from './api';
import { GRADIENTS, TradioItem } from './mockData';
import { useSaved } from '@/contexts/SavedContext';

interface State {
  data: TradioData | null;
  loading: boolean;
  error: string | null;
}

export function useTradioData(): State & { reload: () => void } {
  const getInitialTradioData = () =>
    useSupabaseTradioData ? null : getMockTradioData();
  const [state, setState] = useState<State>(() => {
    const initialData = getInitialTradioData();
    return { data: initialData, loading: !initialData, error: null };
  });
  const { savedPlaylists, recentlyPlayed } = useSaved();

  const load = useCallback(() => {
    const initialData = getInitialTradioData();
    if (initialData) {
      setState({ data: initialData, loading: false, error: null });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));
    fetchTradioData()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e) => setState({ data: null, loading: false, error: e?.message ?? 'Failed to load' }));
  }, []);

  useEffect(() => {
    if (useSupabaseTradioData) load();
  }, [load]);

  const createdPlaylistItems: TradioItem[] = savedPlaylists.map((p, index) => ({
    id: p.id,
    title: p.title,
    subtitle: `${p.visibility ?? 'private'} playlist`,
    gradient: [GRADIENTS.sunset, GRADIENTS.city, GRADIENTS.violet][index % 3],
    label: p.tracks?.length ? `${p.tracks.length} tracks` : 'Created',
  }));

  const recentItems: TradioItem[] = recentlyPlayed.map((t, index) => ({
    id: t.id,
    title: t.title,
    subtitle: t.artist ?? 'Tradio',
    gradient: t.gradient ?? [GRADIENTS.city, GRADIENTS.purplePink, GRADIENTS.cyanBlue][index % 3],
    streamUrl: t.streamUrl ?? t.src,
  }));

  const data = state.data
    ? {
        ...state.data,
        recentlyPlayed: recentItems.length ? recentItems : state.data.recentlyPlayed,
        featuredPlaylists: [...createdPlaylistItems, ...state.data.featuredPlaylists],
        allPlaylists: [...createdPlaylistItems, ...state.data.allPlaylists.filter((p) => !createdPlaylistItems.some((c) => c.id === p.id))],
      }
    : null;

  return { ...state, data, reload: load };
}
