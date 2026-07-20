"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
  ServiceSearchParams,
} from "@/features/services/serviceApi";
import { ServiceRecord } from "@/types/models";
import { getVehicles } from "@/features/vehicles/vehicleApi";
import { Vehicle } from "@/types/models";
import { formatCurrency, formatOdometer } from "@/lib/format";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: "Tanggal (terbaru)", value: "serviceDate,desc" },
  { label: "Tanggal (terlama)", value: "serviceDate,asc" },
  { label: "Biaya (termahal)", value: "totalCost,desc" },
  { label: "Biaya (termurah)", value: "totalCost,asc" },
  { label: "Odometer (tertinggi)", value: "odometer,desc" },
];

const PAGE_SIZE = 10;

function ServicesPageInner() {
  const ready = useRequireAuth();
  const router = useRouter();
  const params = useSearchParams();
  const { notify } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("serviceDate,desc");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServiceRecord | null>(null);

  const vehicleId = params.get("vehicleId");

  const loadVehicles = useCallback(async () => {
    const list = await getVehicles();
    setVehicles(list);
    return list;
  }, []);

  const loadRecords = useCallback(
    async (vid: string, keyword: string, sortValue: string, pageNum: number) => {
      const apiParams: ServiceSearchParams = {
        vehicleId: vid,
        search: keyword || undefined,
        sort: sortValue,
        page: pageNum,
        size: PAGE_SIZE,
      };
      const result = await searchServices(apiParams);
      setRecords(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(Math.max(1, result.totalPages));
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
        setPage(0);
        await loadRecords(target, "", sort, 0);
      } catch {
        notify("Gagal memuat data", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, vehicleId, loadVehicles, loadRecords, notify, sort]);

  const runSearch = async (keyword: string) => {
    if (!vehicle?.id) return;
    setPage(0);
    try {
      await loadRecords(vehicle.id, keyword, sort, 0);
    } catch {
      notify("Gagal mencari", "error");
    }
  };

  const changeVehicle = (vid: string) => {
    const next = vehicles.find((v) => v.id === vid) ?? null;
    setVehicle(next);
    setPage(0);
    setSearch("");
    router.replace(vid ? `/services?vehicleId=${vid}` : "/services");
    if (next) loadRecords(vid, "", sort, 0);
  };

  const changeSort = (value: string) => {
    setSort(value);
    // effect di atas akan reload saat `sort` berubah (jika vehicle sudah dipilih)
  };

  const goToPage = (next: number) => {
    if (!vehicle?.id) return;
    setPage(next);
    loadRecords(vehicle.id, search, sort, next);
  };

  const refresh = () => {
    if (vehicle?.id) loadRecords(vehicle.id, search, sort, page);
  };

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteService(deleteTarget.id);
      notify("Servis dihapus");
      setDeleteTarget(null);
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
                  records.reduce((sum, r) => sum + (r.totalCost ?? 0), 0),
                )}
              </p>
            </div>
          </div>
        )}

        <div className="mb-3 space-y-2">
          <select
            value={vehicle?.id ?? ""}
            onChange={(e) => changeVehicle(e.target.value)}
            className="h-11 w-full rounded border border-border bg-surface px-3 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vehicleName}
                {v.licensePlate ? ` (${v.licensePlate})` : ""}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                runSearch(e.target.value);
              }}
              placeholder="Cari parts / catatan"
              className="h-11 flex-1 rounded border border-border bg-surface px-3 text-base text-text placeholder:text-text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <select
              value={sort}
              onChange={(e) => changeSort(e.target.value)}
              className="h-11 rounded border border-border bg-surface px-3 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
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
              <ServiceRecordCard
                key={r.id}
                record={r}
                onSelect={() => setEditing(r)}
                onDelete={(rec) => setDeleteTarget(rec)}
              />
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 0}
                  onClick={() => goToPage(page - 1)}
                >
                  Sebelumnya
                </Button>
                <span className="text-sm text-text-muted">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => goToPage(page + 1)}
                >
                  Berikutnya
                </Button>
              </div>
            )}
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus catatan servis?"
        description="Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
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
