import type { ReactNode } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { GlowCard } from "@/components/fx/GlowCard";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { ShieldAlert, RotateCw, ArrowLeft } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-1 min-h-[50vh] items-center justify-center p-4">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0E0E13]/80 border border-white/10 backdrop-blur-xl">
          <RotateCw className="w-4 h-4 animate-spin text-[#C8FF2E]" />
          <p className="text-xs font-medium text-neutral-300">Authenticating access token...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user?.isAdmin) {
    return (
      <div className="flex flex-1 min-h-[60vh] items-center justify-center p-4">
        <GlowCard className="max-w-md w-full p-8 text-center space-y-5 border-[#FF5A1F]/30 shadow-[0_0_32px_rgba(255,90,31,0.12)]">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/30 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-[10px] text-[#FF5A1F] font-bold tracking-widest uppercase">
              HTTP 403 · FORBIDDEN
            </span>
            <h1 className="text-2xl font-black font-display text-white uppercase tracking-tight">
              Access Denied
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              This portal is restricted to authorized gym administrators only. Your account (<span className="text-white font-mono">{user?.email}</span>) does not have staff permissions.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <Link to="/sessions">
              <MagneticButton variant="volt" size="md">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sessions</span>
              </MagneticButton>
            </Link>
          </div>
        </GlowCard>
      </div>
    );
  }

  return <>{children}</>;
};
