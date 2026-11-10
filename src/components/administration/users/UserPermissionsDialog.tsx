import { useEffect, useState, useCallback } from "react";
import { components } from "../../../theme/components";
import { useAuth } from "../../../context/useAuth";
import { PERMISSIONS, getPermissionsByParentMenu, getTopLevelMenuPermissions, getAllDependencies, getPermissionByKey } from "../../../auth/permissions";

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

type PermissionState = Record<string, { read: boolean; write: boolean; menu: boolean }>;

function normalizePermissions(perms: string[]): PermissionState {
  const state: PermissionState = {};
  PERMISSIONS.forEach((p) => {
    state[p.key] = { read: false, write: false, menu: false };
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
    } else if (p.endsWith(".menu")) {
      const base = p.slice(0, -5);
      if (state[base]) state[base].menu = true;
    } else {
      if (state[p]) {
        state[p].read = true;
        state[p].write = true;
      }
    }
  });
  return state;
}

function computeParentMenuState(state: PermissionState): PermissionState {
  const newState = { ...state };
  // For each top-level menu, compute M from submenus
  const topMenus = PERMISSIONS.filter((p) => p.category === "menu" && !p.parentMenu);
  topMenus.forEach((menuPerm) => {
    const subPerms = PERMISSIONS.filter((p) => p.parentMenu === menuPerm.key);
    const anySubmenuHasMenu = subPerms.some((p) => newState[p.key]?.menu);
    newState[menuPerm.key] = { ...newState[menuPerm.key], menu: anySubmenuHasMenu };
  });
  return newState;
}

function serializePermissions(state: PermissionState): string[] {
  const perms: string[] = [];
  Object.entries(state).forEach(([key, { read, write, menu }]) => {
    const permDef = getPermissionByKey(key);
    if (!permDef) return;
    if (menu && permDef.hasMenu) perms.push(`${key}.menu`);
    if (read) perms.push(`${key}.read`);
    if (write && permDef.hasWrite) perms.push(`${key}.write`);
  });
  return perms;
}

