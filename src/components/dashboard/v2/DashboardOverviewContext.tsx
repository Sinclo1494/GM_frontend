import { createContext } from "react";
import type { DashboardV2Overview } from "../../../types/dashboardV2";

export interface DashboardOverviewState {
  overview: DashboardV2Overview | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export const DashboardOverviewContext =
  createContext<DashboardOverviewState | undefined>(undefined);
