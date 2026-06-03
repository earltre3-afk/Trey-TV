// LiveKit voice room for watch-party. Connects on mount, disconnects on unmount.
// Shows a simple mic bar (self mute toggle + participant talking indicators).
// Host-driven mic mutes come from the server side (token has canPublish: false
// for muted_mic users, so even if they try to publish, LiveKit rejects).
//
// See spec: docs/superpowers/specs/2026-05-24-watch-party-design.md §4, §9.2.

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Radio } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase-browser";

type TokenResponse = {
  ok?: true;
  token?: string;
  livekitUrl?: string;
  roomName?: string;
  participant?: { identity: string; name: string };
  error?: string;
};

type ParticipantInfo = { identity: string; name: string; speaking: boolean; muted: boolean };

type Props = {
  partyId: string;
  canPublishLocally: boolean;
  className?: string;
};

export function PartyMic({ partyId, canPublishLocally, className }: Props) {
  const [room, setRoom] = useState<any | null>(null);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [micEnabled, setMicEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stoppedRef = useRef(false);

  // Connect on mount.
  useEffect(() => {
    let cancelled = false;
    stoppedRef.current = false;

    (async () => {
      try {
        const supabase = createBrowserClient();
        const { data: sessData } = await supabase.auth.getSession();
        const accessToken = sessData.session?.access_token ?? "";

        const tokenRes = await fetch("/api/livekit/token", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ roomKind: "watch-party", partyId }),
        });
        const payload = (await tokenRes.json()) as TokenResponse;
        if (!tokenRes.ok || !payload.ok || !payload.token || !payload.livekitUrl) {
          throw new Error(payload.error || `token failed (${tokenRes.status})`);
        }

        const { Room, RoomEvent } = await import("livekit-client");
        const r = new Room({ adaptiveStream: true, dynacast: true });

        const updateParticipants = () => {
          const list: ParticipantInfo[] = [];
          // local
          const local = r.localParticipant;
          if (local) {
            list.push({
              identity: local.identity,
              name: local.name || "you",
              speaking: local.isSpeaking,
              muted: !local.isMicrophoneEnabled,
            });
          }
          // remote
          r.remoteParticipants.forEach((p: any) => {
            list.push({
              identity: p.identity,
              name: p.name || p.identity,
              speaking: p.isSpeaking,
              muted: false,
            });
          });
          setParticipants(list);
        };

        r.on(RoomEvent.ParticipantConnected, updateParticipants);
        r.on(RoomEvent.ParticipantDisconnected, updateParticipants);
        r.on(RoomEvent.ActiveSpeakersChanged, updateParticipants);
        r.on(RoomEvent.TrackMuted, updateParticipants);
        r.on(RoomEvent.TrackUnmuted, updateParticipants);

        await r.connect(payload.livekitUrl, payload.token);
        if (cancelled || stoppedRef.current) {
          r.disconnect();
          return;
        }
        updateParticipants();
        setRoom(r);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();

    return () => {
      cancelled = true;
      stoppedRef.current = true;
      if (room) {
        room.disconnect().catch(() => undefined);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partyId]);

  const toggleMic = async () => {
    if (!room || !canPublishLocally) return;
    try {
      const next = !micEnabled;
      await room.localParticipant.setMicrophoneEnabled(next);
      setMicEnabled(next);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.02] p-2 ${className ?? ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <Radio className="size-3.5 text-primary" />
        <span className="text-[11px] uppercase tracking-widest text-white/60">Voice</span>
        {error && (
          <span className="ml-auto text-[10px] text-red-400 truncate" title={error}>
            error
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={toggleMic}
          disabled={!room || !canPublishLocally}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
            !canPublishLocally
              ? "border-red-500/30 text-red-400/80 bg-red-500/5 cursor-not-allowed"
              : micEnabled
                ? "border-green-500/40 text-green-400 bg-green-500/10"
                : "border-white/15 text-white/70 hover:bg-white/5"
          }`}
        >
          {!canPublishLocally ? (
            <MicOff className="size-3.5" />
          ) : micEnabled ? (
            <Mic className="size-3.5" />
          ) : (
            <MicOff className="size-3.5" />
          )}
          {!canPublishLocally ? "Muted by host" : micEnabled ? "Mic on" : "Mic off"}
        </button>
        <div className="flex items-center gap-1 flex-wrap text-[11px] text-white/60">
          {participants.map((p) => (
            <span
              key={p.identity}
              className={`px-1.5 py-0.5 rounded-full border ${
                p.speaking
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {p.speaking ? "🔊 " : p.muted ? "🔇 " : ""}
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
