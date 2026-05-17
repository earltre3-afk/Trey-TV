// Interactive Stories section — appears on the /games page between Featured and Choose Game sections.
// This is purely an additive UI card; no game logic is loaded here.

import { BookOpen, Sparkles, Play, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function InteractiveStoriesSection() {
  const navigate = useNavigate();

  return (
    <section className="relative px-4 sm:px-6 lg:px-2 py-10 lg:py-14 max-w-7xl mx-auto overflow-hidden">

      {/* ── Ambient atmosphere ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[40px]">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] rounded-full blur-3xl opacity-[0.06]"
          style={{ background: "radial-gradient(ellipse, #A855F7 0%, #7C3AED 30%, transparent 70%)" }}
        />
        <div
          className="absolute -right-24 top-1/3 w-80 h-80 rounded-full blur-3xl opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #FFC857, transparent 70%)" }}
        />
      </div>

      {/* ── Section header ── */}
      <div className="relative mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            {/* Eyebrow badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
              style={{
                background: "rgba(168,85,247,0.08)",
                border: "1px solid rgba(168,85,247,0.3)",
              }}
            >
              <BookOpen className="size-3.5" style={{ color: "#A855F7" }} />
              <span className="text-[10px] font-black tracking-[0.22em]" style={{ color: "#A855F7" }}>
                STORY MODE · CHOICES · ENDINGS
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#F8FAFC]">
              Interactive{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #A855F7, #FFC857)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Stories
              </span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#94A3B8] max-w-lg leading-relaxed">
              Play cinematic stories where every choice changes the outcome.
            </p>
          </div>

          {/* View All link — desktop */}
          <button
            onClick={() => navigate({ to: "/games/interactive-stories" })}
            className="hidden sm:flex items-center gap-2 shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
            style={{
              background: "rgba(168,85,247,0.08)",
              border: "1px solid rgba(168,85,247,0.25)",
              color: "#C084FC",
            }}
          >
            <span>View All Stories</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── Featured Story Card: Switch Kicks ── */}
      <div className="relative">
        <button
          onClick={() => navigate({ to: "/games/interactive-stories/$storySlug", params: { storySlug: "switch-kicks" } })}
          className="group relative block w-full overflow-hidden rounded-[28px] text-left transition-transform duration-300 ease-out hover:-translate-y-1 active:scale-[0.99]"
          style={{
            background: "linear-gradient(160deg, #0A1628 0%, #0D0B1F 60%, #060D18 100%)",
            border: "1px solid rgba(168,85,247,0.25)",
            boxShadow: "0 0 0 1px rgba(168,85,247,0.08), 0 16px 48px -12px rgba(168,85,247,0.3)",
          }}
        >
          {/* Hover rim glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ boxShadow: "inset 0 0 40px rgba(168,85,247,0.12), 0 0 0 1px rgba(168,85,247,0.4)" }}
          />

          {/* Top accent line */}
          <div
            aria-hidden
            className="absolute top-0 left-6 right-6 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)" }}
          />

          <div className="flex flex-col sm:flex-row gap-0">
            {/* Cover image area */}
            <div className="relative w-full sm:w-[280px] lg:w-[320px] shrink-0 overflow-hidden">
              <div className="aspect-[4/3] sm:aspect-auto sm:h-full">
                <img
                  src="/interactive-stories/scenes/twins_cover.png"
                  alt="Switch Kicks — Twin brothers"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: "center 25%" }}
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0D0B1F] hidden sm:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B1F] to-transparent sm:hidden" />

              {/* Featured badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black tracking-[0.2em] shadow-lg"
                style={{
                  background: "rgba(168,85,247,0.85)",
                  boxShadow: "0 0 20px rgba(168,85,247,0.5)",
                }}
              >
                <Sparkles className="size-3" />
                FEATURED STORY · COMEDY-DRAMA
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F8FAFC]">
                Switch Kicks
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#94A3B8] max-w-md">
                Twin brothers. One school day. One switch that turns football, ballet, romance,
                and consequences into a full-blown mess.
              </p>

              {/* Feature chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                {["Choice-Based", "Voice Cast", "Saved Playthroughs", "Shareable Endings"].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide"
                    style={{
                      background: "rgba(168,85,247,0.1)",
                      border: "1px solid rgba(168,85,247,0.25)",
                      color: "#C084FC",
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate({ to: "/games/interactive-stories/$storySlug/play", params: { storySlug: "switch-kicks" } });
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-transform group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #A855F7, #7C3AED)",
                    color: "#fff",
                    boxShadow: "0 8px 24px -4px rgba(168,85,247,0.4)",
                  }}
                >
                  <Play className="size-4 fill-current" />
                  Play Switch Kicks
                </span>
                <span
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate({ to: "/games/interactive-stories/$storySlug/playthroughs", params: { storySlug: "switch-kicks" } });
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  My Playthroughs
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* ── Secondary Story Card: The God Ram ── */}
      <div className="relative mt-4">
        <button
          onClick={() => navigate({ to: "/games/interactive-stories/$storySlug", params: { storySlug: "the-god-ram" } })}
          className="group relative w-full overflow-hidden rounded-[28px] text-left transition-transform duration-300 ease-out hover:-translate-y-1"
          style={{
            background: "linear-gradient(135deg, #0A1220 0%, #080E18 100%)",
            border: "1px solid rgba(255,200,87,0.15)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
            {/* Decorative icon */}
            <div
              className="shrink-0 size-[60px] rounded-2xl grid place-items-center text-[28px] leading-none select-none"
              style={{
                background: "radial-gradient(circle at 35% 30%, rgba(255,200,87,0.2), rgba(255,200,87,0.04) 70%)",
                border: "1px solid rgba(255,200,87,0.3)",
                boxShadow: "0 0 24px rgba(255,200,87,0.2)",
                color: "#FFC857",
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              𓁢
            </div>

            <div className="flex-1 min-w-0">
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-[0.2em] mb-1"
                style={{
                  background: "rgba(255,200,87,0.08)",
                  border: "1px solid rgba(255,200,87,0.25)",
                  color: "#FFC857",
                }}
              >
                URBAN FANTASY · MYTHOLOGY
              </div>
              <h3 className="text-lg font-black tracking-tight text-[#F8FAFC]">The God Ram</h3>
              <p className="mt-1 text-xs text-[#94A3B8] leading-relaxed max-w-lg">
                A Memphis boy wakes the sleeping gods and becomes the door between forgotten power
                and a throne built on erasure.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Mythic Choices", "Voice Cast", "Divine Stats", "Multiple Endings"].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide"
                    style={{
                      background: "rgba(255,200,87,0.06)",
                      border: "1px solid rgba(255,200,87,0.18)",
                      color: "rgba(255,200,87,0.7)",
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 sm:flex-col sm:gap-2">
              <span
                onClick={(event) => {
                  event.stopPropagation();
                  navigate({ to: "/games/interactive-stories/$storySlug/play", params: { storySlug: "the-god-ram" } });
                }}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold"
                style={{
                  background: "rgba(255,200,87,0.1)",
                  border: "1px solid rgba(255,200,87,0.25)",
                  color: "#FFC857",
                }}
              >
                <Play className="size-3 fill-current" />
                Play
              </span>
              <span
                onClick={(event) => {
                  event.stopPropagation();
                  navigate({ to: "/games/interactive-stories/$storySlug", params: { storySlug: "the-god-ram" } });
                }}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                Story Details
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Mobile view-all link */}
      <div className="sm:hidden mt-5 flex items-center justify-center">
        <button
          onClick={() => navigate({ to: "/games/interactive-stories" })}
          className="flex items-center gap-2 text-[11px] font-bold"
          style={{ color: "#C084FC" }}
        >
          <span>View All Interactive Stories</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </section>
  );
}
