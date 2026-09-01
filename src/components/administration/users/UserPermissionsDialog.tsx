import { useEffect } from "react";
import { components } from "../../../theme/components";
import { useAuth } from "../../../context/useAuth";
import { PERMISSIONS, PERMISSION_CATEGORIES, CATEGORY_LABELS, getPermissionsByCategory, type PermissionDefinition } from "../../../auth/permissions";

interface UserPermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    is_superuser: boolean;
  };
  selectedPermissions: string[];
  onSelectedPermissionsChange: (permissions: string[]) => void;
  onSave: () => void;
  loading: boolean;
  error: string | null;
}

export default function UserPermissionsDialog({
  open,
  onClose,
  user,
  selectedPermissions,
  onSelectedPermissionsChange,
  onSave,
  loading,
  error,
}: UserPermissionsDialogProps) {
  const { user: currentUser } = useAuth();
  const isSuperuser = user.is_superuser;

  useEffect(() => {
    if (open && isSuperuser) {
      onSelectedPermissionsChange(PERMISSIONS.map((p) => p.key));
    }
  }, [open, isSuperuser, onSelectedPermissionsChange]);

  if (!open) return null;

  const togglePermission = (key: string) => {
    if (isSuperuser) return;
    if (selectedPermissions.includes(key)) {
      onSelectedPermissionsChange(selectedPermissions.filter((p) => p !== key));
    } else {
      onSelectedPermissionsChange([...selectedPermissions, key]);
    }
  };

  const toggleCategory = (category: string) => {
    if (isSuperuser) return;
    const categoryPerms = getPermissionsByCategory(category as PermissionDefinition["category"]);
    const allSelected = categoryPerms.every((p) => selectedPermissions.includes(p.key));
    if (allSelected) {
      onSelectedPermissionsChange(selectedPermissions.filter((p) => !categoryPerms.find((cp) => cp.key === p)));
    } else {
      const newPerms = [...selectedPermissions];
      categoryPerms.forEach((p) => {
        if (!newPerms.includes(p.key)) {
          newPerms.push(p.key);
        }
      });
      onSelectedPermissionsChange(newPerms);
    }
  };

  const getCategoryState = (category: string): boolean | "indeterminate" => {
    const categoryPerms = getPermissionsByCategory(category as PermissionDefinition["category"]);
    const selectedCount = categoryPerms.filter((p) => selectedPermissions.includes(p.key)).length;
    if (selectedCount === 0) return false;
    if (selectedCount === categoryPerms.length) return true;
    return "indeterminate";
  };

  const currentUserIsTarget = currentUser?.id === user.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`${components.modal} max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-1">
          Droits d'accès
        </h3>
        <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
          Utilisateur : <strong>{user.first_name} {user.last_name}</strong> ({user.username})
        </p>

        {isSuperuser && (
          <div className="mb-4 rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            Ce compte est administrateur. Il dispose automatiquement de tous les droits.
          </div>
        )}

        {currentUserIsTarget && (
          <div className="mb-4 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Vous modifiez vos propres droits. La permission "Administration → Utilisateurs" ne peut pas être retirée.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md border border-red-200 dark:border-red-800 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {PERMISSION_CATEGORIES.map((category) => {
            const categoryPerms = getPermissionsByCategory(category);
            const categoryState = getCategoryState(category);
            const isIndeterminate = categoryState === "indeterminate";

            return (
              <div key={category} className="border border-slate-200 dark:border-dark-border rounded-lg p-4">
                <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={categoryState === true}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={() => toggleCategory(category)}
                    disabled={isSuperuser}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="font-semibold text-gray-800 dark:text-dark-text-primary">
                    {CATEGORY_LABELS[category]}
                  </span>
                </label>
                <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categoryPerms.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.key);
                    const isUsersPerm = perm.key === "administration.users";
                    const disabled = isSuperuser || (currentUserIsTarget && isUsersPerm);

                    return (
                      <label
                        key={perm.key}
                        className={`flex items-center gap-2 text-sm ${disabled ? "opacity-50" : "cursor-pointer"}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.key)}
                          disabled={disabled}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className="text-gray-700 dark:text-dark-text-secondary">{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-dark-border mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className={components.button.secondary}
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className={components.button.primary}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
