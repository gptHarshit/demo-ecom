// Shape of every error response from the Go backend, e.g.:
// { "error": { "code": "SKU_ALREADY_EXISTS", "message": "...", "fields": {...} } }
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}