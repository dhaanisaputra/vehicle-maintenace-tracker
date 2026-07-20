"use client";

import { clearToken, getToken, setToken } from "@/lib/token";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { login as apiLogin, register as apiRegister } from "@/features/auth/authApi";

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiLogin({ email, password });
        setToken(res.token);
        router.replace("/dashboard");
      } catch (e) {
        setError(extractMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRegister({ username, email, password });
        setToken(res.token);
        router.replace("/dashboard");
      } catch (e) {
        setError(extractMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    clearToken();
    router.replace("/login");
  }, [router]);

  return { login, register, logout, loading, error, isAuthenticated: !!getToken() };
}

function extractMessage(e: unknown): string {
  if (e && typeof e === "object" && "response" in e) {
    const resp = (e as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? "Something went wrong";
  }
  return "Network error";
}
