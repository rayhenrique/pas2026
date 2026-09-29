import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useUserRole, invalidateUserRoleCache } from "../useUserRole";

type TestRole = "superadmin" | "admin" | "coordenador" | "gestor";

const currentAuthState: { user: { id: string } | null; loading: boolean } = {
  user: null,
  loading: false,
};

vi.mock("../useAuth", () => ({
  useAuth: () => currentAuthState,
}));

const mockMaybeSingle = vi.fn();
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn((_table: string) => ({ select: mockSelect }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
  },
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

const ROLE_CACHE_KEY = "user_role_cache";

function mockDbRole(role: TestRole | null) {
  mockMaybeSingle.mockResolvedValue({
    data: role ? { role } : null,
    error: null,
  });
}

describe("useUserRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    currentAuthState.user = null;
    currentAuthState.loading = false;
    mockDbRole(null);
  });

  it("não entra em loop quando usuário não autenticado", async () => {
    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.role).toBeNull();
    expect(result.current.hasRole).toBe(false);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("deve retornar loading true enquanto auth está carregando", () => {
    currentAuthState.loading = true;
    const { result } = renderHook(() => useUserRole());
    expect(result.current.loading).toBe(true);
  });

  it("busca role do banco quando usuário autenticado", async () => {
    currentAuthState.user = { id: "user-123" };
    mockDbRole("admin");

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.role).toBe("admin");
    expect(result.current.isAdmin).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith("user_roles");
  });

  it("não reinicia loop após logout", async () => {
    currentAuthState.user = { id: "user-123" };
    mockDbRole("coordenador");

    const { result, rerender } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.role).toBe("coordenador");
    });

    currentAuthState.user = null;
    act(() => {
      rerender();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.role).toBeNull();
    });

    expect(mockFrom).toHaveBeenCalledTimes(1);
  });

  it("usa cache válido sem buscar no banco", async () => {
    currentAuthState.user = { id: "cached-user" };
    localStorageMock.setItem(
      ROLE_CACHE_KEY,
      JSON.stringify({
        userId: "cached-user",
        role: "superadmin",
        timestamp: Date.now(),
      })
    );

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.role).toBe("superadmin");
    expect(result.current.isSuperadmin).toBe(true);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("cache expirado força refetch e refreshRole atualiza valor", async () => {
    currentAuthState.user = { id: "exp-user" };
    localStorageMock.setItem(
      ROLE_CACHE_KEY,
      JSON.stringify({
        userId: "exp-user",
        role: "gestor",
        timestamp: Date.now() - 10 * 60 * 1000,
      })
    );
    mockDbRole("admin");

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.role).toBe("admin");
    });

    mockDbRole("superadmin");
    await act(async () => {
      result.current.refreshRole();
    });

    await waitFor(() => {
      expect(result.current.role).toBe("superadmin");
    });
    expect(mockFrom).toHaveBeenCalledTimes(2);
  });

  it("invalidateUserRoleCache limpa localStorage", () => {
    localStorageMock.setItem(ROLE_CACHE_KEY, JSON.stringify({ role: "admin" }));
    invalidateUserRoleCache();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(ROLE_CACHE_KEY);
  });
});
