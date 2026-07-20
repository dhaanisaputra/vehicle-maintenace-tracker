"use client";

import { API_BASE_URL } from "@/config/constants";
import { formatCurrency, formatDate, formatOdometer } from "@/lib/format";
import { ServiceRecord } from "@/types/models";
import { Vehicle } from "@/types/models";

export function ServiceRecordDetail({
  record,
  vehicle,
  onEdit,
}: {
  record: ServiceRecord;
  vehicle?: Vehicle;
  onEdit?: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-text-subtle">Vehicle</p>
          <p className="text-sm font-semibold text-text">
            {vehicle?.vehicleName ?? "—"}
            {vehicle?.licensePlate ? ` (${vehicle.licensePlate})` : ""}
          </p>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-sm font-medium text-primary hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-text-subtle">Date</p>
          <p className="tnum mt-0.5 text-sm font-semibold text-text">
            {formatDate(record.serviceDate)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-text-subtle">Odometer</p>
          <p className="tnum mt-0.5 text-sm font-semibold text-text">
            {formatOdometer(record.odometer)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-text-subtle">Cost</p>
          <p className="tnum mt-0.5 text-sm font-semibold text-text">
            {record.totalCost != null
              ? formatCurrency(record.totalCost)
              : "—"}
          </p>
        </div>
      </div>

      {record.partsReplaced && (
        <div>
          <p className="mb-1 text-xs font-medium text-text-subtle">
            Parts replaced
          </p>
          <p className="whitespace-pre-wrap text-sm text-text">
            {record.partsReplaced}
          </p>
        </div>
      )}

      {record.notes && (
        <div>
          <p className="mb-1 text-xs font-medium text-text-subtle">Notes</p>
          <p className="whitespace-pre-wrap text-sm text-text">
            {record.notes}
          </p>
        </div>
      )}

      {record.receiptImageUrl && (
        <div>
          <p className="mb-1 text-xs font-medium text-text-subtle">Receipt</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${API_BASE_URL}${record.receiptImageUrl}`}
            alt="Receipt"
            className="max-h-[60vh] w-full rounded-lg border border-border object-contain"
          />
        </div>
      )}
    </div>
  );
}