function findParentMenu(key: string): string | null {
  const permDef = getPermissionByKey(key);
  return permDef?.parentMenu || null;
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
          allState[p.key] = { read: true, write: p.hasWrite, menu: p.hasMenu };
        });
        setPermState(allState);
      } else {
        const normalized = normalizePermissions(selectedPermissions);
        const withDeps = recomputeDependencies(normalized);
        setPermState(computeParentMenuState(withDeps));
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
        // Uncheck L
        // Rule: Uncheck L while M=1 → Auto-uncheck M and E
        // Rule: Uncheck L while E=1 → Auto-uncheck E and M
        const newState = { ...prev };
        newState[key] = { read: false, write: false, menu: false };
        
        // Update parent menu M: if no submenus have M, uncheck parent M
        const parentMenu = findParentMenu(key);
        if (parentMenu) {
          const anySubmenuHasMenu = PERMISSIONS
            .filter((p) => p.parentMenu === parentMenu)
            .some((p) => newState[p.key]?.menu);
          newState[parentMenu] = { ...newState[parentMenu], menu: anySubmenuHasMenu };
        }
        
        syncToParent(newState);
        return newState;
      } else {
        // Check L
        // Rule: Check L → Check L only (no auto-check M)
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
        // Uncheck E
        // Rule: Uncheck E → Keep M and L checked
        const newState = { ...prev };
        newState[key] = { ...newState[key], write: false };
        syncToParent(newState);
        return newState;
      } else {
        // Check E
        // Rule: Check E → Auto-check M and L
        const newState = { ...prev };
        newState[key] = { read: true, write: true, menu: true };
        
        // Update parent menu M: at least one submenu has M, so check parent M
        const parentMenu = findParentMenu(key);
        if (parentMenu) {
          newState[parentMenu] = { ...newState[parentMenu], menu: true };
        }
        
        const withDeps = recomputeDependencies(newState);
        syncToParent(withDeps);
        return withDeps;
      }
    });
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
          <div className="mb-4 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 px-3 py-2 text-sm text-gray-700">
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
          {getTopLevelMenuPermissions().map((menuPerm) => {
            const subPerms = getPermissionsByParentMenu(menuPerm.key);
            const isStandaloneMenu = subPerms.length === 0 && menuPerm.hasMenu;

            // Skip menus without submenus that don't have their own M permission
            if (!isStandaloneMenu && subPerms.length === 0) return null;

            if (isStandaloneMenu) {
              // Standalone menu (like Dashboard) - render with its own M/L/E
              const isMenuChecked = permState[menuPerm.key]?.menu || false;
              const isReadChecked = permState[menuPerm.key]?.read || false;
              const isWriteChecked = permState[menuPerm.key]?.write || false;
              const disabled = isSuperuser;

              const toggleMenuM = () => {
                if (isSuperuser) return;
                setPermState((prev) => {
                  const newState = { ...prev };
                  const newMenu = !prev[menuPerm.key]?.menu;
                  newState[menuPerm.key] = { ...newState[menuPerm.key], menu: newMenu };
                  if (!newMenu) {
                    newState[menuPerm.key] = { ...newState[menuPerm.key], read: false, write: false };
                  } else {
                    newState[menuPerm.key] = { ...newState[menuPerm.key], read: true };
                  }
                  syncToParent(newState);
                  return newState;
                });
              };

              const toggleMenuL = () => {
                if (isSuperuser) return;
                setPermState((prev) => {
                  const newState = { ...prev };
                  const wasRead = prev[menuPerm.key]?.read;
                  if (wasRead) {
                    newState[menuPerm.key] = { read: false, write: false, menu: false };
                  } else {
                    newState[menuPerm.key] = { ...newState[menuPerm.key], read: true };
                    // Check M when L is checked
                    newState[menuPerm.key] = { ...newState[menuPerm.key], menu: true };
                  }
                  syncToParent(newState);
                  return newState;
                });
              };

              const toggleMenuE = () => {
                if (isSuperuser) return;
                setPermState((prev) => {
                  const newState = { ...prev };
                  const wasWrite = prev[menuPerm.key]?.write;
                  if (!wasWrite) {
                    newState[menuPerm.key] = { ...newState[menuPerm.key], write: false };
                  } else {
                    newState[menuPerm.key] = { read: true, write: true, menu: true };
                  }
                  syncToParent(newState);
                  return newState;
                });
              };

              return (
                <div key={menuPerm.key} className="border border-slate-200 dark:border-dark-border rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="font-semibold text-gray-800 dark:text-dark-text-primary min-w-[140px]">
                      {menuPerm.label}
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isMenuChecked}
                        onChange={toggleMenuM}
                        disabled={disabled}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-xs text-gray-500">(Menu)</span>
                    </label>
                    {menuPerm.hasRead && (
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isReadChecked}
                          onChange={toggleMenuL}
                          disabled={disabled}
                          className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 disabled:opacity-50"
                        />
                        <span className="text-xs text-gray-500">(Lecture)</span>
                      </label>
                    )}
                    {menuPerm.hasWrite && (
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isWriteChecked}
                          onChange={toggleMenuE}
                          disabled={disabled}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                        />
                        <span className="text-xs text-gray-500">(Écriture)</span>
                      </label>
                    )}
                  </div>
                </div>
              );
            }

            const readState = subPerms
              .filter((p) => p.hasRead)
              .reduce((acc, p) => {
                if (permState[p.key]?.read) acc.selected++;
                acc.total++;
                return acc;
              }, { selected: 0, total: 0 });
            const writeState = subPerms
              .filter((p) => p.hasWrite)
              .reduce((acc, p) => {
                if (permState[p.key]?.write) acc.selected++;
                acc.total++;
                return acc;
              }, { selected: 0, total: 0 });

            const isReadAll = readState.total > 0 && readState.selected === readState.total;
            const isReadSome = readState.selected > 0 && readState.selected < readState.total;
            const isWriteAll = writeState.total > 0 && writeState.selected === writeState.total;
            const isWriteSome = writeState.selected > 0 && writeState.selected < writeState.total;

            const menuState = subPerms
              .filter((p) => p.hasMenu)
              .reduce((acc, p) => {
                if (permState[p.key]?.menu) acc.selected++;
                acc.total++;
                return acc;
              }, { selected: 0, total: 0 });
            const isMenuAll = menuState.total > 0 && menuState.selected === menuState.total;
            const isMenuSome = menuState.selected > 0 && menuState.selected < menuState.total;

            const toggleMenuM = () => {
              if (isSuperuser) return;
              setPermState((prev) => {
                let newState = { ...prev };
                if (isMenuAll) {
                  // Uncheck M for all submenus
                  // Rule: Uncheck M → Keep L checked
                  subPerms.forEach((p) => {
                    if (p.hasMenu) {
                      newState[p.key] = { ...newState[p.key], menu: false };
                    }
                  });
                  // Also uncheck parent menu M
                  newState[menuPerm.key] = { ...newState[menuPerm.key], menu: false };
                  // Rule: Uncheck M while E=1 → Auto-uncheck E, keep L
                  subPerms.forEach((p) => {
                    if (p.hasWrite && newState[p.key]?.write) {
                      newState[p.key] = { ...newState[p.key], write: false };
                    }
                  });
                } else {
                  // Check M for all submenus
                  // Rule: Check M → Auto-check L
                  subPerms.forEach((p) => {
                    if (p.hasMenu) {
                      newState[p.key] = { ...newState[p.key], menu: true };
                    }
                  });
                  // Also check parent menu M
                  newState[menuPerm.key] = { ...newState[menuPerm.key], menu: true };
                  // Rule: Check M → Auto-check L
                  subPerms.forEach((p) => {
                    if (p.hasRead && newState[p.key]?.menu) {
                      newState[p.key] = { ...newState[p.key], read: true };
                    }
                  });
                }
                syncToParent(newState);
                return newState;
              });
            };

            const toggleMenuRead = () => {
              if (isSuperuser) return;
              setPermState((prev) => {
                let newState = { ...prev };
                if (isReadAll) {
                  // Uncheck L for all submenus
                  // Rule: Uncheck L while M=1 → Auto-uncheck M and E
                  // Rule: Uncheck L while E=1 → Auto-uncheck E and M
                  subPerms.forEach((p) => {
                    if (p.hasRead) {
                      newState[p.key] = { read: false, write: false, menu: false };
                    }
                  });
                } else {
                  // Check L for all submenus
                  // Rule: Check L → Check L only (no auto-check M)
                  subPerms.forEach((p) => {
                    if (p.hasRead) {
                      newState[p.key] = { ...newState[p.key], read: true };
                    }
                  });
                  newState = recomputeDependencies(newState);
                }
                syncToParent(newState);
                return newState;
              });
            };

            const toggleMenuWrite = () => {
              if (isSuperuser) return;
              setPermState((prev) => {
                let newState = { ...prev };
                if (isWriteAll) {
                  // Uncheck E for all submenus
                  // Rule: Uncheck E → Keep M and L checked
                  subPerms.forEach((p) => {
                    if (p.hasWrite) {
                      newState[p.key] = { ...newState[p.key], write: false };
                    }
                  });
                } else {
                  // Check E for all submenus
                  // Rule: Check E → Auto-check M and L
                  subPerms.forEach((p) => {
                    if (p.hasWrite) {
                      newState[p.key] = { ...newState[p.key], read: true, write: true, menu: true };
                    }
                  });
                  newState = recomputeDependencies(newState);
                }
                syncToParent(newState);
                return newState;
              });
            };

            const toggleMenuMenu = (key: string) => {
              if (isSuperuser) return;
              setPermState((prev) => {
                const newState = { ...prev };
                const newMenu = !prev[key]?.menu;
                const wasE = prev[key]?.write;
                
                if (newMenu) {
                  // Check M
                  // Rule: Check M → Auto-check L
                  newState[key] = { ...newState[key], menu: true, read: true };
                  // E is NOT auto-checked (Check M doesn't imply E)
                } else {
                  // Uncheck M
                  // Rule: Uncheck M → Keep L checked
                  // Rule: Uncheck M while E=1 → Auto-uncheck E, keep L
                  newState[key] = { ...newState[key], menu: false };
                  if (wasE) {
                    newState[key] = { ...newState[key], write: false };
                  }
                  // L stays checked
                }
                
                // Update parent menu M: if no submenus have M, uncheck parent M
                const anySubmenuHasMenu = subPerms.some((p) => newState[p.key]?.menu);
                newState[menuPerm.key] = { ...newState[menuPerm.key], menu: anySubmenuHasMenu };
                
                syncToParent(newState);
                return newState;
              });
            };

            return (
              <div key={menuPerm.key} className="border border-slate-200 dark:border-dark-border rounded-lg p-4">
                <div className="flex items-center gap-4 mb-3">
                  <span className="font-semibold text-gray-800 dark:text-dark-text-primary min-w-[140px]">
                    {menuPerm.label}
                  </span>
                  {menuState.total > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isMenuAll}
                        ref={(el) => {
                          if (el) el.indeterminate = isMenuSome;
                        }}
                        onChange={toggleMenuM}
                        disabled={isSuperuser}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-xs text-gray-500">(Menu)</span>
                    </label>
                  )}
                  {readState.total > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isReadAll}
                        ref={(el) => {
                          if (el) el.indeterminate = isReadSome;
                        }}
                        onChange={toggleMenuRead}
                        disabled={isSuperuser}
                        className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 disabled:opacity-50"
                      />
                      <span className="text-xs text-gray-500">(Lecture)</span>
                    </label>
                  )}
                  {writeState.total > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isWriteAll}
                        ref={(el) => {
                          if (el) el.indeterminate = isWriteSome;
                        }}
                        onChange={toggleMenuWrite}
                        disabled={isSuperuser}
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                      />
                      <span className="text-xs text-gray-500">(Écriture)</span>
                    </label>
                  )}
                </div>
                <div className="ml-6 space-y-1">
                  {subPerms.map((perm) => {
                    const isReadChecked = permState[perm.key]?.read || false;
                    const isWriteChecked = permState[perm.key]?.write || false;
                    const isMenuChecked = permState[perm.key]?.menu || false;
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
                        <div className="flex items-center gap-3 flex-1 justify-end">
                          {perm.hasMenu && (
                            <label className={`flex items-center gap-1 ${disabled ? "" : "cursor-pointer"}`}>
                              <input
                                type="checkbox"
                                checked={isMenuChecked}
                                onChange={() => toggleMenuMenu(perm.key)}
                                disabled={disabled}
                                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                              />
                              <span className="text-xs text-gray-500">M</span>
                            </label>
                          )}
                          {perm.hasRead && (
                            <label className={`flex items-center gap-1 ${disabled ? "" : "cursor-pointer"}`}>
                              <input
                                type="checkbox"
                                checked={isReadChecked}
                                onChange={() => togglePermissionRead(perm.key)}
                                disabled={disabled}
                                className="h-3.5 w-3.5 rounded border-gray-300 text-gray-600 focus:ring-gray-500 disabled:opacity-50"
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
