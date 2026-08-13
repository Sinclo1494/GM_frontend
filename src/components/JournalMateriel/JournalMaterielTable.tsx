"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
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

const API = import.meta.env.VITE_API_BASE_URL;
const GM_URL = `${API}/grand-materiel/`

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
    | "code_filiale_g"
    | "est_bloque"
    | null;
type SortOrder = "asc" | "desc";

interface SortIconProps {
    field: Exclude<SortField, null>;
    sortField: SortField;
    sortOrder: SortOrder;
}

const SortIcon: React.FC<SortIconProps> = ({ field, sortField, sortOrder }) => {
    if (sortField !== field) {
        return <div className="h-4 w-4 text-gray-300" />;
    }

    return sortOrder === "asc" ? (
        <ChevronUp className="h-4 w-4 text-blue-600" />
    ) : (
        <ChevronDown className="h-4 w-4 text-blue-600" />
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
        className={components.input}
    />
);

const JournalMaterielTable: React.FC = () => {
    const [data, setData] = useState<JournalMateriel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const columns = [
        { key: "code_materiel", label: "Code Matériel", width: "min-w-[170px]" },
        { key: "designation", label: "Désignation", width: "min-w-[250px]" },
        { key: "num_serie", label: "N° Série", width: "min-w-[170px]" },
        {
            key: "immatriculation",
            label: "Immatriculation",
            width: "min-w-[170px]",
        },
        { key: "code_filiale_g", label: "Filiale", width: "min-w-[130px]" },
        { key: "code_sous_famille", label: "Sous Famille", width: "min-w-[180px]" },
        { key: "code_type_marque", label: "Type Marque", width: "min-w-[180px]" },
        {
            key: "date_acquisition",
            label: "Date Acquisition",
            width: "min-w-[170px]",
        },
        {
            key: "valeur_acquisition",
            label: "Valeur Acquisition",
            width: "min-w-[180px]",
        },
        {
            key: "valeur_remplacement",
            label: "Valeur Remp.",
            width: "min-w-[190px]",
        },
        { key: "taux_amortissement", label: "Taux Amort.", width: "min-w-[150px]" },
        { key: "puissance_materiel", label: "Puissance", width: "min-w-[150px]" },
    ] as const;

    const [columnFilters, setColumnFilters] = useState({
        code_materiel: "",
        designation: "",
        num_serie: "",
        immatriculation: "",
        date_acquisition: "",
        valeur_acquisition: "",
        valeur_remplacement: "",
        taux_amortissement: "",
        puissance_materiel: "",
        code_sous_famille: "",
        code_type_marque: "",
        code_filiale_g: "",
        est_bloque: "",
    });

    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<JournalMateriel[]>(
                    GM_URL,
                );
                setData(response.data);
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Une erreur est survenue lors du chargement des données";
                setError(errorMessage);
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    const contains = (value: string | null | undefined, filter: string) =>
        (value ?? "").toLowerCase().includes(filter.toLowerCase());
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const global =
                contains(item.code_materiel, searchTerm) ||
                contains(item.designation, searchTerm);

            return (
                global &&
                contains(item.code_materiel, columnFilters.code_materiel) &&
                contains(item.designation, columnFilters.designation) &&
                contains(item.num_serie, columnFilters.num_serie) &&
                contains(item.immatriculation, columnFilters.immatriculation) &&
                contains(item.code_sous_famille, columnFilters.code_sous_famille) &&
                contains(item.code_type_marque, columnFilters.code_type_marque) &&
                contains(item.code_filiale_g, columnFilters.code_filiale_g) &&
                contains(item.date_acquisition, columnFilters.date_acquisition) &&
                contains(item.valeur_acquisition, columnFilters.valeur_acquisition) &&
                contains(item.valeur_remplacement, columnFilters.valeur_remplacement) &&
                contains(item.taux_amortissement, columnFilters.taux_amortissement) &&
                contains(item.puissance_materiel, columnFilters.puissance_materiel) &&
                (columnFilters.est_bloque === "" ||
                    String(item.est_bloque) === columnFilters.est_bloque)
            );
        });
    }, [data, searchTerm, columnFilters]);

    const sortedData = useMemo(() => {
        const sorted = [...filteredData];
        if (!sortField) return sorted;

        sorted.sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [filteredData, sortField, sortOrder]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
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

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
        setCurrentPage(1);
    };

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setCurrentPage(1);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [searchTerm, columnFilters, itemsPerPage]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                    <p className="text-gray-600">Chargement des données...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="flex items-center gap-4 mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                        <h2 className="text-xl font-bold text-red-600">Erreur</h2>
                    </div>
                    <p className="text-gray-700 mb-4">{error}</p>
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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
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
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className={components.input + " pl-10"}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Lignes :</span>

                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className={components.select}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>

                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setColumnFilters({
                                    code_materiel: "",
                                    designation: "",
                                    num_serie: "",
                                    immatriculation: "",
                                    date_acquisition: "",
                                    valeur_acquisition: "",
                                    valeur_remplacement: "",
                                    taux_amortissement: "",
                                    puissance_materiel: "",
                                    code_sous_famille: "",
                                    code_type_marque: "",
                                    code_filiale_g: "",
                                    est_bloque: "",
                                });
                            }}
                            className={components.button.secondary}
                        >
                            Réinitialiser
                        </button>
                    </div>
                </div>

                {/* Results info */}
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                    <p className="text-sm text-gray-600">
                        Affichage de <span className="font-semibold">{startIdx + 1}</span> à{" "}
                        <span className="font-semibold">
                            {Math.min(endIdx, sortedData.length)}
                        </span>{" "}
                        sur <span className="font-semibold">{sortedData.length}</span>{" "}
                        résultat
                        {sortedData.length !== 1 ? "s" : ""}
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
                      hover:bg-slate-200
                      cursor-pointer
                  `}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                                    {column.label}
                                                </span>

                                                <SortIcon
                                                    field={column.key}
                                                    sortField={sortField}
                                                    sortOrder={sortOrder}
                                                />
                                            </div>

                                            <FilterInput
                                                value={columnFilters[column.key]}
                                                onChange={(value) =>
                                                    setColumnFilters((prev) => ({
                                                        ...prev,
                                                        [column.key]: value,
                                                    }))
                                                }
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
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                                Statut
                                            </span>

                                            <SortIcon
                                                field="est_bloque"
                                                sortField={sortField}
                                                sortOrder={sortOrder}
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
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        className={`${components.table.row} ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                                            }`}
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                                            {item.code_materiel}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800">
                                            {item.designation}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {item.num_serie}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {item.immatriculation}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {item.code_filiale_g}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {item.code_sous_famille}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {item.code_type_marque}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {formatDate(item.date_acquisition)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800 text-right font-medium">
                                            {formatCurrency(item.valeur_acquisition)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800 text-right font-medium">
                                            {formatCurrency(item.valeur_remplacement)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                            {item.taux_amortissement}%
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
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
                                        colSpan={13}
                                        className="px-4 py-8 text-center text-gray-500"
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
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
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
                                            : "bg-white text-gray-700 border border-slate-300 hover:border-blue-600"
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
