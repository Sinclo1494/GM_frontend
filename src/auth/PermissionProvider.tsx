import { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { PermissionContext } from "./PermissionContext";
import type { UserInfo } from "../types/user";
import { getCurrentUser } from "../api/userService";

interface PermissionProviderProps {
  children: React.ReactNode;
}

export default function PermissionProvider({ children }: PermissionProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const authToken = useContext(AuthContext)?.token ?? null;

  const loadUser = useCallback(async () => {
    if (!authToken) {
      setUser(null);
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      const data = await getCurrentUser();
      setUser(data);
      setPermissions(data.permissions || []);
    } catch {
      setUser(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      if (user.is_superuser) return true;
      return permissions.includes(permission);
    },
    [user, permissions],
  );

  const hasAnyPermission = useCallback(
    (perms: string[]) => {
      if (!user) return false;
      if (user.is_superuser) return true;
      return perms.some((p) => permissions.includes(p));
    },
    [user, permissions],
  );

  const hasAllPermissions = useCallback(
    (perms: string[]) => {
      if (!user) return false;
      if (user.is_superuser) return true;
      return perms.every((p) => permissions.includes(p));
    },
    [user, permissions],
  );

  return (
    <PermissionContext.Provider
      value={{
        user,
        permissions,
        loading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}
