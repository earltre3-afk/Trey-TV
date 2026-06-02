import React from "react";
import { AlertCircle, CheckCircle2, ChevronRight, FileText, ShieldCheck } from "lucide-react";
import { GlassCard } from "../ui";
import type { LegalAcceptanceFlowConfig, LegalAcceptanceValues } from "./legalAcceptanceConfig";
import {
  LEGAL_STATUS_META,
  type LegalHomeGroup,
  type LegalStatus,
  type LegalVersionEntry,
} from "./legalDocuments";

export const LegalStatusBadge: React.FC<{ status: LegalStatus }> = ({ status }) => {
  const meta = LEGAL_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${meta.tone}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {meta.label}
    </span>
  );
};

/** A grouped category card on the Legal Center home. */
export const LegalCategoryCard: React.FC<{
  group: LegalHomeGroup;
  onOpen: (target: string) => void;
}> = ({ group, onOpen }) => (
  <GlassCard className="p-5">
    <div className="flex items-center gap-2 text-sm font-black text-white">
      <ShieldCheck className="h-4 w-4 text-cyan-300" /> {group.title}
    </div>
    <p className="mt-1 text-xs leading-relaxed text-white/55">{group.description}</p>
    <ul className="mt-3 space-y-1">
      {group.links.map((link) => (
        <li key={link.target}>
          <button
            onClick={() => onOpen(link.target)}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-left text-[13px] text-white/75 transition hover:border-white/16 hover:bg-white/[0.05] hover:text-white"
          >
            <span className="inline-flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-white/40" /> {link.label}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-white/30" />
          </button>
        </li>
      ))}
    </ul>
  </GlassCard>
);

/** A compact list of related document links. */
export const LegalLinkList: React.FC<{
  title?: string;
  links: { label: string; target: string }[];
  onOpen: (target: string) => void;
}> = ({ title = "Related", links, onOpen }) => {
  if (links.length === 0) return null;
  return (
    <div>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <button
            key={link.target}
            onClick={() => onOpen(link.target)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
          >
            <FileText className="h-3 w-3" /> {link.label}
          </button>
        ))}
      </div>
    </div>
  );
};

/** Reusable legal acceptance checkbox for sensitive flows. */
export const LegalAcceptanceCheckbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  required?: boolean;
}> = ({ checked, onChange, children, required }) => (
  <label className="flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-white/72">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="mt-0.5 h-4 w-4 shrink-0 accent-fuchsia-500"
    />
    <span>
      {children}
      {required && <span className="ml-1 text-fuchsia-300">*</span>}
    </span>
  </label>
);

export const PolicyLinkInline: React.FC<{
  target: string;
  children: React.ReactNode;
  className?: string;
}> = ({ target, children, className = "" }) => {
  const open = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const detail = { target };
    window.dispatchEvent(new CustomEvent("open-tradio-legal", { detail }));
    document.dispatchEvent(new CustomEvent("open-tradio-legal", { detail }));
  };
  return (
    <button
      type="button"
      onClick={open}
      className={`inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold text-cyan-200 transition hover:border-cyan-300/30 hover:text-white ${className}`}
    >
      <FileText className="h-3 w-3" /> {children}
    </button>
  );
};

export const LegalFlowNotice: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-amber-100/80">
    {children ??
      "Legal language is pending counsel review. These checkpoints prepare acceptance records without making final legal claims."}
  </div>
);

export const LegalAcceptanceStatus: React.FC<{
  status?: "idle" | "saving" | "saved" | "fallback" | "error";
  message?: string | null;
}> = ({ status = "idle", message }) => {
  if (status === "idle" && !message) return null;
  const success = status === "saved";
  const tone = success
    ? "border-emerald-300/25 bg-emerald-500/10 text-emerald-200"
    : status === "saving"
      ? "border-cyan-300/25 bg-cyan-500/10 text-cyan-200"
      : "border-amber-300/25 bg-amber-500/10 text-amber-100";
  return (
    <div
      className={`flex items-start gap-2 rounded-2xl border px-3 py-2 text-[11px] leading-relaxed ${tone}`}
    >
      {success ? (
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      )}
      <span>{status === "saving" ? "Recording legal acknowledgement..." : message}</span>
    </div>
  );
};

