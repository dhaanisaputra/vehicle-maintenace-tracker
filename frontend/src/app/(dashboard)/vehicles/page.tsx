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
      notify("Failed to load vehicles", "error");
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
    vehicleType: "MOTOR" | "MOBIL";
    licensePlate: string;
  }) => {
    setSubmitting(true);
    try {
      if (editing) {
        await updateVehicle(editing.id, payload);
        notify("Vehicle updated");
      } else {
        await createVehicle(payload);
        notify("Vehicle added");
      }
      setSheetOpen(false);
      load();
    } catch {
      notify("Failed to save vehicle", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (v: Vehicle) => {
    if (!confirm(`Delete ${v.vehicleName}? Its service history will also be removed.`)) return;
    try {
      await deleteVehicle(v.id);
      notify("Vehicle deleted");
      load();
    } catch {
      notify("Failed to delete", "error");
    }
  };

  if (!ready) return null;

  return (
    <>
      <AppHeader
        title="Vehicles"
        onBack={() => router.push("/dashboard")}
        right={
          <Button size="sm" onClick={openAdd}>
            + New
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
            title="No vehicles yet"
            description="Add a vehicle to start recording its service history."
            action={<Button onClick={openAdd}>+ Add Vehicle</Button>}
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
                    {v.licensePlate || "—"} · {v.vehicleType === "MOBIL" ? "Car" : "Motorcycle"}
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
                    Delete
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
        title={editing ? "Edit Vehicle" : "Add Vehicle"}
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
