import { apiClient } from "./client";

import {
  CreateProductRequest,
  CreateVariantRequest,
  InventoryAdjustmentRequest,
  ProductInventory,
  ProductListResponse,
  ProductResponse,
  UpdateProductRequest,
  UpdateVariantRequest,
  VariantResponse,
} from "@/types/product";

export async function createProduct(
  data: CreateProductRequest,
): Promise<ProductResponse> {
  return apiClient<ProductResponse>("/api/v1/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProducts(
  params: { limit?: number; offset?: number } = {},
): Promise<ProductListResponse> {
  const qs = new URLSearchParams();
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  if (params.offset !== undefined) qs.set("offset", String(params.offset));
  const query = qs.toString();

  return apiClient<ProductListResponse>(
    `/api/v1/products${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
}

export async function getProduct(id: string): Promise<ProductResponse> {
  return apiClient<ProductResponse>(`/api/v1/products/${id}`, {
    method: "GET",
  });
}

export async function updateProduct(
  id: string,
  data: UpdateProductRequest,
): Promise<ProductResponse> {
  return apiClient<ProductResponse>(`/api/v1/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function archiveProduct(id: string): Promise<void> {
  await apiClient<void>(`/api/v1/products/${id}/archive`, {
    method: "POST",
  });
}

export async function getProductInventory(
  id: string,
): Promise<ProductInventory> {
  return apiClient<ProductInventory>(`/api/v1/products/${id}/inventory`, {
    method: "GET",
  });
}

export async function adjustInventory(
  id: string,
  data: InventoryAdjustmentRequest,
): Promise<ProductInventory> {
  return apiClient<ProductInventory>(
    `/api/v1/products/${id}/inventory/adjustments`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

export async function listVariants(
  productId: string,
): Promise<VariantResponse[]> {
  return apiClient<VariantResponse[]>(
    `/api/v1/products/${productId}/variants`,
    { method: "GET" },
  );
}

export async function createVariant(
  productId: string,
  data: CreateVariantRequest,
): Promise<VariantResponse> {
  return apiClient<VariantResponse>(
    `/api/v1/products/${productId}/variants`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function getVariant(
  productId: string,
  variantId: string,
): Promise<VariantResponse> {
  return apiClient<VariantResponse>(
    `/api/v1/products/${productId}/variants/${variantId}`,
    { method: "GET" },
  );
}

export async function updateVariant(
  productId: string,
  variantId: string,
  data: UpdateVariantRequest,
): Promise<VariantResponse> {
  return apiClient<VariantResponse>(
    `/api/v1/products/${productId}/variants/${variantId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}