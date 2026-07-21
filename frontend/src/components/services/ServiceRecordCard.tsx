"use client";

import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate, formatOdometer } from "@/lib/format";
import { ServiceRecord } from "@/types/models";

export function ServiceRecordCard({
  record,
  vehicleName,
  onSelect,
  onEdit,
  onDelete,
}: {
  record: ServiceRecord;
  vehicleName?: string;
  onSelect: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (record: ServiceRecord) => void;
}) {
  return (
    <Card className="p-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(record.id)}
        onKeyDown={(e) => (e.key === "Enter" ? onSelect(record.id) : null)}
        className="cursor-pointer transition-shadow hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="tnum text-sm font-medium text-text-muted">
            {formatDate(record.serviceDate)}
          </span>
          <div className="flex shrink-0 items-center gap-3">
            {record.totalCost != null && (
              <span className="tnum text-sm font-semibold text-text">
                {formatCurrency(record.totalCost)}
              </span>
            )}
          </div>
        </div>

        {vehicleName && (
          <p className="mt-1 text-sm font-medium text-text">{vehicleName}</p>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="tnum text-base font-semibold text-text">
            {formatOdometer(record.odometer)}
          </p>
          {record.receiptImageUrl && (
            <span className="text-xs text-text-subtle">📄 Has receipt</span>
          )}
        </div>

        {record.partsReplaced && (
          <p className="mt-1 line-clamp-2 text-sm text-text-muted">
            {record.partsReplaced}
          </p>
        )}

        {record.notes && (
          <p className="mt-1 line-clamp-3 text-sm text-text-muted">
            <span className="font-medium text-text-subtle">Notes: </span>
            {record.notes}
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-3 border-t border-border pt-3">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(record.id);
            }}
            className="text-xs font-medium text-primary hover:underline"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record);
            }}
            className="text-xs font-medium text-danger hover:underline"
          >
            Delete
          </button>
        )}
      </div>
    </Card>
  );
}
