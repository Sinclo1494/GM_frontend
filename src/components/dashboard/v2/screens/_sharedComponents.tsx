import { type ReactNode } from "react";
import { components as themeComponents } from "../../../../theme/components";

export const Section = ({
  title,
  children,
  accent = "blue",
}: {
  title: string;
  children: ReactNode;
  accent?: string;
}) => {
  const accentColors: Record<string, string> = {
    blue: "bg-gray-600",
    green: "bg-green-600",
    amber: "bg-amber-600",
    purple: "bg-purple-600",
    red: "bg-red-600",
    teal: "bg-teal-600",
  };
  return (
    <div className={themeComponents.card}>
      <div
        className={`h-1.5 w-full ${accentColors[accent] ?? accentColors.blue} rounded-t-xl -mx-6 -mt-6 mb-4`}
      />
      <h2 className={themeComponents.sectionTitle}>{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
};

export const StatusBadge = ({
  ok,
  labelOk,
  labelKo,
}: {
  ok: boolean;
  labelOk?: string;
  labelKo?: string;
}) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
      ok
        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    }`}
  >
    {ok ? labelOk ?? "Atteint" : labelKo ?? "Non atteint"}
  </span>
);

export const AmberBadge = ({ label }: { label: string }) => (
  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
    {label}
  </span>
);

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-400" />
  </div>
);

export const ErrorBox = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
    <p className="font-medium">Erreur de chargement</p>
    <p className="mt-1 text-sm">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60"
      >
        Réessayer
      </button>
    )}
  </div>
);
