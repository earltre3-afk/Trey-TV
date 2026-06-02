import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/tradio/lib/supabaseClient';
import { listCallRequests, type CallRequest } from './tradioCallerService';

/** Realtime subscription to a session's call-in queue (mirrors useTradioLiveInteraction). */
export function useTradioCallers(opts: { sessionId: string | null }) {
  const { sessionId } = opts;
  const [calls, setCalls] = useState<CallRequest[]>([]);

  const reload = useCallback(async () => {
    if (sessionId) setCalls(await listCallRequests(sessionId));
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !supabase) return;
    void reload();
    const ch = supabase
      .channel(`tradio-callers:${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tradio_live_call_requests', filter: `session_id=eq.${sessionId}` }, () => void reload())
      .subscribe();
    return () => { void supabase!.removeChannel(ch); };
  }, [sessionId, reload]);

  return { calls, reload };
}
