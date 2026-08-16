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

export type ColumnDef<T> = {
    key: keyof T | string;
    label: string;
    width?: string;
    sortable?: boolean;
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
    emptyMessage?: string;
    title?: string;
    searchPlaceholder?: string;
    actions?: (row: T) => React.ReactNode;
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
        <ChevronUp className="h-4 w-4 text-blue-600" />
    ) : (
        <ChevronDown className="h-4 w-4 text-blue-600" />
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
    emptyMessage = "Aucun résultat trouvé",
    title,
    searchPlaceholder = "Rechercher...",
    actions,
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

    const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const paginatedData = sortedData.slice(startIdx, endIdx);

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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-slate-200">
                {title && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
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
                        <span className="text-sm text-gray-600">Lignes :</span>
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
                </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                <p className="text-sm text-gray-600">
                    {loading ? (
                        "Chargement..."
                    ) : (
                        <>
                            Affichage de <span className="font-semibold">{Math.max(1, startIdx + 1)}</span> à{" "}
                            <span className="font-semibold">{Math.min(endIdx, sortedData.length)}</span> sur{" "}
                            <span className="font-semibold">{sortedData.length}</span> résultat
                            {sortedData.length !== 1 ? "s" : ""}
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
                                    onClick={() => column.sortable !== false && onSort(String(column.key))}
                                    className={`${column.width || ""} px-4 py-3 align-top transition-colors ${
                                        column.sortable !== false ? "hover:bg-slate-200 cursor-pointer" : ""
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                            {column.label}
                                        </span>
                                        {column.sortable !== false && (
                                            <SortIcon
                                                field={String(column.key)}
                                                sortField={sortField}
                                                sortOrder={sortOrder}
                                            />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && (
                                <th className="min-w-[130px] px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {error && !loading ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8">
                                    <div className="flex flex-col items-center justify-center gap-3 text-red-600">
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
                        ) : loading ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8">
                                    <div className="flex items-center justify-center gap-3 text-gray-500">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Chargement des données...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((row, idx) => (
                                <tr
                                    key={(row as any).id ?? idx}
                                    className={`${components.table.row} ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                                        }`}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={String(column.key)}
                                            className="px-4 py-3 text-sm text-gray-800"
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
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && !loading && (
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={components.button.primary}
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
                                            : "bg-white text-gray-700 border border-slate-300 hover:border-blue-600"
                                        }`}
                                >
                                    {item}
                                </button>
                            ),
                        )}
                    </div>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={components.button.primary}
                    >
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );
}

export default CrudTable;
