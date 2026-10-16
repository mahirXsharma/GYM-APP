import { useState } from "react";
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
  const { setAuthData } = useAuth();
  const navigate = useNavigate();

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
      navigate("/");
    } catch (err: any) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-center">Register</h1>
        <p className="text-sm text-center text-muted-foreground mt-1 mb-6">
          Create an account to book your gym sessions
        </p>

        {serverError && (
          <div role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              disabled={isSubmitting}
              className={errors.name ? "border-red-500 focus-visible:ring-red-300" : ""}
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
              <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              disabled={isSubmitting}
              className={errors.email ? "border-red-500 focus-visible:ring-red-300" : ""}
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
              <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              className={errors.password ? "border-red-500 focus-visible:ring-red-300" : ""}
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
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              className={errors.confirmPassword ? "border-red-500 focus-visible:ring-red-300" : ""}
              {...register("confirmPassword", {
                required: "Please confirm your password.",
                validate: (val) => val === passwordValue || "Passwords do not match.",
                onChange: () => {
                  if (errors.confirmPassword) clearErrors("confirmPassword");
                },
              })}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
            {isSubmitting ? "Creating account..." : "Register"}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="underline text-foreground font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
