import { apiClient } from "./client";

import type {
  CreateOrderRequest,
  OrderListResponse,
  OrderResponse,
  UpdateFulfillmentRequest,
} from "@/types/order";

export async function getOrders(): Promise<OrderListResponse> {
  return apiClient<OrderListResponse>("/api/v1/orders", { method: "GET" });
}

export async function getOrder(id: string): Promise<OrderResponse> {
  return apiClient<OrderResponse>(`/api/v1/orders/${id}`, { method: "GET" });
}

export async function createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
  return apiClient<OrderResponse>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFulfillment(
  id: string,
  data: UpdateFulfillmentRequest,
): Promise<OrderResponse> {
  return apiClient<OrderResponse>(`/api/v1/orders/${id}/fulfillment`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function cancelOrder(id: string, reason: string): Promise<OrderResponse> {
  return apiClient<OrderResponse>(`/api/v1/orders/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function markOrderPaid(id: string): Promise<OrderResponse> {
  return apiClient<OrderResponse>(`/api/v1/orders/${id}/mark-paid`, { method: "POST" });
}

export async function addOrderNote(id: string, note: string): Promise<OrderResponse> {
  return apiClient<OrderResponse>(`/api/v1/orders/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}
