import { Navigate } from "react-router-dom";
import { usePermissions } from "../auth/PermissionContext";

interface RequirePermissionProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export default function RequirePermission({ permission, fallback, children }: RequirePermissionProps) {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return fallback ?? null;
  }

  if (!hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
