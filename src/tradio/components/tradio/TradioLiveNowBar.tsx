import { useEffect, useState } from "react";
import { Radio, X } from "lucide-react";
import { listLiveNow, type LiveSession } from "./tradioLiveService";
import { useTradioLiveRoom } from "./useTradioLiveRoom";
import { LiveRoomModal } from "./LiveRoomModal";

/** Shows a LIVE banner when a Tradio show is on air and lets the user tune in as a listener. */
export function TradioLiveNowBar() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [tunedSessionId, setTunedSessionId] = useState<string | null>(null);
  const [roomOpen, setRoomOpen] = useState(false);
  const live = useTradioLiveRoom({
    active: Boolean(tunedSessionId),
    role: "listener",
    sessionId: tunedSessionId,
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      const s = await listLiveNow();
      if (active) setSessions(s);
    };
    void load();
    const t = setInterval(load, 20000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  const top = sessions[0];
  if (!top && !tunedSessionId) return null;

  const tuned = tunedSessionId ? (sessions.find((s) => s.id === tunedSessionId) ?? top) : null;

  return (
    <div className="mx-4 mt-3 rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 via-fuchsia-500/5 to-transparent p-3 sm:mx-6 lg:mx-10">
      <div className="flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-pink-500" />
        </span>
        <Radio className="h-4 w-4 text-pink-300 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-white">
            {(tuned ?? top)?.title || "Live on Tradio"}
          </div>
          <div className="truncate text-[11px] text-white/55">
            {(tuned ?? top)?.hostName || "Host"} ·{" "}
            {tunedSessionId
              ? live.connection === "connected"
                ? "ON AIR · you are listening"
                : "connecting…"
              : "LIVE now"}
          </div>
        </div>
        {tunedSessionId ? (
          <button
            onClick={() => {
              live.leave();
              setTunedSessionId(null);
              setRoomOpen(false);
            }}
            className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/5"
          >
            <X className="h-3.5 w-3.5" /> Leave
          </button>
        ) : (
          <button
            onClick={() => {
              if (top) {
                setTunedSessionId(top.id);
                setRoomOpen(true);
              }
            }}
            className="rounded-full border border-pink-400/40 bg-pink-500/15 px-3 py-1.5 text-xs font-bold text-pink-100 hover:bg-pink-500/25"
          >
            Listen Live
          </button>
        )}
      </div>
      {roomOpen && tunedSessionId && (
        <LiveRoomModal
          sessionId={tunedSessionId}
          title={(tuned ?? top)?.title || "Live on Tradio"}
          hostName={(tuned ?? top)?.hostName || "Host"}
          listenerCount={live.listenerCount}
          onClose={() => setRoomOpen(false)}
        />
      )}
    </div>
  );
}

export default TradioLiveNowBar;
