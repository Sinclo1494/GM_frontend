"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ChevronUp,
  ChevronDown,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import formatCurrency from "../../utils/FormatCurrency";
import formatDate from "../../utils/FormatDate";
import { components } from "../../theme/components";
import { crudList } from "../../api/crudService";

const GM_URL = "grand-materiel";

interface JournalMateriel {
    id: number;
    code_materiel: string;
    designation: string;
    num_serie: string;
    immatriculation: string;
    date_acquisition: string;
    valeur_acquisition: string;
    valeur_remplacement: string;
    taux_amortissement: string;
    puissance_materiel: string;
    code_sous_famille: string;
    code_type_marque: string;
    libelle_famille: string | null;
    libelle_categorie: string | null;
    libelle_marque: string | null;
    est_bloque: boolean;
    user_id: number;
    code_filiale_g: string;
    created_at: string;
    updated_at: string;
}

type SortField =
    | "code_materiel"
    | "designation"
    | "num_serie"
    | "immatriculation"
    | "date_acquisition"
    | "valeur_acquisition"
    | "valeur_remplacement"
    | "taux_amortissement"
    | "puissance_materiel"
    | "code_sous_famille"
    | "code_type_marque"
    | "libelle_famille"
    | "libelle_categorie"
    | "libelle_marque"
    | "code_filiale_g"
    | "est_bloque"
    | null;
type SortOrder = "asc" | "desc";

interface SortIconProps {
    field: Exclude<SortField, null>;
    sortField: SortField;
    sortOrder: SortOrder;
    sortable: boolean;
}

const SortIcon: React.FC<SortIconProps> = ({ field, sortField, sortOrder, sortable }) => {
    if (!sortable) {
        return <div className="h-4 w-4 text-gray-300" />;
    }

    if (sortField !== field) {
        return <div className="h-4 w-4 text-gray-300" />;
    }

    return sortOrder === "asc" ? (
        <ChevronUp className="h-4 w-4 text-gray-600" />
    ) : (
        <ChevronDown className="h-4 w-4 text-gray-600" />
    );
};

interface StatusBadgeProps {
    estBloque: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ estBloque }) => {
    return estBloque ? (
        <span className={components.badge.danger}>
            Bloqué
        </span>
    ) : (
        <span className={components.badge.success}>
            Actif
        </span>
    );
};

const FilterInput = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) => (
    <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Filtrer..."
        onClick={(e) => e.stopPropagation()}
        className={components.input}
    />
);

