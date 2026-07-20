import { cn } from "@/lib/cn";
import { ReactNode } from "react";

interface AppHeaderProps {
  title: ReactNode;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  className?: string;
}

export function AppHeader({
  title,
  subtitle,
  onBack,
  right,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur",
        className,
      )}
    >
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Kembali"
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded text-text-muted hover:bg-surface-muted"
        >
          ←
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-text">{title}</h1>
        {subtitle && (
          <p className="truncate text-xs text-text-subtle">{subtitle}</p>
        )}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </header>
  );
}
