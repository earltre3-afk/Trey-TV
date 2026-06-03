// /live/$id — direct Pluto channel viewer.
// $id is the Pluto channel id (24-char hex). Page shows the iframe player,
// the chat panel scoped to "pluto:<id>", and a "Start watch party" CTA.

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Users, Tv } from "lucide-react";
import { toast } from "sonner";
import { useSupabaseSession } from "@/lib/supabase-session";
import { createWatchParty } from "@/lib/watch-party/party.server";
import { ChannelChatPanel } from "@/components/chat/ChannelChatPanel";

type PlutoChannelLite = {
  id: string;
  name: string;
  slug: string | null;
  number: number | null;
  logo: string | null;
  summary: string | null;
};

export const Route = createFileRoute("/live/$id")({
  component: LiveChannelPage,
  head: () => ({ meta: [{ title: "Live · Trey TV" }] }),
});

function LiveChannelPage() {
  const { id } = Route.useParams();
  const { session } = useSupabaseSession();
  const navigate = useNavigate();
  const [meta, setMeta] = useState<PlutoChannelLite | null>(null);
  const [startingParty, setStartingParty] = useState(false);

  // Fetch metadata for header / chat title. Falls back to "Live channel" if missing.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pluto/channels?limit=1000");
        if (!res.ok) return;
        const data = (await res.json()) as { channels: PlutoChannelLite[] };
        if (cancelled) return;
        setMeta(data.channels.find((c) => c.id === id) ?? null);
      } catch {
        // Non-fatal — header just stays blank.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onStartParty = async () => {
    if (!session?.access_token) {
      navigate({ to: "/login", search: { next: encodeURIComponent(`/live/${id}`) } as any });
      return;
    }
    if (startingParty) return;
    setStartingParty(true);
    try {
      // Use the pluto:<id> channel id format so the party iframe plays the same stream.
      const res = await createWatchParty({
        data: {
          accessToken: session.access_token,
          channelId: `pluto:${id}`,
          name: meta?.name ?? "Live party",
        },
      });
      if (!res.ok) {
        toast.error(`Couldn't create party: ${res.error}`);
        return;
      }
      navigate({ to: "/watch-party/$id", params: { id: res.partyId } });
    } finally {
      setStartingParty(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate({ to: "/explore" })}
            aria-label="Back"
            className="text-white/70 hover:text-white"
          >
            <ArrowLeft className="size-4" />
          </button>
          {meta?.logo ? (
            <img
              src={meta.logo}
              alt=""
              className="size-8 rounded object-contain bg-white/5 p-0.5"
            />
          ) : (
            <Tv className="size-5 text-primary" />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/50 text-red-400 text-[10px] tracking-widest font-bold">
                <span className="size-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
              </span>
              <h1 className="text-sm font-semibold truncate">{meta?.name ?? "Live channel"}</h1>
              {meta?.number ? (
                <span className="text-[10px] text-white/40">Ch. {meta.number}</span>
              ) : null}
            </div>
            {meta?.summary && (
              <div className="text-[10px] text-white/50 truncate max-w-md">{meta.summary}</div>
            )}
          </div>
          <div className="ml-auto">
            <button
              onClick={onStartParty}
              disabled={startingParty}
              className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Users className="size-3.5" />
              {startingParty ? "Starting…" : "Watch party"}
            </button>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4 p-4">
        <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
          <iframe
            src={`/api/pluto/player?id=${encodeURIComponent(id)}`}
            title={meta?.name ?? "Live channel"}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="size-full border-0"
          />
        </div>
        {/* Per-channel public chat, scoped to "pluto:<id>" so each Pluto channel has its own room. */}
        <ChannelChatPanel handle={`pluto:${id}`} className="lg:h-auto min-h-[420px]" />
      </div>

      <div className="px-4 pb-8 text-center">
        <Link to="/explore" className="text-xs text-white/50 hover:text-white/80">
          ← Back to Discover
        </Link>
      </div>
    </div>
  );
}
