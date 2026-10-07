import {
  useDashboardFilters as useDashboardFiltersContext,
  type DashboardFiltersContextType,
  defaultDashboardFilters,
  NIVEAUX,
} from "../context/useDashboardFilters";

export type { DashboardFiltersContextType };

// Backwards-compatible alias used by the v2 screens.
export type DashboardFiltersState = DashboardFiltersContextType;

export const useDashboardFilters = useDashboardFiltersContext;
export { defaultDashboardFilters, NIVEAUX };