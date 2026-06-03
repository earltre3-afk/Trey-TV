import React from "react";
import { Lock, Clock, AlertCircle, CheckCircle, ChevronRight } from "lucide-react";
import { GlassCard, PrimaryButton, SecondaryButton, Chip } from "../ui";
import type { RoleProfileActivationState, RoleProfileStatus } from "../auth/roleProfile";

interface RoleProfileCompletionItem {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  required?: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface RoleProfileCompletion {
  totalItems: number;
  completedItems: number;
  requiredItems: number;
  completedRequired: number;
  percentComplete: number;
  isComplete: boolean;
  items: RoleProfileCompletionItem[];
  missingRequiredLabels: string[];
}

/**
 * Locked state: user doesn't have this role and needs to request access
 */
export const RoleProfileLockedState: React.FC<{
  roleLabel: string;
  onRequestAccess: () => void;
}> = ({ roleLabel, onRequestAccess }) => (
  <div className="space-y-6 px-4 sm:px-6 lg:px-10">
    <GlassCard className="border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-violet-500/20 p-4">
          <Lock className="h-8 w-8 text-violet-300" />
        </div>
        <h2 className="text-2xl font-bold text-white">{roleLabel} Access Locked</h2>
        <p className="text-sm leading-relaxed text-white/60">
          You don't currently have {roleLabel.toLowerCase()} access. Request access to set up your{" "}
          {roleLabel.toLowerCase()} profile and start creating.
        </p>
        <PrimaryButton onClick={onRequestAccess} className="mt-4">
          Request {roleLabel} Access
        </PrimaryButton>
      </div>
    </GlassCard>
  </div>
);

/**
 * Pending review state: user has requested access, awaiting approval
 */
export const RoleProfilePendingState: React.FC<{
  roleLabel: string;
  requestedAt?: string;
  onViewTimeline?: () => void;
}> = ({ roleLabel, requestedAt, onViewTimeline }) => (
  <div className="space-y-6 px-4 sm:px-6 lg:px-10">
    <GlassCard className="border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-cyan-500/20 p-4">
          <Clock className="h-8 w-8 animate-spin text-cyan-300" />
        </div>
        <h2 className="text-2xl font-bold text-white">{roleLabel} Access Under Review</h2>
        <p className="text-sm leading-relaxed text-white/60">
          Your {roleLabel.toLowerCase()} access request is being reviewed by our team. You'll be
          notified as soon as a decision is made.
        </p>
        {requestedAt && (
          <div className="text-xs text-white/50">
            Requested on {new Date(requestedAt).toLocaleDateString()}
          </div>
        )}
        {onViewTimeline && (
          <SecondaryButton onClick={onViewTimeline} className="mt-4">
            View Request Timeline <ChevronRight className="h-4 w-4" />
          </SecondaryButton>
        )}
      </div>
    </GlassCard>
  </div>
);

/**
 * Needs more info state: request rejected or needs update
 */
export const RoleProfileNeedsMoreInfoState: React.FC<{
  roleLabel: string;
  message?: string;
  onUpdate: () => void;
  onViewDetails?: () => void;
}> = ({ roleLabel, message, onUpdate, onViewDetails }) => (
  <div className="space-y-6 px-4 sm:px-6 lg:px-10">
    <GlassCard className="border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-amber-500/20 p-4">
          <AlertCircle className="h-8 w-8 text-amber-300" />
        </div>
        <h2 className="text-2xl font-bold text-white">{roleLabel} Access Needs Update</h2>
        <p className="text-sm leading-relaxed text-white/60">
          {message ||
            `Your ${roleLabel.toLowerCase()} access request needs some additional information. Please review and update your request.`}
        </p>
        <div className="flex gap-3">
          {onViewDetails && <SecondaryButton onClick={onViewDetails}>View Details</SecondaryButton>}
          <PrimaryButton onClick={onUpdate}>Update Request</PrimaryButton>
        </div>
      </div>
    </GlassCard>
  </div>
);

/**
 * Approved but incomplete state: role active, but profile setup not done
 */
export const RoleProfileIncompleteState: React.FC<{
  roleLabel: string;
  completion: RoleProfileCompletion;
}> = ({ roleLabel, completion }) => (
  <div className="space-y-6">
    <div className="px-4 sm:px-6 lg:px-10">
      <GlassCard className="border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-emerald-500/20 p-3">
            <AlertCircle className="h-5 w-5 text-emerald-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Complete Your {roleLabel} Profile</h3>
            <p className="mt-1 text-sm text-white/60">
              Your {roleLabel.toLowerCase()} access is approved! Complete the setup below to publish
              your profile.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>

    {/* Completion Progress */}
    <RoleProfileCompletionChecklist completion={completion} />
  </div>
);

/**
 * Completion checklist — shows what's done and what's needed
 */
export const RoleProfileCompletionChecklist: React.FC<{
  completion: RoleProfileCompletion;
}> = ({ completion }) => (
  <div className="px-4 sm:px-6 lg:px-10">
    <GlassCard className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white">Profile Setup Progress</h4>
          <span className="text-sm text-white/60">{completion.percentComplete}% Complete</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${completion.percentComplete}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {completion.items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3"
          >
            <div className="mt-0.5 flex-shrink-0">
              {item.completed ? (
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              ) : item.required ? (
                <div className="h-5 w-5 rounded-full border 2 border-amber-400/50 bg-amber-400/10" />
              ) : (
                <div className="h-5 w-5 rounded-full border border-white/20 bg-white/5" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {item.label}
                {item.required && !item.completed && <span className="ml-2 text-amber-300">*</span>}
              </div>
              <div className="mt-0.5 text-xs text-white/50">{item.description}</div>
            </div>
            {item.actionUrl && !item.completed && (
              <a
                href={item.actionUrl}
                className="flex-shrink-0 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
              >
                {item.actionLabel || "Setup"} →
              </a>
            )}
          </div>
        ))}
      </div>

      {completion.missingRequiredLabels.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <div className="text-xs font-semibold text-amber-200">Missing required fields:</div>
          <div className="mt-1 text-xs text-amber-100/80">
            {completion.missingRequiredLabels.join(", ")}
          </div>
        </div>
      )}
    </GlassCard>
  </div>
);

