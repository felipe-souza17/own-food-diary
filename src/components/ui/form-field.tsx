import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-700">
        {label}
        {required && (
          <span aria-hidden className="ml-0.5 text-red-500">
            *
          </span>
        )}
      </label>

      {children}

      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
