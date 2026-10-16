"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useOnboarding } from "@/context/OnboardingContext";
import { register } from "@/lib/api/auth.api";
import { ApiError } from "@/lib/api/api-error";
import { setAccessToken } from "@/lib/auth/session";
import { setRefreshToken } from "@/lib/auth/token-storage";
import type { RegisterRequest } from "@/types/auth";

export default function SignupStep() {
  const { formData } = useOnboarding();

  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string> | undefined
  >();

  const handleSignup = async () => {
    setErrorMessage("");
    setFieldErrors(undefined);

    const ownerName = `${firstName.trim()} ${lastName.trim()}`.trim();

    const payload: RegisterRequest = {
      business_name: formData.businessName.trim(),
      owner_name: ownerName,
      email: email.trim().toLowerCase(),
      password,
    };

    try {
      setIsSubmitting(true);

      const response = await register(payload);

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
        setFieldErrors(error.fields);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    formData.businessName.trim().length > 0;

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Create your account</h1>

        <p className="mt-2 text-gray-500">
          Complete your profile to start managing your inventory.
        </p>
      </div>

      <div className="space-y-5">
        {/* First Name */}
        <div>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-gray-100"
          />

          {fieldErrors?.owner_name && (
            <p className="mt-1 text-sm text-red-600">
              {fieldErrors.owner_name}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-gray-100"
          />

          {fieldErrors?.owner_name && (
            <p className="mt-1 text-sm text-red-600">
              {fieldErrors.owner_name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-gray-100"
          />

          {fieldErrors?.email && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-gray-100"
          />

          {fieldErrors?.password && (
            <p className="mt-1 text-sm text-red-600">
              {fieldErrors.password}
            </p>
          )}
        </div>
      </div>

      {/* General API Error */}
      {errorMessage && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSignup}
        disabled={!isFormValid || isSubmitting}
        className={`
          mt-8
          w-full
          rounded-lg
          py-3
          font-semibold
          transition-all
          ${
            isFormValid && !isSubmitting
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }
        `}
      >
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </button>
    </div>
  );
}