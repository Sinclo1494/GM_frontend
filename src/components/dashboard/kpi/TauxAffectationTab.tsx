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
import type { DashboardData, DashboardFilters, TauxAffectationEvolutionPoint, TauxAffectationBreakdownItem } from "../../../types/dashboard";
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

interface TauxAffectationTabProps {
  data: DashboardData;
  filters: DashboardFilters;
}

const formatWeekLabel = (isoDate: string | null) => {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.getTime());
  monday.setDate(diff);
  const end = new Date(monday);
  end.setDate(monday.getDate() + 6);
  const startStr = monday.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  const endStr = end.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${startStr} - ${endStr}`;
};

const formatNumber = (value: number | null | undefined, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const TauxAffectationTab = ({ data, filters }: TauxAffectationTabProps) => {
  const evolution = useMemo<TauxAffectationEvolutionPoint[]>(() => {
    return data.tauxAffectationEvolution ?? [];
  }, [data.tauxAffectationEvolution]);

  const breakdown = useMemo<TauxAffectationBreakdownItem[]>(() => {
    return data.tauxAffectationBreakdown ?? [];
  }, [data.tauxAffectationBreakdown]);

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

  const totalDistinctEngins = useMemo<number>(() => {
    return evolution.length > 0 ? evolution[0].total_distinct_engins : 0;
  }, [evolution]);

  const totalParc = useMemo<number>(() => {
    return evolution.length > 0 ? evolution[0].parc_total : 0;
  }, [evolution]);

  const tauxAffectation = useMemo<number>(() => {
    if (totalParc > 0) {
      return (totalDistinctEngins / totalParc) * 100;
    }
    return 0;
  }, [totalDistinctEngins, totalParc]);

  const chartData = {
    labels: evolution.map((p) => formatWeekLabel(p.week)),
    datasets: [
      {
        label: "Taux d'affectation chantier (%)",
        data: evolution.map((p) => (p.parc_total > 0 ? p.taux_affectation : null)),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
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
        max: 100,
        grid: { color: "#f1f5f9" },
        ticks: {
          font: { size: 11 },
          callback: function (value: number | string) {
            return value + "%";
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

  const status = tauxAffectation >= 80 ? "success" : tauxAffectation >= 50 ? "warning" : "danger";
  const statusColor =
    status === "success"
      ? "text-green-700 dark:text-green-400"
      : status === "warning"
        ? "text-amber-700 dark:text-amber-400"
        : "text-red-700 dark:text-red-400";

  const enginsNonAffectes = totalParc - totalDistinctEngins;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className={`${components.card} p-4 relative overflow-hidden`}>
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${
              status === "success" ? "bg-green-500" : status === "warning" ? "bg-amber-500" : "bg-red-500"
            }`}
          />
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Taux d'affectation chantier
          </p>
          <p className={`mt-2 text-3xl font-bold ${statusColor}`}>
            {totalParc > 0 ? `${tauxAffectation.toFixed(1)}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            Affectés : {formatNumber(totalDistinctEngins)} / Parc : {formatNumber(totalParc)}
          </p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Engins affectés
          </p>
          <p className="mt-2 text-3xl font-bold text-green-700 dark:text-green-400">
            {formatNumber(totalDistinctEngins)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">unités</p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Parc total
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatNumber(totalParc)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">unités actives</p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Engins non affectés
          </p>
          <p className="mt-2 text-3xl font-bold text-red-700 dark:text-red-400">
            {formatNumber(enginsNonAffectes)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            {totalParc > 0 ? `${((enginsNonAffectes / totalParc) * 100).toFixed(1)}%` : "—"}
          </p>
        </div>
      </div>

      <div className={components.card}>
        <h2 className={components.sectionTitle}>
          Évolution hebdomadaire du taux d'affectation chantier
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
                    <th className="px-4 py-3 text-right">Parc total</th>
                    <th className="px-4 py-3 text-right">Engins affectés</th>
                    <th className="px-4 py-3 text-right">Taux d'affectation</th>
                    <th className="px-4 py-3 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBreakdown.map((row, idx) => {
                    const itemStatus = row.taux_affectation >= 80 ? "success" : row.taux_affectation >= 50 ? "warning" : "danger";
                    return (
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
                          {formatNumber(row.parc_total)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-800 dark:text-dark-text-primary">
                          {formatNumber(row.engins_affectes)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-dark-text-primary">
                          {row.parc_total > 0 ? `${row.taux_affectation.toFixed(1)}%` : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                              itemStatus === "success"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : itemStatus === "warning"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {row.taux_affectation >= 80 ? "Atteint" : row.taux_affectation >= 50 ? "Moyen" : "Alerte"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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

export default TauxAffectationTab;
