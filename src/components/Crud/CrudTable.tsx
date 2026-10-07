import React, { useMemo } from "react";
import {
    ChevronUp,
    ChevronDown,
    Search,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { components } from "../../theme/components";

export type SortField = string | null;
export type SortOrder = "asc" | "desc";

export type ColumnFilterOption = {
    value: string;
    label: string;
};

export type ColumnFilterDef = {
    type?: "text" | "select";
    param?: string;
    options?: ColumnFilterOption[];
    placeholder?: string;
};

export type ColumnDef<T> = {
    key: keyof T | string;
    label: string;
    width?: string;
    sortable?: boolean;
    sortParam?: string;
    filter?: ColumnFilterDef;
    render?: (value: unknown, row: T, index: number) => React.ReactNode;
};

interface CrudTableProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    loading: boolean;
    error: string | null;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    sortField: SortField;
    sortOrder: SortOrder;
    onSort: (field: string) => void;
    currentPage: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (size: number) => void;
    onRetry: () => void;
    totalItems?: number;
    emptyMessage?: string;
    title?: string;
    searchPlaceholder?: string;
    actions?: (row: T) => React.ReactNode;
    columnFilters?: Record<string, string>;
    onColumnFilterChange?: (param: string, value: string) => void;
    onResetColumnFilters?: () => void;
    enableLocalFiltering?: boolean;
}

const SortIcon = ({
    field,
    sortField,
    sortOrder,
}: {
    field: string;
    sortField: SortField;
    sortOrder: SortOrder;
}) => {
    if (sortField !== field) {
        return <div className="h-4 w-4 text-gray-300" />;
    }
    return sortOrder === "asc" ? (
        <ChevronUp className="h-4 w-4 text-gray-600" />
    ) : (
        <ChevronDown className="h-4 w-4 text-gray-600" />
    );
};

