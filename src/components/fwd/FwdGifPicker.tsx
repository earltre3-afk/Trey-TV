import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { X, ExternalLink, Loader2, ImageOff, Search, RefreshCw } from "lucide-react";
import { useFwdGifLibrary, useMarkFwdGifUsed, useCaptureFwdGif, type FwdGifItem, type FwdGifLibraryTab } from "@/lib/fwd-gif-api";
import { buildFwdGifDetailUrl, buildFwdPickerUrl, getAnimatedFwdGifUrl, getFwdPosterUrl, parseFwdPickerMessage, sendDraftUpdate } from "@/lib/fwd/picker";
import type { FwdGifPayload } from "@/lib/fwd/picker";

const FWD_BASE_URL = "https://fwd.treytv.com";

type FwdGifPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (gif: FwdGifPayload) => void;
  treyTvUid?: string | null;
  context?: "message" | "comment" | "profile";
  draft?: string;
  restrictTab?: FwdGifLibraryTab;
};

const TABS: { key: FwdGifLibraryTab | "discover"; label: string }[] = [
  { key: "saved",    label: "Saved"    },
  { key: "recent",   label: "Recent"   },
  { key: "created",  label: "Created"  },
  { key: "unsaved",  label: "Unsaved"  },
  { key: "discover", label: "Discover" },
];