export const LegalAcceptanceGroup: React.FC<{
  config: LegalAcceptanceFlowConfig;
  values: LegalAcceptanceValues;
  onChange: (values: LegalAcceptanceValues) => void;
  status?: "idle" | "saving" | "saved" | "fallback" | "error";
  statusMessage?: string | null;
  compact?: boolean;
}> = ({ config, values, onChange, status, statusMessage, compact = false }) => {
  const setValue = (id: string, checked: boolean) => onChange({ ...values, [id]: checked });
  return (
    <GlassCard className={`${compact ? "p-3" : "p-4"} border-white/10 bg-black/25`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <ShieldCheck className="h-4 w-4 text-cyan-300" /> {config.title}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-white/55">{config.description}</p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white/45">
          Pending legal review
        </span>
      </div>

      <div className="mt-3 space-y-2.5">
        {config.requiredConfirmations.map((item) => (
          <LegalAcceptanceCheckbox
            key={item.id}
            checked={values[item.id] === true}
            onChange={(checked) => setValue(item.id, checked)}
            required={item.required}
          >
            {item.label}
          </LegalAcceptanceCheckbox>
        ))}
        {config.requiredPolicies.map((item) => (
          <LegalAcceptanceCheckbox
            key={item.id}
            checked={values[item.id] === true}
            onChange={(checked) => setValue(item.id, checked)}
            required={item.required}
          >
            I agree to the{" "}
            <PolicyLinkInline target={item.documentId}>{item.title}</PolicyLinkInline>
            <span className="ml-1 text-white/35">v{item.version}</span>
          </LegalAcceptanceCheckbox>
        ))}
      </div>

      {config.relatedLegalRoutes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {config.relatedLegalRoutes.map((link) => (
            <PolicyLinkInline key={link.target} target={link.target}>
              {link.label}
            </PolicyLinkInline>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-2">
        <LegalFlowNotice />
        <LegalAcceptanceStatus status={status} message={statusMessage} />
      </div>
    </GlassCard>
  );
};

export const LegalVersionHistory: React.FC<{
  entries?: LegalVersionEntry[];
  version: string;
  lastUpdated: string;
}> = ({ entries, version, lastUpdated }) => (
  <div>
    <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
      Version history
    </div>
    <ul className="space-y-1.5">
      {(entries && entries.length > 0
        ? entries
        : [{ version, date: lastUpdated, note: "Initial placeholder draft." }]
      ).map((entry) => (
        <li key={entry.version} className="flex items-start gap-2 text-[11px] text-white/55">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-white/60">
            v{entry.version}
          </span>
          <span className="text-white/40">{entry.date}</span>
          <span>{entry.note}</span>
        </li>
      ))}
    </ul>
  </div>
);

/** Compact legal footer links — drop into footers, settings, and rails. */
export const LegalFooterLinks: React.FC<{
  onOpen: (target: string) => void;
  className?: string;
}> = ({ onOpen, className = "" }) => {
  const links: { label: string; target: string }[] = [
    { label: "Terms", target: "terms" },
    { label: "Privacy", target: "privacy" },
    { label: "Community Guidelines", target: "community-guidelines" },
    { label: "Copyright / DMCA", target: "dmca" },
    { label: "Privacy Choices", target: "privacy-choices" },
    { label: "Delete Account", target: "form:delete-account" },
    { label: "Contact", target: "form:contact-support" },
  ];
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-white/45 ${className}`}
    >
      {links.map((link, index) => (
        <React.Fragment key={link.target}>
          {index > 0 && <span className="text-white/20">·</span>}
          <button onClick={() => onOpen(link.target)} className="transition hover:text-white/80">
            {link.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};
