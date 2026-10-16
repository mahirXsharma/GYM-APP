import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { authApi, ApiError } from "@/lib/api";

interface RegisterFormInputs {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function Register() {
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
    watch,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: RegisterFormInputs) => {
    setServerError("");
    try {
      const res = await authApi.signup({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
      });

      setAuthData(res.token, res.user);
      navigate("/sessions");
    } catch (err: any) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Failed to create account. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-neutral-950 text-neutral-100">
      <div className="w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-xs text-neutral-400">
            Register to start booking workout sessions
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
              htmlFor="reg-name"
              className="block text-xs font-semibold text-neutral-300 mb-1"
            >
              Full Name
            </label>
            <Input
              id="reg-name"
              type="text"
              placeholder="John Doe"
              disabled={isSubmitting}
              className={`bg-neutral-950 border-neutral-700 text-white text-sm ${errors.name ? "border-red-500" : ""
                }`}
              {...register("name", {
                required: "Full name is required.",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters.",
                },
                onChange: () => {
                  if (errors.name) clearErrors("name");
                },
              })}
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1" role="alert">
                ⚠ {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-email"
              className="block text-xs font-semibold text-neutral-300 mb-1"
            >
              Email Address
            </label>
            <Input
              id="reg-email"
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
              htmlFor="reg-password"
              className="block text-xs font-semibold text-neutral-300 mb-1"
            >
              Password
            </label>
            <Input
              id="reg-password"
              type="password"
              placeholder="At least 6 characters"
              disabled={isSubmitting}
              className={`bg-neutral-950 border-neutral-700 text-white text-sm ${errors.password ? "border-red-500" : ""
                }`}
              {...register("password", {
                required: "Password is required.",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters.",
                },
                onChange: () => {
                  if (errors.password) clearErrors("password");
                  if (errors.confirmPassword) clearErrors("confirmPassword");
                },
              })}
            />
            {errors.password && (
              <p className="text-xs text-red-400 mt-1" role="alert">
                ⚠ {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-confirm-password"
              className="block text-xs font-semibold text-neutral-300 mb-1"
            >
              Confirm Password
            </label>
            <Input
              id="reg-confirm-password"
              type="password"
              placeholder="Confirm your password"
              disabled={isSubmitting}
              className={`bg-neutral-950 border-neutral-700 text-white text-sm ${errors.confirmPassword ? "border-red-500" : ""
                }`}
              {...register("confirmPassword", {
                required: "Please confirm your password.",
                validate: (val) => val === passwordValue || "Passwords do not match.",
                onChange: () => {
                  if (errors.confirmPassword) clearErrors("confirmPassword");
                },
              })}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1" role="alert">
                ⚠ {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black hover:bg-neutral-200 font-semibold text-sm h-10 mt-2"
          >
            {isSubmitting ? "Creating account..." : "Register"}
          </Button>
        </form>

        <p className="text-xs text-center text-neutral-400">
          Already have an account?{" "}
          <Link to="/login" className="text-white underline hover:text-neutral-200 font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
