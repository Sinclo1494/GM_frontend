import { useMemo } from "react";
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
import type { DashboardData, RentabiliteEvolutionPoint, RentabiliteRankingItem } from "../../../types/dashboard";
import type { TooltipItem } from "chart.js";
import { components } from "../../../theme/components";
import formatCurrency from "../../../utils/FormatCurrency";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

interface RentabiliteTabProps {
  data: DashboardData;
}

const formatQuarterLabel = (isoDate: string | null) => {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  const year = d.getFullYear();
  const month = d.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return `Q${quarter} ${year}`;
};

const formatNumber = (value: number | null | undefined, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const RentabiliteTab = ({ data }: RentabiliteTabProps) => {
  const evolution = useMemo<RentabiliteEvolutionPoint[]>(() => {
    return data.rentabiliteEvolution ?? [];
  }, [data.rentabiliteEvolution]);

  const ranking = useMemo<RentabiliteRankingItem[]>(() => {
    return data.rentabiliteRanking ?? [];
  }, [data.rentabiliteRanking]);

  const totalCa = useMemo<number>(() => {
    return ranking.reduce((sum, item) => sum + (item.chiffre_affaires || 0), 0);
  }, [ranking]);

  const totalRegularisation = useMemo<number>(() => {
    return ranking.reduce((sum, item) => sum + (item.regularisation || 0), 0);
  }, [ranking]);

  const totalMarge = useMemo<number>(() => {
    return ranking.reduce((sum, item) => sum + (item.marge || 0), 0);
  }, [ranking]);

  const chartData = {
    labels: evolution.map((p) => formatQuarterLabel(p.quarter)),
    datasets: [
      {
        label: "Marge",
        data: evolution.map((p) => p.marge || 0),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Chiffre d'affaires",
        data: evolution.map((p) => p.chiffre_affaires || 0),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.05)",
        fill: false,
        tension: 0.3,
      },
      {
        label: "Regularisation",
        data: evolution.map((p) => p.regularisation || 0),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.05)",
        fill: false,
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
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"line">) {
            const label = context.dataset.label || "";
            const value = context.parsed.y ?? 0;
            if (label.includes("Marge") || label.includes("Chiffre") || label.includes("Regularisation")) {
              return `${label}: ${formatCurrency(value)}`;
            }
            return `${label}: ${formatNumber(value)}`;
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className={`${components.card} p-4 relative overflow-hidden`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Chiffre d'affaires
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatCurrency(totalCa)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            Période sélectionnée
          </p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Regularisation
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-400">
            {formatCurrency(totalRegularisation)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            Total période
          </p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Marge
          </p>
          <p className={`mt-2 text-2xl font-bold ${totalMarge >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
            {formatCurrency(totalMarge)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            CA - Regularisation
          </p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Engins classés
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatNumber(ranking.length)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            Trié par marge décroissante
          </p>
        </div>
      </div>

      {evolution.length > 0 && (
        <div className={components.card}>
          <h2 className={components.sectionTitle}>
            Évolution trimestrielle de la rentabilité
          </h2>
          <div className="mt-4 h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      <div className={components.card}>
        <h2 className={components.sectionTitle}>
          Classement rentabilité des engins
        </h2>
        {ranking.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500 dark:text-dark-text-secondary">
            Aucune donnée disponible pour la période sélectionnée.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={components.table.header}>
                  <th className="px-4 py-3 text-center">Rang</th>
                  <th className="px-4 py-3">Engin</th>
                  <th className="px-4 py-3">Famille</th>
                  <th className="px-4 py-3">Filiale</th>
                  <th className="px-4 py-3 text-right">Chiffre d'affaires</th>
                  <th className="px-4 py-3 text-right">Regularisation</th>
                  <th className="px-4 py-3 text-right">Marge</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((row, idx) => {
                  const rank = idx + 1;
                  const margeStatus = row.marge >= 0 ? "success" : "danger";
                  const topThree = rank <= 3;
                  return (
                    <tr
                      key={row.code_materiel}
                      className={`${components.table.row} ${
                        idx % 2 === 0
                          ? "bg-white dark:bg-dark-card"
                          : "bg-slate-50/50 dark:bg-dark-bg-secondary/50"
                      } ${topThree ? "font-medium" : ""}`}
                    >
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            rank === 1
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : rank === 2
                                ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                : rank === 3
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-dark-text-primary">
                        {row.code_materiel}
                        <span className="block text-xs text-gray-500 dark:text-dark-text-secondary">
                          {row.designation}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-dark-text-primary">
                        {row.libelle_famille || row.code_famille}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-dark-text-primary">
                        {row.libelle_filiale || row.code_filiale}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-800 dark:text-dark-text-primary">
                        {formatCurrency(row.chiffre_affaires)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-800 dark:text-dark-text-primary">
                        {formatCurrency(row.regularisation)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        <span
                          className={
                            row.marge >= 0
                              ? "text-green-700 dark:text-green-400"
                              : "text-red-700 dark:text-red-400"
                          }
                        >
                          {formatCurrency(row.marge)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            margeStatus === "success"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {row.marge >= 0 ? "Positif" : "Négatif"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentabiliteTab;
