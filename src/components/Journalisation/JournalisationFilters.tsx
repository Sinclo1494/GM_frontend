import { Search, X } from "lucide-react";
import type {
  FilterOption,
  JournalFilters,
} from "../../types/journal";
import {
  ACTION_OPTIONS,
  MODULE_OPTIONS,
} from "../../types/journal";
import { components } from "../../theme/components";

interface Props {
  filters: JournalFilters;
  onChange: (filters: Partial<JournalFilters>) => void;
  onApply: () => void;
  onClear: () => void;
  filiales: FilterOption[];
  loading: boolean;
}

const JournalisationFilters = ({
  filters,
  onChange,
  onApply,
  onClear,
  filiales,
  loading,
}: Props) => {
  const setFilter = (name: keyof JournalFilters, value: string) =>
    onChange({ [name]: value });

  return (
    <div className={components.card + " mb-6"}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className={components.label}>Date début</label>
          <input
            type="date"
            value={filters.date_debut}
            onChange={(e) => setFilter("date_debut", e.target.value)}
            className={components.input}
          />
        </div>

        <div>
          <label className={components.label}>Date fin</label>
          <input
            type="date"
            value={filters.date_fin}
            onChange={(e) => setFilter("date_fin", e.target.value)}
            className={components.input}
          />
        </div>

        <div>
          <label className={components.label}>Utilisateur (ID)</label>
          <input
            type="number"
            min={1}
            placeholder="ex: 3"
            value={filters.user}
            onChange={(e) => setFilter("user", e.target.value)}
            className={components.input}
          />
        </div>

        <div>
          <label className={components.label}>Module</label>
          <select
            value={filters.module}
            onChange={(e) => setFilter("module", e.target.value)}
            className={components.select}
          >
            <option value="">Tous</option>
            {MODULE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={components.label}>Action</label>
          <select
            value={filters.action}
            onChange={(e) => setFilter("action", e.target.value)}
            className={components.select}
          >
            <option value="">Tous</option>
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={components.label}>Filiale</label>
          <select
            value={filters.code_filiale}
            onChange={(e) => setFilter("code_filiale", e.target.value)}
            className={components.select}
          >
            <option value="">Toutes</option>
            {filiales.map((f) => (
              <option key={f.value} value={f.value}>
                {f.value} — {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={components.label}>Site</label>
          <input
            type="text"
            placeholder="ex: C01"
            value={filters.code_site}
            onChange={(e) => setFilter("code_site", e.target.value)}
            className={components.input}
          />
        </div>

        <div>
          <label className={components.label}>Objet / ID</label>
          <input
            type="text"
            placeholder="ex: A01020653"
            value={filters.objet_id}
            onChange={(e) => setFilter("objet_id", e.target.value)}
            className={components.input}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher (description, objet, id)…"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            className={components.input + " pl-10"}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className={components.button.secondary}
          >
            <X className="h-4 w-4" />
            Tout réinitialiser
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={loading}
            className={components.button.primary}
          >
            {loading ? "Chargement…" : "Appliquer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalisationFilters;
