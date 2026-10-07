import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  SmallMultiples,
  BreakdownTable,
  KpiCard,
  Section,
  AmberBadge,
  LoadingSpinner,
  ErrorBox,
  useDashboardFilters,
  filtersToParams,
  NiveauHeader,
  pct,
  fmt,
  fmtNumber,
  fmtMillions,
} from "../index";
import type { BreakdownColumn } from "../index";
import { getDashboardV2Maintenance } from "../../../../api/dashboardV2Services";
import type { DashboardV2Maintenance } from "../../../../types/dashboardV2";

type MetricType = "mtbf" | "mttr" | "cout";

const METRIC_TABS: { id: MetricType; label: string }[] = [
  { id: "mtbf", label: "MTBF" },
  { id: "mttr", label: "MTTR" },
  { id: "cout", label: "Coût" },
];

function MaintenanceScreenImpl() {
  const filters = useDashboardFilters();
  const [maintenance, setMaintenance] = useState<DashboardV2Maintenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metric, setMetric] = useState<MetricType>("mtbf");

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
      const m = await getDashboardV2Maintenance(params);
      setMaintenance(m as DashboardV2Maintenance);
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

  const mtbf = maintenance?.mtbf;
  const mttr = maintenance?.mttr;
  const coutPanne = maintenance?.coutPanne;
  const entityHeader = NiveauHeader(filters.niveau);

  // The "total" cards recompute an AGGREGATED ratio out of the monthly series
  // (Σ numerator / Σ denominator), which is not the mean of the monthly
  // ratios — same definition as the backend `_maintenance_series`.
  // NOTE: `nombre_pannes` / `interventions_correctives` count *pointage rows*
  // with heures_panne > 0, not failure events: the real MTBF/MTTR would need
  // a Panne / Situation_Materiel history that does not exist in the model yet.
  const totalHeuresService = (mtbf?.evolution ?? []).reduce((s, e) => s + (e.heures_service ?? 0), 0);
  const totalPannes = (mtbf?.evolution ?? []).reduce((s, e) => s + (e.nombre_pannes ?? 0), 0);
  const mtbfTotal = totalPannes > 0 ? totalHeuresService / totalPannes : 0;

  const totalHeuresPanneMTTR = (mttr?.evolution ?? []).reduce((s, e) => s + (e.heures_panne ?? 0), 0);
  const totalInterventions = (mttr?.evolution ?? []).reduce((s, e) => s + (e.interventions_correctives ?? 0), 0);
  const mttrTotal = totalInterventions > 0 ? totalHeuresPanneMTTR / totalInterventions : 0;

  const coutTotal = (coutPanne?.evolution ?? []).reduce((s, e) => s + (e.cout_panne ?? 0), 0);
  // Weighted hourly rate = cost / hours *of the records that carry a tariff*.
  // Dividing by every heures_panne (including the rows with a NULL
  // taux_location, which contribute hours but no cost) biased it low.
  const heuresPanneAvecTarif = (coutPanne?.evolution ?? []).reduce(
    (s, e) => s + (e.heures_panne_avec_tarif ?? 0),
    0,
  );
  const tarifHoraire = heuresPanneAvecTarif > 0 ? coutTotal / heuresPanneAvecTarif : 0;

  // Breakdown sum only: it is entity-scoped and complete, while the evolution
  // sum covers the same rows again (adding both counted every missing-tariff
  // row twice).
  const recordsSansTarif = (coutPanne?.breakdown ?? []).reduce(
    (s, b) => s + (b.records_without_tarif ?? 0),
    0,
  );

  const smallMultiplesItems = [
    {
      title: "MTBF (h)",
      data: (mtbf?.evolution ?? []).map((e) => e.mtbf ?? 0),
    },
    {
      title: "MTTR (h)",
      data: (mttr?.evolution ?? []).map((e) => e.mttr ?? 0),
    },
    {
      title: "Coût panne (DA)",
      data: (coutPanne?.evolution ?? []).map((e) => e.cout_panne ?? 0),
    },
  ];

  const mtbfColumns: BreakdownColumn[] = [
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
    { key: "heures_service", label: "Heures service", align: "right" as const, render: (v: unknown) => fmtNumber(v, 1) },
    { key: "nombre_pannes", label: "Nombre pannes", align: "right" as const },
    { key: "mtbf", label: "MTBF (h)", align: "right" as const, render: (v: unknown) => fmt(v, 1) },
  ];

  const mttrColumns: BreakdownColumn[] = [
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
    { key: "heures_panne", label: "Heures panne", align: "right" as const, render: (v: unknown) => fmtNumber(v, 1) },
    { key: "interventions_correctives", label: "Interventions", align: "right" as const },
    { key: "mttr", label: "MTTR (h)", align: "right" as const, render: (v: unknown) => fmt(v, 1) },
  ];

  const coutColumns: BreakdownColumn[] = [
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
    { key: "heures_panne", label: "Heures panne", align: "right" as const, render: (v: unknown) => fmtNumber(v, 1) },
    { key: "cout_panne", label: "Coût (M DA)", align: "right" as const, render: (v: unknown) => fmtMillions(v) },
    { key: "records_with_tarif", label: "Avec tarif", align: "right" as const },
    { key: "records_without_tarif", label: "Sans tarif", align: "right" as const },
    {
      key: "part",
      label: "Part %",
      align: "right" as const,
      render: (_v: unknown, row: Record<string, unknown>) => {
        const total = Number(row.records_with_tarif) + Number(row.records_without_tarif);
        const without = Number(row.records_without_tarif);
        return total > 0 ? pct((without / total) * 100) : pct(0);
      },
    },
  ];

  const columnsForMetric = (() => {
    switch (metric) {
      case "mtbf": return mtbfColumns;
      case "mttr": return mttrColumns;
      case "cout": return coutColumns;
    }
  })();

  const breakdownData = (() => {
    switch (metric) {
      case "mtbf": return maintenance?.mtbf?.breakdown ?? [];
      case "mttr": return maintenance?.mttr?.breakdown ?? [];
      case "cout": return maintenance?.coutPanne?.breakdown ?? [];
    }
  })();

  return (
    <div className="min-w-0">
      <Section title="Évolution (12 mois)" accent="red">
        <SmallMultiples items={smallMultiplesItems} />
      </Section>

      <Section title="Totaux" accent="red">
        <div className="grid grid-cols-1 gap-4 min-w-0 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            title="MTBF total (h service / pointage en panne)"
            value={fmt(mtbfTotal, 1)}
            subtext={<span className="text-xs text-gray-500">H. service: {fmtNumber(totalHeuresService, 1)} h | Pointages en panne: {fmtNumber(totalPannes)}</span>}
            status="info"
          />
          <KpiCard
            title="MTTR total (h panne / pointage en panne)"
            value={fmt(mttrTotal, 1)}
            subtext={<span className="text-xs text-gray-500">H. panne: {fmtNumber(totalHeuresPanneMTTR, 1)} h | Interventions: {fmtNumber(totalInterventions)}</span>}
            status="info"
          />
          <KpiCard
            title="Coût total (M DA)"
            value={fmtMillions(coutTotal)}
            subtext={<span className="text-xs text-gray-500">Tarif horaire pondéré: {fmtNumber(tarifHoraire, 2)} DA/h (sur {fmtNumber(heuresPanneAvecTarif, 1)} h tarifées)</span>}
            status="info"
          />
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-dark-text-secondary">
          MTBF / MTTR sont des ratios agrégés (Σ numérateur / Σ dénominateur) et
          non la moyenne des ratios mensuels. Leur dénominateur compte les
          <em> pointages avec heures de panne &gt; 0</em>, pas des événements de
          panne : un MTBF / MTTR exact demandera un historique
            <code> Panne</code> / <code>Situation_Materiel</code> qui n&apos;existe
          pas encore.
        </p>
      </Section>

      {recordsSansTarif > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
          <AmberBadge label={`Données tarifaires incomplètes (${recordsSansTarif} enregistrements sans tarif)}`} />
        </div>
      )}

      <Section title={`Détail — ${entityHeader}`} accent="red">
        <div className="mb-3 flex gap-1">
          {METRIC_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMetric(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                metric === tab.id
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-600 hover:text-gray-800 dark:text-dark-text-secondary dark:hover:text-dark-text-primary hover:border-gray-300 dark:border-dark-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <BreakdownTable
          columns={columnsForMetric}
          rows={breakdownData}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          totalItems={breakdownData.length}
        />
      </Section>
    </div>
  );
}

const MaintenanceScreen = React.lazy(() => Promise.resolve({ default: MaintenanceScreenImpl }));

export default MaintenanceScreen;
