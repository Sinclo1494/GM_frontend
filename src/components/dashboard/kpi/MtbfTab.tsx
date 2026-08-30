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
import type { DashboardData, DashboardFilters, MtbfEvolutionPoint, MtbfBreakdownItem } from "../../../types/dashboard";
import { components } from "../../../theme/components";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

interface MtbfTabProps {
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

const MtbfTab = ({ data, filters }: MtbfTabProps) => {
  const evolution = useMemo<MtbfEvolutionPoint[]>(() => {
    return data.mtbfEvolution ?? [];
  }, [data.mtbfEvolution]);

  const breakdown = useMemo<MtbfBreakdownItem[]>(() => {
    return data.mtbfBreakdown ?? [];
  }, [data.mtbfBreakdown]);

  const totalHeuresService = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.heures_service || 0), 0);
  }, [evolution]);

  const totalNombrePannes = useMemo<number>(() => {
    return evolution.reduce((sum, p) => sum + (p.nombre_pannes || 0), 0);
  }, [evolution]);

  const mtbf = useMemo<number>(() => {
    if (totalNombrePannes > 0) {
      return totalHeuresService / totalNombrePannes;
    }
    return 0;
  }, [totalHeuresService, totalNombrePannes]);

  const chartData = {
    labels: evolution.map((p) => formatMonthLabel(p.mmaa)),
    datasets: [
      {
        label: "MTBF (h)",
        data: evolution.map((p) =>
          p.nombre_pannes > 0 ? p.heures_service / p.nombre_pannes : null
        ),
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
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            MTBF
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            {totalNombrePannes > 0 ? `${formatNumber(mtbf, 1)} h` : "—"}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            H.service : {formatNumber(totalHeuresService, 1)} — Pannes : {formatNumber(totalNombrePannes, 0)}
          </p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Heures service
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatNumber(totalHeuresService, 1)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">Heures</p>
        </div>

        <div className={`${components.card} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary">
            Nombre de pannes
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            {formatNumber(totalNombrePannes, 0)}
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
          Évolution mensuelle du MTBF
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
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={components.table.header}>
                  <th className="px-4 py-3">{niveauHeader}</th>
                  <th className="px-4 py-3 text-right">Heures service (H)</th>
                  <th className="px-4 py-3 text-right">Nombre de pannes</th>
                  <th className="px-4 py-3 text-right">MTBF</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row, idx) => {
                  const itemMtbf = row.nombre_pannes > 0 ? row.heures_service / row.nombre_pannes : null;
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
                        {formatNumber(row.heures_service, 1)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-800 dark:text-dark-text-primary">
                        {formatNumber(row.nombre_pannes, 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-dark-text-primary">
                        {itemMtbf !== null ? `${formatNumber(itemMtbf, 1)} h` : "—"}
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

export default MtbfTab;
