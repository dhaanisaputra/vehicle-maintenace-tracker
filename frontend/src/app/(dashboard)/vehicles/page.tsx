"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MobileShell } from "@/components/layout/MobileShell";
import { Skeleton } from "@/components/ui/Spinner";
import { VehicleForm } from "@/components/vehicles/VehicleForm";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useToast } from "@/components/ui/Toast";
import {
  createVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle,
} from "@/features/vehicles/vehicleApi";
import { Vehicle } from "@/types/models";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VehiclesPage() {
  const ready = useRequireAuth();
  const router = useRouter();
  const { notify } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setVehicles(await getVehicles());
    } catch {
      notify("Gagal memuat kendaraan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready) load();
  }, [ready]);

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };
  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setSheetOpen(true);
  };

  const handleSubmit = async (payload: {
    vehicleName: string;
    licensePlate?: string;
  }) => {
    setSubmitting(true);
    try {
      if (editing) {
        await updateVehicle(editing.id, payload);
        notify("Kendaraan diperbarui");
      } else {
        await createVehicle(payload);
        notify("Kendaraan ditambahkan");
      }
      setSheetOpen(false);
      load();
    } catch {
      notify("Gagal menyimpan kendaraan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (v: Vehicle) => {
    if (!confirm(`Hapus ${v.vehicleName}? Riwayat servis ikut terhapus.`)) return;
    try {
      await deleteVehicle(v.id);
      notify("Kendaraan dihapus");
      load();
    } catch {
      notify("Gagal menghapus", "error");
    }
  };

  if (!ready) return null;

  return (
    <>
      <AppHeader
        title="Kendaraan"
        onBack={() => router.push("/dashboard")}
        right={
          <Button size="sm" onClick={openAdd}>
            + Baru
          </Button>
        }
      />
      <MobileShell>
        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            title="Belum ada kendaraan"
            description="Tambah kendaraan untuk mulai mencatat riwayat servis."
            action={<Button onClick={openAdd}>+ Tambah Kendaraan</Button>}
          />
        ) : (
          <div className="space-y-3">
            {vehicles.map((v) => (
              <Card
                key={v.id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <button
                  className="min-w-0 flex-1 text-left"
                  onClick={() => router.push(`/services?vehicleId=${v.id}`)}
                >
                  <p className="truncate font-medium text-text">
                    {v.vehicleName}
                  </p>
                  <p className="text-sm text-text-muted">
                    {v.licensePlate || "—"}
                  </p>
                </button>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => openEdit(v)}
                    className="px-2 py-1 text-sm text-text-muted hover:text-text"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(v)}
                    className="px-2 py-1 text-sm text-danger hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </MobileShell>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editing ? "Edit Kendaraan" : "Tambah Kendaraan"}
      >
        <VehicleForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      </BottomSheet>
    </>
  );
}
