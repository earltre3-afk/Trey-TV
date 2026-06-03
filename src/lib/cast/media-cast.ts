export type CastMediaKind = "audio" | "video";

export interface CastMediaRequest {
  src: string;
  title: string;
  subtitle?: string;
  poster?: string | null;
  kind: CastMediaKind;
  contentType?: string;
  currentTime?: number;
  mediaElement?: HTMLMediaElement | null;
}

export interface CastCapabilities {
  airPlay: boolean;
  remotePlayback: boolean;
  chromecast: boolean;
  supported: boolean;
}

const CAST_SDK_URL = "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
let castSdkPromise: Promise<boolean> | null = null;

declare global {
  interface Window {
    __onGCastApiAvailable?: (isAvailable: boolean) => void;
    chrome?: any;
    cast?: any;
  }

  interface HTMLMediaElement {
    webkitShowPlaybackTargetPicker?: () => void;
    webkitCurrentPlaybackTargetIsWireless?: boolean;
  }
}

const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

const absoluteUrl = (src: string) => {
  if (!isBrowser()) return src;
  return new URL(src, window.location.href).toString();
};

const inferContentType = (request: CastMediaRequest) => {
  if (request.contentType) return request.contentType;
  const clean = request.src.split("?")[0].toLowerCase();
  if (clean.endsWith(".m3u8")) return "application/x-mpegURL";
  if (clean.endsWith(".mpd")) return "application/dash+xml";
  if (clean.endsWith(".mp4")) return request.kind === "audio" ? "audio/mp4" : "video/mp4";
  if (clean.endsWith(".webm")) return request.kind === "audio" ? "audio/webm" : "video/webm";
  if (clean.endsWith(".wav")) return "audio/wav";
  if (clean.endsWith(".m4a")) return "audio/mp4";
  if (clean.endsWith(".aac")) return "audio/aac";
  if (clean.endsWith(".ogg")) return request.kind === "audio" ? "audio/ogg" : "video/ogg";
  return request.kind === "audio" ? "audio/mpeg" : "video/mp4";
};

const loadCastSdk = () => {
  if (!isBrowser()) return Promise.resolve(false);
  if (window.chrome?.cast?.framework) return Promise.resolve(true);
  if (castSdkPromise) return castSdkPromise;

  castSdkPromise = new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CAST_SDK_URL}"]`);
    const timeout = window.setTimeout(() => resolve(Boolean(window.chrome?.cast?.framework)), 3500);

    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      window.clearTimeout(timeout);
      resolve(Boolean(isAvailable && window.chrome?.cast?.framework));
    };

    if (existing) return;

    const script = document.createElement("script");
    script.src = CAST_SDK_URL;
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timeout);
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return castSdkPromise;
};

const initializeChromecast = async () => {
  const loaded = await loadCastSdk();
  const cast = window.chrome?.cast;
  const framework = cast?.framework;
  if (!loaded || !cast || !framework) return null;

  const context = framework.CastContext.getInstance();
  context.setOptions({
    receiverApplicationId: cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    autoJoinPolicy: cast.AutoJoinPolicy.ORIGIN_SCOPED,
  });
  return context;
};

const startChromecast = async (request: CastMediaRequest) => {
  const context = await initializeChromecast();
  if (!context) return false;

  const cast = window.chrome.cast;
  const framework = cast.framework;
  let session = context.getCurrentSession?.();
  if (!session) {
    session = await context.requestSession();
  }

  const mediaInfo = new cast.media.MediaInfo(absoluteUrl(request.src), inferContentType(request));
  const metadata =
    request.kind === "audio"
      ? new cast.media.MusicTrackMediaMetadata()
      : new cast.media.GenericMediaMetadata();
  metadata.title = request.title;
  metadata.subtitle = request.subtitle || "";
  if (request.poster) metadata.images = [new cast.Image(absoluteUrl(request.poster))];
  mediaInfo.metadata = metadata;

  const loadRequest = new cast.media.LoadRequest(mediaInfo);
  loadRequest.autoplay = true;
  loadRequest.currentTime = Math.max(0, request.currentTime || 0);
  await session.loadMedia(loadRequest);
  return framework.CastContext.getInstance().getCastState() !== framework.CastState.NO_DEVICES_AVAILABLE;
};

export const getCastCapabilities = (mediaElement?: HTMLMediaElement | null): CastCapabilities => {
  const airPlay = Boolean(mediaElement?.webkitShowPlaybackTargetPicker);
  const remotePlayback = Boolean(mediaElement?.remote?.prompt);
  const chromecast = isBrowser();
  return {
    airPlay,
    remotePlayback,
    chromecast,
    supported: airPlay || remotePlayback || chromecast,
  };
};

export const requestMediaCast = async (request: CastMediaRequest) => {
  if (!request.src) throw new Error("This media item does not have a playable source to cast.");

  const media = request.mediaElement;
  if (media?.webkitShowPlaybackTargetPicker) {
    media.disableRemotePlayback = false;
    media.webkitShowPlaybackTargetPicker();
    return "airplay" as const;
  }

  const casted = await startChromecast(request).catch(() => false);
  if (casted) return "chromecast" as const;

  if (media?.remote?.prompt) {
    media.disableRemotePlayback = false;
    await media.remote.prompt();
    return "remote-playback" as const;
  }

  throw new Error("No browser cast target is available from this device.");
};

export const stopMediaCast = async () => {
  const context = window.chrome?.cast?.framework?.CastContext?.getInstance?.();
  const session = context?.getCurrentSession?.();
  if (session) {
    session.endSession(true);
  }
};
