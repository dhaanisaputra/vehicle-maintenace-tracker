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
import { formatCurrency, formatOdometer } from "@/lib/format";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalVehicles: number;
  totalServices: number;
  totalCost: number;
  latestOdometer: number | null;
}

export default function DashboardPage() {
  const ready = useRequireAuth();
  const router = useRouter();
  const { user } = useAuth();
  const { notify } = useToast();
  const [vehicles, setVehicles] = useState<VehicleWithLastService[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    totalServices: 0,
    totalCost: 0,
    latestOdometer: null,
  });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const list = await getVehicles();
      let totalServices = 0;
      let totalCost = 0;
      let latestOdometer: number | null = null;

      const withLast = await Promise.all(
        list.map(async (v) => {
          const result = await searchServices({
            vehicleId: v.id,
            size: 100,
            sort: "serviceDate,desc",
          });
          totalServices += result.totalElements;
          result.content.forEach((s) => {
            totalCost += s.totalCost ?? 0;
          });
          if (result.content[0]) {
            const vOdo = result.content[0].odometer;
            if (latestOdometer === null || vOdo > latestOdometer) {
              latestOdometer = vOdo;
            }
          }
          return {
            ...v,
            lastService: result.content[0]
              ? {
                  serviceDate: result.content[0].serviceDate,
                  odometer: result.content[0].odometer,
                }
              : null,
          };
        }),
      );

      setVehicles(withLast);
      setStats({
        totalVehicles: list.length,
        totalServices,
        totalCost,
        latestOdometer,
      });
    } catch {
      notify("Failed to load dashboard", "error");
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
      <AppHeader title="Dashboard" />
      <MobileShell>
        {/* Greeting */}
        <div className="pt-5 pb-3">
          <h2 className="mb-1 text-xl font-semibold text-text">
            Hello, {user?.username ?? "there"} 👋
          </h2>
          <p className="text-sm text-text-muted">
            Track your vehicle service history
          </p>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </>
        ) : vehicles.length === 0 ? (
          <EmptyState
            title="No vehicles yet"
            description="Add your first vehicle to start recording services."
            action={
              <Button onClick={() => router.push("/vehicles")}>
                + Add Vehicle
              </Button>
            }
          />
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3 py-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-xs text-text-subtle">Vehicles</p>
                <p className="tnum mt-0.5 text-2xl font-bold text-text">
                  {stats.totalVehicles}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-xs text-text-subtle">Services</p>
                <p className="tnum mt-0.5 text-2xl font-bold text-text">
                  {stats.totalServices}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-xs text-text-subtle">Total spent</p>
                <p className="tnum mt-0.5 text-lg font-bold text-text">
                  {stats.totalCost > 0 ? formatCurrency(stats.totalCost) : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-xs text-text-subtle">Latest km</p>
                <p className="tnum mt-0.5 text-lg font-bold text-text">
                  {stats.latestOdometer !== null
                    ? formatOdometer(stats.latestOdometer)
                    : "—"}
                </p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 py-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push("/vehicles")}
              >
                + Add Vehicle
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  router.push(
                    vehicles.length === 1
                      ? `/services?vehicleId=${vehicles[0].id}`
                      : "/services",
                  )
                }
              >
                + Record Service
              </Button>
            </div>

            {/* Vehicle list */}
            <div className="py-3">
              <h3 className="mb-2 text-sm font-semibold text-text-muted">
                Your Vehicles
              </h3>
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
            </div>
          </>
        )}
      </MobileShell>
    </>
  );
}
