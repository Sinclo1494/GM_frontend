import fs from 'fs';

const content = `import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Loader2,
  AlertCircle,
  Package,
  Gauge,
  TrendingUp,
  DollarSign,
  Truck,
  Users,
} from "lucide-react";
import { components } from "../theme/components";
import { getDashboard, getFiliales, getFamilles, getMaterialDetails } from "../api/dataServices";
import formatCurrency from "../utils/FormatCurrency";
import type {
  DashboardData,
  DashboardFilters,
  DashboardOverview,
  DashboardSituationDistribution,
  DashboardFilialeStat,
  DashboardAlert,
  DashboardQuantitativeResume,
  DashboardExploitationResume,
  DashboardFamilleDistribution,
  DashboardTrend,
  DashboardFinancialKpis,
  DashboardMaintenanceKpis,
  DashboardMaterialDetail,
  DashboardMaterialDetailsResponse,
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
import CrudTable from "../components/Crud/CrudTable";
import type { ColumnDef, SortField, SortOrder } from "../components/Crud/CrudTable";

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

const formatHours = (value: number | null | undefined) => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return formatNumber(value, 1) + " H";
};

const formatCurrencyValue = (value: number | null | undefined) => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return formatCurrency(value);
};

type TabId = "kpi" | "synthese" | "rendement" | "financier" | "tendances" | "engins" | "groupe";

const TABS: { id: TabId; label: string }[] = [
  { id: "kpi", label: "KPI" },
  { id: "synthese", label: "SYNTHÈSE" },
  { id: "rendement", label: "RENDEMENT" },
  { id: "financier", label: "FINANCIER" },
  { id: "tendances", label: "TENDANCES" },
  { id: "engins", label: "ENGINS" },
  { id: "groupe", label: "GROUPE" },
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

  const [materialDetails, setMaterialDetails] = useState<DashboardMaterialDetailsResponse | null>(null);
  const [materialLoading, setMaterialLoading] = useState(false);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialPage, setMaterialPage] = useState(1);
  const [materialSortField, setMaterialSortField] = useState<SortField>(null);
  const [materialSortOrder, setMaterialSortOrder] = useState<SortOrder>("asc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

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
  const quantResume = data?.quantitativeResume ?? null;
  const exploitResume = data?.exploitationResume ?? null;
  const familleDist = data?.familleDistribution ?? [];
  const trends = data?.trends ?? [];
  const financialKpis = data?.financialKpis ?? null;
  const maintenanceKpis = data?.maintenanceKpis ?? null;

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

  const familleChartData = useMemo(() => {
    const familleMap = new Map<string, { label: string; service: number; chomage: number; panne: number }>();
    familleDist.forEach((row) => {
      const key = row.code_famille;
      if (!familleMap.has(key)) {
        familleMap.set(key, { label: row.libelle_famille, service: 0, chomage: 0, panne: 0 });
      }
      const entry = familleMap.get(key)!;
      entry.service += row.heures_service || 0;
      entry.chomage += row.heures_chomage || 0;
      entry.panne += row.heures_panne || 0;
    });
    const familles = Array.from(familleMap.values());
    return {
      labels: familles.map((f) => f.label),
      datasets: [
        { label: "Service", data: familles.map((f) => Math.round(f.service)), backgroundColor: SITUATION_COLORS["01"] },
        { label: "Chomage", data: familles.map((f) => Math.round(f.chomage)), backgroundColor: SITUATION_COLORS["02"] },
        { label: "Panne", data: familles.map((f) => Math.round(f.panne)), backgroundColor: SITUATION_COLORS["03"] },
      ],
    };
  }, [familleDist]);

  const pointageEvolutionData = {
    labels: pointageEvol.map((p) => formatMonthLabel(p.mmaa)),
    datasets: [
      {
        label: "Heures service",
        data: pointageEvol.map((p) => p.heures_service),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Heures chomage",
        data: pointageEvol.map((p) => p.heures_chomage),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Heures panne",
        data: pointageEvol.map((p) => p.heures_panne),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const trendsData = useMemo(() => {
    const labels = trends.map((t) => formatMonthLabel(t.mmaa));
    return {
      labels,
      datasets: [
        {
          label: "SVC MOY",
          data: trends.map((t) => t.heures_service),
          borderColor: "#22c55e",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          fill: true,
          tension: 0.3,
        },
        {
          label: "MAG CUMULEE",
          data: trends.map((t) => t.montant_service),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.3,
        },
        {
          label: "MARGES MENSUELLES",
          data: trends.map((t) => t.montant_service - (t.montant_chomage + t.montant_panne)),
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [trends]);

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

  const horizontalBarOptions = {
    ...chartOptions,
    indexAxis: "y" as const,
    scales: {
      x: { grid: { color: "#f1f5f9" }, ticks: { font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  };

  if (loading && !data) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className={components.pageTitle}>Tableau de bord</h1>
          <p className={components.pageDescription}>Chargement...</p>
          <div className="mt-8 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className={components.pageTitle}>Tableau de bord</h1>
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-medium">Erreur de chargement</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={fetchDashboard}
              className={\`\${components.button.primary} mt-4 px-4 py-2 text-sm\`}
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

`;

fs.writeFileSync('src/pages/Dashboard.tsx', content);
console.log('Part 1 written');
