import { Sparkles, Heart, Zap } from "lucide-react";

interface ReadingOfTheDayProps {
  sign: string;
  symbol: string;
  dailyReading: string;
  energyWord: string;
  luckyColor: string;
  luckyNumber: string | number;
  recommendedAction: string;
  isCusp?: boolean;
  cuspNote?: string;
}

export function ReadingOfTheDay({
  sign,
  symbol,
  dailyReading,
  energyWord,
  luckyColor,
  luckyNumber,
  recommendedAction,
  isCusp = false,
  cuspNote,
}: ReadingOfTheDayProps) {
  const colorSwatch: Record<string, string> = {
    "Blue flame": "#48c8ff",
    "Molten gold": "#ffc857",
    "Deep violet": "#8b5cf6",
    "Chrome silver": "#c7d2fe",
    "Midnight teal": "#14b8a6",
  };
  const swatchColor = /^#|rgb|hsl|oklch/.test(luckyColor)
    ? luckyColor
    : (colorSwatch[luckyColor] ?? "#ffc857");

  return (
    <div className="reading-of-the-day">
      <div className="glass-strong rounded-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="relative overflow-hidden p-6 space-y-4 border-b border-[oklch(1_0_0_/_0.08)]">
          {/* Ambient glow */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full"
            style={{
              background: "radial-gradient(circle, oklch(0.82 0.16 85 / 0.2), transparent 70%)",
              filter: "blur(80px)",
            }}
          />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Zodiac Symbol */}
              <div className="w-16 h-16 rounded-xl glass flex items-center justify-center flex-shrink-0 text-3xl">
                {symbol}
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  Reading of the Day
                </p>
                <h2 className="text-xl font-bold">{sign}</h2>
                {isCusp && (
                  <span className="inline-block text-xs px-2 py-1 rounded-full bg-gradient-to-r from-[#ffc857] to-[#a855f7] text-black font-bold">
                    Cusp Soul
                  </span>
                )}
              </div>
            </div>

            {/* Sparkle badge */}
            <div className="w-10 h-10 rounded-full glass flex items-center justify-center flex-shrink-0">
              <Sparkles className="size-5 text-[#ffc857]" />
            </div>
          </div>
        </div>

        {/* Daily Reading */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
              Your Cosmic Message
            </p>
            <p className="text-lg leading-relaxed">{dailyReading}</p>
          </div>

          {/* Energy Attributes Grid */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {/* Energy Word */}
            <div className="glass rounded-xl p-4 space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                Energy
              </p>
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-[#ffc857]" />
                <span className="font-bold">{energyWord}</span>
              </div>
            </div>

            {/* Lucky Number */}
            <div className="glass rounded-xl p-4 space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                Lucky Number
              </p>
              <span className="text-2xl font-bold">{luckyNumber}</span>
            </div>
          </div>

          {/* Lucky Color */}
          <div className="glass rounded-xl p-4 space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              Lucky Color
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full border border-[oklch(1_0_0_/_0.2)] ring-2 ring-offset-2 ring-offset-[oklch(0.17_0.025_270)]"
                style={{ backgroundColor: swatchColor }}
              />
              <span className="font-medium capitalize">{luckyColor}</span>
            </div>
          </div>

          {/* Recommended Action */}
          <div className="glass rounded-xl p-4 space-y-2 border-l-2 border-[#06b6d4]">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              Today's Action
            </p>
            <p className="text-sm leading-relaxed">{recommendedAction}</p>
          </div>

          {/* Cusp Special Note */}
          {isCusp && cuspNote && (
            <div className="glass-strong rounded-xl p-4 space-y-2 bg-gradient-to-br from-[#ffc857]/5 via-[#a855f7]/5 to-[#06b6d4]/5 border-l-2 border-[#a855f7]">
              <div className="flex items-start gap-2">
                <Heart className="size-4 text-[#a855f7] flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                    Cusp Soul Insight
                  </p>
                  <p className="text-sm leading-relaxed">{cuspNote}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t border-[oklch(1_0_0_/_0.08)] flex gap-3">
          <button className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#ffc857] to-[#a855f7] text-black font-semibold hover:shadow-[0_0_24px_oklch(0.82_0.16_85_/_0.4)] transition-all text-sm">
            Full Reading
          </button>
          <button className="flex-1 px-4 py-2.5 rounded-lg glass hover:bg-[oklch(1_0_0_/_0.08)] transition-colors font-medium text-sm">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
