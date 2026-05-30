import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase, g as useSupabaseSession } from "./router-BtgGywEC.mjs";
import { a as createServerFn, u as createSsrRpc } from "./index.mjs";
import { p as Shield, aI as TriangleAlert, f as Send } from "../_libs/lucide-react.mjs";
const createWatchParty = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  channelId: typeof input?.channelId === "string" ? input.channelId.slice(0, 100) : "",
  name: typeof input?.name === "string" ? input.name.slice(0, 80) : void 0
})).handler(createSsrRpc("03fa936e1fa0237d732fa54077b4b7792692f4db1803b1d147ebff32b07995ab"));
const acceptPartyInvite = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  inviteToken: typeof input?.inviteToken === "string" ? input.inviteToken.slice(0, 64) : ""
})).handler(createSsrRpc("ee8b3768d932f58400099b58152e01782f4d4a5673faed875138eec78b1986b3"));
const changePartyChannel = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  partyId: typeof input?.partyId === "string" ? input.partyId.slice(0, 64) : "",
  channelId: typeof input?.channelId === "string" ? input.channelId.slice(0, 100) : ""
})).handler(createSsrRpc("5e28f59458ac6712a2f5be2846fd68c5c14950d0bcea190f00ad578824d7d6db"));
const setMemberFlag = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  partyId: typeof input?.partyId === "string" ? input.partyId.slice(0, 64) : "",
  targetUserId: typeof input?.targetUserId === "string" ? input.targetUserId.slice(0, 64) : "",
  field: input?.field === "kicked" || input?.field === "muted_chat" || input?.field === "muted_mic" ? input.field : "muted_chat",
  value: Boolean(input?.value)
})).handler(createSsrRpc("c85bf694fccd0a3e8a45a91529b7b3a160673fd31f95fb459cc095d4c2d5268d"));
const hostAddMember = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  partyId: typeof input?.partyId === "string" ? input.partyId.slice(0, 64) : "",
  targetUserId: typeof input?.targetUserId === "string" ? input.targetUserId.slice(0, 64) : ""
})).handler(createSsrRpc("a8614b6b3521a713ff26ecf2c8fb931e8fbc75cd86c5b61f202b696062b0f8cb"));
const endWatchParty = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  partyId: typeof input?.partyId === "string" ? input.partyId.slice(0, 64) : ""
})).handler(createSsrRpc("508930475d7de99c560021a0f87f1bee2f9ab4c0f14689329153505ea2576e35"));
const postChatMessage = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  kind: input?.kind === "party" || input?.kind === "public" ? input.kind : "public",
  scopeId: typeof input?.scopeId === "string" ? input.scopeId.slice(0, 128) : "",
  body: typeof input?.body === "string" ? input.body.slice(0, 500) : ""
})).handler(createSsrRpc("be466318f3125b2b277a7c76d42c8686888399849371b42c3fcd7c3a75497e14"));
const cache = /* @__PURE__ */ new Map();
function useChatProfiles(senderIds) {
  const [, setTick] = reactExports.useState(0);
  const inflight = reactExports.useRef(/* @__PURE__ */ new Set());
  reactExports.useEffect(() => {
    const missing = senderIds.filter((id) => id && !cache.has(id) && !inflight.current.has(id));
    if (missing.length === 0) return;
    missing.forEach((id) => inflight.current.add(id));
    (async () => {
      const { data } = await supabase.from("profiles").select("id, display_name, username, avatar_url").in("id", missing);
      (data ?? []).forEach((row) => {
        cache.set(row.id, row);
      });
      missing.forEach((id) => {
        if (!cache.has(id)) {
          cache.set(id, { id, display_name: null, username: null, avatar_url: null });
        }
        inflight.current.delete(id);
      });
      setTick((t) => t + 1);
    })();
  }, [senderIds.join(",")]);
  const out = {};
  senderIds.forEach((id) => {
    const p = cache.get(id);
    if (p) out[id] = p;
  });
  return out;
}
const MAX_INITIAL = 100;
function ChatMessageList({ kind, scopeId, pending, currentUserId, className }) {
  const [rows, setRows] = reactExports.useState([]);
  const endRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!scopeId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("chat_messages").select("*").eq("kind", kind).eq("scope_id", scopeId).order("created_at", { ascending: false }).limit(MAX_INITIAL);
      if (cancelled) return;
      setRows((data ?? []).slice().reverse());
    })();
    const ch = supabase.channel(`chat-${kind}-${scopeId}`).on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_messages", filter: `scope_id=eq.${scopeId}` },
      (payload) => {
        const next = payload.new;
        if (next.kind !== kind) return;
        setRows((prev) => {
          if (prev.some((r) => r.id === next.id)) return prev;
          return [...prev, next].slice(-MAX_INITIAL);
        });
      }
    ).subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [kind, scopeId]);
  const visiblePending = reactExports.useMemo(() => {
    if (pending.length === 0) return pending;
    return pending.filter((p) => {
      if (p.status === "blocked" || p.status === "nudge") return true;
      const matched = rows.some(
        (r) => r.sender_id === currentUserId && r.body === p.body && Math.abs(new Date(r.created_at).getTime() - p.createdAt) < 3e4
      );
      return !matched;
    });
  }, [pending, rows, currentUserId]);
  const senderIds = reactExports.useMemo(() => {
    const ids = new Set(rows.map((r) => r.sender_id));
    return [...ids];
  }, [rows]);
  const profiles = useChatProfiles(senderIds);
  reactExports.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [rows.length, visiblePending.length]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-2 ${className ?? ""}`, children: [
    rows.length === 0 && visiblePending.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-xs text-white/40 py-6", children: "No messages yet. Say something." }),
    rows.map((row) => {
      const profile = profiles[row.sender_id];
      const name = profile?.display_name || profile?.username || "Viewer";
      const isMe = row.sender_id === currentUserId;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-7 rounded-full bg-white/10 overflow-hidden shrink-0", children: profile?.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: profile.avatar_url, alt: "", className: "size-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-full grid place-items-center text-[10px] text-white/60", children: name.charAt(0).toUpperCase() }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[11px] font-semibold truncate ${isMe ? "text-primary" : "text-white/90"}`, children: name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-white/40 shrink-0", children: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-white/90 break-words", children: row.body })
        ] })
      ] }, row.id);
    }),
    visiblePending.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 opacity-90", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-7 rounded-full bg-primary/20 shrink-0 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-primary", children: "you" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `text-sm break-words ${p.status === "blocked" ? "text-red-300 line-through" : p.status === "sending" ? "text-white/60 italic" : "text-white/90"}`,
            children: p.body
          }
        ),
        p.status === "blocked" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 inline-flex items-center gap-1 text-[10px] text-red-300/90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "size-3" }),
          "Blocked by Trey-I",
          p.reason ? ` · ${p.reason}` : "",
          p.timeoutMinutes ? ` · muted ${p.timeoutMinutes}m` : ""
        ] }),
        p.status === "nudge" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 inline-flex items-center gap-1 text-[10px] text-amber-300/90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-3" }),
          " Trey-I: ",
          p.reason || "keep it civil"
        ] })
      ] })
    ] }, p.tempId)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: endRef })
  ] });
}
function newTempId() {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function ChatComposer({ kind, scopeId, disabledReason, onPending }) {
  const { session } = useSupabaseSession();
  const [text, setText] = reactExports.useState("");
  const [sending, setSending] = reactExports.useState(false);
  const submit = reactExports.useCallback(
    async (e) => {
      e?.preventDefault();
      const body = text.trim();
      if (!body || sending) return;
      if (!session?.access_token) {
        onPending((prev) => [
          ...prev,
          { tempId: newTempId(), body, status: "blocked", reason: "Sign in to chat", createdAt: Date.now() }
        ]);
        setText("");
        return;
      }
      const tempId = newTempId();
      const optimistic = { tempId, body, status: "sending", createdAt: Date.now() };
      onPending((prev) => [...prev, optimistic]);
      setText("");
      setSending(true);
      try {
        const result = await postChatMessage({
          data: { accessToken: session.access_token, kind, scopeId, body }
        });
        if (!result.ok) {
          onPending(
            (prev) => prev.map(
              (p) => p.tempId === tempId ? {
                ...p,
                status: "blocked",
                reason: result.error === "blocked" ? result.reason ?? "blocked" : result.error,
                timeoutMinutes: result.timeoutMinutes ?? null
              } : p
            )
          );
        } else if (result.nudge) {
          onPending(
            (prev) => prev.map((p) => p.tempId === tempId ? { ...p, status: "nudge", reason: result.nudge ?? null } : p)
          );
          setTimeout(() => {
            onPending((prev) => prev.filter((p) => p.tempId !== tempId));
          }, 6e3);
        } else {
          onPending((prev) => prev.map((p) => p.tempId === tempId ? { ...p, status: "sent" } : p));
          setTimeout(() => {
            onPending((prev) => prev.filter((p) => p.tempId !== tempId));
          }, 2e3);
        }
      } catch (err) {
        console.error("[chat] send failed", err);
        onPending(
          (prev) => prev.map(
            (p) => p.tempId === tempId ? { ...p, status: "blocked", reason: "network_error" } : p
          )
        );
      } finally {
        setSending(false);
      }
    },
    [text, sending, session?.access_token, kind, scopeId, onPending]
  );
  const disabled = Boolean(disabledReason) || sending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "border-t border-white/10 p-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: text,
          onChange: (e) => setText(e.target.value),
          placeholder: disabledReason ?? "Say something…",
          maxLength: 500,
          disabled,
          className: "flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/60 disabled:opacity-50"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: disabled || !text.trim(),
          "aria-label": "Send",
          className: "size-9 grid place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "size-4" })
        }
      )
    ] }),
    disabledReason && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] text-white/40", children: disabledReason })
  ] });
}
export {
  ChatMessageList as C,
  acceptPartyInvite as a,
  ChatComposer as b,
  changePartyChannel as c,
  createWatchParty as d,
  endWatchParty as e,
  hostAddMember as h,
  setMemberFlag as s,
  useChatProfiles as u
};
