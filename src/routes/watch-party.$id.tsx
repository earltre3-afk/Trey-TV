// /watch-party/$id — private synced watch party with chat, voice, and host controls.
// Spec: docs/superpowers/specs/2026-05-24-watch-party-design.md

import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Tv,
  UserPlus,
  LogOut,
  Crown,
  MicOff,
  MessageSquareOff,
  UserX,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/lib/supabase-session";
import { channels as treyChannels } from "@/lib/watch-data";
import {
  acceptPartyInvite,
  changePartyChannel,
  endWatchParty,
  setMemberFlag,
} from "@/lib/watch-party/party.server";

import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatComposer } from "@/components/chat/ChatComposer";
import type { PendingMessage } from "@/components/chat/ChatTypes";
import { useChatProfiles } from "@/components/chat/useChatProfiles";
import { PartyMic } from "@/components/watch-party/PartyMic";
import { InviteModal } from "@/components/watch-party/InviteModal";

type PartyRow = {
  id: string;
  host_id: string;
  channel_id: string;
  name: string | null;
  invite_token: string;
  max_members: number;
  created_at: string;
  ended_at: string | null;
};

type MemberRow = {
  party_id: string;
  user_id: string;
  role: "host" | "member";
  muted_chat: boolean;
  muted_mic: boolean;
  kicked: boolean;
  joined_at: string;
};

type Search = { join?: string };

export const Route = createFileRoute("/watch-party/$id")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    join: typeof search.join === "string" ? search.join : undefined,
  }),
  component: WatchPartyPage,
  head: () => ({ meta: [{ title: "Watch Party · Trey TV" }] }),
});

