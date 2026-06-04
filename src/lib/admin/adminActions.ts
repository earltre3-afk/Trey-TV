import type { AdminPermission } from "./permissions.ts";

export type AdminActionName = "users.status" | "users.gold" | "users.creator";

export interface AdminActionSpec {
  path: string;
  method: "POST";
  requiredPermission: AdminPermission;
}

export const ADMIN_ACTIONS: Record<AdminActionName, AdminActionSpec> = {
  "users.status": { path: "/api/admin/users/status", method: "POST", requiredPermission: "users.ban" },
  "users.gold": { path: "/api/admin/users/gold", method: "POST", requiredPermission: "users.gold" },
  "users.creator": { path: "/api/admin/users/creator", method: "POST", requiredPermission: "creators.approve" },
};

export function requiredPermissionFor(action: AdminActionName): AdminPermission | null {
  return ADMIN_ACTIONS[action]?.requiredPermission ?? null;
}
