import React from "react";
import { components } from "../../../theme/components";
import { X } from "lucide-react";
import {
  PERIODE_ANNEE,
  PERIODE_MOIS_COURANT,
  PERIODE_PERSONNALISEE,
} from "../../../context/useDashboardFilters";

export type DashboardV2FilterKey =
  | "code_filiale"
  | "code_famille"
  | "date_debut"
  | "date_fin"
  | "periode"
  | "trimestre"
  | "annee"
  | "niveau";

export type DashboardV2FilterValues = Record<DashboardV2FilterKey, string>;

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterChip {
  key: DashboardV2FilterKey;
  label: string;
  value: string;
}

export interface FilterBarProps {
  filters: DashboardV2FilterValues;
  visibleFilters: DashboardV2FilterKey[];
  onChange: (key: DashboardV2FilterKey, value: string) => void;
  onReset: () => void;
  activeChips: FilterChip[];
  filiales?: FilterOption[];
  familles?: FilterOption[];
}

const currentYear = new Date().getFullYear();

const PERIODE_OPTIONS: FilterOption[] = [
  { value: PERIODE_MOIS_COURANT, label: "Mois en cours" },
  { value: PERIODE_ANNEE, label: "Année" },
  { value: "01", label: "Janvier" },
  { value: "02", label: "Février" },
  { value: "03", label: "Mars" },
  { value: "04", label: "Avril" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Juin" },
  { value: "07", label: "Juillet" },
  { value: "08", label: "Août" },
  { value: "09", label: "Septembre" },
  { value: "10", label: "Octobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Décembre" },
  { value: PERIODE_PERSONNALISEE, label: "Période personnalisée" },
];

const TRIMESTRE_OPTIONS: FilterOption[] = [
  { value: "", label: "Tous" },
  { value: "Q1", label: "Q1" },
  { value: "Q2", label: "Q2" },
  { value: "Q3", label: "Q3" },
  { value: "Q4", label: "Q4" },
];

const ANNEE_OPTIONS: FilterOption[] = Array.from(
  { length: 21 },
  (_, i) => {
    const y = currentYear - 10 + i;
    return { value: String(y), label: String(y) };
  },
);

const NIVEAU_OPTIONS: FilterOption[] = [
  { value: "engin", label: "Engin" },
  { value: "famille", label: "Famille d'engins" },
  { value: "chantier", label: "Chantier" },
  { value: "groupe", label: "Groupe" },
];

/** An empty year is not a meaningful filter: no clear button for it. */
const NO_CLEAR_CHIP: DashboardV2FilterKey[] = ["annee"];

const renderControl = (
  key: DashboardV2FilterKey,
  filters: DashboardV2FilterValues,
  onChange: (key: DashboardV2FilterKey, value: string) => void,
  filiales: FilterOption[],
  familles: FilterOption[],
) => {
  const value = filters[key] ?? "";

  switch (key) {
    case "code_filiale":
      return (
        <select
          className={components.select}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
        >
          <option value="">Toutes</option>
          {filiales.map((f) => (
            <option key={f.value} value={f.value}>
              {f.value} - {f.label}
            </option>
          ))}
        </select>
      );

    case "code_famille":
      return (
        <select
          className={components.select}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
        >
          <option value="">Toutes</option>
          {familles.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      );

    case "periode":
      return (
        <select
          className={components.select}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
        >
          {PERIODE_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      );

    case "trimestre":
      return (
        <select
          className={components.select}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
        >
          {TRIMESTRE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      );

    case "annee":
      return (
        <select
          className={components.select}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
        >
          {ANNEE_OPTIONS.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>
      );

    case "niveau":
      return (
        <select
          className={components.select}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
        >
          {NIVEAU_OPTIONS.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label}
            </option>
          ))}
        </select>
      );

    case "date_debut":
      return (
        <input
          type="date"
          className={components.input}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
        />
      );

    case "date_fin":
      return (
        <input
          type="date"
          className={components.input}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
        />
      );

    default:
      return null;
  }
};

const CONTROL_LABELS: Record<DashboardV2FilterKey, string> = {
  code_filiale: "Filiale",
  code_famille: "Famille",
  date_debut: "Du",
  date_fin: "Au",
  periode: "Période",
  trimestre: "Trimestre",
  annee: "Année",
  niveau: "Niveau d'analyse",
};

const FilterBar = React.memo<FilterBarProps>(
  ({ filters, visibleFilters, onChange, onReset, activeChips, filiales = [], familles = [] }) => {
    return (
      <div className="p-4 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border">
        <div className="flex flex-wrap items-end gap-3">
          {visibleFilters.map((key) => (
            <div key={key} className="flex flex-col gap-1">
              <label className={components.label}>
                {CONTROL_LABELS[key]}
              </label>
              {renderControl(key, filters, onChange, filiales, familles)}
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={onReset}
              className={`${components.button.secondary} h-10 px-4 text-sm`}
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <div
                key={chip.key}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
              >
                <span className="font-medium">{chip.label}:</span>
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                  {chip.value}
                </span>
                {!NO_CLEAR_CHIP.includes(chip.key) && (
                  <button
                    type="button"
                    onClick={() => onChange(chip.key, "")}
                    className="rounded p-0.5 text-slate-500 hover:bg-slate-200 dark:text-dark-text-secondary dark:hover:bg-dark-bg-tertiary"
                    title="Supprimer ce filtre"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

FilterBar.displayName = "FilterBar";

export default FilterBar;
