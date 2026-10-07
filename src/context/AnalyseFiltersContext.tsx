import { useState, useEffect, type ReactNode } from "react";
import {
  AnalyseFiltersContext,
  getStoredFilters,
  type AnalyseFilters,
} from "./useAnalyseFilters";

const STORAGE_KEY = "analyse_filters";

export function AnalyseFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<AnalyseFilters>(() => getStoredFilters());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const setCodeFiliale = (value: string) => setFilters((prev) => ({ ...prev, codeFiliale: value }));
  const setDateDebut = (value: string) => setFilters((prev) => ({ ...prev, dateDebut: value }));
  const setDateFin = (value: string) => setFilters((prev) => ({ ...prev, dateFin: value }));

  return (
    <AnalyseFiltersContext.Provider value={{ ...filters, setCodeFiliale, setDateDebut, setDateFin }}>
      {children}
    </AnalyseFiltersContext.Provider>
  );
}
