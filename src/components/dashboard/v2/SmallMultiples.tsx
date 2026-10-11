import React from "react";
import { Line } from "react-chartjs-2";
import "./ChartSetup";

export interface SmallMultipleItem {
  title: string;
  data: number[];
  /** Short caption explaining what the curve shows (units, formula…). */
  description?: string;
  /** X-axis labels, one per data point (e.g. month keys). */
  xLabels?: string[];
  /** Show the Y axis ticks with values (default: false to keep cards compact). */
  showYAxis?: boolean;
  options?: Record<string, unknown>;
}

export interface SmallMultiplesProps {
  items: SmallMultipleItem[];
}

const fmtY = (v: unknown) => {
  const n = Number(v) || 0;
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(Math.round(n));
};

const baseOptions = (item: SmallMultipleItem) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false as const,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      callbacks: {
        title: (tooltipItems: { label: string }[]) =>
          item.xLabels?.[Number(tooltipItems[0]?.label) - 1] ?? tooltipItems[0]?.label,
        label: (ctx: { parsed: { y: number | null } }) =>
          ` ${item.title}: ${fmtY(ctx.parsed.y)}`,
      },
    },
    title: {
      display: true,
      text: item.title,
      font: { size: 11, weight: "bold" as const },
      color: "#334155",
    },
  },
  scales: {
    x: {
      display: true,
      ticks: {
        color: "#94a3b8",
        font: { size: 9 },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 6,
        callback: (_v: unknown, idx: number) =>
          item.xLabels?.[idx] ?? String(idx + 1),
      },
      grid: { display: false },
    },
    y: {
      display: !!item.showYAxis,
      beginAtZero: true,
      ticks: {
        color: "#94a3b8",
        font: { size: 9 },
        callback: (_v: unknown, val: number) => fmtY(val),
      },
      grid: { color: "#f1f5f9" },
    },
  },
  elements: {
    line: { borderWidth: 1.5 },
    point: { radius: 0, hoverRadius: 4 },
  },
});

const SmallMultiples = React.memo<SmallMultiplesProps>(({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
        Aucune donnée
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 min-w-0 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const chartData = {
          labels: item.data.map((_, i) => String(i + 1)),
          datasets: [
            {
              data: item.data,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59,130,246,0.12)",
              fill: true,
              tension: 0.3,
              borderWidth: 1.5,
              pointRadius: 0,
            },
          ],
        };
        const options = { ...baseOptions(item), ...(item.options ?? {}) };
        return (
          <div
            key={item.title}
            className="min-w-0 flex flex-col"
          >
            <div className="min-w-0" style={{ height: 200 }}>
              <Line data={chartData} options={options} />
            </div>
            {item.description && (
              <p className="mt-1.5 text-[11px] leading-snug text-gray-500 dark:text-dark-text-secondary">
                {item.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
});

SmallMultiples.displayName = "SmallMultiples";

export default SmallMultiples;