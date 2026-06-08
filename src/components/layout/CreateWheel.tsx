import { Plus } from "lucide-react";
import { usePostSheet } from "@/lib/post-sheet-context";
import { haptic } from "@/lib/haptics";

export function CreateWheel() {
  const { openPostSheet } = usePostSheet();

  return (
    <button
      onClick={() => {
        haptic("selection");
        openPostSheet();
      }}
      onPointerDown={() => haptic("selection")}
      className="relative size-16 rounded-full grid place-items-center bg-background border-2 border-primary text-primary glow-gold animate-glow-pulse select-none active:scale-[0.96] transition-transform duration-150 touch-manipulation"
      style={{
        marginTop: "-1.75rem",
        zIndex: 10001,
        WebkitTapHighlightColor: "transparent",
      }}
      aria-label="Create"
    >
      <Plus className="size-7" />
    </button>
  );
}
