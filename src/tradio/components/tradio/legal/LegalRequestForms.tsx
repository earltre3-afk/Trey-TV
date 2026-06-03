import React, { useState } from "react";
import { CheckCircle2, ShieldAlert, Trash2 } from "lucide-react";
import { GlassCard, PrimaryButton, SecondaryButton } from "../ui";
import { LegalAcceptanceCheckbox } from "./LegalPrimitives";
import { getLegalForm, type LegalFormConfig, type LegalFormField } from "./legalForms";
import {
  submitAccountDeletionRequest,
  submitLegalRequest,
  type LegalServiceSource,
} from "./legalIntakeService";

const FieldInput: React.FC<{
  field: LegalFormField;
  value: string;
  onChange: (v: string) => void;
}> = ({ field, value, onChange }) => {
  const base =
    "w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-fuchsia-300/40";
  if (field.type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        className={`${base} resize-none`}
      />
    );
  }
  if (field.type === "select") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={base}>
        <option value="" disabled>
          Select…
        </option>
        {field.options?.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className={base}
    />
  );
};

/** Generic, config-driven legal request form. Frontend-only; shows a confirmation on submit. */
export const LegalRequestForm: React.FC<{
  config: LegalFormConfig;
  onBack?: () => void;
  onOpen?: (target: string) => void;
}> = ({ config, onBack, onOpen }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [ack, setAck] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [source, setSource] = useState<LegalServiceSource | null>(null);

  const required = config.fields.filter((f) => f.required).map((f) => f.name);
  const canSubmit =
    required.every((n) => (values[n] || "").trim().length > 0) &&
    (!config.acknowledgement || ack) &&
    !submitting;
  const setValue = (name: string, v: string) => setValues((c) => ({ ...c, [name]: v }));

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await submitLegalRequest(config.id, config.title, values);
    setSubmitting(false);
    setFeedback(result.warning);
    setSource(result.source);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <GlassCard glow className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-300/30 bg-emerald-500/10 text-emerald-200">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-black text-white">Request received</h3>
          <p className="max-w-md text-sm leading-relaxed text-white/60">
            {source === "supabase"
              ? `Your ${config.title.toLowerCase()} was submitted to the legal intake backend. A reviewer queue can process it once the service is available.`
              : `This is a frontend placeholder — your ${config.title.toLowerCase()} was not stored in a backend because Supabase is unavailable or not configured.`}
          </p>
          {feedback && <p className="max-w-md text-xs leading-relaxed text-white/50">{feedback}</p>}
          {onBack && (
            <SecondaryButton className="mt-2 px-6 py-3 text-xs" onClick={onBack}>
              Back to Legal Center
            </SecondaryButton>
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard glow className="p-6 sm:p-8">
      <h2 className="text-2xl font-black tracking-tight text-white">{config.title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-white/60">{config.summary}</p>
      {config.relatedDocument && onOpen && (
        <button
          onClick={() => onOpen(config.relatedDocument as string)}
          className="mt-2 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200"
        >
          Read the related policy →
        </button>
      )}
      <div className="mt-5 space-y-4">
        {config.fields.map((field) => (
          <div key={field.name}>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/55">
              {field.label} {!field.required && <span className="text-white/30">(optional)</span>}
            </label>
            <FieldInput
              field={field}
              value={values[field.name] || ""}
              onChange={(v) => setValue(field.name, v)}
            />
            {field.help && <p className="mt-1 text-[11px] text-white/40">{field.help}</p>}
          </div>
        ))}
        {config.acknowledgement && (
          <LegalAcceptanceCheckbox checked={ack} onChange={setAck}>
            {config.acknowledgement}
          </LegalAcceptanceCheckbox>
        )}
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] leading-relaxed text-white/40">
          {source === "supabase"
            ? "Submitting to the legal intake backend. Reviewers will receive the request if the backend is enabled."
            : "This form will submit to the legal intake service when Supabase is configured. Otherwise it remains a placeholder."}
        </p>
        <div className="flex gap-2">
          {onBack && (
            <SecondaryButton className="px-4 py-3 text-xs" onClick={onBack}>
              Cancel
            </SecondaryButton>
          )}
          <PrimaryButton
            className={`px-5 py-3 text-xs ${canSubmit ? "" : "pointer-events-none opacity-40"}`}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? "Submitting…" : config.submitLabel}
          </PrimaryButton>
        </div>
      </div>
    </GlassCard>
  );
};

