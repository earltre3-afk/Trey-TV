import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-browser';
import { updatePeakListeners } from './tradioLiveService';
import { treyITts } from '@/lib/trey-i/tts.server';

type TokenResponse = { ok?: true; token?: string; livekitUrl?: string; roomName?: string; error?: string };
type Role = 'host' | 'listener';

export interface LiveRoomState {
  connection: 'idle' | 'connecting' | 'connected' | 'error';
  listenerCount: number;
  micOn: boolean;
  error: string | null;
  toggleMic: () => Promise<void>;
  leave: () => void;
  aiSpeaking: boolean;
  aiSegmentLabel: string | null;
  aiSpeak: (text: string, label?: string) => Promise<void>;
  stopAi: () => void;
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
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiSegmentLabel, setAiSegmentLabel] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const destRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const aiTrackRef = useRef<any | null>(null);
  const aiSourceRef = useRef<AudioBufferSourceNode | null>(null);

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
      try { aiSourceRef.current?.stop(); } catch { /* ignore */ }
      aiSourceRef.current = null;
      try { if (aiTrackRef.current && roomRef.current) roomRef.current.localParticipant.unpublishTrack(aiTrackRef.current); aiTrackRef.current?.stop?.(); } catch { /* ignore */ }
      aiTrackRef.current = null;
      try { void audioCtxRef.current?.close(); } catch { /* ignore */ }
      audioCtxRef.current = null; destRef.current = null;
      setAiSpeaking(false); setAiSegmentLabel(null);
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

  const aiSpeak = async (text: string, label?: string) => {
    const room = roomRef.current;
    if (!room || role !== 'host' || !text.trim()) return;
    try {
      const res = await treyITts({ data: { text } });
      if (!res.audioBase64) { setError("AI voice isn't available right now."); return; }

      if (!audioCtxRef.current) {
        const Ctx: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        const dest = ctx.createMediaStreamDestination();
        audioCtxRef.current = ctx;
        destRef.current = dest;
        const { LocalAudioTrack } = await import('livekit-client');
        const track = new LocalAudioTrack(dest.stream.getAudioTracks()[0]);
        aiTrackRef.current = track;
        await room.localParticipant.publishTrack(track);
      }

      const ctx = audioCtxRef.current!;
      const dest = destRef.current!;
      if (ctx.state === 'suspended') await ctx.resume();

      const bytes = Uint8Array.from(atob(res.audioBase64), (c) => c.charCodeAt(0));
      const buffer = await ctx.decodeAudioData(bytes.buffer);

      try { aiSourceRef.current?.stop(); } catch { /* ignore */ }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(dest);
      aiSourceRef.current = src;

      await room.localParticipant.setMicrophoneEnabled(false);
      setMicOn(false);
      setAiSpeaking(true);
      setAiSegmentLabel(label ?? null);
      src.onended = () => { setAiSpeaking(false); setAiSegmentLabel(null); aiSourceRef.current = null; };
      src.start();
    } catch (err) {
      setAiSpeaking(false); setAiSegmentLabel(null);
      setError((err as Error).message);
    }
  };

  const stopAi = () => {
    try { aiSourceRef.current?.stop(); } catch { /* ignore */ }
    aiSourceRef.current = null;
    setAiSpeaking(false);
    setAiSegmentLabel(null);
  };

  return { connection, listenerCount, micOn, error, toggleMic, leave, aiSpeaking, aiSegmentLabel, aiSpeak, stopAi };
}
