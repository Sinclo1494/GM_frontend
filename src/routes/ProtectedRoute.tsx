import { Navigate } from "react-router-dom";
import { usePermissions } from "../auth/PermissionContext";

interface ProtectedRouteProps {
  permission?: string;
  children: React.ReactNode;
}

export default function ProtectedRoute({ permission, children }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const { hasPermission, loading } = usePermissions();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
