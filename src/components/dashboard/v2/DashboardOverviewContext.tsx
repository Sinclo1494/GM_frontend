import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getDashboardV2Overview } from "../../../api/dashboardV2Services";
import { filtersToParams, isAbortError } from "./screens";
import { useDashboardFilters } from "../../../hooks/useDashboardFilters";
import type { DashboardV2Overview } from "../../../types/dashboardV2";

export interface DashboardOverviewState {
  overview: DashboardV2Overview | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

const DashboardOverviewContext = createContext<DashboardOverviewState | undefined>(
  undefined,
);

/**
 * Single owner of the `/dashboard-v2/overview` payload.
 *
 * The page shell (for the HealthBar) and the Aperçu screen (for its KPI
 * cards) both need it: they used to issue their own request *and* keep their
 * own `useState` copy. Here it is fetched once per filter set and shared
 * through context, so both consumers always show the same numbers.
 *
 * `niveau` is not sent (see `filtersToParams`): the overview is fleet-scoped.
 */
export function DashboardOverviewProvider({ children }: { children: ReactNode }) {
  const filters = useDashboardFilters();
  const [overview, setOverview] = useState<DashboardV2Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Scalar deps: `filters` is a fresh object on every render of the provider's
  // parent, so depending on it would refetch on every render.
  const { codeFiliale, codeFamille, dateDebut, dateFin, niveau } = filters;
  const params = useMemo(
    () => ({ codeFiliale, codeFamille, dateDebut, dateFin, niveau }),
    [codeFiliale, codeFamille, dateDebut, dateFin, niveau],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDashboardV2Overview<DashboardV2Overview>(filtersToParams(params))
      .then((data) => {
        if (cancelled) return;
        setOverview(data);
      })
      .catch((e: unknown) => {
        if (cancelled || isAbortError(e)) return;
        setError(e instanceof Error ? e.message : "Erreur de chargement");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params, attempt]);

  const value = useMemo<DashboardOverviewState>(
    () => ({
      overview,
      loading,
      error,
      retry: () => setAttempt((n) => n + 1),
    }),
    [overview, loading, error],
  );

  return (
    <DashboardOverviewContext.Provider value={value}>
      {children}
    </DashboardOverviewContext.Provider>
  );
}

/** Overview shared by the shell HealthBar and the Aperçu screen. */
export function useDashboardOverview(): DashboardOverviewState {
  const context = useContext(DashboardOverviewContext);
  if (!context) {
    throw new Error(
      "useDashboardOverview must be used within DashboardOverviewProvider",
    );
  }
  return context;
}
