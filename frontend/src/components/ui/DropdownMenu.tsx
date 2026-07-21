"use client";

import { cn } from "@/lib/cn";
import { ReactNode, useEffect, useRef, useState } from "react";

export function DropdownMenu({
  trigger,
  children,
  className,
}: {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div
      ref={ref}
      className={cn("relative inline-block", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[150px] rounded-lg border border-border bg-background py-1 shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  onClick,
  children,
  danger,
}: {
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors",
        danger
          ? "text-danger hover:bg-danger-soft"
          : "text-text hover:bg-surface-muted",
      )}
    >
      {children}
    </button>
  );
}
