import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReactNode } from "react";
import { SelectedYearProvider, useSelectedYear } from "../SelectedYearContext";

const appSettingsState = {
  loading: false,
  settings: {
    current_year: 2028,
  },
};

vi.mock("../AppSettingsContext", () => ({
  useAppSettings: () => appSettingsState,
}));

function Wrapper({ children }: { children: ReactNode }) {
  return <SelectedYearProvider>{children}</SelectedYearProvider>;
}

describe("SelectedYearContext", () => {
  it("inicializa o ano selecionado a partir do app_settings", () => {
    const { result } = renderHook(() => useSelectedYear(), { wrapper: Wrapper });
    expect(result.current.selectedYear).toBe(2028);
    expect(result.current.availableYears).toEqual([2026, 2027, 2028, 2029]);
  });

  it("permite alterar o ano sem ser sobrescrito depois da inicialização", () => {
    const { result, rerender } = renderHook(() => useSelectedYear(), { wrapper: Wrapper });

    act(() => {
      result.current.setSelectedYear(2029);
    });

    appSettingsState.settings.current_year = 2026;
    rerender();

    expect(result.current.selectedYear).toBe(2029);
  });
});
