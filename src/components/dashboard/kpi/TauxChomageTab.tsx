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
import type { DashboardData, DashboardFilters, TauxChomageEvolutionPoint, TauxChomageBreakdownItem } from "../../../types/dashboard";
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

interface TauxChomageTabProps {
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

const TauxChomageTab = ({ data, filters }: TauxChomageTabProps) => {
  const evolution = useMemo<TauxChomageEvolutionPoint[]>(() => {
    return data.tauxChomageEvolution ?? [];
  }, [data.tauxChomageEvolution]);

  const breakdown = useMemo<TauxChomageBreakdownItem[]>(() => {
    return data.tauxChomageBreakdown ?? [];
  }, [data.tauxChomageBreakdown]);

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

  const totalHeuresChomage = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.heures_chomage || 0), 0);
  }, [evolution]);

  const totalPotentiel = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.potentiel || 0), 0);
  }, [evolution]);

  const tauxChomage = useMemo<number>(() => {
    if (totalPotentiel > 0) {
      return (totalHeuresChomage / totalPotentiel) * 100;
    }
    return 0;
  }, [totalHeuresChomage, totalPotentiel]);

  const chartData = {
    labels: evolution.map((p) => formatMonthLabel(p.mmaa)),
    datasets: [
      {
        label: "Taux de chômage (%)",
        data: evolution.map((p) =>
          p.potentiel > 0 ? (p.heures_chomage / p.potentiel) * 100 : null
        ),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        fill: true,
        tension: 0.3,
        spanGaps: true,
      },
      {
        label: "Seuil alerte (15%)",
        data: evolution.map(() => 15),
        borderColor: "#ef4444",
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
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

  const status = tauxChomage > 15 ? "danger" : "success";
  const statusColor =
    tauxChomage > 15 ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400";
  const thresholdLabel = tauxChomage > 15 ? "Alerte" : "Normal";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className={`${components.card} p-4 relative overflow-hidden`}>
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${
              status === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Taux de chômage
          </p>
          <p className={`mt-2 text-3xl font-bold ${statusColor}`}>
            {totalPotentiel > 0 ? `${tauxChomage.toFixed(1)}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            Potentiel : {formatNumber(totalPotentiel, 1)} H — Chômage :{" "}
            {formatNumber(totalHeuresChomage, 1)} H
          </p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Seuil alerte
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            15%
          </p>
          <span
            className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
              status === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {thresholdLabel}
          </span>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Potentiel total
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatNumber(totalPotentiel, 1)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">Heures</p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Heures chômage
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatNumber(totalHeuresChomage, 1)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">Heures</p>
        </div>
      </div>

      <div className={components.card}>
        <h2 className={components.sectionTitle}>
          Évolution mensuelle du taux de chômage
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
                    <th className="px-4 py-3 text-right">Potentiel (H)</th>
                    <th className="px-4 py-3 text-right">Heures chômage (H)</th>
                    <th className="px-4 py-3 text-right">Taux de chômage</th>
                    <th className="px-4 py-3 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBreakdown.map((row, idx) => {
                    const itemStatus = row.taux_chomage > 15 ? "danger" : "success";
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
                          {formatNumber(row.potentiel, 1)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-800 dark:text-dark-text-primary">
                          {formatNumber(row.heures_chomage, 1)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-dark-text-primary">
                          {row.potentiel > 0 ? `${row.taux_chomage.toFixed(1)}%` : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                              itemStatus === "success"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {row.taux_chomage > 15 ? "Alerte" : "Normal"}
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

export default TauxChomageTab;
