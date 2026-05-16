import { useEffect, useMemo } from "react";
import { ExternalLink, X } from "lucide-react";
import { buildFwdPickerUrl, parseFwdPickerMessage, type FwdGifPayload, type FwdPickerContext } from "@/lib/fwd/picker";

type FwdPickerSheetProps = {
  context: FwdPickerContext;
  onClose: () => void;
  onSelect: (gif: FwdGifPayload) => void;
  open: boolean;
  treyTvUid?: string | null;
};

export function FwdPickerSheet({ context, onClose, onSelect, open, treyTvUid }: FwdPickerSheetProps) {
  const pickerUrl = useMemo(() => buildFwdPickerUrl({ context, treyTvUid }), [context, treyTvUid]);

  useEffect(() => {
    if (!open) return;

    const onMessage = (event: MessageEvent) => {
      const gif = parseFwdPickerMessage(event);
      if (!gif) return;
      onSelect(gif);
      onClose();
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onClose, onSelect, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center" role="dialog" aria-modal="true" aria-label="FWD GIF picker">
      <div className="relative flex h-[82dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-background shadow-2xl sm:h-[760px] sm:rounded-[28px]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">FWD</div>
            <div className="truncate text-sm text-muted-foreground">GIFs & reactions · Powered by FWD</div>
          </div>
          <div className="flex items-center gap-2">
            <a href={pickerUrl} target="_blank" rel="noreferrer" className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground" aria-label="Open FWD in a new tab">
              <ExternalLink className="size-4" />
            </a>
            <button onClick={onClose} className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground" aria-label="Close FWD picker">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <iframe
          title="FWD GIF picker"
          src={pickerUrl}
          className="min-h-0 flex-1 bg-black"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
