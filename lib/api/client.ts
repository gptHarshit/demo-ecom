import type { ApiErrorResponse } from "@/types/api";
import { ApiError } from "./api-error";
import { getAccessToken, setAccessToken } from "@/lib/auth/session";
import { getRefreshToken, setRefreshToken } from "@/lib/auth/token-storage";
import { mockFetch } from "@/lib/mock/server";

// DEMO BUILD: there is no backend. Every request is answered by the
// in-browser demo API in lib/mock/server.ts, which implements the same
// endpoints and response shapes as the real Commerce Core API and is seeded
// with demo data. `mockFetch` is a drop-in replacement for `fetch`.

interface ApiClientOptions extends RequestInit {
  /** Skip the Authorization header and the 401 refresh flow (login, register, refresh). */
  skipAuth?: boolean;
}

// Shared in-flight refresh so parallel 401s trigger only one refresh call.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    // Raw request (not apiClient) to avoid recursion and a circular import
    // with auth.api.ts.
    const response = await mockFetch(`/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
    };

    setAccessToken(data.access_token);
    if (data.refresh_token) setRefreshToken(data.refresh_token);

    return data.access_token;
  } catch {
    return null;
  }
}

function refreshOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function send(
  endpoint: string,
  options: ApiClientOptions,
  tokenOverride?: string | null,
): Promise<Response> {
  const { skipAuth, headers: initHeaders, ...init } = options;

  const headers = new Headers(initHeaders);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (!skipAuth) {
    const token = tokenOverride ?? getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  } else {
    headers.delete("Authorization");
  }

  try {
    // endpoint is a relative path like "/api/v1/products"; the demo API
    // routes it locally. Auth travels as a Bearer header, as before.
    return await mockFetch(endpoint, { ...init, headers });
  } catch (error) {
    console.error("API request failed:", error);
    throw new ApiError(0, "NETWORK_ERROR", "Unable to connect to the server.");
  }
}

async function parseError(response: Response): Promise<ApiError> {
  let errorData: ApiErrorResponse | null = null;

  try {
    errorData = (await response.json()) as ApiErrorResponse;
  } catch {
    // Response body was not valid JSON.
  }

  if (errorData?.error) {
    return new ApiError(
      response.status,
      errorData.error.code,
      errorData.error.message,
      errorData.error.fields,
    );
  }

  return new ApiError(
    response.status,
    "UNKNOWN_ERROR",
    "Something went wrong. Please try again.",
  );
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> {
  let response = await send(endpoint, options);

  // Expired or missing access token: refresh once, then retry the original request.
  if (response.status === 401 && !options.skipAuth) {
    const newToken = await refreshOnce();

    if (newToken) {
      response = await send(endpoint, options, newToken);
    }
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  // 204 No Content (e.g. archive) or any empty body
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.error("Failed to parse API success response:", error);
    throw new ApiError(
      response.status,
      "INVALID_RESPONSE",
      "The server returned an invalid response.",
    );
  }
}