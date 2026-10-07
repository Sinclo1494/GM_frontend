import { createContext, useContext } from "react";

export interface DashboardFilters {
  codeFiliale: string;
  codeFamille: string;
  dateDebut: string;
  dateFin: string;
  periode: string;
  trimestre: string;
  annee: string;
  niveau: string;
}

export const NIVEAUX = ["engin", "famille", "chantier", "groupe"] as const;

/**
 * Explicit `periode` markers. A *named* marker (instead of the empty string)
 * is what makes the persisted filter set unambiguous: `getStoredFilters` can
 * then tell "the user never touched the period" (mois_courant) from "the user
 * asked for the whole year" (annee) and only the former is refreshed to the
 * current month when a stale range is found in localStorage.
 */
export const PERIODE_MOIS_COURANT = "mois_courant";
export const PERIODE_ANNEE = "annee";
export const PERIODE_PERSONNALISEE = "personnalisee";

const pad2 = (value: number) => String(value).padStart(2, "0");

/**
 * Local (NOT UTC) YYYY-MM-DD. `new Date(y, m, 0).toISOString()` used to build
 * the month ranges: it converts a local midnight to UTC, which on a UTC+1
 * machine turned the last day of the month into the previous day.
 */
const ymd = (y: number, m: number, d: number) =>
  `${y}-${pad2(m)}-${pad2(d)}`;

/** Number of days in a 1-based month (day 0 of the next month == last day). */
const lastDayOfMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

/** First day of the month / last day of the month, both in local time. */
export const monthRange = (
  year: number,
  month: number,
): { dateDebut: string; dateFin: string } => ({
  dateDebut: ymd(year, month, 1),
  dateFin: ymd(year, month, lastDayOfMonth(year, month)),
});

/** Current month to date (the default range of the dashboard). */
export const getCurrentMonthRange = (
  now: Date = new Date(),
): Pick<DashboardFilters, "dateDebut" | "dateFin"> => {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return {
    dateDebut: ymd(year, month, 1),
    dateFin: ymd(year, month, now.getDate()),
  };
};

export const yearRange = (
  year: number,
): Pick<DashboardFilters, "dateDebut" | "dateFin"> => ({
  dateDebut: ymd(year, 1, 1),
  dateFin: ymd(year, 12, 31),
});

export const quarterRange = (
  year: number,
  firstMonth: number,
  lastMonth: number,
): Pick<DashboardFilters, "dateDebut" | "dateFin"> => ({
  dateDebut: ymd(year, firstMonth, 1),
  dateFin: ymd(year, lastMonth, lastDayOfMonth(year, lastMonth)),
});

/**
 * `parseInt("")` is NaN, and `new Date(NaN, m, 0).toISOString()` throws a
 * RangeError that used to crash the whole render when the "Année" chip was
 * cleared. Every year coming from the UI goes through this guard.
 */
export const resolveYear = (annee: string | undefined | null, fallback: number): number => {
  const year = parseInt(String(annee ?? ""), 10);
  return Number.isNaN(year) ? fallback : year;
};

export const defaultDashboardFilters: DashboardFilters = {
  codeFiliale: "P",
  codeFamille: "",
  ...getCurrentMonthRange(),
  periode: PERIODE_MOIS_COURANT,
  trimestre: "",
  annee: String(new Date().getFullYear()),
  niveau: "engin",
};

export interface DashboardFiltersContextType extends DashboardFilters {
  setCodeFiliale: (value: string) => void;
  setCodeFamille: (value: string) => void;
  setDateDebut: (value: string) => void;
  setDateFin: (value: string) => void;
  setPeriode: (value: string) => void;
  setTrimestre: (value: string) => void;
  setAnnee: (value: string) => void;
  setNiveau: (value: string) => void;
  resetFilters: () => void;
}

export const DashboardFiltersContext =
  createContext<DashboardFiltersContextType | undefined>(undefined);

export function useDashboardFilters(): DashboardFiltersContextType {
  const context = useContext(DashboardFiltersContext);
  if (!context) {
    throw new Error(
      "useDashboardFilters must be used within DashboardFiltersProvider",
    );
  }
  return context;
}
