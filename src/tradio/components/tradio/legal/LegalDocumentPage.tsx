import React, { useState } from "react";
import { ChevronDown, Download, Mail, Printer } from "lucide-react";
import { GlassCard, SecondaryButton } from "../ui";
import { LegalStatusBadge, LegalLinkList, LegalVersionHistory } from "./LegalPrimitives";
import { getLegalDocument, type LegalDocument } from "./legalDocuments";

const Section: React.FC<{
  heading: string;
  body: string[];
  defaultOpen?: boolean;
  index: number;
}> = ({ heading, body, defaultOpen, index }) => {
  const [open, setOpen] = useState(defaultOpen ?? index < 2);
  const id = `legal-sec-${index}`;
  return (
    <div id={id} className="rounded-2xl border border-white/8 bg-white/[0.02]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm font-bold text-white">
          {index + 1}. {heading}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="space-y-2 border-t border-white/6 px-4 py-3">
          {body.map((paragraph, i) => (
            <p key={i} className="text-[13px] leading-relaxed text-white/65">
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export const LegalDocumentPage: React.FC<{
  docId: string;
  onOpen: (target: string) => void;
}> = ({ docId, onOpen }) => {
  const doc: LegalDocument | undefined = getLegalDocument(docId);

  if (!doc) {
    return (
      <GlassCard className="p-8 text-center">
        <h2 className="text-xl font-black text-white">Document not found</h2>
        <p className="mt-2 text-sm text-white/50">No legal document is registered for “{docId}”.</p>
      </GlassCard>
    );
  }

  const relatedLinks = doc.relatedDocuments
    .map((id) => getLegalDocument(id))
    .filter((d): d is LegalDocument => Boolean(d))
    .map((d) => ({ label: d.title, target: d.id }));

  return (
    <div className="space-y-5">
      <GlassCard glow className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <LegalStatusBadge status={doc.status} />
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] text-white/55">
            v{doc.version}
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white">{doc.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">{doc.summary}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-white/45">
          <span>
            Last updated: <span className="text-white/65">{doc.lastUpdated}</span>
          </span>
          <span>
            Effective: <span className="text-white/65">{doc.effectiveDate}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Mail className="h-3 w-3" /> {doc.contactEmail}
          </span>
        </div>
        {doc.status === "pending_review" && (
          <div className="mt-3 rounded-xl border border-amber-300/20 bg-amber-500/[0.07] px-3 py-2 text-[12px] text-amber-100">
            This page is pending legal review. The content below is placeholder text and not final
            legal copy.
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <SecondaryButton className="px-3 py-2 text-[11px]" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" /> Print
          </SecondaryButton>
          <SecondaryButton className="px-3 py-2 text-[11px]">
            <Download className="h-3.5 w-3.5" /> Download (placeholder)
          </SecondaryButton>
        </div>
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-[0.32fr_0.68fr]">
        {/* Table of contents */}
        <GlassCard className="h-max p-4 lg:sticky lg:top-4">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
            On this page
          </div>
          <ol className="space-y-1">
            {doc.contentPlaceholder.map((section, index) => (
              <li key={section.heading}>
                <a
                  href={`#legal-sec-${index}`}
                  className="block truncate rounded-lg px-2 py-1 text-[12px] text-white/60 transition hover:bg-white/[0.04] hover:text-white"
                >
                  {index + 1}. {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </GlassCard>

        {/* Body */}
        <div className="space-y-3">
          {doc.contentPlaceholder.map((section, index) => (
            <Section
              key={section.heading}
              heading={section.heading}
              body={section.body}
              index={index}
            />
          ))}

          <GlassCard className="space-y-4 p-4">
            <LegalLinkList links={relatedLinks} onOpen={onOpen} />
            <LegalVersionHistory
              entries={doc.versionHistory}
              version={doc.version}
              lastUpdated={doc.lastUpdated}
            />
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
