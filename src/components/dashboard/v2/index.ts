export { default as KpiCard } from "./KpiCard";
export type { KpiStatus, KpiCardProps } from "./KpiCard";

export { default as DonutChart } from "./DonutChart";
export type { DonutChartDataset, DonutChartProps } from "./DonutChart";

export { default as HealthBar } from "./HealthBar";
export type { HealthBarKpis } from "./HealthBar";

export { default as SmallMultiples } from "./SmallMultiples";
export type { SmallMultipleItem, SmallMultiplesProps } from "./SmallMultiples";

export { default as BreakdownTable } from "./BreakdownTable";
export type {
  BreakdownStatus,
  BreakdownColumn,
  BreakdownTableProps,
} from "./BreakdownTable";

export { default as FilterBar } from "./FilterBar";
export type {
  FilterBarProps,
  FilterChip,
  FilterOption,
  DashboardV2FilterKey,
  DashboardV2FilterValues,
} from "./FilterBar";

export { default as DashboardV2Shell } from "./DashboardV2Shell";
export type { DashboardV2ShellProps } from "./DashboardV2Shell";
export type { DashboardTabId } from "./dashboardTabs";
export { TAB_FILTERS } from "./dashboardTabs";

export { useDashboardOverview } from "./useDashboardOverview";
export { DashboardOverviewProvider } from "./DashboardOverviewProvider";
export type { DashboardOverviewState } from "./DashboardOverviewContext";

export { DASHBOARD_TARGETS } from "./dashboardTargets";
export type { DashboardTargets } from "./dashboardTargets";

export { ChartJS, SITUATION_COLORS, PALETTE_VALUES } from "./ChartSetup";

export {
  useDashboardFilters,
  defaultDashboardFilters,
  NIVEAUX,
} from "../../../hooks/useDashboardFilters";

export type { DashboardFiltersState } from "../../../hooks/useDashboardFilters";

export {
  isAbortError,
  isMissing,
  fmt,
  fmtNumber,
  fmtMillions,
  pct,
  safePct,
  Section,
  StatusBadge,
  AmberBadge,
  NiveauLabel,
  NiveauHeader,
  LoadingSpinner,
  ErrorBox,
  filtersToParams,
  filtersToV1,
  makeFilterHandler,
  useFilialesFamelles,
  healthKpisFromOverview,
  formatMonth,
  formatQuarter,
  computeActiveChips,
  computeVisibleFilters,
} from "./screens";

export type {
  ScreenFilterChip,
  FilterSetters,
  FilterBarValues,
  FilterParamsOptions,
  DashboardFiltersPick,
} from "./screens";

export {
  ApercuScreen,
  DisponibiliteScreen,
  MaintenanceScreen,
  RendementScreen,
  FinancesScreen,
  ParcScreen,
} from "./screens";
