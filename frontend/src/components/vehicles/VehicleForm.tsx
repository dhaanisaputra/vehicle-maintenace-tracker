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
  initial?: { vehicleName: string; licensePlate?: string | null };
  onSubmit: (payload: VehiclePayload) => void;
  loading?: boolean;
}) {
  const [vehicleName, setVehicleName] = useState(initial?.vehicleName ?? "");
  const [licensePlate, setLicensePlate] = useState(initial?.licensePlate ?? "");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ vehicleName, licensePlate: licensePlate || undefined });
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
      <Field label="Plat nomor" hint="Opsional">
        <Input
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
          placeholder="B1234XYZ"
        />
      </Field>
      <Button type="submit" fullWidth loading={loading}>
        Simpan
      </Button>
    </form>
  );
}
