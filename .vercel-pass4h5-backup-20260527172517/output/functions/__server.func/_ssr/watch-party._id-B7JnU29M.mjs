import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { g as useSearch, e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { I as Route$16, g as useSupabaseSession, s as supabase, c as createBrowserClient } from "./router-BtgGywEC.mjs";
import { A as channels } from "./index.mjs";
import { a as acceptPartyInvite, c as changePartyChannel, s as setMemberFlag, e as endWatchParty, C as ChatMessageList, b as ChatComposer, u as useChatProfiles, h as hostAddMember } from "./ChatComposer-C-_cuLln.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, t as Crown, at as UserPlus, s as LogOut, R as Radio, bQ as MicOff, e as Mic, bR as MessageSquareOff, bS as UserX, X, k as Check, v as Copy, O as Search } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
import "node:crypto";
import "node:async_hooks";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "util";
import "crypto";
import "async_hooks";
import "stream";
function PartyMic({ partyId, canPublishLocally, className }) {
  const [room, setRoom] = reactExports.useState(null);
  const [participants, setParticipants] = reactExports.useState([]);
  const [micEnabled, setMicEnabled] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const stoppedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    let cancelled = false;
    stoppedRef.current = false;
    (async () => {
      try {
        const supabase2 = createBrowserClient();
        const { data: sessData } = await supabase2.auth.getSession();
        const accessToken = sessData.session?.access_token ?? "";
        const tokenRes = await fetch("/api/livekit/token", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...accessToken ? { authorization: `Bearer ${accessToken}` } : {}
          },
          body: JSON.stringify({ roomKind: "watch-party", partyId })
        });
        const payload = await tokenRes.json();
        if (!tokenRes.ok || !payload.ok || !payload.token || !payload.livekitUrl) {
          throw new Error(payload.error || `token failed (${tokenRes.status})`);
        }
        const { Room, RoomEvent } = await import("../_libs/livekit-client.mjs");
        const r = new Room({ adaptiveStream: true, dynacast: true });
        const updateParticipants = () => {
          const list = [];
          const local = r.localParticipant;
          if (local) {
            list.push({
              identity: local.identity,
              name: local.name || "you",
              speaking: local.isSpeaking,
              muted: !local.isMicrophoneEnabled
            });
          }
          r.remoteParticipants.forEach((p) => {
            list.push({
              identity: p.identity,
              name: p.name || p.identity,
              speaking: p.isSpeaking,
              muted: false
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
        if (!cancelled) setError(err.message);
      }
    })();
    return () => {
      cancelled = true;
      stoppedRef.current = true;
      if (room) {
        room.disconnect().catch(() => void 0);
      }
    };
  }, [partyId]);
  const toggleMic = async () => {
    if (!room || !canPublishLocally) return;
    try {
      const next = !micEnabled;
      await room.localParticipant.setMicrophoneEnabled(next);
      setMicEnabled(next);
    } catch (err) {
      setError(err.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl border border-white/10 bg-white/[0.02] p-2 ${className ?? ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "size-3.5 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-widest text-white/60", children: "Voice" }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[10px] text-red-400 truncate", title: error, children: "error" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: toggleMic,
          disabled: !room || !canPublishLocally,
          className: `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${!canPublishLocally ? "border-red-500/30 text-red-400/80 bg-red-500/5 cursor-not-allowed" : micEnabled ? "border-green-500/40 text-green-400 bg-green-500/10" : "border-white/15 text-white/70 hover:bg-white/5"}`,
          children: [
            !canPublishLocally ? /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { className: "size-3.5" }) : micEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "size-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { className: "size-3.5" }),
            !canPublishLocally ? "Muted by host" : micEnabled ? "Mic on" : "Mic off"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 flex-wrap text-[11px] text-white/60", children: participants.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "span",
        {
          className: `px-1.5 py-0.5 rounded-full border ${p.speaking ? "border-primary/60 bg-primary/15 text-primary" : "border-white/10 bg-white/5"}`,
          children: [
            p.speaking ? "🔊 " : p.muted ? "🔇 " : "",
            p.name
          ]
        },
        p.identity
      )) })
    ] })
  ] });
}
function InviteModal({ partyId, inviteToken, alreadyMemberIds, onClose }) {
  const { session } = useSupabaseSession();
  const [copied, setCopied] = reactExports.useState(false);
  const [followers, setFollowers] = reactExports.useState([]);
  const [query, setQuery] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(null);
  const inviteUrl = reactExports.useMemo(
    () => `${typeof location !== "undefined" ? location.origin : ""}/watch-party/${partyId}?join=${inviteToken}`,
    [partyId, inviteToken]
  );
  reactExports.useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("follows").select("follower_id, profiles!follows_follower_id_fkey(id, display_name, username, avatar_url)").eq("following_id", session.user.id).limit(100);
      if (cancelled) return;
      const list = (data ?? []).map((r) => r.profiles).filter(Boolean);
      setFollowers(list);
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);
  const filtered = reactExports.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return followers;
    return followers.filter(
      (f) => f.display_name?.toLowerCase().includes(q) || f.username?.toLowerCase().includes(q)
    );
  }, [followers, query]);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied");
      setTimeout(() => setCopied(false), 2e3);
    } catch {
      toast.error("Couldn't copy — copy manually");
    }
  };
  const addFollower = async (userId) => {
    if (!session?.access_token) return;
    setBusy(userId);
    try {
      const res = await hostAddMember({ data: { accessToken: session.access_token, partyId, targetUserId: userId } });
      if (!res.ok) {
        toast.error(res.error === "party_full" ? "Party is full" : `Couldn't add (${res.error})`);
      } else {
        toast.success("Added to party");
      }
    } finally {
      setBusy(null);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "w-full max-w-md rounded-2xl border border-white/10 bg-[#0B1426] shadow-2xl",
      onClick: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between p-4 border-b border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "size-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Invite to party" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, "aria-label": "Close", className: "text-white/60 hover:text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-white/60 mb-1 block", children: "Shareable link · up to 10 members" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  readOnly: true,
                  value: inviteUrl,
                  className: "flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: copyLink,
                  className: "px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90",
                  children: [
                    copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "size-3.5" }),
                    copied ? "Copied" : "Copy"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-white/60 mb-1 block", children: "Pick from your followers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-2.5 size-3.5 text-white/40" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: query,
                  onChange: (e) => setQuery(e.target.value),
                  placeholder: "Search followers",
                  className: "w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/60"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-64 overflow-y-auto space-y-1", children: [
              filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-xs text-white/40 py-6", children: followers.length === 0 ? "No followers yet" : "No matches" }),
              filtered.map((f) => {
                const inParty = alreadyMemberIds.has(f.id);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2 rounded-lg hover:bg-white/5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-8 rounded-full bg-white/10 overflow-hidden", children: f.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: f.avatar_url, alt: "", className: "size-full object-cover" }) : null }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: f.display_name || f.username || "Follower" }),
                    f.username && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-white/40 truncate", children: [
                      "@",
                      f.username
                    ] })
                  ] }),
                  inParty ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50", children: "In party" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => addFollower(f.id),
                      disabled: busy === f.id,
                      className: "text-[11px] px-2.5 py-1 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-50 hover:bg-primary/90",
                      children: busy === f.id ? "…" : "Add"
                    }
                  )
                ] }, f.id);
              })
            ] })
          ] })
        ] })
      ]
    }
  ) });
}
function WatchPartyPage() {
  const {
    id
  } = Route$16.useParams();
  const {
    join: inviteToken
  } = useSearch({
    from: "/watch-party/$id"
  });
  const {
    session,
    loading: sessionLoading
  } = useSupabaseSession();
  const navigate = useNavigate();
  const [party, setParty] = reactExports.useState(null);
  const [members, setMembers] = reactExports.useState([]);
  const [me, setMe] = reactExports.useState(null);
  const [loadError, setLoadError] = reactExports.useState(null);
  const [pending, setPending] = reactExports.useState([]);
  const [showInvite, setShowInvite] = reactExports.useState(false);
  const userId = session?.user?.id ?? null;
  reactExports.useEffect(() => {
    if (sessionLoading) return;
    if (!userId) {
      const next = encodeURIComponent(`/watch-party/${id}${inviteToken ? `?join=${inviteToken}` : ""}`);
      navigate({
        to: "/login",
        search: {
          next
        }
      });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        if (inviteToken && session?.access_token) {
          const res = await acceptPartyInvite({
            data: {
              accessToken: session.access_token,
              inviteToken
            }
          });
          if (!res.ok) {
            setLoadError(`Couldn't join: ${res.error}${res.reason ? ` (${res.reason})` : ""}`);
            return;
          }
          navigate({
            to: "/watch-party/$id",
            params: {
              id
            },
            search: {},
            replace: true
          });
        }
        const {
          data: partyRow,
          error: partyErr
        } = await supabase.from("watch_parties").select("*").eq("id", id).maybeSingle();
        if (cancelled) return;
        if (partyErr || !partyRow) {
          setLoadError("Party not found or you're not a member.");
          return;
        }
        if (partyRow.ended_at) {
          setLoadError("This party has ended.");
          return;
        }
        setParty(partyRow);
        const {
          data: memberRows
        } = await supabase.from("party_members").select("*").eq("party_id", id).eq("kicked", false);
        if (cancelled) return;
        const list = memberRows ?? [];
        setMembers(list);
        setMe(list.find((m) => m.user_id === userId) ?? null);
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, inviteToken, sessionLoading, userId, session?.access_token, navigate]);
  reactExports.useEffect(() => {
    if (!party?.id) return;
    const ch = supabase.channel(`party-${party.id}`).on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "watch_parties",
      filter: `id=eq.${party.id}`
    }, (payload) => {
      const next = payload.new;
      setParty(next);
      if (next.ended_at) {
        toast("Host ended the party");
        setTimeout(() => navigate({
          to: "/"
        }), 1500);
      }
    }).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "party_members",
      filter: `party_id=eq.${party.id}`
    }, async () => {
      const {
        data: memberRows
      } = await supabase.from("party_members").select("*").eq("party_id", party.id).eq("kicked", false);
      const list = memberRows ?? [];
      setMembers(list);
      const myRow = list.find((m) => m.user_id === userId) ?? null;
      setMe(myRow);
      if (!myRow && userId) {
        toast("You were removed from the party");
        setTimeout(() => navigate({
          to: "/"
        }), 1200);
      }
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [party?.id, userId, navigate]);
  const isHost = !!party && !!userId && party.host_id === userId;
  const memberIds = reactExports.useMemo(() => new Set(members.map((m) => m.user_id)), [members]);
  const composerDisabledReason = !me ? "Loading…" : me.kicked ? "You've been removed" : me.muted_chat ? "Muted by host" : null;
  const onChangeChannel = reactExports.useCallback(async (channelId) => {
    if (!party || !session?.access_token) return;
    const res = await changePartyChannel({
      data: {
        accessToken: session.access_token,
        partyId: party.id,
        channelId
      }
    });
    if (!res.ok) toast.error(`Couldn't change channel: ${res.error}`);
  }, [party, session?.access_token]);
  const onKick = reactExports.useCallback(async (targetUserId) => {
    if (!party || !session?.access_token) return;
    const res = await setMemberFlag({
      data: {
        accessToken: session.access_token,
        partyId: party.id,
        targetUserId,
        field: "kicked",
        value: true
      }
    });
    if (!res.ok) toast.error(`Couldn't kick: ${res.error}`);
  }, [party, session?.access_token]);
  const onToggleMuteChat = reactExports.useCallback(async (targetUserId, current) => {
    if (!party || !session?.access_token) return;
    const res = await setMemberFlag({
      data: {
        accessToken: session.access_token,
        partyId: party.id,
        targetUserId,
        field: "muted_chat",
        value: !current
      }
    });
    if (!res.ok) toast.error(`Couldn't update: ${res.error}`);
  }, [party, session?.access_token]);
  const onToggleMuteMic = reactExports.useCallback(async (targetUserId, current) => {
    if (!party || !session?.access_token) return;
    const res = await setMemberFlag({
      data: {
        accessToken: session.access_token,
        partyId: party.id,
        targetUserId,
        field: "muted_mic",
        value: !current
      }
    });
    if (!res.ok) toast.error(`Couldn't update: ${res.error}`);
  }, [party, session?.access_token]);
  const onEndParty = reactExports.useCallback(async () => {
    if (!party || !session?.access_token) return;
    if (!confirm("End this party for everyone?")) return;
    const res = await endWatchParty({
      data: {
        accessToken: session.access_token,
        partyId: party.id
      }
    });
    if (!res.ok) toast.error(`Couldn't end: ${res.error}`);
    else navigate({
      to: "/"
    });
  }, [party, session?.access_token, navigate]);
  if (loadError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Couldn't open party" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: loadError }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-4 inline-block text-sm text-primary hover:underline", children: "Go home" })
    ] }) });
  }
  if (!party) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center text-sm text-white/60", children: "Loading party…" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
        to: "/"
      }), "aria-label": "Back", className: "text-white/70 hover:text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/40 text-primary text-[10px] tracking-widest font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3" }),
            " WATCH PARTY"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold truncate", children: party.name || "Untitled party" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-white/50", children: [
          members.length,
          "/",
          party.max_members,
          " members · channel ",
          party.channel_id
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto flex items-center gap-2", children: isHost && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowInvite(true), className: "text-xs px-3 py-1.5 rounded-lg border border-white/15 hover:bg-white/5 inline-flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "size-3.5" }),
          " Invite"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onEndParty, className: "text-xs px-3 py-1.5 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 inline-flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "size-3.5" }),
          " End party"
        ] })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_360px] gap-4 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black", children: /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { src: `/api/pluto/player?channel=${encodeURIComponent(party.channel_id)}`, title: "Watch-party stream", allow: "autoplay; fullscreen; picture-in-picture", allowFullScreen: true, className: "size-full border-0" }, party.channel_id) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PartyMic, { partyId: party.id, canPublishLocally: !me?.muted_mic && !me?.kicked }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col h-[420px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "flex items-center justify-between px-3 py-2 border-b border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Party chat" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-white/40", children: "private · AI-moderated" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChatMessageList, { kind: "party", scopeId: party.id, pending, currentUserId: userId }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChatComposer, { kind: "party", scopeId: party.id, disabledReason: composerDisabledReason, onPending: setPending })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "space-y-3", children: [
        isHost && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-primary/30 bg-primary/[0.04] p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3" }),
            " Host controls"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-white/60", children: "Change channel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: party.channel_id, onChange: (e) => onChangeChannel(e.target.value), className: "mt-1 w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-primary/60", children: [
              !channels.some((c) => c.id === party.channel_id) && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: party.channel_id, children: party.channel_id }),
              channels.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.id, children: c.name }, c.id))
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MembersPanel, { members, hostId: party.host_id, currentUserId: userId, isHost, onKick, onToggleMuteChat, onToggleMuteMic })
      ] })
    ] }),
    showInvite && /* @__PURE__ */ jsxRuntimeExports.jsx(InviteModal, { partyId: party.id, inviteToken: party.invite_token, alreadyMemberIds: memberIds, onClose: () => setShowInvite(false) })
  ] });
}
function MembersPanel({
  members,
  hostId,
  currentUserId,
  isHost,
  onKick,
  onToggleMuteChat,
  onToggleMuteMic
}) {
  const profiles = useChatProfiles(members.map((m) => m.user_id));
  const [openMenuFor, setOpenMenuFor] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-white/10 bg-white/[0.02] p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] uppercase tracking-widest text-white/60 mb-2", children: [
      "Members · ",
      members.length
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: members.map((m) => {
      const p = profiles[m.user_id];
      const name = p?.display_name || p?.username || "Viewer";
      const isHostRow = m.user_id === hostId;
      const isMeRow = m.user_id === currentUserId;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-7 rounded-full bg-white/10 overflow-hidden shrink-0", children: p?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.avatar_url, alt: "", className: "size-full object-cover" }) : null }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-semibold truncate ${isMeRow ? "text-primary" : ""}`, children: name }),
            isHostRow && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3 text-primary shrink-0" }),
            m.muted_chat && /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquareOff, { className: "size-3 text-amber-400 shrink-0" }),
            m.muted_mic && /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { className: "size-3 text-amber-400 shrink-0" })
          ] }),
          p?.username && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-white/40 truncate", children: [
            "@",
            p.username
          ] })
        ] }),
        isHost && !isHostRow && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOpenMenuFor(openMenuFor === m.user_id ? null : m.user_id), className: "opacity-50 group-hover:opacity-100 text-white/70 hover:text-white text-xs px-2 py-0.5", "aria-label": "Member actions", children: "⋯" }),
          openMenuFor === m.user_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 top-7 z-10 w-44 rounded-lg border border-white/10 bg-[#0B1426] shadow-xl p-1", onMouseLeave: () => setOpenMenuFor(null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
              onToggleMuteChat(m.user_id, m.muted_chat);
              setOpenMenuFor(null);
            }, className: "w-full text-left px-2 py-1.5 rounded text-xs hover:bg-white/5 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquareOff, { className: "size-3" }),
              m.muted_chat ? "Un-mute chat" : "Mute chat"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
              onToggleMuteMic(m.user_id, m.muted_mic);
              setOpenMenuFor(null);
            }, className: "w-full text-left px-2 py-1.5 rounded text-xs hover:bg-white/5 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { className: "size-3" }),
              m.muted_mic ? "Un-mute mic" : "Mute mic"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-white/10 my-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
              onKick(m.user_id);
              setOpenMenuFor(null);
            }, className: "w-full text-left px-2 py-1.5 rounded text-xs hover:bg-red-500/10 text-red-300 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { className: "size-3" }),
              "Kick from party"
            ] })
          ] })
        ] })
      ] }, m.user_id);
    }) })
  ] });
}
export {
  WatchPartyPage as component
};
