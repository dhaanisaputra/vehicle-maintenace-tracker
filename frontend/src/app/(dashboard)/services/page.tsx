"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MobileShell } from "@/components/layout/MobileShell";
import { Skeleton } from "@/components/ui/Spinner";
import { ServiceRecordCard } from "@/components/services/ServiceRecordCard";
import { ServiceRecordForm } from "@/components/services/ServiceRecordForm";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useToast } from "@/components/ui/Toast";
import {
  deleteService,
  searchServices,
} from "@/features/services/serviceApi";
import { ServiceRecord } from "@/types/models";
import { getVehicles } from "@/features/vehicles/vehicleApi";
import { Vehicle } from "@/types/models";
import { formatCurrency, formatOdometer } from "@/lib/format";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function ServicesPageInner() {
  const ready = useRequireAuth();
  const router = useRouter();
  const params = useSearchParams();
  const { notify } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const vehicleId = params.get("vehicleId");

  const loadVehicles = useCallback(async () => {
    const list = await getVehicles();
    setVehicles(list);
    return list;
  }, []);

  const loadRecords = useCallback(
    async (vid: string, keyword: string) => {
      const page = await searchServices({
        vehicleId: vid,
        search: keyword || undefined,
        size: 50,
        sort: "serviceDate,desc",
      });
      setRecords(page.content);
    },
    [],
  );

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const list = await loadVehicles();
        const target = vehicleId ?? list[0]?.id;
        if (!target) {
          setLoading(false);
          return;
        }
        setVehicle(list.find((v) => v.id === target) ?? null);
        await loadRecords(target, "");
      } catch {
        notify("Gagal memuat data", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, vehicleId, loadVehicles, loadRecords, notify]);

  const runSearch = async (keyword: string) => {
    if (!vehicle?.id) return;
    try {
      await loadRecords(vehicle.id, keyword);
    } catch {
      notify("Gagal mencari", "error");
    }
  };

  const refresh = () => {
    if (vehicle?.id) loadRecords(vehicle.id, search);
  };

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const handleDelete = async (r: ServiceRecord) => {
    if (!confirm("Hapus catatan servis ini?")) return;
    try {
      await deleteService(r.id);
      notify("Servis dihapus");
      refresh();
    } catch {
      notify("Gagal menghapus", "error");
    }
  };

  if (!ready) return null;

  if (vehicles.length === 0) {
    return (
      <>
        <AppHeader title="Riwayat Servis" onBack={() => router.push("/dashboard")} />
        <MobileShell>
          <EmptyState
            title="Belum ada kendaraan"
            description="Tambah kendaraan dulu untuk mencatat servis."
            action={
              <Button onClick={() => router.push("/vehicles")}>
                + Tambah Kendaraan
              </Button>
            }
          />
        </MobileShell>
      </>
    );
  }

  return (
    <>
      <AppHeader
        title={vehicle?.vehicleName ?? "Riwayat Servis"}
        subtitle={vehicle?.licensePlate ?? undefined}
        onBack={() => router.push("/dashboard")}
        right={
          <Button size="sm" onClick={openAdd}>
            + Servis
          </Button>
        }
      />

      <MobileShell>
        {vehicle && (
          <div className="grid grid-cols-2 gap-3 py-4">
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="text-xs text-text-subtle">Odometer terakhir</p>
              <p className="tnum mt-0.5 text-lg font-semibold text-text">
                {records[0] ? formatOdometer(records[0].odometer) : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="text-xs text-text-subtle">Total biaya</p>
              <p className="tnum mt-0.5 text-lg font-semibold text-text">
                {formatCurrency(
                  records.reduce(
                    (sum, r) => sum + (r.totalCost ?? 0),
                    0,
                  ),
                )}
              </p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              runSearch(e.target.value);
            }}
            placeholder="Cari parts, misal: fanbelt"
            className="h-11 w-full rounded border border-border bg-surface px-3 text-base text-text placeholder:text-text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            title={search ? `Tidak ada servis cocok "${search}"` : "Belum ada riwayat servis"}
            description={
              search ? undefined : `Catat servis pertama untuk ${vehicle?.vehicleName}.`
            }
            action={
              search ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    runSearch("");
                  }}
                >
                  Reset
                </Button>
              ) : (
                <Button onClick={openAdd}>+ Catat Servis</Button>
              )
            }
          />
        ) : (
          <div className="space-y-3 pb-4">
            {records.map((r) => (
              <div key={r.id} className="relative">
                <ServiceRecordCard record={r} onSelect={() => setEditing(r)} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(r);
                  }}
                  className="absolute right-3 top-3 text-xs text-danger hover:underline"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </MobileShell>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editing ? "Edit Servis" : "Catat Servis"}
      >
        {vehicles.length > 0 && (
          <ServiceRecordForm
            vehicles={vehicles}
            initial={editing ?? undefined}
            initialVehicleId={vehicle?.id}
            submitting={submitting}
            onSubmit={() => {
              setSubmitting(true);
              setSheetOpen(false);
              setEditing(null);
              refresh();
              setSubmitting(false);
            }}
          />
        )}
      </BottomSheet>
    </>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={null}>
      <ServicesPageInner />
    </Suspense>
  );
}
