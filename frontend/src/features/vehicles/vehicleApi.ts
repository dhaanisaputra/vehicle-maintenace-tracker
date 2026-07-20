import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { Vehicle } from "@/types/models";

export interface VehiclePayload {
  vehicleName: string;
  licensePlate?: string;
}

export async function getVehicles(): Promise<Vehicle[]> {
  const { data } = await apiClient.get<ApiResponse<Vehicle[]>>("/api/vehicles");
  return data.data;
}

export async function createVehicle(payload: VehiclePayload): Promise<Vehicle> {
  const { data } = await apiClient.post<ApiResponse<Vehicle>>(
    "/api/vehicles",
    payload,
  );
  return data.data;
}

export async function updateVehicle(
  id: string,
  payload: VehiclePayload,
): Promise<Vehicle> {
  const { data } = await apiClient.put<ApiResponse<Vehicle>>(
    `/api/vehicles/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteVehicle(id: string): Promise<void> {
  await apiClient.delete(`/api/vehicles/${id}`);
}
