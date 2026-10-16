"use client";

import { useState } from "react";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { LoginRequest } from "@/types/auth";
import { login } from "@/lib/api/auth.api";
import { ApiError } from "@/lib/api/api-error";
import { setAccessToken } from "@/lib/auth/session";
import { setRefreshToken } from "@/lib/auth/token-storage";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [fieldsMessage, setFieldsMessage] = useState<
    Record<string, string> | undefined
  >();

  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMessage("");
    setFieldsMessage(undefined);

    const payload: LoginRequest = {
      email: email.trim().toLowerCase(),
      password,
    };

    try {
      setIsSubmitting(true);

      const response = await login(payload);

      // Direct pattern: the Go backend returns the tokens in the response
      // body (no BFF, no cookies), so the browser holds them itself —
      // access token in memory, refresh token in localStorage.
      setAccessToken(response.access_token);
      setRefreshToken(response.refresh_token);

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        setFieldsMessage(error.fields);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = email.trim().length > 0 && password.length > 0;

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground transition-colors duration-200 sm:px-6">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-text shadow-sm transition-all hover:bg-border/40 hover:text-foreground"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-lg transition-colors duration-200 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mb-5 flex items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg font-bold text-white shadow-sm">
                M
              </div>

              <span className="text-xl font-bold tracking-tight text-foreground">
                MyLeadKart
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-text">
              Login to continue managing your business.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-text focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

              {fieldsMessage?.email && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldsMessage.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground outline-none transition-all placeholder:text-muted-text focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {fieldsMessage?.password && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldsMessage.password}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={!isFormValid || isSubmitting}
              className={`w-full rounded-lg py-3 text-sm font-semibold transition-all ${
                isFormValid && !isSubmitting
                  ? "bg-accent text-white shadow-sm hover:opacity-90 hover:shadow-md active:scale-[0.99]"
                  : "cursor-not-allowed bg-border text-muted-text"
              }`}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </div>

          <div className="mt-7 border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-text">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-semibold text-accent transition-colors hover:opacity-80"
              >
                Get Started
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;