/**
 * Restricted state: role was revoked or suspended
 */
export const RoleProfileRestrictedState: React.FC<{
  roleLabel: string;
  reason?: string;
  onAppeal?: () => void;
}> = ({ roleLabel, reason, onAppeal }) => (
  <div className="space-y-6 px-4 sm:px-6 lg:px-10">
    <GlassCard className="border border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-red-500/20 p-4">
          <Lock className="h-8 w-8 text-red-300" />
        </div>
        <h2 className="text-2xl font-bold text-white">{roleLabel} Access Restricted</h2>
        <p className="text-sm leading-relaxed text-white/60">
          {reason ||
            `Your ${roleLabel.toLowerCase()} access has been temporarily restricted. Please contact support for more information.`}
        </p>
        {onAppeal && (
          <PrimaryButton onClick={onAppeal} className="mt-4">
            Appeal Restriction
          </PrimaryButton>
        )}
      </div>
    </GlassCard>
  </div>
);

/**
 * Active/public state — profile is ready to show
 * This is a wrapper; actual profile content is rendered separately
 */
export const RoleProfileActiveState: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => <>{children}</>;

/**
 * Main state router — displays the correct UI based on activation state
 */
export const RoleProfileStateRouter: React.FC<{
  state: RoleProfileActivationState | RoleProfileStatus;
  roleLabel: string;
  completion?: RoleProfileCompletion;
  onRequestAccess?: () => void;
  onUpdate?: () => void;
  onViewTimeline?: () => void;
  onViewDetails?: () => void;
  onAppeal?: () => void;
  children?: React.ReactNode; // Rendered for active_public state
}> = ({
  state,
  roleLabel,
  completion,
  onRequestAccess,
  onUpdate,
  onViewTimeline,
  onViewDetails,
  onAppeal,
  children,
}) => {
  const status = typeof state === "string" ? state : state.status;
  switch (status) {
    case "locked":
    case "request_available":
      return (
        <RoleProfileLockedState
          roleLabel={roleLabel}
          onRequestAccess={onRequestAccess || (() => {})}
        />
      );

    case "pending_review":
      return <RoleProfilePendingState roleLabel={roleLabel} onViewTimeline={onViewTimeline} />;

    case "needs_more_info":
      return (
        <RoleProfileNeedsMoreInfoState
          roleLabel={roleLabel}
          onUpdate={onUpdate || (() => {})}
          onViewDetails={onViewDetails}
        />
      );

    case "rejected":
      return (
        <RoleProfileNeedsMoreInfoState
          roleLabel={roleLabel}
          message={`Your ${roleLabel.toLowerCase()} access request was not approved at this time. You can submit a new request or contact support for feedback.`}
          onUpdate={onRequestAccess || (() => {})}
        />
      );

    case "approved_incomplete":
      return (
        <RoleProfileIncompleteState
          roleLabel={roleLabel}
          completion={
            completion || {
              totalItems: 0,
              completedItems: 0,
              requiredItems: 0,
              completedRequired: 0,
              percentComplete: 0,
              isComplete: false,
              items: [],
              missingRequiredLabels: [],
            }
          }
        />
      );

    case "restricted":
      return <RoleProfileRestrictedState roleLabel={roleLabel} onAppeal={onAppeal} />;

    case "active_public":
    case "active_private":
      return <RoleProfileActiveState>{children}</RoleProfileActiveState>;

    case "suspended":
      return (
        <RoleProfileRestrictedState
          roleLabel={roleLabel}
          reason={`Your ${roleLabel.toLowerCase()} access has been suspended. Please contact support.`}
        />
      );

    default:
      return null;
  }
};
