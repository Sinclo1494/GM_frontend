import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import {
  DonutChart,
  BreakdownTable,
  Section,
  StatusBadge,
  LoadingSpinner,
  ErrorBox,
  useDashboardFilters,
  filtersToParams,
  NiveauHeader,
  pct,
  formatMonth,
} from "../index";
import { DASHBOARD_TARGETS } from "../dashboardTargets";
import { getDashboardV2Disponibilite } from "../../../../api/dashboardV2Services";
import type { DashboardV2Disponibilite } from "../../../../types/dashboardV2";

function DisponibiliteScreenImpl() {
  const filters = useDashboardFilters();
  const [dispo, setDispo] = useState<DashboardV2Disponibilite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { codeFiliale, codeFamille, dateDebut, dateFin, niveau } = filters;
  const params = useMemo(
    () => filtersToParams(filters, { withNiveau: true }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [codeFiliale, codeFamille, dateDebut, dateFin, niveau],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await getDashboardV2Disponibilite(params);
      setDispo(d as DashboardV2Disponibilite);
    } catch (e) {
      if (e instanceof Error && e.name !== "CanceledError" && e.name !== "AbortError") {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const entityHeader = NiveauHeader(filters.niveau);
  const evolution = dispo?.evolution ?? [];
  const rawBreakdown = dispo?.breakdown ?? [];

  const totalService = evolution.reduce((s, p) => s + (p.heures_service ?? 0), 0);
  const totalChomage = evolution.reduce((s, p) => s + (p.heures_chomage ?? 0), 0);
  const totalPanne = evolution.reduce((s, p) => s + (p.heures_panne ?? 0), 0);

  const statusFor = (row: Record<string, unknown>): "success" | "warning" | "danger" | "info" | "neutral" => {
    const d = Number(row.disponibilite);
    if (d >= DASHBOARD_TARGETS.disponibilite) return "success";
    if (d >= DASHBOARD_TARGETS.dispoWarn) return "warning";
    return "danger";
  };

  // Add computed "statut" field to each row for filtering
  const breakdown = useMemo(() => {
    return rawBreakdown.map((row) => ({
      ...row,
      statut: statusFor(row),
    }));
  }, [rawBreakdown]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBox message={error} onRetry={fetchData} />;

  const donutHoursData = {
    labels: ["Heures service", "Heures chômage", "Heures panne"],
    values: [totalService, totalChomage, totalPanne],
  };

  const lineLabels = evolution.map((p) => formatMonth(p.mmaa));
  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: "Heures service",
        data: evolution.map((p) => p.heures_service),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.12)",
        yAxisID: "y",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Heures chômage",
        data: evolution.map((p) => p.heures_chomage),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245,158,11,0.12)",
        yAxisID: "y",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Heures panne",
        data: evolution.map((p) => p.heures_panne),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.12)",
        yAxisID: "y",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Disponibilité %",
        data: evolution.map((p) => p.disponibilite),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.12)",
        yAxisID: "y1",
        tension: 0.3,
        fill: false,
        borderWidth: 2,
      },
      {
        label: `Cible ${DASHBOARD_TARGETS.disponibilite}%`,
        data: evolution.map(() => DASHBOARD_TARGETS.disponibilite),
        borderColor: "#ef4444",
        borderDash: [6, 4],
        pointRadius: 0,
        borderWidth: 1.5,
        yAxisID: "y1",
        fill: false,
      },
    ],
  };

  const columns = [
    {
      key: "code",
      label: "Code",
      align: "left" as const,
      filterable: true,
      filterType: "text",
      render: (_v: unknown, row: Record<string, unknown>) => (
        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{String(row.code ?? "")}</span>
      ),
    },
    {
      key: "libelle",
      label: entityHeader,
      filterable: true,
      filterType: "text",
      render: (_v: unknown, row: Record<string, unknown>) => (
        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{String(row.libelle ?? row.code ?? "")}</span>
      ),
    },
    { key: "potentiel", label: "Potentiel (H)", align: "right" as const },
    { key: "heures_service", label: "Heures service (H)", align: "right" as const },
    { key: "heures_chomage", label: "Heures chômage (H)", align: "right" as const },
    { key: "heures_panne", label: "Heures panne (H)", align: "right" as const },
    {
      key: "disponibilite",
      label: "Disponibilité %",
      align: "right" as const,
      render: (v: unknown) => pct(v),
    },
    {
      key: "statut",
      label: "Statut",
      align: "center" as const,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "success", label: "✓ ≥ Cible" },
        { value: "warning", label: "⚠ Attention" },
        { value: "danger", label: "✗ Critique" },
      ],
      render: (_v: unknown, row: Record<string, unknown>) => {
        const d = Number(row.disponibilite);
        const ok = d >= DASHBOARD_TARGETS.dispoWarn;
        const label =
          d >= DASHBOARD_TARGETS.disponibilite
            ? `≥ ${DASHBOARD_TARGETS.disponibilite}%`
            : d >= DASHBOARD_TARGETS.dispoWarn
              ? `${DASHBOARD_TARGETS.dispoWarn}–${DASHBOARD_TARGETS.disponibilite}%`
              : `< ${DASHBOARD_TARGETS.dispoWarn}%`;
        return <StatusBadge ok={ok} labelOk={label} labelKo={label} />;
      },
    },
  ];

  return (
    <div className="min-w-0">
      <Section title={`Disponibilité — ${entityHeader}`} accent="green">
        <div className="grid grid-cols-1 gap-6 min-w-0 lg:grid-cols-3">
          <div className="lg:col-span-1 min-w-0">
            <DonutChart data={donutHoursData} />
          </div>
          <div className="lg:col-span-2 min-w-0" style={{ height: 360 }}>
            <Line data={lineData} options={disponibiliteLineOptions} />
          </div>
        </div>
      </Section>

      <Section title="Détail par entité" accent="green">
        <BreakdownTable
          columns={columns}
          rows={breakdown}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          totalItems={breakdown.length}
          statusFor={statusFor}
        />
      </Section>
    </div>
  );
}

const disponibiliteLineOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index" as const, intersect: false },
  scales: {
    x: {
      ticks: { font: { size: 10 } },
      grid: { display: false },
    },
    y: {
      type: "linear" as const,
      position: "left" as const,
      title: { display: true, text: "Heures" },
      ticks: { font: { size: 10 } },
      border: { display: false },
      beginAtZero: true,
    },
    y1: {
      type: "linear" as const,
      position: "right" as const,
      min: 0,
      max: 100,
      title: { display: true, text: "Disponibilité %" },
      ticks: { font: { size: 10 }, stepSize: 20 },
      border: { display: false },
      beginAtZero: true,
    },
  },
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { font: { size: 10 }, padding: 12 },
    },
  },
};

const DisponibiliteScreen = React.lazy(() => Promise.resolve({ default: DisponibiliteScreenImpl }));

export default DisponibiliteScreen;
