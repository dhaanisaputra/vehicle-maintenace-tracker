"use client";

import { cn } from "@/lib/cn";
import { InputHTMLAttributes, forwardRef, useState } from "react";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, invalid, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(
            "h-11 w-full rounded border bg-surface px-3 pr-11 text-base text-text",
            "placeholder:text-text-subtle transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary/40",
            invalid ? "border-danger" : "border-border focus:border-primary",
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-sm text-text-subtle hover:text-text"
        >
          {visible ? "🙈" : "👁"}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
