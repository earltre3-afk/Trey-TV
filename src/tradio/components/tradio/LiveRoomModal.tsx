import { useState } from "react";
import { X, Send, Radio, Music2, Phone } from "lucide-react";
import { toast } from "sonner";
import { useTradioLiveInteraction } from "./useTradioLiveInteraction";
import { requestCall } from "./tradioCallerService";
import { supabase } from "@/tradio/lib/supabaseClient";

/** Full-screen listener room layered over the bar's existing audio connection. */
export function LiveRoomModal({
  sessionId,
  title,
  hostName,
  listenerCount,
  onClose,
}: {
  sessionId: string;
  title: string;
  hostName: string;
  listenerCount: number;
  onClose: () => void;
}) {
  const live = useTradioLiveInteraction({ sessionId });
  const [chatBody, setChatBody] = useState("");
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");

  const send = async () => {
    if (!chatBody.trim()) return;
    const r = await live.sendChat(chatBody);
    if (!r.error) setChatBody("");
  };
  const request = async () => {
    if (!song.trim()) return;
    const r = await live.submitRequest({ songTitle: song, artist });
    if (!r.error) {
      setSong("");
      setArtist("");
    }
  };
  const callIn = async () => {
    if (!supabase) {
      toast.error("Calling in needs Supabase.");
      return;
    }
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      toast.error("Sign in to call in.");
      return;
    }
    const { data: prof } = await supabase
      .from("profiles")
      .select("public_profile_uid, display_name")
      .eq("id", user.id)
      .maybeSingle();
    const identity = (prof?.public_profile_uid as string) || user.id;
    const name = (prof?.display_name as string) || user.email?.split("@")[0] || "Listener";
    const { error } = await requestCall({ sessionId, callerIdentity: identity, callerName: name });
    toast[error ? "error" : "success"](error ?? "You raised your hand — waiting for the host.");
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#050508]/98 backdrop-blur-3xl animate-fade-in">
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col p-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-pink-500" />
            </span>
            <div className="min-w-0">
              <div className="truncate text-base font-black text-white">{title}</div>
              <div className="truncate text-[11px] text-white/55">
                {hostName} · ON AIR · {listenerCount} listening
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={callIn}
              className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-100 hover:bg-emerald-500/25"
            >
              <Phone className="size-3.5" /> Call in
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid size-9 place-items-center rounded-full border border-white/15 text-white/80 hover:bg-white/5"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {live.activePoll && (
          <div className="mt-2 rounded-2xl border border-purple-400/30 bg-purple-500/10 p-3">
            <div className="text-sm font-bold text-white">{live.activePoll.question}</div>
            <div className="mt-2 space-y-1.5">
              {live.tallies.map((t) => (
                <button
                  key={t.optionId}
                  onClick={() => live.votePoll(t.optionId)}
                  className="relative block w-full overflow-hidden rounded-xl border border-white/10 px-3 py-2 text-left text-xs text-white"
                >
                  <span
                    className="absolute inset-y-0 left-0 bg-purple-500/25"
                    style={{ width: `${t.pct}%` }}
                  />
                  <span className="relative flex justify-between">
                    <span>{t.label}</span>
                    <span className="tabular-nums text-white/70">{t.pct}%</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 flex-1 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-3">
          {live.chat.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/40">
              Be the first to say something.
            </div>
          ) : (
            live.chat.map((c) => (
              <div key={c.id} className="text-sm">
                <span className="font-bold text-cyan-300">{c.authorName || "Listener"}</span>{" "}
                <span className="text-white/85">{c.body}</span>
              </div>
            ))
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <input
            value={chatBody}
            onChange={(e) => setChatBody(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say something…"
            className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
          />
          <button
            onClick={send}
            className="grid size-9 place-items-center rounded-xl bg-cyan-500 text-black"
          >
            <Send className="size-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-2">
          <Music2 className="size-4 shrink-0 text-fuchsia-300" />
          <input
            value={song}
            onChange={(e) => setSong(e.target.value)}
            placeholder="Request a song"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          />
          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist (optional)"
            className="min-w-0 w-28 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          />
          <button
            onClick={request}
            className="shrink-0 rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/15 px-3 py-1.5 text-xs font-bold text-fuchsia-100"
          >
            <Radio className="mr-1 inline size-3.5" />
            Request
          </button>
        </div>
      </div>
    </div>
  );
}

export default LiveRoomModal;
