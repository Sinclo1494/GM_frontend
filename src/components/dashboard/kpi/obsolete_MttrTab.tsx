import React, { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import type { DashboardData, DashboardFilters, MttrEvolutionPoint, MttrBreakdownItem } from "../../../types/dashboard";
import { components } from "../../../theme/components";
import PaginationControls from "../../../components/common/PaginationControls";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

interface MttrTabProps {
  data: DashboardData;
  filters: DashboardFilters;
}

const formatMonthLabel = (isoDate: string | null) => {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
};

const formatNumber = (value: number | null | undefined, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const MttrTab = ({ data, filters }: MttrTabProps) => {
  const evolution = useMemo<MttrEvolutionPoint[]>(() => {
    return data.mttrEvolution ?? [];
  }, [data.mttrEvolution]);

  const breakdown = useMemo<MttrBreakdownItem[]>(() => {
    return data.mttrBreakdown ?? [];
  }, [data.mttrBreakdown]);

  const [breakdownPage, setBreakdownPage] = useState(1);
  const [breakdownPageSize, setBreakdownPageSize] = useState(10);

  const paginatedBreakdown = useMemo(() => {
    const start = (breakdownPage - 1) * breakdownPageSize;
    return breakdown.slice(start, start + breakdownPageSize);
  }, [breakdown, breakdownPage, breakdownPageSize]);

  const prevBreakdownLengthRef = React.useRef(breakdown.length);
  React.useEffect(() => {
    if (prevBreakdownLengthRef.current !== breakdown.length) {
      prevBreakdownLengthRef.current = breakdown.length;
      setBreakdownPage(1);
    }
  }, [breakdown.length]);

  const totalHeuresPanne = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.heures_panne || 0), 0);
  }, [evolution]);

  const totalInterventionsCorrectives = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.interventions_correctives || 0), 0);
  }, [evolution]);

  const mttr = useMemo<number>(() => {
    if (totalInterventionsCorrectives > 0) {
      return totalHeuresPanne / totalInterventionsCorrectives;
    }
    return 0;
  }, [totalHeuresPanne, totalInterventionsCorrectives]);

  const chartData = {
    labels: evolution.map((p) => formatMonthLabel(p.mmaa)),
    datasets: [
      {
        label: "MTTR (h)",
        data: evolution.map((p) =>
          p.interventions_correctives > 0 ? p.heures_panne / p.interventions_correctives : null
        ),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        fill: true,
        tension: 0.3,
        spanGaps: true,
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
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        min: 0,
        grid: { color: "#f1f5f9" },
        ticks: {
          font: { size: 11 },
          callback: function (value: number | string) {
            return value + " h";
          },
        },
      },
    },
  };

  const niveauLabel =
    filters.niveau === "famille"
      ? "famille d'engins"
      : filters.niveau === "chantier"
        ? "chantier"
        : filters.niveau === "groupe"
          ? "groupe"
          : "engin";

  const niveauHeader =
    filters.niveau === "famille"
      ? "Famille"
      : filters.niveau === "chantier"
        ? "Chantier"
        : filters.niveau === "groupe"
          ? "Groupe"
          : "Engin";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className={`${components.card} p-4 relative overflow-hidden`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            MTTR
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            {totalInterventionsCorrectives > 0 ? `${formatNumber(mttr, 1)} h` : "—"}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            H.panne : {formatNumber(totalHeuresPanne, 1)} — Interv. correctives : {formatNumber(totalInterventionsCorrectives, 0)}
          </p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Heures panne
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatNumber(totalHeuresPanne, 1)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">Heures</p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Interventions correctives
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatNumber(totalInterventionsCorrectives, 0)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">Événements</p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Période
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            {evolution.length > 0 ? `${evolution.length} mois` : "—"}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">Rolling 12 mois</p>
        </div>
      </div>

      <div className={components.card}>
        <h2 className={components.sectionTitle}>
          Évolution mensuelle du MTTR
        </h2>
        {evolution.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500 dark:text-dark-text-secondary">
            Aucune donnée disponible pour la période sélectionnée.
          </p>
        ) : (
          <div className="mt-4 h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>

      <div className={components.card}>
        <h2 className={components.sectionTitle}>
          Détail par {niveauLabel}
        </h2>
        {breakdown.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500 dark:text-dark-text-secondary">
            Aucune donnée disponible pour le niveau sélectionné.
          </p>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={components.table.header}>
                    <th className="px-4 py-3">{niveauHeader}</th>
                    <th className="px-4 py-3 text-right">Heures panne (H)</th>
                    <th className="px-4 py-3 text-right">Interventions correctives</th>
                    <th className="px-4 py-3 text-right">MTTR</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBreakdown.map((row, idx) => (
                    <tr
                      key={row.code}
                      className={`${components.table.row} ${
                        idx % 2 === 0
                          ? "bg-white dark:bg-dark-card"
                          : "bg-slate-50/50 dark:bg-dark-bg-secondary/50"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-dark-text-primary">
                        {row.libelle || row.code}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-800 dark:text-dark-text-primary">
                        {formatNumber(row.heures_panne, 1)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-800 dark:text-dark-text-primary">
                        {formatNumber(row.interventions_correctives, 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-dark-text-primary">
                        {row.mttr !== null ? `${formatNumber(row.mttr, 1)} h` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={breakdownPage}
              totalPages={Math.max(1, Math.ceil(breakdown.length / breakdownPageSize))}
              totalItems={breakdown.length}
              itemsPerPage={breakdownPageSize}
              onPageChange={setBreakdownPage}
              onItemsPerPageChange={setBreakdownPageSize}
              showItemCount={true}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MttrTab;
