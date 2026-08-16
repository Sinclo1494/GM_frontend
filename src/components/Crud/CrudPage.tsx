import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { components } from "../../theme/components";
import CrudTable, { type ColumnDef, type SortField, type SortOrder } from "./CrudTable";
import EntityFormDialog, { type FieldConfig } from "./EntityFormDialog";
import { crudList, crudGet, crudCreate, crudUpdate, crudDelete } from "../../api/crudService";

export type { ColumnDef } from "./CrudTable";
export type { FieldConfig } from "./EntityFormDialog";

interface CrudPageProps<T> {
    title: string;
    endpoint: string;
    fields: FieldConfig[];
    columns: ColumnDef<T>[];
    mapRow?: (item: any) => T;
    initialFormValues?: () => Record<string, unknown>;
    beforeSubmit?: (values: Record<string, unknown>, mode: "create" | "edit") => Record<string, unknown>;
    deleteConfirmMessage?: (item: T) => string;
    searchPlaceholder?: string;
}

function CrudPage<T>({
    title,
    endpoint,
    fields,
    columns,
    mapRow,
    initialFormValues = () => ({}),
    beforeSubmit,
    deleteConfirmMessage,
    searchPlaceholder,
}: CrudPageProps<T>) {
    const [data, setData] = useState<T[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const [formValues, setFormValues] = useState<Record<string, unknown>>({});
    const [formError, setFormError] = useState<string | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<T | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string | number> = {};
            if (searchTerm) params.search = searchTerm;
            if (sortField) params.ordering = sortOrder === "desc" ? `-${sortField}` : sortField;
            params.page = currentPage;
            params.page_size = itemsPerPage;
            const raw = await crudList(endpoint, params, { signal: controller.signal });
            const mapped = mapRow ? raw.results.map(mapRow) : (raw.results as T[]);
            setData(mapped);
            setTotalItems(raw.count);
        } catch (err: any) {
            if (err.name !== "CanceledError") {
                setError(err?.response?.data?.message ?? err?.message ?? "Erreur lors du chargement.");
            }
        } finally {
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
            setLoading(false);
        }
    }, [endpoint, searchTerm, sortField, sortOrder, currentPage, itemsPerPage, mapRow]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        setSearchInput(value);
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }
        searchTimerRef.current = setTimeout(() => {
            setSearchTerm(value);
            setCurrentPage(1);
        }, 400);
    }, []);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
        setCurrentPage(1);
    };

    const openCreate = () => {
        setEditingItem(null);
        setFormValues(initialFormValues());
        setFormError(null);
        setDialogOpen(true);
    };

    const openEdit = async (item: T) => {
        setEditingItem(item);
        setFormError(null);
        try {
            const id = (item as any).id;
            const detail = await crudGet(endpoint, id);
            setFormValues(detail as Record<string, unknown>);
        } catch {
            setFormValues(initialFormValues());
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (values: Record<string, unknown>) => {
        const payload = beforeSubmit ? beforeSubmit(values, editingItem ? "edit" : "create") : values;
        if (editingItem) {
            const id = (editingItem as any).id;
            await crudUpdate(endpoint, id, payload);
        } else {
            await crudCreate(endpoint, payload);
        }
        setDialogOpen(false);
        fetchData();
    };

    const openDelete = (item: T) => {
        setDeletingItem(item);
        setDeleteError(null);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingItem) return;
        setDeleteLoading(true);
        setDeleteError(null);
        try {
            const id = (deletingItem as any).id;
            await crudDelete(endpoint, id);
            setDeleteOpen(false);
            setDeletingItem(null);
            fetchData();
        } catch (err: any) {
            setDeleteError(
                err?.response?.data?.message ??
                err?.response?.data?.detail ??
                err?.message ??
                "Erreur lors de la suppression.",
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mx-auto max-w-7xl">
                <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className={components.pageTitle}>{title}</h1>
                        <p className={components.pageDescription}>
                            Gérez les enregistrements de cette section.
                        </p>
                    </div>
                    <button onClick={openCreate} className={components.button.primary}>
                        <Plus className="h-4 w-4" />
                        Nouvel enregistrement
                    </button>
                </header>

                <CrudTable<T>
                    columns={columns}
                    data={data}
                    loading={loading}
                    error={error}
                    searchTerm={searchInput}
                    onSearchChange={handleSearchChange}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    onRetry={fetchData}
                    totalItems={totalItems}
                    searchPlaceholder={searchPlaceholder || `Rechercher dans ${title}...`}
                    actions={(row) => (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => openEdit(row)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Modifier"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => openDelete(row)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Supprimer"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                />

                <EntityFormDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onSubmit={handleSubmit}
                    fields={fields}
                    initialValues={formValues}
                    error={formError}
                    title={editingItem ? `Modifier ${title}` : `Nouvel enregistrement - ${title}`}
                    submitLabel={editingItem ? "Mettre à jour" : "Créer"}
                />

                {deleteOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className={components.modal}>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Confirmer la suppression
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                {deleteConfirmMessage
                                    ? deleteConfirmMessage(deletingItem!)
                                    : `Êtes-vous sûr de vouloir supprimer cet enregistrement de ${title} ?`}
                            </p>
                            {deleteError && (
                                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {deleteError}
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    onClick={() => setDeleteOpen(false)}
                                    disabled={deleteLoading}
                                    className={components.button.secondary}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleteLoading}
                                    className={components.button.danger}
                                >
                                    {deleteLoading ? "Suppression..." : "Supprimer"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CrudPage;
