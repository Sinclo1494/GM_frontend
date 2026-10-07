import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import {
  DonutChart,
  BreakdownTable,
  Section,
  LoadingSpinner,
  ErrorBox,
  useDashboardFilters,
  filtersToParams,
  fmtNumber,
  formatMonth,
} from "../index";
import type { BreakdownColumn } from "../index";
import { getDashboardV2Situation } from "../../../../api/dashboardV2Services";
import type { DashboardV2Situation } from "../../../../types/dashboardV2";

function SituationScreenImpl() {
  const filters = useDashboardFilters();
  const [situation, setSituation] = useState<DashboardV2Situation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { codeFiliale, codeFamille, dateDebut, dateFin } = filters;
  const params = useMemo(
    () => filtersToParams(filters),
    [codeFiliale, codeFamille, dateDebut, dateFin],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getDashboardV2Situation(params);
      setSituation(s as DashboardV2Situation);
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

  const situationDist = situation?.situationDistribution ?? [];
  const pointageEvolution = situation?.pointageEvolution ?? [];
  const familleDist = situation?.familleDistribution ?? [];

  const donutData = {
    labels: situationDist.map((s) => s.libelle_type_situation),
    values: situationDist.map((s) => s.count),
  };

  const lineLabels = pointageEvolution.map((p) => formatMonth(p.mmaa));
  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: "Heures service",
        data: pointageEvolution.map((p) => p.heures_service),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.12)",
        yAxisID: "y",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Heures chômage",
        data: pointageEvolution.map((p) => p.heures_chomage),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245,158,11,0.12)",
        yAxisID: "y",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Heures panne",
        data: pointageEvolution.map((p) => p.heures_panne),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.12)",
        yAxisID: "y",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Potentiel",
        data: pointageEvolution.map((p) => p.potentiel),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.12)",
        yAxisID: "y",
        tension: 0.3,
        fill: false,
        borderWidth: 2,
        borderDash: [6, 4],
      },
    ],
  };

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
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
      legend: { position: "bottom" as const, labels: { font: { size: 10 }, padding: 12 } },
    },
  };

  const situationColumns: BreakdownColumn[] = [
    { key: "code_type_situation", label: "Code", align: "center" as const, filterable: true, filterType: "text" },
    { key: "libelle_type_situation", label: "Situation", filterable: true, filterType: "text" },
    { key: "count", label: "Nombre", align: "right" as const, render: (v: unknown) => fmtNumber(v) },
  ];

  const familleColumns: BreakdownColumn[] = [
    { key: "code_famille", label: "Code Famille", align: "center" as const, filterable: true, filterType: "text" },
    { key: "libelle_famille", label: "Famille", filterable: true, filterType: "text" },
    { key: "code_sous_famille", label: "Code Sous-Famille", align: "center" as const, filterable: true, filterType: "text" },
    { key: "libelle_sous_famille", label: "Sous-Famille", filterable: true, filterType: "text" },
    { key: "count", label: "Nb Pointages", align: "right" as const, render: (v: unknown) => fmtNumber(v) },
    { key: "heures_service", label: "H. Service", align: "right" as const, render: (v: unknown) => fmtNumber(v, 1) },
    { key: "heures_chomage", label: "H. Chômage", align: "right" as const, render: (v: unknown) => fmtNumber(v, 1) },
    { key: "heures_panne", label: "H. Panne", align: "right" as const, render: (v: unknown) => fmtNumber(v, 1) },
    { key: "potentiel", label: "Potentiel", align: "right" as const, render: (v: unknown) => fmtNumber(v, 1) },
  ];

  return (
    <div className="min-w-0">
      <Section title="Répartition des situations" accent="blue">
        <div className="grid grid-cols-1 gap-6 min-w-0 lg:grid-cols-3">
          <div className="lg:col-span-1 min-w-0">
            <DonutChart data={donutData} />
          </div>
          <div className="lg:col-span-2 min-w-0" style={{ height: 360 }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </Section>

      <Section title="Évolution des pointages (heures)" accent="blue">
        <div className="min-w-0" style={{ height: 300 }}>
          <Line data={lineData} options={lineOptions} />
        </div>
      </Section>

      <Section title="Détail par situation" accent="blue">
        <BreakdownTable
          columns={situationColumns}
          rows={situationDist as unknown as Record<string, unknown>[]}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          totalItems={situationDist.length}
        />
      </Section>

      <Section title="Répartition par famille / sous-famille" accent="blue">
        <BreakdownTable
          columns={familleColumns}
          rows={familleDist as unknown as Record<string, unknown>[]}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          totalItems={familleDist.length}
        />
      </Section>
    </div>
  );
}

const SituationScreen = React.lazy(() => Promise.resolve({ default: SituationScreenImpl }));

export default SituationScreen;