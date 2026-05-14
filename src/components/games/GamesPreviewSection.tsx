import { Dices, Sparkles } from "lucide-react";
import { GamePreviewCard } from "./GamePreviewCard";

const GAMES = [
  {
    name: "Spades",
    description: "Team up, read your partner, and bid your tricks. The definitive card game — upgraded for the Trey TV lounge.",
    suitSymbol: "♠",
    suitLabel: "Enter Spades",
    accentHex: "#00B7FF",
  },
  {
    name: "Blackjack",
    description: "Hit or stand. Beat the dealer to 21 in a sleek, after-midnight casino experience built for real players.",
    suitSymbol: "A♦",
    suitLabel: "Hit the Table",
    accentHex: "#FFC857",
  },
  {
    name: "Bullshit",
    description: "Bluff your way through the entire deck. Call it when you see it — everyone's got something to hide.",
    suitSymbol: "🃏",
    suitLabel: "Call It",
    accentHex: "#C084FC",
  },
] as const;

export function GamesPreviewSection() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-2 py-10 lg:py-14 max-w-7xl mx-auto overflow-hidden">

      {/* ── Lounge atmosphere background ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[40px]">
        {/* Felt table glow — electric blue center lamp */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[70%] rounded-full blur-3xl opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse, #00B7FF 0%, #0033FF 40%, transparent 70%)" }}
        />
        {/* Gold ambient right */}
        <div
          className="absolute -right-20 top-1/4 w-72 h-72 rounded-full blur-3xl opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #FFC857, transparent 70%)" }}
        />
        {/* Purple ambient left */}
        <div
          className="absolute -left-16 bottom-1/4 w-56 h-56 rounded-full blur-3xl opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #A855F7, transparent 70%)" }}
        />

        {/* Floating decorative cards — desktop only */}
        {[
          { sym: "♠", top: "8%", left: "3%", rot: "-18deg", op: 0.06, col: "#00B7FF", sz: 48 },
          { sym: "♦", top: "14%", right: "4%", rot: "14deg", op: 0.07, col: "#FFC857", sz: 40 },
          { sym: "♣", bottom: "12%", left: "5%", rot: "22deg", op: 0.05, col: "#C084FC", sz: 36 },
          { sym: "♥", bottom: "8%", right: "3%", rot: "-11deg", op: 0.06, col: "#F472B6", sz: 44 },
          { sym: "A", top: "42%", left: "1%", rot: "8deg", op: 0.04, col: "#00B7FF", sz: 28 },
          { sym: "K", top: "38%", right: "1.5%", rot: "-9deg", op: 0.04, col: "#FFC857", sz: 28 },
        ].map((c, i) => (
          <div
            key={i}
            className="absolute hidden sm:block select-none font-black"
            style={{
              top: (c as any).top,
              left: (c as any).left,
              right: (c as any).right,
              bottom: (c as any).bottom,
              fontSize: c.sz,
              color: c.col,
              opacity: c.op,
              transform: `rotate(${c.rot})`,
              fontFamily: "Georgia, 'Times New Roman', serif",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            {c.sym}
          </div>
        ))}
      </div>

      {/* ── Section header ── */}
      <div className="relative mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
              style={{
                background: "rgba(0,183,255,0.08)",
                border: "1px solid rgba(0,183,255,0.3)",
              }}
            >
              <Dices className="size-3.5" style={{ color: "#00B7FF" }} />
              <span className="text-[10px] font-black tracking-[0.22em]" style={{ color: "#00B7FF" }}>
                GAMING LOUNGE
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#F8FAFC]">
              Trey TV <span style={{
                background: "linear-gradient(90deg, #00B7FF, #FFC857)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Games</span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#94A3B8] max-w-lg leading-relaxed">
              Play classics with a Trey TV twist. Spades, Blackjack, Bullshit, and more are entering the lounge.
            </p>
          </div>

          {/* Desktop status note */}
          <div className="hidden sm:flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(255,200,87,0.06)", border: "1px solid rgba(255,200,87,0.18)" }}
          >
            <Sparkles className="size-3" style={{ color: "#FFC857" }} />
            <span className="text-[11px] font-semibold text-[#FFC857]/70">
              Full game module installing soon.
            </span>
          </div>
        </div>
      </div>

      {/* ── Game cards grid ── */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map((g) => (
          <GamePreviewCard key={g.name} {...g} />
        ))}
      </div>

      {/* ── "More Games" placeholder card ── */}
      <div className="relative mt-4">
        <div
          className="rounded-[28px] p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{
            background: "linear-gradient(135deg, #0A1220 0%, #080E18 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Decorative suit row */}
          <div className="flex items-center gap-3 shrink-0">
            {["♠", "♥", "♦", "♣", "🎴"].map((s, i) => (
              <span
                key={i}
                className="text-xl select-none opacity-30"
                style={{
                  fontFamily: "Georgia, serif",
                  color: ["#00B7FF", "#F472B6", "#FFC857", "#4ADE80", "#C084FC"][i],
                  filter: "blur(0.3px)",
                }}
              >
                {s}
              </span>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[#F8FAFC]">More Games Coming to the Lounge</h4>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Poker, Bid Whist, Tonk, and exclusive Trey TV originals are in development.
            </p>
          </div>
          <div
            className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold cursor-not-allowed select-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            Stay Tuned
          </div>
        </div>
      </div>

      {/* Mobile status note */}
      <div className="sm:hidden mt-5 flex items-center justify-center gap-2">
        <Sparkles className="size-3 shrink-0" style={{ color: "#FFC857" }} />
        <span className="text-[11px] text-[#FFC857]/60 font-semibold text-center">
          Full game module installing soon.
        </span>
      </div>
    </section>
  );
}
