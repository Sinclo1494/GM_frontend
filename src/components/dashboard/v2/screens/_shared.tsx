import { useState, useEffect, type ReactNode } from "react";
import { components as themeComponents } from "../../../../theme/components";
import type { DashboardFiltersState } from "../../../../hooks/useDashboardFilters";
import type { DashboardV2Params } from "../../../../api/dashboardV2Services";
import {
  getDashboardV2Filiales,
  getDashboardV2Familles,
} from "../../../../api/dashboardV2Services";
import type { DashboardV2Option } from "../../../../types/dashboardV2";

export const isAbortError = (e: unknown): boolean => {
  if (!(e instanceof Error)) return false;
  if (e.name === "CanceledError" || e.name === "AbortError") return true;
  const code = (e as { code?: string }).code;
  return code === "ERR_CANCELED" || code === "ABORT_ERR";
};

export const isMissing = (value: unknown): boolean => {
  if (value === null || value === undefined || value === "") return true;
  return Number.isNaN(Number(value));
};

export const fmt = (value: unknown, decimals = 0) => {
  if (isMissing(value)) return "—";
  return Number(value).toFixed(decimals);
};

export const fmtNumber = (value: unknown, decimals = 0) => {
  if (isMissing(value)) return "—";
  return Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a DA amount in millions: 5 000 000 DA -> "5,0 M".
 * Every DA figure of the v2 UI goes through this helper (labels carry "(M DA)")
 * so a raw DA amount can never leak into a card.
 */
export const fmtMillions = (value: unknown, decimals = 1) => {
  if (isMissing(value)) return "—";
  return `${fmtNumber(Number(value) / 1_000_000, decimals)} M`;
};

export const pct = (value: unknown) => `${fmt(value, 1)}%`;

/** Safe ratio: returns 0 instead of NaN/Infinity when the denominator is 0. */
export const safePct = (
  numerator: unknown,
  denominator: unknown,
  decimals = 1,
): number => {
  const num = Number(numerator ?? 0);
  const den = Number(denominator ?? 0);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return 0;
  const ratio = (num / den) * 100;
  return Number.isFinite(ratio) ? Number(ratio.toFixed(decimals)) : 0;
};

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

export const NiveauLabel = (niveau: string): string => {
  switch (niveau) {
    case "famille":
      return "famille d'engins";
    case "chantier":
      return "chantier";
    case "groupe":
      return "groupe";
    default:
      return "engin";
  }
};

export const NiveauHeader = (niveau: string): string => {
  switch (niveau) {
    case "famille":
      return "Famille";
    case "chantier":
      return "Chantier";
    case "groupe":
      return "Groupe";
    default:
      return "Engin";
  }
};

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

export interface FilterParamsOptions {
  /** Only the endpoints that actually group by niveau accept it. */
  withNiveau?: boolean;
}

/** The subset of the filter state every endpoint needs. */
export type DashboardFiltersPick = Pick<
  DashboardFiltersState,
  "codeFiliale" | "codeFamille" | "dateDebut" | "dateFin" | "niveau"
>;

/**
 * Build the query params of a v2 endpoint.
 *
 * `niveau` is NOT sent by default: `/overview`, `/situation` and
 * `/filiale-stats` are fleet-scoped and ignore it, so sending it would suggest
 * a filtering that never happens. Only the ratio / maintenance / rentabilite
 * endpoints opt in with `{ withNiveau: true }`.
 */
export const filtersToParams = (
  filters: DashboardFiltersPick,
  options: FilterParamsOptions = {},
): DashboardV2Params => ({
  code_filiale: filters.codeFiliale,
  code_famille: filters.codeFamille,
  date_debut: filters.dateDebut,
  date_fin: filters.dateFin,
  ...(options.withNiveau ? { niveau: filters.niveau } : {}),
});

export interface FilterBarValues {
  code_filiale: string;
  code_famille: string;
  date_debut: string;
  date_fin: string;
  periode: string;
  trimestre: string;
  annee: string;
  niveau: string;
}

/** snake_case projection of the filter state, as consumed by the FilterBar. */
export const filtersToV1 = (filters: DashboardFiltersState): FilterBarValues => ({
  code_filiale: filters.codeFiliale,
  code_famille: filters.codeFamille,
  date_debut: filters.dateDebut,
  date_fin: filters.dateFin,
  periode: filters.periode,
  trimestre: filters.trimestre,
  annee: filters.annee,
  niveau: filters.niveau,
});

export interface FilterSetters {
  setCodeFiliale: (value: string) => void;
  setCodeFamille: (value: string) => void;
  setDateDebut: (value: string) => void;
  setDateFin: (value: string) => void;
  setPeriode: (value: string) => void;
  setTrimestre: (value: string) => void;
  setAnnee: (value: string) => void;
  setNiveau: (value: string) => void;
}

export const makeFilterHandler = (setters: FilterSetters) => {
  return (key: keyof FilterBarValues, value: string) => {
    switch (key) {
      case "code_filiale":
        setters.setCodeFiliale(value);
        break;
      case "code_famille":
        setters.setCodeFamille(value);
        break;
      case "date_debut":
        setters.setDateDebut(value);
        break;
      case "date_fin":
        setters.setDateFin(value);
        break;
      case "periode":
        setters.setPeriode(value);
        break;
      case "trimestre":
        setters.setTrimestre(value);
        break;
      case "annee":
        setters.setAnnee(value);
        break;
      case "niveau":
        setters.setNiveau(value);
        break;
    }
  };
};

export const useFilialesFamelles = () => {
  const [filiales, setFiliales] = useState<DashboardV2Option[]>([]);
  const [familles, setFamilles] = useState<DashboardV2Option[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [f, fam] = await Promise.all([
          getDashboardV2Filiales(),
          getDashboardV2Familles(),
        ]);
        if (cancelled) return;
        setFiliales(f);
        setFamilles(fam);
      } catch {
        /* non-fatal: empty lists render 'Toutes' */
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { filiales, familles };
};

export const healthKpisFromOverview = (
  overview: { globalKpis?: { parc_total?: number; situation_total?: number }; maintenanceKpis?: { disponibilite?: number; taux_service?: number }; financialKpis?: { marge?: number } } | null,
) => {
  const gk = overview?.globalKpis;
  const mk = overview?.maintenanceKpis;
  const fk = overview?.financialKpis;
  return {
    parcTotal: gk?.parc_total ?? 0,
    // materials actually covered by a situation row (parc can be larger)
    situationTotal: gk?.situation_total ?? 0,
    disponibilite: mk?.disponibilite ?? 0,
    rendement:
      gk && mk
        ? (mk.disponibilite ?? 0) * (mk.taux_service ?? 0) / 100
        : 0,
    marge: fk?.marge ?? 0,
  };
};

export const formatMonth = (mmaa: string | null): string => {
  if (!mmaa) return "—";
  const [year, month] = mmaa.split("-");
  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
    "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
  ];
  const monthIndex = parseInt(month, 10) - 1;
  if (!year || isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return mmaa;
  return `${months[monthIndex]} ${year}`;
};

/**
 * `TruncQuarter` renders as the first day of the quarter ("2026-07-01" for
 * T3) on both PostgreSQL (`date_trunc`) and SQLite, so the quarter number is
 * derived from that month. A backend already returning a "Q3"-style label is
 * passed through, and anything unexpected falls back to the raw value instead
 * of printing "NaN".
 */
export const formatQuarter = (quarter: string | null): string => {
  if (!quarter) return "—";
  const [year, rest] = quarter.split("-");
  if (!year || !rest) return quarter;
  const month = parseInt(rest, 10);
  if (isNaN(month)) {
    if (rest.startsWith("Q")) return `${rest} ${year}`;
    return quarter;
  }
  const q = Math.ceil(month / 3);
  if (q < 1 || q > 4) return quarter;
  return `T${q} ${year}`;
};

export interface ScreenFilterChip {
  key: keyof FilterBarValues;
  label: string;
  value: string;
}

export const computeActiveChips = (filters: DashboardFiltersState): ScreenFilterChip[] => {
  const chips: ScreenFilterChip[] = [];
  if (filters.codeFiliale) chips.push({ key: "code_filiale", label: "Filiale", value: filters.codeFiliale });
  if (filters.codeFamille) chips.push({ key: "code_famille", label: "Famille", value: filters.codeFamille });
  if (filters.periode) chips.push({ key: "periode", label: "Période", value: filters.periode });
  if (filters.trimestre) chips.push({ key: "trimestre", label: "Trimestre", value: filters.trimestre });
  if (filters.annee) chips.push({ key: "annee", label: "Année", value: filters.annee });
  if (filters.niveau) chips.push({ key: "niveau", label: "Niveau", value: filters.niveau });
  return chips;
};

/**
 * The visible controls of a tab = the ordered list declared by the shell
 * (`TAB_FILTERS`), plus the two date inputs when the user picked a custom
 * period. The previous boolean signature always returned the same four keys
 * and silently ignored the per-tab list.
 */
export const computeVisibleFilters = (
  tabFilters: Array<keyof FilterBarValues>,
  periode: string,
): Array<keyof FilterBarValues> =>
  periode === "personnalisee"
    ? [...tabFilters, "date_debut", "date_fin"]
    : [...tabFilters];