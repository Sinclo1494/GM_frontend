'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ChevronUp, ChevronDown, Search, Loader2, AlertCircle } from 'lucide-react';

interface GrandMateriel {
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

type SortField = 'code_materiel' | 'designation' | null;
type SortOrder = 'asc' | 'desc';

interface SortIconProps {
    field: Exclude<SortField, null>;
    sortField: SortField;
    sortOrder: SortOrder;
}

const SortIcon: React.FC<SortIconProps> = ({
    field,
    sortField,
    sortOrder,
}) => {
    if (sortField !== field) {
        return <div className="w-4 h-4 text-gray-300" />;
    }

    return sortOrder === 'asc' ? (
        <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
        <ChevronDown className="w-4 h-4 text-blue-600" />
    );
};

interface StatusBadgeProps {
    estBloque: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ estBloque }) => {
    return estBloque ? (
        <span className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
            Bloqué
        </span>
    ) : (
        <span className="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">
            Actif
        </span>
    );
};


const TabGrandMateriel: React.FC = () => {
    const [data, setData] = useState<GrandMateriel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<GrandMateriel[]>(
                    'http://localhost:8000/api/grand-materiel/'
                );
                setData(response.data);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des données';
                setError(errorMessage);
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Search logic
    const searchedData = useMemo(() => {
        return data.filter(
            (item) =>
                item.code_materiel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.designation.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    // Sorting logic
    const sortedData = useMemo(() => {
        const sorted = [...searchedData];
        if (!sortField) return sorted;

        sorted.sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [searchedData, sortField, sortOrder]);

    // Pagination logic
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const paginatedData = sortedData.slice(startIdx, endIdx);

    // Handle sorting
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    // Reset pagination when search changes
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setCurrentPage(1);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [searchTerm]);

    // Format currency
    const formatCurrency = (value: string | number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'DZD',
        }).format(Number(value));
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };



    // Status badge


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-600 text-lg">Chargement des données...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="flex items-center gap-4 mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                        <h2 className="text-xl font-bold text-red-600">Erreur</h2>
                    </div>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Grand Matériel</h1>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par code matériel ou désignation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </div>
                </div>

                {/* Results info */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <p className="text-sm text-gray-600">
                        Affichage de <span className="font-semibold">{startIdx + 1}</span> à{' '}
                        <span className="font-semibold">{Math.min(endIdx, sortedData.length)}</span> sur{' '}
                        <span className="font-semibold">{sortedData.length}</span> résultat
                        {sortedData.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-gray-100 border-b-2 border-gray-300">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
                                    onClick={() => handleSort('code_materiel')}>
                                    <div className="flex items-center gap-2">
                                        Code Matériel
                                        <SortIcon
                                            field="code_materiel"
                                            sortField={sortField}
                                            sortOrder={sortOrder}
                                        />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
                                    onClick={() => handleSort('designation')}>
                                    <div className="flex items-center gap-2">
                                        Désignation
                                        <SortIcon
                                            field="designation"
                                            sortField={sortField}
                                            sortOrder={sortOrder}
                                        />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Num Série</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Immatriculation</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date Acquisition</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Valeur Acquisition</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Valeur Remplacement</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Taux Amort. (%)</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Puissance</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sous Famille</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type Marque</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Filiale</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        className={`border-b border-gray-200 hover:bg-blue-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                            }`}
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">{item.code_materiel}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800">{item.designation}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.num_serie}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.immatriculation}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(item.date_acquisition)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800 text-right font-medium">
                                            {formatCurrency(item.valeur_acquisition)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800 text-right font-medium">
                                            {formatCurrency(item.valeur_remplacement)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.taux_amortissement}%</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.puissance_materiel}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.code_sous_famille}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.code_type_marque}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.code_filiale_g}</td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge estBloque={item.est_bloque} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={13} className="px-4 py-8 text-center text-gray-500">
                                        Aucun résultat trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                            Précédent
                        </button>

                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                            Suivant
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabGrandMateriel;
