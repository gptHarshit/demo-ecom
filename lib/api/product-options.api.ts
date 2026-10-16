import { apiClient } from "./client";

import {
  CreateOptionTypeRequest,
  CreateOptionValueRequest,
  OptionTypeResponse,
  OptionValueResponse,
  UpdateOptionTypeRequest,
  UpdateOptionValueRequest,
} from "@/types/product";

export async function listOptionTypes(): Promise<OptionTypeResponse[]> {
  return apiClient<OptionTypeResponse[]>("/api/v1/product-options", {
    method: "GET",
  });
}

export async function createOptionType(
  data: CreateOptionTypeRequest,
): Promise<OptionTypeResponse> {
  return apiClient<OptionTypeResponse>("/api/v1/product-options", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Backend returns 204 No Content on update.
export async function updateOptionType(
  id: string,
  data: UpdateOptionTypeRequest,
): Promise<void> {
  await apiClient<void>(`/api/v1/product-options/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteOptionType(id: string): Promise<void> {
  await apiClient<void>(`/api/v1/product-options/${id}`, {
    method: "DELETE",
  });
}

export async function createOptionValue(
  optionTypeId: string,
  data: CreateOptionValueRequest,
): Promise<OptionValueResponse> {
  return apiClient<OptionValueResponse>(
    `/api/v1/product-options/${optionTypeId}/values`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

// Backend returns 204 No Content on update.
export async function updateOptionValue(
  optionTypeId: string,
  valueId: string,
  data: UpdateOptionValueRequest,
): Promise<void> {
  await apiClient<void>(
    `/api/v1/product-options/${optionTypeId}/values/${valueId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteOptionValue(
  optionTypeId: string,
  valueId: string,
): Promise<void> {
  await apiClient<void>(
    `/api/v1/product-options/${optionTypeId}/values/${valueId}`,
    { method: "DELETE" },
  );
}