export function FwdGifPicker({ open, onClose, onSelect, treyTvUid, context = "message", draft, restrictTab }: FwdGifPickerProps) {
  const [tab, setTab] = useState<FwdGifLibraryTab | "discover">(restrictTab ?? "saved");
  const visibleTabs = restrictTab ? TABS.filter((t) => t.key === restrictTab) : TABS;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const markUsed = useMarkFwdGifUsed();
  const capture = useCaptureFwdGif();

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search.trim()), 280);
    return () => window.clearTimeout(id);
  }, [search]);

  // Called when a GIF is selected from the Discover (iframe) tab — capture it in FWD library
  const handleSelect = useCallback((gif: FwdGifPayload) => {
    capture.mutate({
      gif_url: gif.url,
      gif_id: gif.gif_id ?? null,
      preview_url: gif.preview_url ?? null,
      title: gif.title ?? null,
      width: gif.width ?? null,
      height: gif.height ?? null,
    });
    onSelect(gif);
    onClose();
  }, [capture, onSelect, onClose]);

  const handleLibrarySelect = useCallback((item: FwdGifItem) => {
    const url = getAnimatedFwdGifUrl(item);
    if (!url) return;
    markUsed.mutate({ id: item.id });
    const payload: FwdGifPayload = {
      gif_id: item.gif_id ?? item.id,
      url,
      title: item.title ?? undefined,
      width: item.width ?? undefined,
      height: item.height ?? undefined,
      preview_url: getFwdPosterUrl(item),
      detail_url: buildFwdGifDetailUrl(item.gif_id ?? item.id),
    };
    onSelect(payload);
    onClose();
  }, [markUsed, onSelect, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="FWD GIF library"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative flex h-[82dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-background shadow-2xl sm:h-[760px] sm:rounded-[28px]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 shrink-0">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">FWD</div>
            <div className="truncate text-sm text-muted-foreground">Your GIF Library</div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={FWD_BASE_URL}
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground"
              aria-label="Open FWD in a new tab"
            >
              <ExternalLink className="size-4" />
            </a>
            <button
              onClick={onClose}
              className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground"
              aria-label="Close GIF picker"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-4 py-2 shrink-0 scrollbar-none">
          {visibleTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/[0.06] text-muted-foreground hover:bg-white/10 hover:text-foreground",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="shrink-0 border-b border-white/10 px-4 py-3">
          <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-3 text-sm focus-within:border-primary/50 focus-within:shadow-[0_0_18px_-8px_oklch(0.82_0.16_85_/_0.55)]">
            <Search className="size-4 shrink-0 text-primary" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your FWD GIFs"
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground" aria-label="Clear GIF search">
                <X className="size-3.5" />
              </button>
            )}
          </label>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-hidden">
          {tab === "discover" ? (
            <DiscoverTab
              context={context === "profile" ? "feed_reply" : context}
              onSelect={handleSelect}
              treyTvUid={treyTvUid}
              draft={draft}
            />
          ) : (
            <div className="h-full overflow-y-auto">
              <LibraryGrid tab={tab} query={debouncedSearch} onSelect={handleLibrarySelect} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DiscoverTab — inline iframe, no fixed overlay
// ─────────────────────────────────────────────────────────────────────────────

type DiscoverTabProps = {
  context: "message" | "comment" | "feed_reply";
  onSelect: (gif: FwdGifPayload) => void;
  treyTvUid?: string | null;
  draft?: string;
};

function DiscoverTab({ context, onSelect, treyTvUid, draft }: DiscoverTabProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pickerUrl = useMemo(
    () => buildFwdPickerUrl({ context, treyTvUid }),
    [context, treyTvUid],
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const gif = parseFwdPickerMessage(event);
      if (gif) onSelect(gif);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onSelect]);

  useEffect(() => {
    sendDraftUpdate(iframeRef.current?.contentWindow, draft ?? "");
  }, [draft]);

  return (
    <iframe
      ref={iframeRef}
      title="FWD Discover"
      src={pickerUrl}
      className="h-full w-full bg-black"
      referrerPolicy="strict-origin-when-cross-origin"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LibraryGrid
// ─────────────────────────────────────────────────────────────────────────────

type LibraryGridProps = {
  tab: FwdGifLibraryTab;
  query: string;
  onSelect: (item: FwdGifItem) => void;
};

const CONNECT_ERRORS = [
  "No FWD account linked",
  "No Trey TV UID on profile",
  "not connected",
  "Not signed in",
];

function isConnectError(error: string | undefined): boolean {
  if (!error) return false;
  return CONNECT_ERRORS.some((s) => error.includes(s));
}

function ConnectFwdCta() {
  const returnTo = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";
  const signupUrl = `https://fwd.treytv.com/signup?returnTo=${returnTo}`;
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="text-4xl select-none">🔗</div>
      <div>
        <p className="font-semibold text-foreground">Connect FWD</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect FWD to use GIFs in messages and comments.
        </p>
      </div>
      <a
        href={signupUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-80"
      >
        Open FWD
        <ExternalLink className="size-3" />
      </a>
    </div>
  );
}

function LibraryGrid({ tab, query, onSelect }: LibraryGridProps) {
  const { data, isLoading, isError, refetch, isFetching } = useFwdGifLibrary(tab, 48, 0, query);

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const errorMsg = !data?.ok ? (data as { ok: false; error: string } | undefined)?.error : undefined;

  if (isError || !data || !data.ok) {
    if (isConnectError(errorMsg)) {
      return <ConnectFwdCta />;
    }
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 px-6 text-center">
        <ImageOff className="size-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          {errorMsg ?? "Could not load your GIF library."}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary/40"
        >
          <RefreshCw className="size-3" /> Retry
        </button>
      </div>
    );
  }

  const rawGifs: FwdGifItem[] = (data as { ok: true; data: { gifs: FwdGifItem[] } }).data?.gifs ?? [];
  const q = query.toLowerCase();
  const gifs = q
    ? rawGifs.filter((gif) => [gif.title, gif.caption, gif.provider, gif.mood, ...(gif.tags ?? [])].some((value) => String(value ?? "").toLowerCase().includes(q)))
    : rawGifs;

  if (gifs.length === 0) {
    return <EmptyState tab={tab} query={query} />;
  }

  return (
    <div className="relative">
      {isFetching && (
        <div className="sticky top-0 z-10 flex items-center justify-center gap-2 border-b border-white/10 bg-background/80 py-2 text-xs text-muted-foreground backdrop-blur">
          <Loader2 className="size-3.5 animate-spin" /> Refreshing GIFs
        </div>
      )}
      <div className="grid grid-cols-3 gap-1 p-2 sm:grid-cols-4">
        {gifs.map((gif) => (
          <GifTile key={gif.id} gif={gif} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GifTile
// ─────────────────────────────────────────────────────────────────────────────

type GifTileProps = {
  gif: FwdGifItem;
  onSelect: (gif: FwdGifItem) => void;
};

function GifTile({ gif, onSelect }: GifTileProps) {
  const poster = getFwdPosterUrl(gif);
  const animated = getAnimatedFwdGifUrl(gif);
  const primary = animated || poster;

  return (
    <button
      onClick={() => onSelect(gif)}
      className="group relative aspect-square overflow-hidden rounded-xl bg-white/[0.04] transition-all hover:scale-[1.03] hover:ring-2 hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      title={gif.title ?? undefined}
    >
      {poster ? (
        <img
          src={poster}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-30 blur-sm"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      ) : null}
      {primary ? (
        <img
          src={primary}
          alt={gif.title ?? "GIF"}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageOff className="size-5 text-muted-foreground/30" />
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_STATE_COPY: Record<FwdGifLibraryTab, { heading: string; body: string; cta: string }> = {
  saved:    { heading: "No saved GIFs yet",    body: "Tap the bookmark on any GIF in the Discover tab or on FWD to save it here.", cta: "Open FWD GIF Maker" },
  recent:   { heading: "No recently used GIFs", body: "GIFs you send in messages and comments will show up here.", cta: "Open FWD" },
  created:  { heading: "No created GIFs yet",   body: "Make your own GIFs in FWD and they will live here.", cta: "Open FWD GIF Maker" },
  unsaved:  { heading: "Nothing here",           body: "GIFs you have used but not saved appear here.", cta: "Open FWD" },
  favorite: { heading: "No favorites yet",       body: "Mark GIFs as favorites on FWD and they will sync here.", cta: "Open FWD" },
};

function EmptyState({ tab, query }: { tab: FwdGifLibraryTab; query?: string }) {
  const copy = EMPTY_STATE_COPY[tab];
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="text-4xl select-none">🎞️</div>
      <div>
        <p className="font-semibold text-foreground">{query ? "No matching GIFs" : copy.heading}</p>
        <p className="mt-1 text-sm text-muted-foreground">{query ? "Try a different FWD search, or open FWD to make something new." : copy.body}</p>
      </div>
      <a
        href={FWD_BASE_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-80"
      >
        {copy.cta}
        <ExternalLink className="size-3" />
      </a>
    </div>
  );
}
