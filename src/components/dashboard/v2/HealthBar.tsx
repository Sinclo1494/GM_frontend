import React from "react";
import { components } from "../../../theme/components";
import { fmtMillions } from "./screens";
import { DASHBOARD_TARGETS } from "./dashboardTargets";

export interface HealthBarKpis {
  parcTotal?: number;
  situationTotal?: number;
  disponibilite?: number;
  rendement?: number;
  marge?: number;
}

interface HealthBarProps {
  kpis: HealthBarKpis;
}

const HealthBar = React.memo<HealthBarProps>(({ kpis }) => {
  const parcTotal = kpis.parcTotal ?? 0;
  const disponibilite = kpis.disponibilite ?? 0;
  const rendement = kpis.rendement ?? 0;
  const marge = kpis.marge ?? 0;

  const dispOk = disponibilite >= DASHBOARD_TARGETS.disponibilite;
  const rendOk = rendement >= DASHBOARD_TARGETS.rendement;
  const margePositive = marge >= 0;

  const tiles = [
    {
      label: "Parc total",
      value: parcTotal.toLocaleString("fr-FR"),
      subtext: undefined,
      valueClass: "text-gray-800 dark:text-dark-text-primary",
    },
    {
      label: "Disponibilité",
      value: `${disponibilite.toFixed(1)}%`,
      subtext: dispOk
        ? `✓ ≥ ${DASHBOARD_TARGETS.disponibilite}%`
        : `✕ < ${DASHBOARD_TARGETS.disponibilite}%`,
      valueClass: dispOk ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
    },
    {
      label: "Rendement",
      value: `${rendement.toFixed(1)}%`,
      subtext: rendOk
        ? `✓ ≥ ${DASHBOARD_TARGETS.rendement}%`
        : `✕ < ${DASHBOARD_TARGETS.rendement}%`,
      valueClass: rendOk ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
    },
    {
      label: "Marge (M DA)",
      value: fmtMillions(marge),
      subtext: margePositive ? "positive" : "négative",
      valueClass: margePositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="sticky top-0 z-20 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 min-w-0 px-6 py-4">
        {tiles.map((tile) => (
          <div key={tile.label} className={`${components.card} p-4 min-w-0`}>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">
              {tile.label}
            </p>
            <p
              className={`mt-1 text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis ${tile.valueClass}`}
              title={tile.value}
            >
              {tile.value}
            </p>
            {tile.subtext && (
              <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">
                {tile.subtext}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

HealthBar.displayName = "HealthBar";

export default HealthBar;