import { apiClient } from "./client";
import type { MeResponse, User } from "@/types/auth";

export interface WorkspaceBusiness {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
}

export interface WorkspaceRole {
  name: string;
}

export interface WorkspaceWarehouse {
  id: string;
  name: string;
  type: string;
}

export interface WorkspaceChannel {
  id: string;
  name: string;
  type: string;
}

export interface WorkspaceResponse {
  user: User;
  business: WorkspaceBusiness;
  role: WorkspaceRole;
  default_warehouse: WorkspaceWarehouse;
  default_channel: WorkspaceChannel;
}

export async function getMe(): Promise<MeResponse> {
  return apiClient<MeResponse>("/api/v1/me", { method: "GET" });
}

export async function getWorkspace(): Promise<WorkspaceResponse> {
  return apiClient<WorkspaceResponse>("/api/v1/workspace", { method: "GET" });
}