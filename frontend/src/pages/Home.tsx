import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { GlowCard } from "@/components/fx/GlowCard";
import { LivePulse } from "@/components/fx/LivePulse";
import { Marquee } from "@/components/fx/Marquee";
import { AnimatedNumber } from "@/components/fx/AnimatedNumber";
import { Calendar, KeyRound, QrCode, ArrowRight, Flame } from "lucide-react";
import { motion } from "motion/react";

function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4 sm:px-6 pt-12 pb-20 text-center overflow-hidden">
        {/* Giant Watermark Capacity Number "20" */}
        <div
          className="absolute select-none pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18rem] sm:text-[28rem] font-black font-display text-white/[0.015] leading-none"
          aria-hidden="true"
        >
          20
        </div>

        {/* Live Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center justify-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <LivePulse label="LIVE AVAILABILITY" />
            <span className="text-neutral-400 text-xs hidden sm:inline">
              Real-time slot reservation system
            </span>
          </div>
        </motion.div>

        {/* Kinetic Hero Headline */}
        <div className="max-w-4xl mx-auto space-y-0 sm:space-y-1 mb-8 flex flex-col items-center select-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-display uppercase tracking-tight text-white leading-none"
          >
            TRAIN
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-display uppercase tracking-tight text-[#C8FF2E] drop-shadow-[0_0_40px_rgba(200,255,46,0.35)] leading-none"
          >
            HARDER.
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-display uppercase tracking-tight text-white leading-none"
          >
            BOOK
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-display uppercase tracking-tight leading-none"
          >
            <span className="text-stroke-white hover:text-stroke-volt hover:text-[#C8FF2E] transition-colors cursor-default">
              SMARTER.
            </span>
          </motion.div>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-xl mx-auto text-sm sm:text-base text-neutral-400 leading-relaxed mb-10"
        >
          Book high-octane workout sessions with atomic seat guarantees, automatic waitlist promotion, and confidential front-desk passcodes.
        </motion.p>

        {/* Call to Actions (Preserving Auth Logic) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {isAuthenticated ? (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-neutral-300 font-medium">
                Welcome back, <strong className="text-white font-bold">{user?.name}</strong>
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/sessions" id="home-view-sessions-btn">
                  <MagneticButton variant="volt" size="lg">
                    <span>View Sessions</span>
                    <ArrowRight className="w-4 h-4" />
                  </MagneticButton>
                </Link>

                <Link to="/my-bookings" id="home-my-bookings-btn">
                  <MagneticButton variant="ghost" size="lg">
                    My Bookings
                  </MagneticButton>
                </Link>

                {user?.isAdmin && (
                  <Link to="/admin" id="home-admin-panel-btn">
                    <MagneticButton variant="ember" size="lg">
                      Admin Panel
                    </MagneticButton>
                  </Link>
                )}

                <button
                  type="button"
                  id="home-logout-btn"
                  onClick={logout}
                  className="px-5 py-3 rounded-full text-xs text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/login" id="home-login-btn">
                <MagneticButton variant="volt" size="lg">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </MagneticButton>
              </Link>

              <Link to="/register" id="home-register-btn">
                <MagneticButton variant="ghost" size="lg">
                  Create Account
                </MagneticButton>
              </Link>
            </div>
          )}
        </motion.div>
      </section>

      {/* Marquee Ribbon */}
      <section className="w-full my-6">
        <Marquee />
      </section>

      {/* Bento Grid: How It Works */}
      <section className="w-full max-w-5xl px-4 sm:px-6 py-20 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#C8FF2E]">
            <Flame className="w-3.5 h-3.5" />
            Seamless Workout Reservation
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-display uppercase tracking-tight text-white">
            HOW IT WORKS
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
            Zero hassle. Guaranteed slots. Built for athletes and gym members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 01 */}
          <GlowCard tilt className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#C8FF2E]">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="font-display font-black text-3xl text-white/10">01</span>
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                Live Seat Discovery
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Browse upcoming workout hours. Real-time background sync checks available spots every 6 seconds so you never miss a slot.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#C8FF2E] flex items-center gap-1.5">
              <span>20 spots capacity</span>
              <span className="opacity-40">• Instant locking</span>
            </div>
          </GlowCard>

          {/* Step 02 */}
          <GlowCard tilt className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#C8FF2E]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <span className="font-display font-black text-3xl text-white/10">02</span>
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                Passcode Issued
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Upon confirmation, you receive a private 8-character check-in passcode. Full session? Join the automated waitlist queue instantly.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#C8FF2E] flex items-center gap-1.5">
              <span>Encrypted code</span>
              <span className="opacity-40">• Auto-promotion</span>
            </div>
          </GlowCard>

          {/* Step 03 */}
          <GlowCard tilt className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#C8FF2E]">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="font-display font-black text-3xl text-white/10">03</span>
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                Express Check-In
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Provide your passcode to the desk coach during the session&apos;s hour window. Your attendance is instantly verified and recorded.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#C8FF2E] flex items-center gap-1.5">
              <span>Single-use</span>
              <span className="opacity-40">• 1-hour window</span>
            </div>
          </GlowCard>
        </div>
      </section>

      {/* Live Stats Strip */}
      <section className="w-full max-w-5xl px-4 sm:px-6 pb-20">
        <div className="rounded-2xl bg-[#0E0E13]/60 border border-white/[0.08] p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center backdrop-blur-xl">
          <div className="space-y-1">
            <div className="font-display font-black text-3xl sm:text-4xl text-white flex items-center justify-center gap-1">
              <AnimatedNumber value={20} />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Default Spots
            </p>
          </div>

          <div className="space-y-1">
            <div className="font-display font-black text-3xl sm:text-4xl text-[#C8FF2E] flex items-center justify-center gap-1">
              <AnimatedNumber value={60} />
              <span className="text-lg">M</span>
            </div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Session Length
            </p>
          </div>

          <div className="space-y-1">
            <div className="font-display font-black text-3xl sm:text-4xl text-white flex items-center justify-center gap-1">
              <AnimatedNumber value={6} />
              <span className="text-lg">S</span>
            </div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Live Refresh
            </p>
          </div>

          <div className="space-y-1">
            <div className="font-display font-black text-3xl sm:text-4xl text-[#3DD8FF] flex items-center justify-center gap-1">
              <span>0</span>
            </div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Double-Bookings
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.06] py-8 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C8FF2E]" />
            <span className="text-white font-bold font-display uppercase">Gym Booking</span>
          </div>
          <p>© 2026 Gym Booking App. High-Performance Session Booking.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
