import { ImagePlus, X } from "lucide-react";
import { useRef } from "react";

export function UploadPreviewCard({
  label,
  hint,
  shape = "square",
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  shape?: "square" | "banner";
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = () => inputRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => onChange(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(f);
  };

  const aspect = shape === "banner" ? "aspect-[3/1]" : "aspect-square";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[10px] inline-flex items-center gap-1 text-muted-foreground hover:text-destructive"
          >
            <X className="size-3" /> Remove
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={pick}
        className={`${aspect} w-full rounded-2xl liquid-glass neon-border overflow-hidden grid place-items-center relative tilt-press`}
      >
        {value ? (
          <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="text-center px-4">
            <div className="mx-auto size-10 rounded-full bg-primary/15 grid place-items-center">
              <ImagePlus className="size-5 text-primary" />
            </div>
            <div className="mt-2 text-sm font-medium">Tap to upload</div>
            {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
          </div>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
}
