import { useState, useEffect, type ReactNode } from "react";
import {
  DashboardFiltersContext,
  type DashboardFilters,
  defaultDashboardFilters,
  getCurrentMonthRange,
  monthRange,
  quarterRange,
  resolveYear,
  yearRange,
  PERIODE_ANNEE,
  PERIODE_MOIS_COURANT,
  PERIODE_PERSONNALISEE,
} from "./useDashboardFilters";

const STORAGE_KEY = "dashboard-v2-filters";

const trimestreMonths = (
  value: string,
): [number, number] | null => {
  switch (value) {
    case "Q1":
      return [1, 3];
    case "Q2":
      return [4, 6];
    case "Q3":
      return [7, 9];
    case "Q4":
      return [10, 12];
    default:
      return null;
  }
};

/**
 * The range a persisted `periode`/`trimestre`/`annee` triple *should* be
 * showing, or `null` when the period is free-form (`personnalisee`) or
 * unknown and the stored dates are therefore authoritative.
 */
const expectedRange = (
  periode: string,
  trimestre: string,
  annee: string,
): { dateDebut: string; dateFin: string } | null => {
  const year = resolveYear(annee, Number(defaultDashboardFilters.annee));
  if (periode === "" || periode === PERIODE_MOIS_COURANT) {
    return getCurrentMonthRange();
  }
  if (periode === PERIODE_ANNEE) {
    return yearRange(year);
  }
  const month = parseInt(periode, 10);
  if (!Number.isNaN(month) && month >= 1 && month <= 12) {
    return monthRange(year, month);
  }
  if (trimestre) {
    const months = trimestreMonths(trimestre);
    if (months) {
      return quarterRange(year, months[0], months[1]);
    }
  }
  // `personnalisee` and any unknown marker: user-owned dates.
  return null;
};

/**
 * Restore the persisted filters.
 *
 * A `dateDebut/dateFin` pair used to be restored verbatim and forever, so a
 * session opened in November still showed September, and a range persisted
 * under one `annee` survived a change of year. The dates are therefore
 * re-derived from the stored period intent: whenever the stored range does
 * not match what `periode`/`trimestre`/`annee` imply, it is rebuilt. Only a
 * `personnalisee` (free-form) range is kept as is.
 */
const getStoredFilters = (): DashboardFilters => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const current = getCurrentMonthRange();
      const storedPeriode: string = parsed?.periode ?? "";
      const storedTrimestre: string = parsed?.trimestre ?? "";
      const annee: string = parsed?.annee ?? defaultDashboardFilters.annee;
      const expected = expectedRange(storedPeriode, storedTrimestre, annee);
      const dateDebut: string = parsed?.dateDebut ?? expected?.dateDebut ?? current.dateDebut;
      const dateFin: string = parsed?.dateFin ?? expected?.dateFin ?? current.dateFin;
      const isStale =
        expected !== null &&
        (dateDebut !== expected.dateDebut || dateFin !== expected.dateFin);

      return {
        codeFiliale:
          parsed?.codeFiliale ?? defaultDashboardFilters.codeFiliale,
        codeFamille:
          parsed?.codeFamille ?? defaultDashboardFilters.codeFamille,
        dateDebut: isStale ? expected.dateDebut : dateDebut,
        dateFin: isStale ? expected.dateFin : dateFin,
        periode: storedPeriode,
        trimestre: storedTrimestre,
        annee,
        niveau: parsed?.niveau ?? defaultDashboardFilters.niveau,
      };
    }
  } catch {
    // fall through to defaults
  }
  return { ...defaultDashboardFilters };
};

export function DashboardFiltersProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [filters, setFilters] = useState<DashboardFilters>(() =>
    getStoredFilters(),
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const setCodeFiliale = (value: string) =>
    setFilters((prev) => ({ ...prev, codeFiliale: value }));

  const setCodeFamille = (value: string) =>
    setFilters((prev) => ({ ...prev, codeFamille: value }));

  const setDateDebut = (value: string) =>
    setFilters((prev) => ({ ...prev, dateDebut: value }));

  const setDateFin = (value: string) =>
    setFilters((prev) => ({ ...prev, dateFin: value }));

  const setPeriode = (value: string) => {
    setFilters((prev) => {
      const next = { ...prev, periode: value, trimestre: "" };
      if (value === PERIODE_PERSONNALISEE) {
        // the two date inputs are edited by the user right after
        return next;
      }
      const year = resolveYear(prev.annee, Number(defaultDashboardFilters.annee));
      if (value === PERIODE_ANNEE) {
        return { ...next, ...yearRange(year) };
      }
      if (value === PERIODE_MOIS_COURANT) {
        return { ...next, ...getCurrentMonthRange() };
      }
      const month = parseInt(value, 10);
      if (Number.isNaN(month) || month < 1 || month > 12) {
        // unknown marker: keep the current range untouched
        return next;
      }
      return { ...next, ...monthRange(year, month) };
    });
  };

  const setTrimestre = (value: string) => {
    setFilters((prev) => {
      const next = { ...prev, trimestre: value, periode: "" };
      const year = resolveYear(prev.annee, Number(defaultDashboardFilters.annee));
      if (!value) {
        // "Tous" = the whole year, which is what an empty `periode` means
        return { ...next, periode: PERIODE_ANNEE, ...yearRange(year) };
      }
      const months = trimestreMonths(value);
      if (!months) return next;
      const [firstMonth, lastMonth] = months;
      return { ...next, ...quarterRange(year, firstMonth, lastMonth) };
    });
  };

  const setAnnee = (value: string) => {
    setFilters((prev) => {
      // An empty (or non numeric) year is not a meaningful filter — the
      // FilterBar no longer offers to clear it. Ignore it instead of feeding
      // NaN into the date computations.
      const year = parseInt(value, 10);
      if (Number.isNaN(year)) return prev;
      const next = { ...prev, annee: value };
      if (prev.trimestre) {
        const months = trimestreMonths(prev.trimestre);
        if (!months) return next;
        const [firstMonth, lastMonth] = months;
        return { ...next, ...quarterRange(year, firstMonth, lastMonth) };
      }
      const month = parseInt(prev.periode, 10);
      if (!Number.isNaN(month) && month >= 1 && month <= 12) {
        return { ...next, ...monthRange(year, month) };
      }
      // `mois_courant` / `annee`: the range follows the whole selected year
      return { ...next, ...yearRange(year) };
    });
  };

  const setNiveau = (value: string) =>
    setFilters((prev) => ({ ...prev, niveau: value }));

  const resetFilters = () => {
    setFilters({ ...defaultDashboardFilters });
  };

  return (
    <DashboardFiltersContext.Provider
      value={{
        ...filters,
        setCodeFiliale,
        setCodeFamille,
        setDateDebut,
        setDateFin,
        setPeriode,
        setTrimestre,
        setAnnee,
        setNiveau,
        resetFilters,
      }}
    >
      {children}
    </DashboardFiltersContext.Provider>
  );
}
