import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import {
  BreakdownTable,
  KpiCard,
  DonutChart,
  Section,
  StatusBadge,
  LoadingSpinner,
  ErrorBox,
  useDashboardFilters,
  filtersToParams,
  pct,
  fmtNumber,
  fmtMillions,
  formatQuarter,
} from "../index";
import type { BreakdownColumn } from "../index";
import { DASHBOARD_TARGETS } from "../dashboardTargets";
import { getDashboardV2Finances } from "../../../../api/dashboardV2Services";
import type { DashboardV2Finances } from "../../../../types/dashboardV2";

function FinancesScreenImpl() {
  const filters = useDashboardFilters();
  const [finances, setFinances] = useState<DashboardV2Finances | null>(null);
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
      const f = await getDashboardV2Finances(params);
      setFinances(f as DashboardV2Finances);
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

  const rentabilite = finances?.rentabilite;
  const caLocation = finances?.caLocationInterne;
  const tauxAffectation = finances?.tauxAffectation;
  const ranking = rentabilite?.ranking ?? [];

  // CA card: `caLocationInterne.evolution` is the MONTHLY, niveau-aware series
  // (ca_total = montant_service ?? heures x taux), i.e. the very same CA
  // definition as the Aperçu. `rentabilite.evolution` is the QUARTERLY series
  // (used below for the CA/régularisation/marge chart) — with the default
  // "mois en cours" range it holds a single quarter, so it is NOT used for the
  // headline CA.
  const caTotal = (caLocation?.evolution ?? []).reduce(
    (s, e) => s + (e.ca_total ?? 0),
    0,
  );
  const caStocke = (caLocation?.evolution ?? []).reduce(
    (s, e) => s + (e.ca_stocke ?? 0),
    0,
  );
  const caCalcule = (caLocation?.evolution ?? []).reduce(
    (s, e) => s + (e.ca_calculee ?? 0),
    0,
  );
  const margeTotal = (rentabilite?.evolution ?? []).reduce((s, e) => s + (e.marge ?? 0), 0);
  const regularisationTotale = (rentabilite?.evolution ?? []).reduce(
    (s, e) => s + (e.regularisation ?? 0),
    0,
  );
  const margeOk = margeTotal >= 0;

  // Fleet-scoped rate, straight from the backend: summing the breakdown rows
  // would multiply `parc_total` by the number of niveau groups.
  const tauxGlobal =
    finances?.tauxAffectationGlobal ?? tauxAffectation?.global ?? null;
  const totalAffectes = tauxGlobal?.engins_affectes ?? 0;
  const totalParcAffectation = tauxGlobal?.parc_total ?? 0;
  const tauxAffectationPct =
    tauxGlobal?.taux_affectation ??
    (totalParcAffectation > 0
      ? (totalAffectes / totalParcAffectation) * 100
      : 0);

  const quarterlyLineData = {
    labels: (rentabilite?.evolution ?? []).map((e) => formatQuarter(e.quarter)),
    datasets: [
      {
        label: "CA",
        data: (rentabilite?.evolution ?? []).map((e) => e.chiffre_affaires),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.12)",
        tension: 0.3,
        fill: false,
        borderWidth: 2,
      },
      {
        label: "Régularisation",
        data: (rentabilite?.evolution ?? []).map((e) => e.regularisation),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245,158,11,0.12)",
        tension: 0.3,
        fill: false,
      },
      {
        label: "Marge",
        data: (rentabilite?.evolution ?? []).map((e) => e.marge),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.12)",
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const quarterlyLineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { font: { size: 10 } }, grid: { display: false } },
      y: {
        type: "linear" as const,
        position: "left" as const,
        title: { display: true, text: "DA" },
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

  const caDonutData = {
    // Amounts (not row counts): the API returns the two halves of ca_total.
    labels: ["CA saisi (montant_service)", "CA calculé (h × tarif)"],
    values: [caStocke, caCalcule],
  };

  const affectationDonutData = {
    labels: ["Affectés", "Non affectés"],
    values: [
      totalAffectes,
      Math.max(0, totalParcAffectation - totalAffectes),
    ],
  };

  const rankingColumns: BreakdownColumn[] = [
    {
      key: "rang",
      label: "Rang",
      align: "center" as const,
      filterable: true,
      filterType: "number",
      render: (_v: unknown, row: Record<string, unknown>) => {
        const rang = row._rang as number;
        const medals = ["🥇", "🥈", "🥉"];
        if (rang <= 3) {
          return (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-700">
              {medals[rang - 1]}
            </span>
          );
        }
        return <span className="text-sm">{rang}</span>;
      },
    },
    {
      key: "code_materiel",
      label: "Engin",
      filterable: true,
      filterType: "text",
      render: (_v: unknown, row: Record<string, unknown>) => (
        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
          {row.code_materiel ? `${row.code_materiel} — ${row.designation || ""}` : "—"}
        </span>
      ),
    },
    { key: "libelle_famille", label: "Famille", filterable: true, filterType: "text" },
    { key: "libelle_filiale", label: "Filiale", filterable: true, filterType: "text" },
    { key: "chiffre_affaires", label: "CA (M DA)", align: "right" as const, render: (v: unknown) => fmtMillions(v) },
    { key: "regularisation", label: "Régularisation", align: "right" as const, render: (v: unknown) => fmtMillions(v) },
    {
      key: "marge",
      label: "Marge",
      align: "right" as const,
      render: (v: unknown) => (
        <span className={Number(v) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
          {fmtMillions(v)}
        </span>
      ),
    },
    {
      key: "statut",
      label: "Statut",
      align: "center" as const,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "Positive", label: "Positive" },
        { value: "Négative", label: "Négative" },
      ],
      render: (_v: unknown, row: Record<string, unknown>) => {
        const ok = Number(row.marge) >= 0;
        return <StatusBadge ok={ok} labelOk="Positive" labelKo="Négative" />;
      },
    },
  ];

  const rankingRows = ranking.map((r, i) => ({ ...r, _rang: i + 1 }));

  return (
    <div className="min-w-0">
      <Section title="Finances" accent="purple">
        <div className="grid grid-cols-1 gap-4 min-w-0 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="CA sur la période (M DA)"
            value={fmtMillions(caTotal)}
            subtext={<span className="text-xs text-gray-500">{filters.dateDebut} → {filters.dateFin}</span>}
            status="info"
          />
          <KpiCard
            title="Marge sur la période (M DA)"
            value={fmtMillions(margeTotal)}
            subtext={
              <span className="text-xs text-gray-500">
                Régularisation : {fmtMillions(regularisationTotale)}
              </span>
            }
            status={margeOk ? "success" : "danger"}
          />
          <KpiCard
            title="Engins classées"
            value={fmtNumber(ranking.length)}
            status="info"
          />
          <KpiCard
            title={`Taux d'affectation (vs ${DASHBOARD_TARGETS.tauxAffectation}%)`}
            value={pct(tauxAffectationPct)}
            subtext={<span className="text-xs text-gray-500">{fmtNumber(totalAffectes)} / {fmtNumber(totalParcAffectation)} affectés</span>}
            status={
              tauxAffectationPct >= DASHBOARD_TARGETS.tauxAffectation
                ? "success"
                : "warning"
            }
          />
        </div>
      </Section>

      <Section title="Évolution trimestrielle (CA / régularisation / marge)" accent="purple">
        <div className="min-w-0" style={{ height: 360 }}>
          <Line data={quarterlyLineData} options={quarterlyLineOptions} />
        </div>
      </Section>

      <Section title="CA saisi vs calculé et taux d'affectation" accent="purple">
        <div className="grid grid-cols-1 gap-6 min-w-0 md:grid-cols-2">
          <div className="min-w-0">
            <DonutChart data={caDonutData} />
          </div>
          <div className="min-w-0">
            <DonutChart data={affectationDonutData} centerLabel={`${fmtNumber(tauxAffectationPct)}%`} />
          </div>
        </div>
      </Section>

      <Section title="Classement rentabilité" accent="purple">
        <BreakdownTable
          columns={rankingColumns}
          rows={rankingRows}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          totalItems={rankingRows.length}
        />
      </Section>
    </div>
  );
}

const FinancesScreen = React.lazy(() => Promise.resolve({ default: FinancesScreenImpl }));

export default FinancesScreen;
