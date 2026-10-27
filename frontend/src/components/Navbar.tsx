import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Dumbbell, LogOut, Menu, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-3 z-50 px-4 sm:px-6 w-full flex justify-center">
      <nav className="w-full max-w-5xl rounded-full bg-[#0E0E13]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-4 sm:px-6 h-14 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link
          to="/"
          id="nav-brand-logo"
          className="flex items-center gap-2.5 group select-none"
        >
          <div className="w-8 h-8 rounded-xl bg-[#C8FF2E] flex items-center justify-center text-[#07070A] shadow-[0_0_16px_rgba(200,255,46,0.4)] group-hover:scale-105 transition-transform duration-200">
            <Dumbbell className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-display font-black text-sm tracking-tight text-white uppercase group-hover:text-[#C8FF2E] transition-colors">
            Gym Booking
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 text-xs">
          {isAuthenticated ? (
            <>
              <Link
                to="/sessions"
                id="nav-link-sessions"
                className={`relative px-3.5 py-1.5 rounded-full font-medium transition-colors ${
                  isActive("/sessions")
                    ? "text-[#07070A] font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {isActive("/sessions") && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-[#C8FF2E] rounded-full -z-10 shadow-[0_0_16px_rgba(200,255,46,0.35)]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                Sessions
              </Link>

              <Link
                to="/my-bookings"
                id="nav-link-my-bookings"
                className={`relative px-3.5 py-1.5 rounded-full font-medium transition-colors ${
                  isActive("/my-bookings")
                    ? "text-[#07070A] font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {isActive("/my-bookings") && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-[#C8FF2E] rounded-full -z-10 shadow-[0_0_16px_rgba(200,255,46,0.35)]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                My Bookings
              </Link>

              {user?.isAdmin && (
                <Link
                  to="/admin"
                  id="nav-link-admin"
                  className={`relative px-3.5 py-1.5 rounded-full font-medium transition-colors ${
                    isActive("/admin")
                      ? "text-[#07070A] font-bold bg-[#FF5A1F]"
                      : "text-[#FF5A1F] border border-[#FF5A1F]/30 hover:bg-[#FF5A1F]/10"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3 h-3" />
                    Admin
                  </span>
                </Link>
              )}

              {/* User Profile Info & Logout */}
              <div className="flex items-center gap-2.5 pl-3 ml-2 border-l border-white/10">
                <div
                  className="w-7 h-7 rounded-full bg-[#15151C] border border-white/10 flex items-center justify-center font-mono font-bold text-[10px] text-white"
                  title={`${user?.name} (${user?.email})`}
                >
                  {getInitials(user?.name)}
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-semibold text-white leading-tight max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  {user?.isAdmin && (
                    <span className="text-[9px] font-mono text-[#FF5A1F] uppercase font-bold">
                      Admin
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  id="nav-logout-btn"
                  onClick={handleLogout}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-[#FF5A1F] hover:bg-white/[0.05] transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" id="nav-login-btn">
                <button
                  type="button"
                  className="px-4 py-1.5 text-xs text-neutral-300 hover:text-white font-medium transition-colors"
                >
                  Sign In
                </button>
              </Link>
              <Link to="/register" id="nav-register-btn">
                <button
                  type="button"
                  className="px-4 py-1.5 text-xs font-bold bg-[#C8FF2E] text-[#07070A] rounded-full hover:bg-[#d6ff5c] shadow-[0_0_16px_rgba(200,255,46,0.35)] transition-all"
                >
                  Register
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          id="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-x-4 top-20 rounded-2xl bg-[#0E0E13]/95 backdrop-blur-2xl border border-white/10 p-5 space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.8)] z-50"
          >
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-9 h-9 rounded-full bg-[#15151C] border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-white">
                    {getInitials(user?.name)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{user?.name}</div>
                    <div className="text-xs text-neutral-400">{user?.email}</div>
                  </div>
                  {user?.isAdmin && (
                    <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/30">
                      ADMIN
                    </span>
                  )}
                </div>

                <Link
                  to="/sessions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-semibold text-neutral-300 hover:text-[#C8FF2E]"
                >
                  Workout Sessions
                </Link>
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-semibold text-neutral-300 hover:text-[#C8FF2E]"
                >
                  My Bookings
                </Link>
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm font-bold text-[#FF5A1F]"
                  >
                    Admin Control Center
                  </Link>
                )}

                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#FF5A1F] bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 hover:bg-[#FF5A1F]/20"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    type="button"
                    className="w-full py-2.5 rounded-full border border-white/10 text-xs font-semibold text-white hover:bg-white/5"
                  >
                    Sign In
                  </button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    type="button"
                    className="w-full py-2.5 rounded-full bg-[#C8FF2E] text-[#07070A] text-xs font-bold hover:bg-[#d4ff4e]"
                  >
                    Register
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
