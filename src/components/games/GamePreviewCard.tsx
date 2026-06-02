export interface GamePreviewCardProps {
  name: string;
  description: string;
  suitSymbol: string;
  suitLabel: string;
  accentHex: string;
  dimmed?: boolean;
}

export function GamePreviewCard({
  name,
  description,
  suitSymbol,
  suitLabel,
  accentHex,
  dimmed = false,
}: GamePreviewCardProps) {
  return (
    <div
      className="relative group flex flex-col rounded-[28px] overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-1"
      style={{
        background: "linear-gradient(160deg, #0A1628 0%, #08111F 60%, #060D18 100%)",
        border: `1px solid ${accentHex}28`,
        boxShadow: `0 0 0 1px ${accentHex}10, 0 12px 40px -12px ${accentHex}35`,
        opacity: dimmed ? 0.72 : 1,
      }}
    >
      {/* Hover rim glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ boxShadow: `inset 0 0 40px ${accentHex}18, 0 0 0 1px ${accentHex}45` }}
      />

      {/* Top accent line */}
      <div
        aria-hidden
        className="absolute top-0 left-6 right-6 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentHex}70, transparent)` }}
      />

      {/* Icon + badge row */}
      <div className="flex items-start gap-4 p-6 pb-3">
        <div
          className="relative shrink-0 size-[60px] rounded-2xl grid place-items-center text-[32px] leading-none select-none"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${accentHex}28, ${accentHex}06 70%)`,
            border: `1px solid ${accentHex}35`,
            boxShadow: `0 0 24px ${accentHex}28, inset 0 1px 0 ${accentHex}30`,
            color: accentHex,
            fontFamily: "Georgia, 'Times New Roman', serif",
            textShadow: `0 0 16px ${accentHex}90`,
          }}
        >
          {suitSymbol}
          {/* Inner sheen */}
          <div
            aria-hidden
            className="absolute top-1 left-2 right-6 h-px rounded-full opacity-60"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentHex}80, transparent)`,
            }}
          />
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-[0.2em] mb-2"
            style={{
              background: `${accentHex}12`,
              border: `1px solid ${accentHex}35`,
              color: accentHex,
            }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ background: accentHex, boxShadow: `0 0 6px ${accentHex}` }}
            />
            COMING SOON
          </div>
          <h3 className="text-lg font-black tracking-tight text-[#F8FAFC]">{name}</h3>
        </div>
      </div>

      {/* Description */}
      <p className="flex-1 px-6 pb-5 text-sm leading-relaxed text-[#94A3B8]">{description}</p>

      {/* CTA button */}
      <div className="px-6 pb-6">
        <button
          disabled
          aria-label={`${name} — coming soon`}
          className="w-full py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200 cursor-not-allowed select-none"
          style={{
            background: `${accentHex}0C`,
            border: `1px solid ${accentHex}22`,
            color: `${accentHex}55`,
          }}
        >
          {suitLabel} Lounge
        </button>
      </div>

      {/* Corner card pip — decorative */}
      <div
        aria-hidden
        className="absolute top-3 right-5 text-[11px] font-black opacity-15 select-none"
        style={{ color: accentHex, fontFamily: "Georgia, serif" }}
      >
        {suitSymbol}
      </div>
      <div
        aria-hidden
        className="absolute bottom-3 left-5 text-[11px] font-black opacity-15 select-none rotate-180"
        style={{ color: accentHex, fontFamily: "Georgia, serif" }}
      >
        {suitSymbol}
      </div>
    </div>
  );
}
