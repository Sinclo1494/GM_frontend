import React from "react";
import { Line } from "react-chartjs-2";
import "./ChartSetup";

export interface SmallMultipleItem {
  title: string;
  data: number[];
  options?: Record<string, unknown>;
}

export interface SmallMultiplesProps {
  items: SmallMultipleItem[];
}

const baseOptions = (item: SmallMultipleItem) => ({
  responsive: true,
  maintainAspectRatio: false,
    animation: false as const,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
    title: {
      display: true,
      text: item.title,
      font: { size: 11, weight: "bold" as const },
      color: "#334155",
    },
  },
  scales: {
    x: { display: false },
    y: { display: false, beginAtZero: true },
  },
  elements: {
    line: { borderWidth: 1.5 },
    point: { radius: 0, hoverRadius: 3 },
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 min-w-0">
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
            className="min-w-0"
            style={{ height: 200 }}
          >
            <Line data={chartData} options={options} />
          </div>
        );
      })}
    </div>
  );
});

SmallMultiples.displayName = "SmallMultiples";

export default SmallMultiples;