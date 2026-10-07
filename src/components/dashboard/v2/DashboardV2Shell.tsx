import { Suspense, useMemo, type ReactNode } from "react";
import { useDashboardFilters } from "../../../hooks/useDashboardFilters";
import FilterBar from "./FilterBar";
import HealthBar from "./HealthBar";
// Imported from the concrete modules, not from "./index": the barrel re-exports
// this file, so going through it would create an import cycle.
import {
  LoadingSpinner,
  ErrorBox,
  computeActiveChips,
  computeVisibleFilters,
  filtersToV1,
  healthKpisFromOverview,
  makeFilterHandler,
  useFilialesFamelles,
} from "./screens/_shared";
import {
  DashboardOverviewProvider,
  useDashboardOverview,
} from "./DashboardOverviewContext";
import type { DashboardV2FilterKey } from "./FilterBar";

export type DashboardTabId =
  | "apercu"
  | "situation"
  | "disponibilite"
  | "maintenance"
  | "rendement"
  | "finances"
  | "parc";

/**
 * Ordered controls of each tab.
 *
 * `niveau` only appears where an endpoint actually groups by it
 * (`/disponibilite`, `/maintenance`, `/rendement`, `/finances`); the overview,
 * situation and filiale-stats endpoints ignore it, so offering it on those tabs
 * would promise a filter that does nothing. `trimestre` only appears where the
 * underlying series is quarterly (rentabilite).
 */
export const TAB_FILTERS: Record<DashboardTabId, DashboardV2FilterKey[]> = {
  apercu: ["code_filiale", "code_famille", "periode", "trimestre", "annee"],
  situation: ["code_filiale", "code_famille", "periode", "annee"],
  disponibilite: ["code_filiale", "code_famille", "periode", "annee", "niveau"],
  maintenance: ["code_filiale", "code_famille", "periode", "annee", "niveau"],
  rendement: ["code_filiale", "code_famille", "periode", "annee", "niveau"],
  finances: ["code_filiale", "code_famille", "periode", "trimestre", "annee", "niveau"],
  parc: ["code_filiale", "code_famille", "periode", "annee"],
};

export interface DashboardV2ShellProps {
  title: string;
  subtitle?: string;
  tabs: { id: DashboardTabId; label: string }[];
  activeTab: DashboardTabId;
  onTabChange: (id: DashboardTabId) => void;
  renderTab: () => ReactNode;
}

/**
 * Shared chrome of the dashboard v2 pages: FilterBar + HealthBar + the tab bar
 * + the Suspense boundary of the lazy screens, and the single owner of the
 * `/overview` payload.
 *
 * Both `pages/NewDashboard` (/reports/dashboard-v2) and `pages/DashboardV2`
 * (/dashboard-v2) render this instead of duplicating the chrome — the second
 * route used to have neither a FilterBar (frozen on the last persisted
 * filters) nor a HealthBar (invisible KPIs).
 */
export default function DashboardV2Shell({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  renderTab,
}: DashboardV2ShellProps) {
  return (
    <DashboardOverviewProvider>
      <ShellBody
        title={title}
        subtitle={subtitle}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        renderTab={renderTab}
      />
    </DashboardOverviewProvider>
  );
}

function ShellBody({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  renderTab,
}: DashboardV2ShellProps) {
  const filters = useDashboardFilters();
  const { filiales, familles } = useFilialesFamelles();
  const { overview, error, retry } = useDashboardOverview();

  const tabFilters = TAB_FILTERS[activeTab];
  // Depend on the scalar fields: `filters` is a new object on every render of
  // the provider, so a memo depending on it would never cache.
  const { codeFiliale, codeFamille, periode, trimestre, annee, niveau, dateDebut, dateFin } = filters;
  const chipKey = `${codeFiliale}|${codeFamille}|${periode}|${trimestre}|${annee}|${niveau}|${dateDebut}|${dateFin}`;

  const visibleFilters = useMemo(
    () => computeVisibleFilters(tabFilters, periode),
    [tabFilters, periode],
  );
  // `chipKey` is the serialized filter state: it changes whenever any field
  // used below changes, which is more precise than listing every field.
  const barFilters = useMemo(
    () => filtersToV1(filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chipKey],
  );
  const activeChips = useMemo(
    () => computeActiveChips(filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chipKey],
  );

  // The provider recreates its setters only when the filter state actually
  // changes, so depending on them keeps the handler (and therefore the
  // `React.memo` FilterBar) stable across unrelated re-renders.
  const {
    setCodeFiliale,
    setCodeFamille,
    setDateDebut,
    setDateFin,
    setPeriode,
    setTrimestre,
    setAnnee,
    setNiveau,
    resetFilters,
  } = filters;

  const handleFilterChange = useMemo(
    () =>
      makeFilterHandler({
        setCodeFiliale,
        setCodeFamille,
        setDateDebut,
        setDateFin,
        setPeriode,
        setTrimestre,
        setAnnee,
        setNiveau,
      }),
    [
      setCodeFiliale,
      setCodeFamille,
      setDateDebut,
      setDateFin,
      setPeriode,
      setTrimestre,
      setAnnee,
      setNiveau,
    ],
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <div className="border-b border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card">
        <div className="p-6">
          <div className="mx-auto w-full">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <FilterBar
              filters={barFilters}
              visibleFilters={visibleFilters}
              onChange={handleFilterChange}
              onReset={resetFilters}
              activeChips={activeChips}
              filiales={filiales}
              familles={familles}
            />

            <HealthBar kpis={healthKpisFromOverview(overview)} />

            {error && (
              <div className="mt-4">
                <ErrorBox message={error} onRetry={retry} />
              </div>
            )}

            <div className="mt-4 overflow-x-auto bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-bg-secondary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mx-auto w-full">
          <Suspense fallback={<LoadingSpinner />}>{renderTab()}</Suspense>
        </div>
      </div>
    </div>
  );
}
