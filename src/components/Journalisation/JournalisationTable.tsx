import React from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  formatActionLabel,
  formatModuleLabel,
  getActionBadgeClass,
} from "../../types/journal";
import type {
  JournalEntry,
  JournalSortField,
  SortOrder,
} from "../../types/journal";
import { components } from "../../theme/components";

interface SortIconProps {
  field: JournalSortField;
  sortField: JournalSortField | null;
  sortOrder: SortOrder;
}

const SortIcon: React.FC<SortIconProps> = ({ field, sortField, sortOrder }) => {
  if (sortField !== field) {
    return <div className="h-3 w-3 text-gray-300" />;
  }
  return sortOrder === "asc" ? (
    <ChevronUp className="h-3 w-3 text-gray-600" />
  ) : (
    <ChevronDown className="h-3 w-3 text-gray-600" />
  );
};

interface Props {
  rows: JournalEntry[];
  loading: boolean;
  error: string | null;
  sortField: JournalSortField | null;
  sortOrder: SortOrder;
  onSort: (field: JournalSortField) => void;
  currentPage: number;
  itemsPerPage: number;
  totalRows: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
  onRowClick: (entry: JournalEntry) => void;
  onRetry: () => void;
}

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.toLocaleDateString("fr-FR")} ${d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const renderPageNumbers = (
  currentPage: number,
  totalPages: number,
): (number | "...")[] => {
  const items: (number | "...")[] = [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  items.push(1);
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  if (start > 2) items.push("...");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 1) items.push("...");
  items.push(totalPages);
  return items;
};

const JournalisationTable: React.FC<Props> = ({
  rows,
  loading,
  error,
  sortField,
  sortOrder,
  onSort,
  currentPage,
  itemsPerPage,
  totalRows,
  totalPages,
  onPageChange,
  onItemsPerPageChange,
  onRowClick,
  onRetry,
}) => {
  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalRows);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center gap-3 text-gray-600 dark:text-dark-text-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        <span>Chargement des entrées de journal…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 dark:border-red-800 bg-red-50 p-6 text-center">
        <div className="flex items-center justify-center gap-3 text-red-700">
          <AlertCircle className="h-6 w-6" />
          <span className="font-medium">Erreur de chargement</span>
        </div>
        <p className="mt-2 text-sm text-gray-700 dark:text-dark-text-primary">{error}</p>
        <button
          onClick={onRetry}
          className={components.button.primary}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={components.table.wrapper}>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead className={components.table.header + " border-b-2 border-slate-300"}>
            <tr>
              <th
                onClick={() => onSort("date_action")}
                className="cursor-pointer px-3 py-2.5 text-left align-top"
                style={{ width: "150px" }}
              >
                <div className="flex items-center gap-1">
                  Date / Heure
                  <SortIcon
                    field="date_action"
                    sortField={sortField}
                    sortOrder={sortOrder}
                  />
                </div>
              </th>
              <th
                onClick={() => onSort("user")}
                className="cursor-pointer px-3 py-2.5 text-left align-top"
                style={{ width: "120px" }}
              >
                <div className="flex items-center gap-1">
                  Utilisateur
                  <SortIcon field="user" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>
              <th
                onClick={() => onSort("module")}
                className="cursor-pointer px-3 py-2.5 text-left align-top"
                style={{ width: "130px" }}
              >
                <div className="flex items-center gap-1">
                  Module
                  <SortIcon field="module" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>
              <th
                onClick={() => onSort("action")}
                className="cursor-pointer px-3 py-2.5 text-left align-top"
                style={{ width: "120px" }}
              >
                <div className="flex items-center gap-1">
                  Action
                  <SortIcon field="action" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>
              <th
                onClick={() => onSort("objet_id")}
                className="cursor-pointer px-3 py-2.5 text-left align-top"
                style={{ width: "140px" }}
              >
                <div className="flex items-center gap-1">
                  Objet
                  <SortIcon field="objet_id" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>
              <th
                onClick={() => onSort("code_filiale")}
                className="cursor-pointer px-3 py-2.5 text-left align-top"
                style={{ width: "120px" }}
              >
                <div className="flex items-center gap-1">
                  Filiale
                  <SortIcon field="code_filiale" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>
              <th
                onClick={() => onSort("code_site")}
                className="cursor-pointer px-3 py-2.5 text-left align-top"
                style={{ width: "110px" }}
              >
                <div className="flex items-center gap-1">
                  Site
                  <SortIcon field="code_site" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>
              <th
                className="px-3 py-2.5 text-left align-top"
                style={{ width: "240px" }}
              >
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-dark-text-secondary">
                  Aucune entrée de journal trouvée.
                </td>
              </tr>
            ) : (
              rows.map((entry, idx) => (
                <tr
                  key={entry.id}
                  onClick={() => onRowClick(entry)}
                  className={`cursor-pointer ${components.table.row} ${idx % 2 === 0 ? "bg-white dark:bg-dark-card" : "bg-slate-50/50 dark:bg-dark-bg-secondary/50"
                    }`}
                >
                  <td className="px-3 py-2.5 align-top">
                    <span className="font-mono text-xs text-gray-600 dark:text-dark-text-secondary">
                      {formatDateTime(entry.date_action)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <span className="font-mono text-xs text-gray-600 dark:text-dark-text-secondary">
                      {entry.user?.username ?? "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <span className="font-mono text-xs text-gray-600 dark:text-dark-text-secondary">
                      {formatModuleLabel(entry.module)}
                    </span>

                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getActionBadgeClass(
                        entry.action,
                      )}`}
                    >
                      {formatActionLabel(entry.action)}
                    </span>
                  </td>
                  <td
                    className="px-3 py-2.5 align-top font-mono text-xs text-gray-800 dark:text-dark-text-primary"
                    title={`${entry.objet_type}: ${entry.objet_id}`}
                  >
                    <span className="block max-w-35 truncate">
                      {entry.objet_id || "—"}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-dark-text-secondary">
                      {entry.objet_type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <span className="font-mono text-xs text-gray-600 dark:text-dark-text-secondary">

                      {entry.code_filiale ?? "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <span className="font-mono text-xs text-gray-600 dark:text-dark-text-secondary">

                      {entry.code_site ?? "—"}
                    </span>
                  </td>
                  <td
                    className="px-3 py-2.5 align-top text-gray-600 dark:text-dark-text-secondary"
                    title={entry.description || ""}
                  >
                    <span className="block max-w-60 truncate text-xs">
                      {entry.description || "—"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalRows > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-dark-border px-4 py-3 bg-slate-50 dark:bg-dark-bg-secondary">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-text-secondary">
            <span>Lignes :</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className={components.select}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
              {totalRows === 0
                ? "0 élément"
                : `${startIdx}–${endIdx} sur ${totalRows}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={components.button.secondary}
              >
                Précédent
              </button>
              {renderPageNumbers(currentPage, totalPages).map((item, index) =>
                item === "..." ? (
                  <span key={`ellipsis-${index}`} className="px-1 text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => onPageChange(item)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentPage === item
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text-primary border border-slate-300 hover:border-blue-600"
                      }`}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={components.button.secondary}
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalisationTable;
