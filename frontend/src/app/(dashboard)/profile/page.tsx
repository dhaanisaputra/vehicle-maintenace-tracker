"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { Card } from "@/components/ui/Card";
import { MobileShell } from "@/components/layout/MobileShell";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const ready = useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();

  if (!ready) return null;

  return (
    <>
      <AppHeader title="Profil" onBack={() => router.push("/dashboard")} />
      <MobileShell>
        <div className="py-5">
          <Card className="divide-y divide-border">
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm text-text-muted">Username</span>
              <span className="text-sm font-medium text-text">
                {user?.username ?? "-"}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm text-text-muted">Email</span>
              <span className="text-sm font-medium text-text">
                {user?.email ?? "-"}
              </span>
            </div>
          </Card>
        </div>
      </MobileShell>
    </>
  );
}
