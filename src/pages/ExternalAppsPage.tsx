import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Edit, Key, Copy } from "lucide-react";
import { components } from "../theme/components";
import CrudTable, { type ColumnDef } from "../components/Crud/CrudTable";
import EntityFormDialog, { type FieldConfig } from "../components/Crud/EntityFormDialog";
import { crudList, crudCreate, crudUpdate, crudDelete } from "../api/crudService";
import { usePermissions } from "../auth/PermissionContext";
import { useEntityOptions } from "../components/Crud/useEntityOptions";

const ID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const SECRET_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function randomString(alphabet: string, length: number): string {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    let out = "";
    for (let i = 0; i < length; i++) {
        out += alphabet[bytes[i] % alphabet.length];
    }
    return out;
}

const generateClientId = () => "svc_" + randomString(ID_ALPHABET, 32);
const generateClientSecret = () => randomString(SECRET_ALPHABET, 48);

interface ExternalServiceClient {
  id: string;
  name: string;
  client_id: string;
  client_secret_hash: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  created_by: number | null;
  created_by_username: string | null;
  allowed_filiales: string[];
  allowed_filiales_codes: string[];
  client_secret?: string;
}

const columns: ColumnDef<ExternalServiceClient>[] = [
  { key: "name", label: "Nom", width: "min-w-[160px]", sortable: true },
  { key: "client_id", label: "Client ID", width: "min-w-[200px]" },
  {
    key: "is_active",
    label: "Actif",
    width: "min-w-[90px]",
    render: (val: unknown) => (
      <span
        className={
          val
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"
            : "bg-gray-100 text-gray-700 dark:text-dark-text-primary px-2 py-0.5 rounded-full text-xs font-semibold"
        }
      >
        {val ? "Actif" : "Inactif"}
      </span>
    ),
  },
  {
    key: "allowed_filiales_codes",
    label: "Filiales autorisées",
    width: "min-w-[180px]",
    render: (_val: unknown, row: ExternalServiceClient) => {
      const codes = row.allowed_filiales_codes || [];
      if (codes.length === 0) return <span className="text-xs text-red-500">Aucune</span>;
      return <span className="text-xs">{codes.join(", ")}</span>;
    },
  },
  { key: "created_at", label: "Créé le", width: "min-w-[140px]" },
  { key: "last_used_at", label: "Dernière utilisation", width: "min-w-[160px]" },
];

