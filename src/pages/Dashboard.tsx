import { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { components } from "../theme/components";
import { getDashboard, getFiliales, getFamilles, getMaterialDetails } from "../api/dataServices";
import formatCurrency from "../utils/FormatCurrency";
import JournalMateriel from "./JournalMateriel";
import AnalyseQuantitative from "./AnalyseQuantitative";
import AnalyseExploitation from "./AnalyseExploitation";
import DisponibiliteTab from "../components/dashboard/kpi/DisponibiliteTab";
import PanneTab from "../components/dashboard/kpi/PanneTab";
import MtbfTab from "../components/dashboard/kpi/MtbfTab";
import MttrTab from "../components/dashboard/kpi/MttrTab";
import TauxUtilisationTab from "../components/dashboard/kpi/TauxUtilisationTab";
import TauxChomageTab from "../components/dashboard/kpi/TauxChomageTab";
import TauxAffectationTab from "../components/dashboard/kpi/TauxAffectationTab";
import CaLocationInterneTab from "../components/dashboard/kpi/CaLocationInterneTab";
import CoutPanneTab from "../components/dashboard/kpi/CoutPanneTab";
import RendementTab from "../components/dashboard/kpi/RendementTab";
import RentabiliteTab from "../components/dashboard/kpi/RentabiliteTab";
import PaginationControls from "../components/common/PaginationControls";
import type {
  DashboardData,
  DashboardFilters,
  DashboardAlert,
  DashboardGlobalKpis,
  DashboardMaintenanceKpis,
  DashboardFinancialKpis,
  DashboardQuantitativeResume,
  DashboardExploitationResume,
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
import { Line } from "react-chartjs-2";
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
  "04": "#6b7280",
  "05": "#6b7280",
  "06": "#8b5cf6",
  "ALREM": "#ec4899",
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

type TabId = "kpi" | "synthese" | "rendement" | "financier" | "tendances" | "engins" | "groupe" | "journal" | "analyse_quantitative" | "analyse_exploitation" | "disponibilite" | "panne" | "mtbf" | "mttr" | "taux_utilisation" | "taux_chomage" | "taux_affectation" | "ca_location" | "cout_panne" | "rentabilite";

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
  { id: "disponibilite", label: "TAUX DISPONIBILITÉ" },
  { id: "panne", label: "TAUX PANNE" },
  { id: "mtbf", label: "MTBF" },
  { id: "mttr", label: "MTTR" },
  { id: "taux_utilisation", label: "TAUX D'UTILISATION" },
  { id: "taux_chomage", label: "TAUX DE CHÔMAGE" },
  { id: "taux_affectation", label: "TAUX D'AFFECTATION CHANTIER" },
  { id: "ca_location", label: "CHIFFRE D'AFFAIRES" },
  { id: "cout_panne", label: "COÛT DE LA PANNE" },
  { id: "rentabilite", label: "RENTABILITÉ" },
];

const today = new Date().toISOString().split("T")[0];
const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0];
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 21 }, (_, i) => {
  const y = currentYear - 10 + i;
  return { value: String(y), label: String(y) };
});

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
    date_debut: `${currentYear}-01-01`,
    date_fin: `${currentYear}-12-31`,
    code_famille: "",
    periode: "",
    mode: "standard",
    niveau: "engin",
    annee: String(currentYear),
    trimestre: "",
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

  const handlePeriodeChange = (value: string) => {
    setFilters((prev) => {
      const next = { ...prev, periode: value, trimestre: "" };
      if (value === "personnalisee") {
        return next;
      }
      const annee = prev.annee || String(currentYear);
      if (value && value !== "") {
        const year = parseInt(annee, 10);
        const month = parseInt(value, 10);
        const firstDay = `${annee}-${value}-01`;
        const lastDay = new Date(year, month, 0).toISOString().split("T")[0];
        return { ...next, date_debut: firstDay, date_fin: lastDay };
      }
      return { ...next, date_debut: `${annee}-01-01`, date_fin: `${annee}-12-31` };
    });
  };

  const handleTrimestreChange = (value: string) => {
    setFilters((prev) => {
      const next = { ...prev, trimestre: value, periode: "" };
      if (value && value !== "") {
        const annee = prev.annee || String(currentYear);
        const year = parseInt(annee, 10);
        let firstMonth, lastMonth;
        if (value === "Q1") { firstMonth = 1; lastMonth = 3; }
        else if (value === "Q2") { firstMonth = 4; lastMonth = 6; }
        else if (value === "Q3") { firstMonth = 7; lastMonth = 9; }
        else if (value === "Q4") { firstMonth = 10; lastMonth = 12; }
        else { return next; }
        const firstDay = `${year}-${String(firstMonth).padStart(2, "0")}-01`;
        const lastDay = new Date(year, lastMonth, 0).toISOString().split("T")[0];
        return { ...next, date_debut: firstDay, date_fin: lastDay };
      }
      return next;
    });
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
      niveau: "engin",
      annee: String(currentYear),
      trimestre: "",
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
          <div className="mt-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 p-4 text-red-700">
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
    { value: "", label: "Tous les mois" },
    { value: "01", label: "Janvier" },
    { value: "02", label: "Février" },
    { value: "03", label: "Mars" },
    { value: "04", label: "Avril" },
    { value: "05", label: "Mai" },
    { value: "06", label: "Juin" },
    { value: "07", label: "Juillet" },
    { value: "08", label: "Août" },
    { value: "09", label: "Septembre" },
    { value: "10", label: "Octobre" },
    { value: "11", label: "Novembre" },
    { value: "12", label: "Décembre" },
    { value: "personnalisee", label: "Période personnalisée" },
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
      <div className={`${components.card} p-4 min-w-0`}>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">{title}</p>
        <p ref={valueRef} className="mt-1 text-2xl font-bold text-gray-800 dark:text-dark-text-primary whitespace-nowrap overflow-hidden text-ellipsis" title={textValue}>
          {textValue}
        </p>
        {subtext && <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">{subtext}</p>}
      </div>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{message}</p>
    </div>
  );

  const renderKpiTab = () => {
    const globalKpis = data?.globalKpis as DashboardGlobalKpis | undefined;
    const maintenanceKpis = data?.maintenanceKpis as DashboardMaintenanceKpis | undefined;
    const financialKpis = data?.financialKpis as DashboardFinancialKpis | undefined;
    const quantitativeResume = data?.quantitativeResume as DashboardQuantitativeResume | undefined;
    const exploitationResume = data?.exploitationResume as DashboardExploitationResume | undefined;

    const parcTotal = globalKpis?.parc_total ?? overview?.totalMateriel ?? 0;
    const enServiceCount = globalKpis?.en_service ?? enService;
    const enChomageCount = globalKpis?.en_chomage ?? enChomage;
    const enPanneCount = globalKpis?.en_panne ?? enPanne;
    const immobiliseBase = globalKpis?.immobilise_base ?? 0;
    const alrem = globalKpis?.alrem ?? 0;
    const ageMoyen = globalKpis?.age_moyen ?? quantitativeResume?.age_moyen ?? 0;

    const potentielTotal = exploitationResume?.total_potentiel ?? maintenanceKpis?.potentiel_total ?? 0;
    const tauxService = exploitationResume
      ? (exploitationResume.heures_service / (exploitationResume.heures_service + exploitationResume.heures_chomage + exploitationResume.heures_panne) * 100)
      : (maintenanceKpis?.taux_service ?? 0);
    const tauxChomage = exploitationResume
      ? (exploitationResume.heures_chomage / (exploitationResume.heures_service + exploitationResume.heures_chomage + exploitationResume.heures_panne) * 100)
      : 0;
    const tauxPanne = exploitationResume
      ? (exploitationResume.heures_panne / (exploitationResume.heures_service + exploitationResume.heures_chomage + exploitationResume.heures_panne) * 100)
      : (maintenanceKpis?.taux_panne ?? 0);
    const disponibilite = maintenanceKpis?.disponibilite ?? 0;
    const ecartCible = disponibilite - 85;

    const tmad = maintenanceKpis?.tamd ?? 0;
    const tip = maintenanceKpis?.tip ?? 0;
    const tam = maintenanceKpis?.tam ?? 0;

    const totalFacture = financialKpis?.totalFacture ?? 0;
    const factService = financialKpis?.factService ?? 0;
    const factChomage = financialKpis?.factChomage ?? 0;
    const manqueAGagner = financialKpis?.manqueAGagner ?? 0;
    const caPotentiel = financialKpis?.caPotentiel ?? 0;
    const ecartCibleMag = financialKpis?.ecartCibleMag ?? 0;

    const KpiCard = ({ title, value, subtext, status }: { title: string; value: string | number; subtext?: React.ReactNode; status?: "success" | "warning" | "danger" | "info" }) => (
      <div className={`${components.card} p-4 relative overflow-hidden min-w-0`}>
        {status && (
          <div className={`absolute top-0 left-0 right-0 h-1 ${status === "success" ? "bg-green-500" : status === "warning" ? "bg-amber-500" : status === "danger" ? "bg-red-500" : "bg-gray-500"}`} />
        )}
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">{title}</p>
        <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-dark-text-primary whitespace-nowrap overflow-hidden text-ellipsis" title={String(value)}>
          {value}
        </p>
        {subtext && <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">{subtext}</p>}
      </div>
    );

    const TargetBadge = ({ value, target, higherIsBetter }: { value: number; target: number; higherIsBetter: boolean }) => {
      const isOk = higherIsBetter ? value >= target : value <= target;
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${isOk ? components.badge.success : components.badge.danger}`}>
          obj {higherIsBetter ? "≥" : "≤"} {target}%
        </span>
      );
    };

    const Section = ({ title, children, accent = "blue" }: { title: string; children: React.ReactNode; accent?: string }) => {
      const accentColors: Record<string, string> = {
        blue: "bg-gray-600",
        green: "bg-green-600",
        amber: "bg-amber-600",
        purple: "bg-purple-600",
        red: "bg-red-600",
        teal: "bg-teal-600",
      };
      return (
        <div className={components.card}>
          <div className={`h-1.5 w-full ${accentColors[accent] || accentColors.blue} rounded-t-xl -mx-6 -mt-6 mb-4`} />
          <h2 className={components.sectionTitle}>{title}</h2>
          <div className="mt-4">{children}</div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <Section title="PARC — QUANTITATIF" accent="blue">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7 min-w-0">
            <KpiCard title="Parc total" value={parcTotal} />
            <KpiCard title="En service" value={enServiceCount} subtext={`${parcTotal > 0 ? ((enServiceCount / parcTotal) * 100).toFixed(1) : 0}% du parc`} status="success" />
            <KpiCard title="En chômage" value={enChomageCount} subtext={`${parcTotal > 0 ? ((enChomageCount / parcTotal) * 100).toFixed(1) : 0}%`} status="warning" />
            <KpiCard title="En panne" value={enPanneCount} subtext={`${parcTotal > 0 ? ((enPanneCount / parcTotal) * 100).toFixed(1) : 0}%`} status="danger" />
            <KpiCard title="Immobilisé base" value={immobiliseBase} subtext={`${parcTotal > 0 ? ((immobiliseBase / parcTotal) * 100).toFixed(1) : 0}%`} />
            <KpiCard title="ALREM" value={alrem} subtext={`${parcTotal > 0 ? ((alrem / parcTotal) * 100).toFixed(1) : 0}%`} />
            <KpiCard title="Âge moyen" value={`${ageMoyen} ans`} />
          </div>
        </Section>

        <Section title="RENDEMENT HORAIRE" accent="green">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7 min-w-0">
            <KpiCard title="Potentiel (H)" value={Math.round(potentielTotal).toLocaleString("fr-FR")} subtext="H" />
            <KpiCard title="Taux service (H)" value={`${tauxService.toFixed(1)}%`} subtext={`${Math.round(exploitationResume?.heures_service ?? maintenanceKpis?.heures_service ?? 0).toLocaleString("fr-FR")} h`} status={tauxService >= 42 ? "success" : "warning"} />
            <KpiCard title="Taux chômage (H)" value={`${tauxChomage.toFixed(1)}%`} subtext={`${Math.round(exploitationResume?.heures_chomage ?? maintenanceKpis?.heures_chomage ?? 0).toLocaleString("fr-FR")} h`} status={tauxChomage <= 32 ? "success" : "warning"} />
            <KpiCard title="Taux panne (H)" value={`${tauxPanne.toFixed(1)}%`} subtext={`${Math.round(exploitationResume?.heures_panne ?? maintenanceKpis?.heures_panne ?? 0).toLocaleString("fr-FR")} h`} status={tauxPanne <= 27 ? "success" : "danger"} />
            <KpiCard title="Disponibilité" value={`${disponibilite.toFixed(1)}%`} subtext={<TargetBadge value={disponibilite} target={85} higherIsBetter={true} />} status={disponibilite >= 85 ? "success" : "danger"} />
            <KpiCard title="Écart cible" value={`${ecartCible >= 0 ? "+" : ""}${ecartCible.toFixed(1)}%`} subtext="vs 85%" status={ecartCible >= 0 ? "success" : "danger"} />
          </div>
        </Section>

        <Section title="MAINTENANCE — TMAD · TIP · TAM" accent="amber">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7 min-w-0">
            <KpiCard title="TMAD" value={`${tmad.toFixed(1)}%`} subtext={<TargetBadge value={tmad} target={80} higherIsBetter={true} />} status={tmad >= 80 ? "success" : "danger"} />
            <KpiCard title="TIP" value={`${tip.toFixed(1)}%`} subtext={<TargetBadge value={tip} target={15} higherIsBetter={false} />} status={tip <= 15 ? "success" : "danger"} />
            <KpiCard title="TAM" value={`${tam.toFixed(1)}%`} subtext={<TargetBadge value={tam} target={65} higherIsBetter={true} />} status={tam >= 65 ? "success" : "danger"} />
            <KpiCard title="Unités en panne" value={maintenanceKpis?.en_panne ?? enPanne} subtext="physiques" status="danger" />
            <KpiCard title="Unités en réparation" value={maintenanceKpis?.en_reparation ?? 0} subtext="atelier base" status="warning" />
            <KpiCard title="Écart TMAD" value={`${(tmad - 80) >= 0 ? "+" : ""}${(tmad - 80).toFixed(1)}%`} subtext="vs 80%" status={(tmad - 80) >= 0 ? "success" : "danger"} />
          </div>
        </Section>

        <Section title="FINANCIERS" accent="purple">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7 min-w-0">
            <KpiCard title="Total facturé" value={`${formatNumber(totalFacture, 1)} M`} subtext="M DA" />
            <KpiCard title="Facturation service" value={`${formatNumber(factService, 1)} M`} subtext={`${totalFacture > 0 ? ((factService / totalFacture) * 100).toFixed(0) : 0}%`} status="success" />
            <KpiCard title="Facturation chômage" value={`${formatNumber(factChomage, 1)} M`} subtext={`${totalFacture > 0 ? ((factChomage / totalFacture) * 100).toFixed(0) : 0}%`} status="warning" />
            <KpiCard title="Manque à gagner" value={`${formatNumber(manqueAGagner, 1)} M`} subtext={`${caPotentiel > 0 ? ((manqueAGagner / caPotentiel) * 100).toFixed(0) : 0}%`} status="danger" />
            <KpiCard title="CA potentiel" value={`${formatNumber(caPotentiel, 1)} M`} subtext="M DA" status="info" />
            <KpiCard title="Écart cible MAG" value={`${ecartCibleMag >= 0 ? "+" : ""}${ecartCibleMag.toFixed(1)}%`} subtext="vs cible" status={ecartCibleMag >= 0 ? "success" : "danger"} />
          </div>
        </Section>

        <Section title="FORMULES COSIDER — TOUTES LES RUBRIQUES" accent="teal">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={components.table.header}>
                  <th className="px-4 py-3">INDICATEUR</th>
                  <th className="px-4 py-3">FORMULE</th>
                  <th className="px-4 py-3">SIGNIFICATION</th>
                  <th className="px-4 py-3">UNITÉ</th>
                  <th className="px-4 py-3 text-center">CIBLE ✓</th>
                  <th className="px-4 py-3 text-center">ALERTE ✕</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { indicateur: "Taux service (h)", formule: "H.svc / Potentiel × 100", signification: "Part des heures service dans le potentiel total", unite: "%", cible: "≥ 42%", alerte: "< 42%" },
                  { indicateur: "Taux panne (h)", formule: "H.pan / Potentiel × 100", signification: "Part des heures panne dans le potentiel total", unite: "%", cible: "≤ 27%", alerte: "> 27%" },
                  { indicateur: "Disponibilité", formule: "(Pot - H.pan) / Pot × 100", signification: "Matériel disponible hors panne", unite: "%", cible: "≥ 85%", alerte: "< 85%" },
                  { indicateur: "Taux MAG", formule: "MAG / (Fact + MAG) × 100", signification: "Taux de marge sur chiffre d'affaires potentiel", unite: "%", cible: "—", alerte: "—" },
                  { indicateur: "TMAD", formule: "(H.Pot - H.Pan) / H.Pot × 100", signification: "Taux de mise à disposition", unite: "%", cible: "≥ 80%", alerte: "< 80%" },
                  { indicateur: "TIP", formule: "Nb.Pan / Nb.Total × 100", signification: "Taux d'immobilisation panne", unite: "%", cible: "≤ 15%", alerte: "> 15%" },
                  { indicateur: "TAM", formule: "Disponibilité × 100", signification: "Taux d'admission en maintenance", unite: "%", cible: "≥ 65%", alerte: "< 65%" },
                ].map((row, idx) => (
                  <tr key={row.indicateur} className={`${components.table.row} ${idx % 2 === 0 ? "bg-white dark:bg-dark-card" : "bg-slate-50/50 dark:bg-dark-bg-secondary/50"}`}>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-dark-text-primary">{row.indicateur}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-dark-text-secondary">{row.formule}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-dark-text-secondary">{row.signification}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-dark-text-secondary">{row.unite}</td>
                    <td className="px-4 py-3 text-center text-green-700 dark:text-green-400 font-medium">{row.cible}</td>
                    <td className="px-4 py-3 text-center text-red-700 dark:text-red-400 font-medium">{row.alerte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    );
  };

  const renderSyntheseTab = () => (
    <div className="space-y-6">
      <div className={components.card}>
        <h2 className={components.sectionTitle}>Vue synthetique du parc</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 min-w-0">
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

  const renderRendementTab = () => <RendementTab data={data!} filters={filters} />;

  const renderFinancierTab = () => (
    <div className="space-y-6">
      <div className={components.card}>
        <h2 className={components.sectionTitle}>Finance</h2>
        {overview ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 min-w-0">
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
            <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 p-4 text-sm text-red-700">
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
                className="text-gray-600 hover:text-gray-800 dark:text-dark-text-primary text-xs font-medium"
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

  const GroupeTab = () => {
    const [groupePage, setGroupePage] = useState(1);
    const [groupePageSize, setGroupePageSize] = useState(10);

    const paginatedFilialeStats = useMemo(() => {
      const start = (groupePage - 1) * groupePageSize;
      return filialeStats.slice(start, start + groupePageSize);
    }, [filialeStats, groupePage, groupePageSize]);

    const prevGroupeStatsLengthRef = useRef(filialeStats.length);
    useEffect(() => {
      if (prevGroupeStatsLengthRef.current !== filialeStats.length) {
        prevGroupeStatsLengthRef.current = filialeStats.length;
        setGroupePage(1);
      }
    }, [filialeStats.length]);

    return (
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
                  {paginatedFilialeStats.map((f, idx) => (
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
        {filialeStats.length > 0 && (
          <PaginationControls
            currentPage={groupePage}
            totalPages={Math.max(1, Math.ceil(filialeStats.length / groupePageSize))}
            totalItems={filialeStats.length}
            itemsPerPage={groupePageSize}
            onPageChange={setGroupePage}
            onItemsPerPageChange={setGroupePageSize}
            showItemCount={true}
          />
        )}
      </div>
    );
  };

  const renderGroupeTab = () => <GroupeTab />;

  const renderJournalTab = () => <JournalMateriel />;

  const renderAnalyseQuantitativeTab = () => <AnalyseQuantitative />;

  const renderAnalyseExploitationTab = () => <AnalyseExploitation />;

  const renderPanneTab = () => <PanneTab data={data!} filters={filters} />;

  const renderMtbfTab = () => <MtbfTab data={data!} filters={filters} />;

  const renderMttrTab = () => <MttrTab data={data!} filters={filters} />;

  const renderTauxUtilisationTab = () => <TauxUtilisationTab data={data!} filters={filters} />;

  const renderTauxChomageTab = () => <TauxChomageTab data={data!} filters={filters} />;

  const renderTauxAffectationTab = () => <TauxAffectationTab data={data!} filters={filters} />;

  const renderCaLocationsTab = () => <CaLocationInterneTab data={data!} filters={filters} />;

  const renderCoutPanneTab = () => <CoutPanneTab data={data!} filters={filters} />;

  const renderRentabiliteTab = () => <RentabiliteTab data={data!} />;

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
      case "disponibilite":
        return <DisponibiliteTab data={data!} filters={filters} />;
      case "panne":
        return renderPanneTab();
      case "mtbf":
        return renderMtbfTab();
      case "mttr":
        return renderMttrTab();
      case "taux_utilisation":
        return renderTauxUtilisationTab();
      case "taux_chomage":
        return renderTauxChomageTab();
      case "taux_affectation":
        return renderTauxAffectationTab();
      case "ca_location":
        return renderCaLocationsTab();
      case "cout_panne":
        return renderCoutPanneTab();
      case "rentabilite":
        return renderRentabiliteTab();
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
                onChange={(e) => handlePeriodeChange(e.target.value)}
              >
                {periodeOptions.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={components.label}>Trimestre</label>
              <select
                className={components.select}
                value={filters.trimestre ?? ""}
                onChange={(e) => handleTrimestreChange(e.target.value)}
              >
                <option value="">Tous</option>
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={components.label}>Annee</label>
              <select
                className={components.select}
                value={filters.annee ?? String(currentYear)}
                onChange={(e) => {
                  const annee = e.target.value;
                  setFilters((prev) => {
                    const next = { ...prev, annee };
                    if (prev.trimestre && prev.trimestre !== "") {
                      const year = parseInt(annee, 10);
                      let firstMonth, lastMonth;
                      if (prev.trimestre === "Q1") { firstMonth = 1; lastMonth = 3; }
                      else if (prev.trimestre === "Q2") { firstMonth = 4; lastMonth = 6; }
                      else if (prev.trimestre === "Q3") { firstMonth = 7; lastMonth = 9; }
                      else if (prev.trimestre === "Q4") { firstMonth = 10; lastMonth = 12; }
                      else { return next; }
                      const firstDay = `${year}-${String(firstMonth).padStart(2, "0")}-01`;
                      const lastDay = new Date(year, lastMonth, 0).toISOString().split("T")[0];
                      return { ...next, date_debut: firstDay, date_fin: lastDay };
                    }
                    if (prev.periode && prev.periode !== "" && prev.periode !== "personnalisee") {
                      const year = parseInt(annee, 10);
                      const month = parseInt(prev.periode, 10);
                      const firstDay = `${annee}-${prev.periode}-01`;
                      const lastDay = new Date(year, month, 0).toISOString().split("T")[0];
                      return { ...next, date_debut: firstDay, date_fin: lastDay };
                    }
                    if (!prev.periode || prev.periode === "") {
                      return { ...next, date_debut: `${annee}-01-01`, date_fin: `${annee}-12-31` };
                    }
                    return next;
                  });
                }}
              >
                {yearOptions.map((y) => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>
            </div>
            {filters.periode === "personnalisee" && (
              <>
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
              </>
            )}
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
            <div className="flex flex-col gap-1">
              <label className={components.label}>Niveau d'analyse</label>
              <select
                className={components.select}
                value={filters.niveau ?? "engin"}
                onChange={(e) => updateFilter("niveau", e.target.value)}
              >
                <option value="engin">Engin</option>
                <option value="famille">Famille d'engins</option>
                <option value="chantier">Chantier</option>
                <option value="groupe">Groupe</option>
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
          <div className="mt-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 p-4 text-sm text-red-700">
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
                  ? "border-red-600 text-red-600"
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
