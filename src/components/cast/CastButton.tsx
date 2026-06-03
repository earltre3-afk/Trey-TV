import { useEffect, useMemo, useState, type RefObject } from "react";
import { Airplay, Cast, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getCastCapabilities,
  requestMediaCast,
  type CastMediaKind,
} from "@/lib/cast/media-cast";

interface CastButtonProps {
  src?: string | null;
  title: string;
  subtitle?: string;
  poster?: string | null;
  kind: CastMediaKind;
  mediaElement?: HTMLMediaElement | null;
  mediaRef?: RefObject<HTMLMediaElement | HTMLAudioElement | HTMLVideoElement | null>;
  className?: string;
  compact?: boolean;
}

export function CastButton({
  src,
  title,
  subtitle,
  poster,
  kind,
  mediaElement,
  mediaRef,
  className = "",
  compact = false,
}: CastButtonProps) {
  const [casting, setCasting] = useState(false);
  const [liveMediaElement, setLiveMediaElement] = useState<HTMLMediaElement | null>(null);
  const capabilities = useMemo(
    () => getCastCapabilities(liveMediaElement || mediaElement),
    [liveMediaElement, mediaElement],
  );

  useEffect(() => {
    setLiveMediaElement(mediaRef?.current ?? mediaElement ?? null);
  }, [mediaElement, mediaRef]);

  const cast = async () => {
    if (!src) {
      toast.error("This item does not have a playable source to cast.");
      return;
    }

    const media = mediaRef?.current ?? mediaElement ?? liveMediaElement;
    setCasting(true);
    try {
      const target = await requestMediaCast({
        src,
        title,
        subtitle,
        poster,
        kind,
        currentTime: media?.currentTime,
        mediaElement: media,
      });
      toast.success(
        target === "chromecast"
          ? "Casting to TV"
          : target === "airplay"
            ? "AirPlay picker opened"
            : "Remote playback picker opened",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cast could not be started.");
    } finally {
      setCasting(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={`Cast ${title}`}
      title={
        capabilities.supported
          ? "Cast to TV or speaker"
          : "Cast is not available in this browser"
      }
      onClick={(event) => {
        event.stopPropagation();
        void cast();
      }}
      disabled={casting || !src}
      className={`inline-flex items-center justify-center gap-2 border transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
        compact
          ? "h-10 w-10 rounded-full border-white/10 bg-black/45 text-white shadow-lg backdrop-blur hover:bg-black/65"
          : "rounded-xl border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/85 hover:border-cyan-300/35 hover:bg-cyan-400/10 hover:text-cyan-100"
      } ${className}`}
    >
      {casting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : capabilities.airPlay ? (
        <Airplay className="h-4 w-4" />
      ) : (
        <Cast className="h-4 w-4" />
      )}
      {!compact && <span>Cast</span>}
    </button>
  );
}
