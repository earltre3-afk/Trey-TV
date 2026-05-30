import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useMutation, a as useQueryClient, b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { g as useSupabaseSession } from "./router-BtgGywEC.mjs";
import { a as createServerFn, u as createSsrRpc } from "./index.mjs";
import { a_ as ExternalLink, X, O as Search, az as LoaderCircle, a$ as ImageOff, b0 as RefreshCw } from "../_libs/lucide-react.mjs";
const checkFwdStatus = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(createSsrRpc("06a0d65f0ee9964b1057da423bf5f82363dfe36707ad356b5bc532e0cabaa011"));
const getFwdGifLibrary = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(createSsrRpc("54efd8c34512ab5d550c885c1d487179ec2953c31767915a3c6b956f7be02128"));
const captureFwdGif = createServerFn({
  method: "POST"
}).inputValidator((input) => input).handler(createSsrRpc("dd3c9541a8d81125574f1d4b830e129188bd2faf8b14db608176faabcbe86b31"));
createServerFn({
  method: "POST"
}).inputValidator((input) => input).handler(createSsrRpc("a660a9c29f5e8bb4a89d30dac8d895f3d9f67f76b80cbe0b9488fe0d11596c43"));
const markFwdGifUsed = createServerFn({
  method: "POST"
}).inputValidator((input) => input).handler(createSsrRpc("80d3dacfe34600be625cfe556ae54069067d4aa3a6f0c2bf0a0ab328468705ac"));
createServerFn({
  method: "POST"
}).inputValidator((input) => input).handler(createSsrRpc("38781efe225655552b421e825b71f0406713442aef6542b84eb03562c2b94db2"));
function useFwdConnectionStatus() {
  const { session } = useSupabaseSession();
  const accessToken = session?.access_token ?? null;
  return useQuery({
    queryKey: ["fwd-connection-status", accessToken],
    queryFn: async () => {
      if (!accessToken) return { ok: true, connected: false, treyTvUid: null };
      return checkFwdStatus({ data: { accessToken } });
    },
    enabled: !!accessToken,
    staleTime: 6e4
  });
}
function useFwdGifLibrary(tab, limit = 48, offset = 0, query = "") {
  const { session } = useSupabaseSession();
  const accessToken = session?.access_token ?? null;
  return useQuery({
    queryKey: ["fwd-gif-library", tab, limit, offset, query, accessToken],
    queryFn: async () => {
      if (!accessToken) return { ok: false, error: "Not signed in." };
      return getFwdGifLibrary({ data: { accessToken, tab, limit, offset, query } });
    },
    enabled: !!accessToken,
    staleTime: 3e4
  });
}
function useCaptureFwdGif() {
  const { session } = useSupabaseSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input) => {
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Not signed in.");
      return captureFwdGif({ data: { accessToken, ...input } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fwd-gif-library", "recent"] });
    }
  });
}
function useMarkFwdGifUsed() {
  const { session } = useSupabaseSession();
  return useMutation({
    mutationFn: async (input) => {
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Not signed in.");
      return markFwdGifUsed({ data: { accessToken, ...input } });
    }
  });
}
function cleanUrl(value) {
  const url = typeof value === "string" ? value.trim() : "";
  return url || null;
}
function getAnimatedFwdGifUrl(item) {
  return cleanUrl(item.gif_url) || cleanUrl(item.media_url) || cleanUrl(item.source_url) || cleanUrl(item.playback_url) || cleanUrl(item.animated_url) || cleanUrl(item.url);
}
function getFwdPosterUrl(item) {
  return cleanUrl(item.poster_url) || cleanUrl(item.preview_url) || cleanUrl(item.thumbnail_url) || cleanUrl(item.still_url);
}
function buildFwdGifDetailUrl(gifId, detailUrl) {
  const id = String(gifId || "").trim();
  if (!id) return "https://fwd.treytv.com";
  return `https://fwd.treytv.com/gif/${encodeURIComponent(id)}`;
}
const DEFAULT_FWD_ORIGINS = [
  "https://fwd.treytv.com",
  "http://localhost:3000",
  // FWD dev server
  "http://localhost:5173"
  // FWD dev (alt port)
];
function getFwdPickerConfig() {
  const baseUrl = String("").replace(/\/+$/, "");
  const publicKey = String("").trim();
  const allowedOrigins = String("").split(",").map((origin) => origin.trim().replace(/\/+$/, "")).filter(Boolean);
  return {
    allowedOrigins: Array.from(/* @__PURE__ */ new Set([new URL(baseUrl).origin, ...allowedOrigins, ...DEFAULT_FWD_ORIGINS])),
    baseUrl,
    publicKey
  };
}
function buildFwdPickerUrl(input) {
  const config = getFwdPickerConfig();
  const url = new URL("/embed/picker", config.baseUrl);
  if (config.publicKey) url.searchParams.set("key", config.publicKey);
  url.searchParams.set("source_platform", input.sourcePlatform ?? "trey_tv");
  url.searchParams.set("context", input.context);
  if (input.treyTvUid) url.searchParams.set("trey_tv_uid", input.treyTvUid);
  if (input.draft && input.draft.trim().length >= 2) {
    url.searchParams.set("message", input.draft.trim().slice(0, 500));
  }
  return url.toString();
}
function sendDraftUpdate(iframeWindow, text) {
  if (!iframeWindow) return;
  const { baseUrl } = getFwdPickerConfig();
  try {
    const targetOrigin = new URL(baseUrl).origin;
    iframeWindow.postMessage({ type: "fwd:draft:update", text: String(text).slice(0, 500) }, targetOrigin);
  } catch {
  }
}
function parseFwdPickerMessage(event) {
  const { allowedOrigins } = getFwdPickerConfig();
  if (!allowedOrigins.includes(event.origin)) return null;
  const data = event.data;
  if (!data || typeof data !== "object") return null;
  const type = data.type;
  if (type === "fwd:gif:selected") {
    const gif = data.gif;
    if (!gif || typeof gif !== "object") return null;
    const url = getAnimatedFwdGifUrl(gif);
    if (typeof gif.gif_id !== "string" || !url) return null;
    if (!/^https:\/\//i.test(url)) return null;
    return {
      gif_id: gif.gif_id.slice(0, 160),
      height: typeof gif.height === "number" ? gif.height : null,
      preview_url: getFwdPosterUrl(gif),
      detail_url: typeof gif.detail_url === "string" ? gif.detail_url : null,
      title: typeof gif.title === "string" ? gif.title.slice(0, 160) : null,
      url,
      width: typeof gif.width === "number" ? gif.width : null
    };
  }
  if (type === "FWD_GIF_SELECTED") {
    const gif = data.gif;
    if (!gif || typeof gif !== "object") return null;
    const url = getAnimatedFwdGifUrl({
      gif_url: typeof gif.gifUrl === "string" ? gif.gifUrl : null,
      media_url: typeof gif.mediaUrl === "string" ? gif.mediaUrl : null,
      source_url: typeof gif.sourceUrl === "string" ? gif.sourceUrl : null,
      playback_url: typeof gif.playbackUrl === "string" ? gif.playbackUrl : null,
      animated_url: typeof gif.animatedUrl === "string" ? gif.animatedUrl : null,
      url: typeof gif.url === "string" ? gif.url : null
    });
    if (typeof url !== "string" || !/^https:\/\//i.test(url)) return null;
    return {
      gif_id: typeof gif.id === "string" ? gif.id.slice(0, 160) : url,
      height: typeof gif.height === "number" ? gif.height : null,
      preview_url: getFwdPosterUrl({
        poster_url: typeof gif.posterUrl === "string" ? gif.posterUrl : null,
        preview_url: typeof gif.previewUrl === "string" ? gif.previewUrl : null,
        thumbnail_url: typeof gif.thumbnailUrl === "string" ? gif.thumbnailUrl : null,
        still_url: typeof gif.stillUrl === "string" ? gif.stillUrl : null
      }),
      detail_url: typeof gif.detailUrl === "string" ? gif.detailUrl : null,
      title: typeof gif.title === "string" ? gif.title.slice(0, 160) : null,
      url,
      width: typeof gif.width === "number" ? gif.width : null
    };
  }
  return null;
}
const FWD_BASE_URL = "https://fwd.treytv.com";
const TABS = [
  { key: "saved", label: "Saved" },
  { key: "recent", label: "Recent" },
  { key: "created", label: "Created" },
  { key: "unsaved", label: "Unsaved" },
  { key: "discover", label: "Discover" }
];
function FwdGifPicker({ open, onClose, onSelect, treyTvUid, context = "message", draft }) {
  const [tab, setTab] = reactExports.useState("saved");
  const [search, setSearch] = reactExports.useState("");
  const [debouncedSearch, setDebouncedSearch] = reactExports.useState("");
  const markUsed = useMarkFwdGifUsed();
  const capture = useCaptureFwdGif();
  reactExports.useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search.trim()), 280);
    return () => window.clearTimeout(id);
  }, [search]);
  const handleSelect = reactExports.useCallback((gif) => {
    capture.mutate({
      gif_url: gif.url,
      gif_id: gif.gif_id ?? null,
      preview_url: gif.preview_url ?? null,
      title: gif.title ?? null,
      width: gif.width ?? null,
      height: gif.height ?? null
    });
    onSelect(gif);
    onClose();
  }, [capture, onSelect, onClose]);
  const handleLibrarySelect = reactExports.useCallback((item) => {
    const url = getAnimatedFwdGifUrl(item);
    if (!url) return;
    markUsed.mutate({ id: item.id });
    const payload = {
      gif_id: item.gif_id ?? item.id,
      url,
      title: item.title ?? void 0,
      width: item.width ?? void 0,
      height: item.height ?? void 0,
      preview_url: getFwdPosterUrl(item),
      detail_url: buildFwdGifDetailUrl(item.gif_id ?? item.id)
    };
    onSelect(payload);
    onClose();
  }, [markUsed, onSelect, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-[110] flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "FWD GIF library",
      onClick: (e) => {
        if (e.target === e.currentTarget) onClose();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex h-[82dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-background shadow-2xl sm:h-[760px] sm:rounded-[28px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-black uppercase tracking-[0.28em] text-primary", children: "FWD" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm text-muted-foreground", children: "Your GIF Library" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: FWD_BASE_URL,
                target: "_blank",
                rel: "noreferrer",
                className: "grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground",
                "aria-label": "Open FWD in a new tab",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: onClose,
                className: "grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground",
                "aria-label": "Close GIF picker",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 overflow-x-auto border-b border-white/10 px-4 py-2 shrink-0 scrollbar-none", children: TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setTab(t.key),
            className: [
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              tab === t.key ? "bg-primary text-primary-foreground" : "bg-white/[0.06] text-muted-foreground hover:bg-white/10 hover:text-foreground"
            ].join(" "),
            children: t.label
          },
          t.key
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 border-b border-white/10 px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex min-h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-3 text-sm focus-within:border-primary/50 focus-within:shadow-[0_0_18px_-8px_oklch(0.82_0.16_85_/_0.55)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4 shrink-0 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: search,
              onChange: (event) => setSearch(event.target.value),
              placeholder: "Search your FWD GIFs",
              className: "min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            }
          ),
          search && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setSearch(""), className: "grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground", "aria-label": "Clear GIF search", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3.5" }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-0 flex-1 overflow-hidden", children: tab === "discover" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          DiscoverTab,
          {
            context: context === "profile" ? "feed_reply" : context,
            onSelect: handleSelect,
            treyTvUid,
            draft
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LibraryGrid, { tab, query: debouncedSearch, onSelect: handleLibrarySelect }) }) })
      ] })
    }
  );
}
function DiscoverTab({ context, onSelect, treyTvUid, draft }) {
  const iframeRef = reactExports.useRef(null);
  const pickerUrl = reactExports.useMemo(
    () => buildFwdPickerUrl({ context, treyTvUid }),
    [context, treyTvUid]
  );
  reactExports.useEffect(() => {
    const onMessage = (event) => {
      const gif = parseFwdPickerMessage(event);
      if (gif) onSelect(gif);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onSelect]);
  reactExports.useEffect(() => {
    sendDraftUpdate(iframeRef.current?.contentWindow, draft ?? "");
  }, [draft]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "iframe",
    {
      ref: iframeRef,
      title: "FWD Discover",
      src: pickerUrl,
      className: "h-full w-full bg-black",
      referrerPolicy: "strict-origin-when-cross-origin",
      sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
    }
  );
}
const CONNECT_ERRORS = [
  "No FWD account linked",
  "No Trey TV UID on profile",
  "not connected",
  "Not signed in"
];
function isConnectError(error) {
  if (!error) return false;
  return CONNECT_ERRORS.some((s) => error.includes(s));
}
function ConnectFwdCta() {
  const returnTo = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";
  const signupUrl = `https://fwd.treytv.com/signup?returnTo=${returnTo}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[280px] flex-col items-center justify-center gap-4 px-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl select-none", children: "🔗" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "Connect FWD" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Connect FWD to use GIFs in messages and comments." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "a",
      {
        href: signupUrl,
        target: "_blank",
        rel: "noreferrer",
        className: "inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-80",
        children: [
          "Open FWD",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-3" })
        ]
      }
    )
  ] });
}
function LibraryGrid({ tab, query, onSelect }) {
  const { data, isLoading, isError, refetch, isFetching } = useFwdGifLibrary(tab, 48, 0, query);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[200px] items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin text-muted-foreground" }) });
  }
  const errorMsg = !data?.ok ? data?.error : void 0;
  if (isError || !data || !data.ok) {
    if (isConnectError(errorMsg)) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ConnectFwdCta, {});
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[200px] flex-col items-center justify-center gap-2 px-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ImageOff, { className: "size-8 text-muted-foreground/50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: errorMsg ?? "Could not load your GIF library." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => void refetch(),
          className: "mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary/40",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-3" }),
            " Retry"
          ]
        }
      )
    ] });
  }
  const rawGifs = data.data?.gifs ?? [];
  const q = query.toLowerCase();
  const gifs = q ? rawGifs.filter((gif) => [gif.title, gif.caption, gif.provider, gif.mood, ...gif.tags ?? []].some((value) => String(value ?? "").toLowerCase().includes(q))) : rawGifs;
  if (gifs.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { tab, query });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    isFetching && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-10 flex items-center justify-center gap-2 border-b border-white/10 bg-background/80 py-2 text-xs text-muted-foreground backdrop-blur", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-3.5 animate-spin" }),
      " Refreshing GIFs"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-1 p-2 sm:grid-cols-4", children: gifs.map((gif) => /* @__PURE__ */ jsxRuntimeExports.jsx(GifTile, { gif, onSelect }, gif.id)) })
  ] });
}
function GifTile({ gif, onSelect }) {
  const poster = getFwdPosterUrl(gif);
  const animated = getAnimatedFwdGifUrl(gif);
  const primary = animated || poster;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: () => onSelect(gif),
      className: "group relative aspect-square overflow-hidden rounded-xl bg-white/[0.04] transition-all hover:scale-[1.03] hover:ring-2 hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      title: gif.title ?? void 0,
      children: [
        poster ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: poster,
            alt: "",
            "aria-hidden": true,
            loading: "lazy",
            className: "absolute inset-0 h-full w-full object-cover opacity-30 blur-sm",
            onError: (e) => {
              e.currentTarget.style.display = "none";
            }
          }
        ) : null,
        primary ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: primary,
            alt: gif.title ?? "GIF",
            loading: "lazy",
            className: "absolute inset-0 h-full w-full object-cover",
            onError: (e) => {
              e.currentTarget.style.display = "none";
            }
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ImageOff, { className: "size-5 text-muted-foreground/30" }) })
      ]
    }
  );
}
const EMPTY_STATE_COPY = {
  saved: { heading: "No saved GIFs yet", body: "Tap the bookmark on any GIF in the Discover tab or on FWD to save it here.", cta: "Open FWD GIF Maker" },
  recent: { heading: "No recently used GIFs", body: "GIFs you send in messages and comments will show up here.", cta: "Open FWD" },
  created: { heading: "No created GIFs yet", body: "Make your own GIFs in FWD and they will live here.", cta: "Open FWD GIF Maker" },
  unsaved: { heading: "Nothing here", body: "GIFs you have used but not saved appear here.", cta: "Open FWD" },
  favorite: { heading: "No favorites yet", body: "Mark GIFs as favorites on FWD and they will sync here.", cta: "Open FWD" }
};
function EmptyState({ tab, query }) {
  const copy = EMPTY_STATE_COPY[tab];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[280px] flex-col items-center justify-center gap-4 px-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl select-none", children: "🎞️" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: query ? "No matching GIFs" : copy.heading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: query ? "Try a different FWD search, or open FWD to make something new." : copy.body })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "a",
      {
        href: FWD_BASE_URL,
        target: "_blank",
        rel: "noreferrer",
        className: "inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-80",
        children: [
          copy.cta,
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-3" })
        ]
      }
    )
  ] });
}
export {
  FwdGifPicker as F,
  useFwdConnectionStatus as a,
  buildFwdGifDetailUrl as b,
  useFwdGifLibrary as c,
  getAnimatedFwdGifUrl as d,
  getFwdPosterUrl as g,
  useMarkFwdGifUsed as u
};
