import { useEffect } from "react";
import { Link } from "react-router-dom";
import { GlowCard } from "@/components/fx/GlowCard";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { Compass, ArrowLeft, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = "404 - Page Not Found · Gym Booking";
  }, []);

  return (
    <div className="flex flex-1 min-h-[70vh] items-center justify-center p-4">
      <GlowCard className="max-w-md w-full p-8 md:p-10 text-center space-y-6 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#C8FF2E]/10 blur-xl animate-pulse" />
          <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] text-[#C8FF2E] border border-[#C8FF2E]/30">
            <Compass className="w-8 h-8 animate-[spin_10s_linear_infinite]" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs text-[#C8FF2E] font-bold tracking-widest uppercase">
            Error 404
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Page Not Found
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-xs mx-auto">
            The page you are looking for doesn't exist, was removed, or had its URL changed.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link to="/sessions" className="w-full sm:w-auto">
              <MagneticButton
                variant="volt"
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Browse Sessions</span>
              </MagneticButton>
            </Link>
          ) : (
            <Link to="/" className="w-full sm:w-auto">
              <MagneticButton
                variant="volt"
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </MagneticButton>
            </Link>
          )}

          <Link to="/" className="w-full sm:w-auto">
            <MagneticButton
              variant="outline"
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-neutral-300 hover:text-white"
            >
              <span>Home</span>
            </MagneticButton>
          </Link>
        </div>
      </GlowCard>
    </div>
  );
}
