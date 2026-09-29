import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { SelectedYear, YEAR_OPTIONS } from "@/types/pas";

interface SelectedYearContextType {
  selectedYear: SelectedYear;
  setSelectedYear: (year: SelectedYear) => void;
  availableYears: readonly SelectedYear[];
}

const SelectedYearContext = createContext<SelectedYearContextType | undefined>(undefined);

export function SelectedYearProvider({ children }: { children: ReactNode }) {
  const { settings, loading } = useAppSettings();
  const [selectedYear, setSelectedYear] = useState<SelectedYear>(2026);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized || loading) return;

    const candidate = settings?.current_year;
    if (candidate && YEAR_OPTIONS.includes(candidate as SelectedYear)) {
      setSelectedYear(candidate as SelectedYear);
    }

    setInitialized(true);
  }, [initialized, loading, settings?.current_year]);

  const value = useMemo(
    () => ({
      selectedYear,
      setSelectedYear,
      availableYears: YEAR_OPTIONS,
    }),
    [selectedYear],
  );

  return <SelectedYearContext.Provider value={value}>{children}</SelectedYearContext.Provider>;
}

export function useSelectedYear() {
  const context = useContext(SelectedYearContext);
  if (!context) {
    throw new Error("useSelectedYear deve ser usado dentro de SelectedYearProvider");
  }
  return context;
}
