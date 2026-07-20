import { apiClient } from "@/lib/apiClient";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { ServiceRecord } from "@/types/models";

export interface ServiceRecordPayload {
  vehicleId: string;
  serviceDate: string;
  odometer: number;
  partsReplaced?: string;
  totalCost?: number;
  notes?: string;
}

export interface ServiceSearchParams {
  vehicleId?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export async function searchServices(
  params: ServiceSearchParams,
): Promise<PageResponse<ServiceRecord>> {
  const { data } = await apiClient.get<ApiResponse<PageResponse<ServiceRecord>>>(
    "/api/services",
    { params },
  );
  return data.data;
}

function buildFormData(
  payload: ServiceRecordPayload,
  receiptFile?: File,
): FormData {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
  );
  if (receiptFile) {
    formData.append("receiptFile", receiptFile);
  }
  return formData;
}

export async function createService(
  payload: ServiceRecordPayload,
  receiptFile?: File,
): Promise<ServiceRecord> {
  const { data } = await apiClient.post<ApiResponse<ServiceRecord>>(
    "/api/services",
    buildFormData(payload, receiptFile),
  );
  return data.data;
}

export async function updateService(
  id: string,
  payload: ServiceRecordPayload,
  receiptFile?: File,
): Promise<ServiceRecord> {
  const { data } = await apiClient.put<ApiResponse<ServiceRecord>>(
    `/api/services/${id}`,
    buildFormData(payload, receiptFile),
  );
  return data.data;
}

export async function deleteService(id: string): Promise<void> {
  await apiClient.delete(`/api/services/${id}`);
}
