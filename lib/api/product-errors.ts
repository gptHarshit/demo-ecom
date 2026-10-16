import { ApiError } from "./api-error";

// Maps backend error codes (see products/handler.go handleError) to the form
// field they relate to, since the Go validator doesn't return per-field
// details itself.
export function fieldErrorsFromApiError(
  error: ApiError,
): Record<string, string> {
  switch (error.code) {
    case "SKU_ALREADY_EXISTS":
      return { sku: error.message };
    case "INVALID_PRICE":
      return { price: error.message };
    case "OPTION_TYPE_NAME_EXISTS":
      return { name: error.message };
    case "OPTION_VALUE_EXISTS":
      return { value: error.message };
    case "VARIANT_COMBINATION_ALREADY_EXISTS":
    case "INVALID_VARIANT_OPTIONS":
      return { option_value_ids: error.message };
    default:
      return error.fields ?? {};
  }
}