import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { PALETTE_VALUES } from "./ChartSetup";

export interface DonutChartDataset {
  labels: string[];
  values: number[];
}

export interface DonutChartProps {
  data: DonutChartDataset;
  centerLabel?: string;
  colors?: string[];
}

const DonutChart = React.memo<DonutChartProps>(({ data, centerLabel, colors }) => {
  const total = useMemo(
    () => (data.values ?? []).reduce((sum, v) => sum + (Number(v) || 0), 0),
    [data.values],
  );

  const chartData = useMemo(() => {
    const labels = data.labels ?? [];
    const values = data.values ?? [];
      const palette = colors?.length === labels.length ? colors : undefined;
      const resolved = labels.map((_, i) =>
        palette?.[i] ?? PALETTE_VALUES[i % PALETTE_VALUES.length],
      );
      return {
        labels,
        datasets: [
          {
            data: values.map((v) => Number(v) || 0),
            backgroundColor: resolved,
          borderColor: "transparent",
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  }, [data.labels, data.values, colors]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            usePointStyle: true,
            padding: 16,
            font: { size: 11 },
            color: "#6b7280",
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx: { label: string; parsed: number }) => {
              const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : "0.0";
              return ` ${ctx.label}: ${ctx.parsed.toLocaleString("fr-FR")} (${pct}%)`;
            },
          },
        },
      },
    }),
    [total],
  );

  return (
    <div className="relative w-full" style={{ height: 260 }}>
      <Doughnut data={chartData} options={options} />
      {centerLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-gray-800 dark:text-dark-text-primary whitespace-nowrap overflow-hidden text-ellipsis max-w-[80%]">
            {centerLabel}
          </span>
        </div>
      )}
    </div>
  );
});

DonutChart.displayName = "DonutChart";

export default DonutChart;