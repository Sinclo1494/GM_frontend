import { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { components } from "../theme/components";
import { getDashboard, getFiliales, getFamilles, getMaterialDetails } from "../api/dataServices";
import formatCurrency from "../utils/FormatCurrency";
import JournalMateriel from "./JournalMateriel";
import AnalyseQuantitative from "./AnalyseQuantitative";
import AnalyseExploitation from "./AnalyseExploitation";
import type {
  DashboardData,
  DashboardFilters,
  DashboardAlert,
} from "../types/dashboard";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { Search } from "lucide-react";
import CrudTable from "../components/Crud/CrudTable";
import type { ColumnDef } from "../components/Crud/CrudTable";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
);

const SITUATION_COLORS: Record<string, string> = {
  "01": "#22c55e",
  "02": "#f59e0b",
  "03": "#ef4444",
  "04": "#3b82f6",
  "05": "#6b7280",
  "06": "#8b5cf6",
  "ALREM": "#ec4899",
};

const getSituationColor = (code: string, index: number) => {
  if (SITUATION_COLORS[code]) return SITUATION_COLORS[code];
  const palette = ["#6366f1", "#14b8a6", "#f97316", "#84cc16", "#06b6d4"];
  return palette[index % palette.length];
};

const formatMonthLabel = (isoDate: string | null) => {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
};

const formatNumber = (value: number | null | undefined, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return Number(value).toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatCurrencyValue = (value: number | null | undefined) => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return formatCurrency(value);
};

type TabId = "kpi" | "synthese" | "rendement" | "financier" | "tendances" | "engins" | "groupe" | "journal" | "analyse_quantitative" | "analyse_exploitation";

const TABS: { id: TabId; label: string }[] = [
  { id: "kpi", label: "KPI" },
  { id: "synthese", label: "SYNTHÈSE" },
  { id: "rendement", label: "RENDEMENT" },
  { id: "financier", label: "FINANCIER" },
  { id: "tendances", label: "TENDANCES" },
  { id: "engins", label: "ENGINS" },
  { id: "groupe", label: "GROUPE" },
  { id: "journal", label: "JOURNAL MATÉRIEL" },
  { id: "analyse_quantitative", label: "ANALYSE QUANTITATIVE" },
  { id: "analyse_exploitation", label: "ANALYSE EXPLOITATION" },
];

