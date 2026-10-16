import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { authApi, ApiError } from "@/lib/api";

interface LoginFormInputs {
  email: string;
  password: string;
}

function LoginPage() {
  const [serverError, setServerError] = useState("");
  const { setAuthData, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-neutral-950 text-neutral-100">
      <div className="w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white">Member Login</h1>
          <p className="text-xs text-neutral-400">
            Sign in to view workout sessions and manage bookings
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="rounded-md bg-red-950/60 p-3 text-xs text-red-200 border border-red-800"
          >
            <p className="font-semibold">Error:</p>
            <p>{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-neutral-300 mb-1"
            >
              Email Address
            </label>
            <Input
              id="login-email"
              type="email"
              placeholder="user@example.com"
              disabled={isSubmitting}
              className={`bg-neutral-950 border-neutral-700 text-white text-sm ${errors.email ? "border-red-500" : ""
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
            {errors.email && (
              <p className="text-xs text-red-400 mt-1" role="alert">
                ⚠ {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-neutral-300 mb-1"
            >
              Password
            </label>
            <Input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              disabled={isSubmitting}
              className={`bg-neutral-950 border-neutral-700 text-white text-sm ${errors.password ? "border-red-500" : ""
                }`}
              {...register("password", {
                required: "Password is required.",
                onChange: () => {
                  if (errors.password) clearErrors("password");
                },
              })}
            />
            {errors.password && (
              <p className="text-xs text-red-400 mt-1" role="alert">
                ⚠ {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black hover:bg-neutral-200 font-semibold text-sm h-10 mt-2"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-xs text-center text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-white underline hover:text-neutral-200 font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;