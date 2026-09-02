import { useEffect, useState, useCallback } from "react";
import { components } from "../../../theme/components";
import { useAuth } from "../../../context/useAuth";
import { PERMISSIONS, PERMISSION_CATEGORIES, CATEGORY_LABELS, PERMISSION_DEPENDENCIES, getPermissionsByCategory, getAllDependencies, getPermissionByKey, type PermissionDefinition } from "../../../auth/permissions";

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

type PermissionState = Record<string, { read: boolean; write: boolean }>;

function normalizePermissions(perms: string[]): PermissionState {
  const state: PermissionState = {};
  PERMISSIONS.forEach((p) => {
    state[p.key] = { read: false, write: false };
  });
  perms.forEach((p) => {
    if (p.endsWith(".read")) {
      const base = p.slice(0, -5);
      if (state[base]) state[base].read = true;
    } else if (p.endsWith(".write")) {
      const base = p.slice(0, -6);
      if (state[base]) {
        state[base].read = true;
        state[base].write = true;
      }
    } else {
      if (state[p]) {
        state[p].read = true;
        state[p].write = true;
      }
    }
  });
  return state;
}

function serializePermissions(state: PermissionState): string[] {
  const perms: string[] = [];
  Object.entries(state).forEach(([key, { read, write }]) => {
    const permDef = getPermissionByKey(key);
    if (!permDef) return;
    if (read) perms.push(`${key}.read`);
    if (write && permDef.hasWrite) perms.push(`${key}.write`);
  });
  return perms;
}

function findParentPermissions(key: string): string[] {
  const baseKey = key.replace(/\.read$/, "").replace(/\.write$/, "");
  const parents: string[] = [];
  for (const [perm, deps] of Object.entries(PERMISSION_DEPENDENCIES)) {
    if (deps.some((d) => d === key || d.startsWith(baseKey + "."))) {
      parents.push(perm);
    }
  }
  return parents;
}

function removePermissionWithParents(state: PermissionState, key: string): PermissionState {
  const newState: PermissionState = {};
  Object.entries(state).forEach(([k, v]) => {
    newState[k] = { ...v };
  });
  const stack = [key];
  while (stack.length > 0) {
    const current = stack.pop()!;
    newState[current] = { read: false, write: false };
    const parents = findParentPermissions(current);
    for (const parent of parents) {
      if (newState[parent]?.read || newState[parent]?.write) {
        stack.push(parent);
      }
    }
  }
  return newState;
}

