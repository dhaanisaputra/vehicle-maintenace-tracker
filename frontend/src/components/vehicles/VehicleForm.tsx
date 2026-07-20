"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { VehiclePayload } from "@/features/vehicles/vehicleApi";
import { useState } from "react";

export function VehicleForm({
  initial,
  onSubmit,
  loading,
}: {
  initial?: {
    vehicleName: string;
    vehicleType?: "MOTOR" | "MOBIL";
    licensePlate?: string | null;
  };
  onSubmit: (payload: VehiclePayload) => void;
  loading?: boolean;
}) {
  const [vehicleName, setVehicleName] = useState(initial?.vehicleName ?? "");
  const [vehicleType, setVehicleType] = useState<"MOTOR" | "MOBIL">(
    initial?.vehicleType ?? "MOTOR",
  );
  const [licensePlate, setLicensePlate] = useState(initial?.licensePlate ?? "");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          vehicleName,
          vehicleType,
          licensePlate: licensePlate || undefined,
        });
      }}
    >
      <Field label="Nama kendaraan" required>
        <Input
          value={vehicleName}
          onChange={(e) => setVehicleName(e.target.value)}
          placeholder="Vario 125"
          required
        />
      </Field>
      <Field label="Kategori" required>
        <select
          value={vehicleType}
          onChange={(e) =>
            setVehicleType(e.target.value as "MOTOR" | "MOBIL")
          }
          className="h-11 w-full rounded border border-border bg-surface px-3 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          required
        >
          <option value="MOTOR">Motorcycle</option>
          <option value="MOBIL">Car</option>
        </select>
      </Field>
      <Field label="Plat nomor" hint="Opsional">
        <Input
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
          placeholder="B1234XYZ"
        />
      </Field>
      <Button type="submit" fullWidth loading={loading}>
        Save
      </Button>
    </form>
  );
}
