"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import {
  ServiceRecordPayload,
  createService,
  updateService,
} from "@/features/services/serviceApi";
import { ServiceRecord } from "@/types/models";
import { Vehicle } from "@/types/models";
import { useRef, useState } from "react";

export function ServiceRecordForm({
  vehicles,
  initial,
  initialVehicleId,
  onSubmit,
  submitting,
}: {
  vehicles: Vehicle[];
  initial?: ServiceRecord;
  initialVehicleId?: string;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const { notify } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [vehicleId, setVehicleId] = useState(
    initial?.vehicleId ?? initialVehicleId ?? vehicles[0]?.id ?? "",
  );
  const [serviceDate, setServiceDate] = useState(
    initial?.serviceDate ?? new Date().toISOString().slice(0, 10),
  );
  const [odometer, setOdometer] = useState(initial?.odometer?.toString() ?? "");
  const [partsReplaced, setPartsReplaced] = useState(
    initial?.partsReplaced ?? "",
  );
  const [totalCost, setTotalCost] = useState(
    initial?.totalCost?.toString() ?? "",
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initial?.receiptImageUrl ?? null,
  );

  const onFile = (file?: File) => {
    if (!file) return;
    setReceipt(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ServiceRecordPayload = {
      vehicleId,
      serviceDate,
      odometer: Number(odometer),
      partsReplaced: partsReplaced || undefined,
      totalCost: totalCost ? Number(totalCost) : undefined,
      notes: notes || undefined,
    };
    if (!payload.vehicleId) {
      notify("Pilih kendaraan dulu", "error");
      return;
    }
    try {
      if (initial) {
        await updateService(initial.id, payload, receipt ?? undefined);
        notify("Servis diperbarui");
      } else {
        await createService(payload, receipt ?? undefined);
        notify("Servis dicatat");
      }
      onSubmit();
    } catch {
      notify("Gagal menyimpan servis", "error");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {vehicles.length > 1 && (
        <Field label="Kendaraan" required>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="h-11 w-full rounded border border-border bg-surface px-3 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vehicleName}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Tanggal servis" required>
        <Input
          type="date"
          value={serviceDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setServiceDate(e.target.value)}
          required
        />
      </Field>

      <Field label="Odometer (km)" required>
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
          placeholder="30000"
          required
        />
      </Field>

      <Field label="Parts diganti" hint="Opsional">
        <Input
          value={partsReplaced}
          onChange={(e) => setPartsReplaced(e.target.value)}
          placeholder="Fanbelt, oli, roller"
        />
      </Field>

      <Field label="Biaya (Rp)" hint="Opsional">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          value={totalCost}
          onChange={(e) => setTotalCost(e.target.value)}
          placeholder="350000"
        />
      </Field>

      <Field label="Nota bengkel" hint="Opsional (foto langsung di HP)">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? undefined)}
        />
        {preview ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Nota"
              className="h-20 w-20 rounded border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm text-primary hover:underline"
            >
              Ganti
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileRef.current?.click()}
          >
            📷 Ambil / Unggah Foto
          </Button>
        )}
      </Field>

      <Field label="Catatan" hint="Opsional">
        <Textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Keterangan tambahan..."
        />
      </Field>

      <Button type="submit" fullWidth loading={submitting}>
        {initial ? "Perbarui" : "Simpan"}
      </Button>
    </form>
  );
}
