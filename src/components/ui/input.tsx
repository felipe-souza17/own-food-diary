import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900",
      "placeholder:text-zinc-400",
      "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none",
      "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500",
      "aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-500/20",
      className,
    )}
    {...props}
  />
));

Input.displayName = "Input";
