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
import type { DashboardData, DashboardFilters, CoutPanneEvolutionPoint, CoutPanneBreakdownItem } from "../../../types/dashboard";
import type { TooltipItem } from "chart.js";
import { components } from "../../../theme/components";
import formatCurrency from "../../../utils/FormatCurrency";
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

interface CoutPanneTabProps {
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

const CoutPanneTab = ({ data, filters }: CoutPanneTabProps) => {
  const evolution = useMemo<CoutPanneEvolutionPoint[]>(() => {
    return data.coutPanneEvolution ?? [];
  }, [data.coutPanneEvolution]);

  const breakdown = useMemo<CoutPanneBreakdownItem[]>(() => {
    return data.coutPanneBreakdown ?? [];
  }, [data.coutPanneBreakdown]);

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

  const totalCoutPanne = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.cout_panne || 0), 0);
  }, [evolution]);

  const totalHeuresPanne = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.heures_panne || 0), 0);
  }, [evolution]);

  const totalRecordsWithTarif = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.records_with_tarif || 0), 0);
  }, [evolution]);

  const totalRecordsWithoutTarif = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.records_without_tarif || 0), 0);
  }, [evolution]);

  const totalRecords = totalRecordsWithTarif + totalRecordsWithoutTarif;

  const tarifMoyenPondere = useMemo<number>(() => {
    if (totalHeuresPanne > 0 && totalRecordsWithTarif > 0) {
      return totalCoutPanne / totalHeuresPanne;
    }
    return 0;
  }, [totalCoutPanne, totalHeuresPanne, totalRecordsWithTarif]);

  const chartData = {
    labels: evolution.map((p) => formatMonthLabel(p.mmaa)),
    datasets: [
      {
        label: "Coût de la panne (DA)",
        data: evolution.map((p) => p.cout_panne || 0),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Heures panne",
        data: evolution.map((p) => p.heures_panne || 0),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.05)",
        fill: false,
        tension: 0.3,
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { usePointStyle: true, padding: 20, font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"line">) {
            const label = context.dataset.label || "";
            const value = context.parsed.y ?? 0;
            if (label.includes("Coût")) {
              return `${label}: ${formatCurrency(value)}`;
            }
            return `${label}: ${formatNumber(value, 1)} h`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        position: "left" as const,
        grid: { color: "#f1f5f9" },
        ticks: {
          font: { size: 11 },
          callback: function (value: number | string) {
            return formatCurrency(value);
          },
        },
      },
      y1: {
        position: "right" as const,
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          callback: function (value: number | string) {
            return `${value} h`;
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

  const hasMissingTarif = totalRecordsWithoutTarif > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className={`${components.card} p-4 relative overflow-hidden`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Coût de la panne — Manque à gagner
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatCurrency(totalCoutPanne)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            Total période sélectionnée
          </p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Heures panne
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatNumber(totalHeuresPanne, 1)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">Heures</p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Tarif horaire pondéré
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-dark-text-primary">
            {tarifMoyenPondere > 0 ? formatCurrency(tarifMoyenPondere) : "—"}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            DA/h (pondéré)
          </p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Enregistrements
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatNumber(totalRecords)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            {formatNumber(totalRecordsWithTarif)} avec tarif · {formatNumber(totalRecordsWithoutTarif)} sans tarif
          </p>
        </div>
      </div>

      {hasMissingTarif && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <p className="font-medium">Données tarifaires incomplètes</p>
          <p className="mt-1">
            {totalRecordsWithoutTarif} enregistrement(s) de pointage n'ont pas de taux de location défini.
            Le coût de la panne affiché ne tient compte que des enregistrements avec tarif horaire disponible.
          </p>
        </div>
      )}

      <div className={components.card}>
        <h2 className={components.sectionTitle}>
          Évolution mensuelle du coût de la panne
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
                    <th className="px-4 py-3 text-right">Coût de la panne</th>
                    <th className="px-4 py-3 text-center">Avec tarif</th>
                    <th className="px-4 py-3 text-center">Sans tarif</th>
                    <th className="px-4 py-3 text-right">Part du total</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBreakdown.map((row, idx) => {
                    const pct = totalCoutPanne > 0 ? (row.cout_panne / totalCoutPanne) * 100 : 0;
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
                          {formatNumber(row.heures_panne, 1)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-dark-text-primary">
                          {formatCurrency(row.cout_panne)}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-800 dark:text-dark-text-primary">
                          {formatNumber(row.records_with_tarif)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {row.records_without_tarif > 0 ? (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              {formatNumber(row.records_without_tarif)}
                            </span>
                          ) : (
                            <span className="text-gray-800 dark:text-dark-text-primary">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-800 dark:text-dark-text-primary">
                          {totalCoutPanne > 0 ? `${pct.toFixed(1)}%` : "—"}
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

export default CoutPanneTab;
