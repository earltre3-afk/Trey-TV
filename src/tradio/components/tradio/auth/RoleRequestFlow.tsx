import React, { useMemo, useState } from "react";
import { CheckCircle2, ShieldCheck, Sparkles, X } from "lucide-react";
import { GlassCard, PrimaryButton, SecondaryButton } from "../ui";
import type { RoleApplicationAnswer, RoleRequestType } from "./types";
import { REQUEST_TYPE_LABEL } from "./accessRequests";
import { LegalAcceptanceGroup } from "../legal/LegalPrimitives";
import {
  createLegalAcceptanceValues,
  isLegalFlowAccepted,
  LEGAL_ACCEPTANCE_FLOWS,
  recordLegalFlowAcceptance,
  type LegalAcceptanceValues,
} from "../legal/legalAcceptanceConfig";

interface FlowField {
  field: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox";
  placeholder?: string;
  optional?: boolean;
  options?: string[];
}

interface FlowConfig {
  title: string;
  subtitle: string;
  benefit: string;
  fields: FlowField[];
}

const FLOW_CONFIG: Record<RoleRequestType, FlowConfig> = {
  artist: {
    title: "Request Artist Access",
    subtitle:
      "Tell us about your sound. Artist access unlocks releases, an artist station, playlists, and premieres.",
    benefit: "Releases · Artist station · Playlists · Premieres · Song Wars",
    fields: [
      {
        field: "artist_name",
        label: "Artist / stage name",
        type: "text",
        placeholder: "e.g. Mila Rain",
      },
      { field: "genres", label: "Genres", type: "text", placeholder: "R&B, Soul, Alt-Pop" },
      {
        field: "music_links",
        label: "Existing music links",
        type: "textarea",
        placeholder: "Spotify, YouTube, SoundCloud…",
        optional: true,
      },
      {
        field: "station_goal",
        label: "Station goal",
        type: "textarea",
        placeholder: "What kind of station do you want to build?",
      },
      {
        field: "release_goals",
        label: "Release goals",
        type: "textarea",
        placeholder: "How often do you plan to drop music?",
      },
      {
        field: "fanbase",
        label: "Fanbase description",
        type: "textarea",
        placeholder: "Tell us about your current audience.",
      },
      {
        field: "verification_interest",
        label: "Interested in verification?",
        type: "select",
        options: ["Yes", "Not yet"],
      },
    ],
  },
  producer: {
    title: "Request Producer Access",
    subtitle:
      "Producer access unlocks your beat catalog, packs, collabs, artist pitches, and DJ opportunities.",
    benefit: "Beat catalog · Packs · Collabs · Artist pitches · Beat battles",
    fields: [
      {
        field: "producer_name",
        label: "Producer name",
        type: "text",
        placeholder: "e.g. Darius Cole",
      },
      {
        field: "beat_genres",
        label: "Beat genres",
        type: "text",
        placeholder: "Trap Soul, Lo-Fi, Drill",
      },
      {
        field: "bpm_key",
        label: "BPM / key preferences",
        type: "text",
        placeholder: "e.g. 120–150 BPM, minor keys",
        optional: true,
      },
      {
        field: "catalog_intent",
        label: "Beat catalog intent",
        type: "textarea",
        placeholder: "What will you upload and how often?",
      },
      {
        field: "collab_availability",
        label: "Collab availability",
        type: "select",
        options: ["Open to collabs", "Selective", "Solo for now"],
      },
      {
        field: "licensing_intent",
        label: "Licensing intent",
        type: "select",
        options: ["Lease + exclusive", "Exclusive only", "Free / promo", "Undecided"],
      },
    ],
  },
  dj: {
    title: "Request DJ / Host Access",
    subtitle:
      "Host access unlocks live shows, mixes, the Broadcast Studio, listener requests, replays, and Song Wars hosting.",
    benefit: "Live shows · Mixes · Broadcast Studio · Requests · Song Wars hosting",
    fields: [
      {
        field: "dj_name",
        label: "Host / DJ name",
        type: "text",
        placeholder: "e.g. DJ Midnight Spin",
      },
      {
        field: "show_type",
        label: "Show type",
        type: "text",
        placeholder: "Live mix, talk + music, request hour…",
      },
      {
        field: "preferred_genres",
        label: "Preferred genres",
        type: "text",
        placeholder: "Hip-Hop, House, R&B",
      },
      {
        field: "schedule_goal",
        label: "Live schedule goal",
        type: "text",
        placeholder: "e.g. Weekly Friday nights",
      },
      {
        field: "broadcast_experience",
        label: "Broadcast experience",
        type: "textarea",
        placeholder: "Any hosting / DJ experience?",
        optional: true,
      },
      {
        field: "equipment",
        label: "Equipment / readiness",
        type: "textarea",
        placeholder: "What is your setup?",
        optional: true,
      },
      {
        field: "show_concept",
        label: "Show concept",
        type: "textarea",
        placeholder: "Describe your dream show.",
      },
    ],
  },
  verification: {
    title: "Request Verification",
    subtitle: "Verification adds a trust badge for creator profiles, premieres, and Song Wars.",
    benefit: "Trust badge · Creator credibility · Premiere eligibility",
    fields: [
      {
        field: "verify_role",
        label: "Role being verified",
        type: "select",
        options: ["Artist", "Producer", "DJ / Host"],
      },
      {
        field: "public_identity",
        label: "Public identity",
        type: "text",
        placeholder: "Your public Trey TV identity / name",
      },
      {
        field: "links",
        label: "Links / social proof",
        type: "textarea",
        placeholder: "Socials, press, streaming profiles…",
        optional: true,
      },
      {
        field: "reason",
        label: "Reason for verification",
        type: "textarea",
        placeholder: "Why should you be verified?",
      },
    ],
  },
  broadcast: {
    title: "Apply for Broadcast Access",
    subtitle: "Broadcast access is invite-only. Tell us about the show you want to run on Tradio.",
    benefit: "Premium shows · Scheduled broadcasts · Station premieres",
    fields: [
      {
        field: "role",
        label: "Your creator role",
        type: "select",
        options: ["Artist", "Producer", "DJ / Host"],
      },
      {
        field: "show_type",
        label: "Show type",
        type: "text",
        placeholder: "DJ mix, premiere, producer spotlight…",
      },
      {
        field: "show_concept",
        label: "Station / show concept",
        type: "textarea",
        placeholder: "Describe your broadcast concept.",
      },
      {
        field: "schedule_intent",
        label: "Schedule intent",
        type: "text",
        placeholder: "e.g. Weekly, 2 hours, evenings",
      },
      {
        field: "moderation_ack",
        label: "I agree to the Tradio broadcast & moderation guidelines",
        type: "checkbox",
      },
    ],
  },
};

