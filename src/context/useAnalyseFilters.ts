import { createContext, useContext } from "react";
import { getDefaultTwoMonthsAgoRange as getDefaultRange, loadWithTimestamp } from "../utils/dateUtils";

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
  // Fallback affiliate for users allowed to query every affiliate database.
  // A user locked to a single affiliate gets their own code instead, see
  // `lockedFiliale` and `AnalyseFiltersProvider`.
  codeFiliale: "P",
  ...getDefaultRange(),
};

export const getStoredFilters = (): AnalyseFilters => {
  const parsed = loadWithTimestamp<Partial<AnalyseFilters>>(STORAGE_KEY);
  if (parsed) {
    return {
      codeFiliale: parsed.codeFiliale ?? defaultFilters.codeFiliale,
      dateDebut: parsed.dateDebut ?? defaultFilters.dateDebut,
      dateFin: parsed.dateFin ?? defaultFilters.dateFin,
    };
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
