import React, { useMemo } from "react";
import { components } from "../../theme/components";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
  loading?: boolean;
  showItemCount?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  loading = false,
  showItemCount = true,
}) => {
  const paginationItems = useMemo<(number | "...")[]>(() => {
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
  }, [currentPage, totalPages]);

  const startIdx = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1 && !showItemCount) {
    return null;
  }

  return (
    <div className="px-6 py-4 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg-secondary flex flex-col sm:flex-row items-center justify-between gap-4">
      {showItemCount && (
        <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
          {totalItems === 0 ? (
            "Aucun résultat"
          ) : (
            <>
              Affichage de <span className="font-semibold">{startIdx}</span> à{" "}
              <span className="font-semibold">{endIdx}</span> sur{" "}
              <span className="font-semibold">{totalItems}</span> résultat
              {totalItems !== 1 ? "s" : ""}
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || loading}
          className={components.button.secondary}
          type="button"
        >
          Précédent
        </button>

        <div className="flex items-center gap-1">
          {paginationItems.map((item, index) =>
            item === "..." ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                disabled={loading}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  currentPage === item
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text-primary border border-slate-300 hover:border-blue-600"
                }`}
                type="button"
              >
                {item}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || loading}
          className={components.button.secondary}
          type="button"
        >
          Suivant
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Lignes :</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className={components.select}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PaginationControls;