export const RoleRequestFlow: React.FC<{
  flowType: RoleRequestType;
  onClose: () => void;
  onSubmit: (type: RoleRequestType, answers: RoleApplicationAnswer[]) => void;
}> = ({ flowType, onClose, onSubmit }) => {
  const config = FLOW_CONFIG[flowType];
  const [values, setValues] = useState<Record<string, string>>({});
  const [legalValues, setLegalValues] = useState<LegalAcceptanceValues>(() =>
    createLegalAcceptanceValues("role_access_request"),
  );
  const [legalStatus, setLegalStatus] = useState<
    "idle" | "saving" | "saved" | "fallback" | "error"
  >("idle");
  const [legalMessage, setLegalMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const requiredFields = useMemo(
    () => config.fields.filter((f) => !f.optional).map((f) => f.field),
    [config.fields],
  );

  const legalAccepted = isLegalFlowAccepted("role_access_request", legalValues);
  const canSubmit =
    legalAccepted &&
    requiredFields.every((field) => {
      const value = values[field];
      return typeof value === "string" && value.trim().length > 0;
    });

  const setValue = (field: string, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLegalStatus("saving");
    const result = await recordLegalFlowAcceptance("role_access_request", legalValues, {
      requestType: flowType,
      answers: values,
    });
    setLegalStatus(result.source === "supabase" ? "saved" : "fallback");
    setLegalMessage(
      result.source === "supabase" ? "Access acknowledgement saved." : result.warning,
    );
    const answers: RoleApplicationAnswer[] = config.fields
      .filter((f) => values[f.field]?.trim())
      .map((f) => ({ field: f.field, label: f.label, value: values[f.field].trim() }));
    onSubmit(flowType, answers);
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 p-0 backdrop-blur-xl animate-fade-in sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[32px] sm:rounded-[28px]"
      >
        <GlassCard glow className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
                {REQUEST_TYPE_LABEL[flowType]}
              </span>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white">{config.title}</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white hover:border-white/25 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {submitted ? (
            <div className="mt-8 flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-300/30 bg-emerald-500/10 text-emerald-200">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-white">Request submitted</h3>
              <p className="max-w-md text-sm leading-relaxed text-white/62">
                Your {REQUEST_TYPE_LABEL[flowType]} request is now{" "}
                <span className="font-bold text-amber-200">pending review</span>. Roles are granted
                by the Tradio team — you'll be notified once it's processed. (Mock flow: nothing is
                sent to a backend yet.)
              </p>
              <PrimaryButton className="mt-2 px-6 py-3 text-xs" onClick={onClose}>
                Done
              </PrimaryButton>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm leading-relaxed text-white/62">{config.subtitle}</p>
              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-[11px] text-cyan-200/80">
                <Sparkles className="h-3.5 w-3.5 shrink-0" /> {config.benefit}
              </div>

              <div className="mt-5 space-y-4">
                {config.fields.map((field) => (
                  <div key={field.field}>
                    {field.type !== "checkbox" && (
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/55">
                        {field.label}{" "}
                        {field.optional && <span className="text-white/30">(optional)</span>}
                      </label>
                    )}
                    {field.type === "text" && (
                      <input
                        value={values[field.field] || ""}
                        onChange={(event) => setValue(field.field, event.target.value)}
                        placeholder={field.placeholder}
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-fuchsia-300/40"
                      />
                    )}
                    {field.type === "textarea" && (
                      <textarea
                        value={values[field.field] || ""}
                        onChange={(event) => setValue(field.field, event.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-fuchsia-300/40"
                      />
                    )}
                    {field.type === "select" && (
                      <select
                        value={values[field.field] || ""}
                        onChange={(event) => setValue(field.field, event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-300/40"
                      >
                        <option value="" disabled>
                          Select…
                        </option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    {field.type === "checkbox" && (
                      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/75">
                        <input
                          type="checkbox"
                          checked={values[field.field] === "acknowledged"}
                          onChange={(event) =>
                            setValue(field.field, event.target.checked ? "acknowledged" : "")
                          }
                          className="mt-0.5 h-4 w-4 accent-fuchsia-500"
                        />
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-cyan-300" /> {field.label}
                        </span>
                      </label>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <LegalAcceptanceGroup
                  config={LEGAL_ACCEPTANCE_FLOWS.role_access_request}
                  values={legalValues}
                  onChange={setLegalValues}
                  status={legalStatus}
                  statusMessage={legalMessage}
                  compact
                />
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] leading-relaxed text-white/40">
                  Elevated roles are reviewed before activation. Nothing is self-granted.
                </p>
                <div className="flex gap-2">
                  <SecondaryButton className="px-4 py-3 text-xs" onClick={onClose}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    className={`px-5 py-3 text-xs ${canSubmit && legalStatus !== "saving" ? "" : "pointer-events-none opacity-40"}`}
                    onClick={handleSubmit}
                    disabled={!canSubmit || legalStatus === "saving"}
                  >
                    <Sparkles className="h-4 w-4" /> Submit Request
                  </PrimaryButton>
                </div>
              </div>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
