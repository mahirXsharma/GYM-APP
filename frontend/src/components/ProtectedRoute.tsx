import type { ReactNode } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <p className="text-sm text-neutral-400">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user?.isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-lg p-6 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-950 text-red-400 border border-red-800 font-bold text-lg">
            403
          </div>
          <h1 className="text-xl font-bold text-white">Access Denied</h1>
          <p className="text-sm text-neutral-400">
            This section is restricted to administrators only. Your account (<span className="text-neutral-200">{user?.email}</span>) does not have admin permissions.
          </p>
          <div className="pt-2">
            <Link to="/sessions">
              <Button className="bg-white text-black hover:bg-neutral-200">
                Back to Sessions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
