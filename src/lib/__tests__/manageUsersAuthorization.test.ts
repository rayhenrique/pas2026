import { describe, it, expect } from "vitest";
import {
  canBootstrapPrivilegedUser,
  canManageTargetRole,
  isAppRole,
  isPrivilegedRole,
  requiresPrivilegedRole,
  type ManageUsersAction,
} from "../../../supabase/functions/manage-users/authorization";

describe("manage-users authorization helpers", () => {
  it("bloqueia ações administrativas para não-privilegiado", () => {
    const protectedActions: ManageUsersAction[] = [
      "list",
      "create",
      "update",
      "toggle-status",
      "reset-password",
    ];

    protectedActions.forEach((action) => {
      expect(requiresPrivilegedRole(action)).toBe(true);
      expect(isPrivilegedRole(null)).toBe(false);
      expect(isPrivilegedRole("gestor")).toBe(false);
    });
  });

  it("bootstrap só é permitido quando não existe admin/superadmin", () => {
    expect(canBootstrapPrivilegedUser(0)).toBe(true);
    expect(canBootstrapPrivilegedUser(1)).toBe(false);
    expect(canBootstrapPrivilegedUser(5)).toBe(false);
  });

  it("superadmin pode operar em superadmin e admin não pode", () => {
    expect(canManageTargetRole("superadmin", "superadmin")).toBe(true);
    expect(canManageTargetRole("admin", "superadmin")).toBe(false);
    expect(canManageTargetRole("admin", "admin")).toBe(true);
    expect(canManageTargetRole("admin", "gestor")).toBe(true);
  });

  it("aceita somente papéis conhecidos pela aplicação", () => {
    expect(isAppRole("admin")).toBe(true);
    expect(isAppRole("coordenador")).toBe(true);
    expect(isAppRole("root")).toBe(false);
    expect(isAppRole(null)).toBe(false);
  });
});
