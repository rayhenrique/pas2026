export type AppRole = "superadmin" | "admin" | "coordenador" | "gestor" | null;
export type ManageUsersAction =
  | "create"
  | "update"
  | "list"
  | "toggle-status"
  | "reset-password"
  | "make-admin";

const PRIVILEGED_ROLES = new Set(["admin", "superadmin"]);

export function isPrivilegedRole(role: AppRole): boolean {
  return role !== null && PRIVILEGED_ROLES.has(role);
}

export function canBootstrapPrivilegedUser(privilegedUserCount: number): boolean {
  return privilegedUserCount === 0;
}

export function requiresPrivilegedRole(action: ManageUsersAction): boolean {
  return action !== "make-admin";
}

export function canManageTargetRole(callerRole: AppRole, targetRole: AppRole): boolean {
  if (targetRole === "superadmin") {
    return callerRole === "superadmin";
  }

  return true;
}