function WatchPartyPage() {
  const { id } = Route.useParams();
  const { join: inviteToken } = useSearch({ from: "/watch-party/$id" }) as Search;
  const { session, loading: sessionLoading } = useSupabaseSession();
  const navigate = useNavigate();

  const [party, setParty] = useState<PartyRow | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [me, setMe] = useState<MemberRow | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const userId = session?.user?.id ?? null;

  // ── Load party + accept invite if token present ────────────────────────
  useEffect(() => {
    if (sessionLoading) return;
    if (!userId) {
      // Bounce to login, preserve next URL.
      const next = encodeURIComponent(
        `/watch-party/${id}${inviteToken ? `?join=${inviteToken}` : ""}`,
      );
      navigate({ to: "/login", search: { next } as any });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        // If invite token present, accept first (RLS won't let us SELECT
        // the party row otherwise).
        if (inviteToken && session?.access_token) {
          const res = await acceptPartyInvite({
            data: { accessToken: session.access_token, inviteToken },
          });
          if (!res.ok) {
            setLoadError(`Couldn't join: ${res.error}${res.reason ? ` (${res.reason})` : ""}`);
            return;
          }
          // Remove the join param from the URL for cleanliness.
          navigate({ to: "/watch-party/$id", params: { id }, search: {} as any, replace: true });
        }

        const { data: partyRow, error: partyErr } = await (supabase as any)
          .from("watch_parties")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (cancelled) return;
        if (partyErr || !partyRow) {
          setLoadError("Party not found or you're not a member.");
          return;
        }
        if (partyRow.ended_at) {
          setLoadError("This party has ended.");
          return;
        }
        setParty(partyRow as PartyRow);

        const { data: memberRows } = await (supabase as any)
          .from("party_members")
          .select("*")
          .eq("party_id", id)
          .eq("kicked", false);
        if (cancelled) return;
        const list = (memberRows ?? []) as MemberRow[];
        setMembers(list);
        setMe(list.find((m) => m.user_id === userId) ?? null);
      } catch (err) {
        if (!cancelled) setLoadError((err as Error).message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, inviteToken, sessionLoading, userId, session?.access_token, navigate]);

  // ── Realtime subscriptions: party row changes + member changes ─────────
  useEffect(() => {
    if (!party?.id) return;
    const ch = supabase
      .channel(`party-${party.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "watch_parties", filter: `id=eq.${party.id}` },
        (payload) => {
          const next = payload.new as PartyRow;
          setParty(next);
          if (next.ended_at) {
            toast("Host ended the party");
            setTimeout(() => navigate({ to: "/" }), 1500);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "party_members", filter: `party_id=eq.${party.id}` },
        async () => {
          // Refetch the whole member list — simpler than reconciling deltas.
          const { data: memberRows } = await (supabase as any)
            .from("party_members")
            .select("*")
            .eq("party_id", party.id)
            .eq("kicked", false);
          const list = (memberRows ?? []) as MemberRow[];
          setMembers(list);
          const myRow = list.find((m) => m.user_id === userId) ?? null;
          setMe(myRow);
          if (!myRow && userId) {
            toast("You were removed from the party");
            setTimeout(() => navigate({ to: "/" }), 1200);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [party?.id, userId, navigate]);

  // ── Derived state ──────────────────────────────────────────────────────
  const isHost = !!party && !!userId && party.host_id === userId;
  const memberIds = useMemo(() => new Set(members.map((m) => m.user_id)), [members]);
  const composerDisabledReason = !me
    ? "Loading…"
    : me.kicked
      ? "You've been removed"
      : me.muted_chat
        ? "Muted by host"
        : null;

  // ── Host actions ───────────────────────────────────────────────────────
  const onChangeChannel = useCallback(
    async (channelId: string) => {
      if (!party || !session?.access_token) return;
      const res = await changePartyChannel({
        data: { accessToken: session.access_token, partyId: party.id, channelId },
      });
      if (!res.ok) toast.error(`Couldn't change channel: ${res.error}`);
    },
    [party, session?.access_token],
  );

  const onKick = useCallback(
    async (targetUserId: string) => {
      if (!party || !session?.access_token) return;
      const res = await setMemberFlag({
        data: {
          accessToken: session.access_token,
          partyId: party.id,
          targetUserId,
          field: "kicked",
          value: true,
        },
      });
      if (!res.ok) toast.error(`Couldn't kick: ${res.error}`);
    },
    [party, session?.access_token],
  );

  const onToggleMuteChat = useCallback(
    async (targetUserId: string, current: boolean) => {
      if (!party || !session?.access_token) return;
      const res = await setMemberFlag({
        data: {
          accessToken: session.access_token,
          partyId: party.id,
          targetUserId,
          field: "muted_chat",
          value: !current,
        },
      });
      if (!res.ok) toast.error(`Couldn't update: ${res.error}`);
    },
    [party, session?.access_token],
  );

  const onToggleMuteMic = useCallback(
    async (targetUserId: string, current: boolean) => {
      if (!party || !session?.access_token) return;
      const res = await setMemberFlag({
        data: {
          accessToken: session.access_token,
          partyId: party.id,
          targetUserId,
          field: "muted_mic",
          value: !current,
        },
      });
      if (!res.ok) toast.error(`Couldn't update: ${res.error}`);
    },
    [party, session?.access_token],
  );

  const onEndParty = useCallback(async () => {
    if (!party || !session?.access_token) return;
    if (!confirm("End this party for everyone?")) return;
    const res = await endWatchParty({
      data: { accessToken: session.access_token, partyId: party.id },
    });
    if (!res.ok) toast.error(`Couldn't end: ${res.error}`);
    else navigate({ to: "/" });
  }, [party, session?.access_token, navigate]);

  // ── Render ─────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold">Couldn't open party</h1>
          <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
          <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-white/60">
        Loading party…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate({ to: "/" })}
            aria-label="Back"
            className="text-white/70 hover:text-white"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/40 text-primary text-[10px] tracking-widest font-bold">
                <Crown className="size-3" /> WATCH PARTY
              </span>
              <span className="text-sm font-semibold truncate">
                {party.name || "Untitled party"}
              </span>
            </div>
            <div className="text-[10px] text-white/50">
              {members.length}/{party.max_members} members · channel {party.channel_id}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isHost && (
              <>
                <button
                  onClick={() => setShowInvite(true)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-white/15 hover:bg-white/5 inline-flex items-center gap-1.5"
                >
                  <UserPlus className="size-3.5" /> Invite
                </button>
                <button
                  onClick={onEndParty}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 inline-flex items-center gap-1.5"
                >
                  <LogOut className="size-3.5" /> End party
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4 p-4">
        {/* Left column: video + chat + mic */}
        <div className="space-y-3">
          <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
            <iframe
              key={party.channel_id /* force iframe reload on channel change */}
              src={`/api/pluto/player?channel=${encodeURIComponent(party.channel_id)}`}
              title="Watch-party stream"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="size-full border-0"
            />
          </div>

          <PartyMic partyId={party.id} canPublishLocally={!me?.muted_mic && !me?.kicked} />

          <section className="rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col h-[420px]">
            <header className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Party chat</span>
                <span className="text-[10px] text-white/40">private · AI-moderated</span>
              </div>
            </header>
            <ChatMessageList
              kind="party"
              scopeId={party.id}
              pending={pending}
              currentUserId={userId}
            />
            <ChatComposer
              kind="party"
              scopeId={party.id}
              disabledReason={composerDisabledReason}
              onPending={setPending}
            />
          </section>
        </div>

        {/* Right column: members + host controls */}
        <aside className="space-y-3">
          {isHost && (
            <section className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-3">
              <div className="text-[10px] uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">
                <Crown className="size-3" /> Host controls
              </div>
              <div className="space-y-2">
                <label className="block">
                  <span className="text-[11px] text-white/60">Change channel</span>
                  <select
                    value={party.channel_id}
                    onChange={(e) => onChangeChannel(e.target.value)}
                    className="mt-1 w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-primary/60"
                  >
                    {/* Allow any Trey TV channel id; falls back to current value as an option */}
                    {!treyChannels.some((c) => c.id === party.channel_id) && (
                      <option value={party.channel_id}>{party.channel_id}</option>
                    )}
                    {treyChannels.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>
          )}

          <MembersPanel
            members={members}
            hostId={party.host_id}
            currentUserId={userId}
            isHost={isHost}
            onKick={onKick}
            onToggleMuteChat={onToggleMuteChat}
            onToggleMuteMic={onToggleMuteMic}
          />
        </aside>
      </div>

      {showInvite && (
        <InviteModal
          partyId={party.id}
          inviteToken={party.invite_token}
          alreadyMemberIds={memberIds}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}

// ── Members panel ──────────────────────────────────────────────────────────
type MembersPanelProps = {
  members: MemberRow[];
  hostId: string;
  currentUserId: string | null;
  isHost: boolean;
  onKick: (userId: string) => void;
  onToggleMuteChat: (userId: string, current: boolean) => void;
  onToggleMuteMic: (userId: string, current: boolean) => void;
};

function MembersPanel({
  members,
  hostId,
  currentUserId,
  isHost,
  onKick,
  onToggleMuteChat,
  onToggleMuteMic,
}: MembersPanelProps) {
  const profiles = useChatProfiles(members.map((m) => m.user_id));
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-widest text-white/60 mb-2">
        Members · {members.length}
      </div>
      <div className="space-y-1.5">
        {members.map((m) => {
          const p = profiles[m.user_id];
          const name = p?.display_name || p?.username || "Viewer";
          const isHostRow = m.user_id === hostId;
          const isMeRow = m.user_id === currentUserId;
          return (
            <div key={m.user_id} className="flex items-center gap-2 group">
              <div className="size-7 rounded-full bg-white/10 overflow-hidden shrink-0">
                {p?.avatar_url ? (
                  <img src={p.avatar_url} alt="" className="size-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-semibold truncate ${isMeRow ? "text-primary" : ""}`}
                  >
                    {name}
                  </span>
                  {isHostRow && <Crown className="size-3 text-primary shrink-0" />}
                  {m.muted_chat && <MessageSquareOff className="size-3 text-amber-400 shrink-0" />}
                  {m.muted_mic && <MicOff className="size-3 text-amber-400 shrink-0" />}
                </div>
                {p?.username && (
                  <div className="text-[10px] text-white/40 truncate">@{p.username}</div>
                )}
              </div>
              {isHost && !isHostRow && (
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuFor(openMenuFor === m.user_id ? null : m.user_id)}
                    className="opacity-50 group-hover:opacity-100 text-white/70 hover:text-white text-xs px-2 py-0.5"
                    aria-label="Member actions"
                  >
                    ⋯
                  </button>
                  {openMenuFor === m.user_id && (
                    <div
                      className="absolute right-0 top-7 z-10 w-44 rounded-lg border border-white/10 bg-[#0B1426] shadow-xl p-1"
                      onMouseLeave={() => setOpenMenuFor(null)}
                    >
                      <button
                        onClick={() => {
                          onToggleMuteChat(m.user_id, m.muted_chat);
                          setOpenMenuFor(null);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-white/5 flex items-center gap-2"
                      >
                        <MessageSquareOff className="size-3" />
                        {m.muted_chat ? "Un-mute chat" : "Mute chat"}
                      </button>
                      <button
                        onClick={() => {
                          onToggleMuteMic(m.user_id, m.muted_mic);
                          setOpenMenuFor(null);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-white/5 flex items-center gap-2"
                      >
                        <MicOff className="size-3" />
                        {m.muted_mic ? "Un-mute mic" : "Mute mic"}
                      </button>
                      <div className="h-px bg-white/10 my-1" />
                      <button
                        onClick={() => {
                          onKick(m.user_id);
                          setOpenMenuFor(null);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-red-500/10 text-red-300 flex items-center gap-2"
                      >
                        <UserX className="size-3" />
                        Kick from party
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
