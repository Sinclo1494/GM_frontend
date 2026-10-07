import React, { useMemo, useState } from "react";
import { components } from "../../../theme/components";
import PaginationControls from "../../../components/common/PaginationControls";

export type BreakdownStatus = "success" | "warning" | "danger" | "info" | "neutral";

export interface BreakdownColumn {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  filterable?: boolean;
  filterType?: "text" | "number" | "select";
  filterOptions?: { value: string; label: string }[];
}

export interface BreakdownTableProps {
  columns: BreakdownColumn[];
  rows: Record<string, unknown>[];
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
  statusFor?: (row: Record<string, unknown>) => BreakdownStatus;
  onFilterChange?: (filters: Record<string, string>) => void;
}

const STATUS_TINT: Record<BreakdownStatus, string> = {
  success: "bg-green-50 dark:bg-green-900/20",
  warning: "bg-amber-50 dark:bg-amber-900/20",
  danger: "bg-red-50 dark:bg-red-900/20",
  info: "bg-blue-50 dark:bg-blue-900/20",
  neutral: "",
};

const deriveStatus = (row: Record<string, unknown>): BreakdownStatus => {
  const value = Number(row.value);
  const threshold = Number(row.threshold);
  if (!Number.isFinite(value) || !Number.isFinite(threshold)) return "neutral";
  if (value >= threshold) return "success";
  if (value >= threshold * 0.7) return "warning";
  return "danger";
};

function BreakdownTable(props: BreakdownTableProps) {
  const {
    columns,
    rows,
    currentPage,
    pageSize,
    onPageChange,
    onPageSizeChange,
    totalItems,
    statusFor,
    onFilterChange,
  } = props;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);

  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const filteredRows = useMemo(() => {
    if (!rows) return [];
    return rows.filter((row) => {
      return Object.entries(columnFilters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        const cellValue = String(row[key] ?? "").toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      });
    });
  }, [rows, columnFilters]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...columnFilters, [key]: value };
    setColumnFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const visibleRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const computeStatus = (row: Record<string, unknown>): BreakdownStatus => {
    if (statusFor) return statusFor(row);
    return deriveStatus(row);
  };

  const filterableColumns = columns.filter((col) => col.filterable);

  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-8 text-center">
        <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
          Aucun résultat
        </p>
      </div>
    );
  }

  const renderFilterInput = (col: BreakdownColumn) => {
    if (!col.filterable) return null;
    const currentValue = columnFilters[col.key] ?? "";
    const alignClass = col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left";

    if (col.filterType === "select" && col.filterOptions) {
      return (
        <select
          key={col.key}
          className={`${components.input} w-full ${alignClass}`}
          value={currentValue}
          onChange={(e) => handleFilterChange(col.key, e.target.value)}
        >
          <option value="">Tous</option>
          {col.filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        key={col.key}
        type={col.filterType === "number" ? "number" : "text"}
        className={`${components.input} w-full ${alignClass}`}
        placeholder="Filtrer..."
        value={currentValue}
        onChange={(e) => handleFilterChange(col.key, e.target.value)}
      />
    );
  };

  return (
    <div className="min-w-0">
      <div className={`${components.table.wrapper} min-w-0`}>
        <table className="w-full text-left text-sm min-w-0">
          <thead className={components.table.header}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold whitespace-nowrap ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
            {filterableColumns.length > 0 && (
              <tr className="border-t border-slate-200 dark:border-dark-border">
                {columns.map((col) => (
                  <th
                    key={col.key + "-filter"}
                    className={`px-2 py-1 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}`}
                  >
                    {renderFilterInput(col)}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {visibleRows.map((row, ri) => {
              const status = computeStatus(row);
              const tint = STATUS_TINT[status];
              return (
                <tr
                  key={ri}
                  className={`${components.table.row} ${tint} transition-colors`}
                >
                  {columns.map((col) => {
                    const value = row[col.key];
                    const content: React.ReactNode = col.render
                      ? col.render(value, row)
                      : (value as React.ReactNode);
                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalItems > pageSize && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={pageSize}
          onPageChange={onPageChange}
          onItemsPerPageChange={onPageSizeChange}
          showItemCount
        />
      )}
    </div>
  );
}

const MemoizedBreakdownTable = React.memo(BreakdownTable);
MemoizedBreakdownTable.displayName = "BreakdownTable";

export default MemoizedBreakdownTable;