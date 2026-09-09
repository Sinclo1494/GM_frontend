import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Edit, Shield } from "lucide-react";
import { components } from "../theme/components";
import CrudTable, { type ColumnDef, type SortField, type SortOrder } from "../components/Crud/CrudTable";
import EntityFormDialog, { type FieldConfig } from "../components/Crud/EntityFormDialog";
import { getUsers, createUser, updateUser, deleteUser, getUser, getUserPermissions, updateUserPermissions, setUserPassword } from "../api/userService";
import type { UserInfo } from "../types/user";
import UserPermissionsDialog from "../components/administration/users/UserPermissionsDialog";
import { usePermissions } from "../auth/PermissionContext";

const fields: FieldConfig[] = [
  { name: "username", label: "Nom d'utilisateur", type: "text", required: true },
  { name: "first_name", label: "Prénom", type: "text" },
  { name: "last_name", label: "Nom", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "password", label: "Mot de passe", type: "password", required: true },
  { name: "is_active", label: "Actif", type: "checkbox" },
];

const columns: ColumnDef<UserInfo>[] = [
  { key: "username", label: "Utilisateur", width: "min-w-[160px]", sortable: true },
  {
    key: "first_name",
    label: "Nom complet",
    width: "min-w-[180px]",
    sortable: true,
    render: (_val: unknown, row: UserInfo) => `${row.first_name || ""} ${row.last_name || ""}`.trim() || "—",
  },
  { key: "email", label: "Email", width: "min-w-[220px]", sortable: true },
  {
    key: "is_active",
    label: "Statut",
    width: "min-w-[100px]",
    sortable: true,
    render: (val: unknown) => (
      <span className={val ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-gray-100 text-gray-700 dark:text-dark-text-primary px-2 py-0.5 rounded-full text-xs font-semibold"}>
        {val ? "Actif" : "Inactif"}
      </span>
    ),
  },
  {
    key: "permissions",
    label: "Accès",
    width: "min-w-[200px]",
    render: (_val: unknown, row: UserInfo) => {
      const count = (row.permissions || []).length;
      return (
        <div className="flex items-center gap-1">
          <Shield className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{count} droit{count !== 1 ? "s" : ""}</span>
        </div>
      );
    },
  },
];

export default function UsersPage() {
  const { user: currentUser, permissions: currentPermissions } = usePermissions();
  const canManageUsers = currentUser?.is_superuser
    || currentPermissions.includes("administration.users")
    || currentPermissions.includes("administration.users.write");

  const [data, setData] = useState<UserInfo[]>([]);
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
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserInfo | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [permissionsUser, setPermissionsUser] = useState<UserInfo | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

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
      const raw = await getUsers(params);
      setData(raw.results as UserInfo[]);
      setTotalItems(raw.count);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "CanceledError") {
        const axiosError = err as { response?: { data?: { message?: string; detail?: string } }; message?: string };
        setError(axiosError.response?.data?.message ?? axiosError.message ?? "Erreur lors du chargement.");
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setLoading(false);
    }
  }, [searchTerm, sortField, sortOrder, currentPage, itemsPerPage]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    setEditingUser(null);
    setFormValues({
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      is_active: true,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = async (user: UserInfo) => {
    setEditingUser(user);
    setFormError(null);
    try {
      const detail = await getUser(user.id);
      setFormValues({
        username: detail.username,
        first_name: detail.first_name,
        last_name: detail.last_name,
        email: detail.email,
        is_active: detail.is_active,
      });
    } catch {
      setFormValues({
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        is_active: user.is_active,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      if (editingUser) {
        const { password, ...rest } = values;
        await updateUser(editingUser.id, rest as { first_name?: string; last_name?: string; email?: string; is_active?: boolean });
        if (password && typeof password === "string" && password.trim() !== "") {
          await setUserPassword(editingUser.id, password);
        }
      } else {
        await createUser(values as { username: string; first_name: string; last_name: string; email: string; password: string; is_active?: boolean });
      }
      setDialogOpen(false);
      fetchData();
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { detail?: string; message?: string } }; message?: string };
      const data = axiosError.response?.data;
      let message: string | undefined;
      if (axiosError.response?.status === 403) {
        message = "Vous n'avez pas les droits nécessaires pour modifier un utilisateur.";
      } else {
        message = data?.detail ?? data?.message ?? axiosError.message ?? "Erreur lors de l'enregistrement.";
      }
      setFormError(message);
      throw err;
    }
  };

  const openDelete = (user: UserInfo) => {
    setDeletingUser(user);
    setDeleteError(null);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteUser(deletingUser.id);
      setDeleteOpen(false);
      setDeletingUser(null);
      fetchData();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string; detail?: string } }; message?: string };
      setDeleteError(
        axiosError.response?.data?.message ??
        axiosError.response?.data?.detail ??
        axiosError.message ??
        "Erreur lors de la suppression.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const openPermissions = async (user: UserInfo) => {
    setPermissionsUser(user);
    setPermissionsError(null);
    setPermissionsLoading(true);
    try {
      const perms = await getUserPermissions(user.id);
      setSelectedPermissions(perms);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
      setPermissionsError(axiosError.response?.data?.message ?? axiosError.message ?? "Erreur lors du chargement des droits.");
    } finally {
      setPermissionsLoading(false);
    }
    setPermissionsOpen(true);
  };

  const savePermissions = async () => {
    if (!permissionsUser) return;
    setPermissionsLoading(true);
    setPermissionsError(null);
    try {
      await updateUserPermissions(permissionsUser.id, selectedPermissions);
      setPermissionsOpen(false);
      setPermissionsUser(null);
      fetchData();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
      setPermissionsError(axiosError.response?.data?.message ?? axiosError.message ?? "Erreur lors de l'enregistrement des droits.");
    } finally {
      setPermissionsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={components.pageTitle}>Utilisateurs</h1>
            <p className={components.pageDescription}>
              Gérez les comptes utilisateurs et leurs droits d'accès.
            </p>
          </div>
          <button onClick={openCreate} type="button" disabled={!canManageUsers} className={components.button.primary}>
            <Plus className="h-4 w-4" />
            Nouvel utilisateur
          </button>
        </header>

        <CrudTable<UserInfo>
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
          searchPlaceholder="Rechercher un utilisateur..."
          actions={(row: UserInfo) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEdit(row)}
                disabled={!canManageUsers}
                className="text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-blue-600"
                title={canManageUsers ? "Modifier" : "Modification non autorisée"}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => openPermissions(row)}
                disabled={!canManageUsers}
                className="text-purple-600 hover:text-purple-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-purple-600"
                title={canManageUsers ? "Droits d'accès" : "Modification non autorisée"}
              >
                <Shield className="h-4 w-4" />
              </button>
              <button
                onClick={() => openDelete(row)}
                disabled={!canManageUsers}
                className="text-red-600 dark:text-red-400 hover:text-red-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-red-600 dark:disabled:hover:text-red-400"
                title={canManageUsers ? "Supprimer" : "Suppression non autorisée"}
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
          title={editingUser ? `Modifier ${editingUser.username}` : "Nouvel utilisateur"}
          submitLabel={editingUser ? "Mettre à jour" : "Créer"}
        />

        {deleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={components.modal}>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-2">
                Confirmer la suppression
              </h3>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
                Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{deletingUser?.username}</strong> ?
              </p>
              {deleteError && (
                <div className="mb-4 rounded-md border border-red-200 dark:border-red-800 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {deleteError}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-dark-border">
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

        {permissionsOpen && permissionsUser && (
          <UserPermissionsDialog
            open={permissionsOpen}
            onClose={() => {
              setPermissionsOpen(false);
              setPermissionsUser(null);
            }}
            user={permissionsUser}
            selectedPermissions={selectedPermissions}
            onSelectedPermissionsChange={setSelectedPermissions}
            onSave={savePermissions}
            loading={permissionsLoading}
            error={permissionsError}
          />
        )}
      </div>
    </div>
  );
}
