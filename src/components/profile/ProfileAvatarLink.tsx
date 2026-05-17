import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { AvatarWithFallback } from "@/components/brand/DefaultAvatar";
import { isPublicProfileUid } from "@/lib/profile-links";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export function ProfilePictureLink({
  publicProfileUid,
  label,
  className = "",
  children,
}: {
  publicProfileUid?: string | null;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const uid = publicProfileUid?.trim();
  if (!uid || !isPublicProfileUid(uid)) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      to="/u/$uid"
      params={{ uid }}
      className={className}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      {children}
    </Link>
  );
}

export function ProfileAvatarLink({
  publicProfileUid,
  src,
  name,
  uid,
  size = "md",
  className = "",
  avatarClassName = "",
  label,
}: {
  publicProfileUid?: string | null;
  src?: string | null;
  name?: string;
  uid?: string;
  size?: AvatarSize;
  className?: string;
  avatarClassName?: string;
  label?: string;
}) {
  const accessibleLabel = label || (name ? `Open ${name}'s public profile` : "Open public profile");
  return (
    <ProfilePictureLink publicProfileUid={publicProfileUid} label={accessibleLabel} className={className}>
      <AvatarWithFallback
        src={src}
        alt={name ? `${name}'s profile photo` : "Profile photo"}
        name={name}
        uid={uid || publicProfileUid || undefined}
        size={size}
        className={avatarClassName}
      />
    </ProfilePictureLink>
  );
}
