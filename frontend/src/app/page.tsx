import { formatCurrency, formatDate, formatOdometer } from "@/lib/format";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-content px-5 py-12">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold text-text">
          Vehicle Maintenance Tracker
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Design system preview
        </p>
      </header>

      <section className="space-y-8">
        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-muted">Vario 125</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="tnum text-2xl font-semibold text-text">
              {formatOdometer(30000)}
            </span>
            <span className="tnum text-lg font-medium text-text">
              {formatCurrency(350000)}
            </span>
          </div>
          <p className="mt-2 text-xs text-text-subtle">
            Terakhir servis {formatDate("2026-01-15")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="rounded bg-primary px-4 py-2.5 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover">
            Primary
          </button>
          <button className="rounded border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted">
            Secondary
          </button>
          <button className="rounded bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger">
            Danger
          </button>
        </div>
      </section>
    </main>
  );
}