const today = new Date().toISOString().split("T")[0];
const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filiales, setFiliales] = useState<{ value: string; label: string }[]>([]);
  const [familles, setFamilles] = useState<{ value: string; label: string }[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("kpi");

  const [filters, setFilters] = useState<DashboardFilters>({
    code_filiale: "",
    date_debut: oneYearAgo,
    date_fin: today,
    code_famille: "",
    periode: "",
    mode: "standard",
  });

  const [materialDetails, setMaterialDetails] = useState<any | null>(null);
  const [materialLoading, setMaterialLoading] = useState(false);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialPage, setMaterialPage] = useState(1);
  const [materialSortField, setMaterialSortField] = useState<string | null>(null);
  const [materialSortOrder, setMaterialSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const sortedItems = useMemo(() => {
    if (!materialDetails?.items) return [];
    let items = [...materialDetails.items];
    if (materialSortField) {
      items.sort((a: any, b: any) => {
        const aVal = a[materialSortField];
        const bVal = b[materialSortField];
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        if (typeof aVal === "string") {
          const cmp = aVal.localeCompare(bVal as string);
          return materialSortOrder === "asc" ? cmp : -cmp;
        }
        return materialSortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });
    }
    return items;
  }, [materialDetails, materialSortField, materialSortOrder]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardData, filialesData, famillesData] = await Promise.all([
        getDashboard(filters),
        getFiliales(),
        getFamilles(),
      ]);
      setData(dashboardData);
      setFiliales(filialesData);
      setFamilles(famillesData);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string; detail?: string } } })?.response?.data?.message ??
            (err as { response?: { data?: { message?: string; detail?: string } } })?.response?.data?.detail ??
            "Erreur lors du chargement du tableau de bord.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchMaterialDetails = useCallback(async () => {
    if (activeTab !== "engins") return;
    setMaterialLoading(true);
    setMaterialError(null);
    try {
      const params: Record<string, string | number> = {};
      if (filters.code_filiale) params.code_filiale = filters.code_filiale;
      if (filters.date_debut) params.date_debut = filters.date_debut;
      if (filters.date_fin) params.date_fin = filters.date_fin;
      if (filters.code_famille) params.code_famille = filters.code_famille;
      if (materialSearch) params.search = materialSearch;
      params.page = materialPage;
      params.page_size = 50;

      const result = await getMaterialDetails(params);
      setMaterialDetails(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string; detail?: string } } })?.response?.data?.message ??
            "Erreur lors du chargement des détails matériel.";
      setMaterialError(message);
    } finally {
      setMaterialLoading(false);
    }
  }, [activeTab, filters, materialSearch, materialPage]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchMaterialDetails();
  }, [fetchMaterialDetails]);

  const updateFilter = (key: keyof DashboardFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAlertClick = (alert: DashboardAlert) => {
    if (alert.href) {
      navigate(alert.href);
    }
  };

  const resetFilters = () => {
    setFilters({
      code_filiale: "",
      date_debut: oneYearAgo,
      date_fin: today,
      code_famille: "",
      periode: "",
      mode: "standard",
    });
    setMaterialSearch("");
    setMaterialPage(1);
    setExpandedRows(new Set());
  };

  const toggleRow = (code: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const overview = data?.overview;
  const situationDist = data?.situationDistribution ?? [];
  const pointageEvol = data?.pointageEvolution ?? [];
  const filialeStats = data?.filialeStats ?? [];
  const alerts = data?.alerts ?? [];
  const recentActivity = data?.recentActivity ?? [];

  const situationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    situationDist.forEach((d) => {
      counts[d.code_type_situation] = d.count;
    });
    return counts;
  }, [situationDist]);

  const enService = situationCounts["01"] ?? 0;
  const enChomage = situationCounts["02"] ?? 0;
  const enPanne = situationCounts["03"] ?? 0;
  const parcTotal = overview?.totalMateriel ?? 0;

  const situationChartData = {
    labels: situationDist.map((d) => d.libelle_type_situation),
    datasets: [
      {
        data: situationDist.map((d) => d.count),
        backgroundColor: situationDist.map((d, i) => getSituationColor(d.code_type_situation, i)),
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { usePointStyle: true, padding: 20, font: { size: 12 } },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: "#f1f5f9" }, ticks: { font: { size: 11 } } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: { position: "bottom" as const, labels: { usePointStyle: true, padding: 16, font: { size: 12 } } },
    },
  };

  if (loading && !data) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className={components.pageTitle}>Dashboard</h1>
          <p className={components.pageDescription}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className={components.pageTitle}>Dashboard</h1>
          <div className="mt-6 rounded-lg border border-red-200 dark:border-red-800 dark:border-red-800 bg-red-50 p-4 text-red-700">
            <p className="font-medium">Erreur de chargement</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={fetchDashboard}
              className={`${components.button.primary} mt-4 px-4 py-2 text-sm`}
            >
              Reessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filialeOptions = filiales.map((f) => (
    <option key={f.value} value={f.value}>
      {f.value} - {f.label}
    </option>
  ));

  const familleOptions = familles.map((f) => (
    <option key={f.value} value={f.value}>
      {f.label}
    </option>
  ));

  const periodeOptions = [
    { value: "", label: "Cumule tous mois" },
    { value: "01", label: "Janvier" },
    { value: "02", label: "Fev" },
    { value: "03", label: "Mars" },
  ];

  const modeOptions = [
    { value: "standard", label: "Standard" },
    { value: "vs_cible", label: "vs Cible" },
  ];

  const StatCard = ({ title, value, subtext }: { title: string; value: string | number; subtext?: string }) => {
    const textValue = typeof value === "number" ? formatNumber(value) : value;
    const valueRef = useRef<HTMLParagraphElement>(null);

    useLayoutEffect(() => {
      const el = valueRef.current;
      if (!el) return;
      el.style.fontSize = "";
      const scroll = el.scrollWidth - el.clientWidth;
      if (scroll > 0) {
        const parentWidth = el.parentElement?.clientWidth ?? 0;
        if (parentWidth > 0) {
          const currentFontSize = parseFloat(getComputedStyle(el).fontSize);
          const newFontSize = Math.max(12, currentFontSize * (parentWidth / (el.scrollWidth + 1)));
          el.style.fontSize = `${newFontSize.toFixed(1)}px`;
        }
      }
    }, [textValue]);

    return (
      <div className={`${components.card} p-4`}>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">{title}</p>
        <p ref={valueRef} className="mt-1 text-2xl font-bold text-gray-800 dark:text-dark-text-primary whitespace-nowrap overflow-hidden text-ellipsis" title={textValue}>
          {textValue}
        </p>
        {subtext && <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">{subtext}</p>}
      </div>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{message}</p>
    </div>
  );

  const renderKpiTab = () => (
    <div className="space-y-6">
      <div className={components.card}>
        <h2 className={components.sectionTitle}>Quantite</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard title="Parc Total" value={parcTotal} />
          <StatCard title="En Service" value={enService} subtext={`${parcTotal > 0 ? ((enService / parcTotal) * 100).toFixed(1) : 0}% du parc`} />
          <StatCard title="En Chomage" value={enChomage} subtext={`${parcTotal > 0 ? ((enChomage / parcTotal) * 100).toFixed(1) : 0}% du parc`} />
          <StatCard title="En Panne" value={enPanne} subtext={`${parcTotal > 0 ? ((enPanne / parcTotal) * 100).toFixed(1) : 0}% du parc`} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={components.card}>
          <h2 className={components.sectionTitle}>Etat du Parc</h2>
          {situationDist.length === 0 ? (
            <EmptyState message="Aucune donnee de situation disponible." />
          ) : (
            <div className="mx-auto h-72 max-w-sm">
              <Doughnut data={situationChartData} options={doughnutOptions} />
            </div>
          )}
        </div>
        <div className={components.card}>
          <h2 className={components.sectionTitle}>Pointages recents</h2>
          {pointageEvol.length === 0 ? (
            <EmptyState message="Aucune donnee de pointage disponible." />
          ) : (
            <div className="h-72">
              <Bar
                data={{
                  labels: pointageEvol.map((p) => formatMonthLabel(p.mmaa)),
                  datasets: [
                    { label: "Service", data: pointageEvol.map((p) => p.heures_service), backgroundColor: SITUATION_COLORS["01"] },
                    { label: "Chomage", data: pointageEvol.map((p) => p.heures_chomage), backgroundColor: SITUATION_COLORS["02"] },
                    { label: "Panne", data: pointageEvol.map((p) => p.heures_panne), backgroundColor: SITUATION_COLORS["03"] },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSyntheseTab = () => (
    <div className="space-y-6">
      <div className={components.card}>
        <h2 className={components.sectionTitle}>Vue synthetique du parc</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard title="Parc Total" value={parcTotal} />
          <StatCard title="En Service" value={enService} />
          <StatCard title="En Chomage" value={enChomage} />
          <StatCard title="En Panne" value={enPanne} />
        </div>
      </div>

      <div className={components.card}>
        <h2 className={components.sectionTitle}>Alertes</h2>
        {alerts.length === 0 ? (
          <EmptyState message="Aucune alerte pour le moment." />
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.title}
                onClick={() => handleAlertClick(alert)}
                className="cursor-pointer rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800"
              >
                <p className="font-medium">{alert.title}</p>
                <p className="mt-1 text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderRendementTab = () => (
    <div className="space-y-6">
      <div className={components.card}>
        <h2 className={components.sectionTitle}>Evolution des pointages</h2>
        {pointageEvol.length === 0 ? (
          <EmptyState message="Aucune donnee de pointage disponible." />
        ) : (
          <div className="h-80">
            <Line
              data={{
                labels: pointageEvol.map((p) => formatMonthLabel(p.mmaa)),
                datasets: [
                  {
                    label: "Heures service",
                    data: pointageEvol.map((p) => p.heures_service),
                    borderColor: SITUATION_COLORS["01"],
                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                    fill: true,
                    tension: 0.3,
                  },
                  {
                    label: "Heures chomage",
                    data: pointageEvol.map((p) => p.heures_chomage),
                    borderColor: SITUATION_COLORS["02"],
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    fill: true,
                    tension: 0.3,
                  },
                  {
                    label: "Heures panne",
                    data: pointageEvol.map((p) => p.heures_panne),
                    borderColor: SITUATION_COLORS["03"],
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    fill: true,
                    tension: 0.3,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderFinancierTab = () => (
    <div className="space-y-6">
      <div className={components.card}>
        <h2 className={components.sectionTitle}>Finance</h2>
        {overview ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <StatCard title="Total Facture" value={formatCurrencyValue(overview.totalMontantService + overview.totalMontantChomage + overview.totalMontantPanne)} />
            <StatCard title="Fact. Service" value={formatCurrencyValue(overview.totalMontantService)} />
            <StatCard title="Total Regularisation" value={formatCurrencyValue(overview.totalRegularisation)} />
            <StatCard title="Marge" value={formatCurrencyValue((overview.totalMontantService + overview.totalMontantChomage + overview.totalMontantPanne) - overview.totalRegularisation)} />
          </div>
        ) : (
          <EmptyState message="Aucune donnee financiere disponible." />
        )}
      </div>
    </div>
  );

  const renderTendancesTab = () => (
    <div className="space-y-6">
      <div className={components.card}>
        <h2 className={components.sectionTitle}>Tendances</h2>
        {pointageEvol.length === 0 ? (
          <EmptyState message="Aucune tendance disponible pour la periode selectionnee." />
        ) : (
          <div className="h-96">
            <Line
              data={{
                labels: pointageEvol.map((p) => formatMonthLabel(p.mmaa)),
                datasets: [
                  {
                    label: "Heures service",
                    data: pointageEvol.map((p) => p.heures_service),
                    borderColor: SITUATION_COLORS["01"],
                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                    fill: true,
                    tension: 0.3,
                  },
                  {
                    label: "Heures chomage",
                    data: pointageEvol.map((p) => p.heures_chomage),
                    borderColor: SITUATION_COLORS["02"],
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    fill: true,
                    tension: 0.3,
                  },
                  {
                    label: "Heures panne",
                    data: pointageEvol.map((p) => p.heures_panne),
                    borderColor: SITUATION_COLORS["03"],
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    fill: true,
                    tension: 0.3,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderEnginsTab = () => {
    const columns: ColumnDef<any>[] = [
      { key: "code_materiel", label: "Code", sortable: true },
      { key: "designation", label: "Designation", sortable: true },
      { key: "libelle_famille", label: "Famille" },
      { key: "libelle_sous_famille", label: "Sous-Famille" },
      { key: "libelle_type_marque", label: "Type" },
      { key: "libelle_filiale", label: "Filiale" },
      {
        key: "est_bloque",
        label: "Statut",
        render: (value: unknown) => (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${value ? "bg-red-100 dark:bg-red-900/30 text-red-700" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"}`}>
            {value ? "Inactif" : "Actif"}
          </span>
        ),
      },
    ];

    const expandedContent = (row: any) => (
      <div className="p-4 bg-slate-50 dark:bg-dark-bg-secondary border-t border-slate-200 dark:border-dark-border">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Code Materiel</p>
            <p className="text-sm font-medium text-gray-800 dark:text-dark-text-primary">{row.code_materiel}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Designation</p>
            <p className="text-sm font-medium text-gray-800 dark:text-dark-text-primary">{row.designation}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Famille</p>
            <p className="text-sm font-medium text-gray-800 dark:text-dark-text-primary">{row.libelle_famille}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Sous-Famille</p>
            <p className="text-sm font-medium text-gray-800 dark:text-dark-text-primary">{row.libelle_sous_famille}</p>
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className={components.card}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className={components.sectionTitle}>Detail du Materiel</h2>
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par code, designation, type..."
                  value={materialSearch}
                  onChange={(e) => {
                    setMaterialSearch(e.target.value);
                    setMaterialPage(1);
                  }}
                  className={components.input + " pl-10"}
                />
              </div>
            </div>
          </div>

          {materialError && (
            <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 dark:border-red-800 bg-red-50 p-4 text-sm text-red-700">
              {materialError}
              <button
                onClick={fetchMaterialDetails}
                className={`${components.button.primary} mt-2 px-3 py-1.5 text-xs`}
              >
                Reessayer
              </button>
            </div>
          )}

          <CrudTable
            columns={columns}
            data={sortedItems}
            loading={materialLoading}
            error={materialError}
            searchTerm={materialSearch}
            onSearchChange={(value) => {
              setMaterialSearch(value);
              setMaterialPage(1);
            }}
            sortField={materialSortField}
            sortOrder={materialSortOrder}
            onSort={(field) => {
              setMaterialSortField((prev) => prev === field ? null : field);
              setMaterialSortOrder((prev) => prev === "asc" ? "desc" : "asc");
            }}
            currentPage={materialPage}
            onPageChange={setMaterialPage}
            itemsPerPage={50}
            onItemsPerPageChange={() => {}}
            onRetry={fetchMaterialDetails}
            totalItems={materialDetails?.total}
            emptyMessage="Aucun materiel trouve."
            title=""
            searchPlaceholder="Rechercher..."
            actions={(row) => (
              <button
                onClick={() => toggleRow(row.code_materiel)}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                {expandedRows.has(row.code_materiel) ? "Masquer" : "Details"}
              </button>
            )}
          />

          {expandedRows.size > 0 && (
            <div className="mt-4 space-y-4">
              {sortedItems
                .filter((row) => expandedRows.has(row.code_materiel))
                .map((row) => (
                  <div key={row.code_materiel} className="rounded-lg border border-slate-200 dark:border-dark-border overflow-hidden">
                    {expandedContent(row)}
                  </div>
                ))}
          </div>
        )}
      </div>
      <div className={components.card}>
        <h2 className={components.sectionTitle}>Activité récente</h2>
        {recentActivity.length === 0 ? (
          <EmptyState message="Aucune activité récente." />
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg-secondary p-4"
              >
                <p className="font-medium">{item.description}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-dark-text-secondary">
                  {item.module} • {item.action} • {item.user?.username ?? "system"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  };

  const renderGroupeTab = () => (
    <div className="space-y-6">
      <div className={components.card}>
        <h2 className={components.sectionTitle}>Vue par groupe / filiale</h2>
        {filialeStats.length === 0 ? (
          <EmptyState message="Aucune filiale disponible." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={components.table.header}>
                  <th className="px-4 py-3">Filiale</th>
                  <th className="px-4 py-3">Total Materiel</th>
                  <th className="px-4 py-3">Total Affectations</th>
                  <th className="px-4 py-3">Heures Service</th>
                  <th className="px-4 py-3">Total Pointages</th>
                </tr>
              </thead>
              <tbody>
                {filialeStats.map((f, idx) => (
                  <tr key={f.code_filiale} className={`${components.table.row} ${idx % 2 === 0 ? "bg-white dark:bg-dark-card" : "bg-slate-50/50 dark:bg-dark-bg-secondary/50"}`}>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-dark-text-primary">{f.libelle_filiale}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-dark-text-primary">{formatNumber(f.totalMateriel)}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-dark-text-primary">{formatNumber(f.totalAffectations)}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-dark-text-primary">{formatNumber(f.totalHeuresService, 1)}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-dark-text-primary">{formatNumber(f.totalPointages)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderJournalTab = () => <JournalMateriel />;

  const renderAnalyseQuantitativeTab = () => <AnalyseQuantitative />;

  const renderAnalyseExploitationTab = () => <AnalyseExploitation />;

  const renderTabContent = () => {
    switch (activeTab) {
      case "kpi":
        return renderKpiTab();
      case "synthese":
        return renderSyntheseTab();
      case "rendement":
        return renderRendementTab();
      case "financier":
        return renderFinancierTab();
      case "tendances":
        return renderTendancesTab();
      case "engins":
        return renderEnginsTab();
      case "groupe":
        return renderGroupeTab();
      case "journal":
        return renderJournalTab();
      case "analyse_quantitative":
        return renderAnalyseQuantitativeTab();
      case "analyse_exploitation":
        return renderAnalyseExploitationTab();
      default:
        return renderKpiTab();
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className={components.pageTitle}>Dashboard</h1>
            <p className={components.pageDescription}>
              Vue operationnelle du parc materiel et des activites.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className={components.label}>Filiale</label>
              <select
                className={components.select}
                value={filters.code_filiale}
                onChange={(e) => updateFilter("code_filiale", e.target.value)}
              >
                <option value="">Toutes</option>
                {filialeOptions}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={components.label}>Famille</label>
              <select
                className={components.select}
                value={filters.code_famille}
                onChange={(e) => updateFilter("code_famille", e.target.value)}
              >
                <option value="">Toutes</option>
                {familleOptions}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={components.label}>Periode</label>
              <select
                className={components.select}
                value={filters.periode}
                onChange={(e) => updateFilter("periode", e.target.value)}
              >
                {periodeOptions.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={components.label}>Du</label>
              <input
                type="date"
                className={components.input}
                value={filters.date_debut}
                onChange={(e) => updateFilter("date_debut", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={components.label}>Au</label>
              <input
                type="date"
                className={components.input}
                value={filters.date_fin}
                onChange={(e) => updateFilter("date_fin", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={components.label}>Mode</label>
              <select
                className={components.select}
                value={filters.mode}
                onChange={(e) => updateFilter("mode", e.target.value)}
              >
                {modeOptions.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchDashboard}
              className={`${components.button.primary} h-10 px-4 text-sm`}
              disabled={loading}
            >
              {loading ? "Actualisation..." : "Actualiser"}
            </button>
            <button
              onClick={resetFilters}
              className={`${components.button.secondary} h-10 px-4 text-sm`}
            >
              Reinitialiser
            </button>
          </div>
        </div>

        {error && data && (
          <div className="mt-4 rounded-lg border border-red-200 dark:border-red-800 dark:border-red-800 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-dark-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 dark:text-dark-text-secondary hover:text-gray-800 dark:text-dark-text-primary hover:border-gray-300 dark:border-dark-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
