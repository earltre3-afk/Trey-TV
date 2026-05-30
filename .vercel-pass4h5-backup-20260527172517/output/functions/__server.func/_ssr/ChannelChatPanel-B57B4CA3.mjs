import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { g as useSupabaseSession } from "./router-BtgGywEC.mjs";
import { C as ChatMessageList, b as ChatComposer } from "./ChatComposer-C-_cuLln.mjs";
import { au as MessageCircle } from "../_libs/lucide-react.mjs";
function ChannelChatPanel({ handle, className }) {
  const { session } = useSupabaseSession();
  const [pending, setPending] = reactExports.useState([]);
  const userId = session?.user?.id ?? null;
  const disabledReason = userId ? null : "Sign in to chat";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur flex flex-col h-[420px] ${className ?? ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between px-3 py-2 border-b border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "size-4 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Community chat" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[9px] tracking-widest font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1 rounded-full bg-green-400 animate-pulse" }),
          " 24/7"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-white/40", children: [
        "@",
        handle
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChatMessageList, { kind: "public", scopeId: handle, pending, currentUserId: userId }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ChatComposer,
      {
        kind: "public",
        scopeId: handle,
        disabledReason,
        onPending: setPending
      }
    )
  ] });
}
export {
  ChannelChatPanel as C
};
