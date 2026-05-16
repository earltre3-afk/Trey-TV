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

const DEFAULT_FWD_ORIGINS = ["https://fwd.treytv.com", "http://localhost:5173"];

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
}) {
  const config = getFwdPickerConfig();
  const url = new URL("/embed/picker", config.baseUrl);
  if (config.publicKey) url.searchParams.set("key", config.publicKey);
  url.searchParams.set("source_platform", input.sourcePlatform ?? "trey_tv");
  url.searchParams.set("context", input.context);
  if (input.treyTvUid) url.searchParams.set("trey_tv_uid", input.treyTvUid);
  return url.toString();
}

export function parseFwdPickerMessage(event: MessageEvent): FwdGifPayload | null {
  const { allowedOrigins } = getFwdPickerConfig();
  if (!allowedOrigins.includes(event.origin)) return null;

  const data = event.data;
  if (!data || typeof data !== "object") return null;
  const type = (data as any).type;
  if (type !== "fwd:gif:selected") return null;

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
