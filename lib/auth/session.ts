// Access token lives in a module-level variable, in memory only.
// It resets on a full page reload by design — client.ts's refresh-on-401
// flow uses the refresh token (see token-storage.ts) to get a new one
// automatically the first time a request needs it after a reload.

let accessToken: string | null = null;

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken(): void {
  accessToken = null;
}