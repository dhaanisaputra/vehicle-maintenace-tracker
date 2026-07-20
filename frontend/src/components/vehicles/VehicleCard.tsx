"use client";

import { Card } from "@/components/ui/Card";
import { formatDate, formatOdometer } from "@/lib/format";
import { Vehicle } from "@/types/models";

export function VehicleCard({
  vehicle,
  lastService,
  onSelect,
}: {
  vehicle: Vehicle;
  lastService?: { serviceDate: string; odometer: number } | null;
  onSelect: (id: string) => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(vehicle.id)}
      onKeyDown={(e) => (e.key === "Enter" ? onSelect(vehicle.id) : null)}
      className="cursor-pointer p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-text">
            {vehicle.vehicleName}
          </p>
          <p className="text-sm text-text-muted">
            {vehicle.licensePlate || "—"}
          </p>
        </div>
        <span className="tnum shrink-0 text-sm font-medium text-text">
          {lastService ? formatOdometer(lastService.odometer) : "— km"}
        </span>
      </div>
      <p className="mt-3 text-xs text-text-subtle">
        Last service{" "}
        {lastService ? formatDate(lastService.serviceDate) : "belum ada"}
      </p>
    </Card>
  );
}
