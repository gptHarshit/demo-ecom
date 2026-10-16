import { apiClient } from "./client";

import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/auth";

export interface LogoutResponse {
  message: string;
}

// skipAuth: true on register/login/refresh — these must never carry a stale
// bearer token, and a 401 here (e.g. wrong password) must not trigger the
// refresh-and-retry flow in apiClient.

export async function register(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  return apiClient<RegisterResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuth: true,
  });
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuth: true,
  });
}

// Exposed for completeness / manual use. client.ts does its own internal
// refresh call (see refreshAccessToken there) rather than importing this,
// to avoid a circular import between client.ts and auth.api.ts.
export async function refresh(data: RefreshRequest): Promise<RefreshResponse> {
  return apiClient<RefreshResponse>("/api/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuth: true,
  });
}

// The backend now requires refresh_token in the body (LogoutRequest,
// validate:"required") to revoke that specific session — without it this
// call 422s. Callers must pass the refresh token BEFORE clearing it from
// storage. skipAuth is left false: the access token still identifies who's
// calling, the refresh token identifies which session to revoke.
export async function logout(refreshToken: string): Promise<LogoutResponse> {
  return apiClient<LogoutResponse>("/api/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}