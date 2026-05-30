import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { z as ChevronLeft, aG as Save, r as ChevronRight, l as ShieldCheck, be as MapPin } from "../_libs/lucide-react.mjs";
function ApplicationWizardChrome({
  variant,
  titleA,
  titleB,
  steps,
  current,
  onSaveDraft,
  draftSaved,
  sectionTitle,
  sectionSubtitle,
  children,
  side
}) {
  const isGold = variant === "gold";
  const outer = isGold ? "neon-gold" : "neon-blue";
  const accentText = isGold ? "text-[oklch(0.92_0.18_88)]" : "text-[oklch(0.85_0.2_240)]";
  const titleSplit = isGold ? "title-split-gold" : "title-split-blue";
  const stepActive = isGold ? "is-active-gold" : "is-active-blue";
  const pct = Math.round((current - 1) / (steps.length - 1) * 100);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `apply-scroll-page liquid-stage min-h-screen min-h-[100dvh] ${isGold ? "gold" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-veil", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "orb-extra", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "sticky top-0 z-30 border-b border-white/[0.06] backdrop-blur-xl pt-[env(safe-area-inset-top)]",
        style: { background: "oklch(0.08 0.02 262 / 0.85)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:px-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/apply", className: `neon-btn-ghost ${isGold ? "gold" : ""} text-xs md:text-sm`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
              " Back"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden items-center gap-3 md:flex", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-7" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-foreground/80", children: [
                titleA,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: titleSplit, children: titleB })
              ] })
            ] }),
            onSaveDraft && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onSaveDraft, className: `neon-btn-ghost ${isGold ? "gold" : ""} text-xs md:text-sm`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: draftSaved ? "Saved ✓" : "Save Draft" })
            ] }),
            !onSaveDraft && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[2px] w-full bg-white/[0.05]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `h-full transition-all duration-500 ease-out ${isGold ? "bg-[oklch(0.88_0.2_88)]" : "bg-[oklch(0.75_0.25_245)]"}`,
              style: {
                width: `${pct}%`,
                boxShadow: isGold ? "0 0 12px oklch(0.88 0.2 88 / 0.8)" : "0 0 12px oklch(0.75 0.25 245 / 0.8)"
              }
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-7xl px-3 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6 md:px-6 md:pb-10 md:pt-8 lg:pt-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative ${outer} p-4 md:p-8 wizard-outer-pad`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "swoosh-bg" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "liquid-sheen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex flex-col items-center text-center md:mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "logo-float h-10 md:h-14 lg:h-16" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-3 text-xl font-semibold tracking-tight sm:text-2xl md:mt-4 md:text-3xl lg:text-4xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
              titleA,
              " "
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: titleSplit, children: titleB })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "no-scrollbar mx-auto mb-6 max-w-4xl overflow-x-auto md:mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "flex min-w-fit items-center justify-center gap-1 px-2 sm:gap-1.5 md:gap-2", children: steps.map((s, i) => {
          const n = i + 1;
          const state = n === current ? stepActive : n < current ? "is-done" : "";
          const isActive = n === current;
          const isDone = n < current;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex min-w-fit items-center gap-1 sm:gap-1.5 md:gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `step-circle ${state}`, children: isDone ? "✓" : n }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `whitespace-nowrap text-[9px] font-medium sm:text-[10px] md:text-xs ${isActive ? accentText : isDone ? "text-foreground/60" : "text-muted-foreground"}`, children: s.label })
            ] }),
            n < steps.length && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "step-line -mt-5 w-3 sm:w-6 md:w-10 lg:w-16" })
          ] }, s.label);
        }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `grid min-w-0 gap-5 ${side ? "lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `relative min-w-0 ${outer} p-4 md:p-7 wizard-section-pad`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "liquid-sheen" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-enter relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 border-b border-white/[0.08] pb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold md:text-xl lg:text-2xl", children: sectionTitle }),
                sectionSubtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: sectionSubtitle })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-5", children })
            ] }, current)
          ] }),
          side && /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "order-last min-w-0 space-y-5 lg:order-none lg:self-start lg:sticky lg:top-[72px]", children: side })
        ] })
      ] })
    ] }) })
  ] });
}
function WizardNav({
  variant,
  onBack,
  onNext,
  nextLabel = "Next Step",
  backDisabled,
  submitting
}) {
  const isGold = variant === "gold";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wizard-cta-bar mx-auto mt-5 grid max-w-7xl grid-cols-[auto_1fr] items-center gap-2 px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] md:gap-3 md:px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: onBack,
        disabled: backDisabled,
        className: `neon-btn-ghost ${isGold ? "gold" : ""} px-5 py-3 disabled:opacity-40`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Back" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: onNext,
        disabled: submitting,
        className: `${isGold ? "neon-btn-gold" : "neon-btn-blue"} w-full text-base disabled:opacity-60`,
        children: [
          submitting ? "Submitting…" : nextLabel,
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" })
        ]
      }
    )
  ] });
}
function Field({
  label,
  required,
  children,
  hint
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-foreground/95", children: [
      label,
      " ",
      required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[oklch(0.85_0.2_240)]", children: "*" })
    ] }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 block text-xs text-muted-foreground", children: hint }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children })
  ] });
}
function NeonInput(props) {
  const { trailingIcon, className = "", ...rest } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ...rest, className: `neon-input w-full px-4 py-3 pr-11 text-base ${className}` }),
    trailingIcon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.7_0.18_245)]", children: trailingIcon })
  ] });
}
function NeonTextarea(props) {
  const { trailingIcon, className = "", ...rest } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { ...rest, className: `neon-input w-full px-4 py-3 pr-11 text-base leading-relaxed ${className}` }),
    trailingIcon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pointer-events-none absolute right-3 top-4 text-[oklch(0.7_0.18_245)]", children: trailingIcon })
  ] });
}
function NeonSelect(props) {
  const { className = "", children, ...rest } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "select",
    {
      ...rest,
      className: `neon-input w-full appearance-none bg-no-repeat px-4 py-3 text-base ${className}`,
      style: {
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2384b8ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
        backgroundPosition: "right 1rem center",
        backgroundSize: "1rem"
      },
      children
    }
  );
}
function TileChoice({
  value,
  options,
  onChange,
  variant = "creator"
}) {
  const activeClass = variant === "gold" ? "active-gold" : "active-blue";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2.5 sm:grid-cols-4", children: options.map((o) => {
    const active = value === o.value;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => onChange(o.value),
        className: `tile relative ${active ? activeClass : ""}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[oklch(0.85_0.2_240)]", children: o.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: o.label }),
          active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[oklch(0.7_0.22_245)] text-[11px] font-bold text-[oklch(0.05_0.02_265)] shadow-[0_0_12px_oklch(0.7_0.3_245/0.7)]", children: "✓" })
        ]
      },
      o.value
    );
  }) });
}
function ChipPicker({
  value,
  options,
  onChange,
  variant = "creator",
  multi = false
}) {
  const isActive = (v) => multi ? value.includes(v) : value === v;
  const toggle = (v) => {
    if (multi) {
      const arr = value;
      onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    } else {
      onChange(v);
    }
  };
  const activeClass = variant === "gold" ? "bg-[oklch(0.13_0.05_80/0.85)] text-[oklch(0.95_0.05_90)] shadow-[inset_0_0_0_1px_oklch(0.95_0.2_88),0_0_18px_oklch(0.85_0.2_85/0.4)]" : "bg-[oklch(0.13_0.07_252/0.85)] text-[oklch(0.95_0.02_250)] shadow-[inset_0_0_0_1px_oklch(0.85_0.2_240),0_0_18px_oklch(0.65_0.3_245/0.45)]";
  const baseClass = "bg-[oklch(0.09_0.03_262/0.6)] text-muted-foreground shadow-[inset_0_0_0_1px_oklch(1_0_0/0.08),0_0_0_1px_oklch(0.5_0.05_260/0.15)]";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick: () => toggle(o.value),
      className: `rounded-full px-3.5 py-2 text-xs transition-all sm:text-sm ${isActive(o.value) ? activeClass : baseClass}`,
      children: o.label
    },
    o.value
  )) });
}
function NeonCheckList({
  items,
  value,
  onToggle,
  variant = "creator"
}) {
  const isGold = variant === "gold";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5", children: items.map((labelText, i) => {
    const active = value[i];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "label",
      {
        className: `flex cursor-pointer items-start gap-3 rounded-2xl p-4 transition ${active ? isGold ? "bg-[oklch(0.13_0.05_80/0.6)] shadow-[inset_0_0_0_1px_oklch(0.95_0.2_88/0.8),0_0_18px_oklch(0.85_0.2_85/0.35)]" : "bg-[oklch(0.13_0.07_252/0.6)] shadow-[inset_0_0_0_1px_oklch(0.85_0.2_240/0.8),0_0_18px_oklch(0.65_0.3_245/0.4)]" : "bg-[oklch(0.09_0.03_262/0.55)] shadow-[inset_0_0_0_1px_oklch(1_0_0/0.08)]"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: active, onChange: () => onToggle(i), className: "sr-only" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-md text-[12px] font-bold ${active ? isGold ? "bg-[oklch(0.85_0.2_85)] text-[oklch(0.18_0.04_70)] shadow-[0_0_12px_oklch(0.85_0.2_85/0.7)]" : "bg-[oklch(0.7_0.22_245)] text-[oklch(0.05_0.02_265)] shadow-[0_0_12px_oklch(0.7_0.3_245/0.7)]" : "bg-transparent shadow-[inset_0_0_0_1.5px_oklch(0.5_0.05_260/0.6)]"}`,
              children: active ? "✓" : ""
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground/95", children: labelText })
        ]
      },
      labelText
    );
  }) });
}
function CreatorPassport({
  variant,
  displayName,
  handle,
  location,
  uid,
  step,
  totalSteps,
  avatarUrl
}) {
  const isGold = variant === "gold";
  const accent = isGold ? "text-[oklch(0.92_0.18_88)]" : "text-[oklch(0.82_0.2_235)]";
  const accentRing = isGold ? "shadow-[inset_0_0_0_1px_oklch(0.92_0.18_88/0.6),0_0_24px_oklch(0.85_0.2_85/0.35)]" : "shadow-[inset_0_0_0_1px_oklch(0.82_0.2_235/0.6),0_0_24px_oklch(0.65_0.3_245/0.35)]";
  const progress = Math.round(step / totalSteps * 100);
  const monogram = (displayName || handle || "T").trim().charAt(0).toUpperCase();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative ${isGold ? "neon-gold" : "neon-blue"} p-5 md:p-6`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "liquid-sheen" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 text-sm font-semibold ${accent}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isGold ? "Verification Pass" : "Creator Passport" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mx-auto mt-4 h-44 w-full max-w-[220px] overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_50%_30%,oklch(0.2_0.08_260),oklch(0.08_0.02_260))] ${accentRing}`, children: avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatarUrl, alt: displayName || "Applicant", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-display text-7xl tracking-tight ${isGold ? "title-split-gold" : "title-split-blue"}`, children: monogram }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold tracking-tight", children: displayName || "Your Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm ${accent}`, children: handle ? handle.startsWith("@") ? handle : `@${handle}` : "@handle" }),
        location && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
          " ",
          location
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-[0.22em] text-muted-foreground", children: isGold ? "Request UID" : "Creator UID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-1 font-mono text-base ${accent}`, children: uid || "-" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { value: progress, variant, label: `${progress}%`, sublabel: `Step ${step} of ${totalSteps}` }) })
    ] })
  ] });
}
function CircularProgress({
  value,
  size = 130,
  variant = "creator",
  label,
  sublabel
}) {
  const stroke = 6;
  const r = (size - stroke) / 2 - 6;
  const c = 2 * Math.PI * r;
  const offset = c - Math.max(0, Math.min(100, value)) / 100 * c;
  const ringColor = variant === "gold" ? "oklch(0.92 0.18 88)" : "oklch(0.82 0.2 235)";
  const trackColor = "oklch(1 0 0 / 0.07)";
  const innerStroke = variant === "gold" ? "oklch(0.92 0.18 88 / 0.45)" : "oklch(0.82 0.2 235 / 0.45)";
  const accent = variant === "gold" ? "text-[oklch(0.92_0.18_88)]" : "text-[oklch(0.82_0.2_235)]";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-flex items-center justify-center", style: { width: size, height: size }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: size, height: size, className: "-rotate-90", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `ring-${variant}`, x1: "0", y1: "0", x2: "1", y2: "1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: ringColor, stopOpacity: "0.3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: ringColor, stopOpacity: "1" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("filter", { id: `glow-${variant}`, x: "-50%", y: "-50%", width: "200%", height: "200%", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("feGaussianBlur", { stdDeviation: "3", result: "b" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("feMerge", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "b" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "SourceGraphic" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: size / 2, cy: size / 2, r, stroke: trackColor, strokeWidth: stroke, fill: "none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: size / 2, cy: size / 2, r, stroke: `url(#ring-${variant})`, strokeWidth: stroke, strokeLinecap: "round", fill: "none", strokeDasharray: c, strokeDashoffset: offset, filter: `url(#glow-${variant})`, style: { transition: "stroke-dashoffset 0.6s cubic-bezier(0.2,0.8,0.2,1)" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: size / 2, cy: size / 2, r: r - 10, stroke: innerStroke, strokeWidth: 1, fill: "none" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-semibold tracking-tight md:text-3xl", children: label }),
      sublabel && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-0.5 text-[11px] ${accent}`, children: sublabel })
    ] })
  ] });
}
export {
  ApplicationWizardChrome as A,
  ChipPicker as C,
  Field as F,
  NeonInput as N,
  TileChoice as T,
  WizardNav as W,
  NeonSelect as a,
  NeonTextarea as b,
  NeonCheckList as c,
  CreatorPassport as d
};
