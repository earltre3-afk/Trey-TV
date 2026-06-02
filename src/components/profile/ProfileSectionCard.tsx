/**
 * ProfileSectionCard.tsx
 * Reusable section card used across all profile module areas.
 * Wraps content in the standard glass/neon-border card with optional heading.
 */

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  title?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trailing?: ReactNode;
  children: ReactNode;
  isOwner?: boolean;
  className?: string;
}

export function ProfileSectionCard({
  title,
  icon: Icon,
  iconColor = "text-primary",
  trailing,
  children,
  isOwner = false,
  className = "",
}: Props) {
  const cardClass = isOwner ? "owner-neon owner-glass" : "glass neon-border";

  return (
    <section className={`rounded-3xl ${cardClass} p-5 relative overflow-hidden ${className}`}>
      {/* Subtle ambient glow spot */}
      {isOwner && (
        <div
          aria-hidden
          className="absolute -top-16 -right-16 size-40 rounded-full bg-primary/20 blur-3xl pointer-events-none"
        />
      )}

      {(title || trailing) && (
        <div className="relative flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-sm font-bold flex items-center gap-2">
              {Icon && <Icon className={`size-4 ${iconColor}`} />}
              {title}
            </h3>
          )}
          {trailing && <div>{trailing}</div>}
        </div>
      )}

      <div className="relative">{children}</div>
    </section>
  );
}

/**
 * ProfileEmptyState
 * Used inside ProfileSectionCard when a module has no data yet.
 */
export function ProfileEmptyState({
  icon: Icon,
  label,
  subLabel,
  action,
}: {
  icon?: LucideIcon;
  label: string;
  subLabel?: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-8 space-y-3">
      {Icon && (
        <div className="mx-auto size-12 rounded-2xl glass grid place-items-center mb-3">
          <Icon className="size-6 text-muted-foreground" />
        </div>
      )}
      <p className="text-sm font-semibold">{label}</p>
      {subLabel && <p className="text-xs text-muted-foreground">{subLabel}</p>}
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
