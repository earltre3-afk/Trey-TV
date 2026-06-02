import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-browser';
import { updatePeakListeners } from './tradioLiveService';

type TokenResponse = { ok?: true; token?: string; livekitUrl?: string; roomName?: string; error?: string };
type Role = 'host' | 'listener';

export interface LiveRoomState {
  connection: 'idle' | 'connecting' | 'connected' | 'error';
  listenerCount: number;
  micOn: boolean;
  error: string | null;
  toggleMic: () => Promise<void>;
  leave: () => void;
}

/** Connects to a tradio-show LiveKit room. Host publishes mic; listener subscribes to audio. */
export function useTradioLiveRoom(opts: { active: boolean; role: Role; sessionId: string | null }): LiveRoomState {
  const { active, role, sessionId } = opts;
  const [connection, setConnection] = useState<LiveRoomState['connection']>('idle');
  const [listenerCount, setListenerCount] = useState(0);
  const [micOn, setMicOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roomRef = useRef<any | null>(null);
  const audioElsRef = useRef<HTMLAudioElement[]>([]);

  useEffect(() => {
    if (!active || !sessionId) return;
    let cancelled = false;
    setConnection('connecting');

    (async () => {
      try {
        const supabase = createBrowserClient();
        const { data: sess } = await supabase.auth.getSession();
        const accessToken = sess.session?.access_token ?? '';
        const res = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}) },
          body: JSON.stringify({ roomKind: 'tradio-show', sessionId }),
        });
        const payload = (await res.json()) as TokenResponse;
        if (!res.ok || !payload.ok || !payload.token || !payload.livekitUrl) {
          throw new Error(payload.error || `token failed (${res.status})`);
        }

        const { Room, RoomEvent, Track } = await import('livekit-client');
        const room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;

        const recount = () => {
          // For a listener, audience = remote (host + others) ; for the host, audience = remote listeners.
          const count = room.remoteParticipants.size;
          setListenerCount(count);
          if (role === 'host' && sessionId) void updatePeakListeners(sessionId, count);
        };

        room.on(RoomEvent.ParticipantConnected, recount);
        room.on(RoomEvent.ParticipantDisconnected, recount);
        room.on(RoomEvent.TrackSubscribed, (track: any) => {
          if (track.kind === Track.Kind.Audio) {
            const el = track.attach() as HTMLAudioElement;
            el.autoplay = true;
            (el as any).playsInline = true;
            document.body.appendChild(el);
            audioElsRef.current.push(el);
          }
        });
        room.on(RoomEvent.TrackUnsubscribed, (track: any) => { try { track.detach().forEach((el: HTMLMediaElement) => el.remove()); } catch { /* ignore */ } });

        await room.connect(payload.livekitUrl, payload.token);
        if (cancelled) { room.disconnect(); return; }

        if (role === 'host') {
          await room.localParticipant.setMicrophoneEnabled(true);
          setMicOn(true);
        }
        recount();
        setConnection('connected');
      } catch (err) {
        if (!cancelled) { setError((err as Error).message); setConnection('error'); }
      }
    })();

    return () => {
      cancelled = true;
      try { roomRef.current?.disconnect(); } catch { /* ignore */ }
      audioElsRef.current.forEach((el) => el.remove());
      audioElsRef.current = [];
      roomRef.current = null;
      setConnection('idle');
      setListenerCount(0);
      setMicOn(false);
    };
  }, [active, role, sessionId]);

  const toggleMic = async () => {
    const room = roomRef.current;
    if (!room || role !== 'host') return;
    try {
      const next = !micOn;
      await room.localParticipant.setMicrophoneEnabled(next);
      setMicOn(next);
    } catch (err) { setError((err as Error).message); }
  };

  const leave = () => {
    try { roomRef.current?.disconnect(); } catch { /* ignore */ }
  };

  return { connection, listenerCount, micOn, error, toggleMic, leave };
}
