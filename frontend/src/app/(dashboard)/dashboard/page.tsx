"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MobileShell } from "@/components/layout/MobileShell";
import { Skeleton } from "@/components/ui/Spinner";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { getVehicles, VehicleWithLastService } from "@/features/vehicles/vehicleApi";
import { searchServices } from "@/features/services/serviceApi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const ready = useRequireAuth();
  const router = useRouter();
  const { user } = useAuth();
  const { notify } = useToast();
  const [vehicles, setVehicles] = useState<VehicleWithLastService[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const list = await getVehicles();
      const withLast = await Promise.all(
        list.map(async (v) => {
          const page = await searchServices({
            vehicleId: v.id,
            size: 1,
            sort: "serviceDate,desc",
          });
          return {
            ...v,
            lastService: page.content[0]
              ? {
                  serviceDate: page.content[0].serviceDate,
                  odometer: page.content[0].odometer,
                }
              : null,
          };
        }),
      );
      setVehicles(withLast);
    } catch {
      notify("Gagal memuat kendaraan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready) load();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <AppHeader title="Kendaraan" />
      <MobileShell>
        <div className="py-5">
          <h2 className="mb-1 text-xl font-semibold text-text">
            Halo, {user?.username ?? "kamu"} 👋
          </h2>
          <p className="text-sm text-text-muted">
            Pantau riwayat servis kendaraan kamu
          </p>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            title="Belum ada kendaraan"
            description="Tambah kendaraan pertama kamu untuk mulai mencatat servis."
            action={
              <Button onClick={() => router.push("/vehicles")}>
                + Tambah Kendaraan
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                lastService={v.lastService}
                onSelect={(id) => router.push(`/services?vehicleId=${id}`)}
              />
            ))}
          </div>
        )}
      </MobileShell>

      {vehicles.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/90 px-4 py-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent">
          <div className="mx-auto max-w-content">
            <Button
              fullWidth
              size="lg"
              onClick={() =>
                router.push(
                  vehicles.length === 1
                    ? `/services?vehicleId=${vehicles[0].id}`
                    : "/services",
                )
              }
            >
              + Catat Servis
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
