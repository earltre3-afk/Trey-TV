import { type LegalSection } from "@/lib/legal-content";

export function LegalTOC({ sections, compact = false }: { sections: LegalSection[]; compact?: boolean }) {
  return (
    <nav className={compact ? "" : "rounded-2xl liquid-glass border border-white/10 p-4"}>
      {!compact && (
        <div className="text-[10px] tracking-[0.25em] text-muted-foreground mb-3">ON THIS PAGE</div>
      )}
      <ol className="space-y-1 text-sm">
        {sections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="group flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition"
            >
              <span className="mt-0.5 text-[10px] font-mono text-muted-foreground tabular-nums w-5 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-foreground/80 group-hover:text-foreground transition leading-snug">{s.heading}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
