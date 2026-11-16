export { default as ApercuScreen } from "./ApercuScreen";
export { default as DisponibiliteScreen } from "./DisponibiliteScreen";
export { default as MaintenanceScreen } from "./MaintenanceScreen";
export { default as RendementScreen } from "./RendementScreen";
export { default as FinancesScreen } from "./FinancesScreen";
export { default as ParcScreen } from "./ParcScreen";

// Re-export the shared helpers so the v2 barrel can import them from
// "./screens" instead of reaching into the private "_shared" module.
export {
  isAbortError,
  isMissing,
  fmt,
  fmtNumber,
  fmtMillions,
  pct,
  safePct,
  NiveauLabel,
  NiveauHeader,
  filtersToParams,
  filtersToV1,
  makeFilterHandler,
  useFilialesFamelles,
  healthKpisFromOverview,
  formatMonth,
  formatQuarter,
  computeActiveChips,
  computeVisibleFilters,
} from "./_sharedUtils";
export {
  Section,
  StatusBadge,
  AmberBadge,
  LoadingSpinner,
  ErrorBox,
} from "./_sharedComponents";
export type {
  ScreenFilterChip,
  FilterSetters,
  FilterBarValues,
  FilterParamsOptions,
  DashboardFiltersPick,
} from "./_sharedUtils";
