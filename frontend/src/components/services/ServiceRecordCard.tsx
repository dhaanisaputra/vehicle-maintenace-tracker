"use client";

import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate, formatOdometer } from "@/lib/format";
import { API_BASE_URL } from "@/config/constants";
import { ServiceRecord } from "@/types/models";

export function ServiceRecordCard({
  record,
  onSelect,
  onDelete,
}: {
  record: ServiceRecord;
  onSelect: (id: string) => void;
  onDelete?: (record: ServiceRecord) => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(record.id)}
      onKeyDown={(e) => (e.key === "Enter" ? onSelect(record.id) : null)}
      className="cursor-pointer p-4 transition-shadow hover:shadow-md"
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
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record);
              }}
              className="text-xs text-danger hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="tnum text-base font-semibold text-text">
          {formatOdometer(record.odometer)}
        </p>
        {record.receiptImageUrl && (
          <a
            href={`${API_BASE_URL}${record.receiptImageUrl}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium text-primary hover:underline"
          >
            📄 Nota
          </a>
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
    </Card>
  );
}
