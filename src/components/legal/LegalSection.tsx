import { type LegalSection as LegalSectionType } from "@/lib/legal-content";

export function LegalSection({ section }: { section: LegalSectionType }) {
  return (
    <section id={section.id} className="scroll-mt-24">
      {/* Mobile: collapsible. Desktop: always open. */}
      <details
        open
        className="group rounded-2xl liquid-glass border border-white/10 hover:border-white/20 transition-colors lg:open:border-white/15"
      >
        <summary className="lg:pointer-events-none list-none cursor-pointer p-5 lg:p-6 flex items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            <span className="text-primary mr-2 font-mono text-[11px] align-middle hidden sm:inline">
              §
            </span>
            {section.heading}
          </h2>
          <span
            className="lg:hidden text-muted-foreground transition-transform group-open:rotate-180"
            aria-hidden
          >
            ▾
          </span>
        </summary>
        <div className="px-5 lg:px-6 pb-5 lg:pb-6 -mt-2 space-y-3 text-sm leading-relaxed text-foreground/80">
          {section.body?.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {section.list && (
            <ul className="list-disc pl-5 space-y-1.5 marker:text-primary/70">
              {section.list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </section>
  );
}
