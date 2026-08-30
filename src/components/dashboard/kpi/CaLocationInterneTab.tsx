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
import type { DashboardData, DashboardFilters, CaLocationInterneEvolutionPoint, CaLocationInterneBreakdownItem } from "../../../types/dashboard";
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

interface CaLocationInterneTabProps {
  data: DashboardData;
  filters: DashboardFilters;
}

const formatMonthLabel = (isoDate: string | null) => {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
};

const formatNumber = (value: number | null | undefined, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const CaLocationInterneTab = ({ data, filters }: CaLocationInterneTabProps) => {
  const evolution = useMemo<CaLocationInterneEvolutionPoint[]>(() => {
    return data.caLocationInterneEvolution ?? [];
  }, [data.caLocationInterneEvolution]);

  const breakdown = useMemo<CaLocationInterneBreakdownItem[]>(() => {
    return data.caLocationInterneBreakdown ?? [];
  }, [data.caLocationInterneBreakdown]);

  const totalCa = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.total_ca || 0), 0);
  }, [evolution]);

  const totalStored = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.ca_stored || 0), 0);
  }, [evolution]);

  const totalCalculated = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.ca_calculated || 0), 0);
  }, [evolution]);

  const totalRecordsWithMontant = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.records_with_montant || 0), 0);
  }, [evolution]);

  const totalRecordsWithoutMontant = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.records_without_montant || 0), 0);
  }, [evolution]);

  const totalRecords = totalRecordsWithMontant + totalRecordsWithoutMontant;

  const chartData = {
    labels: evolution.map((p) => formatMonthLabel(p.mmaa)),
    datasets: [
      {
        label: "CA location interne",
        data: evolution.map((p) => p.total_ca || 0),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.3,
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
        grid: { color: "#f1f5f9" },
        ticks: {
          font: { size: 11 },
          callback: function (value: number | string) {
            return formatCurrency(value);
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

  const breakdownWithPct = useMemo(() => {
    return breakdown.map((row) => ({
      ...row,
      pct: totalCa > 0 ? (row.ca_total / totalCa) * 100 : 0,
    }));
  }, [breakdown, totalCa]);

  const [breakdownPage, setBreakdownPage] = useState(1);
  const [breakdownPageSize, setBreakdownPageSize] = useState(10);

  const paginatedBreakdown = useMemo(() => {
    const start = (breakdownPage - 1) * breakdownPageSize;
    return breakdownWithPct.slice(start, start + breakdownPageSize);
  }, [breakdownWithPct, breakdownPage, breakdownPageSize]);

  const prevBreakdownLengthRef = React.useRef(breakdownWithPct.length);
  React.useEffect(() => {
    if (prevBreakdownLengthRef.current !== breakdownWithPct.length) {
      prevBreakdownLengthRef.current = breakdownWithPct.length;
      setBreakdownPage(1);
    }
  }, [breakdownWithPct.length]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className={`${components.card} p-4 relative overflow-hidden`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            CA location interne
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatCurrency(totalCa)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            Total période sélectionnée
          </p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Montant service stocké
          </p>
          <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-400">
            {formatCurrency(totalStored)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            {totalRecords > 0 ? `${((totalStored / totalCa) * 100).toFixed(1)}%` : "—"} du CA
          </p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Montant calculé (fallback)
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-400">
            {formatCurrency(totalCalculated)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            {totalRecords > 0 ? `${((totalCalculated / totalCa) * 100).toFixed(1)}%` : "—"} du CA
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
            {formatNumber(totalRecordsWithMontant)} avec montant · {formatNumber(totalRecordsWithoutMontant)} sans montant
          </p>
        </div>
      </div>

      <div className={components.card}>
        <h2 className={components.sectionTitle}>
          Évolution mensuelle du chiffre d'affaires location interne
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
                    <th className="px-4 py-3 text-right">CA location interne</th>
                    <th className="px-4 py-3 text-right">Nb avec montant</th>
                    <th className="px-4 py-3 text-right">Nb sans montant</th>
                    <th className="px-4 py-3 text-right">% contribution</th>
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
                        {formatCurrency(row.ca_total)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-800 dark:text-dark-text-primary">
                        {formatNumber(row.records_with_montant)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-800 dark:text-dark-text-primary">
                        {formatNumber(row.records_without_montant)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-dark-text-primary">
                        {row.pct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={breakdownPage}
              totalPages={Math.max(1, Math.ceil(breakdownWithPct.length / breakdownPageSize))}
              totalItems={breakdownWithPct.length}
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

export default CaLocationInterneTab;
