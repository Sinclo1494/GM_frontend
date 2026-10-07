import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import CrudTable from "../../../Crud/CrudTable";
import type { ColumnDef } from "../../../Crud/CrudTable";
import PaginationControls from "../../../common/PaginationControls";
import {
  Section,
  LoadingSpinner,
  ErrorBox,
  useDashboardFilters,
  filtersToParams,
  fmtNumber,
  isAbortError,
} from "../index";
import { getDashboardV2FilialeStats, getMaterialDetails } from "../../../../api/dashboardV2Services";
import type { DashboardV2Params } from "../../../../api/dashboardV2Services";
import type { DashboardV2FilialeStat } from "../../../../types/dashboardV2";
import type { DashboardMaterialDetailsResponse } from "../../../../types/dashboard";
import AnalyseQuantitative from "../../../../pages/AnalyseQuantitative";
import AnalyseExploitation from "../../../../pages/AnalyseExploitation";
import JournalMateriel from "../../../../pages/JournalMateriel";

type SubTabId = "engins" | "groupe" | "analyse_quantitative" | "analyse_exploitation" | "journal";

const SUB_TABS: { id: SubTabId; label: string }[] = [
  { id: "engins", label: "ENGINS" },
  { id: "groupe", label: "GROUPE" },
  { id: "analyse_quantitative", label: "ANALYSE QUANTITATIVE" },
  { id: "analyse_exploitation", label: "ANALYSE EXPLOITATION" },
  { id: "journal", label: "JOURNAL MATÉRIEL" },
];

interface EnginsTabProps {
  params: DashboardV2Params;
  onRetry: () => void;
}

