import { useEffect, useState } from "react";
import { Cast, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { requestMediaCast } from "@/lib/cast/media-cast";

const isVisibleMedia = (media: HTMLMediaElement) => {
  const rect = media.getBoundingClientRect();
  return rect.width >= 120 && rect.height >= 60 && media.offsetParent !== null;
};

const isCastableMedia = (media: HTMLMediaElement) => {
  if (media instanceof HTMLVideoElement) {
    return isVisibleMedia(media);
  }
  if (media instanceof HTMLAudioElement) {
    return (
      media.getAttribute("data-is-music") === "true" ||
      media.getAttribute("data-castable") === "true"
    );
  }
  return false;
};

const mediaTitle = (media: HTMLMediaElement) =>
  media.getAttribute("title") ||
  media.getAttribute("aria-label") ||
  media.closest("[data-title]")?.getAttribute("data-title") ||
  document.title ||
  "Trey TV media";

export function GlobalMediaCastButton() {
  const [target, setTarget] = useState<HTMLMediaElement | null>(null);
  const [casting, setCasting] = useState(false);

  useEffect(() => {
    const chooseTarget = (event: Event) => {
      const media = event.target instanceof HTMLMediaElement ? event.target : null;
      if (!media || !media.currentSrc || !isCastableMedia(media)) return;
      setTarget(media);
    };

    const clearTarget = (event: Event) => {
      if (event.target === target) setTarget(null);
    };

    document.addEventListener("play", chooseTarget, true);
    document.addEventListener("click", chooseTarget, true);
    document.addEventListener("emptied", clearTarget, true);
    document.addEventListener("ended", clearTarget, true);
    return () => {
      document.removeEventListener("play", chooseTarget, true);
      document.removeEventListener("click", chooseTarget, true);
      document.removeEventListener("emptied", clearTarget, true);
      document.removeEventListener("ended", clearTarget, true);
    };
  }, [target]);

  if (!target?.currentSrc) return null;

  const kind = target instanceof HTMLVideoElement ? "video" : "audio";
  const title = mediaTitle(target);

  return (
    <button
      type="button"
      aria-label={`Cast ${title}`}
      title="Cast current media"
      disabled={casting}
      onClick={async () => {
        setCasting(true);
        try {
          const poster = target instanceof HTMLVideoElement ? target.poster : null;
          await requestMediaCast({
            src: target.currentSrc,
            title,
            poster,
            kind,
            currentTime: target.currentTime,
            mediaElement: target,
          });
          toast.success("Cast picker opened");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Cast could not be started.");
        } finally {
          setCasting(false);
        }
      }}
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] right-4 z-[80] flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/30 bg-black/75 text-cyan-100 shadow-[0_14px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all hover:bg-cyan-950/80 active:scale-95 disabled:opacity-60"
    >
      {casting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Cast className="h-5 w-5" />}
    </button>
  );
}
