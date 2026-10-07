import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
);

export { ChartJS };

/**
 * Colours of the parc donut slices, keyed by the bucket codes published by
 * `DashboardV2Service._situation_distribution`.
 *
 * Those codes describe the `(type_affectation, type_situation)` bucket, NOT the
 * raw situation code: `07` is "Immobilisé base" and `99` the residual "Autres"
 * bucket, so the same colour always denotes the same slice as the matching KPI
 * card. `05` (raw situation "Autre") and the `ALREM` key are gone: neither is a
 * bucket any more.
 */
export const SITUATION_COLORS: Record<string, string> = {
  "01": "#22c55e",
  "02": "#f59e0b",
  "03": "#ef4444",
  "04": "#6b7280",
  "06": "#8b5cf6",
  "07": "#94a3b8",
  "99": "#cbd5e1",
};

export const PALETTE_VALUES = Object.values(SITUATION_COLORS);