function recomputeDependencies(state: PermissionState): PermissionState {
  const newState: PermissionState = {};
  Object.entries(state).forEach(([key, val]) => {
    newState[key] = { ...val };
  });
  Object.entries(state).forEach(([key, { read, write }]) => {
    if (read || write) {
      const deps = getAllDependencies(key);
      for (const dep of deps) {
        const depBase = dep.replace(/\.read$/, "").replace(/\.write$/, "");
        if (newState[depBase] && !newState[depBase].read) {
          newState[depBase].read = true;
        }
      }
    }
  });
  return newState;
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
  const [permState, setPermState] = useState<PermissionState>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (open && !initialized) {
      if (isSuperuser) {
        const allState: PermissionState = {};
        PERMISSIONS.forEach((p) => {
          allState[p.key] = { read: true, write: p.hasWrite };
        });
        setPermState(allState);
      } else {
        const normalized = normalizePermissions(selectedPermissions);
        setPermState(recomputeDependencies(normalized));
      }
      setInitialized(true);
    }
    if (!open) {
      setInitialized(false);
    }
  }, [open, isSuperuser, selectedPermissions, initialized]);

  const syncToParent = useCallback(
    (state: PermissionState) => {
      onSelectedPermissionsChange(serializePermissions(state));
    },
    [onSelectedPermissionsChange],
  );

  const togglePermissionRead = (key: string) => {
    if (isSuperuser) return;
    setPermState((prev) => {
      const wasRead = prev[key]?.read;
      if (wasRead) {
        const newState = removePermissionWithParents(prev, key);
        syncToParent(newState);
        return newState;
      } else {
        const newState = { ...prev };
        newState[key] = { ...newState[key], read: true };
        const withDeps = recomputeDependencies(newState);
        syncToParent(withDeps);
        return withDeps;
      }
    });
  };

  const togglePermissionWrite = (key: string) => {
    if (isSuperuser) return;
    setPermState((prev) => {
      const newWrite = !prev[key]?.write;
      if (!newWrite) {
        const newState = removePermissionWithParents(prev, key);
        syncToParent(newState);
        return newState;
      } else {
        const newState = { ...prev };
        newState[key] = { read: true, write: true };
        const withDeps = recomputeDependencies(newState);
        syncToParent(withDeps);
        return withDeps;
      }
    });
  };

  const toggleCategoryRead = (category: string) => {
    if (isSuperuser) return;
    const categoryPerms = getPermissionsByCategory(category as PermissionDefinition["category"]);
    setPermState((prev) => {
      const allRead = categoryPerms.every((p) => p.hasRead && prev[p.key]?.read);
      if (allRead) {
        let newState = { ...prev };
        categoryPerms.forEach((p) => {
          if (p.hasRead) {
            newState = removePermissionWithParents(newState, p.key);
          }
        });
        syncToParent(newState);
        return newState;
      } else {
        const newState = { ...prev };
        categoryPerms.forEach((p) => {
          if (p.hasRead) {
            newState[p.key] = { read: true, write: newState[p.key]?.write || false };
          }
        });
        const withDeps = recomputeDependencies(newState);
        syncToParent(withDeps);
        return withDeps;
      }
    });
  };

  const toggleCategoryWrite = (category: string) => {
    if (isSuperuser) return;
    const categoryPerms = getPermissionsByCategory(category as PermissionDefinition["category"]);
    setPermState((prev) => {
      const allWrite = categoryPerms.every((p) => p.hasWrite && prev[p.key]?.write);
      if (allWrite) {
        let newState = { ...prev };
        categoryPerms.forEach((p) => {
          if (p.hasWrite) {
            newState = removePermissionWithParents(newState, p.key);
          }
        });
        syncToParent(newState);
        return newState;
      } else {
        const newState = { ...prev };
        categoryPerms.forEach((p) => {
          if (p.hasWrite) {
            newState[p.key] = { read: true, write: true };
          }
        });
        const withDeps = recomputeDependencies(newState);
        syncToParent(withDeps);
        return withDeps;
      }
    });
  };

  const getCategoryReadState = (category: string): boolean | "indeterminate" => {
    const categoryPerms = getPermissionsByCategory(category as PermissionDefinition["category"]);
    const readPerms = categoryPerms.filter((p) => p.hasRead);
    const selectedCount = readPerms.filter((p) => permState[p.key]?.read).length;
    if (selectedCount === 0) return false;
    if (selectedCount === readPerms.length) return true;
    return "indeterminate";
  };

  const getCategoryWriteState = (category: string): boolean | "indeterminate" => {
    const categoryPerms = getPermissionsByCategory(category as PermissionDefinition["category"]);
    const writePerms = categoryPerms.filter((p) => p.hasWrite);
    if (writePerms.length === 0) return false;
    const selectedCount = writePerms.filter((p) => permState[p.key]?.write).length;
    if (selectedCount === 0) return false;
    if (selectedCount === writePerms.length) return true;
    return "indeterminate";
  };

  const currentUserIsTarget = currentUser?.id === user.id;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`${components.modal} max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
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
            Vous modifiez vos propres droits. La permission &quot;Administration → Utilisateurs&quot; ne peut pas être retirée.
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
            const readState = getCategoryReadState(category);
            const writeState = getCategoryWriteState(category);
            const isReadIndeterminate = readState === "indeterminate";
            const isWriteIndeterminate = writeState === "indeterminate";
            const hasWritePerms = categoryPerms.some((p) => p.hasWrite);

            return (
              <div key={category} className="border border-slate-200 dark:border-dark-border rounded-lg p-4">
                <div className="flex items-center gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none flex-1">
                    <input
                      type="checkbox"
                      checked={readState === true}
                      ref={(el) => {
                        if (el) el.indeterminate = isReadIndeterminate;
                      }}
                      onChange={() => toggleCategoryRead(category)}
                      disabled={isSuperuser}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="font-semibold text-gray-800 dark:text-dark-text-primary">
                      {CATEGORY_LABELS[category]}
                    </span>
                    <span className="text-xs text-gray-500">(Lecture)</span>
                  </label>
                  {hasWritePerms && (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={writeState === true}
                        ref={(el) => {
                          if (el) el.indeterminate = isWriteIndeterminate;
                        }}
                        onChange={() => toggleCategoryWrite(category)}
                        disabled={isSuperuser}
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                      />
                      <span className="text-xs text-gray-500">(Écriture)</span>
                    </label>
                  )}
                </div>
                <div className="ml-6">
                  {categoryPerms.map((perm) => {
                    const isReadChecked = permState[perm.key]?.read || false;
                    const isWriteChecked = permState[perm.key]?.write || false;
                    const isUsersPerm = perm.key === "administration.users";
                    const disabled = isSuperuser || (currentUserIsTarget && isUsersPerm);

                    return (
                      <div
                        key={perm.key}
                        className={`flex items-center text-sm py-0.5 ${disabled ? "opacity-50" : ""}`}
                      >
                        <span className="text-gray-700 dark:text-dark-text-secondary flex-1 truncate">
                          {perm.label}
                        </span>
                        <div className="flex items-center gap-3 w-20 justify-end">
                          {perm.hasRead && (
                            <label className={`flex items-center gap-1 ${disabled ? "" : "cursor-pointer"}`}>
                              <input
                                type="checkbox"
                                checked={isReadChecked}
                                onChange={() => togglePermissionRead(perm.key)}
                                disabled={disabled}
                                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                              />
                              <span className="text-xs text-gray-500">L</span>
                            </label>
                          )}
                          {perm.hasWrite && (
                            <label className={`flex items-center gap-1 ${disabled ? "" : "cursor-pointer"}`}>
                              <input
                                type="checkbox"
                                checked={isWriteChecked}
                                onChange={() => togglePermissionWrite(perm.key)}
                                disabled={disabled}
                                className="h-3.5 w-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                              />
                              <span className="text-xs text-gray-500">E</span>
                            </label>
                          )}
                        </div>
                      </div>
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
