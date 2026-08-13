import { useEffect, useMemo, useState } from "react";
import { getFiliales } from "../api/dataServices";
import { getJournal } from "../api/journalService";
import JournalisationFilters from "../components/Journalisation/JournalisationFilters";
import JournalisationTable from "../components/Journalisation/JournalisationTable";
import JournalDetailDialog from "../components/Journalisation/JournalDetailDialog";
import type {
  FilterOption,
  JournalEntry,
  JournalFilterParams,
  JournalFilters,
  JournalSortField,
  SortOrder,
} from "../types/journal";

const DEFAULT_FILTERS = (): JournalFilters => {
  const today = new Date();
  const debut = new Date();
  debut.setDate(today.getDate() - 30);
  return {
    date_debut: debut.toISOString().split("T")[0],
    date_fin: today.toISOString().split("T")[0],
    user: "",
    module: "",
    action: "",
    objet_id: "",
    code_filiale: "",
    code_site: "",
    search: "",
  };
};

const toParams = (filters: JournalFilters): JournalFilterParams => ({
  date_debut: filters.date_debut || undefined,
  date_fin: filters.date_fin || undefined,
  user: filters.user || undefined,
  module: filters.module || undefined,
  action: filters.action || undefined,
  objet_id: filters.objet_id || undefined,
  code_filiale: filters.code_filiale || undefined,
  code_site: filters.code_site || undefined,
  search: filters.search || undefined,
});

const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === "object" && "response" in err) {
    const r = (
      err as { response?: { data?: { detail?: string; message?: string } } }
    ).response;
    return r?.data?.message ?? r?.data?.detail ?? "Erreur lors du chargement du journal.";
  }
  if (err instanceof Error) return err.message;
  return "Erreur lors du chargement du journal.";
};

const getSortValue = (entry: JournalEntry, field: JournalSortField): string => {
  switch (field) {
    case "date_action":
      return entry.date_action;
    case "user":
      return entry.user?.username ?? "";
    case "module":
      return entry.module;
    case "action":
      return entry.action;
    case "objet_id":
      return entry.objet_id;
    case "code_filiale":
      return entry.code_filiale ?? "";
    case "code_site":
      return entry.code_site ?? "";
    default:
      return "";
  }
};

export default function Journalisation() {
  const [filters, setFilters] = useState<JournalFilters>(DEFAULT_FILTERS);
  const [rows, setRows] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filiales, setFiliales] = useState<FilterOption[]>([]);
  const [selected, setSelected] = useState<JournalEntry | null>(null);

  const [sortField, setSortField] = useState<JournalSortField | null>("date_action");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const updateFilter = (patch: Partial<JournalFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const initialParams = useMemo<JournalFilterParams>(() => toParams(DEFAULT_FILTERS()), []);

  const fetchJournal = async (current: JournalFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJournal(toParams(current));
      setRows(data);
      setCurrentPage(1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    fetchJournal(filters);
  };

  const handleClear = () => {
    const next = DEFAULT_FILTERS();
    setFilters(next);
    fetchJournal(next);
  };

  const handleSort = (field: JournalSortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  useEffect(() => {
    getFiliales()
      .then(setFiliales)
      .catch(() => setFiliales([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    getJournal(initialParams)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialParams]);

  const sortedRows = useMemo<JournalEntry[]>(() => {
    const sorted = [...rows];
    if (!sortField) return sorted;
    sorted.sort((a, b) => {
      const aValue = getSortValue(a, sortField);
      const bValue = getSortValue(b, sortField);
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [rows, sortField, sortOrder]);

  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pageRows = sortedRows.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Journalisation</h1>
          <p className="text-sm text-gray-500 mt-1">
            Historique des actions effectuées dans l'application.
          </p>
        </header>

        <JournalisationFilters
          filters={filters}
          onChange={updateFilter}
          onApply={handleApply}
          onClear={handleClear}
          filiales={filiales}
          loading={loading}
        />

        {!loading && !error && (
          <p className="mb-3 text-sm text-gray-600">
            {totalRows} entrée{totalRows !== 1 ? "s" : ""} trouvée
            {totalRows !== 1 ? "s" : ""}
          </p>
        )}

        <JournalisationTable
          rows={pageRows}
          loading={loading}
          error={error}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalRows={totalRows}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onRowClick={setSelected}
          onRetry={() => fetchJournal(filters)}
        />

        <JournalDetailDialog
          open={selected !== null}
          onClose={() => setSelected(null)}
          journal={selected}
        />
      </div>
    </div>
  );
}
