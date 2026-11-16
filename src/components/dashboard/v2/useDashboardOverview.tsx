import { useContext } from "react";
import { DashboardOverviewContext, type DashboardOverviewState } from "./DashboardOverviewContext";

export function useDashboardOverview(): DashboardOverviewState {
  const context = useContext(DashboardOverviewContext);
  if (!context) {
    throw new Error(
      "useDashboardOverview must be used within DashboardOverviewProvider",
    );
  }
  return context;
}
