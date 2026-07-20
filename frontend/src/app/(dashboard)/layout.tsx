"use client";

import { AppNav } from "@/components/layout/AppNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ready = useRequireAuth();
  if (!ready) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <AppNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
