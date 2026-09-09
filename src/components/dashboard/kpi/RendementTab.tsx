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
import type { DashboardData, DashboardFilters, RendementEvolutionPoint, RendementBreakdownItem } from "../../../types/dashboard";
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

interface RendementTabProps {
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

const RendementTab = ({ data, filters }: RendementTabProps) => {
  const evolution = useMemo<RendementEvolutionPoint[]>(() => {
    return data.rendementEvolution ?? [];
  }, [data.rendementEvolution]);

  const breakdown = useMemo<RendementBreakdownItem[]>(() => {
    return data.rendementBreakdown ?? [];
  }, [data.rendementBreakdown]);

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

  const totalPotentiel = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.potentiel || 0), 0);
  }, [evolution]);

  const totalPanne = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.heures_panne || 0), 0);
  }, [evolution]);

  const totalService = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.heures_service || 0), 0);
  }, [evolution]);

  const disponibilite = useMemo<number>(() => {
    if (totalPotentiel > 0) {
      return ((totalPotentiel - totalPanne) / totalPotentiel) * 100;
    }
    return 0;
  }, [totalPotentiel, totalPanne]);

  const tauxUtilisation = useMemo<number>(() => {
    if (totalPotentiel > 0) {
      return (totalService / totalPotentiel) * 100;
    }
    return 0;
  }, [totalService, totalPotentiel]);

  const rendement = useMemo<number>(() => {
    if (totalPotentiel > 0) {
      const disp = ((totalPotentiel - totalPanne) / totalPotentiel) * 100;
      const taux = (totalService / totalPotentiel) * 100;
      return (disp * taux) / 100;
    }
    return 0;
  }, [totalPotentiel, totalPanne, totalService]);

  const chartData = {
    labels: evolution.map((p) => formatMonthLabel(p.mmaa)),
    datasets: [
      {
        label: "Rendement global (%)",
        data: evolution.map((p) => (p.potentiel > 0 ? (p.disponibilite * p.taux_utilisation) / 100 : null)),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.3,
        spanGaps: true,
      },
      {
        label: "Taux de disponibilité (%)",
        data: evolution.map((p) => (p.potentiel > 0 ? p.disponibilite : null)),
        borderColor: "#6b7280",
        backgroundColor: "rgba(107, 114, 128, 0.05)",
        fill: false,
        tension: 0.3,
        spanGaps: true,
      },
      {
        label: "Taux d'utilisation (%)",
        data: evolution.map((p) => (p.potentiel > 0 ? p.taux_utilisation : null)),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.05)",
        fill: false,
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

  const rendementStatus = rendement >= 60 ? "success" : "danger";
  const rendementColor =
    rendement >= 60 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400";
  const rendementLabel = rendement >= 60 ? "Atteint" : "Alerte";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className={`${components.card} p-4 relative overflow-hidden`}>
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${
              rendementStatus === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Rendement global
          </p>
          <p className={`mt-2 text-3xl font-bold ${rendementColor}`}>
            {totalPotentiel > 0 ? `${rendement.toFixed(1)}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            Disponibilité × Utilisation
          </p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Taux de disponibilité
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            {totalPotentiel > 0 ? `${disponibilite.toFixed(1)}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            Potentiel : {formatNumber(totalPotentiel, 1)} H — Panne :{" "}
            {formatNumber(totalPanne, 1)} H
          </p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Taux d'utilisation
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            {totalPotentiel > 0 ? `${tauxUtilisation.toFixed(1)}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            Potentiel : {formatNumber(totalPotentiel, 1)} H — Service :{" "}
            {formatNumber(totalService, 1)} H
          </p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Seuil alerte
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            {rendement.toFixed(1)}%
          </p>
          <span
            className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
              rendementStatus === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {rendementLabel}
          </span>
        </div>
      </div>

      <div className={components.card}>
        <h2 className={components.sectionTitle}>
          Évolution mensuelle du rendement global
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
                    <th className="px-4 py-3 text-right">Heures service (H)</th>
                    <th className="px-4 py-3 text-right">Heures panne (H)</th>
                    <th className="px-4 py-3 text-right">Disponibilité</th>
                    <th className="px-4 py-3 text-right">Taux d'utilisation</th>
                    <th className="px-4 py-3 text-right">Rendement</th>
                    <th className="px-4 py-3 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBreakdown.map((row, idx) => {
                    const itemStatus = row.rendement >= 60 ? "success" : "danger";
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
                          {formatNumber(row.heures_service, 1)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-800 dark:text-dark-text-primary">
                          {formatNumber(row.heures_panne, 1)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-dark-text-primary">
                          {row.potentiel > 0 ? `${row.disponibilite.toFixed(1)}%` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-dark-text-primary">
                          {row.potentiel > 0 ? `${row.taux_utilisation.toFixed(1)}%` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-dark-text-primary">
                          {row.potentiel > 0 ? `${row.rendement.toFixed(1)}%` : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                              itemStatus === "success"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {row.rendement >= 60 ? "Atteint" : "Alerte"}
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

export default RendementTab;
