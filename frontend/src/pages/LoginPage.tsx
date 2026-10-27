import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { authApi, ApiError } from "@/lib/api";
import { GlowCard } from "@/components/fx/GlowCard";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { Banner } from "@/components/fx/Banner";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface LoginFormInputs {
  email: string;
  password: string;
}

function LoginPage() {
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setAuthData, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Member Login · Gym Booking";
    if (isAuthenticated) {
      navigate("/sessions", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError("");
    try {
      const res = await authApi.login({
        email: data.email.trim(),
        password: data.password,
      });

      setAuthData(res.token, res.user);
      navigate("/sessions");
    } catch (err: any) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Unable to connect to the server. Please try again.");
      }
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Cinematic Panel (Desktop only) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-8 xl:p-12 rounded-[28px] bg-gradient-to-br from-[#0E0E13]/90 via-[#15151C]/70 to-[#0E0E13]/90 border border-white/[0.08] relative overflow-hidden min-h-[560px]">
          {/* Subtle Ambient Glow */}
          <div
            className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#C8FF2E] opacity-[0.08] blur-[90px] pointer-events-none"
            aria-hidden="true"
          />

          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8FF2E]/10 border border-[#C8FF2E]/30 text-[#C8FF2E] text-xs font-bold tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Real-Time Gym System</span>
            </div>

            <h2 className="text-4xl xl:text-5xl font-black font-display tracking-tight text-white leading-tight uppercase">
              Push Beyond <br />
              <span className="text-[#C8FF2E]">Your Limits.</span>
            </h2>

            <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
              Fast-track your workout bookings with live session spots, confidential passcodes, and instant waitlist promotions.
            </p>
          </div>

          {/* Floating Live Feature Chips */}
          <div className="space-y-3 relative z-10 pt-8">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-[#C8FF2E]/20 text-[#C8FF2E] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="text-white font-semibold">20 Spots Default Capacity</p>
                <p className="text-neutral-400">Guaranteed space and high-intensity coaching</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="text-white font-semibold">6-Second Live Polling</p>
                <p className="text-neutral-400">Always see real-time cancellations and seats</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form GlowCard */}
        <div className="w-full lg:col-span-6 flex justify-center">
          <GlowCard className="w-full max-w-md p-6 sm:p-10 border-white/[0.1] shadow-2xl space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold tracking-widest text-[#C8FF2E] uppercase">
                Welcome Back
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-tight">
                Member Login
              </h1>
              <p className="text-xs text-neutral-400">
                Sign in to view workout sessions and manage your reservations
              </p>
            </div>

            {serverError && (
              <Banner
                type="error"
                text={serverError}
                onDismiss={() => setServerError("")}
              />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Email Address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-neutral-300"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="user@example.com"
                    disabled={isSubmitting}
                    className={`w-full h-12 pl-10 pr-4 rounded-xl bg-[#15151C] border text-white text-sm placeholder:text-neutral-500 focus:outline-none transition-all ${
                      errors.email
                        ? "border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
                        : "border-white/10 focus:border-[#C8FF2E] focus:ring-1 focus:ring-[#C8FF2E]"
                    }`}
                    {...register("email", {
                      required: "Email is required.",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address.",
                      },
                      onChange: () => {
                        if (errors.email) clearErrors("email");
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-[#FF5A1F] flex items-center gap-1.5 mt-1 font-medium" role="alert">
                    <span>⚠</span> {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-neutral-300"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                    className={`w-full h-12 pl-10 pr-11 rounded-xl bg-[#15151C] border text-white text-sm placeholder:text-neutral-500 focus:outline-none transition-all ${
                      errors.password
                        ? "border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
                        : "border-white/10 focus:border-[#C8FF2E] focus:ring-1 focus:ring-[#C8FF2E]"
                    }`}
                    {...register("password", {
                      required: "Password is required.",
                      onChange: () => {
                        if (errors.password) clearErrors("password");
                      },
                    })}
                  />
                  <button
                    type="button"
                    id="toggle-login-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-[#FF5A1F] flex items-center gap-1.5 mt-1 font-medium" role="alert">
                    <span>⚠</span> {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <MagneticButton
                  type="submit"
                  disabled={isSubmitting}
                  variant="volt"
                  size="lg"
                  className="w-full flex items-center justify-center font-bold"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                      />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </MagneticButton>
              </div>
            </form>

            <div className="pt-2 text-center border-t border-white/[0.06]">
              <p className="text-xs text-neutral-400">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="text-[#C8FF2E] font-bold hover:underline transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;