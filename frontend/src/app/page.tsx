"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  useRequireAuth();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return null;
}
