import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import {
  BreakdownTable,
  Section,
  StatusBadge,
  LoadingSpinner,
  ErrorBox,
  useDashboardFilters,
  filtersToParams,
  NiveauHeader,
  pct,
  fmtNumber,
  formatMonth,
} from "../index";
import type { BreakdownColumn } from "../index";
import { DASHBOARD_TARGETS } from "../dashboardTargets";
import { getDashboardV2Rendement } from "../../../../api/dashboardV2Services";
import type { DashboardV2Rendement } from "../../../../types/dashboardV2";

function RendementScreenImpl() {
  const filters = useDashboardFilters();
  const [rendement, setRendement] = useState<DashboardV2Rendement | null>(null);
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
      // One call: the endpoint now returns the niveau-aware breakdown, so the
      // screen no longer issues a second /disponibilite request for it.
      const r = await getDashboardV2Rendement(params);
      setRendement(r as DashboardV2Rendement);
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

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBox message={error} onRetry={fetchData} />;

  const rendementEvolution = rendement?.rendementEvolution ?? [];
  const pointageEvolution = rendement?.pointageEvolution ?? [];
  const breakdown = rendement?.breakdown ?? [];
  const entityHeader = NiveauHeader(filters.niveau);

  const rendementLineData = {
    labels: rendementEvolution.map((p) => formatMonth(p.mmaa)),
    datasets: [
      {
        label: "Rendement global %",
        data: rendementEvolution.map((p) => p.rendement),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139,92,246,0.12)",
        tension: 0.3,
        fill: false,
        borderWidth: 2,
      },
      {
        label: "Disponibilité %",
        data: rendementEvolution.map((p) => p.disponibilite),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.12)",
        tension: 0.3,
        fill: false,
      },
      {
        label: "Taux d'utilisation %",
        data: rendementEvolution.map((p) => p.taux_utilisation),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.12)",
        tension: 0.3,
        fill: false,
      },
      {
        label: `Cible ${DASHBOARD_TARGETS.rendement}%`,
        data: rendementEvolution.map(() => DASHBOARD_TARGETS.rendement),
        borderColor: "#ef4444",
        borderDash: [6, 4],
        pointRadius: 0,
        borderWidth: 1.5,
        fill: false,
      },
    ],
  };

  const rendementLineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { font: { size: 10 } }, grid: { display: false } },
      y: {
        type: "linear" as const,
        position: "left" as const,
        min: 0,
        max: 100,
        title: { display: true, text: "Pourcentage %" },
        ticks: { font: { size: 10 }, stepSize: 10 },
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

  const heuresLineData = {
    labels: pointageEvolution.map((p) => formatMonth(p.mmaa)),
    datasets: [
      {
        label: "Heures service",
        data: pointageEvolution.map((p) => p.heures_service),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.3)",
        tension: 0.3,
        fill: true,
        stack: "heures",
      },
      {
        label: "Heures chômage",
        data: pointageEvolution.map((p) => p.heures_chomage),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245,158,11,0.3)",
        tension: 0.3,
        fill: true,
        stack: "heures",
      },
      {
        label: "Heures panne",
        data: pointageEvolution.map((p) => p.heures_panne),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.3)",
        tension: 0.3,
        fill: true,
        stack: "heures",
      },
    ],
  };

  const heuresLineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { font: { size: 10 } }, grid: { display: false } },
      y: {
        type: "linear" as const,
        position: "left" as const,
        title: { display: true, text: "Heures" },
        ticks: { font: { size: 10 } },
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

  const columns: BreakdownColumn[] = [
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
    { key: "potentiel", label: "Potentiel (H)", align: "right" as const, render: (v: unknown) => fmtNumber(v, 1) },
    { key: "heures_service", label: "Service (H)", align: "right" as const, render: (v: unknown) => fmtNumber(v, 1) },
    { key: "heures_panne", label: "Panne (H)", align: "right" as const, render: (v: unknown) => fmtNumber(v, 1) },
    { key: "disponibilite", label: "Disp. %", align: "right" as const, render: (v: unknown) => pct(v) },
    { key: "taux_utilisation", label: "Util. %", align: "right" as const, render: (v: unknown) => pct(v) },
    { key: "rendement", label: "Rend. %", align: "right" as const, render: (v: unknown) => pct(v) },
    {
      key: "statut",
      label: "Statut",
      align: "center" as const,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "success", label: "✓ Atteint" },
        { value: "danger", label: "✗ Non atteint" },
      ],
      render: (_v: unknown, row: Record<string, unknown>) => {
        const r = Number(row.rendement);
        const ok = r >= DASHBOARD_TARGETS.rendement;
        return (
          <StatusBadge
            ok={ok}
            labelOk={`≥ ${DASHBOARD_TARGETS.rendement}%`}
            labelKo={`< ${DASHBOARD_TARGETS.rendement}%`}
          />
        );
      },
    },
  ];

  const statusFor = (row: Record<string, unknown>): "success" | "warning" | "danger" | "info" | "neutral" => {
    return Number(row.rendement) >= DASHBOARD_TARGETS.rendement ? "success" : "danger";
  };

  return (
    <div className="min-w-0">
      <Section title="Rendement global" accent="amber">
        <div className="min-w-0" style={{ height: 360 }}>
          <Line data={rendementLineData} options={rendementLineOptions} />
        </div>
      </Section>

      <Section title="Volume horaire (service / chômage / panne)" accent="amber">
        <div className="min-w-0" style={{ height: 300 }}>
          <Line data={heuresLineData} options={heuresLineOptions} />
        </div>
      </Section>

      <Section title={`Détail par entité (${entityHeader})`} accent="amber">
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

const RendementScreen = React.lazy(() => Promise.resolve({ default: RendementScreenImpl }));

export default RendementScreen;
