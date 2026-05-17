export type FwdPickerContext =
  | "message"
  | "comment"
  | "group_chat"
  | "watch_party"
  | "creator_channel"
  | "feed_reply";

export type FwdGifPayload = {
  gif_id: string;
  title?: string | null;
  url: string;
  width?: number | null;
  height?: number | null;
  preview_url?: string | null;
};

// FWD's production origin + common dev ports for both apps
const DEFAULT_FWD_ORIGINS = [
  "https://fwd.treytv.com",
  "http://localhost:3000", // FWD dev server
  "http://localhost:5173", // FWD dev (alt port)
];

export function getFwdPickerConfig() {
  const baseUrl = String(import.meta.env.VITE_FWD_PICKER_BASE_URL ?? "https://fwd.treytv.com").replace(/\/+$/, "");
  const publicKey = String(import.meta.env.VITE_FWD_PICKER_PUBLIC_KEY ?? "").trim();
  const allowedOrigins = String(import.meta.env.VITE_FWD_PICKER_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  return {
    allowedOrigins: Array.from(new Set([new URL(baseUrl).origin, ...allowedOrigins, ...DEFAULT_FWD_ORIGINS])),
    baseUrl,
    publicKey,
  };
}

export function buildFwdPickerUrl(input: {
  context: FwdPickerContext;
  sourcePlatform?: "trey_tv";
  treyTvUid?: string | null;
  draft?: string | null;
}) {
  const config = getFwdPickerConfig();
  const url = new URL("/embed/picker", config.baseUrl);
  if (config.publicKey) url.searchParams.set("key", config.publicKey);
  url.searchParams.set("source_platform", input.sourcePlatform ?? "trey_tv");
  url.searchParams.set("context", input.context);
  if (input.treyTvUid) url.searchParams.set("trey_tv_uid", input.treyTvUid);
  // Seed the picker with the current draft so AI predictions load immediately
  if (input.draft && input.draft.trim().length >= 2) {
    url.searchParams.set("message", input.draft.trim().slice(0, 500));
  }
  return url.toString();
}

/**
 * Sends a live draft update to the FWD picker iframe.
 * Call this whenever the user's message draft changes while the picker is open.
 * FWD debounces the AI call internally (320 ms), so it's safe to call on every keystroke.
 */
export function sendDraftUpdate(iframeWindow: Window | null | undefined, text: string): void {
  if (!iframeWindow) return;
  const { baseUrl } = getFwdPickerConfig();
  try {
    const targetOrigin = new URL(baseUrl).origin;
    iframeWindow.postMessage({ type: "fwd:draft:update", text: String(text).slice(0, 500) }, targetOrigin);
  } catch {
    // Ignore cross-origin errors during local dev
  }
}

export function parseFwdPickerMessage(event: MessageEvent): FwdGifPayload | null {
  const { allowedOrigins } = getFwdPickerConfig();
  if (!allowedOrigins.includes(event.origin)) return null;

  const data = event.data;
  if (!data || typeof data !== "object") return null;
  const type = (data as any).type;

  // Accept both the new canonical format and the legacy format
  if (type === "fwd:gif:selected") {
    const gif = (data as any).gif;
    if (!gif || typeof gif !== "object") return null;
    if (typeof gif.gif_id !== "string" || typeof gif.url !== "string") return null;
    if (!/^https:\/\//i.test(gif.url)) return null;
    return {
      gif_id: gif.gif_id.slice(0, 160),
      height: typeof gif.height === "number" ? gif.height : null,
      preview_url: typeof gif.preview_url === "string" ? gif.preview_url : null,
      title: typeof gif.title === "string" ? gif.title.slice(0, 160) : null,
      url: gif.url,
      width: typeof gif.width === "number" ? gif.width : null,
    };
  }

  // Legacy format: FWD_GIF_SELECTED with gif.mediaUrl
  if (type === "FWD_GIF_SELECTED") {
    const gif = (data as any).gif;
    if (!gif || typeof gif !== "object") return null;
    const url = gif.mediaUrl || gif.gifUrl || gif.url;
    if (typeof url !== "string" || !/^https:\/\//i.test(url)) return null;
    return {
      gif_id: typeof gif.id === "string" ? gif.id.slice(0, 160) : url,
      height: typeof gif.height === "number" ? gif.height : null,
      preview_url: typeof gif.previewUrl === "string" ? gif.previewUrl : null,
      title: typeof gif.title === "string" ? gif.title.slice(0, 160) : null,
      url,
      width: typeof gif.width === "number" ? gif.width : null,
    };
  }

  return null;
}