export default function ExternalAppsPage() {
  const { user: currentUser, permissions: currentPermissions } = usePermissions();
  const canManage =
    currentUser?.is_superuser ||
    currentPermissions.includes("administration.external_apps") ||
    currentPermissions.includes("administration.users") ||
    currentPermissions.includes("administration.users.write");

  const { options: filialeOptions } = useEntityOptions<any>("filiale", "code_filiale", "libelle_filiale");

  const [data, setData] = useState<ExternalServiceClient[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ExternalServiceClient | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<ExternalServiceClient | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [secretDialogOpen, setSecretDialogOpen] = useState(false);
  const [shownSecret, setShownSecret] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await crudList<ExternalServiceClient>("external-service-clients", {
        search: searchTerm || undefined,
        page: currentPage,
        page_size: itemsPerPage,
      });
      setData(res.results);
      setTotalItems(res.count);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "CanceledError") {
        setError("Erreur lors du chargement.");
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setLoading(false);
    }
  }, [searchTerm, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 400);
  }, []);

  const getFields = (): FieldConfig[] => {
    return [
      { name: "name", label: "Nom", type: "text", required: true },
      { name: "client_id", label: "Client ID", type: "text", copyable: true, onGenerate: generateClientId },
      { name: "client_secret", label: "Client Secret", type: "password", copyable: true, onGenerate: generateClientSecret },
      { name: "is_active", label: "Actif", type: "checkbox" },
      { name: "expires_at", label: "Expire le", type: "datetime-local" },
      {
        name: "allowed_filiales_codes",
        label: "Filiales autorisées",
        type: "multiselect",
        options: filialeOptions.map((o) => ({ value: o.value, label: o.label })),
      },
    ];
  };

  const openCreate = () => {
    setEditing(null);
    setFormValues({ is_active: true, allowed_filiales_codes: [] });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (row: ExternalServiceClient) => {
    setEditing(row);
    setFormValues({
      name: row.name,
      client_id: row.client_id,
      is_active: row.is_active,
      expires_at: row.expires_at ? row.expires_at.slice(0, 16) : "",
      allowed_filiales_codes: row.allowed_filiales_codes || [],
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    setFormError(null);
    try {
      const payload: Record<string, unknown> = { ...values };
      if (!payload.client_id) delete payload.client_id;
      if (!payload.client_secret) delete payload.client_secret;
      if (payload.expires_at === "") payload.expires_at = null;
      if (Array.isArray(payload.allowed_filiales_codes)) {
        // keep as-is
      }
      let res: ExternalServiceClient;
      if (editing) {
        res = await crudUpdate<ExternalServiceClient>("external-service-clients", editing.id, payload);
      } else {
        res = await crudCreate<ExternalServiceClient>("external-service-clients", payload);
      }
      setDialogOpen(false);
      if (res.client_secret) {
        setShownSecret(res.client_secret);
        setSecretDialogOpen(true);
      }
      fetchData();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: any } };
      const dataErr = axiosError.response?.data;
      if (dataErr && typeof dataErr === "object") {
        setFormError(JSON.stringify(dataErr));
      } else {
        setFormError("Erreur lors de l'enregistrement.");
      }
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await crudDelete("external-service-clients", deleting.id);
      setDeleteOpen(false);
      setDeleting(null);
      fetchData();
    } catch (err: unknown) {
      setDeleteError("Erreur lors de la suppression.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const copySecret = async () => {
    if (!shownSecret) return;
    try {
      await navigator.clipboard.writeText(shownSecret);
    } catch {
      // ignore
    }
  };

  const actions = canManage
    ? (row: ExternalServiceClient) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEdit(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setDeleting(row);
              setDeleteOpen(true);
            }}
            className="text-red-600 dark:text-red-400 hover:text-red-800 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    : undefined;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Applications externes</h1>
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">Gestion des clients externes et de leurs accès</p>
        </div>
        {canManage && (
          <button onClick={openCreate} className={components.button.primary}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau client
          </button>
        )}
      </div>

      <CrudTable<ExternalServiceClient>
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        searchTerm={searchInput}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Rechercher par nom ou client ID..."
        sortField={null}
        sortOrder="asc"
        onSort={() => {}}
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(n) => {
          setItemsPerPage(n);
          setCurrentPage(1);
        }}
        onRetry={fetchData}
        actions={actions}
        emptyMessage="Aucun client externe trouvé"
      />

<EntityFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Modifier le client externe" : "Nouveau client externe"}
        fields={getFields()}
        initialValues={formValues}
        onSubmit={handleSubmit}
        submitLabel={editing ? "Enregistrer" : "Créer"}
        error={formError}
      />

      {deleteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
              Êtes-vous sûr de vouloir supprimer le client "{deleting?.name}" ? Cette action est irréversible.
            </p>
            {deleteError && <p className="text-sm text-red-600 mb-3">{deleteError}</p>}
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteOpen(false)} className={components.button.secondary} disabled={deleteLoading}>
                Annuler
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50" disabled={deleteLoading}>
                {deleteLoading ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {secretDialogOpen && shownSecret && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-card rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2 flex items-center gap-2">
              <Key className="h-5 w-5" />
              Client Secret généré
            </h3>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
              Copiez ce secret maintenant. Il ne sera plus affiché.
            </p>
            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-dark-bg-secondary rounded-lg mb-4">
              <code className="flex-1 text-xs break-all font-mono">{shownSecret}</code>
              <button onClick={copySecret} className={components.button.secondary} title="Copier">
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-end">
              <button onClick={() => { setSecretDialogOpen(false); setShownSecret(null); }} className={components.button.primary}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
