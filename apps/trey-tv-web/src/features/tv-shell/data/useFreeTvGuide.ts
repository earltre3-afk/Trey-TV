import { useEffect, useState } from 'react';
import type { FreeTvGuideChannel, UseFreeTvGuideState } from './freeTvApi.types';
import { getFreeTvSchedule } from './freeTvApi';

type UseFreeTvGuideOptions = {
  fallbackChannels: FreeTvGuideChannel[];
};

export function useFreeTvGuide({ fallbackChannels }: UseFreeTvGuideOptions): UseFreeTvGuideState {
  const [state, setState] = useState<UseFreeTvGuideState>({
    channels: fallbackChannels,
    loading: true,
    error: null,
    source: 'fallback',
  });

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    async function loadSchedule() {
      try {
        const channels = await getFreeTvSchedule(controller.signal);
        if (!alive) return;

        if (channels.length === 0) {
          setState({
            channels: fallbackChannels,
            loading: false,
            error: 'Free TV schedule returned no channels yet.',
            source: 'fallback',
          });
          return;
        }

        setState({ channels, loading: false, error: null, source: 'api' });
      } catch (error) {
        if (!alive || controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Free TV schedule unavailable.';
        setState({ channels: fallbackChannels, loading: false, error: message, source: 'fallback' });
      }
    }

    loadSchedule();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [fallbackChannels]);

  return state;
}