const JournalMaterielTable: React.FC = () => {
    const [data, setData] = useState<JournalMateriel[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const abortControllerRef = useRef<AbortController | null>(null);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const filterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const columns = [
        { key: "code_materiel", label: "Code Matériel", width: "min-w-[170px]", sortable: true },
        { key: "designation", label: "Désignation", width: "min-w-[250px]", sortable: true },
        { key: "num_serie", label: "N° Série", width: "min-w-[170px]", sortable: true },
        {
            key: "immatriculation",
            label: "Immatriculation",
            width: "min-w-[170px]",
            sortable: true,
        },
        { key: "code_filiale_g", label: "Filiale", width: "min-w-[130px]", sortable: true },
        { key: "code_sous_famille", label: "Sous Famille", width: "min-w-[180px]", sortable: true },
        { key: "libelle_famille", label: "Famille Matériel", width: "min-w-[180px]", sortable: true },
        { key: "libelle_categorie", label: "Catégorie", width: "min-w-[180px]", sortable: true },
        { key: "code_type_marque", label: "Type Marque", width: "min-w-[180px]", sortable: true },
        { key: "libelle_marque", label: "Marque Matériel", width: "min-w-[180px]", sortable: true },
        {
            key: "date_acquisition",
            label: "Date Acquisition",
            width: "min-w-[170px]",
            sortable: true,
        },
        {
            key: "valeur_acquisition",
            label: "Valeur Acquisition",
            width: "min-w-[180px]",
            sortable: true,
        },
        {
            key: "valeur_remplacement",
            label: "Valeur Remp.",
            width: "min-w-[190px]",
            sortable: true,
        },
        { key: "taux_amortissement", label: "Taux Amort.", width: "min-w-[150px]", sortable: true },
        { key: "puissance_materiel", label: "Puissance", width: "min-w-[150px]", sortable: true },
    ] as const;

    const [columnFiltersInput, setColumnFiltersInput] = useState({
        code_materiel: "",
        designation: "",
        num_serie: "",
        immatriculation: "",
        code_sous_famille: "",
        code_type_marque: "",
        libelle_famille: "",
        libelle_categorie: "",
        libelle_marque: "",
        code_filiale_g: "",
        est_bloque: "",
    });
    const [columnFilters, setColumnFilters] = useState({
        code_materiel: "",
        designation: "",
        num_serie: "",
        immatriculation: "",
        code_sous_famille: "",
        code_type_marque: "",
        libelle_famille: "",
        libelle_categorie: "",
        libelle_marque: "",
        code_filiale_g: "",
        est_bloque: "",
    });

    const fetchData = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            setLoading(true);
            setError(null);

            const params: Record<string, string | number> = {};

            if (searchTerm) params.search = searchTerm;
            if (sortField) {
                const orderingField = sortField === "code_sous_famille" ? "code_sous_famille_materiel" : sortField;
                const ordering = sortOrder === "desc" ? `-${orderingField}` : orderingField;
                params.ordering = ordering;
            }
            params.page = currentPage;
            params.page_size = itemsPerPage;

            if (columnFilters.code_materiel) params.code_materiel = columnFilters.code_materiel;
            if (columnFilters.designation) params.designation = columnFilters.designation;
            if (columnFilters.num_serie) params.num_serie = columnFilters.num_serie;
            if (columnFilters.immatriculation) params.immatriculation = columnFilters.immatriculation;
            if (columnFilters.code_sous_famille) params.code_sous_famille = columnFilters.code_sous_famille;
            if (columnFilters.code_type_marque) params.code_type_marque = columnFilters.code_type_marque;
            if (columnFilters.libelle_famille) params.libelle_famille = columnFilters.libelle_famille;
            if (columnFilters.libelle_categorie) params.libelle_categorie = columnFilters.libelle_categorie;
            if (columnFilters.libelle_marque) params.libelle_marque = columnFilters.libelle_marque;
            if (columnFilters.code_filiale_g) params.code_filiale = columnFilters.code_filiale_g;
            if (columnFilters.est_bloque !== "") params.est_bloque = columnFilters.est_bloque;

            const response = await crudList<JournalMateriel>(GM_URL, params, { signal: controller.signal });
            setData(response.results);
            setTotalItems(response.count);
            setIsInitialLoading(false);
        } catch (err) {
            const axiosError = err as { name?: string; message?: string; response?: { data?: { message?: string; detail?: string } } };
            if (axiosError.name !== "CanceledError") {
                const errorMessage =
                    axiosError instanceof Error
                        ? axiosError.message
                        : "Une erreur est survenue lors du chargement des données";
                setError(errorMessage);
                console.error("Error fetching data:", axiosError);
            }
        } finally {
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
            setLoading(false);
        }
    }, [searchTerm, sortField, sortOrder, currentPage, itemsPerPage, columnFilters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
            if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
        filterTimerRef.current = setTimeout(() => {
            setColumnFilters(columnFiltersInput);
            setCurrentPage(1);
        }, 300);
        return () => {
            if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
        };
    }, [columnFiltersInput]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setSearchTerm(value);
            setCurrentPage(1);
        }, 400);
    };

    const handleColumnFilterChange = (key: keyof typeof columnFiltersInput) => (value: string) => {
        setColumnFiltersInput((prev) => ({ ...prev, [key]: value }));
    };

    const handleSort = (field: SortField) => {
        if (!field) return;

        const column = columns.find(c => c.key === field);
        if (column && !column.sortable) return;

        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setSearchInput("");
        setSearchTerm("");
        setColumnFiltersInput({
            code_materiel: "",
            designation: "",
            num_serie: "",
            immatriculation: "",
            code_sous_famille: "",
            code_type_marque: "",
            libelle_famille: "",
            libelle_categorie: "",
            libelle_marque: "",
            code_filiale_g: "",
            est_bloque: "",
        });
        setColumnFilters({
            code_materiel: "",
            designation: "",
            num_serie: "",
            immatriculation: "",
            code_sous_famille: "",
            code_type_marque: "",
            libelle_famille: "",
            libelle_categorie: "",
            libelle_marque: "",
            code_filiale_g: "",
            est_bloque: "",
        });
        setSortField(null);
        setSortOrder("asc");
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIdx = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

    const paginationItems = useMemo(() => {
        const items: (number | "...")[] = [];

        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        items.push(1);

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        if (start > 2) {
            items.push("...");
        }

        for (let i = start; i <= end; i++) {
            items.push(i);
        }

        if (end < totalPages - 1) {
            items.push("...");
        }

        items.push(totalPages);

        return items;
    }, [currentPage, totalPages]);

    if (loading && isInitialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-gray-600 animate-spin" />
                    <p className="text-gray-600 dark:text-dark-text-secondary">Chargement des données...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="flex items-center gap-4 mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Erreur</h2>
                    </div>
                    <p className="text-gray-700 dark:text-dark-text-primary mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className={components.button.primary}
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className={components.table.wrapper}>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-slate-200 dark:border-dark-border">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                            Consultation des équipements enregistrés.
                        </h2>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {/* Search Bar */}
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par code matériel ou désignation..."
                                value={searchInput}
                                onChange={handleSearchChange}
                                className={components.input + " pl-10"}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Lignes :</span>

                            <select
                                value={itemsPerPage}
                                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                className={components.select}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>

                        <button
                            onClick={handleReset}
                            className={components.button.secondary}
                        >
                            Réinitialiser
                        </button>
                    </div>
                </div>

                {/* Results info */}
                <div className="px-6 py-3 bg-slate-50 dark:bg-dark-bg-secondary border-b border-slate-200 dark:border-dark-border">
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                        Affichage de <span className="font-semibold">{startIdx}</span> à{" "}
                        <span className="font-semibold">{endIdx}</span>{" "}
                        sur <span className="font-semibold">{totalItems}</span>{" "}
                        résultat{totalItems !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={components.table.header + " border-b-2 border-slate-300"}>
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        onClick={() => handleSort(column.key)}
                                        className={`
                      ${column.width}
                      px-4
                      py-3
                      align-top
                      transition-colors
                      ${column.sortable ? "hover:bg-slate-200 cursor-pointer" : ""}
                  `}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-dark-text-primary">
                                                    {column.label}
                                                </span>

                                                <SortIcon
                                                    field={column.key}
                                                    sortField={sortField}
                                                    sortOrder={sortOrder}
                                                    sortable={column.sortable}
                                                />
                                            </div>

                                            <FilterInput
                                                value={columnFiltersInput[column.key as keyof typeof columnFiltersInput]}
                                                onChange={handleColumnFilterChange(column.key as keyof typeof columnFiltersInput)}
                                            />
                                        </div>
                                    </th>
                                ))}

                                <th
                                    onClick={() => handleSort("est_bloque")}
                                    className="min-w-[130px] px-4 py-3 align-top cursor-pointer hover:bg-slate-200 transition-colors"
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-dark-text-primary">
                                                Statut
                                            </span>

                                            <SortIcon
                                                field="est_bloque"
                                                sortField={sortField}
                                                sortOrder={sortOrder}
                                                sortable={true}
                                            />
                                        </div>

                                        <select
                                            value={columnFilters.est_bloque}
                                            onChange={(e) =>
                                                setColumnFilters((prev) => ({
                                                    ...prev,
                                                    est_bloque: e.target.value,
                                                }))
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                            className={components.input}
                                        >
                                            <option value="">Tous</option>
                                            <option value="false">Actif</option>
                                            <option value="true">Bloqué</option>
                                        </select>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        className={`${components.table.row} ${idx % 2 === 0 ? "bg-white dark:bg-dark-card" : "bg-slate-50/50 dark:bg-dark-bg-secondary/50"
                                            }`}
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-dark-text-primary font-medium">
                                            {item.code_materiel}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-dark-text-primary">
                                            {item.designation}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary">
                                            {item.num_serie}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary">
                                            {item.immatriculation}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary">
                                            {item.code_filiale_g}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary">
                                            {item.code_sous_famille}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary">
                                            {item.libelle_famille || ""}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary">
                                            {item.libelle_categorie || ""}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary">
                                            {item.code_type_marque}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary">
                                            {item.libelle_marque || ""}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary">
                                            {formatDate(item.date_acquisition)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-dark-text-primary text-right font-medium">
                                            {formatCurrency(item.valeur_acquisition)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-dark-text-primary text-right font-medium">
                                            {formatCurrency(item.valeur_remplacement)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary text-right">
                                            {item.taux_amortissement}%
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary text-right">
                                            {item.puissance_materiel}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge estBloque={item.est_bloque} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={16}
                                        className="px-4 py-8 text-center text-gray-500 dark:text-dark-text-secondary"
                                    >
                                        Aucun résultat trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg-secondary flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={components.button.primary}
                        >
                            Précédent
                        </button>

                        <div className="flex items-center gap-2">
                            {paginationItems.map((item, index) =>
                                item === "..." ? (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="px-2 text-gray-400"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={item}
                                        onClick={() => setCurrentPage(item)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentPage === item
                                            ? "bg-blue-600 text-white"
                                            : "bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text-primary border border-slate-300 hover:border-blue-600"
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ),
                            )}
                        </div>

                        <button
                            onClick={() =>
                                setCurrentPage(Math.min(totalPages, currentPage + 1))
                            }
                            disabled={currentPage === totalPages}
                            className={components.button.primary}
                        >
                            Suivant
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JournalMaterielTable;