const withConfig = (
  id: string,
): React.FC<{ onBack?: () => void; onOpen?: (target: string) => void }> => {
  const Component: React.FC<{ onBack?: () => void; onOpen?: (target: string) => void }> = ({
    onBack,
    onOpen,
  }) => {
    const config = getLegalForm(id);
    if (!config) return null;
    return <LegalRequestForm config={config} onBack={onBack} onOpen={onOpen} />;
  };
  Component.displayName = `LegalForm_${id}`;
  return Component;
};

export const DataRightsForm = withConfig("data-rights");
export const DmcaNoticeForm = withConfig("dmca-notice");
export const ModerationAppealForm = withConfig("moderation-appeal");

const DELETE_CHECKLIST = [
  "My profile, display name, and avatar will be removed.",
  "My uploaded content, releases, beats, and mixes will be removed or disassociated.",
  "My followers, saves, and listening history will be deleted.",
  "Some data may be retained for legal, security, or fraud-prevention reasons.",
  "This action is intended to be permanent and cannot be easily undone.",
];

/** Account deletion request — explanation + confirmation checklist + placeholder action. */
export const DeleteAccountRequest: React.FC<{
  onBack?: () => void;
  onOpen?: (target: string) => void;
}> = ({ onBack, onOpen }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [ack, setAck] = useState(false);
  const [requested, setRequested] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [source, setSource] = useState<LegalServiceSource | null>(null);

  const handleRequest = async () => {
    setSubmitting(true);
    const result = await submitAccountDeletionRequest(confirmed, ack);
    setSubmitting(false);
    setFeedback(result.warning);
    setSource(result.source);
    setRequested(true);
  };

  if (requested) {
    return (
      <GlassCard glow className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-300/30 bg-amber-500/10 text-amber-200">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-black text-white">Deletion request noted</h3>
          <p className="max-w-md text-sm leading-relaxed text-white/60">
            {source === "supabase"
              ? "Your account deletion request has been submitted to the legal intake backend. A reviewer queue can process it once the service is available."
              : "Placeholder only — no account was deleted. Supabase is unavailable or not configured, so the request was recorded only in the UI."}
          </p>
          {feedback && <p className="max-w-md text-xs leading-relaxed text-white/50">{feedback}</p>}
          {onBack && (
            <SecondaryButton className="mt-2 px-6 py-3 text-xs" onClick={onBack}>
              Back
            </SecondaryButton>
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard glow className="p-6 sm:p-8">
      <div className="flex items-center gap-2 text-2xl font-black tracking-tight text-white">
        <Trash2 className="h-5 w-5 text-red-300" /> Delete Account
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-white/60">
        Deleting your account removes your profile and content from Trey TV and Tradio. Please
        review what happens before continuing.
      </p>
      <div className="mt-4 rounded-2xl border border-red-300/15 bg-red-500/[0.05] p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-red-200">
          <ShieldAlert className="h-4 w-4" /> What gets deleted
        </div>
        <ul className="mt-2 space-y-1.5">
          {DELETE_CHECKLIST.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-[12px] leading-relaxed text-white/65"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-300/70" /> {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 space-y-3">
        <LegalAcceptanceCheckbox checked={confirmed} onChange={setConfirmed}>
          I understand what will be deleted and what may be retained for legal/security reasons.
        </LegalAcceptanceCheckbox>
        <LegalAcceptanceCheckbox checked={ack} onChange={setAck}>
          I want to request permanent deletion of my account. (Placeholder — pending legal review.)
        </LegalAcceptanceCheckbox>
        {onOpen && (
          <button
            onClick={() => onOpen("data-retention")}
            className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Read the Data Retention policy →
          </button>
        )}
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        {onBack && (
          <SecondaryButton className="px-4 py-3 text-xs" onClick={onBack}>
            Keep My Account
          </SecondaryButton>
        )}
        <button
          disabled={!(confirmed && ack) || submitting}
          onClick={handleRequest}
          className={`inline-flex items-center justify-center gap-2 rounded-full border border-red-400/40 bg-red-500/15 px-5 py-3 text-xs font-black uppercase tracking-wider text-red-200 transition hover:bg-red-500/25 ${confirmed && ack && !submitting ? "" : "pointer-events-none opacity-40"}`}
        >
          <Trash2 className="h-4 w-4" /> {submitting ? "Requesting…" : "Request Account Deletion"}
        </button>
      </div>
    </GlassCard>
  );
};