const EnginsTab = ({ params: baseParams }: EnginsTabProps) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [data, setData] = useState<DashboardMaterialDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [columnFiltersInput, setColumnFiltersInput] = useState<Record<string, string>>({});
  const columnFilterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasActiveColumnFilters = useMemo(
    () => Object.values(columnFilters).some((v) => v !== ""),
    [columnFilters]
  );

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const hasFilters = Object.values(columnFilters).some((v) => v !== "");
      const params: Record<string, string | number> = {
        ...baseParams,
        page: hasFilters ? 1 : page,
        page_size: hasFilters ? 1000 : 50,
      };
      if (search) params.search = search;

      const result = await getMaterialDetails(params);
      setData(result);
    } catch (err) {
      if (!isAbortError(err)) {
        const message =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
              "Erreur lors du chargement des détails matériel.";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [baseParams, search, page, columnFilters]);

  const handleColumnFilterChange = useCallback((param: string, value: string) => {
    setColumnFiltersInput((prev) => ({ ...prev, [param]: value }));
    if (columnFilterTimerRef.current) {
      clearTimeout(columnFilterTimerRef.current);
    }
    columnFilterTimerRef.current = setTimeout(() => {
      setColumnFilters((prev) => ({ ...prev, [param]: value }));
      setPage(1);
    }, 300);
  }, []);

  const clearColumnFilters = useCallback(() => {
    if (columnFilterTimerRef.current) {
      clearTimeout(columnFilterTimerRef.current);
    }
    setColumnFiltersInput({});
    setColumnFilters({});
    setPage(1);
  }, []);

  useEffect(() => {
    const run = fetchDetails();
    return () => {
      run.catch(() => {});
    };
  }, [fetchDetails]);

  const sortedItems = useMemo<Record<string, unknown>[]>(() => {
    if (!data?.items) return [];
    const items: Record<string, unknown>[] = data.items.map((item) => ({
      ...item,
    }));
    if (sortField) {
      items.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        if (typeof aVal === "string") {
          const cmp = aVal.localeCompare(bVal as string);
          return sortOrder === "asc" ? cmp : -cmp;
        }
        return sortOrder === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      });
    }
    return items;
  }, [data, sortField, sortOrder]);

  const columns: ColumnDef<Record<string, unknown>>[] = [
    { key: "code_materiel", label: "Code", sortable: true, filter: { param: "code_materiel" } },
    { key: "designation", label: "Désignation", sortable: true, filter: { param: "designation" } },
    { key: "libelle_famille", label: "Famille", filter: { param: "libelle_famille" } },
    { key: "libelle_sous_famille", label: "Sous-Famille", filter: { param: "libelle_sous_famille" } },
    { key: "libelle_type_marque", label: "Type", filter: { param: "libelle_type_marque" } },
    { key: "libelle_filiale", label: "Filiale", filter: { param: "libelle_filiale" } },
    {
      key: "est_bloque",
      label: "Statut",
      filter: { type: "select", param: "est_bloque", options: [{ value: "false", label: "Actif" }, { value: "true", label: "Bloqué" }] },
      render: (value: unknown) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            value
              ? "bg-red-100 dark:bg-red-900/30 text-red-700"
              : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
          }`}
        >
          {value ? "Inactif" : "Actif"}
        </span>
      ),
    },
  ];

  return (
    <Section title="Détail du matériel">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary">
          Materiel
        </h3>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Rechercher par code, designation, type..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-dark-text-primary"
          />
        </div>
      </div>

      {error && <ErrorBox message={error} onRetry={fetchDetails} />}

      <CrudTable
        columns={columns}
        data={sortedItems}
        loading={loading}
        error={error}
        searchTerm={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={(field) => {
          setSortField((prev) => (prev === field ? null : field));
          setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        }}
        currentPage={page}
        onPageChange={setPage}
        itemsPerPage={50}
        onItemsPerPageChange={() => {}}
        onRetry={fetchDetails}
        totalItems={data?.total}
        emptyMessage="Aucun materiel trouve."
        title=""
        searchPlaceholder="Rechercher..."
        columnFilters={columnFiltersInput}
        onColumnFilterChange={handleColumnFilterChange}
        onResetColumnFilters={hasActiveColumnFilters ? clearColumnFilters : undefined}
        enableLocalFiltering={true}
      />
    </Section>
  );
};

interface GroupeTabProps {
  filialeStats: DashboardV2FilialeStat[];
}

const GroupeTab = ({ filialeStats }: GroupeTabProps) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (filialeStats.length > 0) setPage(1);
  }, [filialeStats.length]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filialeStats.slice(start, start + pageSize);
  }, [filialeStats, page, pageSize]);

  return (
    <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary px-6 py-4 border-b border-slate-200 dark:border-dark-border">
        Vue par groupe / filiale
      </h2>
      {filialeStats.length === 0 ? (
        <p className="text-center py-12 text-gray-500 dark:text-dark-text-secondary">
          Aucune filiale disponible.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-dark-bg-secondary">
                <th className="px-4 py-3">Filiale</th>
                <th className="px-4 py-3">Total Materiel</th>
                <th className="px-4 py-3">Total Affectations</th>
                <th className="px-4 py-3">Heures Service</th>
                <th className="px-4 py-3">Total Pointages</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((f, idx) => (
                <tr
                  key={f.code_filiale}
                  className={idx % 2 === 0 ? "bg-white dark:bg-dark-card" : "bg-slate-50/50 dark:bg-dark-bg-secondary/50"}
                >
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-dark-text-primary">
                    {f.libelle_filiale}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-dark-text-primary">
                    {fmtNumber(f.totalMateriel)}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-dark-text-primary">
                    {fmtNumber(f.totalAffectations)}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-dark-text-primary">
                    {fmtNumber(f.totalHeuresService, 1)}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-dark-text-primary">
                    {fmtNumber(f.totalPointages)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filialeStats.length > 0 && (
        <PaginationControls
          currentPage={page}
          totalPages={Math.max(1, Math.ceil(filialeStats.length / pageSize))}
          totalItems={filialeStats.length}
          itemsPerPage={pageSize}
          onPageChange={setPage}
          onItemsPerPageChange={setPageSize}
          showItemCount={true}
        />
      )}
    </div>
  );
};

function ParcScreenImpl() {
  const filters = useDashboardFilters();

  const { codeFiliale, codeFamille, dateDebut, dateFin } = filters;
  const params = useMemo(
    () => filtersToParams(filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [codeFiliale, codeFamille, dateDebut, dateFin],
  );

  const [filialeStats, setFilialeStats] = useState<DashboardV2FilialeStat[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>("engins");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // `/filiale-stats` is fleet-scoped: no `niveau` is sent.
      const stats = await getDashboardV2FilialeStats(params);
      setFilialeStats(stats as DashboardV2FilialeStat[]);
    } catch (e) {
      if (isAbortError(e as unknown)) return;
      const message =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement du tableau de bord PARC.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBox message={error} onRetry={fetchData} />;

  return (
    <div className="min-w-0">
      <div className="flex gap-1 mb-4 overflow-x-auto bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg p-1">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-all ${
              activeSubTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-bg-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === "engins" && <EnginsTab params={params} onRetry={fetchData} />}

      {activeSubTab === "groupe" && (
        <GroupeTab
          filialeStats={filialeStats ?? []}
        />
      )}

      {activeSubTab === "analyse_quantitative" && <AnalyseQuantitative />}
      {activeSubTab === "analyse_exploitation" && <AnalyseExploitation />}
      {activeSubTab === "journal" && <JournalMateriel />}
    </div>
  );
}

const ParcScreen = React.lazy(() => Promise.resolve({ default: ParcScreenImpl }));

export default ParcScreen;
