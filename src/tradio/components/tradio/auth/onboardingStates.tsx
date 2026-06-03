import React from "react";
import {
  Clock,
  Disc3,
  Mic2,
  Music2,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { GlassCard, PrimaryButton, SecondaryButton } from "../ui";
import type { AccessRequestEvent, RoleRequestStatus } from "./types";
import { getRequestStatusLabel } from "./accessRequests";

const STATUS_TONE: Record<RoleRequestStatus, string> = {
  not_started: "border-white/12 bg-white/[0.05] text-white/55",
  draft: "border-white/15 bg-white/[0.06] text-white/70",
  submitted: "border-cyan-300/30 bg-cyan-500/10 text-cyan-200",
  pending: "border-amber-300/30 bg-amber-500/10 text-amber-200",
  approved: "border-emerald-300/30 bg-emerald-500/10 text-emerald-200",
  rejected: "border-red-300/30 bg-red-500/10 text-red-200",
  restricted: "border-orange-300/30 bg-orange-500/10 text-orange-200",
  needs_more_info: "border-fuchsia-300/30 bg-fuchsia-500/10 text-fuchsia-200",
  cancelled: "border-white/12 bg-white/[0.04] text-white/45",
};

const EVENT_LABEL: Record<AccessRequestEvent["event_type"], string> = {
  submitted: "Request submitted",
  updated: "Details updated",
  needs_more_info: "More info requested",
  approved: "Approved",
  rejected: "Not approved",
  restricted: "Restricted",
  cancelled: "Cancelled",
  note_added: "Reviewer note",
};

const EVENT_DOT: Record<AccessRequestEvent["event_type"], string> = {
  submitted: "bg-cyan-300",
  updated: "bg-white/50",
  needs_more_info: "bg-fuchsia-300",
  approved: "bg-emerald-300",
  rejected: "bg-red-300",
  restricted: "bg-orange-300",
  cancelled: "bg-white/40",
  note_added: "bg-purple-300",
};

const formatEventTime = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

/** Vertical audit timeline for an access request. Shown to the owner and to reviewers. */
export const RequestEventTimeline: React.FC<{
  events?: AccessRequestEvent[];
  compact?: boolean;
}> = ({ events, compact }) => {
  if (!events || events.length === 0) {
    return <p className="text-[11px] italic text-white/40">No timeline events yet.</p>;
  }
  return (
    <ol className={`relative space-y-2 ${compact ? "" : "pl-1"}`}>
      {events.map((event) => (
        <li key={event.id} className="flex items-start gap-2.5">
          <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${EVENT_DOT[event.event_type]}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-white/80">
                {EVENT_LABEL[event.event_type]}
              </span>
              {event.created_at && (
                <span className="text-[10px] text-white/35">
                  {formatEventTime(event.created_at)}
                </span>
              )}
            </div>
            {event.note && (
              <p className="mt-0.5 text-[11px] leading-relaxed text-white/50">{event.note}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
};

export const RequestStatusBadge: React.FC<{ status: RoleRequestStatus }> = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${STATUS_TONE[status]}`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {getRequestStatusLabel(status)}
  </span>
);

/**
 * Premium, positive onboarding/empty state used across role hubs and the
 * Access Center. Keeps locked or in-flight states feeling exclusive, not broken.
 */
export const OnboardingState: React.FC<{
  icon?: React.ReactNode;
  eyebrow?: string;
  title: string;
  message: string;
  status?: RoleRequestStatus;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  note?: string;
}> = ({
  icon,
  eyebrow,
  title,
  message,
  status,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  note,
}) => (
  <GlassCard glow className="p-6">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/15 to-cyan-500/10 text-fuchsia-200">
          {icon || <Sparkles className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {eyebrow && (
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
                {eyebrow}
              </span>
            )}
            {status && <RequestStatusBadge status={status} />}
          </div>
          <h3 className="mt-1.5 text-xl font-black tracking-tight text-white">{title}</h3>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/62">{message}</p>
          {note && <p className="mt-2 text-xs italic leading-relaxed text-white/45">{note}</p>}
        </div>
      </div>
      {(primaryLabel || secondaryLabel) && (
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          {primaryLabel && (
            <PrimaryButton className="px-4 py-3 text-xs" onClick={onPrimary}>
              <Sparkles className="h-4 w-4" /> {primaryLabel}
            </PrimaryButton>
          )}
          {secondaryLabel && (
            <SecondaryButton className="px-4 py-2.5 text-[11px]" onClick={onSecondary}>
              {secondaryLabel}
            </SecondaryButton>
          )}
        </div>
      )}
    </div>
  </GlassCard>
);

// ─── Role profile empty states ──────────────────────────────────────────────

export const NoArtistProfileState: React.FC<{ onRequest?: () => void }> = ({ onRequest }) => (
  <OnboardingState
    icon={<Music2 className="h-5 w-5" />}
    eyebrow="Artist lane"
    title="No artist profile yet"
    message="Set up your artist identity to manage releases, an artist-owned station, playlists, and premieres."
    primaryLabel="Request Artist Access"
    onPrimary={onRequest}
  />
);

export const NoProducerProfileState: React.FC<{ onRequest?: () => void }> = ({ onRequest }) => (
  <OnboardingState
    icon={<Disc3 className="h-5 w-5" />}
    eyebrow="Producer lane"
    title="No producer profile yet"
    message="Unlock a beat catalog, packs, collab requests, artist pitches, and DJ opportunities."
    primaryLabel="Apply as Producer"
    onPrimary={onRequest}
  />
);

export const NoDJProfileState: React.FC<{ onRequest?: () => void }> = ({ onRequest }) => (
  <OnboardingState
    icon={<Mic2 className="h-5 w-5" />}
    eyebrow="DJ / Host lane"
    title="No DJ / host profile yet"
    message="Request host tools to run live shows, mixes, listener requests, Song Wars hosting, and replays."
    primaryLabel="Apply as DJ / Host"
    onPrimary={onRequest}
  />
);

// ─── In-flight / decision states ─────────────────────────────────────────────

export const BroadcastPendingState: React.FC = () => (
  <OnboardingState
    icon={<Radio className="h-5 w-5" />}
    eyebrow="Broadcast access"
    status="pending"
    title="Broadcast access in review"
    message="Your broadcast application is with the review team. You'll get host and premiere tools once it's cleared."
  />
);

export const VerificationPendingState: React.FC = () => (
  <OnboardingState
    icon={<ShieldCheck className="h-5 w-5" />}
    eyebrow="Verification"
    status="pending"
    title="Verification in review"
    message="We're reviewing your verification request. Your badge will appear automatically once approved."
  />
);

export const RequestRejectedState: React.FC<{ reason?: string; onResubmit?: () => void }> = ({
  reason,
  onResubmit,
}) => (
  <OnboardingState
    icon={<XCircle className="h-5 w-5" />}
    status="rejected"
    title="Request not approved yet"
    message="No problem — most creators resubmit. Update your details and try again."
    note={reason}
    primaryLabel="Update & Resubmit"
    onPrimary={onResubmit}
  />
);

export const NeedsMoreInfoState: React.FC<{ reason?: string; onContinue?: () => void }> = ({
  reason,
  onContinue,
}) => (
  <OnboardingState
    icon={<Clock className="h-5 w-5" />}
    status="needs_more_info"
    title="A little more info needed"
    message="You're almost there. Add the requested details to keep your request moving."
    note={reason}
    primaryLabel="Continue Request"
    onPrimary={onContinue}
  />
);

export const RoleRestrictedState: React.FC<{ reason?: string }> = ({ reason }) => (
  <OnboardingState
    icon={<ShieldAlert className="h-5 w-5" />}
    status="restricted"
    title="Access temporarily restricted"
    message="These tools are paused on your account while under review. Everything else in Tradio stays available."
    note={reason}
  />
);
