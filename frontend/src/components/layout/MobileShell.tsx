import { cn } from "@/lib/cn";
import { ReactNode } from "react";

/** Mobile-first content shell: centered, capped width, comfortable padding. */
export function MobileShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-content px-4 pb-28", className)}>
      {children}
    </div>
  );
}
