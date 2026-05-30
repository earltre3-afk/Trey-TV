import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useGoBack } from "./use-go-back-DIwqgoNo.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { k as currentUser } from "./router-BtgGywEC.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, d as Image, V as Video, a0 as Music, R as Radio, W as WandSparkles, G as Globe } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
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
function Create() {
  const [text, setText] = reactExports.useState("");
  const navigate = useNavigate();
  const goBack = useGoBack("/");
  const handlePost = () => {
    if (!text.trim()) {
      toast.error("Write something first");
      return;
    }
    toast.success("Post published to your channel");
    navigate({
      to: "/"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: goBack, className: "size-9 grid place-items-center rounded-full glass", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handlePost, className: "px-4 py-2 rounded-xl text-sm font-semibold border border-primary text-primary glow-gold hover:bg-primary/10", children: "Publish" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl p-4 glass border border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: currentUser.avatar, className: "size-11 rounded-full object-cover ring-neon-purple", alt: "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: currentUser.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: text, onChange: (e) => setText(e.target.value), placeholder: "Share something with your fans…", rows: 6, className: "mt-3 w-full bg-transparent text-sm focus:outline-none resize-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 flex-wrap pt-2 border-t border-white/5", children: [{
        icon: Image,
        label: "Image",
        to: "/creator-studio/edit"
      }, {
        icon: Video,
        label: "Video",
        to: "/creator-studio/edit"
      }, {
        icon: Music,
        label: "Audio",
        to: "/creator-studio/edit"
      }, {
        icon: Radio,
        label: "Go Live",
        to: "/go-live"
      }, {
        icon: WandSparkles,
        label: "Trey-I",
        to: "/creator-studio/edit"
      }, {
        icon: Globe,
        label: "Everyone",
        to: "/creator-studio/edit"
      }].map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
        to: b.to
      }), className: "px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(b.icon, { className: "size-4" }),
        " ",
        b.label
      ] }, b.label)) })
    ] })
  ] }) });
}
export {
  Create as component
};
