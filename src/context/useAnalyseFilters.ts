import { createContext, useContext } from "react";

const STORAGE_KEY = "analyse_filters";

export interface AnalyseFilters {
  codeFiliale: string;
  dateDebut: string;
  dateFin: string;
}

export interface AnalyseFiltersContextType extends AnalyseFilters {
  setCodeFiliale: (value: string) => void;
  setDateDebut: (value: string) => void;
  setDateFin: (value: string) => void;
}

export const AnalyseFiltersContext = createContext<AnalyseFiltersContextType | undefined>(undefined);

export const getCurrentMonthRange = (): Pick<AnalyseFilters, "dateDebut" | "dateFin"> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).toISOString().split("T")[0];
  return { dateDebut: firstDay, dateFin: lastDay };
};

export const defaultFilters: AnalyseFilters = {
  codeFiliale: "P",
  ...getCurrentMonthRange(),
};

export const getStoredFilters = (): AnalyseFilters => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        codeFiliale: parsed?.codeFiliale ?? defaultFilters.codeFiliale,
        dateDebut: parsed?.dateDebut ?? defaultFilters.dateDebut,
        dateFin: parsed?.dateFin ?? defaultFilters.dateFin,
      };
    }
  } catch {
    // fall through to defaults
  }
  return defaultFilters;
};

export function useAnalyseFilters() {
  const context = useContext(AnalyseFiltersContext);
  if (!context) {
    throw new Error("useAnalyseFilters must be used within AnalyseFiltersProvider");
  }
  return context;
}
