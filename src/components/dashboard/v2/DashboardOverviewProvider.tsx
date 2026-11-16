import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getDashboardV2Overview } from "../../../api/dashboardV2Services";
import { filtersToParams, isAbortError } from "./screens";
import { useDashboardFilters } from "../../../hooks/useDashboardFilters";
import type { DashboardV2Overview } from "../../../types/dashboardV2";
import {
  DashboardOverviewContext,
  type DashboardOverviewState,
} from "./DashboardOverviewContext";

export function DashboardOverviewProvider({
  children,
}: { children: ReactNode }) {
  const filters = useDashboardFilters();
  const [overview, setOverview] = useState<DashboardV2Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

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
