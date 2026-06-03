import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Share2,
  RefreshCw,
  BookOpen,
  Sparkles,
  Download,
  Image as ImageIcon,
  Loader2,
  Layers,
} from "lucide-react";
import { Branch, Ending } from "../../lib/storyTypes";
import { IMAGES, CHARACTERS_BY_ID } from "../../lib/storyData";
import { renderEndingPoster, downloadBlob, pickCastFromBranch } from "../../lib/posterCanvas";
import { useAuth } from "@/lib/auth";
import { CharacterAvatar } from "../CharacterAvatar";
import { TreyTVLogo } from "../TreyTVLogo";

interface Props {
  ending: Ending;
  /** Optional — when provided, the poster will feature the cast that actually appeared on this branch. */
  branch?: Branch | null;
  onNewBranch: () => void;
  onLibrary: () => void;
  onReread?: () => void;
}

export const EndingScreen: React.FC<Props> = ({
  ending,
  branch,
  onNewBranch,
  onLibrary,
  onReread,
}) => {
  const [busy, setBusy] = useState<"share" | "download" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  // Trey TV auth — no requireAuth; just proceed (auth gating handled by player)

  const castIds = useMemo(() => pickCastFromBranch(branch ?? null), [branch]);
  const heroImage = branch?.chapters[branch.chapters.length - 1]?.image || IMAGES.twinsCover;

  // Pre-render the poster so users can preview
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const blob = await renderEndingPoster(ending, heroImage, castIds);
        if (cancelled) return;
        blobRef.current = blob;
        setPreviewUrl(URL.createObjectURL(blob));
      } catch (e) {
        console.warn("Poster render failed:", e);
      }
    })();
    return () => {
      cancelled = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ending.name, heroImage, castIds.join("|")]);

  const ensureBlob = async (): Promise<Blob> => {
    if (blobRef.current) return blobRef.current;
    const blob = await renderEndingPoster(ending, heroImage, castIds);
    blobRef.current = blob;
    return blob;
  };

  const doShare = async () => {
    setFeedback(null);
    setBusy("share");
    try {
      const blob = await ensureBlob();
      const file = new File(
        [blob],
        `switch-kicks-${ending.name.replace(/\s+/g, "-").toLowerCase()}.png`,
        {
          type: "image/png",
        },
      );
      const shareData: ShareData = {
        title: "Switch Kicks",
        text: `I just unlocked "${ending.name}" on Switch Kicks — ${ending.tagline}`,
        files: [file],
      };
      const canShareFiles =
        "canShare" in navigator && typeof navigator.canShare === "function"
          ? navigator.canShare(shareData)
          : true;
      if (navigator.share && canShareFiles) {
        await navigator.share(shareData);
        setFeedback("Shared!");
      } else if (navigator.share) {
        await navigator.share({ title: shareData.title, text: shareData.text });
        setFeedback("Shared!");
      } else {
        downloadBlob(blob, file.name);
        setFeedback("Image downloaded — share it anywhere.");
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setFeedback("Couldn't open share sheet. Try downloading instead.");
      }
    } finally {
      setBusy(null);
    }
  };

  const doDownload = async () => {
    setFeedback(null);
    setBusy("download");
    try {
      const blob = await ensureBlob();
      downloadBlob(blob, `switch-kicks-${ending.name.replace(/\s+/g, "-").toLowerCase()}.png`);
      setFeedback("Saved 1080Ã—1920 poster.");
    } catch {
      setFeedback("Couldn't generate poster. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleShare = () => doShare();
  const handleDownload = () => doDownload();

  return (
    <div className="min-h-screen px-4 pt-8 pb-24">
      <div className="relative mx-auto max-w-sm overflow-hidden rounded-3xl border border-amber-500/40 shadow-2xl shadow-amber-500/20">
        {previewUrl ? (
          <img src={previewUrl} alt={ending.name} className="block w-full" />
        ) : (
          <div className="relative aspect-[9/16] w-full">
            <img
              src={heroImage}
              alt={ending.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black" />

            <div className="absolute top-5 left-5 right-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black shadow-lg shadow-amber-500/40">
                <Sparkles className="h-3 w-3" /> New Ending Unlocked
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
              <div className="text-xs font-bold uppercase tracking-[0.4em] text-amber-400">
                Switch Kicks
              </div>
              <h1 className="mt-3 font-display text-5xl font-black uppercase leading-none tracking-tight text-white drop-shadow-2xl">
                {ending.name}
              </h1>
              <p className="mt-5 font-serif text-base italic leading-snug text-white/90">
                {ending.tagline}
              </p>

              {/* In-page cast preview (fallback while canvas is still rendering) */}
              {castIds.length > 0 && (
                <div className="mt-5 flex flex-col items-center gap-2">
                  <div className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/50">
                    · Starring ·
                  </div>
                  <div className="flex -space-x-3">
                    {castIds.slice(0, 5).map((id) => {
                      const c = CHARACTERS_BY_ID[id];
                      if (!c) return null;
                      return (
                        <div
                          key={id}
                          className="h-12 w-12 overflow-hidden rounded-full border-2 border-black ring-2 ring-amber-400/70"
                        >
                          <CharacterAvatar character={c} faceCrop />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-5 flex items-center justify-center">
                <TreyTVLogo size={28} />
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-white/40">
                Story by Trey Trizzy
              </div>
            </div>
          </div>
        )}
      </div>

      {feedback && (
        <div className="mx-auto mt-4 max-w-sm rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-center text-xs font-bold text-emerald-300">
          {feedback}
        </div>
      )}

      <div className="mx-auto mt-6 max-w-sm space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleShare}
            disabled={busy !== null}
            className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 font-display text-xs font-bold uppercase tracking-widest text-black shadow-lg shadow-amber-500/30 disabled:opacity-60"
          >
            {busy === "share" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            Share
          </button>
          <button
            onClick={handleDownload}
            disabled={busy !== null}
            className="flex items-center justify-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 py-3.5 font-display text-xs font-bold uppercase tracking-widest text-amber-300 disabled:opacity-60"
          >
            {busy === "download" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Save PNG
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center text-[11px] text-white/50">
          <ImageIcon className="mr-1 inline h-3 w-3" />
          1080 Ã— 1920 — optimized for Instagram Stories
        </div>

        {onReread && (
          <button
            onClick={onReread}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-violet-200"
          >
            <Layers className="h-4 w-4" /> Re-read This Branch
          </button>
        )}

        <button
          onClick={onNewBranch}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-white"
        >
          <RefreshCw className="h-4 w-4" /> Start New Branch
        </button>
        <button
          onClick={onLibrary}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-white"
        >
          <BookOpen className="h-4 w-4" /> Back to Library
        </button>
      </div>
    </div>
  );
};
