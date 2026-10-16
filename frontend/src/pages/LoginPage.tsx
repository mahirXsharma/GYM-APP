import { useState } from "react";
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
  const { setAuthData } = useAuth();
  const navigate = useNavigate();

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
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <p className="text-sm text-center text-muted-foreground mt-1 mb-6">
          Enter your email and password to access your account
        </p>

        {serverError && (
          <div role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                onChange: () => {
                  if (errors.password) clearErrors("password");
                },
              })}
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="underline text-foreground font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;