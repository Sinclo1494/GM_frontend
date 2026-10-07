import React from "react";
import { components } from "../../../theme/components";

export type KpiStatus = "success" | "warning" | "danger" | "info";

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: React.ReactNode;
  status?: KpiStatus;
  sparkline?: number[];
}

const STATUS_BORDER: Record<KpiStatus, string> = {
  success: "bg-green-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-gray-500",
};

const MiniSparkline = React.memo<{ data: number[] }>(({ data }) => {
  if (!data || data.length < 2) return null;
  const width = 120;
  const height = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-blue-500 dark:text-blue-400"
      />
    </svg>
  );
});

MiniSparkline.displayName = "MiniSparkline";

const KpiCard = React.memo<KpiCardProps>(({ title, value, subtext, status, sparkline }) => (
  <div className={`${components.card} p-4 relative overflow-hidden min-w-0`}>
    {status && (
      <div className={`absolute top-0 left-0 right-0 h-1 ${STATUS_BORDER[status]}`} />
    )}
    <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">
      {title}
    </p>
    <p
      className="mt-2 text-2xl font-bold text-gray-800 dark:text-dark-text-primary whitespace-nowrap overflow-hidden text-ellipsis"
      title={String(value)}
    >
      {value}
    </p>
    {subtext && (
      <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">
        {subtext}
      </p>
    )}
    {sparkline && sparkline.length > 1 && <div className="mt-2"><MiniSparkline data={sparkline} /></div>}
  </div>
));

KpiCard.displayName = "KpiCard";

export default KpiCard;