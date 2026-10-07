export { default as ApercuScreen } from "./ApercuScreen";
export { default as SituationScreen } from "./SituationScreen";
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
} from "./_shared";
export type {
  ScreenFilterChip,
  FilterSetters,
  FilterBarValues,
  FilterParamsOptions,
  DashboardFiltersPick,
} from "./_shared";