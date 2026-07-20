import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { AuthResponse } from "@/types/models";

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
    "/api/auth/register",
    payload,
  );
  return data.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
    "/api/auth/login",
    payload,
  );
  return data.data;
}

export interface ProfilePayload {
  username: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function getProfile(): Promise<AuthResponse["user"]> {
  const { data } = await apiClient.get<ApiResponse<AuthResponse["user"]>>(
    "/api/auth/me",
  );
  return data.data;
}

export async function updateProfile(
  payload: ProfilePayload,
): Promise<AuthResponse["user"]> {
  const { data } = await apiClient.put<ApiResponse<AuthResponse["user"]>>(
    "/api/auth/me",
    payload,
  );
  return data.data;
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>("/api/auth/change-password", payload);
}