const ColumnFilterControl = ({
    filter,
    value,
    onChange,
}: {
    filter: ColumnFilterDef;
    value: string;
    onChange: (value: string) => void;
}) => {
    const stop = (e: React.MouseEvent) => e.stopPropagation();

    if (filter.type === "select") {
        return (
            <select
                value={value}
                onClick={stop}
                onChange={(e) => onChange(e.target.value)}
                className={components.input + " py-1 text-xs"}
            >
                <option value="">Tous</option>
                {(filter.options ?? []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        );
    }

    return (
        <input
            type="text"
            value={value}
            onClick={stop}
            onChange={(e) => onChange(e.target.value)}
            placeholder={filter.placeholder ?? "Filtrer..."}
            className={components.input + " py-1 text-xs"}
        />
    );
};

function CrudTable<T>({
    columns,
    data,
    loading,
    error,
    searchTerm,
    onSearchChange,
    sortField,
    sortOrder,
    onSort,
    currentPage,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
    onRetry,
    totalItems,
    emptyMessage = "Aucun résultat trouvé",
    title,
    searchPlaceholder = "Rechercher...",
    actions,
    columnFilters,
    onColumnFilterChange,
    onResetColumnFilters,
    enableLocalFiltering = false,
}: CrudTableProps<T>) {
    const sortedData = useMemo(() => {
        const sorted = [...data];
        if (!sortField) return sorted;
        sorted.sort((a: any, b: any) => {
            const aValue = a[sortField];
            const bValue = b[sortField];
            if (aValue === undefined || aValue === null) return 1;
            if (bValue === undefined || bValue === null) return -1;
            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [data, sortField, sortOrder]);

    const filteredData = useMemo(() => {
        if (!enableLocalFiltering || !columnFilters) return sortedData;
        return sortedData.filter((row: any) => {
            return Object.entries(columnFilters).every(([param, value]) => {
                if (!value) return true;
                const column = columns.find((c) => (c.filter?.param ?? String(c.key)) === param);
                if (!column) return true;
                const rowValue = row[String(column.key)];
                if (rowValue === undefined || rowValue === null) return false;
                const strValue = String(rowValue).toLowerCase();
                return strValue.includes(value.toLowerCase());
            });
        });
    }, [sortedData, columnFilters, columns, enableLocalFiltering]);

    const itemCount = totalItems ?? filteredData.length;
    const totalPages = Math.max(1, Math.ceil(itemCount / itemsPerPage));
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = Math.min(startIdx + itemsPerPage, itemCount);

    const paginationItems = useMemo(() => {
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

    return (
        <div className={components.table.wrapper}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-slate-200 dark:border-dark-border">
                {title && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">{title}</h2>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className={components.input + " pl-10"}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Lignes :</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                onItemsPerPageChange(Number(e.target.value));
                                onPageChange(1);
                            }}
                            className={components.select}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                    {onResetColumnFilters && (
                        <button
                            onClick={onResetColumnFilters}
                            type="button"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Réinitialiser les filtres
                        </button>
                    )}
                </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-dark-bg-secondary border-b border-slate-200 dark:border-dark-border">
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                    {loading && data.length === 0 ? (
                        "Chargement..."
                    ) : (
                        <>
                            Affichage de <span className="font-semibold">{Math.max(1, startIdx + 1)}</span> à{" "}
                            <span className="font-semibold">{Math.min(endIdx, itemCount)}</span> sur{" "}
                            <span className="font-semibold">{itemCount}</span> résultat
                            {itemCount !== 1 ? "s" : ""}
                        </>
                    )}
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className={components.table.header + " border-b-2 border-slate-300"}>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    onClick={() => column.sortable !== false && onSort(column.sortParam ?? String(column.key))}
                                    className={`${column.width || ""} px-4 py-3 align-top transition-colors ${
                                        column.sortable !== false ? "hover:bg-slate-200 cursor-pointer" : ""
                                    }`}
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-dark-text-primary">
                                                {column.label}
                                            </span>
                                            {column.sortable !== false && (
                                                <SortIcon
                                                    field={column.sortParam ?? String(column.key)}
                                                    sortField={sortField}
                                                    sortOrder={sortOrder}
                                                />
                                            )}
                                        </div>
                                        {column.filter && onColumnFilterChange && (
                                            <ColumnFilterControl
                                                filter={column.filter}
                                                value={columnFilters?.[column.filter.param ?? String(column.key)] ?? ""}
                                                onChange={(value) =>
                                                    onColumnFilterChange(column.filter!.param ?? String(column.key), value)
                                                }
                                            />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && (
                                <th className="min-w-[130px] px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-dark-text-primary">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {error && !loading ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8">
                                    <div className="flex flex-col items-center justify-center gap-3 text-red-600 dark:text-red-400">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5" />
                                            <span>{error}</span>
                                        </div>
                                        <button onClick={onRetry} className={components.button.primary + " text-sm"}>
                                            Réessayer
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : loading && data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8">
                                    <div className="flex items-center justify-center gap-3 text-gray-500 dark:text-dark-text-secondary">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Chargement des données...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((row, idx) => (
                                <tr
                                    key={(row as any).id ?? idx}
                                    className={`${components.table.row} ${idx % 2 === 0 ? "bg-white dark:bg-dark-card" : "bg-slate-50/50 dark:bg-dark-bg-secondary/50"
                                        }`}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={String(column.key)}
                                            className="px-4 py-3 text-sm text-gray-800 dark:text-dark-text-primary"
                                        >
                                            {column.render
                                                ? column.render(
                                                    (row as any)[String(column.key)],
                                                    row,
                                                    idx,
                                                )
                                                : String((row as any)[String(column.key)] ?? "—")}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-4 py-3 text-sm">
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-gray-500 dark:text-dark-text-secondary">
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg-secondary flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || loading}
                        className={components.button.primary}
                        type="button"
                    >
                        Précédent
                    </button>
                    <div className="flex items-center gap-2">
                        {paginationItems.map((item, index) =>
                            item === "..." ? (
                                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={item}
                                    onClick={() => onPageChange(item)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentPage === item
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
                        className={components.button.primary}
                        type="button"
                    >
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );
}

export default CrudTable;
