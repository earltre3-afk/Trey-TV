export const ADMIN_ROLES = ["owner", "admin", "moderator", "legal"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_PERMISSIONS = [
  "users.ban",
  "users.gold",
  "creators.approve",
  "content.moderate",
  "reports.resolve",
  "rewards.manage",
  "legal.act",
  "platform.settings",
  "admin.manage",
  "audit.read",
] as const;
export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  owner: [...ADMIN_PERMISSIONS],
  admin: [
    "users.ban",
    "users.gold",
    "creators.approve",
    "content.moderate",
    "reports.resolve",
    "rewards.manage",
    "audit.read",
  ],
  moderator: ["users.ban", "content.moderate", "reports.resolve"],
  legal: ["legal.act", "audit.read"],
};

export function roleHasPermission(
  role: AdminRole,
  perm: AdminPermission,
  extraGrants: readonly string[] = [],
): boolean {
  if (ROLE_PERMISSIONS[role]?.includes(perm)) return true;
  return extraGrants.includes(perm);
}
