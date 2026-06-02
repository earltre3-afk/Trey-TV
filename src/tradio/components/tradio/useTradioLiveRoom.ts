import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-browser';
import { updatePeakListeners } from './tradioLiveService';
import { treyITts } from '@/lib/trey-i/tts.server';
import { createHostMix, type HostMix } from '@/lib/tradio/tradioHostMix';

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
  // Host broadcast-bus controls (no-ops for listeners / before connect).
  playSfx: (id: string) => void;
  playBed: (id: string) => void;
  stopBed: () => void;
  setMasterVolume: (v: number) => void;
  setBedVolume: (v: number) => void;
  getAnalyser: () => AnalyserNode | null;
}

const MASTER_LIVE = 0.85;

/** Connects to a tradio-show LiveKit room. Host publishes one mixed track; listener subscribes to audio. */
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
  const mixRef = useRef<HostMix | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const publishedTrackRef = useRef<any | null>(null);
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

        const { Room, RoomEvent, Track, LocalAudioTrack } = await import('livekit-client');
        const room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;

        const recount = () => {
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

        // A listener promoted to caller gains canPublish at runtime — enable their mic.
        if (role === 'listener') {
          room.on(RoomEvent.ParticipantPermissionsChanged, () => {
            const canPub = room.localParticipant.permissions?.canPublish;
            void room.localParticipant.setMicrophoneEnabled(Boolean(canPub));
          });
        }

        await room.connect(payload.livekitUrl, payload.token);
        if (cancelled) { room.disconnect(); return; }

        if (role === 'host') {
          // Build the host mix and publish it as the single broadcast track.
          const mix = await createHostMix();
          mixRef.current = mix;
          try {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = micStream;
            mix.setMicStream(micStream);
          } catch {
            // No mic permission — still publish the (silent until SFX/AI) mix bus.
          }
          const track = new LocalAudioTrack(mix.stream.getAudioTracks()[0]);
          publishedTrackRef.current = track;
          await room.localParticipant.publishTrack(track);
          mix.setMasterVolume(MASTER_LIVE);
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
      const room = roomRef.current;
      try { aiSourceRef.current?.stop(); } catch { /* ignore */ }
      aiSourceRef.current = null;
      try { if (publishedTrackRef.current && room) room.localParticipant.unpublishTrack(publishedTrackRef.current); publishedTrackRef.current?.stop?.(); } catch { /* ignore */ }
      publishedTrackRef.current = null;
      try { micStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
      micStreamRef.current = null;
      try { void mixRef.current?.close(); } catch { /* ignore */ }
      mixRef.current = null;
      try { room?.disconnect(); } catch { /* ignore */ }
      audioElsRef.current.forEach((el) => el.remove());
      audioElsRef.current = [];
      roomRef.current = null;
      setConnection('idle');
      setListenerCount(0);
      setAiSpeaking(false); setAiSegmentLabel(null);
      setMicOn(false);
    };
  }, [active, role, sessionId]);

  // Mute/unmute the host by muting the master bus (the published track is the mix).
  const toggleMic = async () => {
    const mix = mixRef.current;
    if (role !== 'host' || !mix) return;
    const next = !micOn;
    mix.setMasterVolume(next ? MASTER_LIVE : 0);
    setMicOn(next);
  };

  const leave = () => {
    try { roomRef.current?.disconnect(); } catch { /* ignore */ }
  };

  const aiSpeak = async (text: string, label?: string) => {
    const mix = mixRef.current;
    if (role !== 'host' || !mix || !text.trim()) return;
    try {
      const res = await treyITts({ data: { text } });
      if (!res.audioBase64) { setError("AI voice isn't available right now."); return; }
      const bytes = Uint8Array.from(atob(res.audioBase64), (c) => c.charCodeAt(0));
      try { aiSourceRef.current?.stop(); } catch { /* ignore */ }
      setAiSpeaking(true);
      setAiSegmentLabel(label ?? null);
      const src = await mix.playAiBuffer(bytes.buffer);
      aiSourceRef.current = src;
      if (!src) { setAiSpeaking(false); setAiSegmentLabel(null); return; }
      src.onended = () => { setAiSpeaking(false); setAiSegmentLabel(null); aiSourceRef.current = null; };
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

  const playSfx = (id: string) => { void mixRef.current?.playSfx(id); };
  const playBed = (id: string) => { void mixRef.current?.playBed(id); };
  const stopBed = () => mixRef.current?.stopBed();
  const setMasterVolume = (v: number) => mixRef.current?.setMasterVolume(v);
  const setBedVolume = (v: number) => mixRef.current?.setBedVolume(v);
  const getAnalyser = () => mixRef.current?.analyser ?? null;

  return {
    connection, listenerCount, micOn, error, toggleMic, leave,
    aiSpeaking, aiSegmentLabel, aiSpeak, stopAi,
    playSfx, playBed, stopBed, setMasterVolume, setBedVolume, getAnalyser,
  };
}
