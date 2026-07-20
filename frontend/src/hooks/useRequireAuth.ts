"use client";

import { getToken } from "@/lib/token";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Redirects to /login when no token is present. Returns ready=false until checked. */
export function useRequireAuth() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  return ready;
}
