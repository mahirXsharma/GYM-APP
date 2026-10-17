import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-neutral-800 bg-neutral-900 text-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <span className="bg-white text-black text-xs font-black px-2 py-1 rounded">GYM</span>
          <span>Gym Booking</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          {isAuthenticated ? (
            <>
              <Link
                to="/sessions"
                className={`transition-colors ${
                  isActive("/sessions")
                    ? "text-white font-semibold underline underline-offset-4"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Sessions
              </Link>

              <Link
                to="/my-bookings"
                className={`transition-colors ${isActive("/my-bookings")
                    ? "text-white font-semibold underline underline-offset-4"
                    : "text-neutral-400 hover:text-white"
                  }`}
              >
                My Bookings
              </Link>

              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${isActive("/admin")
                      ? "bg-amber-500 text-black font-bold"
                      : "bg-neutral-800 text-amber-400 hover:bg-neutral-700"
                    }`}
                >
                  Admin Page
                </Link>
              )}

              <div className="flex items-center gap-3 pl-4 border-l border-neutral-800">
                <span className="text-xs text-neutral-400">
                  Hi, <strong className="text-white">{user?.name}</strong>
                  {user?.isAdmin && <span className="ml-1 text-[10px] text-amber-400">(Admin)</span>}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-xs border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white"
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-neutral-300 hover:!bg-white hover:!text-black transition-colors">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-white text-black hover:bg-neutral-200 font-semibold">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-neutral-400 hover:text-white"
          aria-label="Toggle navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-900 px-4 py-3 space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/sessions"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-sm text-neutral-300 hover:text-white"
              >
                Sessions
              </Link>
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-sm text-neutral-300 hover:text-white"
              >
                My Bookings
              </Link>
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300"
                >
                  Admin Page
                </Link>
              )}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  Signed in as <strong className="text-white">{user?.name}</strong>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-xs text-red-400 border-neutral-700 bg-neutral-800"
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full bg-white text-black hover:bg-neutral-200 border-neutral-700 font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full bg-white text-black font-semibold">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
