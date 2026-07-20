import { cn } from "@/lib/cn";
import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({
  label,
  error,
  hint,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded border bg-surface px-3 text-base text-text",
          "placeholder:text-text-subtle transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary/40",
          invalid ? "border-danger" : "border-border focus:border-primary",
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
