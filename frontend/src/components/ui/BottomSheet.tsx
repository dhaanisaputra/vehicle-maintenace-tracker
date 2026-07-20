import { cn } from "@/lib/cn";
import { ReactNode, useEffect } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-text/40 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full flex-col bg-surface",
          "rounded-t-2xl shadow-sheet animate-sheet-up",
          "sm:max-w-md sm:rounded-2xl",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="mx-auto h-1 w-10 rounded-full bg-border-strong absolute -top-2.5 left-1/2 -translate-x-1/2 sm:hidden" />
          <h2 className="text-base font-semibold text-text">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-4 text-text-subtle hover:text-text"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
