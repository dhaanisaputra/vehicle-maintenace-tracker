import axios from "axios";
import { API_BASE_URL } from "@/config/constants";
import { getToken } from "@/lib/token";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
