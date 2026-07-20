import { cn } from "@/lib/cn";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded border bg-surface px-3 py-2.5 text-base text-text",
          "placeholder:text-text-subtle transition-colors resize-none",
          "focus:outline-none focus:ring-2 focus:ring-primary/40",
          invalid ? "border-danger" : "border-border focus:border-primary",
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
