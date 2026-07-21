"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DropdownMenu, DropdownItem } from "@/components/ui/DropdownMenu";
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
import { formatCurrency, formatDate, formatOdometer } from "@/lib/format";
import { API_BASE_URL } from "@/config/constants";
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
  const [appliedVehicleId, setAppliedVehicleId] = useState<string>("");
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [from, setFrom] = useState(lastMonthIso());
  const [appliedFrom, setAppliedFrom] = useState(lastMonthIso());
  const [to, setTo] = useState(toIsoDate(new Date()));
  const [appliedTo, setAppliedTo] = useState(toIsoDate(new Date()));
  const [sort, setSort] = useState("serviceDate,desc");
  const [appliedSort, setAppliedSort] = useState("serviceDate,desc");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [detail, setDetail] = useState<ServiceRecord | null>(null);
  const [viewReceipt, setViewReceipt] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServiceRecord | null>(null);

  const vehicleIdParam = params.get("vehicleId");

  const vehicleMap = Object.fromEntries(vehicles.map((v) => [v.id, v]));

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

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const list = await loadVehicles();
        const target = vehicleIdParam ?? "";
        setSelectedVehicleId(target);
        setAppliedVehicleId(target);
        setPage(0);
        await loadRecords(target, "", from, to, sort, 0);
        setAppliedFrom(from);
        setAppliedTo(to);
        setAppliedSort(sort);
      } catch {
        notify("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, vehicleIdParam, loadVehicles, loadRecords, notify, from, to, sort]);

  const applyAllFilters = () => {
    setPage(0);
    setAppliedVehicleId(selectedVehicleId);
    setAppliedSearch(search);
    setAppliedFrom(from);
    setAppliedTo(to);
    setAppliedSort(sort);
    loadRecords(selectedVehicleId, search, from, to, sort, 0);
    router.replace(selectedVehicleId ? `/services?vehicleId=${selectedVehicleId}` : "/services");
  };

  const onChangeVehicle = (vid: string) => {
    setSelectedVehicleId(vid);
  };

  const onSearch = (keyword: string) => {
    setSearch(keyword);
  };

  const onChangeSort = (value: string) => {
    setSort(value);
  };

  const onChangeFrom = (value: string) => {
    setFrom(value);
  };

  const onChangeTo = (value: string) => {
    setTo(value);
  };

  const resetFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setFrom(lastMonthIso());
    setAppliedFrom(lastMonthIso());
    setTo(toIsoDate(new Date()));
    setAppliedTo(toIsoDate(new Date()));
    setSelectedVehicleId("");
    setAppliedVehicleId("");
    setPage(0);
    router.replace("/services");
    loadRecords("", "", lastMonthIso(), toIsoDate(new Date()), "serviceDate,desc", 0);
    setAppliedSort("serviceDate,desc");
    setSort("serviceDate,desc");
  };

  const goToPage = (next: number) => {
    setPage(next);
    loadRecords(appliedVehicleId, appliedSearch, appliedFrom, appliedTo, appliedSort, next);
  };

  const refresh = () => {
    loadRecords(appliedVehicleId, appliedSearch, appliedFrom, appliedTo, appliedSort, page);
  };

  const refreshAndResetPage = () => {
    setPage(0);
    loadRecords(appliedVehicleId, appliedSearch, appliedFrom, appliedTo, appliedSort, 0);
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

  const hasActiveFilters = !!appliedSearch || !!appliedFrom || !!appliedTo || !!appliedVehicleId;

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
        {/* Filters */}
        <div className="mb-4 rounded-xl border border-border bg-surface p-3 sm:p-4 md:mx-[-2rem] md:px-8 lg:mx-[-4rem] lg:px-12">
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
                onChange={(e) => onChangeFrom(e.target.value)}
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
                onChange={(e) => onChangeTo(e.target.value)}
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
              <Button variant="secondary" onClick={applyAllFilters}>
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
          <>
            {/* Desktop table view */}
            <div className="hidden overflow-visible rounded-xl border border-border bg-surface md:block md:mx-[-2rem] md:px-8 lg:mx-[-4rem] lg:px-12">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted text-xs text-text-muted">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Vehicle</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">Odometer</th>
                    <th className="hidden px-4 py-3 font-medium lg:table-cell">Parts</th>
                    <th className="px-4 py-3 font-medium">Cost</th>
                    <th className="hidden px-4 py-3 font-medium xl:table-cell">Notes</th>
                    <th className="w-12 px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr
                      key={r.id}
                      className="cursor-pointer border-b border-border/50 transition-colors last:border-0 hover:bg-surface-muted/50"
                      onClick={() => openDetail(r.id)}
                    >
                      <td className="tnum whitespace-nowrap px-4 py-3 text-text">
                        {formatDate(r.serviceDate)}
                      </td>
                      <td className="px-4 py-3 font-medium text-text">
                        {vehicleMap[r.vehicleId]?.vehicleName ?? "—"}
                      </td>
                      <td className="tnum hidden whitespace-nowrap px-4 py-3 text-text sm:table-cell">
                        {formatOdometer(r.odometer)}
                      </td>
                      <td className="hidden max-w-[200px] truncate px-4 py-3 text-text-muted lg:table-cell">
                        {r.partsReplaced || "—"}
                      </td>
                      <td className="tnum whitespace-nowrap px-4 py-3 font-medium text-text">
                        {r.totalCost != null ? formatCurrency(r.totalCost) : "—"}
                      </td>
                      <td className="hidden max-w-[150px] truncate px-4 py-3 text-text-muted xl:table-cell">
                        {r.notes || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu
                          trigger={
                            <button
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                                <circle cx="8" cy="3" r="1.5" />
                                <circle cx="8" cy="8" r="1.5" />
                                <circle cx="8" cy="13" r="1.5" />
                              </svg>
                            </button>
                          }
                        >
                          <DropdownItem onClick={() => openDetail(r.id)}>
                            View Detail
                          </DropdownItem>
                          {r.receiptImageUrl && (
                            <DropdownItem onClick={() => setViewReceipt(r.receiptImageUrl)}>
                              View Nota
                            </DropdownItem>
                          )}
                          <DropdownItem onClick={() => openEdit(r.id)}>
                            Edit
                          </DropdownItem>
                          <DropdownItem onClick={() => setDeleteTarget(r)} danger>
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="space-y-3 md:hidden">
              {records.map((r) => (
                <ServiceRecordCard
                  key={r.id}
                  record={r}
                  vehicleName={vehicleMap[r.vehicleId]?.vehicleName}
                  onSelect={(id) => openDetail(id)}
                  onEdit={(id) => openEdit(id)}
                  onDelete={(rec) => setDeleteTarget(rec)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row md:mx-[-2rem] md:px-8 lg:mx-[-4rem] lg:px-12">
              <p className="text-sm text-text-muted">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalElements)} of {totalElements}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
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
          </>
        )}
      </MobileShell>

      {/* Floating add button (mobile-first) */}
      <button
        onClick={openAdd}
        aria-label="Add service"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-primary-fg shadow-lg transition-transform active:scale-95 md:hidden"
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

      <Modal
        open={!!viewReceipt}
        onClose={() => setViewReceipt(null)}
        title="Receipt"
        size="lg"
      >
        {viewReceipt && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${API_BASE_URL}${viewReceipt}`}
            alt="Receipt"
            className="max-h-[70vh] w-full rounded-lg border border-border object-contain"
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
