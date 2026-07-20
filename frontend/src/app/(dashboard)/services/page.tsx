"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { MobileShell } from "@/components/layout/MobileShell";
import { Skeleton } from "@/components/ui/Spinner";
import { ServiceRecordCard } from "@/components/services/ServiceRecordCard";
import { ServiceRecordDetail } from "@/components/services/ServiceRecordDetail";
import { ServiceRecordForm } from "@/components/services/ServiceRecordForm";
import { Modal } from "@/components/ui/Modal";
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
  { label: "Date (newest)", value: "serviceDate,desc" },
  { label: "Date (oldest)", value: "serviceDate,asc" },
  { label: "Cost (highest)", value: "totalCost,desc" },
  { label: "Cost (lowest)", value: "totalCost,asc" },
  { label: "Odometer (highest)", value: "odometer,desc" },
];

const PAGE_SIZE = 10;

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function lastMonthIso(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return toIsoDate(d);
}

function ServicesPageInner() {
  const ready = useRequireAuth();
  const router = useRouter();
  const params = useSearchParams();
  const { notify } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState(lastMonthIso());
  const [to, setTo] = useState(toIsoDate(new Date()));
  const [sort, setSort] = useState("serviceDate,desc");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [detail, setDetail] = useState<ServiceRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServiceRecord | null>(null);

  const vehicleIdParam = params.get("vehicleId");

  const loadVehicles = useCallback(async () => {
    const list = await getVehicles();
    setVehicles(list);
    return list;
  }, []);

  const loadRecords = useCallback(
    async (
      vid: string,
      keyword: string,
      fromValue: string,
      toValue: string,
      sortValue: string,
      pageNum: number,
    ) => {
      const apiParams: ServiceSearchParams = {
        search: keyword || undefined,
        from: fromValue || undefined,
        to: toValue || undefined,
        sort: sortValue,
        page: pageNum,
        size: PAGE_SIZE,
      };
      if (vid) apiParams.vehicleId = vid;
      const result = await searchServices(apiParams);
      setRecords(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(Math.max(1, result.totalPages));
    },
    [],
  );

  // Initial load: vehicles + default filters (last 1 month)
  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const list = await loadVehicles();
        const target = vehicleIdParam ?? "";
        setSelectedVehicleId(target);
        setPage(0);
        await loadRecords(target, "", from, to, sort, 0);
      } catch {
        notify("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, vehicleIdParam, loadVehicles, loadRecords, notify, sort, from, to]);

  const applyFilters = (vid: string, keyword: string) => {
    setPage(0);
    loadRecords(vid, keyword, from, to, sort, 0);
  };

  const onChangeVehicle = (vid: string) => {
    setSelectedVehicleId(vid);
    router.replace(vid ? `/services?vehicleId=${vid}` : "/services");
    applyFilters(vid, search);
  };

  const onSearch = (keyword: string) => {
    setSearch(keyword);
    applyFilters(selectedVehicleId, keyword);
  };

  const onChangeSort = (value: string) => {
    setSort(value);
  };

  const applyDateRange = () => {
    applyFilters(selectedVehicleId, search);
  };

  const resetFilters = () => {
    setSearch("");
    setFrom(lastMonthIso());
    setTo(toIsoDate(new Date()));
    applyFilters(selectedVehicleId, "");
  };

  const goToPage = (next: number) => {
    setPage(next);
    loadRecords(selectedVehicleId, search, from, to, sort, next);
  };

  const refresh = () => {
    loadRecords(selectedVehicleId, search, from, to, sort, page);
  };

  const refreshAndResetPage = () => {
    setPage(0);
    loadRecords(selectedVehicleId, search, from, to, sort, 0);
  };

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (id: string) => {
    const target = records.find((r) => r.id === id) ?? null;
    setEditing(target);
    setSheetOpen(true);
  };

  const openDetail = (id: string) => {
    const target = records.find((r) => r.id === id) ?? null;
    setDetail(target);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteService(deleteTarget.id);
      notify("Service record deleted");
      setDeleteTarget(null);
      refreshAndResetPage();
    } catch {
      notify("Failed to delete", "error");
    }
  };

  if (!ready) return null;

  if (vehicles.length === 0) {
    return (
      <>
        <AppHeader title="Service History" onBack={() => router.push("/dashboard")} />
        <MobileShell>
          <EmptyState
            title="No vehicles yet"
            description="Add a vehicle first to start recording services."
            action={
              <Button onClick={() => router.push("/vehicles")}>
                + Add Vehicle
              </Button>
            }
          />
        </MobileShell>
      </>
    );
  }

  const hasActiveFilters = !!search || !!from || !!to;

  return (
    <>
      <AppHeader
        title="Service History"
        onBack={() => router.push("/dashboard")}
        right={
          <Button size="sm" onClick={openAdd}>
            + Service
          </Button>
        }
      />

      <MobileShell>
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-xs text-text-subtle">Last service odometer</p>
            <p className="tnum mt-0.5 text-lg font-semibold text-text">
              {records[0] ? formatOdometer(records[0].odometer) : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-xs text-text-subtle">Total cost</p>
            <p className="tnum mt-0.5 text-lg font-semibold text-text">
              {formatCurrency(
                records.reduce((sum, r) => sum + (r.totalCost ?? 0), 0),
              )}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-xs text-text-subtle">Records</p>
            <p className="tnum mt-0.5 text-lg font-semibold text-text">
              {totalElements}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-xs text-text-subtle">Showing</p>
            <p className="tnum mt-0.5 text-lg font-semibold text-text">
              {records.length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 rounded-xl border border-border bg-surface p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                Vehicle
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => onChangeVehicle(e.target.value)}
                className="h-11 w-full rounded border border-border bg-background px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">All vehicles</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicleName}
                    {v.licensePlate ? ` (${v.licensePlate})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                Search
              </label>
              <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Parts, notes, etc."
                className="h-11 w-full rounded border border-border bg-background px-3 text-sm text-text placeholder:text-text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                From date
              </label>
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
                className="h-11 w-full rounded border border-border bg-background px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                To date
              </label>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
                className="h-11 w-full rounded border border-border bg-background px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="sm:w-56">
              <label className="mb-1 block text-xs font-medium text-text-muted">
                Sort by
              </label>
              <select
                value={sort}
                onChange={(e) => onChangeSort(e.target.value)}
                className="h-11 w-full rounded border border-border bg-background px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={applyDateRange}>
                Apply Filters
              </Button>
              <Button variant="ghost" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Records */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            title={
              hasActiveFilters
                ? "No services match your filters"
                : "No service history yet"
            }
            description={
              hasActiveFilters
                ? undefined
                : "Record the first service for your vehicle."
            }
            action={
              hasActiveFilters ? (
                <Button variant="secondary" onClick={resetFilters}>
                  Reset Filters
                </Button>
              ) : (
                <Button onClick={openAdd}>+ Add Service</Button>
              )
            }
          />
        ) : (
          <div className="space-y-3 pb-24 sm:pb-4">
            {records.map((r) => (
              <ServiceRecordCard
                key={r.id}
                record={r}
                onSelect={(id) => openDetail(id)}
                onEdit={(id) => openEdit(id)}
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
                  Previous
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
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </MobileShell>

      {/* Floating add button (mobile-first) */}
      <button
        onClick={openAdd}
        aria-label="Add service"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-primary-fg shadow-lg transition-transform active:scale-95 sm:hidden"
      >
        +
      </button>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editing ? "Edit Service" : "Add Service"}
      >
        {vehicles.length > 0 && (
          <ServiceRecordForm
            vehicles={vehicles}
            initial={editing ?? undefined}
            initialVehicleId={selectedVehicleId || undefined}
            submitting={submitting}
            onSubmit={() => {
              setSubmitting(true);
              setSheetOpen(false);
              setEditing(null);
              refreshAndResetPage();
              setSubmitting(false);
            }}
          />
        )}
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this service record?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Service Detail"
      >
        {detail && (
          <ServiceRecordDetail
            record={detail}
            vehicle={vehicles.find((v) => v.id === detail.vehicleId)}
            onEdit={() => {
              setEditing(detail);
              setSheetOpen(true);
              setDetail(null);
            }}
          />
        )}
      </Modal>
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
