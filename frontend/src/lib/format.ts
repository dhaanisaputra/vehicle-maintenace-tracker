const CURRENCY_FORMATTER = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const NUMBER_FORMATTER = new Intl.NumberFormat("id-ID");

const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Format a rupiah amount, e.g. 350000 -> "Rp 350.000". */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "-";
  return CURRENCY_FORMATTER.format(value).replace(/\s+/g, " ");
}

/** Format odometer reading, e.g. 30000 -> "30.000 km". */
export function formatOdometer(value: number | null | undefined): string {
  if (value == null) return "-";
  return `${NUMBER_FORMATTER.format(value)} km`;
}

/** Format an ISO date string, e.g. "2026-01-15" -> "15 Jan 2026". */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return DATE_FORMATTER.format(date);
}
